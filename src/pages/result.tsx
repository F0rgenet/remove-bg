import "../static/styles.css";
import { useNavigate } from "react-router-dom";
import { Storage } from "@plasmohq/storage";
import { useEffect, useState } from "react";
import { sendToBackground } from "@plasmohq/messaging";
import { ContextMenuAction } from "~background";
import {type ImageProcessingData, ProcessingStep, setProcessingStep, storageKey} from "~model/image-processing";

const Result = () => {
    const navigate = useNavigate();
    const storage = new Storage();
    const [imageUrl, setImageUrl] = useState("");
    const [allowDownload, setAllowDownload] = useState(true); // Флаг для разрешения скачивания
    const [action, setAction] = useState(""); // Состояние для отслеживания текущего действия

    useEffect(() => {
        const fetchData = async () => {
            const result: ImageProcessingData = await storage.get(storageKey);
            const imageURL: string = result.imageURL;
            setImageUrl(imageURL);
        };
        fetchData().then();
    }, []);

    useEffect(() => {
        const checkScriptInjection = async () => {
            try {
                const testFunction = ()=>{return 2+2};
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                await chrome.scripting.executeScript({target: {tabId: tab.id}, func: testFunction }).then();
                console.log("Can be injected")
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
        setProcessingStep(ProcessingStep.EMPTY).then();
    };

    const handleCopy = async () => {
        await sendToBackground({ name: "result-action", body: { action: ContextMenuAction.COPY } });
        setAction("Image was copied! ✅");
    };

    const handleSave = async () => {
        if (allowDownload) {
            await sendToBackground({ name: "result-action", body: { action: ContextMenuAction.SAVE } });
            setAction("Image was saved! ✅");
        } else {
            alert("Download is not allowed on this page.");
        }
    };

    const handleOpen = async () => {
        const result: ImageProcessingData = await storage.get(storageKey);
        await chrome.tabs.create({ url: result.imageURL });
        setAction("Image was opened! ✅");
    };

    return (
        <div id="popup-save" className="popup-page">
            <div className="frame">
                <button className="close-button" onClick={handleRedirect}>✖</button>
                <h1 className="title">{action || "Background removed! ✅"}</h1>
                <div id="result-bounding-box">
                    {imageUrl && <img src={imageUrl} alt="Processed Image" id="image-result" />}
                </div>
                <div className="buttons-row">
                    <button className="action-button" style={{ borderRight: allowDownload ? "1px solid #707070" : "none", width: allowDownload ? "50%" : "100%" }} onClick={handleOpen}>Open</button>
                    {allowDownload && <button className="action-button" onClick={handleSave}>Download</button>}
                </div>
            </div>
        </div>
    );
};

export default Result;
