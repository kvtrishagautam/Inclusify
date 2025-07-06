<script lang="ts">
    import { onMount } from 'svelte';
    import type { AccessibilityController } from '../controllers/AccessibilityController';
    import type { AccessibilityIssue, AltTextSuggestion } from '../services/AccessibilityService';

    export let accessibilityController: AccessibilityController;
    let isEnabled = false;
    let currentIssues: AccessibilityIssue[] = [];
    let altTextSuggestions: AltTextSuggestion[] = [];
    let showDetails = false;
    let isScanning = false;
    let isMinimized = false;

    onMount(() => {
        updateState();
    });

    async function toggleAccessibility() {
        console.log('Toggle clicked, current state:', isEnabled);
        
        try {
            if (!isEnabled) {
                // Enable accessibility
                console.log('Enabling accessibility...');
                isScanning = true;
                accessibilityController.setEnabled(true);
                
                // Run scan in background
                setTimeout(async () => {
                    try {
                        await accessibilityController.runFullAudit();
                        console.log('Accessibility enabled and scan completed');
                    } catch (error) {
                        console.error('Scan failed:', error);
                    } finally {
                        isScanning = false;
                        updateState();
                    }
                }, 100);
                
                // Update UI immediately
                updateState();
            } else {
                // Disable accessibility
                console.log('Disabling accessibility...');
                accessibilityController.setEnabled(false);
                accessibilityController.clearAllHighlights();
                console.log('Accessibility disabled');
                updateState();
            }
        } catch (error) {
            console.error('Error toggling accessibility:', error);
            isScanning = false;
            updateState();
        }
    }

    async function runAudit() {
        await accessibilityController.runFullAudit();
        updateState();
    }

    async function applyAltText(suggestion: AltTextSuggestion) {
        await accessibilityController.applyAltTextSuggestion(suggestion);
        updateState();
    }

    function closePanel() {
        // Hide the panel by minimizing it
        isMinimized = true;
    }

    function expandPanel() {
        isMinimized = false;
    }

    function updateState() {
        if (accessibilityController) {
            isEnabled = accessibilityController.isAccessibilityEnabled();
            currentIssues = accessibilityController.getCurrentIssues();
            altTextSuggestions = accessibilityController.getAltTextSuggestions();
            console.log('State updated - isEnabled:', isEnabled, 'issues:', currentIssues.length);
        } else {
            console.error('AccessibilityController is not available');
        }
    }

    function getIssueCount(impact: string): number {
        return accessibilityController?.getIssuesByImpact(impact).length || 0;
    }

    function getImpactColor(impact: string): string {
        switch (impact) {
            case 'critical': return '#dc3545';
            case 'serious': return '#fd7e14';
            case 'moderate': return '#ffc107';
            case 'minor': return '#28a745';
            default: return '#6c757d';
        }
    }

    function getImpactLabel(impact: string): string {
        switch (impact) {
            case 'critical': return 'Critical';
            case 'serious': return 'Serious';
            case 'moderate': return 'Moderate';
            case 'minor': return 'Minor';
            default: return 'Unknown';
        }
    }
</script>

