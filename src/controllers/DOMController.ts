import type { DyslexiaSettings } from '../models/DyslexiaSettings';

export class DOMController {
    private overlayElement: HTMLElement | null = null;
    private focusElement: HTMLElement | null = null;
    private lineFocusElement: HTMLElement | null = null;
    private originalStyles: Map<HTMLElement, string> = new Map();
    private static hasShownIndicator = false; // Static flag
    private static instance: DOMController | null = null;
    private lastEnabledState: boolean = false;
    private observer: MutationObserver | null = null;
    private lineFocusMoveHandler: ((event: MouseEvent) => void) | null = null;
    private focusModeMouseHandler: ((event: MouseEvent) => void) | null = null;
    private focusModeClickHandler: ((event: MouseEvent) => void) | null = null;
    private hoverHighlightHandler: ((event: MouseEvent) => void) | null = null;

    private constructor() {
        console.log('DOMController: Instance created');
    }

    public static getInstance(): DOMController {
        if (!DOMController.instance) {
            DOMController.instance = new DOMController();
        }
        return DOMController.instance;
    }

    public applyFontSettings(settings: DyslexiaSettings): void {
        if (typeof document === 'undefined') return;
        
        console.log('Applying font settings:', settings);
        
        const fontFamily = this.getFontFamily(settings.customFont);
        const fontSize = settings.fontSize / 100;
        const lineHeight = settings.lineSpacing / 100;
        const wordSpacing = settings.wordSpacing / 100;
        const letterSpacing = settings.letterSpacing / 100;

        // Apply styles to all text elements except sidebar
        this.applyStylesToTextElements({
            fontFamily,
            fontSize,
            lineHeight,
            wordSpacing,
            letterSpacing
        });
        
        console.log('Font settings applied to main content only');
        
        // Only show indicator if just enabled (transition from false to true)
        if (settings.enabled && !this.lastEnabledState && !DOMController.hasShownIndicator) {
            this.showSettingsIndicator();
            DOMController.hasShownIndicator = true;
        }
        this.lastEnabledState = settings.enabled;
    }

    // Separate method for applying styles to new content without showing indicator
    private applyFontSettingsToNewContent(settings: DyslexiaSettings): void {
        if (typeof document === 'undefined') return;
        
        const fontFamily = this.getFontFamily(settings.customFont);
        const fontSize = settings.fontSize / 100;
        const lineHeight = settings.lineSpacing / 100;
        const wordSpacing = settings.wordSpacing / 100;
        const letterSpacing = settings.letterSpacing / 100;

        // Apply styles to all text elements except sidebar
        this.applyStylesToTextElements({
            fontFamily,
            fontSize,
            lineHeight,
            wordSpacing,
            letterSpacing
        });
        
        console.log('Font settings applied to new content');
    }

    private applyStylesToTextElements(styles: {
        fontFamily: string;
        fontSize: number;
        lineHeight: number;
        wordSpacing: number;
        letterSpacing: number;
    }): void {
        console.log('Applying styles to text elements with exclusion of toggle menu...');
        
        let styledCount = 0;
        let skippedCount = 0;
        
        // Target ALL text elements on the page, not just within specific containers
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, li, td, th, label, input, textarea, button, a');
        
        console.log(`Found ${textElements.length} text elements to process`);
        
        textElements.forEach(element => {
            const el = element as HTMLElement;
            
            // Skip if element is part of the extension
            if (this.isExtensionElement(el)) {
                skippedCount++;
                return;
            }
            
            try {
                el.style.setProperty('font-family', styles.fontFamily, 'important');
                el.style.setProperty('font-size', `${styles.fontSize}em`, 'important');
                el.style.setProperty('line-height', `${styles.lineHeight * 1.5}`, 'important');
                el.style.setProperty('word-spacing', `${styles.wordSpacing * 0.1}em`, 'important');
                el.style.setProperty('letter-spacing', `${styles.letterSpacing * 0.05}em`, 'important');
                styledCount++;
            } catch (error) {
                console.warn('Failed to style element:', el, error);
            }
        });
        
        console.log(`Styles applied to ${styledCount} text elements, ${skippedCount} elements skipped`);
    }

