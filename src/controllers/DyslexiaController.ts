import { writable, type Writable } from 'svelte/store';

export interface DyslexiaSettings {
    enabled: boolean;
    fontFamily: string;
    fontSize: number;
    lineSpacing: number;
    wordSpacing: number;
    letterSpacing: number;
    lineFocus: boolean;
    dyslexiaRuler: boolean;
}

export class DyslexiaController {
    private static instance: DyslexiaController | undefined;
    private settingsStore: Writable<DyslexiaSettings>;
    private domController: DOMController;
    private eventController: EventController;

    private constructor() {
        this.settingsStore = writable<DyslexiaSettings>({
            enabled: false,
            fontFamily: 'OpenDyslexic',
            fontSize: 16,
            lineSpacing: 1.5,
            wordSpacing: 0.16,
            letterSpacing: 0.12,
            lineFocus: false,
            dyslexiaRuler: false
        });

        this.domController = new DOMController();
        this.eventController = new EventController();
    }

    public static getInstance(): DyslexiaController {
        if (!DyslexiaController.instance) {
            DyslexiaController.instance = new DyslexiaController();
        }
        return DyslexiaController.instance;
    }

    public getSettingsStore(): Writable<DyslexiaSettings> {
        return this.settingsStore;
    }

    public getDOMController(): DOMController {
        return this.domController;
    }

    public getEventController(): EventController {
        return this.eventController;
    }

    public async initialize(): Promise<void> {
        try {
            console.log('Initializing Dyslexia Controller...');
            
            // Load settings from storage
            await this.loadSettings();
            
            // Initialize DOM controller
            await this.domController.initialize();
            
            // Initialize event controller
            await this.eventController.initialize();
            
            // Subscribe to settings changes
            this.settingsStore.subscribe((settings) => {
                this.handleSettingsChange(settings);
            });

            console.log('Dyslexia Controller initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Dyslexia Controller:', error);
            throw error;
        }
    }

    private async loadSettings(): Promise<void> {
        try {
            const result = await chrome.storage.sync.get('dyslexiaSettings');
            if (result.dyslexiaSettings) {
                this.settingsStore.set(result.dyslexiaSettings);
            }
        } catch (error) {
            console.error('Failed to load dyslexia settings:', error);
        }
    }

    private async saveSettings(settings: DyslexiaSettings): Promise<void> {
        try {
            await chrome.storage.sync.set({ dyslexiaSettings: settings });
        } catch (error) {
            console.error('Failed to save dyslexia settings:', error);
        }
    }

    private handleSettingsChange(settings: DyslexiaSettings): void {
        // Save settings to storage
        this.saveSettings(settings);
        
        // Apply settings to DOM
        if (settings.enabled) {
            this.domController.applySettings(settings);
        } else {
            this.domController.removeSettings();
        }
    }

    public destroy(): void {
        this.domController.destroy();
        this.eventController.destroy();
        DyslexiaController.instance = undefined;
    }
}

class DOMController {
    private observer: MutationObserver | null = null;
    private isInitialized = false;

