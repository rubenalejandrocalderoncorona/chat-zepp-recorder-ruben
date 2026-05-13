import {BaseCompositor} from "mzfw/device/UiCompositor";
import {ListItem, ListView, SectionHeaderComponent} from "mzfw/device/UiListView";
import {Component} from "mzfw/device/UiComponent";
import {osImport} from "@zosx/utils";
import {ZeppMediaLibrary, ZeppMediaPlayer} from "./types/ZosMediaTypes";
import {TextComponent} from "mzfw/device/UiTextComponent";
import {align} from "@zosx/ui";
import {ConfigStorage} from "mzfw/device/Path";
import {AiChatTheme} from "./shared/AiChatTheme";
import {push} from "@zosx/router";

const media = osImport<ZeppMediaLibrary>("@zos/media", null);
const RECORDINGS_STORAGE = "recordings_list.json";

class VoiceRecordingsScreen extends ListView<any> {
  public theme = new AiChatTheme();

  private player: ZeppMediaPlayer | null = null;
  private statusText = new TextComponent({
    text: "Tap a recording to play",
    alignH: align.CENTER_H,
    marginV: 8,
  });

  protected build(): (Component<any> | null)[] {
    const storage = new ConfigStorage(RECORDINGS_STORAGE);
    const files: string[] = storage.getItem("files") ?? [];

    const items: (Component<any> | null)[] = [this.statusText];

    if (files.length === 0) {
      items.push(new TextComponent({
        text: "No recordings yet",
        alignH: align.CENTER_H,
        marginV: 16,
      }));
      return items;
    }

    items.push(new SectionHeaderComponent(`${files.length} recording(s)`));

    for (const file of files) {
      items.push(new ListItem({
        title: file,
        onClick: () => this.playFile(file),
      }));
    }

    items.push(new ListItem({
      title: "+ New recording",
      onClick: () => push({url: "page/InputVoiceScreen", param: JSON.stringify({id: "0", text: ""})}),
    }));

    return items;
  }

  private playFile(file: string) {
    if (this.player) {
      try { this.player.stop(); this.player.release(); } catch(_) {}
      this.player = null;
    }

    this.statusText.updateProps({text: `Playing: ${file}`});

    const player = media.create(media.id.PLAYER) as ZeppMediaPlayer;
    this.player = player;

    player.addEventListener(player.event.PREPARE, () => {
      player.start();
    });

    player.addEventListener(player.event.COMPLETE, () => {
      this.statusText.updateProps({text: `Done: ${file}`});
      try { player.release(); } catch(_) {}
      if (this.player === player) this.player = null;
    });

    player.setSource(player.source.FILE, {file});
    player.prepare();
  }

  performDestroy() {
    super.performDestroy();
    if (this.player) {
      try { this.player.stop(); this.player.release(); } catch(_) {}
      this.player = null;
    }
  }
}

Page(BaseCompositor.makePage(new VoiceRecordingsScreen({})));
