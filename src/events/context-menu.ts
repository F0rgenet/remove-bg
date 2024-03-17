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

export function setupContextMenuEvents(removeBackgroundAndCopy: (imageURL: string) => void, removeBackgroundAndSave: (imageURL: string) => void) {
    chrome.contextMenus.onClicked.addListener(function (info, _) {
        const sourceURL = info.srcUrl
        if (!sourceURL) {
            throw new Error("Url not found in file")
        }
        if (info.menuItemId === "remove-controller-copy") {
            removeBackgroundAndCopy(sourceURL);
        } else if (info.menuItemId === "remove-controller-save") {
            removeBackgroundAndSave(sourceURL);
        }
    });
}