import { writable, type Writable } from "svelte/store";

export type ColorMode = 'grayscale' | 'monochrome' | 'desaturated' | 'off';

export interface ChromophobiaSettings {
    enabled: boolean;
    colorMode: ColorMode;
    saturationLevel: number; // 0-100, where 0 is completely desaturated
    brightness: number; // 0-200, where 100 is normal
    contrast: number; // 0-200, where 100 is normal
}

export class ChromophobiaModel {
    private static instance: ChromophobiaModel;
    private settings: Writable<ChromophobiaSettings>;

    private constructor() {
        this.settings = this.createPersistentStore();
    }

    public static getInstance(): ChromophobiaModel {
        if (!ChromophobiaModel.instance) {
            ChromophobiaModel.instance = new ChromophobiaModel();
        }
        return ChromophobiaModel.instance;
    }

    public getSettings(): Writable<ChromophobiaSettings> {
        return this.settings;
    }

    public updateSettings(updater: (settings: ChromophobiaSettings) => ChromophobiaSettings): void {
        this.settings.update(updater);
    }

    public setSettings(settings: ChromophobiaSettings): void {
        this.settings.set(settings);
    }

    public toggleEnabled(): void {
        this.settings.update(s => ({ ...s, enabled: !s.enabled }));
    }

    public setColorMode(mode: ColorMode): void {
        this.settings.update(s => ({ ...s, colorMode: mode }));
    }

    public setSaturation(level: number): void {
        this.settings.update(s => ({ ...s, saturationLevel: level }));
    }

    public setBrightness(level: number): void {
        this.settings.update(s => ({ ...s, brightness: level }));
    }

    public setContrast(level: number): void {
        this.settings.update(s => ({ ...s, contrast: level }));
    }

    public resetToDefaults(): void {
        this.settings.set({
            enabled: false,
            colorMode: 'grayscale',
            saturationLevel: 0,
            brightness: 100,
            contrast: 100
        });
    }

    public getFilterString(settings: ChromophobiaSettings): string {
        return `grayscale(${settings.colorMode === 'grayscale' ? 100 : 0}%) 
                saturate(${settings.saturationLevel}%) 
                brightness(${settings.brightness}%) 
                contrast(${settings.contrast}%)
                ${settings.colorMode === 'monochrome' ? 'sepia(100%)' : ''}`;
    }

    public getCssClasses(settings: ChromophobiaSettings): string[] {
        const classes = ['inclusify-enabled'];
        
        switch (settings.colorMode) {
            case 'grayscale':
                classes.push('inclusify-grayscale');
                break;
            case 'monochrome':
                classes.push('inclusify-monochrome');
                break;
            case 'desaturated':
                classes.push('inclusify-desaturated');
                break;
        }
        
        return classes;
    }

    private createPersistentStore<T>(): Writable<ChromophobiaSettings> {
        const store = writable<ChromophobiaSettings>({
            enabled: false,
            colorMode: 'grayscale',
            saturationLevel: 0,
            brightness: 100,
            contrast: 100
        });

        function updateChromeStorage(value: ChromophobiaSettings): void {
            chrome.storage.sync.set({ chromophobiaSettings: value });
        }

        function watchChromeStorage() {
            chrome.storage.sync.onChanged.addListener((changes) => {
                if (Object.hasOwn(changes, 'chromophobiaSettings')) {
                    store.set(changes.chromophobiaSettings.newValue);
                }
            });
        }

        function initStoreFromChromeStorage() {
            chrome.storage.sync.get('chromophobiaSettings').then((result) => {
                if (Object.hasOwn(result, 'chromophobiaSettings')) {
                    store.set(result.chromophobiaSettings);
                }
            });
        }

        initStoreFromChromeStorage();
        watchChromeStorage();

        return {
            set(this: void, value: ChromophobiaSettings): void {
                store.set(value);
                updateChromeStorage(value);
            },
            update(this: void, updater: (value: ChromophobiaSettings) => ChromophobiaSettings): void {
                return store.update((prev: ChromophobiaSettings): ChromophobiaSettings => {
                    const value = updater(prev);
                    updateChromeStorage(value);
                    return value;
                });
            },
            subscribe: store.subscribe,
        };
    }
}

// Export singleton instance
export const chromophobiaModel = ChromophobiaModel.getInstance(); 