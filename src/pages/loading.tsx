import loadingGif from "data-base64:/assets/loading.gif"

import "../static/styles.css"

const Loading = () => {
    return (
        <div id="popup-loading" className="popup-page">
            <div className="frame">
                <h1 className="title">Removing background...</h1>
                <img src={loadingGif} alt="loading" id="loading-gif"/>
            </div>
        </div>
    )
}

export default Loading
