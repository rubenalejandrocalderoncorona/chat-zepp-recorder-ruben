import { ScreenBoardConfigScreen } from "mzfw/device/ScreenBoardConfigScreen";
import { AiChatTheme } from "./shared/AiChatTheme";
import { getText } from "@zosx/i18n";
class SettingsKeyboardScreen extends ScreenBoardConfigScreen {
  constructor() {
    super(...arguments);
    this.theme = new AiChatTheme();
  }
  i18n(key) {
    return getText(key);
  }
}
Page(ScreenBoardConfigScreen.makePage(new SettingsKeyboardScreen({})));
