<script lang="ts">
	import {
		cognitiveModel,
		type CognitiveSettings,
	} from "../models/CognitiveModel";
	import { cognitiveController } from "../controllers/CognitiveController";
	import { onMount } from "svelte";

	let isVisible = false;
	let settings: CognitiveSettings = {
		enabled: false,
		bigCursor: false,
		readingMask: false,
		readingGuide: false,
		fontSize: 120,
		lineSpacing: 1.5,
		contrast: 120,
		cursorSize: 30,
		maskOpacity: 50,
		guideColor: "#ffeb3b",
	};
	const cognitiveSettingsStore = cognitiveModel.getSettings();

	// Subscribe to settings changes
	cognitiveSettingsStore.subscribe((value) => {
		settings = value;
	});

	function toggleVisibility() {
		isVisible = !isVisible;
	}

	function toggleEnabled() {
		cognitiveController.toggleEnabled();
	}

	function toggleBigCursor() {
		cognitiveController.toggleBigCursor();
	}

	function toggleReadingMask() {
		cognitiveController.toggleReadingMask();
	}

	function toggleReadingGuide() {
		cognitiveController.toggleReadingGuide();
	}

	function updateFontSize(event: Event) {
		const value = parseInt((event.target as HTMLInputElement).value);
		cognitiveController.setFontSize(value);
	}

	function updateLineSpacing(event: Event) {
		const value = parseFloat((event.target as HTMLInputElement).value);
		cognitiveController.setLineSpacing(value);
	}

	function updateContrast(event: Event) {
		const value = parseInt((event.target as HTMLInputElement).value);
		cognitiveController.setContrast(value);
	}

	function updateCursorSize(event: Event) {
		const value = parseInt((event.target as HTMLInputElement).value);
		cognitiveController.setCursorSize(value);
	}

	function updateMaskOpacity(event: Event) {
		const value = parseInt((event.target as HTMLInputElement).value);
		cognitiveController.setMaskOpacity(value);
	}

	function updateGuideColor(event: Event) {
		const value = (event.target as HTMLInputElement).value;
		cognitiveController.setGuideColor(value);
	}

	function resetToDefaults() {
		cognitiveController.resetToDefaults();
	}

	// Keyboard shortcut to toggle controls
	onMount(() => {
		function handleKeyPress(event: KeyboardEvent) {
			if (event.ctrlKey && event.shiftKey && event.key === "D") {
				toggleVisibility();
			}
		}

		document.addEventListener("keydown", handleKeyPress);

		return () => {
			document.removeEventListener("keydown", handleKeyPress);
		};
	});
</script>

<!-- Floating toggle button -->
<button
	class="cognitive-floating-toggle {settings.enabled ? 'enabled' : ''}"
	on:click={toggleVisibility}
	on:keydown={(e) => e.key === "Enter" && toggleVisibility()}
	on:keydown={(e) => e.key === " " && (e.preventDefault(), toggleVisibility())}
	aria-label="Toggle cognitive accessibility controls"
	tabindex="0"
	title="Inclusify - Cognitive Accessibility Controls (Ctrl+Shift+D)"
	type="button"
>
	<span class="icon">🧠</span>
</button>

