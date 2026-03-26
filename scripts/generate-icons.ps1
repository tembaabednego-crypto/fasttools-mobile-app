Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$assetsDir = Join-Path $PSScriptRoot "..\assets"
if (-not (Test-Path $assetsDir)) {
  New-Item -ItemType Directory -Path $assetsDir | Out-Null
}

function New-BrandIcon {
  param(
    [int]$Size,
    [string]$OutputPath
  )

  $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

  $g.Clear([System.Drawing.Color]::FromArgb(10, 10, 15))

  $outerPad = [int]($Size * 0.06)
  $innerPad = [int]($Size * 0.09)
  $radiusOuter = [int]($Size * 0.22)
  $radiusInner = [int]($Size * 0.18)

  function New-RoundedRectPath([System.Drawing.RectangleF]$r, [float]$radius) {
    $d = $radius * 2
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc($r.X, $r.Y, $d, $d, 180, 90)
    $path.AddArc($r.Right - $d, $r.Y, $d, $d, 270, 90)
    $path.AddArc($r.Right - $d, $r.Bottom - $d, $d, $d, 0, 90)
    $path.AddArc($r.X, $r.Bottom - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    return $path
  }

  $outerWidth = [float]($Size - (2 * $outerPad))
  $outerHeight = [float]($Size - (2 * $outerPad))
  $innerWidth = [float]($Size - (2 * $innerPad))
  $innerHeight = [float]($Size - (2 * $innerPad))
  $outerRect = New-Object System.Drawing.RectangleF([float]$outerPad, [float]$outerPad, $outerWidth, $outerHeight)
  $innerRect = New-Object System.Drawing.RectangleF([float]$innerPad, [float]$innerPad, $innerWidth, $innerHeight)

  $outerPath = New-RoundedRectPath $outerRect $radiusOuter
  $innerPath = New-RoundedRectPath $innerRect $radiusInner

  $outerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(10, 10, 15))
  $g.FillPath($outerBrush, $outerPath)

  $gradBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)),
    (New-Object System.Drawing.Point($Size, $Size)),
    [System.Drawing.Color]::FromArgb(0, 87, 217),
    [System.Drawing.Color]::FromArgb(106, 13, 173)
  )
  $g.FillPath($gradBrush, $innerPath)

  $fontSize = [float]($Size * 0.47)
  $font = New-Object System.Drawing.Font("Segoe UI Black", $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $xText = "X"
  $textSize = $g.MeasureString($xText, $font)
  $x = ($Size - $textSize.Width) / 2
  $y = ($Size - $textSize.Height) / 2 - ($Size * 0.02)

  $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(75, 0, 0, 0))
  $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255))
  $g.DrawString($xText, $font, $shadowBrush, $x + ($Size * 0.01), $y + ($Size * 0.01))
  $g.DrawString($xText, $font, $textBrush, $x, $y)

  $bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

  $outerBrush.Dispose()
  $gradBrush.Dispose()
  $shadowBrush.Dispose()
  $textBrush.Dispose()
  $font.Dispose()
  $outerPath.Dispose()
  $innerPath.Dispose()
  $g.Dispose()
  $bmp.Dispose()
}

New-BrandIcon -Size 32 -OutputPath (Join-Path $assetsDir "favicon-32.png")
New-BrandIcon -Size 180 -OutputPath (Join-Path $assetsDir "apple-touch-icon.png")
New-BrandIcon -Size 192 -OutputPath (Join-Path $assetsDir "icon-192.png")
New-BrandIcon -Size 512 -OutputPath (Join-Path $assetsDir "icon-512.png")

Write-Output "Generated icon pack in assets folder."
