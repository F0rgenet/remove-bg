import {createContextMenu} from "~events/context-menu";


export function onInstalled(installationDetails: chrome.runtime.InstalledDetails): void {
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