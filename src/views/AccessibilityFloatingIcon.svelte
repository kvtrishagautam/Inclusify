<script lang="ts">
	import { AccessibilityController } from "../controllers/AccessibilityController";
	import { onMount } from "svelte";

	let isVisible = false;
	let accessibilityController: AccessibilityController;
	let isAccessibilityEnabled = false;

	onMount(() => {
		accessibilityController = new AccessibilityController();
		accessibilityController.setEnabled(false);
	});

	function toggleVisibility() {
		isVisible = !isVisible;
	}

	function toggleAccessibilityScanning() {
		if (!accessibilityController) {
			accessibilityController = new AccessibilityController();
		}
		
		if (!isAccessibilityEnabled) {
			accessibilityController.setEnabled(true);
			isAccessibilityEnabled = true;
		} else {
			accessibilityController.setEnabled(false);
			accessibilityController.clearAllHighlights();
			isAccessibilityEnabled = false;
		}
	}

	async function runAccessibilityAudit() {
		try {
			if (accessibilityController && isAccessibilityEnabled) {
				console.log('Running accessibility audit...');
				await accessibilityController.runFullAudit();
				console.log('Accessibility audit completed');
			} else {
				console.log('Accessibility controller not available or not enabled');
			}
		} catch (error) {
			console.error('Error running accessibility audit:', error);
		}
	}

	function resetToDefault() {
		isAccessibilityEnabled = false;
		isReadingMaskEnabled = false;
		isBigCursorEnabled = false;
		isMagnifierEnabled = false;
		
		// Remove all overlays
		removeReadingMask();
		removeBigCursor();
		removeMagnifier();
	}

	// Keyboard shortcut to toggle controls
	onMount(() => {
		function handleKeyPress(event: KeyboardEvent) {
			if (event.ctrlKey && event.shiftKey && event.key === "A") {
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
	class="accessibility-floating-toggle {isAccessibilityEnabled ? 'enabled' : ''}"
	on:click={toggleVisibility}
	on:keydown={(e) => e.key === "Enter" && toggleVisibility()}
	on:keydown={(e) => e.key === " " && (e.preventDefault(), toggleVisibility())}
	aria-label="Toggle accessibility controls"
	tabindex="0"
	title="Inclusify - Accessibility Controls (Ctrl+Shift+A)"
	type="button"
>
	<span class="icon">🔍</span>
</button>

<!-- Main controls panel -->
{#if isVisible}
	<div class="accessibility-controls-overlay">
		<div class="accessibility-controls-panel">
			<div class="header">
				<button class="close-btn-left" on:click={toggleVisibility}>×</button>
				<h3>Inclusify - Accessibility Scanner</h3>
			</div>

			<div class="control-group">
				<label class="toggle-label">
					<input
						type="checkbox"
						checked={isAccessibilityEnabled}
						on:change={toggleAccessibilityScanning}
					/>
					<span class="toggle-text">Enable Accessibility Scanner</span>
				</label>
			</div>

			{#if isAccessibilityEnabled}
				<div class="control-group">
					<button 
						class="audit-btn" 
						on:click={runAccessibilityAudit}
						aria-label="Run accessibility audit"
					>
						🔍 Run Accessibility Audit
					</button>
					<p class="audit-description">
						Scans the current webpage for WCAG compliance issues, missing alt text, and accessibility problems.
					</p>
				</div>
			{/if}

			<div class="control-group">
				<button class="reset-default-btn" on:click={resetToDefault}>Reset to Default</button>
			</div>

			<div class="footer">
				<small>Press Ctrl+Shift+A to toggle controls</small>
			</div>
		</div>
	</div>
{/if}

<style>
	.accessibility-floating-toggle {
		position: fixed !important;
		top: 80px !important;
		right: 20px !important;
		width: 50px !important;
		height: 50px !important;
		background-color: #ffffff !important;
		border: 2px solid #28a745 !important;
		border-radius: 50% !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		cursor: pointer !important;
		z-index: 2147483646 !important;
		box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3) !important;
		transition: all 0.3s ease !important;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
			sans-serif !important;
		user-select: none !important;
		-webkit-user-select: none !important;
		-moz-user-select: none !important;
		-ms-user-select: none !important;
		margin: 0 !important;
		padding: 0 !important;
		outline: none !important;
		text-decoration: none !important;
		list-style: none !important;
		box-sizing: border-box !important;
	}

	.accessibility-floating-toggle:hover {
		transform: scale(1.1) !important;
		box-shadow: 0 6px 16px rgba(40, 167, 69, 0.4) !important;
	}

	.accessibility-floating-toggle.enabled {
		background-color: #28a745 !important;
		color: white !important;
		border-color: #1e7e34 !important;
	}

	.accessibility-floating-toggle.enabled:hover {
		background-color: #218838 !important;
	}

	.accessibility-floating-toggle:focus {
		outline: 2px solid #28a745 !important;
		outline-offset: 2px !important;
	}

	.accessibility-floating-toggle .icon {
		font-size: 20px !important;
		line-height: 1 !important;
	}

	.accessibility-controls-overlay {
		position: fixed !important;
		top: 0 !important;
		left: 0 !important;
		width: 100vw !important;
		height: 100vh !important;
		background-color: rgba(0, 0, 0, 0.5) !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		z-index: 2147483645 !important;
		pointer-events: auto !important;
		transform: none !important;
		filter: none !important;
	}

	.accessibility-controls-panel {
		background-color: #ffffff !important;
		border-radius: 12px !important;
		padding: 24px !important;
		max-width: 400px !important;
		width: 90% !important;
		max-height: 80vh !important;
		overflow-y: auto !important;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
			sans-serif !important;
		user-select: none !important;
		-webkit-user-select: none !important;
		-moz-user-select: none !important;
		-ms-user-select: none !important;
		margin: 0 !important;
		outline: none !important;
		text-decoration: none !important;
		list-style: none !important;
		box-sizing: border-box !important;
	}

	.accessibility-controls-panel .header {
		display: flex !important;
		justify-content: center !important;
		align-items: center !important;
		margin-bottom: 20px !important;
		padding-bottom: 16px !important;
		border-bottom: 2px solid #e9ecef !important;
		position: relative !important;
	}

	.accessibility-controls-panel .header h3 {
		margin: 0 !important;
		color: #333 !important;
		font-size: 18px !important;
		font-weight: 600 !important;
	}

	.accessibility-controls-panel .close-btn-left {
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

	.accessibility-controls-panel .close-btn-left:hover {
		background-color: #f0f0f0 !important;
		color: #333 !important;
	}

	.accessibility-controls-panel .reset-default-btn {
		background-color: #28a745 !important;
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

	.accessibility-controls-panel .reset-default-btn:hover {
		background-color: #218838 !important;
	}

	.accessibility-controls-panel .reset-default-btn:focus {
		outline: none !important;
		box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.5) !important;
	}

	.accessibility-controls-panel .control-group {
		margin-bottom: 20px !important;
	}

	.accessibility-controls-panel .toggle-label {
		display: flex !important;
		align-items: center !important;
		cursor: pointer !important;
		font-weight: 500 !important;
		color: #333 !important;
	}

	.accessibility-controls-panel .toggle-label input[type="checkbox"] {
		margin-right: 12px !important;
		width: 18px !important;
		height: 18px !important;
	}

	.accessibility-controls-panel .toggle-text {
		font-size: 16px !important;
	}

	.accessibility-controls-panel .audit-btn {
		width: 100% !important;
		padding: 12px 16px !important;
		background-color: #28a745 !important;
		color: white !important;
		border: none !important;
		border-radius: 6px !important;
		font-weight: 600 !important;
		cursor: pointer !important;
		transition: background-color 0.2s !important;
		margin-bottom: 12px !important;
		font-size: 14px !important;
	}

	.accessibility-controls-panel .audit-btn:hover {
		background-color: #218838 !important;
	}

	.accessibility-controls-panel .audit-description {
		margin: 0 !important;
		color: #666 !important;
		font-size: 14px !important;
		line-height: 1.4 !important;
	}

	.accessibility-controls-panel .info-section {
		background-color: #f8f9fa !important;
		padding: 16px !important;
		border-radius: 6px !important;
		margin-bottom: 20px !important;
	}

	.accessibility-controls-panel .info-section h4 {
		margin: 0 0 12px 0 !important;
		color: #333 !important;
		font-size: 14px !important;
		font-weight: 600 !important;
	}

	.accessibility-controls-panel .info-section ul {
		margin: 0 !important;
		padding-left: 20px !important;
		color: #666 !important;
		font-size: 13px !important;
		line-height: 1.5 !important;
	}

	.accessibility-controls-panel .info-section li {
		margin-bottom: 4px !important;
	}

	.accessibility-controls-panel .footer {
		margin-top: 20px !important;
		padding-top: 16px !important;
		border-top: 1px solid #e9ecef !important;
		text-align: center !important;
	}

	.accessibility-controls-panel .footer small {
		color: #666 !important;
		font-size: 12px !important;
	}
</style> 