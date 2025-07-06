<script lang="ts">
    import { onMount } from "svelte";
    import { DyslexiaController } from "../controllers/DyslexiaController";

    let isEnabled = false;
    let isLoading = true;

    onMount(async () => {
        const controller = DyslexiaController.getInstance();
        await controller.initialize();
        
        // Subscribe to settings changes
        controller.getSettingsStore().subscribe(settings => {
            isEnabled = settings.enabled;
            isLoading = false;
        });
    });

    async function toggleDyslexia() {
        const controller = DyslexiaController.getInstance();
        await controller.updateSetting('enabled', !isEnabled);
    }
</script>

<div class="simple-toggle">
    <div class="header">
        <h2>Dyslexia Helper</h2>
    </div>
    
    <div class="content">
        {#if isLoading}
            <div class="loading">Loading...</div>
        {:else}
            <div class="toggle-section">
                <label class="toggle-label">
                    <input 
                        type="checkbox" 
                        bind:checked={isEnabled}
                        onchange={toggleDyslexia}
                    />
                    <span class="toggle-text">Enable Dyslexia Helper</span>
                </label>
                <p class="description">
                    Click to enable dyslexia-friendly features on this page
                </p>
            </div>
            
            <div class="shortcuts">
                <h4>Keyboard Shortcuts:</h4>
                <ul>
                    <li><strong>Ctrl+Shift+D:</strong> Toggle dyslexia mode</li>
                    <li><strong>Ctrl+Shift+R:</strong> Read selected text</li>
                    <li><strong>Ctrl+Shift+S:</strong> Stop speech</li>
                </ul>
            </div>
        {/if}
    </div>
</div>

<style>
    .simple-toggle {
        width: 300px;
        min-height: 200px;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 20px;
        text-align: center;
    }

    .header h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
    }

    .content {
        padding: 20px;
    }

    .loading {
        text-align: center;
        color: #666;
        font-style: italic;
    }

    .toggle-section {
        margin-bottom: 20px;
    }

    .toggle-label {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
        cursor: pointer;
    }

    .toggle-label input[type="checkbox"] {
        width: 20px;
        height: 20px;
        accent-color: #667eea;
    }

    .toggle-text {
        font-size: 16px;
        font-weight: 600;
        color: #333;
    }

    .description {
        margin: 0 0 0 32px;
        font-size: 14px;
        color: #666;
        line-height: 1.4;
    }

    .shortcuts {
        border-top: 1px solid #eee;
        padding-top: 16px;
    }

    .shortcuts h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        color: #333;
    }

    .shortcuts ul {
        margin: 0;
        padding-left: 20px;
    }

    .shortcuts li {
        margin-bottom: 6px;
        font-size: 13px;
        color: #555;
    }

    .shortcuts strong {
        color: #333;
    }
</style> 