    public async initialize(): Promise<void> {
        if (this.isInitialized) return;
        
        // Set up mutation observer for dynamic content
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.styleElement(node as Element);
                        }
                    });
                }
            });
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        this.isInitialized = true;
    }

    public applySettings(settings: DyslexiaSettings): void {
        const html = document.documentElement;
        
        // Apply font settings
        html.style.setProperty('--dyslexia-font-family', settings.fontFamily);
        html.style.setProperty('--dyslexia-font-size', `${settings.fontSize}px`);
        html.style.setProperty('--dyslexia-line-spacing', settings.lineSpacing.toString());
        html.style.setProperty('--dyslexia-word-spacing', `${settings.wordSpacing}em`);
        html.style.setProperty('--dyslexia-letter-spacing', `${settings.letterSpacing}em`);
        
        // Add dyslexia class
        html.classList.add('inclusify-dyslexia-enabled');

        // Apply or remove visual aids based on settings
        if (settings.lineFocus) {
            this.applyLineFocus();
        } else {
            this.removeLineFocus();
        }

        if (settings.dyslexiaRuler) {
            this.applyDyslexiaRuler();
        } else {
            this.removeDyslexiaRuler();
        }
    }

    public removeSettings(): void {
        const html = document.documentElement;
        
        // Remove dyslexia class
        html.classList.remove('inclusify-dyslexia-enabled');
        
        // Remove CSS variables
        html.style.removeProperty('--dyslexia-font-family');
        html.style.removeProperty('--dyslexia-font-size');
        html.style.removeProperty('--dyslexia-line-spacing');
        html.style.removeProperty('--dyslexia-word-spacing');
        html.style.removeProperty('--dyslexia-letter-spacing');
        
        // Remove overlays
        this.removeLineFocus();
        this.removeDyslexiaRuler();
    }

    private applyLineFocus(): void {
        const lineFocus = document.createElement('div');
        lineFocus.id = 'dyslexia-line-focus';
        lineFocus.style.cssText = `
            position: fixed;
            left: 0;
            width: 100vw;
            height: 2em;
            background: rgba(255, 255, 0, 0.2);
            pointer-events: none;
            z-index: 10000;
            transition: top 0.1s ease;
        `;
        document.body.appendChild(lineFocus);
    }

    private removeLineFocus(): void {
        const lineFocus = document.getElementById('dyslexia-line-focus');
        if (lineFocus) lineFocus.remove();
    }


    private applyDyslexiaRuler(): void {
        const ruler = document.createElement('div');
        ruler.id = 'dyslexia-ruler';
        ruler.style.cssText = `
            position: fixed;
            width: 100%;
            height: 3px;
            background: linear-gradient(to right, transparent, #ff6b35, transparent);
            pointer-events: none;
            z-index: 10001;
            transition: top 0.1s ease;
            top: 50vh;
            box-shadow: 0 0 4px rgba(255, 107, 53, 0.5);
        `;
        document.body.appendChild(ruler);
    }

    private removeDyslexiaRuler(): void {
        const ruler = document.getElementById('dyslexia-ruler');
        if (ruler) ruler.remove();
    }

    private styleElement(element: Element): void {
        // Apply dyslexia styles to new elements
        if (document.documentElement.classList.contains('inclusify-dyslexia-enabled')) {
            element.classList.add('inclusify-dyslexia-styled');
        }
    }

    public refreshStyling(settings: DyslexiaSettings): void {
        this.removeSettings();
        this.applySettings(settings);
    }

    public debugStyling(): void {
        console.log('Current dyslexia styling state:');
        console.log('HTML classes:', document.documentElement.classList.toString());
        console.log('CSS variables:', {
            fontFamily: document.documentElement.style.getPropertyValue('--dyslexia-font-family'),
            fontSize: document.documentElement.style.getPropertyValue('--dyslexia-font-size'),
            lineSpacing: document.documentElement.style.getPropertyValue('--dyslexia-line-spacing')
        });
    }

    public destroy(): void {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        this.removeSettings();
        this.isInitialized = false;
    }
}

class EventController {
    private isInitialized = false;

    public async initialize(): Promise<void> {
        if (this.isInitialized) return;
        
        // Add mouse tracking for focus mode
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        this.isInitialized = true;
    }

    private handleMouseMove(e: MouseEvent): void {
        // Update line focus
        const lineFocus = document.getElementById('dyslexia-line-focus');
        if (lineFocus) {
            const lineHeight = lineFocus.offsetHeight;
            let top = e.clientY - lineHeight / 2;
            if (top < 0) top = 0;
            if (top + lineHeight > window.innerHeight) {
                top = window.innerHeight - lineHeight;
            }
            lineFocus.style.top = top + 'px';
        }

        // Update dyslexia ruler
        const ruler = document.getElementById('dyslexia-ruler');
        if (ruler) {
            ruler.style.top = (e.clientY - 1) + 'px';
        }
    }

    public destroy(): void {
        document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        this.isInitialized = false;
    }
} 