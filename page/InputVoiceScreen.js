import { BaseCompositor } from "mzfw/device/UiCompositor";
import { osImport } from "@zosx/utils";
import { ListView } from "mzfw/device/UiListView";
import { statSync } from "@zosx/fs";
import { ImageComponent } from "mzfw/device/UiNativeComponents/UiImageComponent";
import { TextComponent } from "mzfw/device/UiTextComponent";
import { getText as t } from "@zosx/i18n";
import { Button, ButtonVariant } from "mzfw/device/UiButton";
import { replace } from "@zosx/router";
import { align } from "@zosx/ui";
import { resetPageBrightTime, setPageBrightTime } from "@zosx/display";
import { AiChatTheme } from "./shared/AiChatTheme";
const media = osImport("@zos/media", null);
class InputVoiceScreen extends ListView {
  constructor() {
    super(...arguments);
    this.theme = new AiChatTheme();
    this.recorder = null;
    this.recorderTimeout = null;
    this.currentFile = "";
    this.viewText = new TextComponent({
      text: t("Preparing..."),
      alignH: align.CENTER_H,
      marginV: 16
    });
    this.viewIcon = new ImageComponent({
      src: "icon/60/preparing.png",
      imageWidth: 60,
      imageHeight: 60
    });
  }
  buildHeader() {
    return this.viewIcon;
  }
  build() {
    setPageBrightTime({ brightTime: 6e4 });
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
  startRecording() {
    const filename = `rec_${Date.now()}.opus`;
    this.currentFile = `data://${filename}`;
    this.recorder = media.create(media.id.RECORDER);
    this.recorder.setFormat(media.codec.OPUS, { target_file: this.currentFile });
    this.recorder.start();
    this.updateView(t("Listening..."), "recording");
    const timeout = setTimeout(() => {
      this.updateView(t("Max time reached. Saving..."), "timeout");
      this.removeComponent(button);
      this.stopRecording();
    }, 15e3);
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
  stopRecording() {
    if (!this.recorder) return;
    this.recorder.stop();
    clearTimeout(this.recorderTimeout);
    this.recorder = null;
    this.updateView(t("Saving..."), "loading");
    try {
      const stat = statSync({ path: this.currentFile });
      if (!stat || stat.size === 0) {
        this.updateView("Recording failed: empty file", "warning");
        return;
      }
    } catch (_) {
      this.updateView("Recording failed: file not found", "warning");
      return;
    }
    this.updateView(`Saved: ${this.currentFile}`, "loading");
    replace({ url: "page/VoiceRecordingsScreen" });
  }
  updateView(message, icon = "warning") {
    this.viewText.updateProps({ text: message });
    this.viewIcon.updateProps({ src: `icon/60/${icon}.png` });
  }
}
Page(BaseCompositor.makePage(new InputVoiceScreen({ id: "0", text: "" })));
