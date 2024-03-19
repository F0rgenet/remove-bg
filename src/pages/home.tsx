import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";

import {type ImageProcessingResponse} from "~model/image-processing";
import {useImageUpload} from "~hooks/image-upload";
import {fileToDataURL, imageURLtoFile} from "~utils";

import {Storage} from "@plasmohq/storage";
import {sendToBackground, sendToContentScript} from "@plasmohq/messaging"
import { usePort } from "@plasmohq/messaging/hook"

import "../static/styles.css";
import hint1 from "data-base64:/assets/hint-1.png"
import hint2 from "data-base64:/assets/hint-2.png"

function Star({ filled, index, onClick, onMouseEnter, onMouseLeave  }) {
    const colors = ["#6C60F7", "#8B79FF", "#AA93FF", "#C8AEFF", "#E7CAFF"]

    return (
        <span className="rating-star" style={{ color: filled?colors[index]:"#6C60F7" }} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            {filled ? "★" : "☆"}
        </span>
    );
}

function RatingComponent({ active, setShowRating }) {
    if (!active) { return; }

    const [rating, setRating] = React.useState(0);

    const handleStarClick = async (starIndex: number) => {
        let url = "https://forms.gle/HDEJhEhkEEcZhvc1A";
        if (starIndex > 2) {
            url = "https://google.com";
        }
        chrome.tabs.create({ url: url }).then()
        const storage = new Storage();
        await storage.set("UsageCount", 0);
        setShowRating(false);
    };

    const handleStarHover = (starIndex: number) => {
        setRating(starIndex + 1);
    };

    const handleStarLeave = () => {
        setRating(0);
    }


    return (
        <div className="rating">
            <hr id="rating-separator"/>
            <a className="tooltip-text" id="rating-tooltip">Rate us:</a>
            <div className="rating-stars">
                {[...Array(5)].map((_, index) => (
                    <Star
                        key={index}
                        filled={index < rating}
                        index={index}
                        onClick={() => handleStarClick(index)}
                        onMouseEnter={() => handleStarHover(index)}
                        onMouseLeave={() => handleStarLeave()}
                    />
                ))}
            </div>
        </div>
    )
}

function UploadButton({onFileSelect}) {
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

const Home = () => {
    const navigate = useNavigate();
    const storage = new Storage();
    const [showRating, setShowRating] = useState(false);
    const [canShowRating, setCanShowRating] = useState(true);
    const [usageCount, setUsageCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            const showedRatingData: boolean = await storage.get("CanShowRating");
            if (showedRatingData) { setCanShowRating(false); }
            const count: number = await storage.get("UsageCount");
            setUsageCount(count);
            if (count === 10 && canShowRating) { setShowRating(true); }
            console.log(`COUNT: ${count} CAN_SHOW: ${canShowRating} SHOW: ${showRating}`);
        };
        fetchData().then();
    }, []);

    const onFileSelect = async (file: File) => {
        await storage.set("UsageCount", usageCount + 1);

        navigate("/loading");
        const processingResponse: ImageProcessingResponse = (await sendToBackground({
            name: "processing",
            body: {
                imageDataURL: await fileToDataURL(file),
                imageFilename: file.name
            }
        })).result
        if (processingResponse.success) {
            navigate("/result");
        } else {
            navigate("/error");
        }
    };

    const { handleDragOver, handleDragLeave, handleDrop, dragOver } = useImageUpload(onFileSelect);

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
                <img className="tooltip-image" id="image-tooltip-1" alt="hint" src={hint1} />
                <img className="tooltip-image" id="image-tooltip-2" alt="hint" src={hint2} />
            </div>
            <RatingComponent active={showRating} setShowRating={setShowRating}></RatingComponent>
        </div>
    )
}

export default Home