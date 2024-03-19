import React, { useEffect, useState } from "react";
import { HashRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { Storage } from "@plasmohq/storage";

import { type ImageProcessingData, ImageProcessingStage, storageKey } from "~model/image-processing";

import Home from "~pages/home";
import Loading from "~pages/loading";
import Result from "~pages/result";

import "./static/styles.css";

function IndexPopup() {
    const [route, setRoute] = useState("/");

    useEffect(() => {
        const checkProcessingStage = async () => {
            const storage = new Storage();
            const processingData: ImageProcessingData = await storage.get(storageKey);

            switch (processingData.stage) {
                case ImageProcessingStage.DONE:
                    setRoute("/result");
                    break;
                case ImageProcessingStage.WORKING:
                    setRoute("/loading");
                    break;
                case ImageProcessingStage.EMPTY:
                    setRoute("/home");
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
                <Route path="/home" element={<Home />} />
                <Route path="/loading" element={<Loading />} />
                <Route path="/result" element={<Result />} />
                <Route path="/error" element={<div>Error loading processing stage</div>} />
            </Routes>
        </Router>
    );
}

export default IndexPopup;