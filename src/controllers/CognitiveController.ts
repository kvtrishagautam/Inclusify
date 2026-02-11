import { cognitiveModel, type CognitiveSettings } from "../models/CognitiveModel";

export class CognitiveController {
    private static instance: CognitiveController;

    private constructor() {}

    public static getInstance(): CognitiveController {
        if (!CognitiveController.instance) {
            CognitiveController.instance = new CognitiveController();
        }
        return CognitiveController.instance;
    }

    // Settings management
    public getSettings() {
        return cognitiveModel.getSettings();
    }

    public toggleEnabled(): void {
        cognitiveModel.toggleEnabled();
        this.reapplyFeatures();
    }

    public toggleBigCursor(): void {
        console.log('Toggling big cursor');
        cognitiveModel.toggleBigCursor();
        this.reapplyFeatures();
    }

    public toggleReadingMask(): void {
        console.log('Toggling reading mask');
        cognitiveModel.toggleReadingMask();
        this.reapplyFeatures();
    }

    public toggleReadingGuide(): void {
        console.log('Toggling reading guide');
        cognitiveModel.toggleReadingGuide();
        this.reapplyFeatures();
    }

    private reapplyFeatures(): void {
        // Get current settings and reapply
        this.getSettings().subscribe(settings => {
            console.log('Reapplying cognitive features with settings:', settings);
            this.applyCognitiveFeaturesToPage(settings);
        })();
    }

    public setFontSize(value: number): void {
        cognitiveModel.setFontSize(value);
    }

    public setLineSpacing(value: number): void {
        cognitiveModel.setLineSpacing(value);
    }

    public setContrast(value: number): void {
        cognitiveModel.setContrast(value);
    }

    public setCursorSize(value: number): void {
        cognitiveModel.setCursorSize(value);
    }

    public setMaskOpacity(value: number): void {
        cognitiveModel.setMaskOpacity(value);
        // Update the mask opacity if reading mask is currently active
        const window = document.getElementById('inclusify-reading-window');
        if (window) {
            const opacityDecimal = value / 100;
            window.style.boxShadow = `0 0 0 9999px rgba(0,0,0,${opacityDecimal})`;
        }
    }

    public setGuideColor(value: string): void {
        cognitiveModel.setGuideColor(value);
        // Update CSS variable for guide color
        document.documentElement.style.setProperty('--inclusify-guide-color', value);
        // Update the guide color if reading guide is currently active
        const guide = document.getElementById('inclusify-reading-guide');
        if (guide) {
            guide.style.backgroundColor = value;
            guide.style.boxShadow = `0 0 10px ${value}`;
        }
    }

    public resetToDefaults(): void {
        cognitiveModel.resetToDefaults();
    }

    // Initialize features when page loads
    public initializeFeatures(): void {
        console.log('Initializing cognitive features');
        // Only apply if explicitly enabled
        this.getSettings().subscribe(settings => {
            console.log('Current cognitive settings:', settings);
            if (settings.enabled) {
                console.log('Cognitive features enabled, applying...');
                this.applyCognitiveFeaturesToPage(settings);
            } else {
                console.log('Cognitive features disabled, ensuring cleanup...');
                // Ensure all features are removed
                this.removeAllFeatures();
            }
        })();
    }

    // Remove all features to ensure clean state
    private removeAllFeatures(): void {
        this.removeBigCursor();
        this.removeReadingMask();
        this.removeReadingGuide();
    }