    private isExtensionElement(element: Element): boolean {
        // Check if element is part of the extension (sidebar)
        return !!(
            element.closest('#inclusify-dyslexia-sidebar-root') ||
            element.closest('[data-dyslexia-sidebar]') ||
            element.closest('.dyslexia-sidebar') ||
            element.closest('.sidebar-overlay') ||
            element.closest('.floating-icon') ||
            element.closest('.sidebar-toggle') ||
            element.closest('.setting-group') ||
            element.closest('.setting-row') ||
            element.closest('.toggle-label') ||
            element.closest('.action-btn') ||
            element.closest('.floating-icon-text') ||
            element.closest('.sidebar-header') ||
            element.closest('.sidebar-content') ||
            element.closest('.close-btn') ||
            element.closest('.dyslexia-hover-highlight') ||
            element.id === 'dyslexia-settings-indicator' ||
            element.id === 'dyslexia-manual-injection-notice' ||
            element.id === 'dyslexia-color-overlay' ||
            element.id === 'dyslexia-focus-highlight' ||
            element.id === 'dyslexia-line-focus'
        );
    }

    public applyColorSettings(settings: DyslexiaSettings): void {
        if (typeof document === 'undefined') return;
        
        if (settings.colorOverlay) {
            this.createColorOverlay(settings);
        } else {
            this.removeColorOverlay();
        }

        if (settings.highContrast) {
            this.applyHighContrast();
        } else {
            this.removeHighContrast();
        }
    }

    public applyReadingAids(settings: DyslexiaSettings): void {
        if (typeof document === 'undefined') return;
        
        if (settings.focusMode) {
            this.enableFocusMode();
        } else {
            this.disableFocusMode();
        }

        if (settings.simplifyPage) {
            this.simplifyPage();
        } else {
            this.restorePage();
        }

        if (settings.highlightLinks) {
            this.highlightLinks();
        } else {
            this.removeLinkHighlights();
        }

        // Enable hover highlighting by default when extension is enabled
        if (settings.enabled) {
            this.enableHoverHighlighting();
        } else {
            this.disableHoverHighlighting();
        }

        // NEW FEATURES
        if (settings.readingMode) {
            this.enableReadingMode(settings);
        } else {
            this.disableReadingMode();
        }

        if (settings.dyslexiaRuler) {
            this.enableDyslexiaRuler(settings);
        } else {
            this.disableDyslexiaRuler();
        }

        if (settings.speedReading) {
            this.enableSpeedReading(settings);
        } else {
            this.disableSpeedReading();
        }

        if (settings.textHighlighting) {
            this.enableTextHighlighting(settings);
        } else {
            this.disableTextHighlighting();
        }

        if (settings.textStroke) {
            this.enableTextStroke(settings);
        } else {
            this.disableTextStroke();
        }

        if (settings.emphasizeLinks) {
            this.enableEmphasizeLinks(settings);
        } else {
            this.disableEmphasizeLinks();
        }

        if (settings.lineFocus) {
            this.enableLineFocus(settings);
        } else {
            this.disableLineFocus();
        }

        if (settings.readingGuide) {
            this.enableReadingGuide(settings);
        } else {
            this.disableReadingGuide();
        }

        if (settings.magnifier) {
            this.enableMagnifier(settings);
        } else {
            this.disableMagnifier();
        }

        if (settings.cursorControl) {
            this.enableCursorControl(settings);
        } else {
            this.disableCursorControl();
        }
    }

    private getFontFamily(fontName: string): string {
        const fontMap: Record<string, string> = {
            'OpenDyslexic': '"OpenDyslexic", "Comic Sans MS", sans-serif',
            'Comic Sans': '"Comic Sans MS", "Comic Sans", cursive',
            'Arial': 'Arial, sans-serif',
            'Verdana': 'Verdana, Geneva, sans-serif',
            'Tahoma': 'Tahoma, Geneva, sans-serif',
            'Times New Roman': '"Times New Roman", Times, serif',
            'Georgia': 'Georgia, serif',
            'Trebuchet MS': '"Trebuchet MS", "Lucida Sans Unicode", sans-serif'
        };
        return fontMap[fontName] || fontMap['OpenDyslexic'];
    }

