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

    function updateSaturation(event: Event) {
        const value = parseInt((event.target as HTMLInputElement).value);
        chromophobiaSettings.update(s => ({ ...s, saturationLevel: value }));
    }

    function updateBrightness(event: Event) {
        const value = parseInt((event.target as HTMLInputElement).value);
        chromophobiaSettings.update(s => ({ ...s, brightness: value }));
    }

    function updateContrast(event: Event) {
        const value = parseInt((event.target as HTMLInputElement).value);
        chromophobiaSettings.update(s => ({ ...s, contrast: value }));
    }

    function applyPreset(presetName: string) {
        const presets = {
            'gentle': { saturationLevel: 20, brightness: 110, contrast: 90 },
            'moderate': { saturationLevel: 0, brightness: 100, contrast: 100 },
            'strong': { saturationLevel: 0, brightness: 90, contrast: 110 }
        };

        const preset = presets[presetName as keyof typeof presets];
        if (preset) {
            chromophobiaSettings.update(s => ({ ...s, ...preset }));
        }
    }

    function resetToDefaults() {
        chromophobiaSettings.set({
            enabled: false,
            colorMode: 'grayscale',
            saturationLevel: 0,
            brightness: 100,
            contrast: 100
        });
    }
</script>

<div class="sidepanel-container">
    <div class="header">
        <h1>Inclusify</h1>
        <p class="subtitle">Advanced Chromophobia Settings</p>
    </div>

    <div class="main-toggle-section">
        <div class="toggle-container">
            <label class="toggle-switch">
                <input 
                    type="checkbox" 
                    checked={settings.enabled} 
                    on:change={toggleEnabled}
                />
                <span class="slider"></span>
            </label>
            <div class="toggle-info">
                <span class="toggle-label">
                    {settings.enabled ? 'Color-Free Mode Active' : 'Color-Free Mode Inactive'}
                </span>
                <span class="toggle-description">
                    {settings.enabled ? 'Webpage colors are being filtered' : 'Webpage colors are displayed normally'}
                </span>
            </div>
        </div>
    </div>

    {#if settings.enabled}
        <div class="settings-section">
            <h3>Color Mode</h3>
            <div class="mode-grid">
                <button 
                    class="mode-card {settings.colorMode === 'grayscale' ? 'active' : ''}"
                    on:click={() => setColorMode('grayscale')}
                >
                    <div class="mode-preview grayscale"></div>
                    <span>Grayscale</span>
                    <small>Pure black and white</small>
                </button>
                <button 
                    class="mode-card {settings.colorMode === 'monochrome' ? 'active' : ''}"
                    on:click={() => setColorMode('monochrome')}
                >
                    <div class="mode-preview monochrome"></div>
                    <span>Monochrome</span>
                    <small>Sepia tone effect</small>
                </button>
                <button 
                    class="mode-card {settings.colorMode === 'desaturated' ? 'active' : ''}"
                    on:click={() => setColorMode('desaturated')}
                >
                    <div class="mode-preview desaturated"></div>
                    <span>Desaturated</span>
                    <small>Reduced color intensity</small>
                </button>
            </div>
        </div>

        <div class="settings-section">
            <h3>Quick Presets</h3>
            <div class="preset-buttons">
                <button 
                    class="preset-btn"
                    on:click={() => applyPreset('gentle')}
                >
                    Gentle
                </button>
                <button 
                    class="preset-btn"
                    on:click={() => applyPreset('moderate')}
                >
                    Moderate
                </button>
                <button 
                    class="preset-btn"
                    on:click={() => applyPreset('strong')}
                >
                    Strong
                </button>
            </div>
        </div>

        <div class="settings-section">
            <h3>Fine Tuning</h3>
            
            <div class="slider-group">
                <label for="sidepanel-saturation-slider">Saturation: {settings.saturationLevel}%</label>
                <input 
                    id="sidepanel-saturation-slider"
                    type="range" 
                    min="0" 
                    max="100" 
                    value={settings.saturationLevel}
                    on:input={updateSaturation}
                    class="slider"
                    aria-label="Saturation level"
                />
                <div class="slider-labels">
                    <span>No Color</span>
                    <span>Full Color</span>
                </div>
            </div>

            <div class="slider-group">
                <label for="sidepanel-brightness-slider">Brightness: {settings.brightness}%</label>
                <input 
                    id="sidepanel-brightness-slider"
                    type="range" 
                    min="0" 
                    max="200" 
                    value={settings.brightness}
                    on:input={updateBrightness}
                    class="slider"
                    aria-label="Brightness level"
                />
                <div class="slider-labels">
                    <span>Dark</span>
                    <span>Bright</span>
                </div>
            </div>

            <div class="slider-group">
                <label for="sidepanel-contrast-slider">Contrast: {settings.contrast}%</label>
                <input 
                    id="sidepanel-contrast-slider"
                    type="range" 
                    min="0" 
                    max="200" 
                    value={settings.contrast}
                    on:input={updateContrast}
                    class="slider"
                    aria-label="Contrast level"
                />
                <div class="slider-labels">
                    <span>Low</span>
                    <span>High</span>
                </div>
            </div>
        </div>

        <div class="settings-section">
            <h3>Current Values</h3>
            <div class="current-values">
                <div class="value-item">
                    <span class="value-label">Mode:</span>
                    <span class="value-text">{settings.colorMode}</span>
                </div>
                <div class="value-item">
                    <span class="value-label">Saturation:</span>
                    <span class="value-text">{settings.saturationLevel}%</span>
                </div>
                <div class="value-item">
                    <span class="value-label">Brightness:</span>
                    <span class="value-text">{settings.brightness}%</span>
                </div>
                <div class="value-item">
                    <span class="value-label">Contrast:</span>
                    <span class="value-text">{settings.contrast}%</span>
                </div>
            </div>
        </div>
    {/if}

    <div class="actions-section">
        <button class="reset-btn" on:click={resetToDefaults}>
            Reset to Defaults
        </button>
    </div>

    <div class="footer">
        <p>💡 Tip: Use Ctrl+Shift+C on any webpage to quickly access these controls</p>
    </div>
</div>

<style>
    .sidepanel-container {
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        height: 100vh;
        overflow-y: auto;
    }

    .header {
        text-align: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 2px solid #e9ecef;
    }

    .header h1 {
        margin: 0 0 8px 0;
        color: #333;
        font-size: 28px;
        font-weight: 700;
    }

    .subtitle {
        margin: 0;
        color: #666;
        font-size: 14px;
    }

    .main-toggle-section {
        margin-bottom: 24px;
    }

    .toggle-container {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        background-color: #f8f9fa;
        border-radius: 12px;
        border: 2px solid #e9ecef;
    }

    .toggle-switch {
        position: relative;
        display: inline-block;
        width: 60px;
        height: 30px;
        flex-shrink: 0;
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
        border-radius: 30px;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 22px;
        width: 22px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
    }

    input:checked + .slider {
        background-color: #007bff;
    }

    input:checked + .slider:before {
        transform: translateX(30px);
    }

    .toggle-info {
        flex: 1;
    }

    .toggle-label {
        display: block;
        font-weight: 600;
        color: #333;
        font-size: 16px;
        margin-bottom: 4px;
    }

    .toggle-description {
        color: #666;
        font-size: 14px;
    }

    .settings-section {
        margin-bottom: 24px;
    }

    .settings-section h3 {
        margin: 0 0 16px 0;
        color: #333;
        font-size: 18px;
        font-weight: 600;
    }

    .mode-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
    }

    .mode-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px;
        border: 2px solid #dee2e6;
        background-color: #ffffff;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        text-align: center;
    }

    .mode-card:hover {
        border-color: #adb5bd;
        background-color: #f8f9fa;
    }

    .mode-card.active {
        border-color: #007bff;
        background-color: #f0f8ff;
    }

    .mode-preview {
        width: 60px;
        height: 40px;
        border-radius: 6px;
        margin-bottom: 8px;
        border: 1px solid #dee2e6;
    }

    .mode-preview.grayscale {
        background: linear-gradient(to right, #000, #333, #666, #999, #ccc, #fff);
    }

    .mode-preview.monochrome {
        background: linear-gradient(to right, #2d1810, #5d3a1a, #8d5a2a, #bd7a3a, #ed9a4a, #ffba5a);
    }

    .mode-preview.desaturated {
        background: linear-gradient(to right, #000, #333, #666, #999, #ccc, #fff);
        opacity: 0.7;
    }

    .mode-card span {
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
    }

    .mode-card small {
        color: #666;
        font-size: 12px;
    }

    .preset-buttons {
        display: flex;
        gap: 8px;
    }

    .preset-btn {
        flex: 1;
        padding: 10px 12px;
        border: 1px solid #dee2e6;
        background-color: #ffffff;
        color: #333;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        font-weight: 500;
    }

    .preset-btn:hover {
        border-color: #adb5bd;
        background-color: #f8f9fa;
    }

    .slider-group {
        margin-bottom: 20px;
    }

    .slider-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #333;
    }

    .slider {
        width: 100%;
        height: 6px;
        border-radius: 3px;
        background: #dee2e6;
        outline: none;
        -webkit-appearance: none;
        margin-bottom: 8px;
    }

    .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #007bff;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #007bff;
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .slider-labels {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #666;
    }

    .current-values {
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 16px;
    }

    .value-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
    }

    .value-item:last-child {
        margin-bottom: 0;
    }

    .value-label {
        font-weight: 500;
        color: #333;
    }

    .value-text {
        color: #007bff;
        font-weight: 600;
    }

    .actions-section {
        margin-bottom: 24px;
    }

    .reset-btn {
        width: 100%;
        padding: 12px;
        border: 1px solid #dc3545;
        background-color: #ffffff;
        color: #dc3545;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        font-weight: 500;
    }

    .reset-btn:hover {
        background-color: #dc3545;
        color: #ffffff;
    }

    .footer {
        text-align: center;
        padding-top: 16px;
        border-top: 1px solid #e9ecef;
    }

    .footer p {
        margin: 0;
        color: #666;
        font-size: 13px;
        line-height: 1.4;
    }
</style> 