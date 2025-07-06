// IMMEDIATE EXIT if already running - this prevents any duplicate execution
if (window.inclusify_extension_v1) {
    console.warn('Inclusify already running, exiting immediately');
    throw new Error('Inclusify already initialized');
}

import { mount } from "svelte";
import DyslexiaSidebar from "../components/DyslexiaSidebar.svelte";
import { DyslexiaController } from "../controllers/DyslexiaController";

// Content scripts
// https://developer.chrome.com/docs/extensions/mv3/content_scripts/

// Import global styles
import "./styles.css";

// Global flag to prevent multiple initializations
declare global {
    interface Window {
        inclusifyController?: DyslexiaController;
        inclusifyCleanup?: () => void;
        inclusify_extension_v1?: {
            initialized: boolean;
            initializing: boolean;
            scriptId: string;
        };
    }
}

// Use a more reliable singleton pattern
const INCLUSIFY_NAMESPACE = 'inclusify_extension_v1';

// Check if already running in this window
if (window[INCLUSIFY_NAMESPACE]) {
    console.warn('Inclusify already running in this window, exiting immediately');
    throw new Error('Inclusify already initialized');
}

// Mark this window as having Inclusify
window[INCLUSIFY_NAMESPACE] = {
    initialized: false,
    initializing: false,
    scriptId: 'inclusify-' + Math.random().toString(36).substr(2, 9)
};

const SCRIPT_ID = window[INCLUSIFY_NAMESPACE].scriptId;
console.log(`Content script ${SCRIPT_ID} starting on:`, window.location.href);

// Cleanup function for page navigation
function cleanup() {
    console.log(`Cleaning up Inclusify extension (${SCRIPT_ID})...`);
    
    // Remove event listeners
    window.removeEventListener('beforeunload', cleanup);
    
    if (window.inclusifyController) {
        window.inclusifyController.destroy();
        window.inclusifyController = undefined;
    }
    
    // Clear the namespace
    delete window[INCLUSIFY_NAMESPACE];
    
    // Remove sidebar if it exists
    const sidebarRoot = document.getElementById('inclusify-dyslexia-sidebar-root');
    if (sidebarRoot) {
        sidebarRoot.remove();
    }
    
    // Remove any floating icons
    const floatingIcons = document.querySelectorAll('.floating-icon, .sidebar-toggle');
    floatingIcons.forEach(icon => icon.remove());
    
    console.log(`Inclusify cleanup complete (${SCRIPT_ID})`);
}

// Store cleanup function globally
window.inclusifyCleanup = cleanup;

// Check if we should initialize
if (window.location.protocol === 'chrome:' || window.location.protocol === 'chrome-extension:') {
    console.log(`Skipping content script ${SCRIPT_ID} on chrome:// or chrome-extension:// page`);
} else if (document.getElementById('inclusify-dyslexia-sidebar-root')) {
    console.warn(`Inclusify Dyslexia Sidebar already mounted. Script ${SCRIPT_ID} skipping.`);
} else {
    // Set initializing flag
    window[INCLUSIFY_NAMESPACE].initializing = true;
    
    // Create initialization promise
    const initPromise = initializeExtension().finally(() => {
        window[INCLUSIFY_NAMESPACE].initializing = false;
        window[INCLUSIFY_NAMESPACE].initialized = true;
    });
    
    // Listen for page unload to cleanup
    window.addEventListener('beforeunload', cleanup);
}

