<script lang="ts">
	import { onMount } from "svelte";
	import { DyslexiaController } from "../controllers/DyslexiaController";

	let isVisible = true;
	let settings: any = {
		enabled: false,
		fontFamily: 'OpenDyslexic',
		fontSize: 16,
		lineSpacing: 1.5,
		wordSpacing: 0.16,
		letterSpacing: 0.12,
		lineFocus: false,
		dyslexiaRuler: false
	};
	let dyslexiaController: DyslexiaController;

	onMount(() => {
		dyslexiaController = DyslexiaController.getInstance();
		dyslexiaController.getSettingsStore().subscribe((newSettings) => {
			settings = newSettings;
		});
		console.log('[Inclusify] DyslexiaControlsView mounted, isVisible:', isVisible);

		// Listen for open event from unified icon
		function handleOpenEvent() {
			console.log('[Inclusify] DyslexiaControlsView received open event, setting isVisible to true');
			isVisible = true;
			console.log('[Inclusify] DyslexiaControlsView isVisible is now:', isVisible);
		}

		// Listen for close event
		function handleCloseEvent() {
			console.log('[Inclusify] DyslexiaControlsView received close event');
			isVisible = false;
		}

		document.addEventListener("inclusify-open-dyslexia", handleOpenEvent);
		document.addEventListener("inclusify-close-dyslexia", handleCloseEvent);

		return () => {
			document.removeEventListener("inclusify-open-dyslexia", handleOpenEvent);
			document.removeEventListener("inclusify-close-dyslexia", handleCloseEvent);
		};
	});

	// Debug: Log whenever isVisible changes
	$: console.log('[Inclusify] DyslexiaControlsView isVisible changed to:', isVisible);

	function toggleVisibility() {
		isVisible = !isVisible;
	}

	function toggleDyslexiaMode() {
		const newSettings = { ...settings, enabled: !settings.enabled };
		dyslexiaController.getSettingsStore().set(newSettings);
	}

	function updateFontFamily(event: Event) {
		const target = event.target as HTMLSelectElement;
		const newSettings = { ...settings, fontFamily: target.value };
		dyslexiaController.getSettingsStore().set(newSettings);
	}

	function updateFontSize(event: Event) {
		const target = event.target as HTMLInputElement;
		const newSettings = { ...settings, fontSize: parseInt(target.value) };
		dyslexiaController.getSettingsStore().set(newSettings);
	}

	function updateLineSpacing(event: Event) {
		const target = event.target as HTMLInputElement;
		const newSettings = { ...settings, lineSpacing: parseFloat(target.value) };
		dyslexiaController.getSettingsStore().set(newSettings);
	}

	function updateWordSpacing(event: Event) {
		const target = event.target as HTMLInputElement;
		const newSettings = { ...settings, wordSpacing: parseFloat(target.value) };
		dyslexiaController.getSettingsStore().set(newSettings);
	}

	function updateLetterSpacing(event: Event) {
		const target = event.target as HTMLInputElement;
		const newSettings = { ...settings, letterSpacing: parseFloat(target.value) };
		dyslexiaController.getSettingsStore().set(newSettings);
	}

	function toggleLineFocus() {
		const newSettings = { ...settings, lineFocus: !settings.lineFocus };
		dyslexiaController.getSettingsStore().set(newSettings);
	}

	function toggleDyslexiaRuler() {
		const newSettings = { ...settings, dyslexiaRuler: !settings.dyslexiaRuler };
		dyslexiaController.getSettingsStore().set(newSettings);
	}

	function resetToDefaults() {
		const defaultSettings = {
			enabled: false,
			fontFamily: 'Comic Neue',
			fontSize: 16,
			lineSpacing: 1.5,
			wordSpacing: 0.1,
			letterSpacing: 0.1,
			lineFocus: false,
			dyslexiaRuler: false
		};
		dyslexiaController.getSettingsStore().set(defaultSettings);
	}
</script>

