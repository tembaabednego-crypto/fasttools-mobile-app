/*
  Use this after running Capacitor and opening native projects.
  Example AdMob integration hook for Capacitor runtime.
*/

import { AdMob, BannerAdPosition, BannerAdSize } from "@capacitor-community/admob";

export async function initMobileAds() {
  await AdMob.initialize();
  await AdMob.showBanner({
    adId: "ca-app-pub-xxxxxxxxxxxxxxxx/bannerid",
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 0
  });
}
