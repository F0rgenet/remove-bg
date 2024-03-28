import {ContextMenuAction} from "~background";
import {imageURLtoFile} from "~utils";

export function createContextMenu() {
    chrome.contextMenus.create({
        id: "context-open",
        title: "Remove background and open",
        contexts: ["image"]
    });
    chrome.contextMenus.create({
        id: "context-save",
        title: "Remove background and save",
        contexts: ["image"]
    });
}

export function setupContextMenuEvents(handler: (file: File, action: ContextMenuAction)=>void) {
    chrome.contextMenus.onClicked.addListener(async function (info, _) {
        const sourceURL = info.srcUrl
        if (!sourceURL) {
            throw new Error("Url not found in file")
        }
        const file: File = await imageURLtoFile(sourceURL);
        if (info.menuItemId === "context-open") {
            handler(file, ContextMenuAction.OPEN);
        } else if (info.menuItemId === "context-save") {
            handler(file, ContextMenuAction.SAVE);
        }
    });
}