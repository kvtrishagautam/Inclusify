import { mount } from "svelte";
import ChromophobiaControls from "../components/ChromophobiaControls.svelte";
import { chromophobiaSettings } from "../storage";

// Content scripts
// https://developer.chrome.com/docs/extensions/mv3/content_scripts/

// Import global styles
import "./styles.css";

// Function to apply chromophobia filters to the page
function applyChromophobiaFilters(settings: any) {
    const html = document.documentElement;
    const body = document.body;
    
    if (settings.enabled) {
        // Remove any existing classes
        html.classList.remove('inclusify-enabled', 'inclusify-grayscale', 'inclusify-monochrome', 'inclusify-desaturated');
        
        // Add the enabled class
        html.classList.add('inclusify-enabled');
        
        // Apply specific color mode
        switch (settings.colorMode) {
            case 'grayscale':
                html.classList.add('inclusify-grayscale');
                break;
            case 'monochrome':
                html.classList.add('inclusify-monochrome');
                break;
            case 'desaturated':
                html.classList.add('inclusify-desaturated');
                break;
        }
        
        // Apply custom filter with user settings
        const filter = `grayscale(${settings.colorMode === 'grayscale' ? 100 : 0}%) 
                       saturate(${settings.saturationLevel}%) 
                       brightness(${settings.brightness}%) 
                       contrast(${settings.contrast}%)
                       ${settings.colorMode === 'monochrome' ? 'sepia(100%)' : ''}`;
        
        html.style.filter = filter;
        body.style.filter = filter;
        
    } else {
        // Remove all chromophobia-related classes and styles
        html.classList.remove('inclusify-enabled', 'inclusify-grayscale', 'inclusify-monochrome', 'inclusify-desaturated');
        html.style.filter = '';
        body.style.filter = '';
    }
}

// Subscribe to settings changes
chromophobiaSettings.subscribe((settings) => {
    applyChromophobiaFilters(settings);
});

// Mount the controls component
mount(ChromophobiaControls, { target: document.body });
