import { TemplateAboutPage } from "mzfw/device/TemplateAboutPage";
import { getText, getText as t } from "@zosx/i18n";
import { AiChatTheme } from "./shared/AiChatTheme";
import { Button, ButtonVariant } from "mzfw/device/UiButton";
import { push } from "@zosx/router";
class AboutScreen extends TemplateAboutPage {
  constructor() {
    super(...arguments);
    this.theme = new AiChatTheme();
    this.displayName = "Ai Chat";
    this.buildInfo = BUNDLE;
    this.displayVersion = BUNDLE.APP_VERSION;
    // noinspection JSNonASCIINames
    this.authors = {
      "MelianMiko": t("Main developer"),
      "yardev": t("Icon designer")
    };
  }
  i18n(sourceString) {
    return getText(sourceString);
  }
  extraItems() {
    return [
      new Button({
        text: getText("Donate"),
        variant: ButtonVariant.DEFAULT,
        onClick: () => push({
          url: "page/DonateScreen",
          params: ""
        })
      })
    ];
  }
}
Page(TemplateAboutPage.makePage(new AboutScreen(null)));