{#if isVisible}
<div class="dyslexia-overlay" role="button" tabindex="0" on:click={toggleVisibility} on:keydown={(e) => e.key === 'Escape' && toggleVisibility()}>
	<div class="dyslexia-controls-panel" role="dialog" aria-modal="true" on:click|stopPropagation on:keydown|stopPropagation>
		<!-- Close button -->
		<button class="close-button" on:click={toggleVisibility} aria-label="Close dyslexia controls">
			✕
		</button>

		<div class="header">
			<h3>Inclusify - Dyslexia</h3>
		</div>

		<div class="controls-content">
		
		<div class="control-section">
			<label class="toggle-label">
				<input
					type="checkbox"
					checked={settings.enabled}
					on:change={toggleDyslexiaMode}
				/>
				<span class="toggle-text">Enable Dyslexia Support</span>
			</label>
		</div>

		{#if settings.enabled}
			<div class="settings-section">
				<h4>Font Settings</h4>
				
				<div class="setting-group">
					<label for="font-family">Font Family:</label>
					<select id="font-family" value={settings.fontFamily} on:change={updateFontFamily}>
						<option value="Comic Neue">Comic Neue</option>
						<option value="Lexend">Lexend</option>
						<option value="OpenDyslexic">OpenDyslexic</option>
						<option value="Arial">Arial</option>
						<option value="Verdana">Verdana</option>
					</select>
				</div>

				<div class="setting-group">
					<label for="font-size">Font Size: {settings.fontSize}px</label>
					<input 
						id="font-size"
						type="range" 
						min="12" 
						max="24" 
						value={settings.fontSize} 
						on:input={updateFontSize}
					/>
				</div>

				<div class="setting-group">
					<label for="line-spacing">Line Spacing: {settings.lineSpacing}</label>
					<input 
						id="line-spacing"
						type="range" 
						min="1.0" 
						max="3.0" 
						step="0.1" 
						value={settings.lineSpacing} 
						on:input={updateLineSpacing}
					/>
				</div>

				<div class="setting-group">
					<label for="word-spacing">Word Spacing: {settings.wordSpacing}em</label>
					<input 
						id="word-spacing"
						type="range" 
						min="0.0" 
						max="0.5" 
						step="0.05" 
						value={settings.wordSpacing} 
						on:input={updateWordSpacing}
					/>
				</div>

				<div class="setting-group">
					<label for="letter-spacing">Letter Spacing: {settings.letterSpacing}em</label>
					<input 
						id="letter-spacing"
						type="range" 
						min="0.0" 
						max="0.3" 
						step="0.05" 
						value={settings.letterSpacing} 
						on:input={updateLetterSpacing}
					/>
				</div>

				<h4 style="margin-top: 20px;">Reading Aids</h4>

				<div class="setting-group">
					<label class="toggle-label">
						<input
							type="checkbox"
							checked={settings.lineFocus}
							on:change={toggleLineFocus}
						/>
						<span class="toggle-text">Line Focus (highlights current line)</span>
					</label>
				</div>

				<div class="setting-group">
					<label class="toggle-label">
						<input
							type="checkbox"
							checked={settings.dyslexiaRuler}
							on:change={toggleDyslexiaRuler}
						/>
						<span class="toggle-text">Reading Ruler (tracks mouse position)</span>
					</label>
				</div>
			</div>

			<div class="control-section">
				<button class="reset-button" on:click={resetToDefaults}>
					Reset to Defaults
				</button>
			</div>
		{/if}
		</div>
	</div>
</div>
{/if}

<style>
	.dyslexia-overlay {
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

	.dyslexia-controls-panel {
		background-color: #ffffff !important;
		border-radius: 12px !important;
		padding: 20px !important;
		width: 350px !important;
		max-width: 90vw !important;
		max-height: calc(100vh - 120px) !important;
		overflow-y: auto !important;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2) !important;
		border: 1px solid #dee2e6 !important;
		position: relative !important;
		z-index: 2147483647 !important;
		pointer-events: auto !important;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
	}

	.close-button {
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
		z-index: 1 !important;
	}

	.close-button:hover {
		background: #c82333 !important;
	}

	.header {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 20px;
		padding: 40px 20px 15px 45px;
		border-bottom: 1px solid #dee2e6;
		position: relative;
	}

	.header h3 {
		margin: 0;
		color: #333;
		font-size: 18px;
		font-weight: 600;
	}

	.controls-content {
		padding: 0 !important;
	}

	.control-section {
		margin-bottom: 15px !important;
	}

	.settings-section {
		margin-top: 20px !important;
		padding-top: 20px !important;
		border-top: 1px solid #eee !important;
	}

	.settings-section h4 {
		margin: 0 0 15px 0 !important;
		color: #333 !important;
		font-size: 16px !important;
	}

	.setting-group {
		margin-bottom: 15px !important;
	}

	.setting-group label {
		display: block !important;
		margin-bottom: 5px !important;
		color: #555 !important;
		font-size: 14px !important;
		font-weight: 500 !important;
	}

	.setting-group select {
		width: 100% !important;
		padding: 8px !important;
		border: 1px solid #ddd !important;
		border-radius: 4px !important;
		font-size: 14px !important;
	}

	.setting-group input[type="range"] {
		width: 100% !important;
		margin-top: 5px !important;
	}

	.toggle-label {
		display: flex !important;
		align-items: center !important;
		cursor: pointer !important;
	}

	.toggle-label input[type="checkbox"] {
		margin-right: 10px !important;
		width: 18px !important;
		height: 18px !important;
	}

	.toggle-text {
		font-size: 14px !important;
		color: #333 !important;
	}

	.reset-button {
		width: 100% !important;
		padding: 12px !important;
		background-color: #343a40 !important;
		color: white !important;
		border: none !important;
		border-radius: 6px !important;
		cursor: pointer !important;
		font-size: 14px !important;
		transition: background-color 0.3s ease !important;
	}

	.reset-button:hover {
		background-color: #23272b !important;
	}
</style> 