// Background service workers
// https://developer.chrome.com/docs/extensions/mv3/service_workers/

chrome.runtime.onInstalled.addListener(() => {
    console.log('Dyslexia Helper extension installed');
});

// NOTE: If you want to toggle the side panel from the extension's action button,
// you can use the following code:
// chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
//    .catch((error) => console.error(error));
