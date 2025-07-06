export interface DyslexiaSettings {
    enabled: boolean;
    fontFamily: string;
    fontSize: number;
    lineSpacing: number;
    wordSpacing: number;
    letterSpacing: number;
    colorOverlay: boolean;
    focusMode: boolean;
    lineFocus: boolean;
    highContrast: boolean;
    linkHighlighting: boolean;
    readingMode: boolean;
    dyslexiaRuler: boolean;
    magnifier: boolean;
}

export const DEFAULT_DYSLEXIA_SETTINGS: DyslexiaSettings = {
    enabled: false,
    fontFamily: 'OpenDyslexic',
    fontSize: 16,
    lineSpacing: 1.5,
    wordSpacing: 0.16,
    letterSpacing: 0.12,
    colorOverlay: false,
    focusMode: false,
    lineFocus: false,
    highContrast: false,
    linkHighlighting: false,
    readingMode: false,
    dyslexiaRuler: false,
    magnifier: false
}; 