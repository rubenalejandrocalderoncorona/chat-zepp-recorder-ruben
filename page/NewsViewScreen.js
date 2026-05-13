import { ListView } from "mzfw/device/UiListView";
import { TextComponent } from "mzfw/device/UiTextComponent";
import { AiChatTheme } from "./shared/AiChatTheme";
class NewsViewScreen extends ListView {
  constructor() {
    super(...arguments);
    this.theme = new AiChatTheme();
  }
  build() {
    const entry = this.props.news;
    if (!entry) return [];
    localStorage.setItem("dismissNewsId", entry.id.toString());
    return [
      new TextComponent({
        text: entry.title,
        textSize: this.theme.FONT_SIZE + 2,
        marginV: 8
      }),
      new TextComponent({
        text: entry.message,
        color: 11184810
      })
    ];
  }
}
Page(ListView.makePage(new NewsViewScreen({ news: null })));
