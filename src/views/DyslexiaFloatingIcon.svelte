<script lang="ts">
	import { onMount } from "svelte";

	// TypeScript declaration for global observer
	declare global {
		interface Window {
			inclusifyLinkObserver: MutationObserver | null;
		}
	}

	let isVisible = false;
	let isDyslexiaEnabled = false;
	let dyslexiaSettings = {
		fontFamily: 'Comic Neue',
		fontSize: 16,
		lineSpacing: 1.5,
		wordSpacing: 0.16,
		letterSpacing: 0.12,
		colorOverlay: false,
		focusMode: false,
		lineFocus: false,
		highContrast: false,
		linkHighlighting: false,
		readingMode: false,
		dyslexiaRuler: false,
		magnifier: false
	};

	// Available fonts for dyslexia
	const availableFonts = [
		{ value: 'Comic Neue', label: 'Comic Neue (Dyslexia-friendly)' },
		{ value: 'Lexend', label: 'Lexend (Dyslexia-friendly)' },
		{ value: 'Comic Sans MS', label: 'Comic Sans MS' },
		{ value: 'Arial', label: 'Arial' },
		{ value: 'Verdana', label: 'Verdana' },
		{ value: 'Tahoma', label: 'Tahoma' },
		{ value: 'Georgia', label: 'Georgia' },
		{ value: 'Times New Roman', label: 'Times New Roman' }
	];

	// Test if fonts are available
	function testFonts() {
		const testElement = document.createElement('div');
		testElement.style.position = 'absolute';
		testElement.style.visibility = 'hidden';
		testElement.style.fontSize = '72px';
		testElement.textContent = 'abcdefghijklmnopqrstuvwxyz';
		document.body.appendChild(testElement);

		availableFonts.forEach(font => {
			testElement.style.fontFamily = font.value;
			const width = testElement.offsetWidth;
			console.log(`Font ${font.value}: width = ${width}`);
		});

		document.body.removeChild(testElement);
	}

	// Test fonts when component mounts
	onMount(() => {
		setTimeout(testFonts, 1000);
	});

	// Keyboard shortcut to toggle controls
	onMount(() => {
		function handleKeyPress(event: KeyboardEvent) {
			if (event.ctrlKey && event.shiftKey && event.key === "D") {
				toggleVisibility();
			}
		}

		document.addEventListener("keydown", handleKeyPress);

		return () => {
			document.removeEventListener("keydown", handleKeyPress);
		};
	});

	function toggleVisibility() {
		isVisible = !isVisible;
	}

	function toggleDyslexiaEnabled() {
		isDyslexiaEnabled = !isDyslexiaEnabled;
		if (isDyslexiaEnabled) {
			applyDyslexiaSettings();
		} else {
			removeDyslexiaSettings();
		}
	}

	function applyDyslexiaSettings() {
		const html = document.documentElement;
		const body = document.body;
		
		// Apply font family
		html.style.setProperty('--dyslexia-font-family', dyslexiaSettings.fontFamily);
		html.style.setProperty('--dyslexia-font-size', `${dyslexiaSettings.fontSize}px`);
		html.style.setProperty('--dyslexia-line-spacing', dyslexiaSettings.lineSpacing.toString());
		html.style.setProperty('--dyslexia-word-spacing', `${dyslexiaSettings.wordSpacing}em`);
		html.style.setProperty('--dyslexia-letter-spacing', `${dyslexiaSettings.letterSpacing}em`);
		
		// Add dyslexia class
		html.classList.add('inclusify-dyslexia-enabled');
		
		// Debug: Log the applied settings
		console.log('Dyslexia settings applied:', {
			fontFamily: dyslexiaSettings.fontFamily,
			fontSize: dyslexiaSettings.fontSize,
			lineSpacing: dyslexiaSettings.lineSpacing,
			wordSpacing: dyslexiaSettings.wordSpacing,
			letterSpacing: dyslexiaSettings.letterSpacing
		});
		
		// Apply visual aids
		if (dyslexiaSettings.colorOverlay) applyColorOverlay();
		if (dyslexiaSettings.focusMode) applyFocusMode();
		if (dyslexiaSettings.lineFocus) applyLineFocus();
		if (dyslexiaSettings.highContrast) applyHighContrast();
		if (dyslexiaSettings.linkHighlighting) applyLinkHighlighting();
		if (dyslexiaSettings.readingMode) applyReadingMode();
		if (dyslexiaSettings.dyslexiaRuler) applyDyslexiaRuler();
		if (dyslexiaSettings.magnifier) applyMagnifier();
	}

	function removeDyslexiaSettings() {
		const html = document.documentElement;
		const body = document.body;
		
		// Remove dyslexia class
		html.classList.remove('inclusify-dyslexia-enabled');
		
		// Remove CSS variables
		html.style.removeProperty('--dyslexia-font-family');
		html.style.removeProperty('--dyslexia-font-size');
		html.style.removeProperty('--dyslexia-line-spacing');
		html.style.removeProperty('--dyslexia-word-spacing');
		html.style.removeProperty('--dyslexia-letter-spacing');
		
		// Remove all overlays
		removeColorOverlay();
		removeFocusMode();
		removeLineFocus();
		removeHighContrast();
		removeLinkHighlighting();
		removeReadingMode();
		removeDyslexiaRuler();
		removeMagnifier();
	}

	function applyColorOverlay() {
		const overlay = document.createElement('div');
		overlay.id = 'dyslexia-color-overlay';
		overlay.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background-color: rgba(255, 255, 0, 0.1);
			pointer-events: none;
			z-index: 9999;
		`;
		document.body.appendChild(overlay);
	}

	function removeColorOverlay() {
		const overlay = document.getElementById('dyslexia-color-overlay');
		if (overlay) overlay.remove();
	}

	function applyFocusMode() {
		const highlight = document.createElement('div');
		highlight.id = 'dyslexia-focus-highlight';
		highlight.style.cssText = `
			position: absolute;
			background-color: yellow;
			opacity: 0.3;
			pointer-events: none;
			z-index: 10000;
			border-radius: 2px;
			transition: all 0.2s ease;
		`;
		document.body.appendChild(highlight);
		
		// Add mouse tracking
		document.addEventListener('mousemove', updateFocusHighlight);
	}

	function removeFocusMode() {
		const highlight = document.getElementById('dyslexia-focus-highlight');
		if (highlight) highlight.remove();
		document.removeEventListener('mousemove', updateFocusHighlight);
	}

	function updateFocusHighlight(e: MouseEvent) {
		const highlight = document.getElementById('dyslexia-focus-highlight');
		if (highlight) {
			highlight.style.left = (e.clientX - 50) + 'px';
			highlight.style.top = (e.clientY - 25) + 'px';
			highlight.style.width = '100px';
			highlight.style.height = '50px';
		}
	}

	function applyLineFocus() {
		const lineFocus = document.createElement('div');
		lineFocus.id = 'dyslexia-line-focus';
		lineFocus.style.cssText = `
			position: fixed;
			left: 0;
			width: 100vw;
			height: 2em;
			background: rgba(255, 255, 0, 0.2);
			pointer-events: none;
			z-index: 10000;
			transition: top 0.1s ease;
		`;
		document.body.appendChild(lineFocus);
		
		// Set initial position
		lineFocus.style.top = '50px';
		
		// Add mouse tracking
		document.addEventListener('mousemove', updateLineFocus);
	}

	function removeLineFocus() {
		const lineFocus = document.getElementById('dyslexia-line-focus');
		if (lineFocus) lineFocus.remove();
		document.removeEventListener('mousemove', updateLineFocus);
	}

	function updateLineFocus(e: MouseEvent) {
		const lineFocus = document.getElementById('dyslexia-line-focus');
		if (lineFocus) {
			const lineHeight = lineFocus.offsetHeight;
			let top = e.clientY - lineHeight / 2;
			if (top < 0) top = 0;
			if (top + lineHeight > window.innerHeight) {
				top = window.innerHeight - lineHeight;
			}
			lineFocus.style.top = top + 'px';
		}
	}

	function applyHighContrast() {
		const html = document.documentElement;
		html.classList.add('inclusify-high-contrast');
	}

	function removeHighContrast() {
		const html = document.documentElement;
		html.classList.remove('inclusify-high-contrast');
	}

	function applyLinkHighlighting() {
		// Apply to existing links
		const links = document.querySelectorAll('a');
		links.forEach(link => {
			link.classList.add('inclusify-link-highlight');
		});
		
		// Set up observer for dynamic content
		if (!window.inclusifyLinkObserver) {
			window.inclusifyLinkObserver = new MutationObserver((mutations) => {
				mutations.forEach((mutation) => {
					mutation.addedNodes.forEach((node) => {
						if (node.nodeType === Node.ELEMENT_NODE) {
							const element = node as Element;
							const links = element.querySelectorAll('a');
							links.forEach(link => {
								link.classList.add('inclusify-link-highlight');
							});
						}
					});
				});
			});
			
			window.inclusifyLinkObserver.observe(document.body, {
				childList: true,
				subtree: true
			});
		}
	}

	function removeLinkHighlighting() {
		const links = document.querySelectorAll('.inclusify-link-highlight');
		links.forEach(link => {
			link.classList.remove('inclusify-link-highlight');
		});
		
		// Disconnect observer
		if (window.inclusifyLinkObserver) {
			window.inclusifyLinkObserver.disconnect();
			window.inclusifyLinkObserver = null;
		}
	}

	function applyReadingMode() {
		const html = document.documentElement;
		html.classList.add('inclusify-reading-mode');
		
		// Hide additional distracting elements
		const selectors = [
			'.ad', '.advertisement', '.ads', '.banner', '.popup', '.modal',
			'.sidebar', '.nav', '.menu', '.header', '.footer', '.social',
			'.share', '.comment', '.related', '.recommendation',
			'[class*="ad"]', '[class*="banner"]', '[class*="popup"]',
			'iframe', 'script', 'noscript'
		];
		
		selectors.forEach(selector => {
			const elements = document.querySelectorAll(selector);
			elements.forEach(el => {
				(el as HTMLElement).style.display = 'none';
			});
		});
	}

	function removeReadingMode() {
		const html = document.documentElement;
		html.classList.remove('inclusify-reading-mode');
		
		// Restore hidden elements
		const hiddenElements = document.querySelectorAll('[style*="display: none"]');
		hiddenElements.forEach(el => {
			(el as HTMLElement).style.display = '';
		});
	}

	function applyDyslexiaRuler() {
		const ruler = document.createElement('div');
		ruler.id = 'dyslexia-ruler';
		ruler.style.cssText = `
			position: fixed;
			width: 100%;
			height: 4px;
			background: linear-gradient(to right, transparent, #ff6b35, #ff6b35, transparent);
			pointer-events: none;
			z-index: 10001;
			transition: top 0.1s ease;
			box-shadow: 0 0 8px rgba(255, 107, 53, 0.5);
		`;
		document.body.appendChild(ruler);
		
		// Set initial position
		ruler.style.top = '100px';
		
		// Add mouse tracking
		document.addEventListener('mousemove', updateDyslexiaRuler);
	}

	function removeDyslexiaRuler() {
		const ruler = document.getElementById('dyslexia-ruler');
		if (ruler) ruler.remove();
		document.removeEventListener('mousemove', updateDyslexiaRuler);
	}

	function updateDyslexiaRuler(e: MouseEvent) {
		const ruler = document.getElementById('dyslexia-ruler');
		if (ruler) {
			ruler.style.top = (e.clientY - 2) + 'px';
		}
	}

	function applyMagnifier() {
		const magnifier = document.createElement('div');
		magnifier.id = 'dyslexia-magnifier';
		magnifier.style.cssText = `
			position: fixed;
			width: 200px;
			height: 200px;
			border: 2px solid #ff6b35;
			border-radius: 50%;
			pointer-events: none;
			z-index: 10002;
			background: rgba(255, 255, 255, 0.9);
			transform: scale(2);
			transform-origin: center;
			display: block;
		`;
		document.body.appendChild(magnifier);
		
		// Add mouse tracking
		document.addEventListener('mousemove', updateMagnifier);
	}

	function removeMagnifier() {
		const magnifier = document.getElementById('dyslexia-magnifier');
		if (magnifier) magnifier.remove();
		document.removeEventListener('mousemove', updateMagnifier);
	}

	function updateMagnifier(e: MouseEvent) {
		const magnifier = document.getElementById('dyslexia-magnifier');
		if (magnifier) {
			magnifier.style.left = (e.clientX - 100) + 'px';
			magnifier.style.top = (e.clientY - 100) + 'px';
		}
	}

	function updateFontSize(event: Event) {
		const value = parseInt((event.target as HTMLInputElement).value);
		dyslexiaSettings.fontSize = value;
		if (isDyslexiaEnabled) {
			applyDyslexiaSettings();
		}
	}

	function updateFontFamily(event: Event) {
		const value = (event.target as HTMLSelectElement).value;
		dyslexiaSettings.fontFamily = value;
		if (isDyslexiaEnabled) {
			applyDyslexiaSettings();
		}
	}

	function updateLineSpacing(event: Event) {
		const value = parseFloat((event.target as HTMLInputElement).value);
		dyslexiaSettings.lineSpacing = value;
		if (isDyslexiaEnabled) {
			applyDyslexiaSettings();
		}
	}

	function updateWordSpacing(event: Event) {
		const value = parseFloat((event.target as HTMLInputElement).value);
		dyslexiaSettings.wordSpacing = value;
		if (isDyslexiaEnabled) {
			applyDyslexiaSettings();
		}
	}

	function updateLetterSpacing(event: Event) {
		const value = parseFloat((event.target as HTMLInputElement).value);
		dyslexiaSettings.letterSpacing = value;
		if (isDyslexiaEnabled) {
			applyDyslexiaSettings();
		}
	}

	function toggleColorOverlay() {
		dyslexiaSettings.colorOverlay = !dyslexiaSettings.colorOverlay;
		if (isDyslexiaEnabled) {
			if (dyslexiaSettings.colorOverlay) {
				applyColorOverlay();
			} else {
				removeColorOverlay();
			}
		}
	}

	function toggleFocusMode() {
		dyslexiaSettings.focusMode = !dyslexiaSettings.focusMode;
		if (isDyslexiaEnabled) {
			if (dyslexiaSettings.focusMode) {
				applyFocusMode();
			} else {
				removeFocusMode();
			}
		}
	}

	function toggleLineFocus() {
		dyslexiaSettings.lineFocus = !dyslexiaSettings.lineFocus;
		if (isDyslexiaEnabled) {
			if (dyslexiaSettings.lineFocus) {
				applyLineFocus();
			} else {
				removeLineFocus();
			}
		}
	}

	function toggleHighContrast() {
		dyslexiaSettings.highContrast = !dyslexiaSettings.highContrast;
		if (isDyslexiaEnabled) {
			if (dyslexiaSettings.highContrast) {
				applyHighContrast();
			} else {
				removeHighContrast();
			}
		}
	}

	function toggleLinkHighlighting() {
		dyslexiaSettings.linkHighlighting = !dyslexiaSettings.linkHighlighting;
		if (isDyslexiaEnabled) {
			if (dyslexiaSettings.linkHighlighting) {
				applyLinkHighlighting();
			} else {
				removeLinkHighlighting();
			}
		}
	}

	function toggleReadingMode() {
		dyslexiaSettings.readingMode = !dyslexiaSettings.readingMode;
		if (isDyslexiaEnabled) {
			if (dyslexiaSettings.readingMode) {
				applyReadingMode();
			} else {
				removeReadingMode();
			}
		}
	}

	function toggleDyslexiaRuler() {
		dyslexiaSettings.dyslexiaRuler = !dyslexiaSettings.dyslexiaRuler;
		if (isDyslexiaEnabled) {
			if (dyslexiaSettings.dyslexiaRuler) {
				applyDyslexiaRuler();
			} else {
				removeDyslexiaRuler();
			}
		}
	}

	function toggleMagnifier() {
		dyslexiaSettings.magnifier = !dyslexiaSettings.magnifier;
		if (isDyslexiaEnabled) {
			if (dyslexiaSettings.magnifier) {
				applyMagnifier();
			} else {
				removeMagnifier();
			}
		}
	}
</script>

<!-- Floating toggle button -->
<button
	class="dyslexia-floating-toggle {isDyslexiaEnabled ? 'enabled' : ''}"
	on:click={toggleVisibility}
	on:keydown={(e) => e.key === "Enter" && toggleVisibility()}
	on:keydown={(e) => e.key === " " && (e.preventDefault(), toggleVisibility())}
	aria-label="Toggle dyslexia controls"
	tabindex="0"
	title="Inclusify - Dyslexia Controls (Ctrl+Shift+D)"
	type="button"
>
	<span class="icon">📖</span>
</button>

<!-- Main controls panel -->
{#if isVisible}
	<div class="dyslexia-controls-overlay">
		<div class="dyslexia-controls-panel">
			<div class="header">
				<h3>Inclusify - Dyslexia Support</h3>
				<button class="close-btn" on:click={toggleVisibility}>×</button>
			</div>

			<div class="control-group">
				<label class="toggle-label">
					<input
						type="checkbox"
						checked={isDyslexiaEnabled}
						on:change={toggleDyslexiaEnabled}
					/>
					<span class="toggle-text">Enable Dyslexia Support</span>
				</label>
			</div>

			{#if isDyslexiaEnabled}
				<div class="control-group">
					<h4>Text Settings</h4>
					
					<div class="setting-row">
						<label for="font-size-slider">Font Size: {dyslexiaSettings.fontSize}px</label>
						<input 
							id="font-size-slider"
							type="range" 
							min="12" 
							max="24" 
							value={dyslexiaSettings.fontSize}
							on:input={updateFontSize}
							class="slider"
						/>
					</div>

					<div class="setting-row">
						<label for="font-family-select">Font Family:</label>
						<select 
							id="font-family-select"
							on:change={updateFontFamily}
							class="slider"
						>
							{#each availableFonts as font}
								<option value={font.value} selected={dyslexiaSettings.fontFamily === font.value}>
									{font.label}
								</option>
							{/each}
						</select>
					</div>

					<div class="setting-row">
						<label for="line-spacing-slider">Line Spacing: {dyslexiaSettings.lineSpacing}</label>
						<input 
							id="line-spacing-slider"
							type="range" 
							min="1.2" 
							max="2.0" 
							step="0.1"
							value={dyslexiaSettings.lineSpacing}
							on:input={updateLineSpacing}
							class="slider"
						/>
					</div>

					<div class="setting-row">
						<label for="word-spacing-slider">Word Spacing:</label>
						<input 
							id="word-spacing-slider"
							type="range" 
							min="0.05" 
							max="0.3" 
							step="0.01"
							value={dyslexiaSettings.wordSpacing}
							on:input={updateWordSpacing}
							class="slider"
						/>
						<input
							type="number"
							min="0.05"
							max="0.3"
							step="0.01"
							value={dyslexiaSettings.wordSpacing}
							on:input={updateWordSpacing}
							style="width: 60px; margin-left: 10px;"
						/>
						<span style="margin-left: 5px;">em</span>
					</div>

					<div class="setting-row">
						<label for="letter-spacing-slider">Letter Spacing: {dyslexiaSettings.letterSpacing}</label>
						<input 
							id="letter-spacing-slider"
							type="range" 
							min="0.05" 
							max="0.3" 
							step="0.01"
							value={dyslexiaSettings.letterSpacing}
							on:input={updateLetterSpacing}
							class="slider"
						/>
					</div>
				</div>

				<div class="control-group">
					<h4>Visual Aids</h4>
					
					<div class="setting-row">
						<label class="toggle-label">
							<input
								type="checkbox"
								checked={dyslexiaSettings.colorOverlay}
								on:change={toggleColorOverlay}
							/>
							<span class="toggle-text">Color Overlay</span>
						</label>
					</div>

					<div class="setting-row">
						<label class="toggle-label">
							<input
								type="checkbox"
								checked={dyslexiaSettings.focusMode}
								on:change={toggleFocusMode}
							/>
							<span class="toggle-text">Focus Mode</span>
						</label>
					</div>

					<div class="setting-row">
						<label class="toggle-label">
							<input
								type="checkbox"
								checked={dyslexiaSettings.lineFocus}
								on:change={toggleLineFocus}
							/>
							<span class="toggle-text">Line Focus</span>
						</label>
					</div>

					<div class="setting-row">
						<label class="toggle-label">
							<input
								type="checkbox"
								checked={dyslexiaSettings.highContrast}
								on:change={toggleHighContrast}
							/>
							<span class="toggle-text">High Contrast</span>
						</label>
					</div>

					<div class="setting-row">
						<label class="toggle-label">
							<input
								type="checkbox"
								checked={dyslexiaSettings.linkHighlighting}
								on:change={toggleLinkHighlighting}
							/>
							<span class="toggle-text">Link Highlighting</span>
						</label>
					</div>
				</div>

				<div class="control-group">
					<h4>Advanced Features</h4>
					
					<div class="setting-row">
						<label class="toggle-label">
							<input
								type="checkbox"
								checked={dyslexiaSettings.readingMode}
								on:change={toggleReadingMode}
							/>
							<span class="toggle-text">Reading Mode</span>
						</label>
					</div>

					<div class="setting-row">
						<label class="toggle-label">
							<input
								type="checkbox"
								checked={dyslexiaSettings.dyslexiaRuler}
								on:change={toggleDyslexiaRuler}
							/>
							<span class="toggle-text">Dyslexia Ruler</span>
						</label>
					</div>

					<div class="setting-row">
						<label class="toggle-label">
							<input
								type="checkbox"
								checked={dyslexiaSettings.magnifier}
								on:change={toggleMagnifier}
							/>
							<span class="toggle-text">Magnifier</span>
						</label>
					</div>
				</div>

				<div class="info-section">
					<h4>Dyslexia Support Features:</h4>
					<ul>
						<li>OpenDyslexic font for better readability</li>
						<li>Adjustable font size and line spacing</li>
						<li>Color overlay to reduce visual stress</li>
						<li>Focus mode to highlight text areas</li>
						<li>Line focus for guided reading</li>
						<li>High contrast mode for better visibility</li>
						<li>Link highlighting for easier navigation</li>
						<li>Reading mode to simplify pages</li>
						<li>Dyslexia ruler for line tracking</li>
						<li>Magnifier for detailed viewing</li>
					</ul>
				</div>
			{/if}

			<div class="footer">
				<small>Press Ctrl+Shift+D to toggle controls</small>
			</div>
		</div>
	</div>
{/if}

<style>
	.dyslexia-floating-toggle {
		position: fixed !important;
		top: 140px !important;
		right: 20px !important;
		width: 50px !important;
		height: 50px !important;
		background-color: #ffffff !important;
		border: 2px solid #ff6b35 !important;
		border-radius: 50% !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		cursor: pointer !important;
		z-index: 2147483646 !important;
		box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3) !important;
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
	}

	.dyslexia-floating-toggle:hover {
		transform: scale(1.1) !important;
		box-shadow: 0 6px 16px rgba(255, 107, 53, 0.4) !important;
	}

	.dyslexia-floating-toggle.enabled {
		background-color: #ff6b35 !important;
		color: white !important;
		border-color: #e55a2b !important;
	}

	.dyslexia-floating-toggle.enabled:hover {
		background-color: #e55a2b !important;
	}

	.dyslexia-floating-toggle:focus {
		outline: 2px solid #ff6b35 !important;
		outline-offset: 2px !important;
	}

	.dyslexia-floating-toggle .icon {
		font-size: 20px !important;
		line-height: 1 !important;
	}

	.dyslexia-controls-overlay {
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

	.dyslexia-controls-panel {
		background-color: #ffffff !important;
		border-radius: 12px !important;
		padding: 24px !important;
		max-width: 400px !important;
		width: 90% !important;
		max-height: 80vh !important;
		overflow-y: auto !important;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
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

	.dyslexia-controls-panel .header {
		display: flex !important;
		justify-content: space-between !important;
		align-items: center !important;
		margin-bottom: 20px !important;
		padding-bottom: 16px !important;
		border-bottom: 2px solid #e9ecef !important;
	}

	.dyslexia-controls-panel .header h3 {
		margin: 0 !important;
		color: #333 !important;
		font-size: 18px !important;
		font-weight: 600 !important;
	}

	.dyslexia-controls-panel .close-btn {
		background: none !important;
		border: none !important;
		font-size: 24px !important;
		cursor: pointer !important;
		color: #666 !important;
		padding: 4px !important;
		border-radius: 4px !important;
		transition: color 0.2s !important;
	}

	.dyslexia-controls-panel .close-btn:hover {
		color: #333 !important;
	}

	.dyslexia-controls-panel .control-group {
		margin-bottom: 20px !important;
	}

	.dyslexia-controls-panel .control-group h4 {
		margin: 0 0 12px 0 !important;
		color: #333 !important;
		font-size: 16px !important;
		font-weight: 600 !important;
	}

	.dyslexia-controls-panel .setting-row {
		margin-bottom: 12px !important;
	}

	.dyslexia-controls-panel .toggle-label {
		display: flex !important;
		align-items: center !important;
		cursor: pointer !important;
		font-weight: 500 !important;
		color: #333 !important;
	}

	.dyslexia-controls-panel .toggle-label input[type="checkbox"] {
		margin-right: 12px !important;
		width: 18px !important;
		height: 18px !important;
	}

	.dyslexia-controls-panel .toggle-text {
		font-size: 14px !important;
	}

	.dyslexia-controls-panel .slider {
		width: 100% !important;
		height: 6px !important;
		border-radius: 3px !important;
		background: #ddd !important;
		outline: none !important;
		-webkit-appearance: none !important;
		margin-top: 8px !important;
	}

	.dyslexia-controls-panel .slider::-webkit-slider-thumb {
		-webkit-appearance: none !important;
		appearance: none !important;
		width: 18px !important;
		height: 18px !important;
		border-radius: 50% !important;
		background: #ff6b35 !important;
		cursor: pointer !important;
	}

	.dyslexia-controls-panel .slider::-moz-range-thumb {
		width: 18px !important;
		height: 18px !important;
		border-radius: 50% !important;
		background: #ff6b35 !important;
		cursor: pointer !important;
		border: none !important;
	}

	.dyslexia-controls-panel select {
		width: 100% !important;
		padding: 8px 12px !important;
		border: 1px solid #ddd !important;
		border-radius: 4px !important;
		background: white !important;
		font-size: 14px !important;
		margin-top: 8px !important;
		cursor: pointer !important;
	}

	.dyslexia-controls-panel select:focus {
		outline: none !important;
		border-color: #ff6b35 !important;
		box-shadow: 0 0 0 2px rgba(255, 107, 53, 0.2) !important;
	}

	.dyslexia-controls-panel .info-section {
		background-color: #f8f9fa !important;
		padding: 16px !important;
		border-radius: 6px !important;
		margin-bottom: 20px !important;
	}

	.dyslexia-controls-panel .info-section h4 {
		margin: 0 0 12px 0 !important;
		color: #333 !important;
		font-size: 14px !important;
		font-weight: 600 !important;
	}

	.dyslexia-controls-panel .info-section ul {
		margin: 0 !important;
		padding-left: 20px !important;
		color: #666 !important;
		font-size: 13px !important;
		line-height: 1.5 !important;
	}

	.dyslexia-controls-panel .info-section li {
		margin-bottom: 4px !important;
	}

	.dyslexia-controls-panel .footer {
		margin-top: 20px !important;
		padding-top: 16px !important;
		border-top: 1px solid #e9ecef !important;
		text-align: center !important;
	}

	.dyslexia-controls-panel .footer small {
		color: #666 !important;
		font-size: 12px !important;
	}
</style> 