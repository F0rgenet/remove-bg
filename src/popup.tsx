import React, {useEffect, useState} from "react";
import {HashRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import {Storage} from "@plasmohq/storage";

import {type ImageProcessingData, ImageProcessingStage, imageProcessingStorageKey} from "~model/image-processing";

import HomePage from "~pages/home";
import ResultPage from "~pages/result";
import ErrorPage from "~pages/error";

import "./static/styles.css";

function IndexPopup() {
    const [route, setRoute] = useState("/");

    useEffect(() => {
        const checkProcessingStage = async () => {
            const storage = new Storage();
            const processingData: ImageProcessingData = await storage.get(imageProcessingStorageKey);

            switch (processingData.stage) {
                case ImageProcessingStage.DONE:
                    setRoute("/result");
                    break;
                case ImageProcessingStage.WORKING:
                    setRoute("/home");
                    break;
                case ImageProcessingStage.EMPTY:
                    setRoute("/home");
                    break;
                case ImageProcessingStage.FAILED:
                    setRoute("/error");
                    break;
                default:
                    throw new Error(`Wrong ImageProcessingStage: ${processingData.stage}`);
            }
        };

        checkProcessingStage().catch(error => {
            console.error("Failed to check processing stage:", error);
            setRoute("/error");
        });
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate replace to={route} />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/result" element={<ResultPage />} />
                <Route path="/error" element={<ErrorPage />} />
            </Routes>
        </Router>
    );
}

export default IndexPopup;