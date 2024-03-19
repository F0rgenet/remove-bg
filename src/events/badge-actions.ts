export enum BadgeTextLevel {
    PROGRESS = "#FFE816",
    RESULT = "#8FD64D",
    ERROR = "#FA8D75"
}

export default function setBadgeText(text: string, level: BadgeTextLevel = BadgeTextLevel.PROGRESS) {
    chrome.action.setBadgeBackgroundColor({ color: level }).then();
    chrome.action.setBadgeTextColor({ color: "#000000" }).then();
    chrome.action.setBadgeText({ text: text }).then();
}