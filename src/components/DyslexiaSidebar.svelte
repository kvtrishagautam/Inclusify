<script lang="ts">
    import { onMount } from 'svelte';
    import { DyslexiaController } from '../controllers/DyslexiaController';
    import type { DyslexiaSettings } from '../models/DyslexiaSettings';

    let controller: DyslexiaController;
    let settings: any;
    let currentSettings: DyslexiaSettings = {
        enabled: true,
        
        textToSpeech: false,
        speechRate: 1.0,
        speechVoice: "",
        
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
        
        analyze: false
    };

    let isVisible = false;
    let isPopup = false;

    onMount(() => {
        // Check if we're in popup mode
        isPopup = window.location.href.includes('popup.html');
        
        // Use the singleton DyslexiaController
        controller = DyslexiaController.getInstance();
        settings = controller.getSettingsStore();
        
        // Subscribe to settings changes
        settings.subscribe((newSettings) => {
            console.log('Sidebar: Settings updated:', newSettings);
            currentSettings = { ...newSettings };
        });
        
        // In popup mode, show the sidebar automatically
        if (isPopup) {
            isVisible = true;
        }
    });

    function toggleSidebar() {
        isVisible = !isVisible;
    }

    async function updateSetting(key: string, value: any) {
        try {
            console.log(`Sidebar: Updating ${key} to ${value}`);
            await controller.updateSetting(key, value);
        } catch (error) {
            console.error('Failed to update setting:', error);
        }
    }

    function resetSettings() {
        controller.resetSettings();
    }

    // Listen for keyboard shortcut to toggle sidebar
    onMount(() => {
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.shiftKey && event.key === 'B') {
                event.preventDefault();
                toggleSidebar();
            }
        });
    });
</script>

