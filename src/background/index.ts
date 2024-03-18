import {setupContextMenuEvents} from "~events/context-menu";
import {onInstalled} from "~events/installation";
import {Storage} from "@plasmohq/storage";

import {ImageProcessingStage, storageKey} from "~model/image-processing";

setupContextMenuEvents(()=>{console.log("copy")}, ()=>{console.log("save")});

chrome.runtime.onInstalled.addListener(onInstalled);

const storage = new Storage();
storage.set(storageKey, {stage: ImageProcessingStage.EMPTY, imageURL: ""}).then()
storage.set("UsageCount", 0).then();
storage.set("CanShowRating", false).then()
// TODO: Использовать?
export {}
