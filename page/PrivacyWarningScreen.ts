import {ListView} from "mzfw/device/UiListView";
import {Component} from "mzfw/device/UiComponent";
import {TextComponent} from "mzfw/device/UiTextComponent";
import {getText as t} from "@zosx/i18n";
import {AiChatTheme} from "./shared/AiChatTheme";
import {Button, ButtonVariant} from "mzfw/device/UiButton";
import {replace} from "@zosx/router";
import type {ConfigStorage} from "mzfw/device/Path";
import {IMEProps} from "./types/CommonPagePropTypes";

class PrivacyWarningScreen extends ListView<IMEProps & {continueUrl: string}> {
  public theme = new AiChatTheme();

  protected build(): (Component<any> | null)[] {
    return [
      new TextComponent({
        text: t("Before using this app..."),
        color: 0xFF9900,
        textSize: this.theme.FONT_SIZE + 4,
        marginV: 6,
      }),
      new TextComponent({
        text: t("This application is an frontend for OpenRouter — unified LLMs API provider. " +
            "By using this application, you agree with Privacy Policy of selected model provider, which " +
            "you can find online."),
        marginV: 4,
      }),
      new TextComponent({
        text: t("AI models can give your incorrect or harmful response, developer(s) of AI Chat " +
            "are not responsible for anything that you got as response. Please, do not use AI as " +
            "an medical consultant."),
        marginV: 4,
      }),
      new TextComponent({
        text: t("Keep in mind that this application and/or your preferred AI model can stop working " +
            "at any time. We didn't provide any guarantees."),
        marginV: 4,
      }),
      this.props.continueUrl ? new Button({
        text: t("Continue"),
        variant: ButtonVariant.DEFAULT,
        onClick: () => {
          localStorage.setItem("privacyStatementRead2", "true");
          (localStorage as ConfigStorage).writeChanges();
          replace({
            url: this.props.continueUrl,
            params: JSON.stringify(this.props)
          });
        }
      }) : null,
    ];
  }
}

Page(ListView.makePage(new PrivacyWarningScreen({text: "", continueUrl: "", id: ""})));
