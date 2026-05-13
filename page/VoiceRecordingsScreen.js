import { create, id } from "@zos/media";
import { readdirSync } from "@zos/fs";
import { createWidget, widget, align, prop, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { push, back } from "@zos/router";

const device = getDeviceInfo();
const W = device.width;
const H = device.height;
const STATUS_BAR_H = 56;
const HEADER_H = 52;
const ROW_H = 72;

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
    // Single player instance created once in onInit, reused for every play
    player: null,
    currentIndex: -1,
    statusWidget: null,
    rowWidgets: [],
    rows: [],
  },

  onInit() {
    // Create the player once and keep it alive for the whole page lifecycle
    const player = create(id.PLAYER);
    const self = this;

    player.addEventListener(player.event.PREPARE, function (result) {
      if (result) {
        player.start();
        const file = self.state.rows[self.state.currentIndex] || "";
        self.updateStatus("Playing: " + file);
        self.updateRowBtn(self.state.currentIndex, "■ Stop", 0x3a1a1a);
      } else {
        self.updateStatus("Failed to load");
        self.updateRowBtn(self.state.currentIndex, "▶ Play", 0x1a3a1a);
        self.state.currentIndex = -1;
      }
    });

    player.addEventListener(player.event.COMPLETE, function () {
      self.updateStatus(self.state.rows.length + " recording(s)");
      self.updateRowBtn(self.state.currentIndex, "▶ Play", 0x1a3a1a);
      self.state.currentIndex = -1;
    });

    this.state.player = player;
  },

  build() {
    const self = this;
    const recordings = getRecordings();
    this.state.rows = recordings;

    createWidget(widget.FILL_RECT, { x: 0, y: STATUS_BAR_H, w: W, h: HEADER_H, color: 0x111111 });

    createWidget(widget.BUTTON, {
      x: 8, y: STATUS_BAR_H + 8, w: 56, h: 36,
      text: "< Back",
      text_size: 13,
      normal_color: 0x222222,
      press_color: 0x444444,
      radius: 8,
      click_func() { self.stopCurrent(); back(); },
    });

    createWidget(widget.BUTTON, {
      x: W - 72, y: STATUS_BAR_H + 8, w: 64, h: 36,
      text: "+ Rec",
      text_size: 13,
      normal_color: 0x1a4a1a,
      press_color: 0x2a6a2a,
      radius: 8,
      click_func() {
        self.stopCurrent();
        push({ url: "page/InputVoiceScreen", param: JSON.stringify({ id: "0", text: "" }) });
      },
    });

    this.state.statusWidget = createWidget(widget.TEXT, {
      x: 72, y: STATUS_BAR_H + 8, w: W - 152, h: 36,
      text: recordings.length + " recording(s)",
      text_size: 15,
      color: 0xaaaaaa,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text_style: text_style.NONE,
    });

    if (recordings.length === 0) {
      createWidget(widget.TEXT, {
        x: 0, y: STATUS_BAR_H + HEADER_H + 40, w: W, h: 40,
        text: "No recordings yet",
        text_size: 20,
        color: 0x666666,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
        text_style: text_style.NONE,
      });
      return;
    }

    const startY = STATUS_BAR_H + HEADER_H + 8;
    recordings.forEach(function (file, i) {
      const y = startY + i * (ROW_H + 4);

      createWidget(widget.FILL_RECT, { x: 4, y, w: W - 8, h: ROW_H, color: 0x111111, radius: 8 });

      createWidget(widget.TEXT, {
        x: 12, y: y + 8, w: W - 24, h: 28,
        text: file,
        text_size: 16,
        color: 0xffffff,
        align_h: align.LEFT,
        align_v: align.CENTER_V,
        text_style: text_style.NONE,
      });

      const btn = createWidget(widget.BUTTON, {
        x: 12, y: y + 38, w: W - 24, h: 26,
        text: "▶ Play",
        text_size: 14,
        normal_color: 0x1a3a1a,
        press_color: 0x2a5a2a,
        radius: 6,
        click_func() {
          if (self.state.currentIndex === i) {
            self.stopCurrent();
          } else {
            self.playIndex(i);
          }
        },
      });

      self.state.rowWidgets.push(btn);
    });
  },

  updateStatus(msg) {
    if (this.state.statusWidget) {
      this.state.statusWidget.setProperty(prop.TEXT, msg);
    }
  },

  updateRowBtn(index, text, color) {
    const btn = this.state.rowWidgets[index];
    if (!btn) return;
    btn.setProperty(prop.TEXT, text);
    btn.setProperty(prop.NORMAL_COLOR, color);
  },

  stopCurrent() {
    if (this.state.currentIndex > -1) {
      this.updateRowBtn(this.state.currentIndex, "▶ Play", 0x1a3a1a);
      this.state.currentIndex = -1;
    }
    // Stop the persistent player — safe to call from any state
    try { this.state.player.stop(); } catch (_) {}
    this.updateStatus(this.state.rows.length + " recording(s)");
  },

  playIndex(index) {
    // Stop whatever is playing first, reset its button
    if (this.state.currentIndex > -1) {
      this.updateRowBtn(this.state.currentIndex, "▶ Play", 0x1a3a1a);
    }

    this.state.currentIndex = index;
    const filepath = "data://" + this.state.rows[index];

    this.updateStatus("Loading...");
    this.updateRowBtn(index, "loading...", 0x333300);

    // Reuse the same player: stop → setSource → prepare
    try { this.state.player.stop(); } catch (_) {}
    this.state.player.setSource(this.state.player.source.FILE, { file: filepath });
    this.state.player.prepare();
  },

  onDestroy() {
    this.stopCurrent();
  },
});
