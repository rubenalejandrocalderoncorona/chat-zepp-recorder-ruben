import {ListItem, SectionHeaderComponent} from "mzfw/device/UiListView";
import {SERVER_BASE_URL} from "../shared/constants";
import {getRequestHeaders} from "../shared/Tools";
import {getText as t} from "@zosx/i18n";
import {Component} from "mzfw/device/UiComponent";
import {ConfigStorage} from "mzfw/device/Path";

const ALLOWED_MODELS_ENDPOINT = `${SERVER_BASE_URL}/api/v2/allowed_models`;

interface IAiModelInfo {
    code: string;
    label: string;
    description: string;
}

interface AllowedModelsResponse {
    models: IAiModelInfo[];
}

export const renderAiModelPicker = (onChange: () => any): Promise<Component<any>[]> => {
    return fetch(ALLOWED_MODELS_ENDPOINT, { headers: getRequestHeaders() }).then((r) => {
        return r.json();
    }).then(({ models }: AllowedModelsResponse) => {
        const currentModel: string = localStorage.getItem("currentModel") ?? models[0]?.code ?? '';

        return [
            new SectionHeaderComponent(t("AI Provider:")),
            ...(models.map(
                ({ code, label, description }) => new ListItem({
                    title: label,
                    description,
                    icon: String(currentModel === code),
                    onClick(): any {
                        localStorage.setItem("currentModel", code);
                        (localStorage as ConfigStorage).writeChanges();
                        onChange();
                    },
                })
            ))
        ]
    })
}