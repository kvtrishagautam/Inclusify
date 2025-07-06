import { StorageModel } from '../models/StorageModel';
import { SpeechModel } from '../models/SpeechModel';
import { DOMController } from './DOMController';
import { EventController } from './EventController';
import type { DyslexiaSettings } from '../models/DyslexiaSettings';

export class DyslexiaController {
    private storageModel: StorageModel;
    private speechModel: SpeechModel;
    private domController: DOMController;
    private eventController: EventController;
    private static instance: DyslexiaController | null = null;
    private static isInitializing: boolean = false;
    private static initializationPromise: Promise<void> | null = null;
    private settingsUnsubscribe: (() => void) | null = null;
    private isInitialized: boolean = false;

    private constructor() {
        console.log('DyslexiaController: Creating new instance');
        this.storageModel = StorageModel.getInstance();
        this.speechModel = new SpeechModel();
        this.domController = DOMController.getInstance();
        this.eventController = new EventController(this);
    }

    public static getInstance(): DyslexiaController {
        if (!DyslexiaController.instance) {
            // Additional check to prevent multiple instances
            if (typeof window !== 'undefined' && window.inclusifyController) {
                console.warn('DyslexiaController: Controller already exists on window, returning existing instance');
                return window.inclusifyController;
            }
            DyslexiaController.instance = new DyslexiaController();
        }
        return DyslexiaController.instance;
    }

    public async initialize(): Promise<void> {
        // Prevent multiple initializations
        if (this.isInitialized) {
            console.log('DyslexiaController: Already initialized, skipping');
            return;
        }
        
        // If initialization is in progress, wait for it to complete
        if (DyslexiaController.initializationPromise) {
            console.log('DyslexiaController: Initialization in progress, waiting...');
            await DyslexiaController.initializationPromise;
            return;
        }
        
        if (DyslexiaController.isInitializing) {
            console.log('DyslexiaController: Already initializing, waiting...');
            // Wait for initialization to complete
            while (DyslexiaController.isInitializing) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return;
        }
        
        DyslexiaController.isInitializing = true;
        console.log('DyslexiaController: Initializing...');
        
        // Create initialization promise
        DyslexiaController.initializationPromise = this.performInitialization();
        
        try {
            await DyslexiaController.initializationPromise;
        } finally {
            DyslexiaController.isInitializing = false;
            DyslexiaController.initializationPromise = null;
        }
    }

    private async performInitialization(): Promise<void> {
        try {
            await this.storageModel.loadSettings();
            
            // Unsubscribe from previous subscription if exists
            if (this.settingsUnsubscribe) {
                this.settingsUnsubscribe();
                this.settingsUnsubscribe = null;
            }
            
            // Subscribe to settings changes
            this.settingsUnsubscribe = this.storageModel.getSettingsStore().subscribe((settings) => {
                console.log('DyslexiaController: Settings changed, applying:', settings);
                this.applySettings(settings);
            });

            // Get initial settings
            let initialSettings: DyslexiaSettings | null = null;
            const unsubscribe = this.storageModel.getSettingsStore().subscribe(settings => {
                initialSettings = settings;
            });
            unsubscribe();
            
            if (initialSettings) {
                console.log('DyslexiaController: Applying initial settings:', initialSettings);
                this.applySettings(initialSettings);
            }

            // Initialize event listeners only if we're in a document context
            if (typeof document !== 'undefined') {
                this.eventController.initialize();
            }
            
            this.isInitialized = true;
            console.log('DyslexiaController: Initialization complete');
        } catch (error) {
            console.error('DyslexiaController: Initialization failed:', error);
            throw error;
        }
    }

    public getSettingsStore() {
        return this.storageModel.getSettingsStore();
    }

    public async updateSetting<K extends keyof DyslexiaSettings>(
        key: K, 
        value: DyslexiaSettings[K]
    ): Promise<void> {
        console.log(`DyslexiaController: Updating setting ${key} to ${value}`);
        
        let currentSettings: DyslexiaSettings;
        const unsubscribe = this.storageModel.getSettingsStore().subscribe(settings => {
            currentSettings = settings;
        });
        unsubscribe();
        
        const newSettings = { ...currentSettings!, [key]: value };
        await this.storageModel.saveSettings(newSettings);
        
        // The settings store subscription will automatically call applySettings
    }

    public async resetSettings(): Promise<void> {
        console.log('DyslexiaController: Resetting settings');
        await this.storageModel.resetSettings();
        // The settings store subscription will automatically call applySettings
    }

    public speakText(text: string, rate?: number, voice?: string): void {
        if (rate && voice) {
            this.speechModel.speak(text, rate, voice);
        } else {
            // Get current settings from store
            let currentSettings: DyslexiaSettings;
            const unsubscribe = this.storageModel.getSettingsStore().subscribe(settings => {
                currentSettings = settings;
            });
            unsubscribe();
            this.speechModel.speak(text, currentSettings!.speechRate, currentSettings!.speechVoice);
        }
    }

    public speakSelectedText(): void {
        if (typeof window === 'undefined') return;
        
        const selection = window.getSelection();
        if (selection && selection.toString().trim()) {
            this.speakText(selection.toString());
        }
    }

    public getVoices(): SpeechSynthesisVoice[] {
        return this.speechModel.getVoices();
    }

    public stopSpeech(): void {
        this.speechModel.stop();
    }

    // Add public method to access DOMController
    public getDOMController(): DOMController {
        return this.domController;
    }

    private applySettings(settings: DyslexiaSettings): void {
        console.log('DyslexiaController: Applying settings:', settings);
        
        // Set current settings for features that need them
        this.domController.setCurrentSettings(settings);
        
        if (settings.enabled) {
            console.log('DyslexiaController: Extension enabled, applying all settings');
            this.domController.applyFontSettings(settings);
            this.domController.applyColorSettings(settings);
            this.domController.applyReadingAids(settings);
            
            // Apply line focus if enabled
            if (settings.lineFocus) {
                (this.domController as any).enableLineFocus(settings);
            } else {
                (this.domController as any).disableLineFocus();
            }
            
            // Start observing for dynamic content changes
            this.domController.startObserving(settings);
        } else {
            console.log('DyslexiaController: Extension disabled, removing all modifications');
            this.domController.removeAllModifications();
            this.domController.stopObserving();
            (this.domController as any).disableLineFocus();
        }
    }

    public destroy(): void {
        console.log('DyslexiaController: Destroying...');
        if (this.settingsUnsubscribe) {
            this.settingsUnsubscribe();
        }
        this.domController.stopObserving();
        this.domController.destroy();
        this.speechModel.stop();
        this.eventController.destroy();
        this.isInitialized = false;
        DyslexiaController.instance = null;
        DyslexiaController.initializationPromise = null;
        DyslexiaController.isInitializing = false;
    }
} 