<script lang="ts">
    import { chromophobiaSettings, type ColorMode } from "../storage";

    let settings = $chromophobiaSettings;

    // Subscribe to settings changes
    chromophobiaSettings.subscribe((value) => {
        settings = value;
    });

    function toggleEnabled() {
        chromophobiaSettings.update(s => ({ ...s, enabled: !s.enabled }));
    }

    function setColorMode(mode: ColorMode) {
        chromophobiaSettings.update(s => ({ ...s, colorMode: mode }));
    }

    function openOptions() {
        chrome.runtime.openOptionsPage();
    }

    function openSidePanel() {
        chrome.sidePanel.open();
    }
</script>

<div class="popup-container">
    <div class="header">
        <h2>Inclusify</h2>
        <p class="subtitle">Chromophobia-Friendly Browser</p>
    </div>

    <div class="main-toggle">
        <label class="toggle-switch">
            <input 
                type="checkbox" 
                checked={settings.enabled} 
                on:change={toggleEnabled}
            />
            <span class="slider"></span>
        </label>
        <span class="toggle-label">
            {settings.enabled ? 'Color-Free Mode ON' : 'Color-Free Mode OFF'}
        </span>
    </div>

    {#if settings.enabled}
        <div class="mode-selector">
            <fieldset>
                <legend>Quick Mode:</legend>
                <div class="mode-buttons">
                    <button 
                        class="mode-btn {settings.colorMode === 'grayscale' ? 'active' : ''}"
                        on:click={() => setColorMode('grayscale')}
                        aria-pressed={settings.colorMode === 'grayscale'}
                    >
                        Grayscale
                    </button>
                    <button 
                        class="mode-btn {settings.colorMode === 'monochrome' ? 'active' : ''}"
                        on:click={() => setColorMode('monochrome')}
                        aria-pressed={settings.colorMode === 'monochrome'}
                    >
                        Monochrome
                    </button>
                    <button 
                        class="mode-btn {settings.colorMode === 'desaturated' ? 'active' : ''}"
                        on:click={() => setColorMode('desaturated')}
                        aria-pressed={settings.colorMode === 'desaturated'}
                    >
                        Desaturated
                    </button>
                </div>
            </fieldset>
        </div>

        <div class="current-settings">
            <div class="setting-item">
                <span>Saturation: {settings.saturationLevel}%</span>
            </div>
            <div class="setting-item">
                <span>Brightness: {settings.brightness}%</span>
            </div>
            <div class="setting-item">
                <span>Contrast: {settings.contrast}%</span>
            </div>
        </div>
    {/if}

    <div class="actions">
        <button class="action-btn" on:click={openSidePanel}>
            <span class="icon">⚙️</span>
            Advanced Settings
        </button>
        <button class="action-btn" on:click={openOptions}>
            <span class="icon">🔧</span>
            Options
        </button>
    </div>

    <div class="footer">
        <small>Press Ctrl+Shift+C on any page to open controls</small>
    </div>
</div>

<style>
    .popup-container {
        width: 320px;
        padding: 16px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .header {
        text-align: center;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid #e9ecef;
    }

    .header h2 {
        margin: 0 0 4px 0;
        color: #333;
        font-size: 20px;
        font-weight: 600;
    }

    .subtitle {
        margin: 0;
        color: #666;
        font-size: 12px;
    }

    .main-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin-bottom: 16px;
        padding: 12px;
        background-color: #f8f9fa;
        border-radius: 8px;
    }

    .toggle-switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;
    }

    .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: 0.3s;
        border-radius: 24px;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
    }

    input:checked + .slider {
        background-color: #007bff;
    }

    input:checked + .slider:before {
        transform: translateX(26px);
    }

    .toggle-label {
        font-weight: 500;
        color: #333;
        font-size: 14px;
    }

    .mode-selector {
        margin-bottom: 16px;
    }

    .mode-selector legend {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #333;
        font-size: 14px;
    }

    .mode-buttons {
        display: flex;
        gap: 4px;
    }

    .mode-btn {
        flex: 1;
        padding: 6px 8px;
        border: 1px solid #dee2e6;
        background-color: #ffffff;
        color: #333;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 12px;
        font-weight: 500;
    }

    .mode-btn:hover {
        border-color: #adb5bd;
        background-color: #f8f9fa;
    }

    .mode-btn.active {
        background-color: #007bff;
        border-color: #007bff;
        color: #ffffff;
    }

    .current-settings {
        margin-bottom: 16px;
        padding: 12px;
        background-color: #f8f9fa;
        border-radius: 6px;
    }

    .setting-item {
        margin-bottom: 4px;
        font-size: 12px;
        color: #666;
    }

    .setting-item:last-child {
        margin-bottom: 0;
    }

    .actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 12px;
    }

    .action-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border: 1px solid #dee2e6;
        background-color: #ffffff;
        color: #333;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 13px;
        font-weight: 500;
    }

    .action-btn:hover {
        border-color: #adb5bd;
        background-color: #f8f9fa;
    }

    .icon {
        font-size: 14px;
    }

    .footer {
        text-align: center;
        padding-top: 12px;
        border-top: 1px solid #e9ecef;
    }

    .footer small {
        color: #666;
        font-size: 11px;
    }
</style> 