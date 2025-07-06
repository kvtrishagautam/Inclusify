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

// Function to ensure videos are properly filtered with CSS filters
function ensureVideoFiltering() {
    if (document.documentElement.classList.contains('inclusify-enabled')) {
        // Apply grayscale filter to videos
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            const videoElement = video as HTMLElement;
            videoElement.style.filter = 'grayscale(100%)';
            videoElement.style.webkitFilter = 'grayscale(100%)';
        });
        
        // Apply grayscale filter to GIFs
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            const imgElement = img as HTMLElement;
            const src = imgElement.getAttribute('src') || '';
            if (src.toLowerCase().includes('.gif')) {
                imgElement.style.filter = 'grayscale(100%)';
                imgElement.style.webkitFilter = 'grayscale(100%)';
            }
        });
        
        // Handle iframe videos with very subtle overlay
        const iframes = document.querySelectorAll('iframe[src*="youtube"], iframe[src*="vimeo"], iframe[src*="dailymotion"]');
        iframes.forEach(iframe => {
            // Check if overlay already exists
            if (!iframe.querySelector('.inclusify-iframe-overlay')) {
                // Create a very subtle overlay
                const overlay = document.createElement('div');
                overlay.className = 'inclusify-iframe-overlay';
                overlay.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(128, 128, 128, 0.1);
                    pointer-events: none;
                    z-index: 1;
                `;
                
                // Make sure iframe container is positioned relative
                const iframeElement = iframe as HTMLElement;
                if (getComputedStyle(iframeElement).position === 'static') {
                    iframeElement.style.position = 'relative';
                }
                
                iframeElement.appendChild(overlay);
            }
        });
    }
}

// Mutation observer to catch dynamically added videos
const videoObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node as Element;
                    if (element.tagName === 'VIDEO' || element.querySelector('video')) {
                        // Small delay to ensure the video is fully loaded
                        setTimeout(ensureVideoFiltering, 100);
                    }
                }
            });
        }
    });
});

// Start observing for video additions
videoObserver.observe(document.body, {
    childList: true,
    subtree: true
});

// Initial video filtering
ensureVideoFiltering();

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
