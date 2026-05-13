import { TemplateSplashScreen } from "mzfw/device/TemplateSplashScreen";
import { SERVER_BASE_URL } from "./shared/constants";
import { getRequestHeaders } from "./shared/Tools";
import { getText as t } from "@zosx/i18n";
class SplashScreen extends TemplateSplashScreen {
  onInit() {
    if (!SERVER_BASE_URL) {
      this.continueToUrl = "page/HomePageScreen";
      this.continueParam = JSON.stringify({ isOnline: true, news: null });
      return Promise.resolve();
    }
    let resp;
    this.setStatus(t("Processing..."));
    this.continueToUrl = null;
    return fetch(`${SERVER_BASE_URL}/api/v2/init`, {
      headers: getRequestHeaders()
    }).then((r) => {
      resp = r;
      if (resp.status == 0 || resp.status >= 500) {
        this.continueToUrl = "page/HomePageScreen";
        this.continueParam = JSON.stringify({ isOnline: false });
        return null;
      }
      return r.json();
    }).then((body) => {
      if (body == null) {
        return;
      }
      if (!body.result) {
        this.setStatus(body.error);
        console.log(`E: ${body.error}`);
        return;
      }
      for (const key in body.config) {
        console.log("Write config", key, body.config[key]);
        localStorage.setItem(key, body.config[key]);
      }
      localStorage.writeChanges();
      this.continueToUrl = localStorage.getItem("needChangeModel") ? "page/SettingsModelScreen" : "page/HomePageScreen";
      this.continueParam = JSON.stringify({ isOnline: true, news: body.news });
    }).catch((e) => {
      console.log("err", e);
      this.continueToUrl = "page/HomePageScreen";
      this.continueParam = JSON.stringify({ isOnline: false });
      return null;
    });
  }
}
Page(SplashScreen.makePage(new SplashScreen()));
