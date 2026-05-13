import { align, createWidget, getAppWidgetSize, setAppWidgetSize, text_style, widget } from "@zosx/ui";
import { BASE_FONT_SIZE } from "mzfw/device/UiProperties";
import { launchApp } from "@zosx/router";
import { getAppTags } from "mzfw/shared/AppTagsProvider";
import { zeppFeatureLevel } from "mzfw/device/System";
AppWidget({
  build() {
    setAppWidgetSize({ h: 96 + 32 });
    const widgetSizes = getAppWidgetSize();
    function simpleIconButton(index, icon, onClick) {
      createWidget(widget.FILL_RECT, {
        x: widgetSizes.margin + widgetSizes.w - 104 * (index + 1),
        y: Math.floor((widgetSizes.h - 96) / 2),
        w: 96,
        h: 96,
        color: 4144959,
        radius: 47
      });
      createWidget(widget.BUTTON, {
        x: widgetSizes.margin + widgetSizes.w - 104 * (index + 1),
        y: Math.floor((widgetSizes.h - 96) / 2),
        w: 96,
        h: 96,
        text: "",
        normal_src: `icon/96/${icon}.png`,
        press_src: `icon/96/${icon}.png`,
        click_func: onClick
      });
    }
    createWidget(widget.TEXT, {
      x: widgetSizes.margin + 16,
      y: 0,
      w: widgetSizes.w / 2,
      h: widgetSizes.h,
      align_v: align.CENTER_V,
      text: "AI Chat",
      text_style: text_style.WRAP,
      color: 11457921,
      text_size: BASE_FONT_SIZE - 2
    });
    simpleIconButton(0, "keyboard", () => launchApp({
      appId: getAppTags()[0],
      url: "page/InputKeyboardScreen",
      params: JSON.stringify({ id: "0", text: "" })
    }));
    if (zeppFeatureLevel >= 3) simpleIconButton(1, "voice", () => launchApp({
      appId: getAppTags()[0],
      url: "page/InputVoiceScreen",
      params: JSON.stringify({ id: "0", text: "" })
    }));
  }
});
