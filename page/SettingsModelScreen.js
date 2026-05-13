import { ListView } from "mzfw/device/UiListView";
import { getText as t } from "@zosx/i18n";
import { TextComponent } from "mzfw/device/UiTextComponent";
import { replace } from "@zosx/router";
import { renderAiModelPicker } from "./components/AiModelPicker";
import { AiChatTheme } from "./shared/AiChatTheme";
class SettingsModelScreen extends ListView {
  constructor() {
    super(...arguments);
    this.theme = new AiChatTheme();
  }
  build() {
    const isFirstTime = !localStorage.getItem("currentModel");
    const message = isFirstTime ? t("Choose an AI provider which you want to use. If you don't know what to pick, select first one") : t("Previously selected AI provider isn't available anymore, please, choose another one");
    return [
      new TextComponent({
        text: message
      })
    ];
  }
  buildMore() {
    const onChange = () => replace({ url: "page/HomePageScreen", params: JSON.stringify(this.props) });
    return renderAiModelPicker(onChange);
  }
}
Page(SettingsModelScreen.makePage(new SettingsModelScreen({})));
