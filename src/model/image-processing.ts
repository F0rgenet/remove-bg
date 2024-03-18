import ChallengeSolver from "./bypass";
import dataURLtoFile from "../utils";

export enum ImageProcessingStage {
    EMPTY = null,
    WORKING = "working",
    DONE = "done"
}

export const storageKey = "ImageProcessingData";

export type ImageProcessingData = {imageFile: File, stage: ImageProcessingStage, imageURL?: string, usageCount: number};

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

export default ImageProcessor;
