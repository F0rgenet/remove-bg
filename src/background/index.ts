import {setupContextMenuEvents} from "~events/context-menu";
import {onInstalled} from "~events/installation";
import {Storage} from "@plasmohq/storage";
import {fileToDataURL} from "~utils";
import {
    processImageAction,
    ProcessingStep,
    setProcessingStep, storageKey
} from "~model/image-processing";
import result from "~pages/result";

const storage = new Storage();

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

async function executeScript(tabId: number, callback: (...args: any[]) => unknown, ...args: any[]): Promise<void> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({ target: { tabId: tab.id }, func: callback, args: args }).then();
}


export const enum ContextMenuAction {
    COPY = 0,
    SAVE = 1
}

async function getCurrentTab(): Promise<chrome.tabs.Tab | undefined> {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

export async function copyImage(imageURL: string){
    const currentTabID = (await getCurrentTab()).id;
    await executeScript(currentTabID, copyImageToClipboard, imageURL);
}

export async function saveImage(imageURL: string){
    const currentTabID = (await getCurrentTab()).id;
    await executeScript(currentTabID, downloadImage, imageURL);
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
    }
}

setupContextMenuEvents(removeBackgroundAction);
chrome.runtime.onInstalled.addListener(onInstalled);

export {}
