<script lang="ts">
	import { onMount } from "svelte";
	import { AccessibilityService } from "../services/AccessibilityService";

	let isVisible = true;
	let isScanning = false;
	let issues: any[] = [];
	let accessibilityService: AccessibilityService;

	onMount(() => {
		accessibilityService = new AccessibilityService();
		accessibilityService.setEnabled(true);
	});

	function toggleVisibility() {
		isVisible = !isVisible;
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
		issues = [];
	}

	function highlightInteractiveElements() {
		accessibilityService.highlightInteractiveElements();
	}

	function clearInteractiveHighlights() {
		accessibilityService.clearInteractiveHighlights();
	}
</script>

<div class="accessibility-controls-panel {isVisible ? 'visible' : ''}">
	<!-- Close button -->
	<button class="close-button" on:click={toggleVisibility} aria-label="Close accessibility controls">
		✕
	</button>

	<div class="controls-content">
		<h3>Accessibility Scanner</h3>
		
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

<style>
	.accessibility-controls-panel {
		position: fixed !important;
		top: 0 !important;
		right: -400px !important;
		width: 400px !important;
		height: 100vh !important;
		background-color: #ffffff !important;
		box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1) !important;
		z-index: 2147483646 !important;
		transition: right 0.3s ease !important;
		overflow-y: auto !important;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
	}

	.accessibility-controls-panel.visible {
		right: 0 !important;
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

	.controls-content {
		padding: 50px 20px 20px 20px !important;
	}

	.controls-content h3 {
		margin: 0 0 20px 0 !important;
		color: #333 !important;
		font-size: 18px !important;
	}

	.control-section {
		margin-bottom: 20px !important;
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
		background-color: #6c757d !important;
		color: white !important;
	}

	.action-button:hover {
		background-color: #545b62 !important;
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