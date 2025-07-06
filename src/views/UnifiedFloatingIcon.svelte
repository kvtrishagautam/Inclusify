<script lang="ts">
	import { onMount } from "svelte";

	let isExpanded = false;
	let isChromophobiaEnabled = false;
	let isCognitiveEnabled = false;
	let isAccessibilityEnabled = false;
	let isDyslexiaEnabled = false;

	// Keyboard shortcut to toggle expansion
	onMount(() => {
		function handleKeyPress(event: KeyboardEvent) {
			if (event.ctrlKey && event.shiftKey && event.key === "I") {
				toggleExpansion();
			}
		}

		document.addEventListener("keydown", handleKeyPress);

		return () => {
			document.removeEventListener("keydown", handleKeyPress);
		};
	});

	function toggleExpansion() {
		isExpanded = !isExpanded;
	}

	function openChromophobiaControls() {
		// Trigger the chromophobia controls
		const event = new CustomEvent('inclusify-open-chromophobia');
		document.dispatchEvent(event);
	}

	function openCognitiveControls() {
		// Trigger the cognitive controls
		const event = new CustomEvent('inclusify-open-cognitive');
		document.dispatchEvent(event);
	}

	function openAccessibilityControls() {
		// Trigger the accessibility controls
		const event = new CustomEvent('inclusify-open-accessibility');
		document.dispatchEvent(event);
	}

	function openDyslexiaControls() {
		// Trigger the dyslexia controls
		const event = new CustomEvent('inclusify-open-dyslexia');
		document.dispatchEvent(event);
	}
</script>

<!-- Main unified floating icon -->
<div class="unified-floating-container">
	<!-- Main icon -->
	<button
		class="unified-floating-toggle {isExpanded ? 'expanded' : ''}"
		on:click={toggleExpansion}
		on:keydown={(e) => e.key === "Enter" && toggleExpansion()}
		on:keydown={(e) => e.key === " " && (e.preventDefault(), toggleExpansion())}
		aria-label="Toggle Inclusify controls"
		tabindex="0"
		title="Inclusify - Unified Controls (Ctrl+Shift+I)"
		type="button"
	>
		<img src={chrome.runtime.getURL('new-icon1.png')} alt="Inclusify" class="main-icon" />
	</button>

	<!-- Expanded functionality icons -->
	{#if isExpanded}
		<div class="expanded-controls">
			<!-- Chromophobia Control -->
			<button
				class="functionality-icon chromophobia-icon"
				on:click={openChromophobiaControls}
				title="Chromophobia Controls"
				aria-label="Open chromophobia controls"
			>
				<span class="icon">🎨</span>
			</button>

			<!-- Cognitive Control -->
			<button
				class="functionality-icon cognitive-icon"
				on:click={openCognitiveControls}
				title="Cognitive Controls"
				aria-label="Open cognitive controls"
			>
				<span class="icon">🧠</span>
			</button>

			<!-- Accessibility Control -->
			<button
				class="functionality-icon accessibility-icon"
				on:click={openAccessibilityControls}
				title="Accessibility Scanner"
				aria-label="Open accessibility controls"
			>
				<span class="icon">🔍</span>
			</button>

			<!-- Dyslexia Control -->
			<button
				class="functionality-icon dyslexia-icon"
				on:click={openDyslexiaControls}
				title="Dyslexia Support"
				aria-label="Open dyslexia controls"
			>
				<span class="icon">📖</span>
			</button>
		</div>
	{/if}
</div>

<style>
	.unified-floating-container {
		position: fixed !important;
		top: 20px !important;
		right: 20px !important;
		z-index: 2147483647 !important;
		pointer-events: auto !important;
	}

	.unified-floating-toggle {
		position: relative !important;
		width: 50px !important;
		height: 50px !important;
		background-color: #ffffff !important;
		border: 2px solid #4a90e2 !important;
		border-radius: 50% !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		cursor: pointer !important;
		box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3) !important;
		transition: all 0.3s ease !important;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
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
		transform: none !important;
		filter: none !important;
	}

	.unified-floating-toggle:hover {
		background-color: #4a90e2 !important;
		transform: scale(1.1) !important;
		box-shadow: 0 6px 16px rgba(74, 144, 226, 0.4) !important;
	}

	.unified-floating-toggle.expanded {
		background-color: #4a90e2 !important;
		border-color: #357abd !important;
		box-shadow: 0 6px 16px rgba(74, 144, 226, 0.5) !important;
	}

	.unified-floating-toggle:focus {
		outline: none !important;
		box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.3) !important;
	}

	.main-icon {
		width: 40px !important;
		height: 40px !important;
		object-fit: contain !important;
		pointer-events: none !important;
		border-radius: 50% !important;
	}

	.expanded-controls {
		position: absolute !important;
		top: 70px !important;
		right: 0 !important;
		display: flex !important;
		flex-direction: column !important;
		gap: 10px !important;
		animation: slideIn 0.3s ease-out !important;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.functionality-icon {
		width: 50px !important;
		height: 50px !important;
		background-color: #ffffff !important;
		border: 2px solid #ddd !important;
		border-radius: 50% !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		cursor: pointer !important;
		transition: all 0.3s ease !important;
		font-size: 20px !important;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
	}

	.functionality-icon:hover {
		transform: scale(1.1) !important;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
	}

	.chromophobia-icon {
		border-color: #007bff !important;
	}

	.chromophobia-icon:hover {
		background-color: #007bff !important;
		color: white !important;
	}

	.cognitive-icon {
		border-color: #ffc107 !important;
	}

	.cognitive-icon:hover {
		background-color: #ffc107 !important;
		color: white !important;
	}

	.accessibility-icon {
		border-color: #28a745 !important;
	}

	.accessibility-icon:hover {
		background-color: #28a745 !important;
		color: white !important;
	}

	.dyslexia-icon {
		border-color: #ff6b35 !important;
	}

	.dyslexia-icon:hover {
		background-color: #ff6b35 !important;
		color: white !important;
	}

	.functionality-icon .icon {
		font-size: 20px !important;
		line-height: 1 !important;
		pointer-events: none !important;
	}
</style> 