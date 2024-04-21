import React, {useEffect, useState} from "react";
import "../static/styles.css";
import { useNavigate } from "react-router-dom";
import {Storage} from "@plasmohq/storage";

import {
    type ImageProcessingData,
    ImageProcessingStage,
    imageProcessingStorageKey,
    setProcessingStep
} from "~model/image-processing";


const ErrorPage = () => {
    const navigate = useNavigate();
    const storage = new Storage();
    const [reason, setReason] = useState("Unknown error");

    useEffect(() => {
        const getReason = async () => {
            const result: ImageProcessingData = await storage.get(imageProcessingStorageKey);
            setReason(result.failureReason)
        }
        getReason().then();
    }, []);

    const handleRedirect = () => {
        navigate("/home");
        setProcessingStep(ImageProcessingStage.EMPTY).then();
    };

    return (
        <div id="popup-error" className="popup-page">
            <div className="frame">
                <h1 className="title">Error occurred! ❌</h1>
                <a>{reason}</a>
                <div className="buttons-row">
                    <button className="action-button" style={{
                        width: "100%"
                    }} onClick={handleRedirect}>Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;
