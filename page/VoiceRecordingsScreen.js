import { BaseCompositor } from "mzfw/device/UiCompositor";
import { ListItem, ListView, SectionHeaderComponent } from "mzfw/device/UiListView";
import { osImport } from "@zosx/utils";
import { TextComponent } from "mzfw/device/UiTextComponent";
import { align } from "@zosx/ui";
import { ConfigStorage } from "mzfw/device/Path";
import { AiChatTheme } from "./shared/AiChatTheme";
import { push } from "@zosx/router";
const media = osImport("@zos/media", null);
const RECORDINGS_STORAGE = "recordings_list.json";
class VoiceRecordingsScreen extends ListView {
  constructor() {
    super(...arguments);
    this.theme = new AiChatTheme();
    this.player = null;
    this.statusText = new TextComponent({
      text: "Tap a recording to play",
      alignH: align.CENTER_H,
      marginV: 8
    });
  }
  build() {
    var _a;
    const storage = new ConfigStorage(RECORDINGS_STORAGE);
    const files = (_a = storage.getItem("files")) != null ? _a : [];
    const items = [this.statusText];
    if (files.length === 0) {
      items.push(new TextComponent({
        text: "No recordings yet",
        alignH: align.CENTER_H,
        marginV: 16
      }));
      return items;
    }
    items.push(new SectionHeaderComponent(`${files.length} recording(s)`));
    for (const file of files) {
      items.push(new ListItem({
        title: file,
        onClick: () => this.playFile(file)
      }));
    }
    items.push(new ListItem({
      title: "+ New recording",
      onClick: () => push({ url: "page/InputVoiceScreen", param: JSON.stringify({ id: "0", text: "" }) })
    }));
    return items;
  }
  playFile(file) {
    if (this.player) {
      try {
        this.player.stop();
        this.player.release();
      } catch (_) {
      }
      this.player = null;
    }
    this.statusText.updateProps({ text: `Playing: ${file}` });
    const player = media.create(media.id.PLAYER);
    this.player = player;
    player.addEventListener(player.event.PREPARE, () => {
      player.start();
    });
    player.addEventListener(player.event.COMPLETE, () => {
      this.statusText.updateProps({ text: `Done: ${file}` });
      try {
        player.release();
      } catch (_) {
      }
      if (this.player === player) this.player = null;
    });
    player.setSource(player.source.FILE, { file });
    player.prepare();
  }
  performDestroy() {
    super.performDestroy();
    if (this.player) {
      try {
        this.player.stop();
        this.player.release();
      } catch (_) {
      }
      this.player = null;
    }
  }
}
Page(BaseCompositor.makePage(new VoiceRecordingsScreen({})));
