import { writable, type Writable } from 'svelte/store';
import type { DyslexiaSettings } from './DyslexiaSettings';
import { DEFAULT_SETTINGS } from './DyslexiaSettings';

export class StorageModel {
    private settingsStore: Writable<DyslexiaSettings>;
    private static instance: StorageModel;

    private constructor() {
        this.settingsStore = writable<DyslexiaSettings>(DEFAULT_SETTINGS);
        
        // Listen for storage changes from other contexts
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.onChanged.addListener((changes, namespace) => {
                if (namespace === 'sync' && changes.dyslexiaSettings) {
                    const newSettings = changes.dyslexiaSettings.newValue;
                    if (newSettings) {
                        console.log('StorageModel: Settings changed from storage:', newSettings);
                        this.settingsStore.set({ ...DEFAULT_SETTINGS, ...newSettings });
                    }
                }
            });
        }
    }

    public static getInstance(): StorageModel {
        if (!StorageModel.instance) {
            StorageModel.instance = new StorageModel();
        }
        return StorageModel.instance;
    }

    public getSettingsStore(): Writable<DyslexiaSettings> {
        return this.settingsStore;
    }

    public async loadSettings(): Promise<void> {
        try {
            console.log('StorageModel: Loading settings from storage...');
            
            if (typeof chrome === 'undefined' || !chrome.storage) {
                console.warn('StorageModel: Chrome storage not available, using defaults');
                this.settingsStore.set(DEFAULT_SETTINGS);
                return;
            }
            
            // Check if extension context is still valid
            if (!chrome.runtime?.id) {
                console.warn('StorageModel: Extension context invalidated, trying localStorage fallback');
                this.loadFromLocalStorage();
                return;
            }
            
            const result = await chrome.storage.sync.get('dyslexiaSettings');
            console.log('StorageModel: Storage result:', result);
            
            if (result.dyslexiaSettings) {
                const settings = { ...DEFAULT_SETTINGS, ...result.dyslexiaSettings };
                console.log('StorageModel: Loaded settings:', settings);
                this.settingsStore.set(settings);
            } else {
                console.log('StorageModel: No saved settings found, trying localStorage fallback');
                this.loadFromLocalStorage();
            }
        } catch (error) {
            console.error('StorageModel: Error loading settings:', error);
            
            // Handle extension context invalidation
            if (error.message?.includes('Extension context invalidated') || 
                error.message?.includes('context invalidated')) {
                console.warn('StorageModel: Extension context invalidated, trying localStorage fallback');
                this.loadFromLocalStorage();
            } else {
                console.log('StorageModel: Using default settings due to error');
                this.settingsStore.set(DEFAULT_SETTINGS);
            }
        }
    }

    private loadFromLocalStorage(): void {
        try {
            const savedSettings = localStorage.getItem('inclusify_dyslexia_settings');
            if (savedSettings) {
                const settings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
                console.log('StorageModel: Loaded settings from localStorage:', settings);
                this.settingsStore.set(settings);
            } else {
                console.log('StorageModel: No localStorage settings found, using defaults');
                this.settingsStore.set(DEFAULT_SETTINGS);
            }
        } catch (error) {
            console.error('StorageModel: Error loading from localStorage:', error);
            console.log('StorageModel: Using default settings due to localStorage error');
            this.settingsStore.set(DEFAULT_SETTINGS);
        }
    }

    public async saveSettings(settings: DyslexiaSettings): Promise<void> {
        try {
            console.log('StorageModel: Saving settings:', settings);
            
            if (typeof chrome === 'undefined' || !chrome.storage) {
                console.warn('StorageModel: Chrome storage not available, skipping save');
                this.settingsStore.set(settings);
                return;
            }
            
            // Check if extension context is still valid
            if (!chrome.runtime?.id) {
                console.warn('StorageModel: Extension context invalidated, using local storage fallback');
                this.settingsStore.set(settings);
                return;
            }
            
            await chrome.storage.sync.set({ dyslexiaSettings: settings });
            this.settingsStore.set(settings);
            console.log('StorageModel: Settings saved successfully');
        } catch (error) {
            console.error('StorageModel: Error saving settings:', error);
            
            // Handle extension context invalidation
            if (error.message?.includes('Extension context invalidated') || 
                error.message?.includes('context invalidated')) {
                console.warn('StorageModel: Extension context invalidated, using local storage fallback');
                // Try to save to localStorage as fallback
                try {
                    localStorage.setItem('inclusify_dyslexia_settings', JSON.stringify(settings));
                    console.log('StorageModel: Settings saved to localStorage as fallback');
                } catch (localError) {
                    console.error('StorageModel: Failed to save to localStorage:', localError);
                }
            }
            
            // Still update the store even if storage fails
            this.settingsStore.set(settings);
        }
    }

    public async resetSettings(): Promise<void> {
        console.log('StorageModel: Resetting settings to defaults');
        try {
            await this.saveSettings(DEFAULT_SETTINGS);
        } catch (error) {
            console.error('StorageModel: Error resetting settings:', error);
            // Still update the store even if storage fails
            this.settingsStore.set(DEFAULT_SETTINGS);
        }
    }
} 