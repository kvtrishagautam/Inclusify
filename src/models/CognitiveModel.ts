import { writable, type Writable } from "svelte/store";

export interface CognitiveSettings {
    enabled: boolean;
    bigCursor: boolean;
    readingMask: boolean;
    readingGuide: boolean;
    // Additional settings for fine-tuning
    fontSize: number; // 100-200 for font size scaling
    lineSpacing: number; // 1.2-2.0 for line spacing
    contrast: number; // 100-200 for contrast adjustment
    cursorSize: number; // 20-60 for cursor size
    maskOpacity: number; // 20-80 for reading mask opacity
    guideColor: string; // color for reading guide
}

export class CognitiveModel {
    private static instance: CognitiveModel;
    private settings: Writable<CognitiveSettings>;

    private constructor() {
        this.settings = this.createPersistentStore();
    }

    public static getInstance(): CognitiveModel {
        if (!CognitiveModel.instance) {
            CognitiveModel.instance = new CognitiveModel();
        }
        return CognitiveModel.instance;
    }

    public getSettings(): Writable<CognitiveSettings> {
        return this.settings;
    }

    public updateSettings(updater: (settings: CognitiveSettings) => CognitiveSettings): void {
        this.settings.update(updater);
    }

    public setSettings(settings: CognitiveSettings): void {
        this.settings.set(settings);
    }

    public toggleEnabled(): void {
        this.settings.update(s => ({ ...s, enabled: !s.enabled }));
    }

    public toggleBigCursor(): void {
        this.settings.update(s => ({ ...s, bigCursor: !s.bigCursor }));
    }

    public toggleReadingMask(): void {
        this.settings.update(s => ({ ...s, readingMask: !s.readingMask }));
    }

    public toggleReadingGuide(): void {
        this.settings.update(s => ({ ...s, readingGuide: !s.readingGuide }));
    }

    public setFontSize(value: number): void {
        this.settings.update(s => ({ ...s, fontSize: value }));
    }

    public setLineSpacing(value: number): void {
        this.settings.update(s => ({ ...s, lineSpacing: value }));
    }

    public setContrast(value: number): void {
        this.settings.update(s => ({ ...s, contrast: value }));
    }

    public setCursorSize(value: number): void {
        this.settings.update(s => ({ ...s, cursorSize: value }));
    }

    public setMaskOpacity(value: number): void {
        this.settings.update(s => ({ ...s, maskOpacity: value }));
    }

    public setGuideColor(value: string): void {
        this.settings.update(s => ({ ...s, guideColor: value }));
    }

    public resetToDefaults(): void {
        this.settings.set({
            enabled: false,
            bigCursor: false,
            readingMask: false,
            readingGuide: false,
            fontSize: 105,
            lineSpacing: 1.3,
            contrast: 110,
            cursorSize: 30,
            maskOpacity: 50,
            guideColor: '#ffeb3b'
        });
    }

    public getCssClasses(settings: CognitiveSettings): string[] {
        const classes = [];
        
        if (settings.enabled) {
            classes.push('inclusify-cognitive-enabled');
            
            if (settings.bigCursor) classes.push('inclusify-big-cursor');
            if (settings.readingMask) classes.push('inclusify-reading-mask');
            if (settings.readingGuide) classes.push('inclusify-reading-guide');
        }
        
        return classes;
    }

    public getCssVariables(settings: CognitiveSettings): string {
        if (!settings.enabled) return '';
        
        return `
            --inclusify-font-size: ${settings.fontSize}%;
            --inclusify-line-spacing: ${settings.lineSpacing};
            --inclusify-contrast: ${settings.contrast}%;
            --inclusify-cursor-size: ${settings.cursorSize}px;
            --inclusify-mask-opacity: ${settings.maskOpacity}%;
            --inclusify-guide-color: ${settings.guideColor};
        `;
    }

    private createPersistentStore<T>(): Writable<CognitiveSettings> {
        const store = writable<CognitiveSettings>({
            enabled: false,
            bigCursor: false,
            readingMask: false,
            readingGuide: false,
            fontSize: 105,
            lineSpacing: 1.3,
            contrast: 110,
            cursorSize: 30,
            maskOpacity: 50,
            guideColor: '#ffeb3b'
        });

        function updateChromeStorage(value: CognitiveSettings): void {
            chrome.storage.sync.set({ cognitiveSettings: value });
        }

        function watchChromeStorage() {
            chrome.storage.sync.onChanged.addListener((changes) => {
                if (Object.hasOwn(changes, 'cognitiveSettings')) {
                    store.set(changes.cognitiveSettings.newValue);
                }
            });
        }

        function initStoreFromChromeStorage() {
            chrome.storage.sync.get('cognitiveSettings').then((result) => {
                if (Object.hasOwn(result, 'cognitiveSettings')) {
                    store.set(result.cognitiveSettings);
                }
            });
        }

        initStoreFromChromeStorage();
        watchChromeStorage();

        return {
            set(this: void, value: CognitiveSettings): void {
                store.set(value);
                updateChromeStorage(value);
            },
            update(this: void, updater: (value: CognitiveSettings) => CognitiveSettings): void {
                return store.update((prev: CognitiveSettings): CognitiveSettings => {
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
export const cognitiveModel = CognitiveModel.getInstance(); 