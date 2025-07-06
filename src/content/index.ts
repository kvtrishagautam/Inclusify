import { mount } from "svelte";
import ChromophobiaControlsView from "../views/ChromophobiaControlsView.svelte";
import CognitiveControlsView from "../views/CognitiveControlsView.svelte";
import { chromophobiaController } from "../controllers/ChromophobiaController";
import { cognitiveController } from "../controllers/CognitiveController";

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

// Subscribe to chromophobia settings changes and apply filters
chromophobiaController.getSettings().subscribe((settings) => {
    console.log('Chromophobia settings changed:', settings);
    chromophobiaController.applyFiltersToPage(settings);
    
    // Ensure any existing filters are removed when disabled
    if (!settings.enabled) {
        const html = document.documentElement;
        const body = document.body;
        html.classList.remove('inclusify-enabled', 'inclusify-grayscale', 'inclusify-monochrome', 'inclusify-desaturated');
        html.style.filter = '';
        body.style.filter = '';
    }
});

// Subscribe to cognitive settings changes and apply features
cognitiveController.getSettings().subscribe((settings) => {
    console.log('Cognitive settings changed:', settings);
    cognitiveController.applyCognitiveFeaturesToPage(settings);
});

// Initialize cognitive features when page loads
cognitiveController.initializeFeatures();

// Global flags to prevent multiple mounts
let isChromophobiaMounted = false;
let isCognitiveMounted = false;

// Mount the controls component with error handling
try {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            mountChromophobiaControls();
            mountCognitiveControls();
        });
    } else {
        // If DOM is already ready, mount immediately
        mountChromophobiaControls();
        mountCognitiveControls();
    }
} catch (error) {
    console.error('Failed to mount Inclusify controls:', error);
}

function mountChromophobiaControls() {
    try {
        // Check if already mounted
        if (isChromophobiaMounted || document.getElementById('inclusify-chromophobia-controls-container')) {
            console.log('Inclusify chromophobia controls already mounted');
            return;
        }
        
        // Create a container for the chromophobia controls
        const container = document.createElement('div');
        container.id = 'inclusify-chromophobia-controls-container';
        container.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2147483646; pointer-events: none; transform: none; filter: none;';
        document.body.appendChild(container);
        
        // Mount the Svelte component
        mount(ChromophobiaControlsView, { target: container });
        isChromophobiaMounted = true;
        console.log('Inclusify chromophobia controls mounted successfully');
    } catch (error) {
        console.error('Error mounting Inclusify chromophobia controls:', error);
    }
}

function mountCognitiveControls() {
    try {
        // Check if already mounted
        if (isCognitiveMounted || document.getElementById('inclusify-cognitive-controls-container')) {
            console.log('Inclusify cognitive controls already mounted');
            return;
        }
        
        // Create a container for the cognitive controls
        const container = document.createElement('div');
        container.id = 'inclusify-cognitive-controls-container';
        container.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2147483646; pointer-events: none; transform: none; filter: none;';
        document.body.appendChild(container);
        
        // Mount the Svelte component
        mount(CognitiveControlsView, { target: container });
        isCognitiveMounted = true;
        console.log('Inclusify cognitive controls mounted successfully');
    } catch (error) {
        console.error('Error mounting Inclusify cognitive controls:', error);
    }
}
