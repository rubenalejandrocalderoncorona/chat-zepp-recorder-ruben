import { ListView } from "mzfw/device/UiListView";
import { TextComponent } from "mzfw/device/UiTextComponent";
import { createImeSelectBar } from "./shared/createImeSelectBar";
import { ConfigStorage } from "mzfw/device/Path";
import { SERVER_BASE_URL } from "./shared/constants";
import { align } from "@zosx/ui";
import { ActionBar } from "mzfw/device/UiActionBar";
import { replace } from "@zosx/router";
import { getText as t } from "@zosx/i18n";
import { resetPageBrightTime, setPageBrightTime } from "@zosx/display";
import { AiChatTheme } from "./shared/AiChatTheme";
class ChatViewScreen extends ListView {
  constructor() {
    super(...arguments);
    this.theme = new AiChatTheme();
    this.renderDirection = -1;
    this.messages = [];
    this.chatLocked = false;
    this.timeoutCount = 0;
  }
  build() {
    var _a;
    setPageBrightTime({ brightTime: 6e4 });
    this.storage = new ConfigStorage(this.props.id + ".json");
    this.messages = ((_a = this.storage.getItem("messages")) != null ? _a : []).reverse();
    this.lastMessage = this.createMessageView(this.messages[0]);
    this.serverUpdateLoop();
    return [
      this.lastMessage
    ];
  }
  performDestroy() {
    super.performDestroy();
    resetPageBrightTime();
  }
  buildMore(page) {
    const index = page + 1;
    if (index >= this.messages.length) return Promise.resolve([]);
    return Promise.resolve([this.createMessageView(this.messages[index])]);
  }
  createMessageView(record) {
    const cfg = {
      text: record.content,
      marginV: 4
    };
    switch (record.role) {
      case "user":
        cfg.alignH = align.RIGHT;
        cfg.color = 11184810;
        break;
      case "system":
        cfg.alignH = align.CENTER_H;
        cfg.color = this.theme.ACCENT_COLOR_DARK;
        cfg.textSize = this.theme.FONT_SIZE - 4;
        break;
      case "donate":
        cfg.alignH = align.CENTER_H;
        cfg.color = 16027569;
        cfg.textSize = this.theme.FONT_SIZE - 4;
        break;
      case "error":
        cfg.alignH = align.CENTER_H;
        cfg.color = 16720418;
        cfg.textSize = this.theme.FONT_SIZE - 4;
    }
    return new TextComponent(cfg);
  }
  serverUpdateLoop() {
    if (this.partial && this.partial.finish_reason !== null) {
      if (!this.messages[0].finish_reason) {
        this.messages[0] = this.partial;
        this.storage.setItem("messages", this.messages.reverse());
        this.storage.writeChanges();
      }
      return this.showActionBar();
    }
    fetch(`${SERVER_BASE_URL}/api/v2/chat/${this.props.id}/last`).then((r) => {
      if (r.status === 404) {
        this.chatLocked = true;
        this.partial = this.messages[0];
        return null;
      }
      if (r.status !== 200) {
        throw new Error(r.status == 0 ? "No internet" : `Server error, status=${r.status}`);
      }
      return r.json();
    }).then((data) => {
      if (data == null)
        return this.showActionBar();
      if (data.role === "error") {
        console.log("error message");
        console.log(data.content);
        this.showError(data.content);
        return;
      }
      this.partial = data;
      this.lastMessage.updateProps({ text: data.content });
      this.serverUpdateLoop();
    }).catch((e) => {
      if (e.message.startsWith("Request timed out") || this.timeoutCount > 2) {
        this.timeoutCount += 1;
        this.serverUpdateLoop();
      } else {
        console.log(e);
        this.showError(String(e), e.message != "No internet");
      }
    });
  }
  showError(e, allowRetry = true) {
    this.addComponent(this.createMessageView({ role: "error", content: e }), 1);
    if (allowRetry) this.addComponent(new ActionBar({
      children: [
        {
          icon: "retry",
          onClick: () => replace({
            url: "page/InputKeyboardScreen",
            params: JSON.stringify({ id: this.props.id, text: this.getLastUserMessage() })
          })
        }
      ]
    }), 1);
  }
  getLastUserMessage() {
    for (const record of this.messages)
      if (record.role == "user")
        return record.content;
    return "";
  }
  showActionBar() {
    if (this.chatLocked)
      return this.addComponent(this.createMessageView({
        role: "system",
        content: t("This dialog closed due to timeout.")
      }), 1);
    this.addComponent(createImeSelectBar(this.props.id), 1);
  }
}
Page(ListView.makePage(new ChatViewScreen({ id: "0" })));