    // Content script helpers
    public applyCognitiveFeaturesToPage(settings: CognitiveSettings): void {
        console.log('Applying cognitive features:', settings);
        const html = document.documentElement;

        if (settings.enabled) {
            // Remove any existing cognitive classes
            html.classList.remove(
                'inclusify-cognitive-enabled',
                'inclusify-big-cursor',
                'inclusify-reading-mask',
                'inclusify-reading-guide'
            );
            
            // Add the enabled class and specific feature classes
            const cssClasses = cognitiveModel.getCssClasses(settings);
            console.log('Adding CSS classes:', cssClasses);
            html.classList.add(...cssClasses);
            
            // Log the current classes for debugging
            console.log('Current HTML classes:', html.className);
            
            // Apply CSS variables
            const cssVariables = cognitiveModel.getCssVariables(settings);
            if (cssVariables) {
                // Parse and apply CSS variables properly
                const variableRegex = /--inclusify-([^:]+):\s*([^;]+);/g;
                let match;
                while ((match = variableRegex.exec(cssVariables)) !== null) {
                    const [, name, value] = match;
                    html.style.setProperty(`--inclusify-${name}`, value);
                }
            }
            
            // Apply specific features
            if (settings.bigCursor) {
                console.log('Applying big cursor');
                this.applyBigCursor();
            } else {
                this.removeBigCursor();
            }
            
            if (settings.readingMask) {
                console.log('Applying reading mask');
                this.applyReadingMask();
            } else {
                this.removeReadingMask();
            }
            
            if (settings.readingGuide) {
                console.log('Applying reading guide');
                this.applyReadingGuide();
            } else {
                this.removeReadingGuide();
            }
            
        } else {
            // Remove all cognitive-related classes and styles
            html.classList.remove(
                'inclusify-cognitive-enabled',
                'inclusify-big-cursor',
                'inclusify-reading-mask',
                'inclusify-reading-guide'
            );
            
            // Remove CSS variables
            html.style.removeProperty('--inclusify-font-size');
            html.style.removeProperty('--inclusify-line-spacing');
            html.style.removeProperty('--inclusify-contrast');
            html.style.removeProperty('--inclusify-cursor-size');
            html.style.removeProperty('--inclusify-mask-opacity');
            html.style.removeProperty('--inclusify-guide-color');
            
            this.removeBigCursor();
            this.removeReadingMask();
            this.removeReadingGuide();
            
            // Reset font size and other properties
            html.style.fontSize = '';
            html.style.lineHeight = '';
            html.style.filter = '';
        }
    }

    // Validation
    public validateFontSize(level: number): number {
        return Math.max(100, Math.min(200, level));
    }

    public validateLineSpacing(level: number): number {
        return Math.max(1.2, Math.min(2.0, level));
    }

    public validateContrast(level: number): number {
        return Math.max(100, Math.min(200, level));
    }

    public validateCursorSize(size: number): number {
        return Math.max(20, Math.min(60, size));
    }

    public validateMaskOpacity(opacity: number): number {
        return Math.max(20, Math.min(80, opacity));
    }

    // Reading mask implementation
    public applyReadingMask(): void {
        console.log('Applying reading mask');

        // Remove any existing reading mask first
        this.removeReadingMask();

        // Get current settings to use maskOpacity
        let maskOpacity = 50; // Default
        this.getSettings().subscribe(settings => {
            maskOpacity = settings.maskOpacity || 50;
        })();

        // Convert percentage to decimal (50% = 0.5)
        const opacityDecimal = maskOpacity / 100;

        // Create the reading highlight window with box-shadow for mask effect
        const window = document.createElement('div');
        window.id = 'inclusify-reading-window';
        window.style.cssText = `
            position: fixed;
            left: 0;
            width: 100vw;
            height: 4em;
            background: transparent;
            pointer-events: none;
            z-index: 2147483647;
            border-top: 3px solid #007bff;
            border-bottom: 3px solid #007bff;
            transition: top 0.1s ease;
            box-shadow: 0 0 0 9999px rgba(0,0,0,${opacityDecimal});
        `;

        document.body.appendChild(window);
        
        // Set initial position
        window.style.top = '50px';
        
        // Move the window to follow the mouse Y position
        const moveWindow = (e: MouseEvent) => {
            // Check if mouse is over ANY sidebar elements
            const target = e.target as HTMLElement;
            if (
                target.closest('#inclusify-chromophobia-controls-container') ||
                target.closest('#inclusify-cognitive-controls-container') ||
                target.closest('#inclusify-accessibility-controls-container') ||
                target.closest('#inclusify-dyslexia-controls-container') ||
                target.closest('.controls-overlay') ||
                target.closest('.cognitive-controls-overlay') ||
                target.closest('.accessibility-overlay') ||
                target.closest('.dyslexia-overlay') ||
                target.closest('.sidepanel-container')
            ) {
                // Hide the reading window when over sidebar
                window.style.display = 'none';
                return;
            } else {
                // Show the reading window when not over sidebar
                window.style.display = 'block';
            }
            
            const lineHeight = window.offsetHeight;
            let top = e.clientY - lineHeight / 2;
            if (top < 0) top = 0;
            if (top + lineHeight > window.ownerDocument.documentElement.clientHeight) {
                top = window.ownerDocument.documentElement.clientHeight - lineHeight;
            }
            window.style.top = `${top}px`;
        };
        
        (window as any)._inclusifyMoveHandler = moveWindow;
        document.addEventListener('mousemove', moveWindow);

        console.log('Reading mask applied with elements:', {
            window: document.getElementById('inclusify-reading-window'),
            body: document.body,
            windowElement: window
        });

        // Verify elements are in the DOM
        setTimeout(() => {
            const windowInDOM = document.getElementById('inclusify-reading-window');
            console.log('Reading mask verification after 100ms:', {
                windowInDOM,
                windowVisible: windowInDOM ? windowInDOM.offsetWidth > 0 : false
            });
        }, 100);
    }

