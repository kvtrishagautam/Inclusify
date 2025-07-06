<script lang="ts">
    import AccessibilityPanel from "./AccessibilityPanel.svelte";
    import type { AccessibilityController } from "../controllers/AccessibilityController";

    export let accessibilityController: AccessibilityController;
</script>

<div class="overlay">
    <AccessibilityPanel {accessibilityController} />
</div>

<style>
    .overlay {
        position: fixed;
        width: 320px;
        top: 16px;
        right: 16px;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
</style>
