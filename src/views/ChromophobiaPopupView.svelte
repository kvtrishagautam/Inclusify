<script lang="ts">
	import { chromophobiaSettings, type ColorMode } from "../storage";
	import {
		cognitiveModel,
		type CognitiveSettings,
	} from "../models/CognitiveModel";

	let settings = $chromophobiaSettings;
	let cognitiveSettings: CognitiveSettings;
	const cognitiveSettingsStore = cognitiveModel.getSettings();

	// Subscribe to settings changes
	chromophobiaSettings.subscribe((value) => {
		settings = value;
	});

	cognitiveSettingsStore.subscribe((value) => {
		cognitiveSettings = value;
	});

	function toggleChromophobiaEnabled() {
		chromophobiaSettings.update((s) => ({ ...s, enabled: !s.enabled }));
	}

	function toggleCognitiveEnabled() {
		cognitiveModel.updateSettings((s) => ({ ...s, enabled: !s.enabled }));
	}

	function setColorMode(mode: ColorMode) {
		chromophobiaSettings.update((s) => ({ ...s, colorMode: mode }));
	}

	function openOptions() {
		chrome.runtime.openOptionsPage();
	}

	function openSidePanel() {
		// For popup context, we need to handle this differently
		chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
	}
</script>

<div class="popup-container">
	<div class="header">
		<h2>Inclusify</h2>
		<p class="subtitle">Accessibility Browser Extension</p>
	</div>

	<div class="accessibility-options">
		<div class="option-section">
			<h3>🎨 Chromophobia-Friendly</h3>
			<div class="main-toggle">
				<label class="toggle-switch">
					<input
						type="checkbox"
						checked={settings.enabled}
						on:change={toggleChromophobiaEnabled}
					/>
					<span class="slider"></span>
				</label>
				<span class="toggle-label">
					{settings.enabled ? "Color-Free Mode ON" : "Color-Free Mode OFF"}
				</span>
			</div>

			{#if settings.enabled}
				<div class="mode-selector">
					<fieldset>
						<legend>Quick Mode:</legend>
						<div class="mode-buttons">
							<button
								class="mode-btn {settings.colorMode === 'grayscale'
									? 'active'
									: ''}"
								on:click={() => setColorMode("grayscale")}
								aria-pressed={settings.colorMode === "grayscale"}
							>
								Grayscale
							</button>
							<button
								class="mode-btn {settings.colorMode === 'monochrome'
									? 'active'
									: ''}"
								on:click={() => setColorMode("monochrome")}
								aria-pressed={settings.colorMode === "monochrome"}
							>
								Monochrome
							</button>
							<button
								class="mode-btn {settings.colorMode === 'desaturated'
									? 'active'
									: ''}"
								on:click={() => setColorMode("desaturated")}
								aria-pressed={settings.colorMode === "desaturated"}
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
		</div>

		<div class="option-section">
			<h3>🧠 Cognitive Accessibility</h3>
			<div class="main-toggle">
				<label class="toggle-switch">
					<input
						type="checkbox"
						checked={cognitiveSettings.enabled}
						on:change={toggleCognitiveEnabled}
					/>
					<span class="slider"></span>
				</label>
				<span class="toggle-label">
					{cognitiveSettings.enabled
						? "Cognitive Mode ON"
						: "Cognitive Mode OFF"}
				</span>
			</div>

			{#if cognitiveSettings.enabled}
				<div class="cognitive-features">
					<div class="feature-list">
						<div class="feature-item">
							<span class="feature-icon">📖</span>
							<span class="feature-text">Readability Mode</span>
						</div>
						<div class="feature-item">
							<span class="feature-icon">🔊</span>
							<span class="feature-text">Text-to-Speech</span>
						</div>
						<div class="feature-item">
							<span class="feature-icon">👁️</span>
							<span class="feature-text">Bionic Reading</span>
						</div>
						<div class="feature-item">
							<span class="feature-icon">🎯</span>
							<span class="feature-text">Focus Mode</span>
						</div>
						<div class="feature-item">
							<span class="feature-icon">📝</span>
							<span class="feature-text">Language Simplifier</span>
						</div>
						<div class="feature-item">
							<span class="feature-icon">🚫</span>
							<span class="feature-text">Hide Distractions</span>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>

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
		<small>Press Ctrl+Shift+C for chromophobia controls</small>
		<small>Press Ctrl+Shift+D for cognitive controls</small>
	</div>
</div>

<style>
	.popup-container {
		width: 350px;
		padding: 16px;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
			sans-serif;
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

	.accessibility-options {
		margin-bottom: 16px;
	}

	.option-section {
		margin-bottom: 20px;
		padding: 12px;
		border: 1px solid #e9ecef;
		border-radius: 8px;
		background-color: #f8f9fa;
	}

	.option-section h3 {
		margin: 0 0 12px 0;
		color: #333;
		font-size: 16px;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.main-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		margin-bottom: 12px;
		padding: 8px;
		background-color: #ffffff;
		border-radius: 6px;
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
		margin-bottom: 12px;
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
		margin-bottom: 12px;
		padding: 8px;
		background-color: #ffffff;
		border-radius: 4px;
	}

	.setting-item {
		margin-bottom: 4px;
		font-size: 12px;
		color: #666;
	}

	.setting-item:last-child {
		margin-bottom: 0;
	}

	.cognitive-features {
		margin-bottom: 12px;
	}

	.feature-list {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}

	.feature-item {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 8px;
		background-color: #ffffff;
		border-radius: 4px;
		font-size: 12px;
		color: #333;
	}

	.feature-icon {
		font-size: 14px;
	}

	.feature-text {
		font-weight: 500;
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
		display: block;
		color: #666;
		font-size: 11px;
		margin-bottom: 4px;
	}

	.footer small:last-child {
		margin-bottom: 0;
	}
</style>
