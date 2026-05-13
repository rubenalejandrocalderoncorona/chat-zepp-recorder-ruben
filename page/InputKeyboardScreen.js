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
import { ScreenBoard } from "mzfw/device/ScreenBoard";
import { AiChatTheme } from "./shared/AiChatTheme";
import { getText as t } from "@zosx/i18n";
import { ListView } from "mzfw/device/UiListView";
import { SERVER_BASE_URL } from "./shared/constants";
import { getRequestHeaders } from "./shared/Tools";
import { saveNewMessageToFile } from "./shared/saveNewMessageToFile";
import { replace } from "@zosx/router";
import { showToast } from "@zosx/interaction";
class InputKeyboardScreen extends ListView {
  constructor() {
    super(...arguments);
    this.board = null;
    this.lock = false;
  }
  build() {
    var _a;
    this.board = new ScreenBoard({ theme: new AiChatTheme() });
    this.board.title = t(this.props.id == "0" ? "Start dialog:" : "New message:");
    this.board.value = (_a = this.props.text) != null ? _a : "";
    this.board.confirmButtonText = t("Send");
    this.board.onConfirm = (t2) => this.sendMessage(t2);
    this.board.visible = true;
    return [];
  }
  sendMessage(message) {
    var _a;
    if (this.lock || !message) return;
    this.board.confirmButtonText = t("Processing...");
    this.lock = true;
    let status;
    fetch(`${SERVER_BASE_URL}/api/v2/chat`, {
      method: "POST",
      body: message,
      headers: __spreadValues({
        "Content-Type": "text/plain",
        "Context-ID": (_a = this.props.id) != null ? _a : "0"
      }, getRequestHeaders())
    }).then((r) => {
      status = r.status;
      return status == 0 || status >= 500 ? null : r.json();
    }).then((data) => {
      if (status !== 200 || !data.result)
        return this.onError(data, status);
      saveNewMessageToFile(data);
      replace({
        url: "page/ChatViewScreen",
        params: JSON.stringify({ id: data.context_id })
      });
    });
  }
  onError(data, status) {
    console.log(`ERR ${status} ${data}`);
    let message = "Unknown error";
    if (status === 429) message = "Too many requests";
    else if (data && data.error) message = data.error;
    showToast({ content: message });
    this.board.confirmButtonText = t("Send");
    this.lock = false;
  }
}
Page(ListView.makePage(new InputKeyboardScreen({ id: "", text: "" })));
