import {ContextMenuAction} from "~background";
import {imageURLtoFile} from "~utils";

export function createContextMenu() {
    chrome.contextMenus.create({
        id: "remove-controller-copy",
        title: "Remove controller and copy",
        contexts: ["image"]
    });
    chrome.contextMenus.create({
        id: "remove-controller-save",
        title: "Remove controller and save",
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
        if (info.menuItemId === "remove-controller-copy") {
            handler(file, ContextMenuAction.COPY);
        } else if (info.menuItemId === "remove-controller-save") {
            handler(file, ContextMenuAction.SAVE);
        }
    });
}