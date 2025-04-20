import {ListView} from "mzfw/device/UiListView";
import {Component} from "mzfw/device/UiComponent";
import {getText as t} from "@zosx/i18n";
import {TextComponent} from "mzfw/device/UiTextComponent";
import {push, replace} from "@zosx/router";
import {renderAiModelPicker} from "./components/AiModelPicker";
import {AiChatTheme} from "./shared/AiChatTheme";

class SettingsModelScreen extends ListView<{}> {
    public theme = new AiChatTheme();

    protected build(): (Component<any> | null)[] {
        const isFirstTime = !localStorage.getItem('currentModel');
        const message = isFirstTime
            ? t("Choose an AI provider which you want to use. If you don't know what to pick, select first one")
            : t("Previously selected AI provider isn't available anymore, please, choose another one");

        return [
            new TextComponent({
                text: message,
            })
        ];
    }

    protected buildMore(): Promise<Component<any>[]> {
        const onChange = () => replace({ url: "page/HomePageScreen", params: JSON.stringify(this.props) });

        return renderAiModelPicker(onChange);
    }
}

Page(SettingsModelScreen.makePage(new SettingsModelScreen({})));
