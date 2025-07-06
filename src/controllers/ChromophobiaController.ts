import { chromophobiaModel, type ChromophobiaSettings, type ColorMode } from "../models/ChromophobiaModel";

export class ChromophobiaController {
    private static instance: ChromophobiaController;

    private constructor() {}

    public static getInstance(): ChromophobiaController {
        if (!ChromophobiaController.instance) {
            ChromophobiaController.instance = new ChromophobiaController();
        }
        return ChromophobiaController.instance;
    }

    // Settings management
    public getSettings() {
        return chromophobiaModel.getSettings();
    }

    public toggleEnabled(): void {
        chromophobiaModel.toggleEnabled();
    }

    public setColorMode(mode: ColorMode): void {
        chromophobiaModel.setColorMode(mode);
    }

    public setSaturation(level: number): void {
        chromophobiaModel.setSaturation(level);
    }

    public setBrightness(level: number): void {
        chromophobiaModel.setBrightness(level);
    }

    public setContrast(level: number): void {
        chromophobiaModel.setContrast(level);
    }

    public resetToDefaults(): void {
        chromophobiaModel.resetToDefaults();
    }

    // Preset management
    public applyPreset(presetName: string): void {
        const presets = {
            'gentle': { saturationLevel: 20, brightness: 110, contrast: 90 },
            'moderate': { saturationLevel: 0, brightness: 100, contrast: 100 },
            'strong': { saturationLevel: 0, brightness: 90, contrast: 110 }
        };

        const preset = presets[presetName as keyof typeof presets];
        if (preset) {
            chromophobiaModel.updateSettings(s => ({ ...s, ...preset }));
        }
    }

    // UI state management
    public toggleControlsVisibility(isVisible: boolean): boolean {
        return !isVisible;
    }

    // Chrome extension specific actions
    public openSidePanel(): void {
        // Note: This requires a tab context, so it's handled in the UI components
        // where we have access to the current tab
    }

    public openOptions(): void {
        chrome.runtime.openOptionsPage();
    }

    // Content script helpers
    public applyFiltersToPage(settings: ChromophobiaSettings): void {
        const html = document.documentElement;
        const body = document.body;
        
        if (settings.enabled) {
            // Remove any existing classes
            html.classList.remove('inclusify-enabled', 'inclusify-grayscale', 'inclusify-monochrome', 'inclusify-desaturated');
            
            // Add the enabled class and specific color mode classes
            const cssClasses = chromophobiaModel.getCssClasses(settings);
            html.classList.add(...cssClasses);
            
            // Apply custom filter with user settings
            const filter = chromophobiaModel.getFilterString(settings);
            html.style.filter = filter;
            body.style.filter = filter;
            
        } else {
            // Remove all chromophobia-related classes and styles
            html.classList.remove('inclusify-enabled', 'inclusify-grayscale', 'inclusify-monochrome', 'inclusify-desaturated');
            html.style.filter = '';
            body.style.filter = '';
        }
    }

    // Keyboard shortcuts
    public handleKeyboardShortcut(event: KeyboardEvent): boolean {
        if (event.ctrlKey && event.shiftKey && event.key === 'C') {
            return true; // Indicates the shortcut was handled
        }
        return false;
    }

    // Validation
    public validateSaturationLevel(level: number): number {
        return Math.max(0, Math.min(100, level));
    }

    public validateBrightnessLevel(level: number): number {
        return Math.max(0, Math.min(200, level));
    }

    public validateContrastLevel(level: number): number {
        return Math.max(0, Math.min(200, level));
    }

    // Event handlers for form inputs
    public handleSaturationChange(event: Event): void {
        const value = parseInt((event.target as HTMLInputElement).value);
        const validatedValue = this.validateSaturationLevel(value);
        this.setSaturation(validatedValue);
    }

    public handleBrightnessChange(event: Event): void {
        const value = parseInt((event.target as HTMLInputElement).value);
        const validatedValue = this.validateBrightnessLevel(value);
        this.setBrightness(validatedValue);
    }

    public handleContrastChange(event: Event): void {
        const value = parseInt((event.target as HTMLInputElement).value);
        const validatedValue = this.validateContrastLevel(value);
        this.setContrast(validatedValue);
    }
}

// Export singleton instance
export const chromophobiaController = ChromophobiaController.getInstance(); 