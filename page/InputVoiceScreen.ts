import {BaseCompositor} from "mzfw/device/UiCompositor";
import {IMEProps} from "./types/CommonPagePropTypes";
import {osImport} from "@zosx/utils";
import {ZeppMediaLibrary, ZeppMediaRecorder} from "./types/ZosMediaTypes";
import {ListView} from "mzfw/device/UiListView";
import {Component} from "mzfw/device/UiComponent";
import {ImageComponent} from "mzfw/device/UiNativeComponents/UiImageComponent";
import {TextComponent} from "mzfw/device/UiTextComponent";
import {getText as t} from "@zosx/i18n";
import {Button, ButtonVariant} from "mzfw/device/UiButton";
import {replace} from "@zosx/router";
import {align} from "@zosx/ui";
import {resetPageBrightTime, setPageBrightTime} from "@zosx/display";
import TimeoutID = setTimeout.TimeoutID;
import {AiChatTheme} from "./shared/AiChatTheme";

const media = osImport<ZeppMediaLibrary>("@zos/media", null);

class InputVoiceScreen extends ListView<IMEProps> {
  public theme = new AiChatTheme();

  private recorder: ZeppMediaRecorder | null = null;
  private recorderTimeout: TimeoutID | null = null;
  private currentFile: string = "";

  private viewText = new TextComponent({
    text: t("Preparing..."),
    alignH: align.CENTER_H,
    marginV: 16,
  });
  private viewIcon: ImageComponent = new ImageComponent({
    src: "icon/60/preparing.png",
    imageWidth: 60,
    imageHeight: 60,
  });

  protected buildHeader(): Component<any> | null {
    return this.viewIcon;
  }

  protected build(): (Component<any> | null)[] {
    setPageBrightTime({brightTime: 60000});
    return [this.viewText];
  }

  performDestroy() {
    super.performDestroy();
    resetPageBrightTime();
  }

  performRender() {
    super.performRender();
    this.startRecording();
  }

  private startRecording() {
    const filename = `rec_${Date.now()}.opus`;
    this.currentFile = `data://${filename}`;

    this.recorder = media.create(media.id.RECORDER);
    this.recorder.setFormat(media.codec.OPUS, {target_file: this.currentFile});
    this.recorder.start();

    this.updateView(t("Listening..."), "recording");

    const timeout = setTimeout(() => {
      this.updateView(t("Max time reached. Saving..."), "timeout");
      this.removeComponent(button);
      this.stopRecording();
    }, 15000);

    const button = new Button({
      text: t("Save"),
      variant: ButtonVariant.PRIMARY,
      onClick: () => {
        this.removeComponent(button);
        clearTimeout(timeout);
        this.stopRecording();
      }
    });
    this.addComponent(button);
  }

  private stopRecording() {
    if (!this.recorder) return;

    this.recorder.stop();
    clearTimeout(this.recorderTimeout);
    this.recorder = null;

    this.updateView(t("Saved!"), "loading");
    replace({url: "page/VoiceRecordingsScreen"});
  }

  private updateView(message: string, icon: string = "warning") {
    this.viewText.updateProps({text: message});
    this.viewIcon.updateProps({src: `icon/60/${icon}.png`});
  }
}

Page(BaseCompositor.makePage(new InputVoiceScreen({id: "0", text: ""})));
