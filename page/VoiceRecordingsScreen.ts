import {BaseCompositor} from "mzfw/device/UiCompositor";
import {ListItem, ListView, SectionHeaderComponent} from "mzfw/device/UiListView";
import {Component} from "mzfw/device/UiComponent";
import {osImport} from "@zosx/utils";
import {ZeppMediaLibrary, ZeppMediaPlayer} from "./types/ZosMediaTypes";
import {TextComponent} from "mzfw/device/UiTextComponent";
import {align} from "@zosx/ui";
import {readdirSync} from "@zosx/fs";
import {AiChatTheme} from "./shared/AiChatTheme";
import {push} from "@zosx/router";

const media = osImport<ZeppMediaLibrary>("@zos/media", null);

function getRecordings(): string[] {
  try {
    const files = readdirSync({path: "data://"}) as string[];
    if (!files) return [];
    return files.filter((f) => f.endsWith(".opus")).sort().reverse();
  } catch(_) {
    return [];
  }
}

class VoiceRecordingsScreen extends ListView<any> {
  public theme = new AiChatTheme();

  private player: ZeppMediaPlayer | null = null;
  private statusText = new TextComponent({
    text: "Tap a recording to play",
    alignH: align.CENTER_H,
    marginV: 8,
  });

  protected build(): (Component<any> | null)[] {
    const files = getRecordings();
    const items: (Component<any> | null)[] = [this.statusText];

    if (files.length === 0) {
      items.push(new TextComponent({
        text: "No recordings yet",
        alignH: align.CENTER_H,
        marginV: 16,
      }));
    } else {
      items.push(new SectionHeaderComponent(`${files.length} recording(s)`));
      for (const file of files) {
        const filepath = `data://${file}`;
        items.push(new ListItem({
          title: file,
          onClick: () => this.playFile(filepath),
        }));
      }
    }

    items.push(new ListItem({
      title: "+ New recording",
      onClick: () => push({url: "page/InputVoiceScreen", param: JSON.stringify({id: "0", text: ""})}),
    }));

    return items;
  }

  private playFile(filepath: string) {
    if (this.player) {
      try { this.player.stop(); this.player.release(); } catch(_) {}
      this.player = null;
    }

    const displayName = filepath.replace("data://", "");
    this.statusText.updateProps({text: `Loading: ${displayName}`});

    const player = media.create(media.id.PLAYER) as ZeppMediaPlayer;
    this.player = player;

    player.addEventListener(player.event.PREPARE, (result: any) => {
      if (result) {
        this.statusText.updateProps({text: `Playing: ${displayName}`});
        player.start();
      } else {
        this.statusText.updateProps({text: `Failed to load: ${displayName}`});
        try { player.release(); } catch(_) {}
        if (this.player === player) this.player = null;
      }
    });

    player.addEventListener(player.event.COMPLETE, () => {
      this.statusText.updateProps({text: `Done: ${displayName}`});
      try { player.stop(); player.release(); } catch(_) {}
      if (this.player === player) this.player = null;
    });

    player.setSource(player.source.FILE, {file: filepath});
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
