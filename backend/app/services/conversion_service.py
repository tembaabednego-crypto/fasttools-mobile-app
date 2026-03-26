import os
import time
import uuid
from pathlib import Path
from typing import Dict

import requests
from PIL import Image
from pydub import AudioSegment


BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "storage" / "uploads"
OUTPUT_DIR = BASE_DIR / "storage" / "outputs"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


class ConversionService:
    def __init__(self, cloudconvert_api_key: str) -> None:
        self.cloudconvert_api_key = cloudconvert_api_key

    def _save_upload(self, filename: str, data: bytes) -> Path:
        safe_name = f"{uuid.uuid4().hex}_{filename}"
        path = UPLOAD_DIR / safe_name
        path.write_bytes(data)
        return path

    def convert(
        self,
        tool: str,
        filename: str,
        file_bytes: bytes,
        options: Dict[str, str],
    ) -> Path:
        source_path = self._save_upload(filename, file_bytes)

        if tool == "image_compress":
            return self._compress_image(source_path, options)
        if tool == "audio_cutter":
            return self._cut_audio(source_path, options)
        if tool == "pdf_to_word":
            return self._pdf_to_word_cloudconvert(source_path)

        raise ValueError("Unsupported conversion tool.")

    def _compress_image(self, source_path: Path, options: Dict[str, str]) -> Path:
        quality = int(options.get("quality", "75"))
        quality = max(20, min(95, quality))
        out_name = f"{source_path.stem}_compressed.jpg"
        out_path = OUTPUT_DIR / out_name
        with Image.open(source_path) as img:
            rgb_img = img.convert("RGB")
            rgb_img.save(out_path, optimize=True, quality=quality)
        return out_path

    def _cut_audio(self, source_path: Path, options: Dict[str, str]) -> Path:
        start_sec = float(options.get("start", "0"))
        end_sec = float(options.get("end", "10"))
        start_ms = int(max(0, start_sec) * 1000)
        end_ms = int(max(start_sec, end_sec) * 1000)

        audio = AudioSegment.from_file(source_path)
        clip = audio[start_ms:end_ms]
        out_name = f"{source_path.stem}_cut.mp3"
        out_path = OUTPUT_DIR / out_name
        clip.export(out_path, format="mp3")
        return out_path

    def _pdf_to_word_cloudconvert(self, source_path: Path) -> Path:
        if not self.cloudconvert_api_key:
            raise ValueError("PDF to Word requires CLOUDCONVERT_API_KEY in backend .env.")

        headers = {
            "Authorization": f"Bearer {self.cloudconvert_api_key}",
            "Content-Type": "application/json",
        }

        job_payload = {
            "tasks": {
                "import-file": {"operation": "import/upload"},
                "convert-file": {
                    "operation": "convert",
                    "input": "import-file",
                    "input_format": "pdf",
                    "output_format": "docx",
                },
                "export-file": {"operation": "export/url", "input": "convert-file"},
            }
        }

        create_job = requests.post(
            "https://api.cloudconvert.com/v2/jobs", headers=headers, json=job_payload, timeout=60
        )
        create_job.raise_for_status()
        job_data = create_job.json()["data"]
        tasks = {task["name"]: task for task in job_data["tasks"]}
        upload_task = tasks["import-file"]
        upload_form = upload_task["result"]["form"]
        upload_url = upload_form["url"]
        form_params = upload_form["parameters"]

        with source_path.open("rb") as source_file:
            files = {"file": (source_path.name, source_file, "application/pdf")}
            upload_resp = requests.post(upload_url, data=form_params, files=files, timeout=120)
            upload_resp.raise_for_status()

        job_id = job_data["id"]
        for _ in range(30):
            time.sleep(2)
            status_resp = requests.get(
                f"https://api.cloudconvert.com/v2/jobs/{job_id}", headers=headers, timeout=60
            )
            status_resp.raise_for_status()
            status_job = status_resp.json()["data"]
            if status_job["status"] == "finished":
                export_task = next(
                    task for task in status_job["tasks"] if task["name"] == "export-file"
                )
                file_url = export_task["result"]["files"][0]["url"]
                out_name = f"{source_path.stem}_{uuid.uuid4().hex[:8]}.docx"
                out_path = OUTPUT_DIR / out_name
                file_content = requests.get(file_url, timeout=120)
                file_content.raise_for_status()
                out_path.write_bytes(file_content.content)
                return out_path
            if status_job["status"] == "error":
                raise ValueError("CloudConvert conversion failed.")

        raise TimeoutError("PDF to Word conversion timed out.")
