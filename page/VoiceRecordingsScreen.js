import { create, id } from "@zos/media";
import { readdirSync } from "@zos/fs";
import { createWidget, widget, align, prop, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { push, back } from "@zos/router";

const device = getDeviceInfo();
const W = device.width;
const H = device.height;
const ROW_H = 80;
const HEADER_H = 64;

function getRecordings() {
  try {
    const files = readdirSync({ path: "data://" });
    if (!files) return [];
    return files.filter((f) => f.endsWith(".opus")).sort().reverse();
  } catch (_) {
    return [];
  }
}

Page({
  state: {
    player: null,
    playingFile: null,
    statusWidget: null,
    listWidget: null,
    rows: [],
  },

  build() {
    const self = this;
    const recordings = getRecordings();
    this.state.rows = recordings;

    createWidget(widget.FILL_RECT, { x: 0, y: 0, w: W, h: H, color: 0x000000 });
    createWidget(widget.FILL_RECT, { x: 0, y: 0, w: W, h: HEADER_H, color: 0x111111 });

    createWidget(widget.BUTTON, {
      x: 12, y: 12, w: 60, h: 40,
      text: "<",
      text_size: 22,
      normal_color: 0x222222,
      press_color: 0x444444,
      radius: 8,
      click_func() { self.stopPlayer(); back(); },
    });

    createWidget(widget.BUTTON, {
      x: W - 76, y: 12, w: 64, h: 40,
      text: "+ Rec",
      text_size: 14,
      normal_color: 0x1a4a1a,
      press_color: 0x2a6a2a,
      radius: 8,
      click_func() {
        self.stopPlayer();
        push({ url: "page/InputVoiceScreen", param: JSON.stringify({ id: "0", text: "" }) });
      },
    });

    this.state.statusWidget = createWidget(widget.TEXT, {
      x: 74, y: 14, w: W - 150, h: 36,
      text: "Tap a recording",
      text_size: 16,
      color: 0xaaaaaa,
      align_h: align.LEFT,
      align_v: align.CENTER_V,
      text_style: text_style.NONE,
    });

    if (recordings.length === 0) {
      createWidget(widget.TEXT, {
        x: 0, y: H / 2 - 20, w: W, h: 40,
        text: "No recordings yet",
        text_size: 20,
        color: 0x666666,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
        text_style: text_style.NONE,
      });
      return;
    }

    this.state.listWidget = createWidget(widget.SCROLL_LIST, {
      x: 0,
      y: HEADER_H + 4,
      w: W,
      h: H - HEADER_H - 4,
      item_space: 4,
      item_count: recordings.length,
      item_config: [{
        type_id: 0,
        item_height: ROW_H,
        item_bg_color: 0x111111,
        item_bg_radius: 8,
        item_click_func(_widget, index) {
          const filepath = "data://" + self.state.rows[index];
          if (self.state.playingFile === filepath) {
            self.stopPlayer();
            self.updateStatus("Stopped");
          } else {
            self.playFile(filepath);
          }
        },
        sub_widgets: [{
          type: widget.TEXT,
          attr: {
            x: 14, y: 10, w: W - 28, h: 30,
            key: "name_text",
            text: "",
            text_size: 17,
            color: 0xffffff,
            align_h: align.LEFT,
            align_v: align.CENTER_V,
            text_style: text_style.NONE,
          },
        }, {
          type: widget.TEXT,
          attr: {
            x: 14, y: 44, w: W - 28, h: 24,
            key: "status_text",
            text: "",
            text_size: 14,
            color: 0x44aa44,
            align_h: align.LEFT,
            align_v: align.CENTER_V,
            text_style: text_style.NONE,
          },
        }],
      }],
      data_array: recordings.map((f) => ({
        type_id: 0,
        name_text: f,
        status_text: "",
      })),
    });
  },

  updateStatus(msg) {
    if (this.state.statusWidget) {
      this.state.statusWidget.setProperty(prop.TEXT, msg);
    }
  },

  refreshList() {
    const lw = this.state.listWidget;
    if (!lw) return;
    lw.setProperty(prop.ITEM_COUNT, this.state.rows.length);
    for (let i = 0; i < this.state.rows.length; i++) {
      const filepath = "data://" + this.state.rows[i];
      lw.setProperty(prop.UPDATE_DATA, {
        index: i,
        item_data: {
          name_text: this.state.rows[i],
          status_text: this.state.playingFile === filepath ? "> Playing" : "",
        },
      });
    }
  },

  stopPlayer() {
    if (this.state.player) {
      this.state.player.stop();
      this.state.player = null;
      this.state.playingFile = null;
      this.refreshList();
    }
  },

  playFile(filepath) {
    this.stopPlayer();

    const player = create(id.PLAYER);
    const self = this;

    player.addEventListener(player.event.PREPARE, function (result) {
      if (result) {
        player.start();
        self.state.playingFile = filepath;
        self.updateStatus("Playing: " + filepath.replace("data://", ""));
        self.refreshList();
      } else {
        self.updateStatus("Failed: " + filepath.replace("data://", ""));
        self.state.player = null;
        self.state.playingFile = null;
      }
    });

    player.addEventListener(player.event.COMPLETE, function () {
      player.stop();
      self.state.player = null;
      self.state.playingFile = null;
      self.updateStatus("Done");
      self.refreshList();
    });

    this.state.player = player;
    player.setSource(player.source.FILE, { file: filepath });
    player.prepare();
    this.updateStatus("Loading...");
  },

  onDestroy() {
    this.stopPlayer();
  },
});
