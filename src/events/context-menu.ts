import {ImageAction} from "~background";
import {imageURLtoFile} from "~utils";

export function createContextMenu() {
    chrome.contextMenus.create({
        id: "context-process",
        title: "Remove bg",
        contexts: ["image"]
    });
}

export function setupContextMenuEvents(handler: (file: File, action: ImageAction)=>void) {
    chrome.contextMenus.onClicked.addListener(async function (info, _) {
        const sourceURL = info.srcUrl
        if (!sourceURL) {
            throw new Error("Url not found in file")
        }
        const file: File = await imageURLtoFile(sourceURL);
        if (info.menuItemId === "context-process") {
            handler(file, ImageAction.PROCESS);
        }
    });
}