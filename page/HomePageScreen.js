import { ListItem, ListView, SectionHeaderComponent } from "mzfw/device/UiListView";
import { HeadlineButton } from "mzfw/device/UiButton";
import { getText as t } from "@zosx/i18n";
import { push, replace } from "@zosx/router";
import { AiChatTheme } from "./shared/AiChatTheme";
import { ConfigStorage } from "mzfw/device/Path";
import { TextComponent } from "mzfw/device/UiTextComponent";
import { IS_BAND_7, IS_SMALL_SCREEN_DEVICE, SCREEN_HEIGHT, SCREEN_MARGIN, WIDGET_WIDTH } from "mzfw/device/UiProperties";
import { createImeSelectBar } from "./shared/createImeSelectBar";
import { align } from "@zosx/ui";
import { ImageComponent } from "mzfw/device/UiNativeComponents/UiImageComponent";
import { rmSync } from "@zosx/fs";
class HomePageScreen extends ListView {
  constructor() {
    super(...arguments);
    this.theme = new AiChatTheme();
    this.hideStatusBar = true;
    this.listViewTopOffset = SCREEN_HEIGHT;
    this.overrideHeaderHeight = 24;
    this.chatListStorage = new ConfigStorage("chat_list.json");
  }
  /**
   * Build headline page
   * @protected
   */
  beforeListViewRender() {
    if (!this.props.isOnline)
      return this.showOfflinePage();
    const titleText = t("Ask your question here");
    const infoText = t("Or scroll down to view previous dialogs");
    const margin = IS_SMALL_SCREEN_DEVICE ? 16 : 24;
    const titleTextSize = Math.min(this.theme.FONT_SIZE, 34);
    const infoTextSize = titleTextSize - (IS_BAND_7 ? 4 : 8);
    const headlineHeight = this.configureHeadComponent(new HeadlineButton({
      text: t("Settings..."),
      icon: "settings",
      onClick() {
        push({ url: "page/SettingsScreen" });
      }
    }), margin);
    const imeBarHeight = this.configureHeadComponent(createImeSelectBar("0", false), -margin);
    const textBoxY = headlineHeight + margin;
    const textBoxHeight = Math.floor((SCREEN_HEIGHT - textBoxY - imeBarHeight - margin) / 2);
    this.configureHeadComponent(new TextComponent({
      text: titleText,
      color: 16777215,
      textSize: titleTextSize,
      alignH: align.CENTER_H,
      alignV: align.BOTTOM
    }), textBoxY, textBoxHeight - 4);
    this.configureHeadComponent(new TextComponent({
      text: infoText,
      color: 11184810,
      textSize: infoTextSize,
      alignH: align.CENTER_H,
      alignV: align.TOP
    }), textBoxY + textBoxHeight + 4, textBoxHeight);
  }
  /**
   * No internet warning banner
   * @private
   */
  showOfflinePage() {
    this.configureHeadComponent(new ImageComponent({
      src: "icon/80/offline.png",
      imageWidth: 80,
      imageHeight: 80
    }), 0, SCREEN_HEIGHT / 2);
    this.configureHeadComponent(new TextComponent({
      text: t("No internet connection.\nScroll down to view previous dialogs."),
      textSize: this.theme.FONT_SIZE - 2,
      alignH: align.CENTER_H,
      alignV: align.TOP
    }), SCREEN_HEIGHT / 2, SCREEN_HEIGHT / 2);
  }
  /**
   * Add component outside ListView
   *
   * @param component
   * @param y
   * @param height
   * @private
   */
  configureHeadComponent(component, y, height = null) {
    component.attachParent(this);
    component.setGeometry(null, null, WIDGET_WIDTH, null);
    const ph = height != null ? height : component.geometry.h;
    const py = y >= 0 ? y : SCREEN_HEIGHT - ph + y;
    component.setGeometry(SCREEN_MARGIN, py, WIDGET_WIDTH, ph);
    component.performRender();
    this.nestedComponents.push(component);
    return component.geometry.h;
  }
  /**
   * Build base page contents
   * @protected
   */
  build() {
    return [
      this.createNewsView(),
      new SectionHeaderComponent(t("Chats:"))
    ];
  }
  /**
   * Dynamic load chats list.
   *
   * @param page Current page number
   * @protected
   */
  buildMore(page) {
    var _a;
    const chats = (_a = this.chatListStorage.getItem("chats")) != null ? _a : [];
    const end = Math.min((page + 1) * 10, chats.length);
    const components = [];
    for (let i = page * 10; i < end; i++)
      components.push(this.createChatEntryView(chats[i]));
    if (end == chats.length && (components.length > 0 || page == 0)) {
      components.push(this.createFooterNoticeView(chats.length == 0));
    }
    return Promise.resolve(components);
  }
  /**
   * Create news view list item
   * @private
   */
  createNewsView() {
    if (!this.props.news || localStorage.getItem("dismissNewsId") == this.props.news.id.toString())
      return null;
    return new ListItem({
      icon: "news",
      title: this.props.news.title,
      onClick: () => push({
        url: "page/NewsViewScreen",
        params: JSON.stringify({ news: this.props.news })
      }),
      secondActionName: t("Hide"),
      onSecondActionClick: () => {
        localStorage.setItem("dismissNewsId", this.props.news.id.toString());
        localStorage.writeChanges();
        replace({ url: "page/HomePageScreen", params: JSON.stringify(this.props) });
      }
    });
  }
  /**
   * Get text for pre-footer message
   *
   * @param noChats If true, will show suggestion to start a new chat
   * @private
   */
  createFooterNoticeView(noChats) {
    return new TextComponent({
      text: t(
        noChats ? "There's no started chats. Use button above to start new one." : "Swipe chat from right to left to delete."
      ),
      textSize: this.theme.FONT_SIZE - 2,
      color: 11184810,
      alignH: align.CENTER_H,
      marginV: 8
    });
  }
  /**
   * Will create a new chat ListItem
   *
   * @param record Record info
   * @private
   */
  createChatEntryView(record) {
    return new ListItem({
      title: record.name,
      icon: "chat",
      onClick: () => push({
        url: "page/ChatViewScreen",
        params: JSON.stringify({ id: record.id })
      }),
      secondActionName: t("Delete"),
      onSecondActionClick: () => {
        var _a;
        let chats = (_a = this.chatListStorage.getItem("chats")) != null ? _a : [];
        chats = chats.filter((r) => r.id != record.id);
        this.chatListStorage.setItem("chats", chats);
        this.chatListStorage.writeChanges();
        rmSync(`${record.id}.json`);
        replace({ url: "page/HomePageScreen", params: JSON.stringify(this.props) });
      }
    });
  }
}
Page(HomePageScreen.makePage(new HomePageScreen({ isOnline: false, news: null })));
