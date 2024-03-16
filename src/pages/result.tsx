import "../static/popup.css"

const Result = () => {
    return (
        <div id="popup-save" className="popup-page">
            <div className="frame">
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
