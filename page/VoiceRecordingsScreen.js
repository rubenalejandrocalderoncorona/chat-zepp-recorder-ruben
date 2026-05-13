import { BaseCompositor } from "mzfw/device/UiCompositor";
import { ListItem, ListView, SectionHeaderComponent } from "mzfw/device/UiListView";
import { osImport } from "@zosx/utils";
import { TextComponent } from "mzfw/device/UiTextComponent";
import { align } from "@zosx/ui";
import { readdirSync } from "@zosx/fs";
import { AiChatTheme } from "./shared/AiChatTheme";
import { push } from "@zosx/router";
const media = osImport("@zos/media", null);
function getRecordings() {
  try {
    const files = readdirSync({ path: "data://" });
    if (!files) return [];
    return files.filter((f) => f.endsWith(".opus")).sort().reverse();
  } catch (_) {
    return [];
  }
}
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
    const files = getRecordings();
    const items = [this.statusText];
    if (files.length === 0) {
      items.push(new TextComponent({
        text: "No recordings yet",
        alignH: align.CENTER_H,
        marginV: 16
      }));
    } else {
      items.push(new SectionHeaderComponent(`${files.length} recording(s)`));
      for (const file of files) {
        const filepath = `data://${file}`;
        items.push(new ListItem({
          title: file,
          onClick: () => this.playFile(filepath)
        }));
      }
    }
    items.push(new ListItem({
      title: "+ New recording",
      onClick: () => push({ url: "page/InputVoiceScreen", param: JSON.stringify({ id: "0", text: "" }) })
    }));
    return items;
  }
  stopCurrentPlayer() {
    if (!this.player) return;
    const p = this.player;
    this.player = null;
    try {
      p.stop();
    } catch (_) {
    }
  }
  playFile(filepath) {
    this.stopCurrentPlayer();
    const displayName = filepath.replace("data://", "");
    this.statusText.updateProps({ text: `Loading: ${displayName}` });
    const player = media.create(media.id.PLAYER);
    this.player = player;
    player.addEventListener(player.event.PREPARE, (result) => {
      if (this.player !== player) return;
      if (result) {
        this.statusText.updateProps({ text: `Playing: ${displayName}` });
        player.start();
      } else {
        this.statusText.updateProps({ text: `Failed to load: ${displayName}` });
        this.player = null;
        try {
          player.stop();
        } catch (_) {
        }
      }
    });
    player.addEventListener(player.event.COMPLETE, () => {
      if (this.player !== player) return;
      this.statusText.updateProps({ text: `Done: ${displayName}` });
      this.player = null;
      try {
        player.stop();
      } catch (_) {
      }
    });
    player.setSource(player.source.FILE, { file: filepath });
    player.prepare();
  }
  performDestroy() {
    super.performDestroy();
    this.stopCurrentPlayer();
  }
}
Page(BaseCompositor.makePage(new VoiceRecordingsScreen({})));
