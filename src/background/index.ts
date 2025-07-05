import { chromophobiaModel } from "../models/ChromophobiaModel";

// Background service workers
// https://developer.chrome.com/docs/extensions/mv3/service_workers/

chrome.runtime.onInstalled.addListener(() => {
    console.log('Inclusify - Chromophobia-Friendly Extension installed');
    
    // Initialize default settings if not already set
    chrome.storage.sync.get('chromophobiaSettings').then((result) => {
        if (!result.chromophobiaSettings) {
            chromophobiaModel.resetToDefaults();
        }
    });
});

// Handle extension icon click to open side panel
chrome.action.onClicked.addListener((tab) => {
    if (tab.id) {
        chrome.sidePanel.open({ tabId: tab.id });
    }
});

// NOTE: If you want to toggle the side panel from the extension's action button,
// you can use the following code:
// chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
//    .catch((error) => console.error(error));
