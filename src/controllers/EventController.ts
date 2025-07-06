import { DyslexiaController } from './DyslexiaController';

export class EventController {
    private controller: DyslexiaController;
    private isInitialized = false;
    private keydownHandler: ((event: KeyboardEvent) => void) | null = null;
    private customEventHandler: ((event: CustomEvent) => void) | null = null;

    constructor(controller: DyslexiaController) {
        this.controller = controller;
    }

    public initialize(): void {
        if (this.isInitialized || typeof document === 'undefined') return;
        
        console.log('EventController: Initializing...');
        this.setupKeyboardShortcuts();
        this.setupCustomEvents();
        this.isInitialized = true;
        console.log('EventController: Initialized');
    }

    private setupKeyboardShortcuts(): void {
        // Remove existing handler if any
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
        }
        
        this.keydownHandler = (event) => {
            // Ctrl+Shift+R to read selected text
            if (event.ctrlKey && event.shiftKey && event.key === 'R') {
                event.preventDefault();
                this.controller.speakSelectedText();
            }
            
            // Ctrl+Shift+D to toggle dyslexia mode
            if (event.ctrlKey && event.shiftKey && event.key === 'D') {
                event.preventDefault();
                this.toggleDyslexiaMode();
            }

            // Ctrl+Shift+S to stop speech
            if (event.ctrlKey && event.shiftKey && event.key === 'S') {
                event.preventDefault();
                this.controller.stopSpeech();
            }
        };
        
        document.addEventListener('keydown', this.keydownHandler);
    }

    private setupCustomEvents(): void {
        // Remove existing handler if any
        if (this.customEventHandler) {
            document.removeEventListener('dyslexia-read-text', this.customEventHandler as EventListener);
        }
        
        this.customEventHandler = (event: CustomEvent) => {
            const { text } = event.detail;
            this.controller.speakText(text);
        };
        
        // Listen for custom events from DOM interactions
        document.addEventListener('dyslexia-read-text', this.customEventHandler as EventListener);
    }

    private async toggleDyslexiaMode(): Promise<void> {
        const settings = this.getCurrentSettings();
        await this.controller.updateSetting('enabled', !settings.enabled);
    }

    private getCurrentSettings() {
        let currentSettings: any;
        this.controller.getSettingsStore().subscribe(settings => {
            currentSettings = settings;
        })();
        return currentSettings;
    }

    public destroy(): void {
        console.log('EventController: Destroying...');
        
        // Remove event listeners
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
            this.keydownHandler = null;
        }
        
        if (this.customEventHandler) {
            document.removeEventListener('dyslexia-read-text', this.customEventHandler as EventListener);
            this.customEventHandler = null;
        }
        
        this.isInitialized = false;
        console.log('EventController: Destroyed');
    }
} 