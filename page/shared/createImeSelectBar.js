import { ActionBar } from "mzfw/device/UiActionBar";
import { push, replace } from "@zosx/router";
import { zeppFeatureLevel } from "mzfw/device/System";
function createImeSelectBar(id, useReplace = true) {
  const handler = useReplace ? replace : push;
  const items = [{
    icon: "keyboard",
    onClick: () => continueToIME("page/InputKeyboardScreen")
  }];
  if (zeppFeatureLevel >= 3 && !localStorage.getItem("voiceImeDisabled")) items.push({
    icon: "voice",
    onClick: () => continueToIME("page/InputVoiceScreen")
  });
  function continueToIME(url) {
    handler({
      url: localStorage.getItem("privacyStatementRead2") ? url : "page/PrivacyWarningScreen",
      params: JSON.stringify({ id, text: "", continueUrl: url })
    });
  }
  return new ActionBar({
    children: items
  });
}
export {
  createImeSelectBar
};