async function initializeExtension(): Promise<void> {
    console.log(`Initializing extension (${SCRIPT_ID}) on:`, window.location.href);
    
    // Wait for document to be ready
    if (document.readyState === 'loading') {
        await new Promise<void>((resolve) => {
            document.addEventListener('DOMContentLoaded', () => resolve());
        });
    }
    
    // Double-check we haven't already initialized
    if (window.inclusifyController) {
        console.warn(`Controller already exists. Script ${SCRIPT_ID} skipping initialization.`);
        return;
    }
    
    // Check for CSP restrictions
    const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (metaCSP) {
        console.log('CSP detected:', metaCSP.getAttribute('content'));
    }
    
    // Check if we're on a CSP-restricted site
    const isCSPRestricted = metaCSP || 
        window.location.hostname.includes('linkedin.com') ||
        window.location.hostname.includes('gmail.com') ||
        window.location.hostname.includes('google.com') ||
        window.location.hostname.includes('facebook.com') ||
        window.location.hostname.includes('twitter.com');
    
    if (isCSPRestricted) {
        console.log('CSP-restricted site detected, using fallback methods');
    }
    
    // Initialize the dyslexia controller (singleton)
    const controller = DyslexiaController.getInstance();
    window.inclusifyController = controller;
    
    // Initialize the controller only once
    controller.initialize().then(() => {
        console.log('Dyslexia controller initialized successfully');
        
        // Mount the dyslexia sidebar only if not already present
        if (!document.getElementById('inclusify-dyslexia-sidebar-root')) {
            const sidebarRoot = document.createElement('div');
            sidebarRoot.id = 'inclusify-dyslexia-sidebar-root';
            document.body.appendChild(sidebarRoot);
            mount(DyslexiaSidebar, { target: sidebarRoot });
            console.log('Dyslexia sidebar mounted');
        } else {
            console.warn('Sidebar root already exists, skipping mount.');
        }
        
        // Add global function for manual CSS injection
        (window as any).applyDyslexiaStyles = function(cssText: string) {
            try {
                document.head.insertAdjacentHTML('beforeend', `<style>${cssText}</style>`);
                console.log('✅ Dyslexia styles applied successfully!');
                return true;
            } catch (error) {
                console.error('❌ Failed to apply styles:', error);
                return false;
            }
        };
        
        // Add global function to force refresh styling
        (window as any).refreshDyslexiaStyling = function() {
            const settings = controller.getSettingsStore();
            settings.update(currentSettings => {
                if (currentSettings.enabled) {
                    controller.getDOMController().refreshStyling(currentSettings);
                }
                return currentSettings;
            });
            console.log('✅ Dyslexia styling refreshed!');
        };
        
        // Add global function for debugging
        (window as any).debugDyslexiaHelper = function() {
            controller.getDOMController().debugStyling();
        };
        
        // Add global function to check current settings
        (window as any).getDyslexiaSettings = function() {
            let currentSettings: any;
            const unsubscribe = controller.getSettingsStore().subscribe(settings => {
                currentSettings = settings;
            });
            unsubscribe();
            console.log('Current dyslexia settings:', currentSettings);
            return currentSettings;
        };
        
        // Add global function to cleanup
        (window as any).cleanupInclusify = cleanup;
        
        console.log('💡 Tip: Use applyDyslexiaStyles(cssText) in console to manually inject CSS');
        console.log('💡 Tip: Use refreshDyslexiaStyling() in console to force refresh styling');
        console.log('💡 Tip: Use debugDyslexiaHelper() in console to debug the extension');
        console.log('💡 Tip: Use getDyslexiaSettings() in console to check current settings');
        console.log('💡 Tip: Use cleanupInclusify() in console to cleanup the extension');
        
        // Force apply settings after a short delay to ensure DOM is ready
        setTimeout(() => {
            const settings = controller.getSettingsStore();
            settings.update(currentSettings => {
                if (currentSettings.enabled) {
                    console.log('Force applying settings after DOM ready...');
                    console.log('Settings being applied:', currentSettings);
                    controller.getDOMController().refreshStyling(currentSettings);
                    console.log('✅ Settings applied successfully!');
                } else {
                    console.log('Extension is disabled, not applying settings');
                }
                return currentSettings;
            });
        }, 1000);
    }).catch((error) => {
        console.error('Failed to initialize dyslexia controller:', error);
        // Reset flag on error so we can try again
        window.inclusifyInitialized = false;
        window.inclusifyController = undefined;
    });
}
