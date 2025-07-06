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
        this.isInitialized = true;
        console.log('EventController: Initialized');
    }

    private setupKeyboardShortcuts(): void {
        // Remove existing handler if any
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
        }
        
        this.keydownHandler = (event) => {
            // Ctrl+Shift+D to toggle dyslexia mode
            if (event.ctrlKey && event.shiftKey && event.key === 'D') {
                event.preventDefault();
                this.toggleDyslexiaMode();
            }
        };
        
        document.addEventListener('keydown', this.keydownHandler);
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
        

        
        this.isInitialized = false;
        console.log('EventController: Destroyed');
    }
} 