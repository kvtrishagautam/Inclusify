<script lang="ts">
	import { onMount } from "svelte";
	import { AccessibilityService } from "../services/AccessibilityService";

	let isVisible = true;
	let isScanning = false;
	let issues: any[] = [];
	let enabled = true;
	let accessibilityService: AccessibilityService;

	onMount(() => {
		accessibilityService = new AccessibilityService();
		accessibilityService.setEnabled(true);
		console.log('[Inclusify] AccessibilityControlsView mounted, isVisible:', isVisible);

		// Listen for open event from unified icon
		function handleOpenEvent() {
			console.log('[Inclusify] AccessibilityControlsView received open event, setting isVisible to true');
			isVisible = true;
			console.log('[Inclusify] AccessibilityControlsView isVisible is now:', isVisible);
		}

		// Listen for close event
		function handleCloseEvent() {
			console.log('[Inclusify] AccessibilityControlsView received close event');
			isVisible = false;
		}

		document.addEventListener("inclusify-open-accessibility", handleOpenEvent);
		document.addEventListener("inclusify-close-accessibility", handleCloseEvent);

		return () => {
			document.removeEventListener("inclusify-open-accessibility", handleOpenEvent);
			document.removeEventListener("inclusify-close-accessibility", handleCloseEvent);
		};
	});

	// Debug: Log whenever isVisible changes
	$: console.log('[Inclusify] AccessibilityControlsView isVisible changed to:', isVisible);

	function toggleVisibility() {
		isVisible = !isVisible;
	}

	function toggleEnabled() {
		enabled = !enabled;
		accessibilityService.setEnabled(enabled);
	}

	async function runAccessibilityScan() {
		if (isScanning) return;
		
		isScanning = true;
		try {
			issues = await accessibilityService.runAudit();
			accessibilityService.highlightIssues(issues);
		} catch (error) {
			console.error('Accessibility scan failed:', error);
		} finally {
			isScanning = false;
		}
	}

	function clearHighlights() {
		accessibilityService.clearHighlights();
		accessibilityService.clearInteractiveHighlights();
		issues = [];
	}

	function highlightInteractiveElements() {
		accessibilityService.highlightInteractiveElements();
	}

	function clearInteractiveHighlights() {
		accessibilityService.clearInteractiveHighlights();
	}
</script>

{#if isVisible}
<div class="accessibility-overlay" role="button" tabindex="0" on:click={toggleVisibility} on:keydown={(e) => e.key === 'Escape' && toggleVisibility()}>
	<div class="accessibility-controls-panel" role="dialog" aria-modal="true" on:click|stopPropagation on:keydown|stopPropagation>
		<!-- Close button -->
		<button class="close-button" on:click={toggleVisibility} aria-label="Close accessibility controls">
			✕
		</button>

		<div class="header">
			<h3>Inclusify - Accessibility Scan</h3>
		</div>

		<div class="controls-content">

		<div class="control-section">
			<button 
				class="scan-button {isScanning ? 'scanning' : ''}" 
				on:click={runAccessibilityScan}
				disabled={isScanning}
			>
				{isScanning ? 'Scanning...' : 'Run Accessibility Scan'}
			</button>
		</div>

		<div class="control-section">
			<button class="action-button" on:click={highlightInteractiveElements}>
				Highlight Interactive Elements
			</button>
		</div>

		<div class="control-section">
			<button class="action-button" on:click={clearHighlights}>
				Clear Highlights
			</button>
		</div>

		{#if issues.length > 0}
			<div class="issues-section">
				<h4>Found Issues ({issues.length})</h4>
				<div class="issues-list">
					{#each issues as issue}
						<div class="issue-item {issue.impact}">
							<div class="issue-header">
								<span class="impact-badge {issue.impact}">{issue.impact}</span>
								<span class="issue-description">{issue.description}</span>
							</div>
							<div class="issue-help">{issue.help}</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
		</div>
	</div>
</div>
{/if}

<style>
	.accessibility-overlay {
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

	.accessibility-controls-panel {
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

	.toggle-label {
		display: flex !important;
		align-items: center !important;
		cursor: pointer !important;
		font-size: 14px !important;
	}


	.toggle-text {
		color: #333 !important;
		font-weight: 500 !important;
	}

	.scan-button, .action-button {
		width: 100% !important;
		padding: 12px !important;
		border: none !important;
		border-radius: 6px !important;
		cursor: pointer !important;
		font-size: 14px !important;
		transition: background-color 0.3s ease !important;
	}

	.scan-button {
		background-color: #007bff !important;
		color: white !important;
	}

	.scan-button:hover:not(:disabled) {
		background-color: #0056b3 !important;
	}

	.scan-button.scanning {
		background-color: #6c757d !important;
		cursor: not-allowed !important;
	}

	.action-button {
		background-color: #343a40 !important;
		color: white !important;
	}

	.action-button:hover {
		background-color: #23272b !important;
	}

	.issues-section {
		margin-top: 30px !important;
	}

	.issues-section h4 {
		margin: 0 0 15px 0 !important;
		color: #333 !important;
		font-size: 16px !important;
	}

	.issues-list {
		max-height: 300px !important;
		overflow-y: auto !important;
	}

	.issue-item {
		margin-bottom: 15px !important;
		padding: 12px !important;
		border-radius: 6px !important;
		border-left: 4px solid !important;
	}

	.issue-item.critical {
		background-color: #f8d7da !important;
		border-left-color: #dc3545 !important;
	}

	.issue-item.serious {
		background-color: #fff3cd !important;
		border-left-color: #ffc107 !important;
	}

	.issue-item.moderate {
		background-color: #d1ecf1 !important;
		border-left-color: #17a2b8 !important;
	}

	.issue-item.minor {
		background-color: #d4edda !important;
		border-left-color: #28a745 !important;
	}

	.issue-header {
		display: flex !important;
		align-items: center !important;
		margin-bottom: 8px !important;
	}

	.impact-badge {
		padding: 2px 8px !important;
		border-radius: 12px !important;
		font-size: 11px !important;
		font-weight: bold !important;
		text-transform: uppercase !important;
		margin-right: 10px !important;
	}

	.impact-badge.critical {
		background-color: #dc3545 !important;
		color: white !important;
	}

	.impact-badge.serious {
		background-color: #ffc107 !important;
		color: black !important;
	}

	.impact-badge.moderate {
		background-color: #17a2b8 !important;
		color: white !important;
	}

	.impact-badge.minor {
		background-color: #28a745 !important;
		color: white !important;
	}

	.issue-description {
		font-weight: 500 !important;
		color: #333 !important;
		font-size: 14px !important;
	}

	.issue-help {
		color: #666 !important;
		font-size: 13px !important;
		line-height: 1.4 !important;
	}
</style> 