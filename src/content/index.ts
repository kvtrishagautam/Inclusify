import { mount } from "svelte";
import ChromophobiaControlsView from "../views/ChromophobiaControlsView.svelte";
import CognitiveControlsView from "../views/CognitiveControlsView.svelte";
import AccessibilityFloatingIcon from "../views/AccessibilityFloatingIcon.svelte";
import DyslexiaFloatingIcon from "../views/DyslexiaFloatingIcon.svelte";
import UnifiedFloatingIcon from "../views/UnifiedFloatingIcon.svelte";
import { chromophobiaController } from "../controllers/ChromophobiaController";
import { cognitiveController } from "../controllers/CognitiveController";

// Import global styles
import "./styles.css";

// --- Chromophobia & Cognitive Controls (v1.1 logic) ---
function applyChromophobiaFilters(settings: any) {
    const html = document.documentElement;
    const body = document.body;
    if (settings.enabled) {
        html.classList.remove('inclusify-enabled', 'inclusify-grayscale', 'inclusify-monochrome', 'inclusify-desaturated');
        html.classList.add('inclusify-enabled');
        switch (settings.colorMode) {
            case 'grayscale': html.classList.add('inclusify-grayscale'); break;
            case 'monochrome': html.classList.add('inclusify-monochrome'); break;
            case 'desaturated': html.classList.add('inclusify-desaturated'); break;
        }
        const filter = `grayscale(${settings.colorMode === 'grayscale' ? 100 : 0}%) ` +
            `saturate(${settings.saturationLevel}%) ` +
            `brightness(${settings.brightness}%) ` +
            `contrast(${settings.contrast}%)` +
            `${settings.colorMode === 'monochrome' ? ' sepia(100%)' : ''}`;
        html.style.filter = filter;
        body.style.filter = filter;
    } else {
        html.classList.remove('inclusify-enabled', 'inclusify-grayscale', 'inclusify-monochrome', 'inclusify-desaturated');
        html.style.filter = '';
        body.style.filter = '';
    }
}

chromophobiaController.getSettings().subscribe((settings) => {
    chromophobiaController.applyFiltersToPage(settings);
    if (!settings.enabled) {
        const html = document.documentElement;
        const body = document.body;
        html.classList.remove('inclusify-enabled', 'inclusify-grayscale', 'inclusify-monochrome', 'inclusify-desaturated');
        html.style.filter = '';
        body.style.filter = '';
    }
});

cognitiveController.getSettings().subscribe((settings) => {
    cognitiveController.applyCognitiveFeaturesToPage(settings);
});

cognitiveController.initializeFeatures();

let isChromophobiaMounted = false;
let isCognitiveMounted = false;
let isAccessibilityMounted = false;
let isDyslexiaMounted = false;
let isUnifiedMounted = false;

function mountUnifiedFloatingIcon() {
    try {
        if (isUnifiedMounted || document.getElementById('inclusify-unified-floating-container')) return;
        const container = document.createElement('div');
        container.id = 'inclusify-unified-floating-container';
        container.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2147483647; pointer-events: none; transform: none; filter: none;';
        document.body.appendChild(container);
        mount(UnifiedFloatingIcon, { target: container });
        isUnifiedMounted = true;
    } catch (error) { console.error('Error mounting Inclusify unified floating icon:', error); }
}

function mountChromophobiaControls() {
    try {
        if (isChromophobiaMounted || document.getElementById('inclusify-chromophobia-controls-container')) return;
        const container = document.createElement('div');
        container.id = 'inclusify-chromophobia-controls-container';
        container.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2147483646; pointer-events: none; transform: none; filter: none;';
        document.body.appendChild(container);
        mount(ChromophobiaControlsView, { target: container });
        isChromophobiaMounted = true;
    } catch (error) { console.error('Error mounting Inclusify chromophobia controls:', error); }
}

function mountCognitiveControls() {
    try {
        if (isCognitiveMounted || document.getElementById('inclusify-cognitive-controls-container')) return;
        const container = document.createElement('div');
        container.id = 'inclusify-cognitive-controls-container';
        container.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2147483646; pointer-events: none; transform: none; filter: none;';
        document.body.appendChild(container);
        mount(CognitiveControlsView, { target: container });
        isCognitiveMounted = true;
    } catch (error) { console.error('Error mounting Inclusify cognitive controls:', error); }
}

function mountAccessibilityControls() {
    try {
        if (isAccessibilityMounted || document.getElementById('inclusify-accessibility-controls-container')) return;
        const container = document.createElement('div');
        container.id = 'inclusify-accessibility-controls-container';
        container.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2147483646; pointer-events: none; transform: none; filter: none;';
        document.body.appendChild(container);
        mount(AccessibilityFloatingIcon, { target: container });
        isAccessibilityMounted = true;
    } catch (error) { console.error('Error mounting Inclusify accessibility controls:', error); }
}

function mountDyslexiaControls() {
    try {
        if (isDyslexiaMounted || document.getElementById('inclusify-dyslexia-controls-container')) return;
        const container = document.createElement('div');
        container.id = 'inclusify-dyslexia-controls-container';
        container.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2147483646; pointer-events: none; transform: none; filter: none;';
        document.body.appendChild(container);
        mount(DyslexiaFloatingIcon, { target: container });
        isDyslexiaMounted = true;
    } catch (error) { console.error('Error mounting Inclusify dyslexia controls:', error); }
}

// Event listeners for unified floating icon
function setupUnifiedIconEventListeners() {
    document.addEventListener('inclusify-open-chromophobia', () => {
        mountChromophobiaControls();
        // Show the chromophobia controls
        const container = document.getElementById('inclusify-chromophobia-controls-container');
        if (container) {
            container.style.pointerEvents = 'auto';
        }
    });

    document.addEventListener('inclusify-open-cognitive', () => {
        mountCognitiveControls();
        // Show the cognitive controls
        const container = document.getElementById('inclusify-cognitive-controls-container');
        if (container) {
            container.style.pointerEvents = 'auto';
        }
    });

    document.addEventListener('inclusify-open-accessibility', () => {
        mountAccessibilityControls();
        // Show the accessibility controls
        const container = document.getElementById('inclusify-accessibility-controls-container');
        if (container) {
            container.style.pointerEvents = 'auto';
        }
    });

    document.addEventListener('inclusify-open-dyslexia', () => {
        mountDyslexiaControls();
        // Show the dyslexia controls
        const container = document.getElementById('inclusify-dyslexia-controls-container');
        if (container) {
            container.style.pointerEvents = 'auto';
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        mountUnifiedFloatingIcon();
        setupUnifiedIconEventListeners();
    });
} else {
    mountUnifiedFloatingIcon();
    setupUnifiedIconEventListeners();
}

// --- Accessibility Scanning (only activated when toggle is enabled) ---
// This will be controlled by the v1.1 sidebar toggle
// The accessibility scanning logic is now integrated into the v1.1 sidebar
// and will only run when the user enables it through the sidebar toggle