{#if isMinimized}
    <div class="minimized-panel" on:click={expandPanel}>
        <div class="minimized-content">
            <span class="minimized-icon">🔍</span>
            <span class="minimized-text">Inclusify</span>
            {#if isEnabled && currentIssues.length > 0}
                <span class="issue-badge">{currentIssues.length}</span>
            {/if}
        </div>
    </div>
{:else}
    <div class="accessibility-panel">
        <div class="header">
            <div class="title">
                <h3>🔍 Inclusify</h3>
                <p class="subtitle">Accessibility Scanner</p>
            </div>
            <div class="header-controls">
                <div class="toggle-container">
                    <button 
                        class="toggle-btn {isEnabled ? 'enabled' : 'disabled'}"
                        on:click={toggleAccessibility}
                    >
                        <span class="toggle-icon">{isEnabled ? '●' : '○'}</span>
                    </button>
                    <span class="toggle-label">{isEnabled ? 'ON' : 'OFF'}</span>
                </div>
                <button class="close-btn" on:click={closePanel} title="Minimize">
                    <span>−</span>
                </button>
            </div>
        </div>

        {#if isEnabled}
            <div class="controls">
                <button class="audit-btn" on:click={runAudit} disabled={isScanning}>
                    {isScanning ? '⏳ Scanning...' : '🔄 Refresh Audit'}
                </button>
                <button class="details-btn" on:click={() => showDetails = !showDetails}>
                    {showDetails ? 'Hide' : 'Show'} Details
                </button>
            </div>

            {#if isScanning}
                <div class="scanning-indicator">
                    <div class="spinner"></div>
                    <span>Scanning for accessibility issues...</span>
                </div>
            {/if}

            <div class="summary">
                <div class="issue-count">
                    <span class="count">{currentIssues.length}</span>
                    <span class="label">Issues Found</span>
                </div>
                
                <div class="impact-breakdown">
                    <div class="impact-item critical">
                        <span class="dot"></span>
                        <span class="count">{getIssueCount('critical')}</span>
                    </div>
                    <div class="impact-item serious">
                        <span class="dot"></span>
                        <span class="count">{getIssueCount('serious')}</span>
                    </div>
                    <div class="impact-item moderate">
                        <span class="dot"></span>
                        <span class="count">{getIssueCount('moderate')}</span>
                    </div>
                    <div class="impact-item minor">
                        <span class="dot"></span>
                        <span class="count">{getIssueCount('minor')}</span>
                    </div>
                </div>
            </div>

            {#if altTextSuggestions.length > 0}
                <div class="alt-text-section">
                    <h4>📷 Alt-Text Suggestions ({altTextSuggestions.length})</h4>
                    {#each altTextSuggestions as suggestion}
                        <div class="suggestion">
                            <div class="suggestion-text">{suggestion.suggestedAltText}</div>
                            <button 
                                class="apply-btn"
                                on:click={() => applyAltText(suggestion)}
                            >
                                Apply
                            </button>
                        </div>
                    {/each}
                </div>
            {/if}

            {#if showDetails && currentIssues.length > 0}
                <div class="details">
                    <h4>📋 Issue Details</h4>
                    {#each currentIssues as issue}
                        <div class="issue" style="border-left-color: {getImpactColor(issue.impact)}">
                            <div class="issue-header">
                                <span class="impact-badge" style="background-color: {getImpactColor(issue.impact)}">
                                    {getImpactLabel(issue.impact)}
                                </span>
                                <span class="issue-description">{issue.description}</span>
                            </div>
                            <div class="issue-help">{issue.help}</div>
                        </div>
                    {/each}
                </div>
            {/if}
        {:else}
            <div class="disabled-state">
                <p>Click the toggle to start accessibility scanning</p>
            </div>
        {/if}
    </div>
{/if}

<style>
    .accessibility-panel {
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        padding: 16px;
        max-height: 80vh;
        overflow-y: auto;
        border: 1px solid #e1e5e9;
    }

    .minimized-panel {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        padding: 8px 12px;
        cursor: pointer;
        border: 1px solid #e1e5e9;
        transition: all 0.3s ease;
    }

    .minimized-panel:hover {
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.16);
        transform: translateY(-1px);
    }

    .minimized-content {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 500;
    }

    .minimized-icon {
        font-size: 16px;
    }

    .minimized-text {
        color: #333;
    }

    .issue-badge {
        background: #dc3545;
        color: white;
        border-radius: 12px;
        padding: 2px 8px;
        font-size: 12px;
        font-weight: bold;
        min-width: 20px;
        text-align: center;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;
    }

    .header-controls {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .title h3 {
        margin: 0 0 4px 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
    }

    .subtitle {
        margin: 0;
        font-size: 12px;
        color: #666;
    }

    .toggle-container {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .toggle-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid #ddd;
        background: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    }

    .toggle-btn.enabled {
        border-color: #28a745;
        background: #28a745;
    }

    .toggle-btn.disabled {
        border-color: #ddd;
        background: white;
    }

    .toggle-icon {
        font-size: 16px;
        color: #666;
    }

    .toggle-btn.enabled .toggle-icon {
        color: white;
    }

    .toggle-label {
        font-size: 12px;
        font-weight: 500;
        color: #666;
    }

    .close-btn {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 1px solid #ddd;
        background: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        color: #666;
        transition: all 0.3s ease;
    }

    .close-btn:hover {
        background: #f8f9fa;
        border-color: #adb5bd;
    }

    .controls {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
    }

    .audit-btn, .details-btn {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        background: white;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.3s ease;
    }

    .audit-btn:hover, .details-btn:hover {
        background: #f8f9fa;
        border-color: #adb5bd;
    }

    .audit-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .scanning-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 6px;
        margin-bottom: 16px;
        font-size: 12px;
        color: #666;
    }

    .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid #ddd;
        border-top: 2px solid #0066cc;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .summary {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 6px;
    }

    .issue-count {
        text-align: center;
    }

    .count {
        display: block;
        font-size: 24px;
        font-weight: bold;
        color: #333;
    }

    .label {
        font-size: 12px;
        color: #666;
    }

    .impact-breakdown {
        display: flex;
        gap: 8px;
    }

    .impact-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
    }

    .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
    }

    .impact-item.critical .dot { background: #dc3545; }
    .impact-item.serious .dot { background: #fd7e14; }
    .impact-item.moderate .dot { background: #ffc107; }
    .impact-item.minor .dot { background: #28a745; }

    .alt-text-section {
        margin-bottom: 16px;
    }

    .alt-text-section h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        color: #333;
    }

    .suggestion {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px;
        background: #f8f9fa;
        border-radius: 4px;
        margin-bottom: 8px;
    }

    .suggestion-text {
        font-size: 12px;
        color: #333;
        flex: 1;
        margin-right: 8px;
    }

    .apply-btn {
        padding: 4px 8px;
        border: 1px solid #28a745;
        border-radius: 4px;
        background: #28a745;
        color: white;
        cursor: pointer;
        font-size: 11px;
        transition: all 0.3s ease;
    }

    .apply-btn:hover {
        background: #218838;
    }

    .details {
        margin-top: 16px;
    }

    .details h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        color: #333;
    }

    .issue {
        padding: 12px;
        background: #f8f9fa;
        border-radius: 6px;
        margin-bottom: 8px;
        border-left: 4px solid;
    }

    .issue-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
    }

    .impact-badge {
        padding: 2px 6px;
        border-radius: 4px;
        color: white;
        font-size: 10px;
        font-weight: bold;
        text-transform: uppercase;
    }

    .issue-description {
        font-size: 12px;
        font-weight: 500;
        color: #333;
    }

    .issue-help {
        font-size: 11px;
        color: #666;
        line-height: 1.4;
    }

    .disabled-state {
        text-align: center;
        padding: 20px;
        color: #666;
        font-size: 14px;
    }
</style> 