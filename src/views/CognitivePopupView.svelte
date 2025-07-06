<script lang="ts">
	import {
		cognitiveModel,
		type CognitiveSettings,
	} from "../models/CognitiveModel";
	import { cognitiveController } from "../controllers/CognitiveController";

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
</script>

<div class="cognitive-popup">
	<div class="header">
		<h3>🧠 Cognitive Accessibility</h3>
		<label class="main-toggle">
			<input
				type="checkbox"
				checked={settings.enabled}
				on:change={toggleEnabled}
			/>
			<span class="toggle-slider"></span>
		</label>
	</div>

	{#if settings.enabled}
		<div class="features">
			<div class="feature-group">
				<h4>Reading Aids</h4>
				<div class="feature-grid">
					<label class="feature-item">
						<input
							type="checkbox"
							checked={settings.bigCursor}
							on:change={toggleBigCursor}
						/>
						<span>Big Cursor</span>
					</label>
					<label class="feature-item">
						<input
							type="checkbox"
							checked={settings.readingMask}
							on:change={toggleReadingMask}
						/>
						<span>Reading Mask</span>
					</label>
					<label class="feature-item">
						<input
							type="checkbox"
							checked={settings.readingGuide}
							on:change={toggleReadingGuide}
						/>
						<span>Reading Guide</span>
					</label>
				</div>
			</div>

			<div class="feature-group">
				<h4>Quick Settings</h4>
				<div class="quick-settings">
					<div class="setting-item">
						<label for="font-size-range">Font Size: {settings.fontSize}%</label>
						<input
							id="font-size-range"
							type="range"
							min="100"
							max="200"
							value={settings.fontSize}
							on:input={(e) =>
								cognitiveController.setFontSize(
									parseInt((e.target as HTMLInputElement).value)
								)}
						/>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div class="disabled-message">
			<p>
				Enable cognitive accessibility to access reading aids and text size
				controls.
			</p>
		</div>
	{/if}
</div>

<style>
	.cognitive-popup {
		padding: 16px;
		border-top: 1px solid #e0e0e0;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	.header h3 {
		margin: 0;
		font-size: 16px;
		font-weight: 600;
	}

	.main-toggle {
		position: relative;
		display: inline-block;
		width: 50px;
		height: 24px;
	}

	.main-toggle input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.toggle-slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(255, 255, 255, 0.3);
		transition: 0.3s;
		border-radius: 24px;
	}

	.toggle-slider:before {
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

	input:checked + .toggle-slider {
		background-color: #4caf50;
	}

	input:checked + .toggle-slider:before {
		transform: translateX(26px);
	}

	.features {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.feature-group h4 {
		margin: 0 0 8px 0;
		font-size: 14px;
		font-weight: 600;
		opacity: 0.9;
	}

	.feature-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}

	.feature-item {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		cursor: pointer;
		padding: 4px;
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	.feature-item:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.feature-item input[type="checkbox"] {
		width: 14px;
		height: 14px;
		margin: 0;
	}

	.quick-settings {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.setting-item {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.setting-item label {
		font-size: 12px;
		opacity: 0.9;
	}

	.setting-item input[type="range"] {
		width: 100%;
		height: 4px;
		border-radius: 2px;
		background: rgba(255, 255, 255, 0.3);
		outline: none;
		-webkit-appearance: none;
	}

	.setting-item input[type="range"]::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: white;
		cursor: pointer;
	}

	.disabled-message {
		text-align: center;
		padding: 20px;
		opacity: 0.8;
	}

	.disabled-message p {
		margin: 0;
		font-size: 14px;
		line-height: 1.4;
	}
</style>
