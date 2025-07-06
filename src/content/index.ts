import { mount } from "svelte";
import Overlay from "../components/Overlay.svelte";
import { AccessibilityController } from "../controllers/AccessibilityController";

// Content scripts
// https://developer.chrome.com/docs/extensions/mv3/content_scripts/

// Some global styles on the page
import "./styles.css";

// Initialize accessibility controller
const accessibilityController = new AccessibilityController();

// Mount the accessibility overlay
mount(Overlay, { target: document.body, props: { accessibilityController } });

// Enhanced debouncing for SPAs like WhatsApp
let auditTimeout: NodeJS.Timeout | null = null;
let lastAuditTime = 0;
const AUDIT_COOLDOWN = 5000; // Increased to 5 seconds for SPAs
const DEBOUNCE_DELAY = 1000; // Increased to 1 second

// Track DOM changes to detect SPA behavior
let domChangeCount = 0;
let lastDomChangeTime = 0;
const DOM_CHANGE_THRESHOLD = 10; // If more than 10 changes in 5 seconds, treat as SPA
const SPA_DETECTION_WINDOW = 5000;

const debouncedAudit = () => {
    if (!accessibilityController.isAccessibilityEnabled()) {
        return;
    }

    const now = Date.now();
    
    // Check if we're in a high-frequency DOM change period (SPA)
    if (now - lastDomChangeTime < SPA_DETECTION_WINDOW) {
        domChangeCount++;
        
        // If too many changes, increase cooldown
        if (domChangeCount > DOM_CHANGE_THRESHOLD) {
            console.log('SPA detected - increasing audit cooldown');
            return; // Skip audit entirely during high-frequency periods
        }
    } else {
        // Reset counters if outside detection window
        domChangeCount = 0;
    }
    
    lastDomChangeTime = now;

    if (now - lastAuditTime < AUDIT_COOLDOWN) {
        console.log('Audit skipped - cooldown period active');
        return;
    }

    if (auditTimeout) {
        clearTimeout(auditTimeout);
    }

    auditTimeout = setTimeout(() => {
        lastAuditTime = Date.now();
        console.log('Running accessibility audit...');
        accessibilityController.refreshAudit().catch(error => {
            console.error('Audit failed:', error);
        });
    }, DEBOUNCE_DELAY);
};

// Listen for DOM changes to re-run accessibility audit
const observer = new MutationObserver((mutations) => {
    // Only trigger audit for meaningful changes
    const hasSignificantChanges = mutations.some(mutation => {
        // Skip text changes and attribute changes that don't affect accessibility
        if (mutation.type === 'characterData') {
            return false;
        }
        
        // Skip attribute changes that are unlikely to affect accessibility
        if (mutation.type === 'attributes') {
            const attrName = mutation.attributeName;
            if (attrName && ['class', 'style', 'data-', 'aria-hidden'].some(prefix => attrName.startsWith(prefix))) {
                return false;
            }
        }
        
        // Skip changes to elements that are likely to be dynamic (SPA content)
        if (mutation.type === 'childList') {
            const target = mutation.target as Element;
            if (target && (
                target.classList.contains('message') ||
                target.classList.contains('chat') ||
                target.classList.contains('conversation') ||
                target.id?.includes('message') ||
                target.id?.includes('chat')
            )) {
                return false; // Skip chat/message updates
            }
        }
        
        return true;
    });

    if (hasSignificantChanges) {
        debouncedAudit();
    }
});

// Start observing DOM changes with more specific filters
observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['alt', 'aria-', 'role', 'tabindex', 'id', 'name', 'title', 'lang']
});

// Add a manual audit trigger for testing
(window as any).triggerAccessibilityAudit = () => {
    console.log('Manual audit triggered');
    accessibilityController.refreshAudit();
};
