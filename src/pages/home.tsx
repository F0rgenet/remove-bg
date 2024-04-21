import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";

import {type ImageProcessingResponse} from "~model/image-processing";
import {useImageUpload} from "~hooks/image-upload";
import RatingComponent from "~components/rating";
import Loading from "~pages/loading"
import {fileToDataURL} from "~utils";

import {Storage} from "@plasmohq/storage";
import {sendToBackground} from "@plasmohq/messaging"

import "../static/styles.css";
import usageHint from "data-base64:/assets/usage-hint.png"


function UploadButton({onFileSelect}) {
    const handleClick = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        fileInput.onchange = () => {
            const files = fileInput.files;
            if (files && files[0]) {
                onFileSelect(files[0]);
            }
        };
        fileInput.click();
    };

    return (
        <button id="upload-button" onClick={handleClick}>Upload image</button>
    );
}

const Home = () => {
    const navigate = useNavigate();
    const storage = new Storage();
    const [loading, setLoading] = useState(false);

    const onFileSelect = async (file: File) => {
        const usageCount = await storage.get("UsageCount");
        await storage.set("UsageCount", usageCount + 1);
        await storage.set("RatingClicked", false);

        setLoading(true);
        const processingResponse: ImageProcessingResponse = (await sendToBackground({
            name: "processing",
            body: {
                imageDataURL: await fileToDataURL(file),
                imageFilename: file.name
            }
        })).result
        setLoading(false);
        if (processingResponse.success) {
            navigate("/result");
        } else {
            navigate("/error");
        }
    };

    const { handleDragOver, handleDragLeave, handleDrop, dragOver } = useImageUpload(onFileSelect);

    if (loading){ return <Loading/> }

    return (
        <div id="popup-main" className="popup-page">
            <h1 className="title">Remove background</h1>
            <div id="upload-area" onDragOver={handleDragOver} onDragLeave={handleDragLeave}
                 onDrop={handleDrop} className={dragOver ? 'upload-drag-over' : ''}>
                <UploadButton onFileSelect={onFileSelect} />
                <u className="upload-hint">or just bring it here</u>
            </div>
            <a className="tooltip-text" id="upload-tooltip">Or right-click on any picture in the<br />browser</a>
            <div className="tooltip-images">
                <img className="tooltip-image" id="image-tooltip-1" alt="hint" src={usageHint} />
            </div>
            <RatingComponent/>
        </div>
    )
}

export default Home