    public removeReadingMask(): void {
        console.log('Removing reading mask');
        const window = document.getElementById('inclusify-reading-window');
        if (window) {
            // Remove the mousemove event
            if ((window as any)._inclusifyMoveHandler) {
                document.removeEventListener('mousemove', (window as any)._inclusifyMoveHandler);
            }
            window.remove();
        }
        console.log('Reading mask removed');
    }

    // Big cursor implementation
    public applyBigCursor(): void {
        // Create a custom cursor element
        const cursor = document.createElement('div');
        cursor.id = 'inclusify-big-cursor';
        cursor.style.cssText = `
            position: fixed;
            width: 32px;
            height: 32px;
            background-image: url("data:image/svg+xml;utf8,<svg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'><polygon points='2,2 30,16 20,20 24,30 20,30 14,20 2,30' fill='black' stroke='white' stroke-width='1'/></svg>");
            background-size: contain;
            background-repeat: no-repeat;
            pointer-events: none;
            z-index: 2147483647;
            transition: all 0.1s ease;
        `;
        document.body.appendChild(cursor);

        // Track mouse movement
        const moveHandler = (e: MouseEvent) => {
            cursor.style.left = (e.clientX - 4) + 'px';
            cursor.style.top = (e.clientY - 4) + 'px';
        };
        
        document.addEventListener('mousemove', moveHandler);
        (cursor as any)._inclusifyMoveHandler = moveHandler;

        // Hide default cursor
        document.body.style.cursor = 'none';
    }

    public removeBigCursor(): void {
        const cursor = document.getElementById('inclusify-big-cursor');
        if (cursor) {
            // Remove the mousemove event
            if ((cursor as any)._inclusifyMoveHandler) {
                document.removeEventListener('mousemove', (cursor as any)._inclusifyMoveHandler);
            }
            cursor.remove();
        }
        document.body.style.cursor = '';
    }

    // Reading guide implementation
    public applyReadingGuide(): void {
        // Remove any existing guide first
        this.removeReadingGuide();

        // Create reading guide line
        const guide = document.createElement('div');
        guide.id = 'inclusify-reading-guide';
        guide.style.cssText = `
            position: fixed;
            width: 2px;
            height: 100%;
            background-color: var(--inclusify-guide-color, #ffeb3b);
            pointer-events: none;
            z-index: 2147483646;
            box-shadow: 0 0 10px var(--inclusify-guide-color, #ffeb3b);
        `;
        document.body.appendChild(guide);

        // Track mouse movement for guide
        const moveHandler = (e: MouseEvent) => {
            guide.style.left = (e.clientX - 1) + 'px';
        };

        // Store the handler so it can be removed later
        (guide as any)._inclusifyMoveHandler = moveHandler;
        document.addEventListener('mousemove', moveHandler);
    }

    public removeReadingGuide(): void {
        const guide = document.getElementById('inclusify-reading-guide');
        if (guide) {
            // Remove the mousemove event
            if ((guide as any)._inclusifyMoveHandler) {
                document.removeEventListener('mousemove', (guide as any)._inclusifyMoveHandler);
            }
            guide.remove();
        }
    }
}

// Export singleton instance
export const cognitiveController = CognitiveController.getInstance(); 