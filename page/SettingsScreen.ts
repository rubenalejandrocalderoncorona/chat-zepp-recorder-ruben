import {ListItem, ListView, SectionHeaderComponent} from "mzfw/device/UiListView";
import {Component} from "mzfw/device/UiComponent";
import {getText as t} from "@zosx/i18n";
import {push} from "@zosx/router";
import {AiChatTheme} from "./shared/AiChatTheme";
import {SERVER_BASE_URL} from "./shared/constants";
import {getRequestHeaders} from "./shared/Tools";
import {ServerLimitsResponse} from "./types/ServerResponse";
import {TextComponent} from "mzfw/device/UiTextComponent";
import {align} from "@zosx/ui";
import {back} from "@zosx/router";
import {showToast} from "@zosx/interaction";
import {ConfigStorage} from "mzfw/device/Path";
import {ChatListRecord} from "./types/ConfigStorageTypes";
import {rmSync} from "@zosx/fs";
import {renderAiModelPicker} from "./components/AiModelPicker";

class SettingsScreen extends ListView<any> {
  private deleteChatsClickCounter: number = 3;
  public theme = new AiChatTheme();

  protected build(): (Component<any> | null)[] {
    return [
      new ListItem({
        title: t("About..."),
        icon: "about",
        onClick: () => push({url: "page/AboutScreen"}),
      }),

      new SectionHeaderComponent(t("Settings:")),
      new ListItem({
        title: t("Font size..."),
        icon: "fontSize",
        onClick: () => push({url: "page/SettingsFontSizeScreen"}),
      }),
      new ListItem({
        title: t("Keyboard..."),
        icon: "keyboard",
        onClick: () => push({url: "page/SettingsKeyboardScreen"}),
      }),
      new ListItem({
        title: t("Privacy warning..."),
        icon: "privacy",
        onClick: () => push({url: "page/PrivacyWarningScreen"}),
      }),

      new SectionHeaderComponent(t("Advanced:")),
      new ListItem({
        title: t("Delete all saved chats"),
        icon: "chat",
        onClick: () => this.onDeleteChats(),
      }),
    ]
  }

  protected buildMore(page: number): Promise<Component<any>[]> {
    switch (page) {
      case 0:
        return renderAiModelPicker(back);
      case 1:
        return this.buildStats();
      default:
        return Promise.resolve([]);
    }
  }

  protected buildStats(): Promise<Component<any>[]> {
    const limitNames = {
      "total": t("Messages (total):"),
      "voice": t("Voice requests:")
    }

    return fetch(`${SERVER_BASE_URL}/api/v2/my_limits`, {headers: getRequestHeaders()}).then((r) => {
      if(r.status != 200) return null;
      return r.json();
    }).then((d: ServerLimitsResponse) => {
      if(d == null) return [];
      let limitsInfo: string = "";
      for(const tag in limitNames) {
        if(!d.limits[tag]) continue;
        limitsInfo += limitNames[tag] + " " + (d.usage[tag] ?? 0) + "/" + d.limits[tag] + "\n";
      }

      return [
        new SectionHeaderComponent(t("Daily limits:")),
        new TextComponent({
          text: limitsInfo,
          textSize: this.theme.FONT_SIZE - 2,
          alignH: align.CENTER_H,
          marginV: 4,
        }),
      ]
    })
  }

  private onDeleteChats() {
    if(this.deleteChatsClickCounter > 0) {
      showToast({ content: t("Touch again to confirm") });
      this.deleteChatsClickCounter--;

      return;
    }

    // Load chats list
    const chatList = new ConfigStorage("chat_list.json");
    const chats: ChatListRecord[] = chatList.getItem("chats") ?? [];

    // Delete files
    for(const record of chats) {
      rmSync(`${record.id}.json`);
    }

    // Clean chats list
    chatList.setItem("chats", []);
    chatList.writeChanges();
    back();
  }
}

Page(ListView.makePage(new SettingsScreen({})));
