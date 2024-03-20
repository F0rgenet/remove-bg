import {setupContextMenuEvents} from "~events/context-menu";
import {onInstalled} from "~events/installation";
import {fileToDataURL} from "~utils";
import {type ImageProcessingData, processImageAction, storageKey} from "~model/image-processing";

async function copyImageToClipboard(imageURL: string): Promise<void> {
    // FIXME: Blob size не даёт
    const response = await fetch(imageURL);
    const blob = await response.blob();
    console.log(blob)
    const clipboardItemInput = new ClipboardItem({'image/png' : blob});
    await navigator.clipboard.write([clipboardItemInput]);
}

async function downloadImage(imageURL: string): Promise<void> {
    const response = await fetch(imageURL);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'image';
    a.click();
    URL.revokeObjectURL(url);
}

async function executeScript(callback: (...args: any[]) => unknown, ...args: any[]): Promise<void> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({ target: { tabId: tab.id }, func: callback, args: args }).then();
}


export const enum ContextMenuAction {
    COPY = 0,
    SAVE = 1,
    OPEN = 2
}

export async function copyImage(imageURL: string){
    await executeScript(copyImageToClipboard, imageURL);
}

export async function saveImage(imageURL: string){
    await executeScript(downloadImage, imageURL);
}

export async function openImage(imageURL: string) {
    await chrome.tabs.create({ url: imageURL});
}

async function removeBackgroundAction(file: File, action: ContextMenuAction){
    const fileDataURL =  await fileToDataURL(file);
    if (!fileDataURL) {
        throw new Error(`File dataURL not found: ${file}`)
    }
    const processingResponse = await processImageAction(file.name, fileDataURL);
    const resultURL = processingResponse.resultURL;

    switch (action) {
        case ContextMenuAction.COPY:
            await copyImage(resultURL);
            break;
        case ContextMenuAction.SAVE:
            await saveImage(resultURL);
            break;
        case ContextMenuAction.OPEN:
            await openImage(resultURL);
            break;
    }
}

setupContextMenuEvents(removeBackgroundAction);
chrome.runtime.onInstalled.addListener(onInstalled);

export {}
