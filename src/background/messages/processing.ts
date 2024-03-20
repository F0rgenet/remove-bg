import {type PlasmoMessaging} from "@plasmohq/messaging"
import {processImageAction} from "~model/image-processing";


type RequestBody = {imageDataURL: string, imageFilename: string};
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    const result = await processImageAction(req.body.imageFilename, req.body.imageDataURL);
    res.send({result});
}

export default handler