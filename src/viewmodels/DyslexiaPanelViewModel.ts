import { writable, type Writable } from 'svelte/store';
import { DyslexiaController } from '../controllers/DyslexiaController';
import type { DyslexiaSettings } from '../models/DyslexiaSettings';

export class DyslexiaPanelViewModel {
    private controller: DyslexiaController;
    private settingsStore: Writable<DyslexiaSettings>;
    private panelStateStore: Writable<{ isVisible: boolean; isPopup: boolean }>;
    private voicesStore: Writable<SpeechSynthesisVoice[]>;

    constructor() {
        this.controller = DyslexiaController.getInstance();
        this.settingsStore = this.controller.getSettingsStore();
        this.panelStateStore = writable({ isVisible: false, isPopup: false });
        this.voicesStore = writable([]);
    }

    public async initialize(isPopup: boolean = false): Promise<void> {
        // Update panel state
        this.panelStateStore.set({ isVisible: isPopup, isPopup });

        // Load voices after a short delay to ensure speech synthesis is ready
        setTimeout(() => {
            const voices = this.controller.getVoices();
            this.voicesStore.set(voices);
        }, 100);

        // If not in popup mode, set up visibility toggle
        if (!isPopup) {
            this.setupVisibilityToggle();
        }
    }

    private setupVisibilityToggle(): void {
        if (typeof document === 'undefined') return;
        
        // Add a global click handler to close panel when clicking outside
        document.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.dyslexia-panel') && !target.closest('.dyslexia-fab')) {
                this.panelStateStore.update(state => ({ ...state, isVisible: false }));
            }
        });
    }

    public getSettingsStore(): Writable<DyslexiaSettings> {
        return this.settingsStore;
    }

    public getPanelStateStore(): Writable<{ isVisible: boolean; isPopup: boolean }> {
        return this.panelStateStore;
    }

    public getVoicesStore(): Writable<SpeechSynthesisVoice[]> {
        return this.voicesStore;
    }

    public togglePanel(): void {
        this.panelStateStore.update(state => ({ ...state, isVisible: !state.isVisible }));
    }

    public async updateSetting<K extends keyof DyslexiaSettings>(
        key: K, 
        value: DyslexiaSettings[K]
    ): Promise<void> {
        await this.controller.updateSetting(key, value);
    }

    public async resetSettings(): Promise<void> {
        await this.controller.resetSettings();
    }

    public speakSelectedText(): void {
        this.controller.speakSelectedText();
    }

    public stopSpeech(): void {
        this.controller.stopSpeech();
    }
} 