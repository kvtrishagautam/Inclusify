import { chromophobiaModel } from "../models/ChromophobiaModel";

// Background service workers
// https://developer.chrome.com/docs/extensions/mv3/service_workers/

chrome.runtime.onInstalled.addListener(() => {
    console.log('Inclusify - Chromophobia-Friendly Extension installed');
    console.log('Inclusify - Dyslexia Helper functionality available');
    // Initialize default settings if not already set
    chrome.storage.sync.get('chromophobiaSettings').then((result) => {
        if (!result.chromophobiaSettings) {
            chromophobiaModel.resetToDefaults();
        }
    });
});