<!-- Floating Icon (appears when extension is enabled) -->
{#if currentSettings.enabled && !isPopup}
    <button 
        class="floating-icon" 
        onclick={toggleSidebar} 
        onkeydown={(e) => e.key === 'Enter' && toggleSidebar()}
        title="Dyslexia Helper (Click to open settings)"
        aria-label="Open Dyslexia Helper Settings"
    >
        <span class="floating-icon-text">📖</span>
    </button>
{/if}

<!-- Toggle button (only show in content script mode when not enabled) -->
{#if !isPopup && !currentSettings.enabled}
    <button 
        class="sidebar-toggle" 
        onclick={toggleSidebar}
        title="Dyslexia Helper Sidebar (Ctrl+Shift+B)"
    >
        <span class="toggle-icon">📖</span>
    </button>
{/if}

<!-- Sidebar -->
{#if isVisible}
    {#if !isPopup}
        <div class="sidebar-overlay" onclick={toggleSidebar} onkeydown={(e) => e.key === 'Escape' && toggleSidebar()} role="button" tabindex="0"></div>
    {/if}
    <div class="dyslexia-sidebar" class:popup-mode={isPopup} data-dyslexia-sidebar="true">
        <div class="sidebar-header">
            <h3>Dyslexia Helper</h3>
            {#if !isPopup}
                <button class="close-btn" onclick={toggleSidebar}>×</button>
            {/if}
        </div>

        <div class="sidebar-content">
            <!-- Main toggle -->
            <div class="setting-group">
                <label class="toggle-label">
                    <input 
                        type="checkbox" 
                        checked={currentSettings.enabled}
                        onchange={() => updateSetting('enabled', !currentSettings.enabled)}
                    />
                    <span class="toggle-text">Enable Dyslexia Helper</span>
                </label>
            </div>

            {#if currentSettings.enabled}
                <!-- Quick Actions -->
                <div class="setting-group">
                    <h4>Quick Actions</h4>
                    <div class="action-buttons">
                        <button class="action-btn" onclick={resetSettings}>
                            🔄 Reset Settings
                        </button>
                    </div>
                </div>

                <!-- Font Settings -->
                <div class="setting-group">
                    <h4>Font Settings</h4>
                    <div class="setting-row">
                        <label for="custom-font">Font:</label>
                        <select 
                            id="custom-font"
                            value={currentSettings.customFont}
                            onchange={(e) => updateSetting('customFont', e.target.value)}
                        >
                            <option value="OpenDyslexic">OpenDyslexic</option>
                            <option value="Comic Sans">Comic Sans</option>
                            <option value="Arial">Arial</option>
                            <option value="Verdana">Verdana</option>
                            <option value="Tahoma">Tahoma</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Trebuchet MS">Trebuchet MS</option>
                        </select>
                    </div>
                    
                    <div class="setting-row">
                        <label for="font-size">Font Size:</label>
                        <input 
                            id="font-size"
                            type="range" 
                            min="50" 
                            max="200" 
                            step="10"
                            value={currentSettings.fontSize}
                            onchange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                        />
                        <span>{currentSettings.fontSize}%</span>
                    </div>
                    
                    <div class="setting-row">
                        <label for="line-spacing">Line Spacing:</label>
                        <input 
                            id="line-spacing"
                            type="range" 
                            min="50" 
                            max="200" 
                            step="10"
                            value={currentSettings.lineSpacing}
                            onchange={(e) => updateSetting('lineSpacing', parseInt(e.target.value))}
                        />
                        <span>{currentSettings.lineSpacing}%</span>
                    </div>
                    <div class="setting-row">
                        <label for="word-spacing">Word Spacing:</label>
                        <input 
                            id="word-spacing"
                            type="range" 
                            min="50" 
                            max="200" 
                            step="10"
                            value={currentSettings.wordSpacing}
                            onchange={(e) => updateSetting('wordSpacing', parseInt(e.target.value))}
                        />
                        <span>{currentSettings.wordSpacing}%</span>
                    </div>
                </div>

                <!-- Visual Aids -->
                <div class="setting-group">
                    <h4>Visual Aids</h4>
                    <label class="toggle-label">
                        <input 
                            type="checkbox" 
                            checked={currentSettings.highContrast}
                            onchange={() => updateSetting('highContrast', !currentSettings.highContrast)}
                        />
                        <span class="toggle-text">High Contrast</span>
                    </label>
                    
                    <label class="toggle-label">
                        <input 
                            type="checkbox" 
                            checked={currentSettings.highlightLinks}
                            onchange={() => updateSetting('highlightLinks', !currentSettings.highlightLinks)}
                        />
                        <span class="toggle-text">Highlight Links</span>
                    </label>
                    
                    <label class="toggle-label">
                        <input 
                            type="checkbox" 
                            checked={currentSettings.focusMode}
                            onchange={() => updateSetting('focusMode', !currentSettings.focusMode)}
                        />
                        <span class="toggle-text">Focus Mode</span>
                    </label>
                    
                    <label class="toggle-label">
                        <input 
                            type="checkbox" 
                            checked={currentSettings.lineFocus}
                            onchange={() => updateSetting('lineFocus', !currentSettings.lineFocus)}
                        />
                        <span class="toggle-text">Line Focus</span>
                    </label>
                </div>



                <!-- Advanced Features -->
                <div class="setting-group">
                    <h4>Advanced Features</h4>
                    <label class="toggle-label">
                        <input 
                            type="checkbox" 
                            checked={currentSettings.readingMode}
                            onchange={() => updateSetting('readingMode', !currentSettings.readingMode)}
                        />
                        <span class="toggle-text">Reading Mode</span>
                    </label>
                    
                    <label class="toggle-label">
                        <input 
                            type="checkbox" 
                            checked={currentSettings.dyslexiaRuler}
                            onchange={() => updateSetting('dyslexiaRuler', !currentSettings.dyslexiaRuler)}
                        />
                        <span class="toggle-text">Dyslexia Ruler</span>
                    </label>
                    
                   
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    .floating-icon {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        color: white;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulse 2s infinite;
    }

    .floating-icon:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    }

    .floating-icon-text {
        font-size: 24px;
    }

    @keyframes pulse {
        0% {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        100% {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
    }

    .sidebar-toggle {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        transition: all 0.3s ease;
    }

    .sidebar-toggle:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    }

    .sidebar-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.3);
        z-index: 10001;
        /* Allow clicks to pass through to page content */
        pointer-events: auto;
        /* Ensure it doesn't block page interactions */
        user-select: none;
    }

    .dyslexia-sidebar {
        position: fixed;
        top: 0;
        right: 0;
        width: 350px;
        height: 100vh;
        background: white;
        box-shadow: -4px 0 12px rgba(0, 0, 0, 0.2);
        z-index: 10002;
        overflow-y: auto;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        /* Ensure sidebar doesn't block page interactions */
        pointer-events: auto;
    }

    /* Popup mode styles */
    :global(.dyslexia-sidebar.popup-mode) {
        position: static;
        width: 100%;
        height: auto;
        max-height: 500px;
        box-shadow: none;
        border: 1px solid #ddd;
        border-radius: 8px;
    }

    .sidebar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        position: sticky;
        top: 0;
        z-index: 1;
    }

    .sidebar-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
    }

    .close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .sidebar-content {
        padding: 20px;
    }

    .setting-group {
        margin-bottom: 24px;
    }

    .setting-group h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 600;
        color: #333;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .setting-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
    }

    .setting-row label {
        min-width: 80px;
        font-size: 14px;
        color: #555;
    }

    .setting-row input[type="range"] {
        flex: 1;
        height: 6px;
        border-radius: 3px;
        background: #ddd;
        outline: none;
        -webkit-appearance: none;
    }

    .setting-row input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #667eea;
        cursor: pointer;
    }

    .setting-row select {
        flex: 1;
        padding: 6px 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
    }

    .setting-row span {
        min-width: 40px;
        font-size: 12px;
        color: #666;
        text-align: right;
    }

    .toggle-label {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        cursor: pointer;
    }

    .toggle-label input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: #667eea;
    }

    .toggle-text {
        font-size: 14px;
        color: #333;
    }

    .action-buttons {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }

    .action-btn {
        background: #667eea;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 8px;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s ease;
        flex: 1;
        min-width: 120px;
    }

    .action-btn:hover {
        background: #5a6fd8;
        transform: translateY(-1px);
    }

    /* Scrollbar styling */
    .dyslexia-sidebar::-webkit-scrollbar {
        width: 6px;
    }

    .dyslexia-sidebar::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
    }

    .dyslexia-sidebar::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 3px;
    }

    .dyslexia-sidebar::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
    }

    /* Responsive design */
    @media (max-width: 480px) {
        .dyslexia-sidebar {
            width: 100vw;
        }

        .floating-icon {
            top: 15px;
            right: 15px;
            width: 45px;
            height: 45px;
            font-size: 18px;
        }

        .sidebar-content {
            padding: 15px;
        }
    }
</style> 