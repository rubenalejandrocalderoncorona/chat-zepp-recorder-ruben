var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
import { BaseCompositor } from "mzfw/device/UiCompositor";
import { osImport } from "@zosx/utils";
import { ListView } from "mzfw/device/UiListView";
import { closeSync, O_RDONLY, openSync, readSync, rmSync, statSync } from "@zosx/fs";
import { ImageComponent } from "mzfw/device/UiNativeComponents/UiImageComponent";
import { TextComponent } from "mzfw/device/UiTextComponent";
import { getText as t } from "@zosx/i18n";
import { Button, ButtonVariant } from "mzfw/device/UiButton";
import { SERVER_BASE_URL } from "./shared/constants";
import { getRequestHeaders } from "./shared/Tools";
import { saveNewMessageToFile } from "./shared/saveNewMessageToFile";
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
  /**
   * Shows icon in top of page
   * @protected
   */
  buildHeader() {
    return this.viewIcon;
  }
  /**
   * Build main UI
   * @protected
   */
  build() {
    setPageBrightTime({ brightTime: 6e4 });
    return [
      this.viewText
    ];
  }
  performDestroy() {
    super.performDestroy();
    resetPageBrightTime();
  }
  /**
   * Start recording immediately (no server check)
   */
  performRender() {
    super.performRender();
    this.startRecording();
  }
  /**
   * Start voice recording
   * @private
   */
  startRecording() {
    try {
      rmSync("voice.opus");
    } catch (_) {
    }
    this.recorder = media.create(media.id.RECORDER);
    this.recorder.setFormat(media.codec.OPUS, { target_file: "voice.opus" });
    this.recorder.start();
    const timeout = setTimeout(() => {
      this.updateView(t("Too long record. Hint: use Send button when you finish your prompt."), "timeout");
      this.removeComponent(button);
    }, 15e3);
    this.updateView(t("Listening..."), "recording");
    const button = new Button({
      text: t("Send"),
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
    try {
      const stat = statSync({ path: "voice.opus" });
      const kb = stat ? (stat.size / 1024).toFixed(1) : "0";
      this.updateView(`Mic OK! Recorded ${kb} KB`, "true");
    } catch (_) {
      this.updateView("Recorded (file check failed)", "true");
    }
  }
  /**
   * Will send recorded audio file to server and create new dialog
   * @private
   */
  sendRequest() {
    var _a;
    const stat = statSync({ path: "voice.opus" });
    if (!stat || stat.size == 0)
      return this.updateView(t("Failed: file not found"));
    const fd = openSync({ path: "voice.opus", flag: O_RDONLY });
    const buffer = Buffer.alloc(stat.size);
    readSync({ fd, buffer: buffer.buffer });
    closeSync(fd);
    this.updateView(t("Processing..."), "loading");
    let status;
    fetch(`${SERVER_BASE_URL}/api/v2/chat`, {
      method: "POST",
      body: buffer,
      headers: __spreadValues({
        "Content-Type": "audio/ogg",
        "Context-ID": (_a = this.props.id) != null ? _a : "0"
      }, getRequestHeaders())
    }).then((r) => {
      status = r.status;
      return status == 0 || status >= 500 ? null : r.json();
    }).then((data) => {
      if (status !== 200 || !data.result)
        return this.onRequestError(data, status);
      saveNewMessageToFile(data);
      replace({
        url: "page/ChatViewScreen",
        params: JSON.stringify({ id: data.context_id })
      });
    });
  }
  /**
   * Handle server error
   *
   * @param data
   * @param status
   * @private
   */
  onRequestError(data, status) {
    console.log(`ERR ${status} ${data}`);
    let message = "Unknown error";
    if (status === 429) message = "Too many requests";
    else if (data && data.error) message = data.error;
    this.updateView(message);
  }
  viewMinFirmware(minFirmware) {
    this.addComponent(new TextComponent({
      text: t("Min firmware version: ") + minFirmware + ".x.x",
      textSize: this.theme.FONT_SIZE - 4,
      color: 11184810,
      alignH: align.CENTER_H,
      marginV: 16
    }));
  }
  updateView(message, icon = "warning") {
    this.viewText.updateProps({ text: message });
    this.viewIcon.updateProps({ src: `icon/60/${icon}.png` });
  }
}
Page(BaseCompositor.makePage(new InputVoiceScreen({ id: "0", text: "" })));
