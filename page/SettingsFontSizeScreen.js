import { TemplateFontSettings } from "mzfw/device/TemplateFontSettings";
import { AiChatTheme } from "./shared/AiChatTheme";
import { getText } from "@zosx/i18n";
class SettingsFontSizeScreen extends TemplateFontSettings {
  constructor() {
    super(...arguments);
    this.theme = new AiChatTheme(false);
  }
  i18n(key) {
    return getText(key);
  }
}
Page(TemplateFontSettings.makePage(new SettingsFontSizeScreen({})));
