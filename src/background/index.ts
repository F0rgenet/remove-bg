import {setupContextMenuEvents} from "~events/context-menu";
import {onInstalled} from "~events/installation";
import {fileToDataURL} from "~utils";
import {processImageAction} from "~model/image-processing";

async function copyImageToClipboard(imageURL: string): Promise<void> {
    const response = await fetch(imageURL);
    const blob = await response.blob();
    console.log(blob)
    const clipboardItemInput = new ClipboardItem({'image/png' : blob});
    // TODO: Fix
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

export const enum ImageAction {
    COPY = 0,
    SAVE = 1,
    OPEN = 2,
    PROCESS = 3
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

async function removeBackgroundAction(file: File, action: ImageAction){
    const fileDataURL =  await fileToDataURL(file);
    if (!fileDataURL) {
        throw new Error(`File dataURL not found: ${file}`)
    }
    const processingResponse = await processImageAction(file.name, fileDataURL);
    const resultURL = processingResponse.resultURL;

    switch (action) {
        case ImageAction.COPY:
            await copyImage(resultURL);
            break;
        case ImageAction.SAVE:
            await saveImage(resultURL);
            break;
        case ImageAction.OPEN:
            await openImage(resultURL);
            break;
        case ImageAction.PROCESS:
            break;
        default:
            throw new Error("Wrong context action")
    }
}

setupContextMenuEvents(removeBackgroundAction);
chrome.runtime.onInstalled.addListener(onInstalled);

export {}
