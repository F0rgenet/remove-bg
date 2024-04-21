import {Storage} from "@plasmohq/storage";
import setBadgeText, {BadgeTextLevel} from "~events/badge-actions";

export const imageProcessingStorageKey = "ImageProcessingData";
export type ImageProcessingData = {imageURL: string, stage: ImageProcessingStage, failureReason?: string};
export type ImageProcessingResponse = {success: boolean, resultURL: string, failureReason?: string};

export const enum ImageProcessingStage {
    EMPTY = "EMPTY",
    WORKING = "WORKING",
    DONE = "DONE",
    FAILED = "FAILED"
}

export async function setProcessingStep(step: ImageProcessingStage, imageURL?: string, failureReason?: string): Promise<void> {
    const storage = new Storage();
    switch (step) {
        case ImageProcessingStage.EMPTY:
            await storage.set(imageProcessingStorageKey, {
                imageURL: null,
                stage: ImageProcessingStage.EMPTY,
                failureReason: null
            });
            setBadgeText("");
            break;
        case ImageProcessingStage.WORKING:
            await storage.set(imageProcessingStorageKey, {
                imageURL: null,
                stage: ImageProcessingStage.WORKING,
                failureReason: null
            });
            setBadgeText("LOAD", BadgeTextLevel.PROGRESS);
            break;
        case ImageProcessingStage.DONE:
            await storage.set(imageProcessingStorageKey, {
                imageURL: imageURL,
                stage: ImageProcessingStage.DONE,
                failureReason: null
            });
            setBadgeText("DONE", BadgeTextLevel.RESULT);
            break;
        case ImageProcessingStage.FAILED:
            await storage.set(imageProcessingStorageKey, {
                imageURL: null,
                stage: ImageProcessingStage.FAILED,
                failureReason: failureReason
            });
            setBadgeText("FAIL", BadgeTextLevel.ERROR);
            break;
    }
}

export async function processImageAction(imageFilename: string, imageDataURL: string){
    if (!imageDataURL) {
        return;
    }
    await setProcessingStep(ImageProcessingStage.WORKING);

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
        await setProcessingStep(ImageProcessingStage.DONE, result.resultURL);
        return result;
    } else {
        await setProcessingStep(ImageProcessingStage.FAILED, null, result.failureReason);
        throw new Error(`Cant process image: ${imageFilename}\n${result.failureReason}`)
    }
}
