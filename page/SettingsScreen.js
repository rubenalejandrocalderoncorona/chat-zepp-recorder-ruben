import { ListItem, ListView, SectionHeaderComponent } from "mzfw/device/UiListView";
import { getText as t } from "@zosx/i18n";
import { push } from "@zosx/router";
import { AiChatTheme } from "./shared/AiChatTheme";
import { SERVER_BASE_URL } from "./shared/constants";
import { getRequestHeaders } from "./shared/Tools";
import { TextComponent } from "mzfw/device/UiTextComponent";
import { align } from "@zosx/ui";
import { back } from "@zosx/router";
import { showToast } from "@zosx/interaction";
import { ConfigStorage } from "mzfw/device/Path";
import { rmSync } from "@zosx/fs";
import { renderAiModelPicker } from "./components/AiModelPicker";
class SettingsScreen extends ListView {
  constructor() {
    super(...arguments);
    this.deleteChatsClickCounter = 3;
    this.theme = new AiChatTheme();
  }
  build() {
    return [
      new ListItem({
        title: t("About..."),
        icon: "about",
        onClick: () => push({ url: "page/AboutScreen" })
      }),
      new SectionHeaderComponent(t("Settings:")),
      new ListItem({
        title: t("Font size..."),
        icon: "fontSize",
        onClick: () => push({ url: "page/SettingsFontSizeScreen" })
      }),
      new ListItem({
        title: t("Keyboard..."),
        icon: "keyboard",
        onClick: () => push({ url: "page/SettingsKeyboardScreen" })
      }),
      new ListItem({
        title: t("Privacy warning..."),
        icon: "privacy",
        onClick: () => push({ url: "page/PrivacyWarningScreen" })
      }),
      new SectionHeaderComponent(t("Advanced:")),
      new ListItem({
        title: t("Delete all saved chats"),
        icon: "chat",
        onClick: () => this.onDeleteChats()
      })
    ];
  }
  buildMore(page) {
    switch (page) {
      case 0:
        return renderAiModelPicker(back);
      case 1:
        return this.buildStats();
      default:
        return Promise.resolve([]);
    }
  }
  buildStats() {
    const limitNames = {
      "total": t("Messages (total):"),
      "voice": t("Voice requests:")
    };
    return fetch(`${SERVER_BASE_URL}/api/v2/my_limits`, { headers: getRequestHeaders() }).then((r) => {
      if (r.status != 200) return null;
      return r.json();
    }).then((d) => {
      var _a;
      if (d == null) return [];
      let limitsInfo = "";
      for (const tag in limitNames) {
        if (!d.limits[tag]) continue;
        limitsInfo += limitNames[tag] + " " + ((_a = d.usage[tag]) != null ? _a : 0) + "/" + d.limits[tag] + "\n";
      }
      return [
        new SectionHeaderComponent(t("Daily limits:")),
        new TextComponent({
          text: limitsInfo,
          textSize: this.theme.FONT_SIZE - 2,
          alignH: align.CENTER_H,
          marginV: 4
        })
      ];
    });
  }
  onDeleteChats() {
    var _a;
    if (this.deleteChatsClickCounter > 0) {
      showToast({ content: t("Touch again to confirm") });
      this.deleteChatsClickCounter--;
      return;
    }
    const chatList = new ConfigStorage("chat_list.json");
    const chats = (_a = chatList.getItem("chats")) != null ? _a : [];
    for (const record of chats) {
      rmSync(`${record.id}.json`);
    }
    chatList.setItem("chats", []);
    chatList.writeChanges();
    back();
  }
}
Page(ListView.makePage(new SettingsScreen({})));
