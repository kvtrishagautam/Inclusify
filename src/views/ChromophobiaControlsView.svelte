<script lang="ts">
	import { chromophobiaSettings, type ColorMode } from "../storage";
	import { onMount } from "svelte";

	let isVisible = true; // Auto-show when mounted from unified icon
	let settings = $chromophobiaSettings;

	// Subscribe to settings changes
	chromophobiaSettings.subscribe((value) => {
		settings = value;
	});

	function toggleVisibility() {
		isVisible = !isVisible;
	}

	function closePanel() {
		isVisible = false;
	}

	function toggleEnabled() {
		chromophobiaSettings.update((s) => ({ ...s, enabled: !s.enabled }));
	}

	function setColorMode(mode: ColorMode) {
		chromophobiaSettings.update((s) => ({ ...s, colorMode: mode }));
	}

	function updateSaturation(event: Event) {
		const value = parseInt((event.target as HTMLInputElement).value);
		chromophobiaSettings.update((s) => ({ ...s, saturationLevel: value }));
	}

	function updateBrightness(event: Event) {
		const value = parseInt((event.target as HTMLInputElement).value);
		chromophobiaSettings.update((s) => ({ ...s, brightness: value }));
	}

	function updateContrast(event: Event) {
		const value = parseInt((event.target as HTMLInputElement).value);
		chromophobiaSettings.update((s) => ({ ...s, contrast: value }));
	}

	function resetToDefault() {
		chromophobiaSettings.set({
			enabled: false,
			colorMode: 'grayscale',
			saturationLevel: 50,
			brightness: 100,
			contrast: 100
		});
	}

	// Keyboard shortcut to toggle controls
	onMount(() => {
		function handleKeyPress(event: KeyboardEvent) {
			if (event.ctrlKey && event.shiftKey && event.key === "C") {
				toggleVisibility();
			}
		}

		// Listen for open event from unified icon
		function handleOpenEvent() {
			isVisible = true;
		}

		// Listen for close event
		function handleCloseEvent() {
			isVisible = false;
		}

		document.addEventListener("keydown", handleKeyPress);
		document.addEventListener("inclusify-open-chromophobia", handleOpenEvent);
		document.addEventListener("inclusify-close-chromophobia", handleCloseEvent);

		return () => {
			document.removeEventListener("keydown", handleKeyPress);
			document.removeEventListener("inclusify-open-chromophobia", handleOpenEvent);
			document.removeEventListener("inclusify-close-chromophobia", handleCloseEvent);
		};
	});
</script>

<!-- Main controls panel -->
{#if isVisible}
	<div class="controls-overlay" role="button" tabindex="0" on:click={closePanel} on:keydown={(e) => e.key === 'Escape' && closePanel()}>
		<div class="controls-panel" role="dialog" aria-modal="true" on:click|stopPropagation on:keydown|stopPropagation>
			<button class="close-btn-left" on:click={closePanel}>×</button>

			<div class="header">
				<h3>Inclusify - Chromophobia-Friendly</h3>
			</div>

			<div class="control-group">
				<label class="toggle-label">
					<input
						type="checkbox"
						checked={settings.enabled}
						on:change={toggleEnabled}
					/>
					<span class="toggle-text">Enable Color-Free Mode</span>
				</label>
			</div>

			{#if settings.enabled}
				<div class="control-group">
					<fieldset>
						<legend>Color Mode:</legend>
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

				<div class="control-group">
					<label for="saturation-slider"
						>Saturation: {settings.saturationLevel}%</label
					>
					<input
						id="saturation-slider"
						type="range"
						min="0"
						max="100"
						value={settings.saturationLevel}
						on:input={updateSaturation}
						class="slider"
						aria-label="Saturation level"
					/>
				</div>

				<div class="control-group">
					<label for="brightness-slider"
						>Brightness: {settings.brightness}%</label
					>
					<input
						id="brightness-slider"
						type="range"
						min="0"
						max="200"
						value={settings.brightness}
						on:input={updateBrightness}
						class="slider"
						aria-label="Brightness level"
					/>
				</div>

				<div class="control-group">
					<label for="contrast-slider">Contrast: {settings.contrast}%</label>
					<input
						id="contrast-slider"
						type="range"
						min="0"
						max="200"
						value={settings.contrast}
						on:input={updateContrast}
						class="slider"
						aria-label="Contrast level"
					/>
				</div>
			{/if}

			<div class="control-group">
				<button class="reset-default-btn" on:click={resetToDefault}>Reset to Default</button>
			</div>

			<div class="footer">
				<small>Press Ctrl+Shift+C to toggle controls</small>
			</div>
		</div>
	</div>
{/if}

<style>
	.controls-overlay {
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

	.controls-panel {
		background-color: #ffffff !important;
		border-radius: 12px !important;
		padding: 20px !important;
		width: 350px !important;
		max-width: 90vw !important;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2) !important;
		border: 1px solid #dee2e6 !important;
		position: relative !important;
		z-index: 2147483647 !important;
		pointer-events: auto !important;
		margin-top: 0 !important;
	}

	.header {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 20px;
		padding-bottom: 15px;
		padding-left: 45px;
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
		top: 10px !important;
		left: 10px !important;
		width: 30px !important;
		height: 30px !important;
		background: #dc3545 !important;
		color: white !important;
		border: none !important;
		border-radius: 50% !important;
		cursor: pointer !important;
		font-size: 16px !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		border-radius: 50% !important;
		transition: all 0.3s ease !important;
		z-index: 10 !important;
		pointer-events: auto !important;
	}

	.close-btn-left:hover {
		background: #c82333 !important;
	}

	.reset-default-btn {
		background-color: #007bff !important;
		color: white !important;
		padding: 10px 20px !important;
		border: none !important;
		border-radius: 8px !important;
		cursor: pointer !important;
		font-size: 14px !important;
		font-weight: 600 !important;
		transition: background-color 0.3s ease !important;
		margin-top: 15px !important;
		display: inline-block !important;
		text-align: center !important;
	}

	.reset-default-btn:hover {
		background-color: #0056b3 !important;
	}

	.reset-default-btn:focus {
		outline: none !important;
		box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.5) !important;
	}

	.control-group {
		margin-bottom: 20px;
	}

	.control-group label {
		display: block;
		margin-bottom: 8px;
		font-weight: 500;
		color: #333;
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

	.mode-buttons {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.mode-btn {
		padding: 8px 16px;
		border: 2px solid #dee2e6;
		background-color: #ffffff;
		color: #333;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 14px;
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
		background: #007bff;
		cursor: pointer;
	}

	.slider::-moz-range-thumb {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: #007bff;
		cursor: pointer;
		border: none;
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