<!-- Main controls panel -->
{#if isVisible}
	<div class="cognitive-controls-overlay">
		<div class="cognitive-controls-panel">
			<div class="header">
				<button class="close-btn-left" on:click={toggleVisibility}>×</button>
				<h3>Inclusify - Cognitive Accessibility</h3>
			</div>

			<div class="control-group">
				<label class="toggle-label">
					<input
						type="checkbox"
						checked={settings.enabled}
						on:change={toggleEnabled}
					/>
					<span class="toggle-text">Enable Cognitive Accessibility</span>
				</label>
			</div>

			{#if settings.enabled}
				<div class="features-section">
					<h4>Accessibility Features</h4>

					<div class="feature-grid">
						<label class="feature-item">
							<input
								type="checkbox"
								checked={settings.bigCursor}
								on:change={toggleBigCursor}
							/>
							<span class="feature-text">Big Cursor</span>
						</label>

						<label class="feature-item">
							<input
								type="checkbox"
								checked={settings.readingMask}
								on:change={toggleReadingMask}
							/>
							<span class="feature-text">Reading Mask</span>
						</label>

						<label class="feature-item">
							<input
								type="checkbox"
								checked={settings.readingGuide}
								on:change={toggleReadingGuide}
							/>
							<span class="feature-text">Reading Guide</span>
						</label>
					</div>
				</div>

				<div class="customization-section">
					<h4>Customization</h4>

					<div class="slider-group">
						<label for="font-size-slider">Font Size: {settings.fontSize}%</label
						>
						<input
							id="font-size-slider"
							type="range"
							min="100"
							max="200"
							value={settings.fontSize}
							on:input={updateFontSize}
							class="slider"
						/>
					</div>

					<div class="slider-group">
						<label for="line-spacing-slider"
							>Line Spacing: {settings.lineSpacing}</label
						>
						<input
							id="line-spacing-slider"
							type="range"
							min="1.2"
							max="2.0"
							step="0.1"
							value={settings.lineSpacing}
							on:input={updateLineSpacing}
							class="slider"
						/>
					</div>

					<div class="slider-group">
						<label for="contrast-slider">Contrast: {settings.contrast}%</label>
						<input
							id="contrast-slider"
							type="range"
							min="100"
							max="200"
							value={settings.contrast}
							on:input={updateContrast}
							class="slider"
						/>
					</div>

					<div class="slider-group">
						<label for="cursor-size-slider"
							>Cursor Size: {settings.cursorSize}px</label
						>
						<input
							id="cursor-size-slider"
							type="range"
							min="20"
							max="60"
							value={settings.cursorSize}
							on:input={updateCursorSize}
							class="slider"
						/>
					</div>

					<div class="slider-group">
						<label for="mask-opacity-slider"
							>Mask Opacity: {settings.maskOpacity}%</label
						>
						<input
							id="mask-opacity-slider"
							type="range"
							min="20"
							max="80"
							value={settings.maskOpacity}
							on:input={updateMaskOpacity}
							class="slider"
						/>
					</div>

					<div class="slider-group">
						<label for="guide-color-picker">Reading Guide Color:</label>
						<input
							id="guide-color-picker"
							type="color"
							value={settings.guideColor}
							on:input={updateGuideColor}
							class="color-picker"
						/>
					</div>
				</div>

				<div class="actions">
					<button class="reset-btn" on:click={resetToDefaults}>
						Reset to Defaults
					</button>
				</div>
			{/if}

			<div class="footer">
				<small>Press Ctrl+Shift+D to toggle controls</small>
			</div>
		</div>
	</div>
{/if}

<style>
	.cognitive-floating-toggle {
		position: fixed !important;
		top: 20px !important;
		right: 80px !important;
		width: 50px !important;
		height: 50px !important;
		background-color: #ffffff !important;
		border: 2px solid #28a745 !important;
		border-radius: 50% !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		cursor: pointer !important;
		z-index: 2147483647 !important;
		box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3) !important;
		transition: all 0.3s ease !important;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
			sans-serif !important;
		user-select: none !important;
		-webkit-user-select: none !important;
		-moz-user-select: none !important;
		-ms-user-select: none !important;
		animation: inclusify-fade-in 0.5s ease-out !important;
		transform: none !important;
		filter: none !important;
		margin: 0 !important;
		padding: 0 !important;
		box-sizing: border-box !important;
	}

	.cognitive-floating-toggle.enabled {
		background-color: #28a745 !important;
		color: #ffffff !important;
		border-color: #1e7e34 !important;
		box-shadow: 0 4px 12px rgba(40, 167, 69, 0.5) !important;
	}

	.cognitive-floating-toggle:hover {
		background-color: #28a745 !important;
		color: #ffffff !important;
		transform: scale(1.1) !important;
		box-shadow: 0 6px 16px rgba(40, 167, 69, 0.4) !important;
	}

	.cognitive-floating-toggle.enabled:hover {
		background-color: #1e7e34 !important;
		border-color: #155724 !important;
		box-shadow: 0 6px 16px rgba(40, 167, 69, 0.6) !important;
	}

	.cognitive-floating-toggle:focus {
		outline: none !important;
		box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.3) !important;
	}

	.icon {
		font-size: 20px;
		line-height: 1;
		pointer-events: none;
	}

	.cognitive-controls-overlay {
		position: fixed !important;
		top: 0 !important;
		left: 0 !important;
		width: 100% !important;
		height: 100% !important;
		background-color: rgba(0, 0, 0, 0.5) !important;
		z-index: 2147483646 !important;
		display: flex !important;
		align-items: flex-start !important;
		justify-content: flex-end !important;
		pointer-events: auto !important;
		padding: 80px 20px 20px 20px !important;
	}

	.cognitive-controls-panel {
		background-color: #ffffff !important;
		border-radius: 12px !important;
		padding: 20px !important;
		width: 400px !important;
		max-width: 90vw !important;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2) !important;
		border: 1px solid #dee2e6 !important;
		position: relative !important;
		z-index: 2147483647 !important;
		pointer-events: auto !important;
		margin-top: 0 !important;
		max-height: 80vh !important;
		overflow-y: auto !important;
	}

	.header {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 20px;
		padding-bottom: 15px;
		border-bottom: 1px solid #dee2e6;
		position: relative;
	}

	.header h3 {
		margin: 0;
		color: #333;
		font-size: 18px;
		font-weight: 600;
	}

	.close-btn-left {
		position: absolute !important;
		top: 15px !important;
		left: 15px !important;
		background: none !important;
		border: none !important;
		font-size: 24px !important;
		cursor: pointer !important;
		color: #666 !important;
		width: 30px !important;
		height: 30px !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		border-radius: 50% !important;
		transition: all 0.3s ease !important;
	}

	.close-btn-left:hover {
		background-color: #f0f0f0 !important;
		color: #333 !important;
	}

	.control-group {
		margin-bottom: 20px;
	}

	.toggle-label {
		display: flex;
		align-items: center;
		cursor: pointer;
	}

	.toggle-label input[type="checkbox"] {
		margin-right: 10px;
		width: 18px;
		height: 18px;
	}

	.toggle-text {
		font-weight: 500;
		color: #333;
	}

	.features-section,
	.customization-section {
		margin-bottom: 20px;
	}

	.features-section h4,
	.customization-section h4 {
		margin: 0 0 12px 0;
		color: #333;
		font-size: 16px;
		font-weight: 600;
	}

	.feature-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}

	.feature-item {
		display: flex;
		align-items: center;
		cursor: pointer;
		padding: 8px;
		border-radius: 6px;
		transition: background-color 0.2s;
	}

	.feature-item:hover {
		background-color: #f8f9fa;
	}

	.feature-item input[type="checkbox"] {
		margin-right: 8px;
		width: 16px;
		height: 16px;
	}

	.feature-text {
		font-size: 14px;
		color: #333;
	}

	.slider-group {
		margin-bottom: 16px;
	}

	.slider-group label {
		display: block;
		margin-bottom: 8px;
		font-weight: 500;
		color: #333;
		font-size: 14px;
	}

	.slider {
		width: 100%;
		height: 6px;
		border-radius: 3px;
		background: #dee2e6;
		outline: none;
		-webkit-appearance: none;
	}

	.slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: #28a745;
		cursor: pointer;
	}

	.color-picker {
		width: 50px;
		height: 30px;
		border: 2px solid #ddd;
		border-radius: 4px;
		cursor: pointer;
		background: none;
	}

	.color-picker:hover {
		border-color: #28a745;
	}

	.slider::-moz-range-thumb {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: #28a745;
		cursor: pointer;
		border: none;
	}

	.actions {
		margin-top: 20px;
		text-align: center;
	}

	.reset-btn {
		padding: 8px 16px;
		border: 1px solid #dc3545;
		background-color: #ffffff;
		color: #dc3545;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 14px;
		font-weight: 500;
	}

	.reset-btn:hover {
		background-color: #dc3545;
		color: #ffffff;
	}

	.footer {
		margin-top: 20px;
		padding-top: 15px;
		border-top: 1px solid #dee2e6;
		text-align: center;
	}

	.footer small {
		color: #666;
		font-size: 12px;
	}
</style>
