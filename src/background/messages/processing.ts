import {type PlasmoMessaging, sendToBackground, sendToContentScript} from "@plasmohq/messaging"
import ImageProcessor, {
    type ImageProcessingResponse,
    ImageProcessingStage,
    processImageAction,
    storageKey
} from "~model/image-processing";
import {Storage} from "@plasmohq/storage";
import setBadgeText, {BadgeTextLevel} from "~events/badge-actions";
import dataURLtoFile, {fileToDataURL, imageURLtoFile} from "~utils";


type RequestBody = {imageDataURL: string, imageFilename: string};
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    const result = await processImageAction(req.body.imageFilename, req.body.imageDataURL);
    res.send({result});
}

export default handler