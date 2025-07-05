<script lang="ts">
	import { chromophobiaSettings, type ColorMode } from "../storage";
	import { onMount } from "svelte";

	let isVisible = false;
	let settings = $chromophobiaSettings;

	// Subscribe to settings changes
	chromophobiaSettings.subscribe((value) => {
		settings = value;
	});

	function toggleVisibility() {
		isVisible = !isVisible;
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

	// Keyboard shortcut to toggle controls
	onMount(() => {
		function handleKeyPress(event: KeyboardEvent) {
			if (event.ctrlKey && event.shiftKey && event.key === "C") {
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
	class="floating-toggle {settings.enabled ? 'enabled' : ''}"
	on:click={toggleVisibility}
	on:keydown={(e) => e.key === "Enter" && toggleVisibility()}
	on:keydown={(e) => e.key === " " && (e.preventDefault(), toggleVisibility())}
	aria-label="Toggle chromophobia controls"
	tabindex="0"
	title="Inclusify - Chromophobia Controls (Ctrl+Shift+C)"
	type="button"
>
	<span class="icon">🎨</span>
</button>

<!-- Main controls panel -->
{#if isVisible}
	<div class="controls-overlay">
		<div class="controls-panel">
			<div class="header">
				<h3>Inclusify - Chromophobia-Friendly</h3>
				<button class="close-btn" on:click={toggleVisibility}>×</button>
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

			<div class="footer">
				<small>Press Ctrl+Shift+C to toggle controls</small>
			</div>
		</div>
	</div>
{/if}

<style>
	.floating-toggle {
		position: fixed !important;
		top: 20px !important;
		right: 20px !important;
		width: 50px !important;
		height: 50px !important;
		background-color: #ffffff !important;
		border: 2px solid #007bff !important;
		border-radius: 50% !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		cursor: pointer !important;
		z-index: 2147483647 !important;
		box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3) !important;
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

	@keyframes inclusify-fade-in {
		from {
			opacity: 0;
			transform: scale(0.8) translateY(-10px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	.floating-toggle.enabled {
		background-color: #007bff;
		color: #ffffff;
		border-color: #0056b3;
		box-shadow: 0 4px 12px rgba(0, 123, 255, 0.5);
	}

	.floating-toggle:hover {
		background-color: #007bff;
		color: #ffffff;
		transform: scale(1.1);
		box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
	}

	.floating-toggle.enabled:hover {
		background-color: #0056b3;
		border-color: #004085;
		box-shadow: 0 6px 16px rgba(0, 123, 255, 0.6);
	}

	.floating-toggle:focus {
		outline: none;
		box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.3);
	}

	.icon {
		font-size: 20px;
		line-height: 1;
		pointer-events: none;
	}

	.controls-overlay {
		position: fixed !important;
		top: 0 !important;
		left: 0 !important;
		width: 100% !important;
		height: 100% !important;
		background-color: rgba(0, 0, 0, 0.5) !important;
		z-index: 2147483646 !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		pointer-events: auto !important;
	}

	.controls-panel {
		background-color: #ffffff !important;
		border-radius: 12px !important;
		padding: 24px !important;
		width: 400px !important;
		max-width: 90vw !important;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2) !important;
		border: 1px solid #dee2e6 !important;
		position: relative !important;
		z-index: 2147483647 !important;
		pointer-events: auto !important;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		padding-bottom: 15px;
		border-bottom: 1px solid #dee2e6;
	}

	.header h3 {
		margin: 0;
		color: #333;
		font-size: 18px;
		font-weight: 600;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 24px;
		cursor: pointer;
		color: #666;
		padding: 0;
		width: 30px;
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: background-color 0.2s;
	}

	.close-btn:hover {
		background-color: #f8f9fa;
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
