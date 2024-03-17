import React from 'react';
import { useNavigate } from "react-router-dom";

import {type ImageProcessingData, ImageProcessingStage, storageKey } from "~model/image-processing";
import ImageProcessor from "~model/image-processing";
import { useImageUpload } from "~hooks/image-upload";
import { getDataURL } from "~utils";

import hint1 from "data-base64:/assets/hint-1.png"
import hint2 from "data-base64:/assets/hint-2.png"

import "../static/popup.css";
import {Storage} from "@plasmohq/storage";


function UploadButton({ onFileSelect }) {
    const navigate = useNavigate();

    const handleClick = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        fileInput.onchange = (event) => {
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

const Main = () => {
    const navigate = useNavigate();

    const onFileSelect = async (file: File) => {
        const imageProcessor = new ImageProcessor();
        const storage = new Storage();
        const dataURL = await getDataURL(file);
        if (!dataURL){
            return;
        }

        await storage.set(storageKey, {imageURL: file, stage: ImageProcessingStage.WORKING});
        navigate("/loading");
        const processingResponse = await imageProcessor.processImage(dataURL, file.name);
        if (processingResponse.success) {
            const processedImageURL = processingResponse.resultURL;
            await storage.set(storageKey, {imageURL: processedImageURL, stage: ImageProcessingStage.DONE})
            navigate("/result");
        } else {
            navigate("/error")
            // TODO: Add params
        }
    };

    const { handleDragOver, handleDragLeave, handleDrop, dragOver} = useImageUpload(onFileSelect);

    return (
        <div id="popup-main" className="popup-page">
            <h1 className="title">Remove background</h1>
            <div id="upload-area" onDragOver={handleDragOver} onDragLeave={handleDragLeave}
                 onDrop={handleDrop} className={dragOver ? 'upload-drag-over' : ''}>
                <UploadButton onFileSelect={onFileSelect}/>
                <u className="upload-hint">or just bring it here</u>
            </div>
            <a className="tooltip-text">Or right-click on any picture in the browser</a>
            <div className="tooltip-images">
                <img className="tooltip-image" id="image-tooltip-1" alt="hint" src={hint1}/>
                <img className="tooltip-image" id="image-tooltip-2" alt="hint" src={hint2}/>
            </div>
        </div>
    )
}

export default Main