    private createColorOverlay(settings: DyslexiaSettings): void {
        this.removeColorOverlay();
        
        this.overlayElement = document.createElement('div');
        this.overlayElement.id = 'dyslexia-color-overlay';
        this.overlayElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: ${settings.overlayColor};
            opacity: ${settings.overlayOpacity};
            pointer-events: none;
            z-index: 9999;
        `;
        
        document.body.appendChild(this.overlayElement);
    }

    private removeColorOverlay(): void {
        this.removeElementById('dyslexia-color-overlay');
        this.overlayElement = null;
    }

    private applyHighContrast(): void {
        console.log('Applying high contrast mode...');
        
        // Apply high contrast to ALL elements on the page
        const allElements = document.querySelectorAll('*');
        let styledCount = 0;
        let skippedCount = 0;
        
        allElements.forEach(element => {
            const el = element as HTMLElement;
            
            // Skip if element is part of the extension
            if (this.isExtensionElement(el)) {
                skippedCount++;
                return;
            }
            
            try {
                el.style.setProperty('background-color', 'black', 'important');
                el.style.setProperty('color', 'white', 'important');
                
                // Special handling for links
                if (el.tagName === 'A') {
                    el.style.setProperty('color', 'yellow', 'important');
                }
                
                // Special handling for images and videos
                if (el.tagName === 'IMG' || el.tagName === 'VIDEO' || el.tagName === 'CANVAS') {
                    el.style.setProperty('filter', 'contrast(200%) brightness(150%)', 'important');
                }
                
                styledCount++;
            } catch (error) {
                console.warn('Failed to apply high contrast to element:', el, error);
            }
        });
        
        console.log(`High contrast applied to ${styledCount} elements, ${skippedCount} elements skipped`);
    }

    private removeHighContrast(): void {
        console.log('Removing high contrast mode...');
        
        // First, find the sidebar container
        const sidebarContainer = document.querySelector('#inclusify-dyslexia-sidebar-root');
        
        // Remove high contrast from all elements
        const allElements = document.querySelectorAll('*');
        let cleanedCount = 0;
        
        allElements.forEach(element => {
            const el = element as HTMLElement;
            
            // Skip if element is inside the sidebar container
            if (sidebarContainer && sidebarContainer.contains(el)) {
                return;
            }
            
            // Skip if element is the sidebar container itself
            if (el.id === 'inclusify-dyslexia-sidebar-root') {
                return;
            }
            
            // Skip if element has sidebar-related classes or attributes
            if (el.closest('[data-dyslexia-sidebar]') || 
                el.closest('.dyslexia-sidebar') || 
                el.closest('.sidebar-overlay') ||
                el.closest('.floating-icon') ||
                el.closest('.sidebar-toggle')) {
                return;
            }
            
            // Skip if element is part of extension UI
            if (this.isExtensionElement(el)) {
                return;
            }
            
            el.style.removeProperty('background-color');
            el.style.removeProperty('color');
            el.style.removeProperty('filter');
            cleanedCount++;
        });
        
        console.log(`High contrast removed from ${cleanedCount} elements`);
        console.log('Sidebar container found:', !!sidebarContainer);
    }

    private enableFocusMode(): void {
        // Remove existing handlers if any
        if (this.focusModeMouseHandler) {
            document.removeEventListener('mousemove', this.focusModeMouseHandler);
        }
        if (this.focusModeClickHandler) {
            document.removeEventListener('click', this.focusModeClickHandler);
        }
        
        // Create and store handlers to prevent memory leaks
        this.focusModeMouseHandler = this.handleMouseMove.bind(this);
        this.focusModeClickHandler = this.handleClick.bind(this);
        
        document.addEventListener('mousemove', this.focusModeMouseHandler);
        document.addEventListener('click', this.focusModeClickHandler);
    }

    private disableFocusMode(): void {
        if (this.focusModeMouseHandler) {
            document.removeEventListener('mousemove', this.focusModeMouseHandler);
            this.focusModeMouseHandler = null;
        }
        if (this.focusModeClickHandler) {
            document.removeEventListener('click', this.focusModeClickHandler);
            this.focusModeClickHandler = null;
        }
        this.removeFocusElement();
    }

    private handleMouseMove(event: MouseEvent): void {
        const target = event.target as HTMLElement;
        if (target && target.textContent && target.textContent.trim()) {
            this.highlightElement(target);
        }
    }



    private highlightElement(element: HTMLElement): void {
        this.removeFocusElement();
        
        this.focusElement = document.createElement('div');
        this.focusElement.id = 'dyslexia-focus-highlight';
        this.focusElement.style.cssText = `
            position: absolute;
            background-color: yellow;
            opacity: 0.3;
            pointer-events: none;
            z-index: 10000;
            border-radius: 2px;
        `;
        
        const rect = element.getBoundingClientRect();
        this.focusElement.style.left = rect.left + 'px';
        this.focusElement.style.top = rect.top + 'px';
        this.focusElement.style.width = rect.width + 'px';
        this.focusElement.style.height = rect.height + 'px';
        
        document.body.appendChild(this.focusElement);
    }

    private removeFocusElement(): void {
        this.removeElementById('dyslexia-focus-highlight');
        this.focusElement = null;
    }

    private simplifyPage(): void {
        const selectors = [
            'nav', 'header', 'footer', 'aside', 
            '.advertisement', '.ad', '.banner', '.sidebar',
            '.social-media', '.share-buttons', '.comments',
            'iframe', 'script', 'style'
        ];
        
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const el = element as HTMLElement;
                
                // Skip extension elements
                if (this.isExtensionElement(el)) {
                    return;
                }
                
                // Store original display
                this.originalStyles.set(el, el.style.display);
                el.style.display = 'none';
            });
        });
        
        console.log('Page simplified - distracting elements hidden');
    }

    private restorePage(): void {
        this.originalStyles.forEach((originalDisplay, element) => {
            element.style.display = originalDisplay;
        });
        this.originalStyles.clear();
        console.log('Page restored - all elements shown');
    }

    private highlightLinks(): void {
        console.log('Applying link highlighting...');
        
        const links = document.querySelectorAll('a');
        let styledCount = 0;
        let skippedCount = 0;
        
        links.forEach(link => {
            const el = link as HTMLElement;
            
            // Skip if element is part of the extension
            if (this.isExtensionElement(el)) {
                skippedCount++;
                return;
            }
            
            try {
                el.style.setProperty('background-color', 'yellow', 'important');
                el.style.setProperty('color', 'black', 'important');
                el.style.setProperty('text-decoration', 'underline', 'important');
                el.style.setProperty('padding', '2px 4px', 'important');
                el.style.setProperty('border-radius', '3px', 'important');
                styledCount++;
            } catch (error) {
                console.warn('Failed to highlight link:', el, error);
            }
        });
        
        console.log(`Link highlighting applied to ${styledCount} links, ${skippedCount} links skipped`);
    }

    private removeLinkHighlights(): void {
        console.log('Removing link highlighting...');
        
        // First, find the sidebar container
        const sidebarContainer = document.querySelector('#inclusify-dyslexia-sidebar-root');
        
        const links = document.querySelectorAll('a');
        let cleanedCount = 0;
        
        links.forEach(link => {
            const el = link as HTMLElement;
            
            // Skip if element is inside the sidebar container
            if (sidebarContainer && sidebarContainer.contains(el)) {
                return;
            }
            
            // Skip if element is the sidebar container itself
            if (el.id === 'inclusify-dyslexia-sidebar-root') {
                return;
            }
            
            // Skip if element has sidebar-related classes or attributes
            if (el.closest('[data-dyslexia-sidebar]') || 
                el.closest('.dyslexia-sidebar') || 
                el.closest('.sidebar-overlay') ||
                el.closest('.floating-icon') ||
                el.closest('.sidebar-toggle')) {
                return;
            }
            
            // Skip if element is part of extension UI
            if (this.isExtensionElement(el)) {
                return;
            }
            
            el.style.removeProperty('background-color');
            el.style.removeProperty('color');
            el.style.removeProperty('text-decoration');
            el.style.removeProperty('padding');
            el.style.removeProperty('border-radius');
            cleanedCount++;
        });
        
        console.log(`Link highlighting removed from ${cleanedCount} links`);
        console.log('Sidebar container found:', !!sidebarContainer);
    }

    private applyStylesWithFallback(id: string, cssText: string): void {
        try {
            this.removeElementById(id);
            const style = document.createElement('style');
            style.id = id;
            style.textContent = cssText;
            document.head.appendChild(style);
            console.log(`Styles applied with ID: ${id}`);
        } catch (error) {
            console.warn('Failed to apply styles, showing manual injection instructions');
            this.showManualInjectionInstructions(cssText);
        }
    }

    private showManualInjectionInstructions(cssText: string): void {
        // Create a notification with instructions
        const notification = document.createElement('div');
        notification.id = 'dyslexia-manual-injection-notice';
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff6b6b;
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-size: 14px;
            z-index: 10002;
            max-width: 500px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        
        notification.innerHTML = `
            <h3>🔒 CSP Restricted Site Detected</h3>
            <p>This site has security restrictions. To apply dyslexia-friendly styles:</p>
            <ol>
                <li>Press <strong>F12</strong> to open Developer Tools</li>
                <li>Go to <strong>Console</strong> tab</li>
                <li>Copy and paste this command:</li>
            </ol>
            <textarea style="width: 100%; height: 80px; font-family: monospace; font-size: 12px; margin: 10px 0; padding: 10px; border: 1px solid #ccc; border-radius: 5px;" readonly>document.head.insertAdjacentHTML('beforeend', \`&lt;style&gt;${cssText}&lt;/style&gt;\`);</textarea>
            <p><strong>Or simply copy this CSS and paste it in the Console:</strong></p>
            <textarea style="width: 100%; height: 100px; font-family: monospace; font-size: 12px; margin: 10px 0; padding: 10px; border: 1px solid #ccc; border-radius: 5px;" readonly>${cssText}</textarea>
            <button onclick="this.parentElement.remove()" style="background: #fff; color: #ff6b6b; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 10px;">Got it!</button>
        `;
        
        document.body.appendChild(notification);
        
        // Also log the command to console for easy access
        console.log('🔒 CSP Restricted Site - Manual CSS Injection Required:');
        console.log('Copy and paste this in the Console:');
        console.log(`document.head.insertAdjacentHTML('beforeend', \`<style>${cssText}</style>\`);`);
        
        // Auto-remove after 30 seconds
        setTimeout(() => {
            this.removeElementById('dyslexia-manual-injection-notice');
        }, 30000);
    }

    private showSettingsIndicator(): void {
        const indicator = document.createElement('div');
        indicator.id = 'dyslexia-settings-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: bold;
            z-index: 10001;
            pointer-events: none;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            animation: dyslexiaIndicator 0.5s ease-in-out;
        `;
        indicator.textContent = '✅ Dyslexia Helper Active';
        document.body.appendChild(indicator);
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes dyslexiaIndicator {
                0% { transform: translateY(-20px); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        // Remove indicator after 3 seconds
        setTimeout(() => {
            this.removeElementById('dyslexia-settings-indicator');
            style.remove();
        }, 3000);
    }

    private removeElementById(id: string): void {
        const element = document.getElementById(id);
        if (element) {
            element.remove();
        }
    }

    public removeAllModifications(): void {
        console.log('Removing all dyslexia modifications...');
        this.removeColorOverlay();
        this.removeHighContrast();
        this.disableFocusMode();
        this.disableLineFocus();
        this.restorePage();
        this.removeLinkHighlights();
        this.removeElementById('dyslexia-font-settings');
        this.removeElementById('dyslexia-high-contrast');
        this.removeElementById('dyslexia-high-contrast-global');
        this.removeElementById('dyslexia-global-font-settings');
        this.removeElementById('dyslexia-settings-indicator');
        this.removeElementById('dyslexia-manual-injection-notice');
        this.removeElementById('dyslexia-color-overlay');
        this.removeElementById('dyslexia-focus-highlight');
        this.removeElementById('dyslexia-line-focus');
        
        // Remove all applied styles from elements
        this.removeAllAppliedStyles();
        
        DOMController.hasShownIndicator = false; // Reset static indicator flag
        this.lastEnabledState = false;
    }

    private removeAllAppliedStyles(): void {
        console.log('Removing all applied styles from elements...');
        
        // First, find the sidebar container
        const sidebarContainer = document.querySelector('#inclusify-dyslexia-sidebar-root');
        
        const allElements = document.querySelectorAll('*');
        let cleanedCount = 0;
        
        allElements.forEach(element => {
            const el = element as HTMLElement;
            
            // Skip if element is inside the sidebar container
            if (sidebarContainer && sidebarContainer.contains(el)) {
                return;
            }
            
            // Skip if element is the sidebar container itself
            if (el.id === 'inclusify-dyslexia-sidebar-root') {
                return;
            }
            
            // Skip if element has sidebar-related classes or attributes
            if (el.closest('[data-dyslexia-sidebar]') || 
                el.closest('.dyslexia-sidebar') || 
                el.closest('.sidebar-overlay') ||
                el.closest('.floating-icon') ||
                el.closest('.sidebar-toggle')) {
                return;
            }
            
            // Skip if element is part of extension UI
            if (this.isExtensionElement(el)) {
                return;
            }
            
            // Remove all dyslexia-related styles
            el.style.removeProperty('font-family');
            el.style.removeProperty('font-size');
            el.style.removeProperty('line-height');
            el.style.removeProperty('word-spacing');
            el.style.removeProperty('letter-spacing');
            el.style.removeProperty('background-color');
            el.style.removeProperty('color');
            el.style.removeProperty('filter');
            el.style.removeProperty('text-decoration');
            el.style.removeProperty('padding');
            el.style.removeProperty('border-radius');
            
            cleanedCount++;
        });
        
        console.log(`Removed styles from ${cleanedCount} elements`);
        console.log('Sidebar container found:', !!sidebarContainer);
    }

    public destroy(): void {
        console.log('DOMController: Destroying...');
        this.removeAllModifications();
        this.stopObserving();
        this.disableLineFocus();
        
        // Clean up focus mode handlers
        if (this.focusModeMouseHandler) {
            document.removeEventListener('mousemove', this.focusModeMouseHandler);
            this.focusModeMouseHandler = null;
        }
        if (this.focusModeClickHandler) {
            document.removeEventListener('click', this.focusModeClickHandler);
            this.focusModeClickHandler = null;
        }
        
        // Clean up hover highlighting
        if (this.hoverHighlightHandler) {
            document.removeEventListener('mouseover', this.hoverHighlightHandler);
            this.hoverHighlightHandler = null;
        }
        
        // Remove any remaining hover highlights
        const hoverHighlights = document.querySelectorAll('.dyslexia-hover-highlight');
        hoverHighlights.forEach(el => el.remove());
        
        this.currentSettings = null;
        DOMController.instance = null;
    }

    // Method to refresh styling for dynamic content
    public refreshStyling(settings: DyslexiaSettings): void {
        console.log('Refreshing styling for dynamic content...');
        
        if (settings.enabled) {
            // Re-apply all settings
            this.applyFontSettings(settings);
            this.applyColorSettings(settings);
            this.applyReadingAids(settings);
        }
    }

    // Method to observe DOM changes and re-apply styles
    public startObserving(settings: DyslexiaSettings): void {
        if (this.observer) {
            this.observer.disconnect();
        }
        if (typeof MutationObserver === 'undefined') return;
        
        // Only observe for new nodes, not all mutations
        this.observer = new MutationObserver((mutations) => {
            let needsUpdate = false;
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    needsUpdate = true;
                    break;
                }
            }
            if (needsUpdate) {
                console.log('DOMController: New nodes detected, applying font settings to new content.');
                this.applyFontSettingsToNewContent(settings); // Use the new method without indicator
            }
        });
        this.observer.observe(document.body, { childList: true, subtree: true });
        console.log('DOMController: MutationObserver started.');
    }

    public stopObserving(): void {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }

    public debugStyling(): void {
        console.log('=== Dyslexia Helper Debug Info ===');
        console.log('Has shown indicator:', DOMController.hasShownIndicator);
        console.log('Last enabled state:', this.lastEnabledState);
        console.log('Observer active:', !!this.observer);
        console.log('Total elements on page:', document.querySelectorAll('*').length);
        console.log('Text elements on page:', document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, li, td, th, label, input, textarea, button, a').length);
        console.log('Sidebar present:', !!document.querySelector('[data-dyslexia-sidebar]'));
        console.log('================================');
    }

    // Placeholder methods for other features (to be implemented as needed)
    private enableReadingMode(settings: DyslexiaSettings): void {
        console.log('Reading mode enabled');
    }

    private disableReadingMode(): void {
        console.log('Reading mode disabled');
    }

    private enableDyslexiaRuler(settings: DyslexiaSettings): void {
        console.log('Dyslexia ruler enabled');
    }

    private disableDyslexiaRuler(): void {
        console.log('Dyslexia ruler disabled');
    }

    private handleRulerMove(event: MouseEvent): void {
        // Implementation for ruler movement
    }

    private enableSpeedReading(settings: DyslexiaSettings): void {
        console.log('Speed reading enabled');
    }

    private disableSpeedReading(): void {
        console.log('Speed reading disabled');
    }

    private handleTextSelection(event: MouseEvent): void {
        // Implementation for text selection
    }

    private startSpeedReading(text: string): void {
        // Implementation for speed reading
    }

    private stopSpeedReading(): void {
        // Implementation for stopping speed reading
    }

    private enableTextHighlighting(settings: DyslexiaSettings): void {
        console.log('Text highlighting enabled');
    }

    private disableTextHighlighting(): void {
        console.log('Text highlighting disabled');
    }

    private handleTextHighlight(event: MouseEvent): void {
        // Implementation for text highlighting
    }

    private enableTextStroke(settings: DyslexiaSettings): void {
        console.log('Text stroke enabled');
    }

    private disableTextStroke(): void {
        console.log('Text stroke disabled');
    }

    private enableEmphasizeLinks(settings: DyslexiaSettings): void {
        console.log('Emphasize links enabled');
    }

    private disableEmphasizeLinks(): void {
        console.log('Emphasize links disabled');
    }

    private enableLineFocus(settings: DyslexiaSettings): void {
        if (typeof document === 'undefined') return;
        
        console.log('Enabling line focus...');
        
        // Remove existing line focus if any
        this.disableLineFocus();
        
        // Create line focus overlay
        this.lineFocusElement = document.createElement('div');
        this.lineFocusElement.id = 'dyslexia-line-focus';
        this.lineFocusElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: ${settings.lineFocusHeight || 30}px;
            background-color: ${settings.lineFocusColor || '#ffff00'};
            opacity: ${settings.lineFocusOpacity || 0.3};
            pointer-events: none;
            z-index: 10000;
            transition: top 0.1s ease;
        `;
        
        document.body.appendChild(this.lineFocusElement);
        
        // Create and store the event handler to prevent memory leaks
        this.lineFocusMoveHandler = this.handleLineFocusMove.bind(this);
        document.addEventListener('mousemove', this.lineFocusMoveHandler);
        
        console.log('Line focus enabled');
    }

    private disableLineFocus(): void {
        if (this.lineFocusElement) {
            this.lineFocusElement.remove();
            this.lineFocusElement = null;
        }
        
        // Remove event listener using stored handler
        if (this.lineFocusMoveHandler) {
            document.removeEventListener('mousemove', this.lineFocusMoveHandler);
            this.lineFocusMoveHandler = null;
        }
        
        console.log('Line focus disabled');
    }

    private handleLineFocusMove(event: MouseEvent): void {
        if (!this.lineFocusElement || !this.currentSettings) return;
        
        const height = this.currentSettings.lineFocusHeight || 30;
        const y = event.clientY - (height / 2);
        
        this.lineFocusElement.style.top = `${Math.max(0, y)}px`;
    }

    // Hover highlighting functionality
    private enableHoverHighlighting(): void {
        // Remove existing handler if any
        if (this.hoverHighlightHandler) {
            document.removeEventListener('mouseover', this.hoverHighlightHandler);
        }
        
        // Create and store handler to prevent memory leaks
        this.hoverHighlightHandler = this.handleHoverHighlight.bind(this);
        document.addEventListener('mouseover', this.hoverHighlightHandler);
        
        console.log('Hover highlighting enabled');
    }

    private disableHoverHighlighting(): void {
        if (this.hoverHighlightHandler) {
            document.removeEventListener('mouseover', this.hoverHighlightHandler);
            this.hoverHighlightHandler = null;
        }
        
        // Remove any existing hover highlights
        const hoverHighlights = document.querySelectorAll('.dyslexia-hover-highlight');
        hoverHighlights.forEach(el => el.remove());
        
        console.log('Hover highlighting disabled');
    }

    private handleHoverHighlight(event: MouseEvent): void {
        const target = event.target as HTMLElement;
        
        // Skip if element is part of the extension
        if (this.isExtensionElement(target)) {
            return;
        }
        
        // Skip if element doesn't have text content
        if (!target.textContent || target.textContent.trim().length === 0) {
            return;
        }
        
        // Remove existing hover highlights
        const existingHighlights = document.querySelectorAll('.dyslexia-hover-highlight');
        existingHighlights.forEach(el => el.remove());
        
        // Create hover highlight
        const highlight = document.createElement('div');
        highlight.className = 'dyslexia-hover-highlight';
        highlight.style.cssText = `
            position: absolute;
            background-color: #ffff00;
            opacity: 0.3;
            pointer-events: none;
            z-index: 9998;
            border-radius: 2px;
            transition: all 0.2s ease;
        `;
        
        const rect = target.getBoundingClientRect();
        highlight.style.left = rect.left + 'px';
        highlight.style.top = rect.top + 'px';
        highlight.style.width = rect.width + 'px';
        highlight.style.height = rect.height + 'px';
        
        document.body.appendChild(highlight);
        
        // Remove highlight after a short delay
        setTimeout(() => {
            if (highlight.parentNode) {
                highlight.remove();
            }
        }, 500);
    }

    private enableReadingGuide(settings: DyslexiaSettings): void {
        console.log('Reading guide enabled');
    }

    private disableReadingGuide(): void {
        console.log('Reading guide disabled');
    }

    private handleReadingGuideMove(event: MouseEvent): void {
        // Implementation for reading guide movement
    }

    private enableMagnifier(settings: DyslexiaSettings): void {
        console.log('Magnifier enabled');
    }

    private disableMagnifier(): void {
        console.log('Magnifier disabled');
    }

    private handleMagnifierMove(event: MouseEvent): void {
        // Implementation for magnifier movement
    }

    private enableCursorControl(settings: DyslexiaSettings): void {
        console.log('Cursor control enabled');
    }

    private disableCursorControl(): void {
        console.log('Cursor control disabled');
    }

    private currentSettings: DyslexiaSettings | null = null;

    public setCurrentSettings(settings: DyslexiaSettings): void {
        this.currentSettings = settings;
    }
} 