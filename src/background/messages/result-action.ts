import {type PlasmoMessaging} from "@plasmohq/messaging"
import {type ImageProcessingData, imageProcessingStorageKey} from "~model/image-processing";
import {Storage} from "@plasmohq/storage";
import {ImageAction, copyImage, saveImage} from "~background";


type RequestBody = {action: ImageAction};
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    const storage = new Storage();
    const imageProcessingData = await storage.get(imageProcessingStorageKey) as ImageProcessingData;
    const imageURL = imageProcessingData.imageURL;
    switch (req.body.action) {
        case ImageAction.COPY:
            await copyImage(imageURL);
            break;
        case ImageAction.SAVE:
            await saveImage(imageURL);
            break;
    }
    res.send({});
}

export default handler