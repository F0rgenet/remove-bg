import { useNavigate } from "react-router-dom";
import hint1 from "data-base64:/assets/hint-1.png"
import hint2 from "data-base64:/assets/hint-2.png"

import "../static/popup.css"

function UploadButton() {
    const navigate = useNavigate();

    function handleClick() {
        navigate("/loading");
    }

    return (
        <button id="upload-button" onClick={handleClick}>Upload image</button>
    )
}

const Main = () => {
    return (
        <div id="popup-main" className="popup-page">
            <h1 className="title">Remove background</h1>
            <div id="upload-area">
                <UploadButton />
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
