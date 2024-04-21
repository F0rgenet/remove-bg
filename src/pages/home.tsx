import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";

import {type ImageProcessingData, ImageProcessingStage, imageProcessingStorageKey} from "~model/image-processing";
import {useImageUpload} from "~hooks/image-upload";
import RatingComponent from "~components/rating";
import LoadingPage from "~pages/loading"
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

const HomePage = () => {
    const navigate = useNavigate();
    const storage = new Storage();
    const [loading, setLoading] = useState(false);

    const showResults = async (processingResponse: ImageProcessingData) => {
        setLoading(false);
        switch (processingResponse.stage) {
            case ImageProcessingStage.EMPTY:
                console.warn("EMPTY stage in showResults")
                break;
            case ImageProcessingStage.WORKING:
                console.warn("WORKING stage in showResults")
                setLoading(true);
                break;
            case ImageProcessingStage.DONE:
                navigate("/result");
                break;
            case ImageProcessingStage.FAILED:
                navigate("/error");
                break;
        }
    }

    useEffect(() => {
        const checkOnloadState = async () => {
            const result: ImageProcessingData = await storage.get(imageProcessingStorageKey);
            if (result.stage == ImageProcessingStage.WORKING) {
                setLoading(true);
            }
        }
        checkOnloadState().then();
    }, []);

    useEffect(() => {
        const checkResults = async () => {
            const result: ImageProcessingData = await storage.get(imageProcessingStorageKey);
            if (result.stage == ImageProcessingStage.DONE || result.stage == ImageProcessingStage.FAILED) {
                await showResults(result);
            }
        }

        const intervalID = setInterval(() => {
            checkResults().then();
        }, 50)

        return () => clearInterval(intervalID);
    }, [loading]);

    const onFileSelect = async (file: File) => {
        const usageCount = await storage.get("UsageCount");
        await storage.set("UsageCount", usageCount + 1);
        await storage.set("RatingClicked", false);

        setLoading(true);
        await sendToBackground({
            name: "processing",
            body: {
                imageDataURL: await fileToDataURL(file),
                imageFilename: file.name
            }
        })
    };

    const { handleDragOver, handleDragLeave, handleDrop, dragOver } = useImageUpload(onFileSelect);

    if (loading){ return <LoadingPage/> }

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

export default HomePage
