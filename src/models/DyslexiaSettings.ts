export interface DyslexiaSettings {
    // Core settings
    enabled: boolean;
    
    // Font settings
    customFont: string;
    fontSize: number; // percentage
    lineSpacing: number; // percentage
    wordSpacing: number; // percentage
    letterSpacing: number; // percentage
    
    // Color settings
    colorOverlay: boolean;
    overlayColor: string;
    overlayOpacity: number; // 0 to 1
    highContrast: boolean;
    highContrastMode: 'increased' | 'greyscale' | 'inverted' | 'inverted-greyscale' | 'yellow-on-black';
    
    // Reading aids
    focusMode: boolean;
    simplifyPage: boolean;
    highlightLinks: boolean;
    
    // NEW FEATURES - Reading Mode
    readingMode: boolean;
    readingModeRemoveAds: boolean;
    readingModeRemoveImages: boolean;
    readingModeRemoveSidebars: boolean;
    
    // NEW FEATURES - Dyslexia Ruler
    dyslexiaRuler: boolean;
    rulerColor: string;
    rulerOpacity: number;
    rulerHeight: number;
    
    // NEW FEATURES - Speed Reading
    speedReading: boolean;
    speedReadingWPM: number;
    speedReadingColor: string;
    speedReadingBoldMiddle: boolean;
    speedReadingPhonics: boolean;
    
    // NEW FEATURES - Text Highlighting
    textHighlighting: boolean;
    highlightColor: string;
    
    // NEW FEATURES - Dictionary
    dictionary: boolean;
    dictionaryLanguage: string;
    
    // NEW FEATURES - Notes
    notes: boolean;
    
    // NEW FEATURES - Screenshot
    screenshot: boolean;
    
    // NEW FEATURES - Magnifier
    magnifier: boolean;
    magnifierLevel: number;
    
    // NEW FEATURES - Cursor Control
    cursorControl: boolean;
    cursorSize: number;
    cursorColor: string;
    
    // NEW FEATURES - Text Stroke (for color blindness)
    textStroke: boolean;
    textStrokeColor: string;
    textStrokeWidth: number;
    
    // NEW FEATURES - Emphasize Links
    emphasizeLinks: boolean;
    emphasizeLinksColor: string;
    
    // NEW FEATURES - Line Focus
    lineFocus: boolean;
    lineFocusColor: string;
    lineFocusOpacity: number;
    lineFocusHeight: number;
    
    // NEW FEATURES - Reading Guide
    readingGuide: boolean;
    readingGuideColor: string;
    readingGuideWidth: number;
    
    // NEW FEATURES - Summarize
    summarize: boolean;
    
    // NEW FEATURES - OCR
    ocr: boolean;
    
    // NEW FEATURES - Bookmarks
    bookmarks: boolean;
    
    // NEW FEATURES - Analyze
    analyze: boolean;
}

export const DEFAULT_SETTINGS: DyslexiaSettings = {
    enabled: false,
    
    customFont: "OpenDyslexic",
    fontSize: 100,
    lineSpacing: 100,
    wordSpacing: 100,
    letterSpacing: 100,
    
    colorOverlay: false,
    overlayColor: "#ffff00",
    overlayOpacity: 0.3,
    highContrast: false,
    highContrastMode: 'increased',
    
    focusMode: false,
    simplifyPage: false,
    highlightLinks: true,
    
    readingMode: false,
    readingModeRemoveAds: false,
    readingModeRemoveImages: false,
    readingModeRemoveSidebars: false,
    
    dyslexiaRuler: false,
    rulerColor: "#000000",
    rulerOpacity: 0.5,
    rulerHeight: 20,
    
    speedReading: false,
    speedReadingWPM: 200,
    speedReadingColor: "#000000",
    speedReadingBoldMiddle: true,
    speedReadingPhonics: true,
    
    textHighlighting: false,
    highlightColor: "#0000ff",
    
    dictionary: false,
    dictionaryLanguage: "en",
    
    notes: false,
    
    screenshot: false,
    
    magnifier: false,
    magnifierLevel: 2,
    
    cursorControl: false,
    cursorSize: 10,
    cursorColor: "#000000",
    
    textStroke: false,
    textStrokeColor: "#000000",
    textStrokeWidth: 1,
    
    emphasizeLinks: false,
    emphasizeLinksColor: "#0000ff",
    
    lineFocus: false,
    lineFocusColor: "#ffff00",
    lineFocusOpacity: 0.3,
    lineFocusHeight: 30,
    
    readingGuide: false,
    readingGuideColor: "#000000",
    readingGuideWidth: 2,
    
    summarize: false,
    
    ocr: false,
    
    bookmarks: false,
    
    analyze: false,
}; 