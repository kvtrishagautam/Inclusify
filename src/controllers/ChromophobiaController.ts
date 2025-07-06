import { chromophobiaModel, type ChromophobiaSettings, type ColorMode } from "../models/ChromophobiaModel";

export class ChromophobiaController {
    private static instance: ChromophobiaController;

    private constructor() {}

    public static getInstance(): ChromophobiaController {
        if (!ChromophobiaController.instance) {
            ChromophobiaController.instance = new ChromophobiaController();
        }
        return ChromophobiaController.instance;
    }

    // Settings management
    public getSettings() {
        return chromophobiaModel.getSettings();
    }

    public toggleEnabled(): void {
        chromophobiaModel.toggleEnabled();
    }

    public setColorMode(mode: ColorMode): void {
        chromophobiaModel.setColorMode(mode);
    }

    public setSaturation(level: number): void {
        chromophobiaModel.setSaturation(level);
    }

    public setBrightness(level: number): void {
        chromophobiaModel.setBrightness(level);
    }

    public setContrast(level: number): void {
        chromophobiaModel.setContrast(level);
    }

    public resetToDefaults(): void {
        chromophobiaModel.resetToDefaults();
    }

    // Preset management
    public applyPreset(presetName: string): void {
        const presets = {
            'gentle': { saturationLevel: 20, brightness: 110, contrast: 90 },
            'moderate': { saturationLevel: 0, brightness: 100, contrast: 100 },
            'strong': { saturationLevel: 0, brightness: 90, contrast: 110 }
        };

        const preset = presets[presetName as keyof typeof presets];
        if (preset) {
            chromophobiaModel.updateSettings(s => ({ ...s, ...preset }));
        }
    }

    // UI state management
    public toggleControlsVisibility(isVisible: boolean): boolean {
        return !isVisible;
    }

    // Chrome extension specific actions
    public openSidePanel(): void {
        // Note: This requires a tab context, so it's handled in the UI components
        // where we have access to the current tab
    }

    public openOptions(): void {
        chrome.runtime.openOptionsPage();
    }

    // Content script helpers
    public applyFiltersToPage(settings: ChromophobiaSettings): void {
        const html = document.documentElement;
        const body = document.body;
        
        if (settings.enabled) {
            // Remove any existing classes
            html.classList.remove('inclusify-enabled', 'inclusify-grayscale', 'inclusify-monochrome', 'inclusify-desaturated');
            
            // Add the enabled class and specific color mode classes
            const cssClasses = chromophobiaModel.getCssClasses(settings);
            html.classList.add(...cssClasses);
            
            // Apply custom filter with user settings
            const filter = chromophobiaModel.getFilterString(settings);
            html.style.filter = filter;
            body.style.filter = filter;
            
            // Ensure videos are also filtered
            this.applyFilterToVideos(filter);
            
            // Set up mutation observer for dynamically added videos
            this.setupVideoObserver();
            
        } else {
            // Remove all chromophobia-related classes and styles
            html.classList.remove('inclusify-enabled', 'inclusify-grayscale', 'inclusify-monochrome', 'inclusify-desaturated');
            html.style.filter = '';
            body.style.filter = '';
            
            // Remove filters from videos
            this.removeFilterFromVideos();
            
            // Disconnect mutation observer
            this.disconnectVideoObserver();
        }
    }

