import React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Main from "~pages/main";
import Loading from "~pages/loading";
import Result from "~pages/result";


import "./static/popup.css"

const showLoading = false;

function IndexPopup() {
    return (
        <Router>
            <Routes>
                {showLoading ? (
                    <Route path="/" element={<Navigate replace to="/loading" />} />
                ) : (
                    <Route path="/" element={<Navigate replace to="/home" />} />
                )}
                <Route path="/home" element={<Main />}/>
                <Route path="/loading" element={<Loading />}/>
                <Route path="/result" element={<Result />}/>
            </Routes>
        </Router>
    )
}

export default IndexPopup
