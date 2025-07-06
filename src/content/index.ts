import { mount } from "svelte";
import ChromophobiaControlsView from "../views/ChromophobiaControlsView.svelte";
import CognitiveControlsView from "../views/CognitiveControlsView.svelte";
import AccessibilityFloatingIcon from "../views/AccessibilityFloatingIcon.svelte";
import DyslexiaFloatingIcon from "../views/DyslexiaFloatingIcon.svelte";
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        mountChromophobiaControls();
        mountCognitiveControls();
        mountAccessibilityControls();
        mountDyslexiaControls();
    });
} else {
    mountChromophobiaControls();
    mountCognitiveControls();
    mountAccessibilityControls();
    mountDyslexiaControls();
}

// --- Accessibility Scanning (only activated when toggle is enabled) ---
// This will be controlled by the v1.1 sidebar toggle
// The accessibility scanning logic is now integrated into the v1.1 sidebar
// and will only run when the user enables it through the sidebar toggle
