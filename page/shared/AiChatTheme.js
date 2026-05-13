import { UiTheme } from "mzfw/device/UiCompositor";
class AiChatTheme extends UiTheme {
  constructor(useFontSetting = true) {
    super({ useFontSetting });
    this.ACCENT_COLOR = 9159498;
    this.ACCENT_COLOR_DARK = 5008953;
    this.ACCENT_COLOR_LIGHT = 11457921;
  }
}
export {
  AiChatTheme
};