    // Apply very light gray tint to videos
    private applyFilterToVideos(filter: string): void {
        // Remove any existing overlays first
        this.removeFilterFromVideos();
        
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            // Create a very light gray tint overlay
            const overlay = document.createElement('div');
            overlay.className = 'inclusify-video-tint';
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(128, 128, 128, 0.05);
                pointer-events: none;
                z-index: 1;
            `;
            
            // Make sure video container is positioned relative
            const videoElement = video as HTMLElement;
            if (getComputedStyle(videoElement).position === 'static') {
                videoElement.style.position = 'relative';
            }
            
            videoElement.appendChild(overlay);
            
            // Also apply grayscale filter to the video itself as backup
            videoElement.style.filter = 'grayscale(100%)';
            videoElement.style.webkitFilter = 'grayscale(100%)';
            
            // Ensure text elements near the video remain visible
            this.ensureTextVisibility(video);
        });
        
        // Handle GIFs with CSS filter (this usually works)
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            const imgElement = img as HTMLElement;
            const src = imgElement.getAttribute('src') || '';
            if (src.toLowerCase().includes('.gif')) {
                imgElement.style.filter = 'grayscale(100%)';
                imgElement.style.webkitFilter = 'grayscale(100%)';
            }
        });
        
        // Handle iframe videos with very light tint
        this.applyFilterToIframeVideos();
    }

    // Remove filters from videos
    private removeFilterFromVideos(): void {
        // Remove overlays
        const overlays = document.querySelectorAll('.inclusify-video-tint, .inclusify-iframe-tint, .inclusify-video-overlay, .inclusify-iframe-overlay');
        overlays.forEach(overlay => overlay.remove());
        
        // Remove filters from videos
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            const videoElement = video as HTMLElement;
            videoElement.style.filter = '';
            videoElement.style.webkitFilter = '';
        });
        
        // Remove filters from GIFs
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            const imgElement = img as HTMLElement;
            const src = imgElement.getAttribute('src') || '';
            if (src.toLowerCase().includes('.gif')) {
                imgElement.style.filter = '';
                imgElement.style.webkitFilter = '';
            }
        });
        
        // Remove iframe filters
        this.removeIframeFilters();
    }

    // Apply filter to iframe videos using a different approach
    private applyFilterToIframeVideos(): void {
        const iframes = document.querySelectorAll('iframe[src*="youtube"], iframe[src*="vimeo"], iframe[src*="dailymotion"]');
        iframes.forEach(iframe => {
            // Remove any existing overlay
            this.removeIframeOverlay(iframe);
            
            // Create a very subtle overlay that doesn't block the video
            const overlay = document.createElement('div');
            overlay.className = 'inclusify-iframe-tint';
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(128, 128, 128, 0.03);
                pointer-events: none;
                z-index: 1;
            `;
            
            // Make sure iframe container is positioned relative
            const iframeElement = iframe as HTMLElement;
            if (getComputedStyle(iframeElement).position === 'static') {
                iframeElement.style.position = 'relative';
            }
            
            iframeElement.appendChild(overlay);
        });
    }

    // Remove iframe filters
    private removeIframeFilters(): void {
        const overlays = document.querySelectorAll('.inclusify-iframe-overlay');
        overlays.forEach(overlay => overlay.remove());
    }

    // Remove overlay from a specific iframe
    private removeIframeOverlay(iframe: Element): void {
        const overlay = iframe.querySelector('.inclusify-iframe-tint');
        if (overlay) {
            overlay.remove();
        }
    }

    // Mutation observer for dynamically added videos
    private videoObserver: MutationObserver | null = null;

    private setupVideoObserver(): void {
        if (this.videoObserver) {
            this.videoObserver.disconnect();
        }

        this.videoObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node as Element;
                        
                        // Check if the added element is a video
                        if (element.tagName === 'VIDEO') {
                            this.applyFilterToSingleVideo(element as HTMLVideoElement);
                        }
                        
                        // Check for videos inside the added element
                        const videos = element.querySelectorAll('video');
                        videos.forEach(video => this.applyFilterToSingleVideo(video));
                    }
                });
            });
        });

        this.videoObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    private disconnectVideoObserver(): void {
        if (this.videoObserver) {
            this.videoObserver.disconnect();
            this.videoObserver = null;
        }
    }

    private applyFilterToSingleVideo(video: HTMLVideoElement): void {
        // Apply grayscale filter directly
        video.style.filter = 'grayscale(100%)';
        video.style.webkitFilter = 'grayscale(100%)';
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'inclusify-video-tint';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(128, 128, 128, 0.05);
            pointer-events: none;
            z-index: 1;
        `;
        
        // Make sure video container is positioned relative
        if (getComputedStyle(video).position === 'static') {
            video.style.position = 'relative';
        }
        
        video.appendChild(overlay);
        
        // Ensure text elements near the video remain visible
        this.ensureTextVisibility(video);
    }

    // Ensure text elements near videos remain visible and readable
    private ensureTextVisibility(video: HTMLVideoElement): void {
        // Find text elements that might be overlaying or near the video
        const videoRect = video.getBoundingClientRect();
        const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, a');
        
        textElements.forEach(element => {
            const textElement = element as HTMLElement;
            const textRect = textElement.getBoundingClientRect();
            
            // Check if text element overlaps with or is near the video
            const isNearVideo = (
                textRect.left < videoRect.right + 50 &&
                textRect.right > videoRect.left - 50 &&
                textRect.top < videoRect.bottom + 50 &&
                textRect.bottom > videoRect.top - 50
            );
            
            if (isNearVideo) {
                // Ensure text has good contrast and visibility
                textElement.style.filter = 'none';
                textElement.style.webkitFilter = 'none';
                textElement.style.color = textElement.style.color || '#000000';
                textElement.style.textShadow = '0 0 2px rgba(255, 255, 255, 0.8)';
                textElement.style.zIndex = '10';
                textElement.style.position = 'relative';
            }
        });
        
        // Also handle text that might be inside the video container
        this.ensureTextInVideoContainer(video);
    }

    // Handle text elements that are inside video containers
    private ensureTextInVideoContainer(video: HTMLVideoElement): void {
        // Look for text elements inside the video's parent container
        const videoContainer = video.parentElement;
        if (videoContainer) {
            const textElements = videoContainer.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, a, strong, b, em, i');
            
            textElements.forEach(element => {
                const textElement = element as HTMLElement;
                
                // Skip if it's the video element itself
                if (textElement.tagName === 'VIDEO') return;
                
                // Ensure text is visible and readable
                textElement.style.filter = 'none';
                textElement.style.webkitFilter = 'none';
                textElement.style.color = textElement.style.color || '#000000';
                textElement.style.textShadow = '0 0 2px rgba(255, 255, 255, 0.8)';
                textElement.style.zIndex = '10';
                textElement.style.position = 'relative';
                
                // Add a subtle background for better readability
                if (textElement.style.backgroundColor === '') {
                    textElement.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    textElement.style.padding = '2px 4px';
                    textElement.style.borderRadius = '2px';
                }
            });
        }
    }

    // Keyboard shortcuts
    public handleKeyboardShortcut(event: KeyboardEvent): boolean {
        if (event.ctrlKey && event.shiftKey && event.key === 'C') {
            return true; // Indicates the shortcut was handled
        }
        return false;
    }

    // Validation
    public validateSaturationLevel(level: number): number {
        return Math.max(0, Math.min(100, level));
    }

    public validateBrightnessLevel(level: number): number {
        return Math.max(0, Math.min(200, level));
    }

    public validateContrastLevel(level: number): number {
        return Math.max(0, Math.min(200, level));
    }

    // Event handlers for form inputs
    public handleSaturationChange(event: Event): void {
        const value = parseInt((event.target as HTMLInputElement).value);
        const validatedValue = this.validateSaturationLevel(value);
        this.setSaturation(validatedValue);
    }

    public handleBrightnessChange(event: Event): void {
        const value = parseInt((event.target as HTMLInputElement).value);
        const validatedValue = this.validateBrightnessLevel(value);
        this.setBrightness(validatedValue);
    }

    public handleContrastChange(event: Event): void {
        const value = parseInt((event.target as HTMLInputElement).value);
        const validatedValue = this.validateContrastLevel(value);
        this.setContrast(validatedValue);
    }
}

// Export singleton instance
export const chromophobiaController = ChromophobiaController.getInstance(); 