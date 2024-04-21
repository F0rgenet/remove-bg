import {createContextMenu} from "~events/context-menu";
import {ImageProcessingStage, setProcessingStep} from "~model/image-processing";
import {Storage} from "@plasmohq/storage";

export function onInstalled(installationDetails: chrome.runtime.InstalledDetails): void {
    const storage = new Storage();
    setProcessingStep(ImageProcessingStage.EMPTY).then();
    storage.set("UsageCount", 0).then();
    storage.set("RatingClicked", false).then();
    createContextMenu();
    const installReason = installationDetails.reason
    switch (installReason){
        case chrome.runtime.OnInstalledReason.INSTALL:
            welcomeUser();
            break;
        case chrome.runtime.OnInstalledReason.UPDATE:
            break;
        case chrome.runtime.OnInstalledReason.CHROME_UPDATE:
            break;
    }
}

function welcomeUser(){
    chrome.runtime.setUninstallURL("https://docs.google.com/forms/d/e/1FAIpQLScibh56B-shqVml8c3oU-wij-FBTOEZq7NkvDJhOsgGJuxP7w/viewform");
    chrome.tabs.create({url: "https://extension.tilda.ws/removebg"}).then(()=>{});
}