import "../static/styles.css"
import {useNavigate} from "react-router-dom";
import {Storage} from "@plasmohq/storage";

import {
    type ImageProcessingData,
    type ImageProcessingResponse,
    ProcessingStep,
    setProcessingStep,
    storageKey
} from "~model/image-processing";
import {useEffect, useState} from "react";
import {blobToDataURL, fileToDataURL} from "~utils";
import {sendToBackground} from "@plasmohq/messaging";
import {ContextMenuAction} from "~background";

const Result = () => {
    const navigate = useNavigate();
    const storage = new Storage();
    const [imageUrl, setImageUrl] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const result: ImageProcessingData = await storage.get(storageKey);
            const imageURL: string = result.imageURL;
            setImageUrl(imageURL);
        };
        fetchData().then();
    }, []);

    const handleRedirect = () => {
        navigate('/home');
        setProcessingStep(ProcessingStep.EMPTY).then();
    };

    const handleCopy = async () => {
        await sendToBackground({name: "result-action", body: {action: ContextMenuAction.COPY}});
    }

    const handleSave = async () => {
        await sendToBackground({name: "result-action", body: {action: ContextMenuAction.SAVE}});
    }

    return (
        <div id="popup-save" className="popup-page">
            <div className="frame">
                <button className="close-button" onClick={handleRedirect}>✖</button>
                <h1 className="title">Background removed!</h1>
                <div id="result-bounding-box">
                    {imageUrl && <img src={imageUrl} alt="Processed Image" id="image-result" />}
                </div>
                <div className="buttons-row">
                    <button className="action-button" onClick={handleCopy}>Copy</button>
                    <button className="action-button" onClick={handleSave}>Download</button>
                </div>
            </div>
        </div>
    )
}

export default Result
