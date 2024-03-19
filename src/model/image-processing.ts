import ChallengeSolver from "./bypass";
import dataURLtoFile, {blobToDataURL, fileToDataURL} from "../utils";
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

class ImageProcessor {
    private challengeSolver: ChallengeSolver;

    constructor() {
        this.challengeSolver = new ChallengeSolver();
    }

    async processImage(imageDataURL: string, filename: string): Promise<ImageProcessingResponse> {
        try {
            console.log("Processing image...");
            const token = await this.challengeSolver.getToken();
            if (!token) {
                console.error("Failed to retrieve token");
                return {success: false, resultURL: "", failureReason: "Failed to retrieve token"};
            }

            const file = dataURLtoFile(imageDataURL, filename);
            console.log("Token retrieved. Processing image request...");
            const resultImageURL = await this.processImageRequest(file, token);
            if (!resultImageURL) {
                console.error("Failed to process the image");
                return {success: false, resultURL: "", failureReason: "Failed to process the image"};
            }

            console.log("Image processed successfully");
            return {success: true, resultURL: resultImageURL};
        } catch (error) {
            console.error("An error occurred while processing the image:", error);
            return {success: false, resultURL: "", failureReason: "An error occurred while processing the image"};
        }
    }

    private async processImageRequest(imageFile: File, token: string): Promise<string> {
        const url = "https://api.removal.ai/3.0/remove";
        const requestData = this.createFormData(imageFile);
        const headers = { "Web-Token": token, "Cache-Control": "no-cache" };
        const options = { method: "POST", body: requestData, headers: headers };

        console.log("Sending image processing request...");
        const response = await fetch(url, options);
        if (!response.ok) {
            console.error(`Request failed: ${response.statusText}`);
            throw new Error(`Request failed: ${response.statusText}`);
        }

        console.log("Image processing request successful. Parsing response...");
        const data: {low_resolution: string} = await response.json();
        return data.low_resolution;
    }

    private createFormData(imageFile: File): FormData {
        console.log("Creating form data...");
        let form_data = new FormData();
        form_data.append("image_file", imageFile, imageFile.name);
        form_data.append("usrc", "upl");
        return form_data;
    }
}

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
    
    const imageProcessor = new ImageProcessor();
    const result = await imageProcessor.processImage(imageDataURL, imageFilename)
    if (result.success) {
        await setProcessingStep(ProcessingStep.DONE, result.resultURL);
        return result;
    } else {
        await setProcessingStep(ProcessingStep.EMPTY);
        throw new Error(`Cant process image: ${imageFilename}`)
    }
}

export default ImageProcessor;
