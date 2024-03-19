import {type PlasmoMessaging} from "@plasmohq/messaging"
import {type ImageProcessingData, storageKey} from "~model/image-processing";
import {Storage} from "@plasmohq/storage";
import {ContextMenuAction, copyImage, saveImage} from "~background";


type RequestBody = {action: ContextMenuAction};
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    const storage = new Storage();
    const imageProcessingData = await storage.get(storageKey) as ImageProcessingData;
    const imageURL = imageProcessingData.imageURL;
    switch (req.body.action) {
        case ContextMenuAction.COPY:
            await copyImage(imageURL);
            break;
        case ContextMenuAction.SAVE:
            await saveImage(imageURL);
            break;
    }
}

export default handler