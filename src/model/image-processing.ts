import {Storage} from "@plasmohq/storage";
import setBadgeText, {BadgeTextLevel} from "~events/badge-actions";

export enum ImageProcessingStage {
    EMPTY = "empty",
    WORKING = "working",
    DONE = "done"
}

export const storageKey = "ImageProcessingData";

export type ImageProcessingData = {imageURL: string, stage: ImageProcessingStage, usageCount: number};

export type ImageProcessingResponse = {success: boolean, resultURL: string, failureReason?: string};

export const enum ProcessingStep {
    EMPTY = 0,
    WORKING = 1,
    DONE = 2
}

export async function setProcessingStep(step: ProcessingStep, imageURL?: string): Promise<void> {
    const storage = new Storage();
    switch (step) {
        case ProcessingStep.EMPTY:
            await storage.set(storageKey, { imageURL: null, stage: ImageProcessingStage.EMPTY });
            setBadgeText("");
            break;
        case ProcessingStep.WORKING:
            await storage.set(storageKey, { imageURL: null, stage: ImageProcessingStage.WORKING });
            setBadgeText("LOAD", BadgeTextLevel.PROGRESS);
            break;
        case ProcessingStep.DONE:
            await storage.set(storageKey, { imageURL: imageURL, stage: ImageProcessingStage.DONE });
            setBadgeText("DONE", BadgeTextLevel.RESULT);
            break;
    }
}

export async function processImageAction(imageFilename: string, imageDataURL: string){
    if (!imageDataURL) {
        return;
    }
    await setProcessingStep(ProcessingStep.WORKING);

    const fetchResponse = await fetch(imageDataURL);
    const blob = await fetchResponse.blob();

    const formData = new FormData();
    formData.append('image', blob, "image.png");

    const response = await fetch('https://removebg.webtm.ru:3000/process-image', {
        method: 'POST',
        body: formData
    });

    const result: ImageProcessingResponse = (await response.json()).response;


    if (result.success) {
        await setProcessingStep(ProcessingStep.DONE, result.resultURL);
        return result;
    } else {
        await setProcessingStep(ProcessingStep.EMPTY);
        throw new Error(`Cant process image: ${imageFilename}`)
    }
}

export default processImageAction;
