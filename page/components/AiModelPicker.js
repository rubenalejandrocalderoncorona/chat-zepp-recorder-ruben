import { ListItem, SectionHeaderComponent } from "mzfw/device/UiListView";
import { SERVER_BASE_URL } from "../shared/constants";
import { getRequestHeaders } from "../shared/Tools";
import { getText as t } from "@zosx/i18n";
const ALLOWED_MODELS_ENDPOINT = `${SERVER_BASE_URL}/api/v2/allowed_models`;
const renderAiModelPicker = (onChange) => {
  return fetch(ALLOWED_MODELS_ENDPOINT, { headers: getRequestHeaders() }).then((r) => {
    return r.json();
  }).then(({ models }) => {
    var _a, _b, _c;
    const currentModel = (_c = (_b = localStorage.getItem("currentModel")) != null ? _b : (_a = models[0]) == null ? void 0 : _a.code) != null ? _c : "";
    return [
      new SectionHeaderComponent(t("AI Provider:")),
      ...models.map(
        ({ code, label, description }) => new ListItem({
          title: label,
          description,
          icon: String(currentModel === code),
          onClick() {
            localStorage.setItem("currentModel", code);
            localStorage.writeChanges();
            onChange();
          }
        })
      )
    ];
  });
};
export {
  renderAiModelPicker
};
