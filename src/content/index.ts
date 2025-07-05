import { mount } from "svelte";
import ChromophobiaControlsView from "../views/ChromophobiaControlsView.svelte";
import { chromophobiaController } from "../controllers/ChromophobiaController";

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

// Subscribe to settings changes and apply filters
chromophobiaController.getSettings().subscribe((settings) => {
    chromophobiaController.applyFiltersToPage(settings);
});

// Global flag to prevent multiple mounts
let isMounted = false;

// Mount the controls component with error handling
try {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (!isMounted) {
                mountControls();
            }
        });
    } else {
        // If DOM is already ready, mount immediately
        if (!isMounted) {
            mountControls();
        }
    }
} catch (error) {
    console.error('Failed to mount Inclusify controls:', error);
}

function mountControls() {
    try {
        // Check if already mounted
        if (isMounted || document.getElementById('inclusify-controls-container')) {
            console.log('Inclusify controls already mounted');
            return;
        }
        
        // Create a container for the controls
        const container = document.createElement('div');
        container.id = 'inclusify-controls-container';
        container.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2147483646; pointer-events: none; transform: none; filter: none;';
        document.body.appendChild(container);
        
        // Mount the Svelte component
        mount(ChromophobiaControlsView, { target: container });
        isMounted = true;
        console.log('Inclusify controls mounted successfully');
    } catch (error) {
        console.error('Error mounting Inclusify controls:', error);
    }
}
