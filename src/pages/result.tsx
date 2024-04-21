import "../static/styles.css";
import {useNavigate} from "react-router-dom";
import {Storage} from "@plasmohq/storage";
import {useEffect, useState} from "react";
import {sendToBackground} from "@plasmohq/messaging";
import {ImageAction} from "~background";
import {
    type ImageProcessingData,
    ImageProcessingStage,
    imageProcessingStorageKey,
    setProcessingStep
} from "~model/image-processing";

import { Clipboard as ClipboardIcon, Download as DownloadIcon, ExternalLink as ExternalLinkIcon } from "lucide-react"

const ResultPage = () => {
    const navigate = useNavigate();
    const storage = new Storage();
    const [imageUrl, setImageUrl] = useState("");
    const [allowDownload, setAllowDownload] = useState(true);
    const [action, setAction] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const result: ImageProcessingData = await storage.get(imageProcessingStorageKey);
            const imageURL: string = result.imageURL;
            let imageExists: boolean;
            try {
                imageExists = (await fetch(imageURL)).status == 200;
            } catch (error) {
                console.warn(error)
                imageExists = false;
            }
            if (!imageExists) {
                await setProcessingStep(ImageProcessingStage.EMPTY);
                console.log("Image is not available anymore")
                navigate("/home")
            }
            else if (imageURL){
                setImageUrl(imageURL);
            } else {
                await setProcessingStep(ImageProcessingStage.FAILED, null, "Image is not available");
                navigate("/error");
            }
        };
        fetchData().then();
    }, [action]);

    useEffect(() => {
        const checkScriptInjection = async () => {
            try {
                const testFunction = ()=>{return 2+2};
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                await chrome.scripting.executeScript({target: {tabId: tab.id}, func: testFunction }).then();
                setAllowDownload(true);
            } catch (error) {
                console.log(`Cant be injected: ${error}`)
                setAllowDownload(false);
            }
        };
        checkScriptInjection().then();
    }, []);

    const handleRedirect = () => {
        navigate("/home");
        setProcessingStep(ImageProcessingStage.EMPTY).then();
    };

    const handleCopy = async () => {
        await sendToBackground({ name: "result-action", body: { action: ImageAction.COPY } });
        setAction("Image copied! ✅");
    };

    const handleSave = async () => {
        if (allowDownload) {
            await sendToBackground({ name: "result-action", body: { action: ImageAction.SAVE } });
            setAction("Image saved! ✅");
        } else {
            alert("Download is not allowed on this page");
        }
    };

    const handleOpen = async () => {
        const result: ImageProcessingData = await storage.get(imageProcessingStorageKey);
        await chrome.tabs.create({ url: result.imageURL });
        setAction("Image opened! ✅");
    };

    return (
        <div id="popup-save" className="popup-page">
            <div className="frame">
                <button className="close-button" onClick={handleRedirect}>✖</button>
                <h1 className="title">{action || "Background removed! ✅"}</h1>
                <div className="content">
                    <div id="result-bounding-box">
                        {imageUrl && <img src={imageUrl} alt="Processed Image" id="image-result"/>}
                    </div>
                </div>
                <div className="buttons-row">
                    {!allowDownload && <button className="action-button" style={{ width: "100%" }} onClick={handleOpen}>
                        <ExternalLinkIcon size={16}/>Open</button>}
                    {allowDownload && <button className="action-button" style={{ borderRight: "1px solid #707070",
                        width: "50%" }} onClick={handleCopy}>
                        <ClipboardIcon size={16}/>Copy</button>}
                    {allowDownload && <button className="action-button" style={{ width: "50%" }} onClick={handleSave}>
                        <DownloadIcon size={16}/>Download</button>}
                </div>
            </div>
        </div>
    );
};

export default ResultPage;
