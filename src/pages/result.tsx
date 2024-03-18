import "../static/popup.css"
import {useNavigate} from "react-router-dom";
import {ImageProcessingStage, storageKey} from "~model/image-processing";
import {Storage} from "@plasmohq/storage";

const Result = () => {
    const navigate = useNavigate();
    const storage = new Storage();

    const handleRedirect = () => {
        navigate('/home');
        storage.set(storageKey, {stage: ImageProcessingStage.EMPTY, imageURL: ""}).then()
    };

    return (
        <div id="popup-save" className="popup-page">
            <div className="frame">
                <button className="close-button" onClick={handleRedirect}>✖</button>
                <h1 className="title">Background removed!</h1>
                <div id="result-bounding-box"></div>
                <div className="buttons-row">
                    <button className="action-button">Copy</button>
                    <button className="action-button">Download</button>
                </div>
            </div>
        </div>
    )
}

export default Result
