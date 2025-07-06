import axe from 'axe-core';

export interface AccessibilityIssue {
    id: string;
    description: string;
    help: string;
    helpUrl: string;
    impact: 'minor' | 'moderate' | 'serious' | 'critical';
    tags: string[];
    nodes: Array<{
        html: string;
        target: string[];
        failureSummary: string;
    }>;
}

export interface AltTextSuggestion {
    element: HTMLElement;
    suggestedAltText: string;
    confidence: number;
}

export class AccessibilityService {
    private isEnabled: boolean = false;
    private highlightedElements: Set<HTMLElement> = new Set();
    private overlayElements: HTMLElement[] = [];
    private interactiveTooltips: HTMLElement[] = [];
    private interactiveOverlays: HTMLElement[] = [];
    private isAuditRunning: boolean = false;
    private auditQueue: Array<() => void> = [];
    private axeInitialized: boolean = false;

    constructor() {
        this.initializeAxe();
    }

    private initializeAxe(): void {
        if (this.axeInitialized) {
            return;
        }

        try {
            // Configure axe-core only once
        axe.configure({
            rules: [
                { id: 'color-contrast', enabled: true },
                { id: 'image-alt', enabled: true },
                { id: 'button-name', enabled: true },
                { id: 'link-name', enabled: true },
                { id: 'form-field-multiple-labels', enabled: true },
                { id: 'heading-order', enabled: true },
                { id: 'list', enabled: true },
                { id: 'listitem', enabled: true },
                { id: 'landmark-one-main', enabled: true },
                { id: 'region', enabled: true }
            ]
        });
            this.axeInitialized = true;
            console.log('Axe-core initialized successfully');
        } catch (error) {
            console.error('Failed to initialize axe-core:', error);
        }
    }

    private shouldExcludeElement(element: HTMLElement): boolean {
        // Check if element is part of any Inclusify sidebar or control panel
        const inclusifySelectors = [
            '#inclusify-chromophobia-controls-container',
            '#inclusify-cognitive-controls-container', 
            '#inclusify-accessibility-controls-container',
            '#inclusify-dyslexia-controls-container',
            '.dyslexia-sidebar',
            '.cognitive-sidebar',
            '.chromophobia-sidebar',
            '.accessibility-sidebar',
            '[data-dyslexia-sidebar]',
            '.controls-panel',
            '.cognitive-controls-panel',
            '.accessibility-controls-panel',
            '.dyslexia-controls-panel',
            '.floating-toggle',
            '.cognitive-floating-toggle',
            '.accessibility-floating-toggle',
            '.dyslexia-floating-toggle'
        ];

        // Check if element is within any of these containers
        for (const selector of inclusifySelectors) {
            const container = document.querySelector(selector);
            if (container && container.contains(element)) {
                return true;
            }
        }

        // Check if element itself is one of these containers
        for (const selector of inclusifySelectors) {
            if (element.matches(selector)) {
                return true;
            }
        }

        return false;
    }

    public async runAudit(): Promise<AccessibilityIssue[]> {
        if (!this.isEnabled) {
            return [];
        }

        // If audit is already running, queue this request
        if (this.isAuditRunning) {
            console.log('Audit already running, queuing request...');
            return new Promise((resolve) => {
                this.auditQueue.push(() => {
                    this.runAudit().then(resolve);
                });
            });
        }

        this.isAuditRunning = true;

        try {
            console.log('Starting accessibility audit...');
            
            // Ensure axe is initialized
            if (!this.axeInitialized) {
                this.initializeAxe();
            }

            // Run axe with retry logic for "already running" error
            let results: any = null;
            let retryCount = 0;
            const maxRetries = 3;
            
            while (retryCount < maxRetries) {
                try {
                    results = await axe.run({
                        exclude: [
                            '#inclusify-chromophobia-controls-container',
                            '#inclusify-cognitive-controls-container',
                            '#inclusify-accessibility-controls-container', 
                            '#inclusify-dyslexia-controls-container',
                            '.dyslexia-sidebar',
                            '.cognitive-sidebar',
                            '.chromophobia-sidebar',
                            '.accessibility-sidebar',
                            '[data-dyslexia-sidebar]',
                            '.controls-panel',
                            '.cognitive-controls-panel',
                            '.accessibility-controls-panel',
                            '.dyslexia-controls-panel',
                            '.floating-toggle',
                            '.cognitive-floating-toggle',
                            '.accessibility-floating-toggle',
                            '.dyslexia-floating-toggle'
                        ]
                    });
                    break; // Success, exit retry loop
                } catch (error: any) {
                    retryCount++;
                    console.log(`Axe audit attempt ${retryCount} failed:`, error.message);
                    
                    if (error.message.includes('already running')) {
                        if (retryCount < maxRetries) {
                            console.log(`Waiting before retry ${retryCount + 1}...`);
                            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
                            continue;
                        } else {
                            console.error('Max retries reached for axe audit');
                            return [];
                        }
                    } else {
                        // Non-retryable error
                        console.error('Non-retryable axe error:', error);
                        return [];
                    }
                }
            }
            
            // Check if we got results
            if (!results) {
                console.error('No results from axe audit after retries');
                return [];
            }

            console.log('Accessibility audit completed');
            
            const issues = results.violations.map((violation: any) => ({
                id: violation.id,
                description: violation.description,
                help: violation.help,
                helpUrl: violation.helpUrl,
                impact: violation.impact as 'minor' | 'moderate' | 'serious' | 'critical',
                tags: violation.tags,
                nodes: violation.nodes.map((node: any) => ({
                    html: node.html,
                    target: node.target,
                    failureSummary: node.failureSummary
                }))
            }));

            return issues;
        } catch (error) {
            console.error('Accessibility audit failed:', error);
            return [];
        } finally {
            this.isAuditRunning = false;
            
            // Process queued audits with delay
            if (this.auditQueue.length > 0) {
                const nextAudit = this.auditQueue.shift();
                if (nextAudit) {
                    console.log('Processing queued audit...');
                    setTimeout(nextAudit, 2000); // Increased delay for SPAs
                }
            }
        }
    }

    public async generateAltTextForImages(): Promise<AltTextSuggestion[]> {
        if (!this.isEnabled) {
            return [];
        }

        const images = document.querySelectorAll('img:not([alt]), img[alt=""]');
        const suggestions: AltTextSuggestion[] = [];

        for (const img of images) {
            const element = img as HTMLElement;
            
            // Skip elements that are part of Inclusify sidebars or control panels
            if (this.shouldExcludeElement(element)) {
                continue;
            }
            
            const suggestedAltText = await this.generateAltText(element);
            
            if (suggestedAltText) {
                suggestions.push({
                    element,
                    suggestedAltText,
                    confidence: 0.8 // Placeholder confidence score
                });
            }
        }

        return suggestions;
    }

    private generateAltText(element: HTMLElement): string {
        const tagName = element.tagName.toLowerCase();
        
        if (tagName !== 'img') {
            return '';
        }
        
        const img = element as HTMLImageElement;
        const src = img.src || '';
        const className = img.className || '';
        const id = img.id || '';
        const title = img.title || '';
        const parent = img.parentElement;
        const siblings = parent ? Array.from(parent.children) : [];
        
        // Check if image has existing alt text
        const existingAlt = img.alt || '';
        if (existingAlt && existingAlt !== '') {
            return existingAlt;
        }
        
        // Try to extract meaningful information from various sources
        let altText = '';
        
        // 1. Check for title attribute
        if (title) {
            altText = title;
        }
        // 2. Check for aria-label
        else if (img.getAttribute('aria-label')) {
            altText = img.getAttribute('aria-label') || '';
        }
        // 3. Check for aria-labelledby
        else if (img.getAttribute('aria-labelledby')) {
            const labelledById = img.getAttribute('aria-labelledby');
            if (labelledById) {
                const labelledByElement = document.getElementById(labelledById);
                if (labelledByElement) {
                    altText = labelledByElement.textContent?.trim() || '';
                }
            }
        }
        // 4. Check for figcaption (if image is in a figure)
        else if (parent && parent.tagName.toLowerCase() === 'figure') {
            const figcaption = parent.querySelector('figcaption');
            if (figcaption) {
                altText = figcaption.textContent?.trim() || '';
            }
        }
        // 5. Check for nearby text content
        else if (parent) {
            const parentText = parent.textContent?.trim() || '';
            const imgText = img.textContent?.trim() || '';
            const remainingText = parentText.replace(imgText, '').trim();
            if (remainingText && remainingText.length < 100) {
                altText = remainingText;
            }
        }
        // 6. Analyze filename and path
        else if (src) {
            altText = this.generateAltFromSrc(src);
        }
        // 7. Analyze class names and IDs
        else if (className || id) {
            altText = this.generateAltFromAttributes(className, id);
        }
        // 8. Check for common patterns
        else {
            altText = this.generateAltFromContext(img);
        }
        
        // Clean up the alt text
        altText = this.cleanAltText(altText);
        
        // If we still don't have alt text, provide a generic suggestion
        if (!altText) {
            altText = this.generateGenericAltText(img);
        }
        
        return altText;
    }
    
    private generateAltFromSrc(src: string): string {
        try {
            const url = new URL(src, window.location.href);
            const pathname = url.pathname;
            const filename = pathname.split('/').pop() || '';
            
            // Remove file extension
            const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
            
            // Convert common patterns
            let altText = nameWithoutExt
                .replace(/[-_]/g, ' ') // Replace dashes and underscores with spaces
                .replace(/([a-z])([A-Z])/g, '$1 $2') // Add spaces before capitals
                .replace(/\s+/g, ' ') // Normalize spaces
                .trim();
            
            // Capitalize first letter
            if (altText) {
                altText = altText.charAt(0).toUpperCase() + altText.slice(1);
            }
            
            // Add context based on path
            if (pathname.includes('/icons/') || pathname.includes('/icon/')) {
                altText = `Icon: ${altText}`;
            } else if (pathname.includes('/images/') || pathname.includes('/img/')) {
                altText = `Image: ${altText}`;
            } else if (pathname.includes('/photos/') || pathname.includes('/photo/')) {
                altText = `Photo: ${altText}`;
            } else if (pathname.includes('/logos/') || pathname.includes('/logo/')) {
                altText = `Logo: ${altText}`;
            } else if (pathname.includes('/avatars/') || pathname.includes('/avatar/')) {
                altText = `Avatar: ${altText}`;
            }
            
            return altText;
        } catch {
            return '';
        }
    }
    
    private generateAltFromAttributes(className: string, id: string): string {
        const attributes = [className, id].filter(attr => attr).join(' ');
        
        // Common patterns in class names and IDs
        const patterns = {
            'logo': 'Logo',
            'icon': 'Icon',
            'avatar': 'Avatar',
            'profile': 'Profile picture',
            'banner': 'Banner image',
            'hero': 'Hero image',
            'thumbnail': 'Thumbnail',
            'preview': 'Preview image',
            'product': 'Product image',
            'team': 'Team member photo',
            'staff': 'Staff photo',
            'user': 'User photo',
            'member': 'Member photo',
            'photo': 'Photo',
            'image': 'Image',
            'picture': 'Picture',
            'img': 'Image'
        };
        
        for (const [pattern, label] of Object.entries(patterns)) {
            if (attributes.toLowerCase().includes(pattern)) {
                return label;
            }
        }
        
        return '';
    }
    
    private generateAltFromContext(img: HTMLImageElement): string {
        const parent = img.parentElement;
        if (!parent) return '';
        
        // Check if image is in a specific context
        const parentTag = parent.tagName.toLowerCase();
        const parentClass = parent.className.toLowerCase();
        
        if (parentTag === 'header' || parentClass.includes('header')) {
            return 'Header image';
        } else if (parentTag === 'nav' || parentClass.includes('nav')) {
            return 'Navigation image';
        } else if (parentTag === 'footer' || parentClass.includes('footer')) {
            return 'Footer image';
        } else if (parentTag === 'aside' || parentClass.includes('sidebar')) {
            return 'Sidebar image';
        } else if (parentTag === 'main' || parentClass.includes('main')) {
            return 'Main content image';
        } else if (parentTag === 'article' || parentClass.includes('article')) {
            return 'Article image';
        } else if (parentTag === 'section' || parentClass.includes('section')) {
            return 'Section image';
        }
        
        return '';
    }
    
    private cleanAltText(altText: string): string {
        return altText
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim()
            .substring(0, 125); // Limit length
    }
    
    private generateGenericAltText(img: HTMLImageElement): string {
        const src = img.src || '';
        const width = img.width;
        const height = img.height;
        
        // Try to determine image type from src
        if (src.includes('icon') || src.includes('ico')) {
            return 'Icon';
        } else if (src.includes('logo')) {
            return 'Logo';
        } else if (src.includes('avatar') || src.includes('profile')) {
            return 'Profile picture';
        } else if (src.includes('banner')) {
            return 'Banner image';
        } else if (src.includes('hero')) {
            return 'Hero image';
        } else if (src.includes('thumbnail')) {
            return 'Thumbnail image';
        } else if (src.includes('preview')) {
            return 'Preview image';
        } else if (src.includes('product')) {
            return 'Product image';
        } else if (width && height) {
            // Provide size information for decorative images
            if (width <= 50 && height <= 50) {
                return 'Small decorative image';
            } else if (width <= 200 && height <= 200) {
                return 'Medium image';
            } else {
                return 'Large image';
            }
        } else {
        return 'Image';
        }
    }

    public highlightIssues(issues: AccessibilityIssue[]): void {
        if (!this.isEnabled) {
            return;
        }

        this.clearHighlights();

        issues.forEach(issue => {
            issue.nodes.forEach(node => {
                const elements = this.getElementsBySelector(node.target);
                elements.forEach(element => {
                    // Exclude sidebar elements from being highlighted
                    if (
                        element.closest('#inclusify-chromophobia-controls-container') ||
                        element.closest('#inclusify-cognitive-controls-container') ||
                        element.closest('.sidepanel-container')
                    ) {
                        return;
                    }
                    this.highlightElement(element, issue.impact);
                });
            });
        });
    }

    private getElementsBySelector(selectors: string[]): HTMLElement[] {
        const elements: HTMLElement[] = [];
        
        selectors.forEach(selector => {
            try {
                const found = document.querySelectorAll(selector);
                found.forEach(element => {
                    if (element instanceof HTMLElement) {
                        elements.push(element);
                    }
                });
            } catch (error) {
                console.warn('Invalid selector:', selector);
            }
        });

        return elements;
    }

    private highlightElement(element: HTMLElement, impact: string): void {
        const rect = element.getBoundingClientRect();
        
        // Create main overlay
        const overlay = document.createElement('div');
        overlay.className = 'inclusify-issue-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = `${rect.top + window.scrollY}px`;
        overlay.style.left = `${rect.left + window.scrollX}px`;
        overlay.style.width = `${rect.width}px`;
        overlay.style.height = `${rect.height}px`;
        overlay.style.border = `2px solid ${this.getImpactColor(impact)}`;
        overlay.style.backgroundColor = 'transparent'; // Make background transparent
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '10000';
        overlay.style.boxSizing = 'border-box';
        overlay.style.transition = 'all 0.3s ease';
        
        // Create contextual info badge instead of error icon
        const infoBadge = document.createElement('div');
        infoBadge.className = 'inclusify-element-info';
        infoBadge.style.position = 'absolute';
        infoBadge.style.top = '-30px';
        infoBadge.style.left = '-10px';
        infoBadge.style.backgroundColor = this.getImpactColor(impact);
        infoBadge.style.color = 'white';
        infoBadge.style.padding = '4px 8px';
        infoBadge.style.borderRadius = '12px';
        infoBadge.style.fontSize = '10px';
        infoBadge.style.fontWeight = 'bold';
        infoBadge.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        infoBadge.style.zIndex = '10001';
        infoBadge.style.cursor = 'pointer';
        infoBadge.style.pointerEvents = 'auto';
        infoBadge.style.whiteSpace = 'nowrap';
        infoBadge.style.maxWidth = '200px';
        infoBadge.style.overflow = 'hidden';
        infoBadge.style.textOverflow = 'ellipsis';
        
        // Get contextual information about the element
        const elementInfo = this.getElementContextualInfo(element);
        infoBadge.textContent = elementInfo.label;
        infoBadge.title = elementInfo.description;
        
        // Create text-to-speech icon for elements with text content
        const textContent = element.textContent?.trim() || '';
        const hasTextContent = textContent.length > 0;
        let speechIcon = null;
        
        if (hasTextContent) {
            speechIcon = document.createElement('div');
            speechIcon.className = 'inclusify-speech-icon';
            speechIcon.style.position = 'absolute';
            speechIcon.style.top = '-30px';
            speechIcon.style.right = '-10px';
            speechIcon.style.backgroundColor = '#007cba';
            speechIcon.style.color = 'white';
            speechIcon.style.padding = '4px';
            speechIcon.style.borderRadius = '50%';
            speechIcon.style.fontSize = '12px';
            speechIcon.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
            speechIcon.style.zIndex = '10001';
            speechIcon.style.cursor = 'pointer';
            speechIcon.style.pointerEvents = 'auto';
            speechIcon.style.width = '20px';
            speechIcon.style.height = '20px';
            speechIcon.style.display = 'flex';
            speechIcon.style.alignItems = 'center';
            speechIcon.style.justifyContent = 'center';
            speechIcon.innerHTML = '🔊';
            speechIcon.title = 'Click to hear this content';
            
            // Add click handler for text-to-speech
            speechIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.speakElement(element);
            });
        }
        
        // Create detailed tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'inclusify-element-tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.top = '-80px';
        tooltip.style.left = '30px';
        tooltip.style.backgroundColor = '#333';
        tooltip.style.color = 'white';
        tooltip.style.padding = '12px';
        tooltip.style.borderRadius = '8px';
        tooltip.style.fontSize = '12px';
        tooltip.style.maxWidth = '300px';
        tooltip.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
        tooltip.style.opacity = '0';
        tooltip.style.transition = 'opacity 0.3s ease';
        tooltip.style.zIndex = '10002';
        tooltip.style.pointerEvents = 'none';
        tooltip.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 4px;">
                ${elementInfo.description}
            </div>
            <div style="font-size: 11px; opacity: 0.9;">
                ${elementInfo.suggestion}
            </div>
        `;
        
        // Add hover effects
        infoBadge.addEventListener('mouseenter', () => {
            tooltip.style.opacity = '1';
        });
        
        infoBadge.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
        });
        
        // Add click handler for more details
        infoBadge.addEventListener('click', () => {
            this.showElementDetails(element, elementInfo);
        });
        
        overlay.appendChild(infoBadge);
        if (speechIcon) {
            overlay.appendChild(speechIcon);
        }
        overlay.appendChild(tooltip);
        document.body.appendChild(overlay);
        
        this.overlayElements.push(overlay);
        this.highlightedElements.add(element);
    }

    private getElementContextualInfo(element: HTMLElement): { label: string; description: string; suggestion: string } {
        const tagName = element.tagName.toLowerCase();
        const className = element.className;
        const textContent = element.textContent?.trim() || '';
        const role = element.getAttribute('role');
        
        // Analyze based on tag name and context
        switch (tagName) {
            case 'img':
                const alt = element.getAttribute('alt') || '';
                if (!alt || alt === '') {
                    const suggestedAlt = this.generateAltText(element);
                    return {
                        label: '📷 Image (needs alt)',
                        description: 'Image without alternative text',
                        suggestion: `Add descriptive alt text. Suggested: "${suggestedAlt}"`
                    };
                } else if (alt === 'image' || alt === 'img') {
                    const suggestedAlt = this.generateAltText(element);
                    return {
                        label: '📷 Image (generic alt)',
                        description: 'Image with generic alt text',
                        suggestion: `Replace with descriptive alt text. Suggested: "${suggestedAlt}"`
                    };
                } else {
                    return {
                        label: '📷 Image',
                        description: 'Image with alt text',
                        suggestion: 'Alt text is present and descriptive'
                    };
                }

            case 'button':
                if (!textContent && !element.getAttribute('aria-label')) {
                    const icon = element.querySelector('i, span, img');
                    if (icon) {
                        return {
                            label: '🔘 Icon Button',
                            description: 'Button with icon but no accessible name',
                            suggestion: 'Add aria-label to describe the button\'s purpose'
                        };
                    } else {
                        return {
                            label: '🔘 Empty Button',
                            description: 'Empty button without accessible name',
                            suggestion: 'Add text content or aria-label to describe what this button does'
                        };
                    }
                } else {
                    return {
                        label: '🔘 Button',
                        description: 'Button with accessible name',
                        suggestion: 'Button is properly labeled'
                    };
                }

            case 'a':
                if (!textContent && !element.getAttribute('aria-label')) {
                    const href = element.getAttribute('href') || '';
                    return {
                        label: '🔗 Empty Link',
                        description: 'Link without accessible text',
                        suggestion: 'Add descriptive text or aria-label to explain where this link goes'
                    };
                } else {
                    return {
                        label: '🔗 Link',
                        description: 'Link with accessible text',
                        suggestion: 'Link is properly labeled'
                    };
                }

            case 'input':
                const type = element.getAttribute('type') || 'text';
                const label = this.findAssociatedLabel(element);
                
                if (!label && !element.getAttribute('aria-label')) {
                    return {
                        label: `📝 ${type.charAt(0).toUpperCase() + type.slice(1)} Input`,
                        description: `Input field without label`,
                        suggestion: `Add a <label> element or aria-label to describe this ${type} input`
                    };
                } else {
                    return {
                        label: `📝 ${type.charAt(0).toUpperCase() + type.slice(1)} Input`,
                        description: 'Input field with label',
                        suggestion: 'Input is properly labeled'
                    };
                }

            case 'h1':
            case 'h2':
            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6':
                if (!textContent) {
                    return {
                        label: `📋 ${tagName.toUpperCase()} (empty)`,
                        description: 'Empty heading',
                        suggestion: 'Add text content to this heading or remove it if not needed'
                    };
                } else {
                    return {
                        label: `📋 ${tagName.toUpperCase()}`,
                        description: 'Heading with content',
                        suggestion: 'Heading is properly structured'
                    };
                }

            case 'div':
                if (className.includes('button') || className.includes('btn')) {
                    return {
                        label: '🔘 Div Button',
                        description: 'Div styled as button',
                        suggestion: 'Use a <button> element instead of a styled div for better accessibility'
                    };
                } else if (className.includes('card') || className.includes('item')) {
                    return {
                        label: '📄 Content Card',
                        description: 'Content card/item',
                        suggestion: 'Add proper heading structure and semantic markup'
                    };
                } else {
                    // Analyze div content more thoroughly
                    const divAnalysis = this.analyzeDivContent(element);
                    return {
                        label: divAnalysis.label,
                        description: divAnalysis.description,
                        suggestion: divAnalysis.suggestion
                    };
                }

            case 'span':
                if (className.includes('button') || className.includes('btn')) {
                    return {
                        label: '🔘 Span Button',
                        description: 'Span styled as button',
                        suggestion: 'Use a <button> element instead of a styled span for better accessibility'
                    };
                } else {
                    return {
                        label: '📝 Span',
                        description: 'Inline text element',
                        suggestion: 'Consider if this needs semantic markup'
                    };
                }

            case 'p':
                return {
                    label: '📝 Paragraph',
                    description: 'Text paragraph',
                    suggestion: 'Paragraph is properly structured'
                };

            case 'ul':
            case 'ol':
                return {
                    label: '📋 List',
                    description: `${tagName === 'ul' ? 'Unordered' : 'Ordered'} list`,
                    suggestion: 'List is properly structured'
                };

            case 'li':
                return {
                    label: '📋 List Item',
                    description: 'List item',
                    suggestion: 'List item is properly structured'
                };

            case 'nav':
                return {
                    label: '🧭 Navigation',
                    description: 'Navigation element',
                    suggestion: 'Navigation is properly structured'
                };

            case 'main':
                return {
                    label: '🏠 Main Content',
                    description: 'Main content area',
                    suggestion: 'Main content is properly structured'
                };

            case 'aside':
                return {
                    label: '📌 Sidebar',
                    description: 'Sidebar content',
                    suggestion: 'Sidebar is properly structured'
                };

            case 'header':
                return {
                    label: '📋 Header',
                    description: 'Page header',
                    suggestion: 'Header is properly structured'
                };

            case 'footer':
                return {
                    label: '📋 Footer',
                    description: 'Page footer',
                    suggestion: 'Footer is properly structured'
                };

            case 'section':
                return {
                    label: '📄 Section',
                    description: 'Content section',
                    suggestion: 'Section is properly structured'
                };

            case 'article':
                return {
                    label: '📄 Article',
                    description: 'Article content',
                    suggestion: 'Article is properly structured'
                };

            case 'form':
                return {
                    label: '📝 Form',
                    description: 'Form element',
                    suggestion: 'Ensure all form controls have proper labels and validation'
                };

            case 'label':
                return {
                    label: '🏷️ Label',
                    description: 'Form label',
                    suggestion: 'Label is properly associated with form control'
                };

            case 'select':
                return {
                    label: '📋 Dropdown',
                    description: 'Select dropdown',
                    suggestion: 'Ensure dropdown has proper label and options'
                };

            case 'textarea':
                return {
                    label: '📝 Text Area',
                    description: 'Multi-line text input',
                    suggestion: 'Ensure textarea has proper label'
                };

            default:
                return {
                    label: `📄 ${tagName.charAt(0).toUpperCase() + tagName.slice(1)}`,
                    description: `${tagName} element`,
                    suggestion: 'Review for accessibility best practices'
                };
        }
    }

    private showElementDetails(element: HTMLElement, elementInfo: { label: string; description: string; suggestion: string }): void {
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.backgroundColor = 'white';
        modal.style.padding = '20px';
        modal.style.borderRadius = '8px';
        modal.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
        modal.style.zIndex = '10003';
        modal.style.maxWidth = '500px';
        modal.style.fontFamily = 'Arial, sans-serif';
        
        const analysis = this.analyzeElement(element);
        
        modal.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 16px;">
                <span style="font-size: 24px; margin-right: 12px;">${elementInfo.label.split(' ')[0]}</span>
                <div>
                    <h3 style="margin: 0; color: #333;">${elementInfo.description}</h3>
                    <span style="color: #007cba; font-weight: bold;">Element Analysis</span>
                </div>
            </div>
            
            <div style="margin-bottom: 16px;">
                <h4 style="margin: 0 0 8px 0; color: #333;">What this element is:</h4>
                <p style="margin: 0; color: #666; line-height: 1.4;">${analysis.description}</p>
            </div>
            
            <div style="margin-bottom: 16px;">
                <h4 style="margin: 0 0 8px 0; color: #333;">How to improve it:</h4>
                <p style="margin: 0; color: #666; line-height: 1.4;">${analysis.suggestion}</p>
                ${element.tagName.toLowerCase() === 'img' && !element.getAttribute('alt') ? `
                <div style="background: #f8f9fa; padding: 12px; border-radius: 4px; margin-top: 8px; border-left: 4px solid #007cba;">
                    <strong>Suggested Alt Text:</strong><br>
                    <code style="background: #e9ecef; padding: 4px 8px; border-radius: 3px; font-family: monospace;">${this.generateAltText(element)}</code>
                </div>
                ` : ''}
            </div>
            
            <div style="margin-bottom: 16px;">
                <h4 style="margin: 0 0 8px 0; color: #333;">Why this matters:</h4>
                <p style="margin: 0; color: #666; line-height: 1.4;">${analysis.context}</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 12px; border-radius: 4px; margin-bottom: 16px; font-family: monospace; font-size: 12px;">
                <strong>HTML Code:</strong><br>
                ${element.outerHTML.substring(0, 200)}${element.outerHTML.length > 200 ? '...' : ''}
            </div>
            
            <div style="text-align: right;">
                <button onclick="this.parentElement.parentElement.remove()" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
            </div>
        `;
        
        // Add backdrop
        const backdrop = document.createElement('div');
        backdrop.style.position = 'fixed';
        backdrop.style.top = '0';
        backdrop.style.left = '0';
        backdrop.style.width = '100%';
        backdrop.style.height = '100%';
        backdrop.style.backgroundColor = 'rgba(0,0,0,0.5)';
        backdrop.style.zIndex = '10002';
        backdrop.addEventListener('click', () => {
            backdrop.remove();
            modal.remove();
        });
        
        document.body.appendChild(backdrop);
        document.body.appendChild(modal);
    }

    private getIssueType(element: HTMLElement, impact: string): string {
        const tagName = element.tagName.toLowerCase();
        const role = element.getAttribute('role');
        const alt = element.getAttribute('alt');
        const ariaLabel = element.getAttribute('aria-label');
        
        if (tagName === 'img' && (!alt || alt === '')) {
            return 'missing-alt';
        }
        
        if (tagName === 'button' && (!element.textContent?.trim() && !ariaLabel)) {
            return 'unlabeled-button';
        }
        
        if (tagName === 'a' && (!element.textContent?.trim() && !ariaLabel)) {
            return 'empty-link';
        }
        
        if (tagName === 'input' && !element.getAttribute('id') && !element.getAttribute('aria-label')) {
            return 'unlabeled-input';
        }
        
        if (element.style.color && element.style.backgroundColor) {
            return 'contrast-issue';
        }
        
        return 'general-issue';
    }

    private getIssueIcon(issueType: string): string {
        switch (issueType) {
            case 'missing-alt': return '🖼️';
            case 'unlabeled-button': return '🔘';
            case 'empty-link': return '🔗';
            case 'unlabeled-input': return '📝';
            case 'contrast-issue': return '🎨';
            case 'general-issue': return '⚠️';
            default: return '❓';
        }
    }

    private getIssueLabel(issueType: string): string {
        switch (issueType) {
            case 'missing-alt': return 'Missing Alt Text';
            case 'unlabeled-button': return 'Unlabeled Button';
            case 'empty-link': return 'Empty Link';
            case 'unlabeled-input': return 'Unlabeled Input';
            case 'contrast-issue': return 'Contrast Issue';
            case 'general-issue': return 'Accessibility Issue';
            default: return 'Unknown Issue';
        }
    }

    private getIssueDescription(element: HTMLElement, issueType: string): string {
        switch (issueType) {
            case 'missing-alt':
                return 'This image is missing alternative text. Screen readers cannot describe this image to users.';
            case 'unlabeled-button':
                return 'This button has no accessible name. Screen readers cannot announce what this button does.';
            case 'empty-link':
                return 'This link has no text content. Screen readers cannot announce the link destination.';
            case 'unlabeled-input':
                return 'This input field has no label. Users cannot understand what information to enter.';
            case 'contrast-issue':
                return 'This text may not have sufficient contrast with the background color.';
            case 'general-issue':
                return 'This element has an accessibility issue that should be addressed.';
            default:
                return 'This element needs accessibility improvements.';
        }
    }

    private showIssueDetails(element: HTMLElement, issueType: string, impact: string): void {
        // Create a modal or detailed view for the issue
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.backgroundColor = 'white';
        modal.style.padding = '20px';
        modal.style.borderRadius = '8px';
        modal.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
        modal.style.zIndex = '10003';
        modal.style.maxWidth = '500px';
        modal.style.fontFamily = 'Arial, sans-serif';
        
        const analysis = this.analyzeElement(element);
        
        modal.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 16px;">
                <span style="font-size: 24px; margin-right: 12px;">${this.getIssueIcon(issueType)}</span>
                <div>
                    <h3 style="margin: 0; color: #333;">Element Analysis</h3>
                    <span style="color: ${this.getImpactColor(impact)}; font-weight: bold;">${impact.toUpperCase()}</span>
                </div>
            </div>
            
            <div style="margin-bottom: 16px;">
                <h4 style="margin: 0 0 8px 0; color: #333;">What this element is:</h4>
                <p style="margin: 0; color: #666; line-height: 1.4;">${analysis.description}</p>
            </div>
            
            <div style="margin-bottom: 16px;">
                <h4 style="margin: 0 0 8px 0; color: #333;">How to fix it:</h4>
                <p style="margin: 0; color: #666; line-height: 1.4;">${analysis.suggestion}</p>
            </div>
            
            <div style="margin-bottom: 16px;">
                <h4 style="margin: 0 0 8px 0; color: #333;">Why this matters:</h4>
                <p style="margin: 0; color: #666; line-height: 1.4;">${analysis.context}</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 12px; border-radius: 4px; margin-bottom: 16px; font-family: monospace; font-size: 12px;">
                <strong>HTML Code:</strong><br>
                ${element.outerHTML.substring(0, 200)}${element.outerHTML.length > 200 ? '...' : ''}
            </div>
            
            <div style="text-align: right;">
                <button onclick="this.parentElement.parentElement.remove()" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
            </div>
        `;
        
        // Add backdrop
        const backdrop = document.createElement('div');
        backdrop.style.position = 'fixed';
        backdrop.style.top = '0';
        backdrop.style.left = '0';
        backdrop.style.width = '100%';
        backdrop.style.height = '100%';
        backdrop.style.backgroundColor = 'rgba(0,0,0,0.5)';
        backdrop.style.zIndex = '10002';
        backdrop.addEventListener('click', () => {
            backdrop.remove();
            modal.remove();
        });
        
        document.body.appendChild(backdrop);
        document.body.appendChild(modal);
    }

    private getImpactColor(impact: string): string {
        switch (impact) {
            case 'critical': return '#ff0000';
            case 'serious': return '#ff6600';
            case 'moderate': return '#ffcc00';
            case 'minor': return '#00cc00';
            default: return '#999999';
        }
    }

    public clearHighlights(): void {
        this.overlayElements.forEach(overlay => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        });
        this.overlayElements = [];
        this.highlightedElements.clear();
    }

    public setEnabled(enabled: boolean): void {
        console.log('AccessibilityService: setEnabled called with:', enabled);
        this.isEnabled = enabled;
        if (!enabled) {
            console.log('AccessibilityService: clearing highlights due to disable');
            this.clearHighlights();
        }
        console.log('AccessibilityService: isEnabled is now:', this.isEnabled);
    }

    public isAccessibilityEnabled(): boolean {
        return this.isEnabled;
    }

    public applyAccessibilityStyles(): void {
        if (!this.isEnabled) {
            return;
        }

        // Inject CSS for better accessibility - more targeted and less intrusive
        const style = document.createElement('style');
        style.id = 'inclusify-accessibility-styles';
        style.textContent = `
            /* Only apply styles to extension-specific elements */
            .inclusify-issue-overlay {
                position: absolute;
                pointer-events: none;
                z-index: 10000;
                box-sizing: border-box;
                transition: all 0.3s ease;
            }
            
            .inclusify-element-info {
                position: absolute;
                background-color: #007cba;
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: bold;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                z-index: 10001;
                cursor: pointer;
                pointer-events: auto;
                white-space: nowrap;
                max-width: 200px;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .inclusify-element-tooltip {
                position: absolute;
                background-color: #333;
                color: white;
                padding: 12px;
                border-radius: 8px;
                font-size: 12px;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 10002;
                pointer-events: none;
            }
            
            .inclusify-speech-icon {
                position: absolute;
                background-color: #007cba;
                color: white;
                padding: 4px;
                border-radius: 50%;
                font-size: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                z-index: 10001;
                cursor: pointer;
                pointer-events: auto;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            /* Focus styles - only apply to extension elements */
            .inclusify-focus-visible {
                outline: 3px solid #0066cc !important;
                outline-offset: 2px !important;
            }
            
            /* Interactive element highlighting - only for extension overlays */
            .inclusify-interactive-element {
                position: relative;
                outline: 2px dashed #0066cc !important;
                outline-offset: 2px !important;
                transition: all 0.3s ease;
                border-radius: 2px;
            }
            
            .inclusify-interactive-element:hover {
                outline: 3px solid #0066cc !important;
                outline-offset: 3px !important;
                transform: scale(1.02);
                box-shadow: 0 2px 8px rgba(0, 102, 204, 0.3);
            }

            .inclusify-interactive-element:focus {
                outline: 3px solid #ff6600 !important;
                outline-offset: 3px !important;
                box-shadow: 0 0 0 2px rgba(255, 102, 0, 0.3);
            }

            /* Different colors for different element types - only for extension elements */
            .inclusify-button {
                outline-color: #28a745 !important;
            }
            
            .inclusify-link {
                outline-color: #007bff !important;
            }
            
            .inclusify-input {
                outline-color: #17a2b8 !important;
            }
            
            .inclusify-form-control {
                outline-color: #6f42c1 !important;
            }
            
            .inclusify-focusable {
                outline-color: #fd7e14 !important;
            }
            
            .inclusify-tooltip {
                position: absolute;
                background: #0066cc;
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                white-space: nowrap;
                z-index: 10002;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                max-width: 300px;
            }
            
            .inclusify-interactive-element:hover .inclusify-tooltip {
                opacity: 1;
            }
            
            /* Remove any global filters that might affect website colors */
            /* Only apply specific styles to extension elements */
        `;
        
        if (!document.getElementById('inclusify-accessibility-styles')) {
            document.head.appendChild(style);
        }
    }

    public removeAccessibilityStyles(): void {
        const style = document.getElementById('inclusify-accessibility-styles');
        if (style) {
            style.remove();
        }
        
        // Also remove any extension-specific classes that might have been added
        const extensionClasses = [
            'inclusify-interactive-element',
            'inclusify-button',
            'inclusify-link',
            'inclusify-input',
            'inclusify-form-control',
            'inclusify-focusable',
            'inclusify-focus-visible'
        ];
        
        extensionClasses.forEach(className => {
            const elements = document.querySelectorAll(`.${className}`);
            elements.forEach(element => {
                element.classList.remove(className);
            });
        });
    }

    public ensureStyleIsolation(): void {
        // Ensure extension styles don't interfere with website styles
        const existingStyle = document.getElementById('inclusify-accessibility-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        // Re-apply styles with proper isolation
        this.applyAccessibilityStyles();
    }

    public highlightInteractiveElements(): void {
        if (!this.isEnabled) {
            console.log('AccessibilityService: highlightInteractiveElements called but not enabled');
            return;
        }

        console.log('AccessibilityService: Starting interactive element highlighting...');

        // Comprehensive list of interactive elements to check
        const interactiveSelectors = [
            'button',
            'a[href]',
            'input',
            'select',
            'textarea',
            'label',
            '[role="button"]',
            '[role="link"]',
            '[role="menuitem"]',
            '[role="tab"]',
            '[role="checkbox"]',
            '[role="radio"]',
            '[role="combobox"]',
            '[role="listbox"]',
            '[role="option"]',
            '[role="switch"]',
            '[role="slider"]',
            '[role="spinbutton"]',
            '[tabindex]',
            '[onclick]',
            '[onmouseover]',
            '[onmouseenter]',
            '[onfocus]',
            '[onblur]',
            '[onkeydown]',
            '[onkeyup]',
            '[onkeypress]'
        ];

        let totalElementsFound = 0;
        let totalOverlaysCreated = 0;

        interactiveSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            console.log(`AccessibilityService: Found ${elements.length} elements for selector: ${selector}`);
            totalElementsFound += elements.length;
            
            elements.forEach(element => {
                if (element instanceof HTMLElement) {
                    // Exclude sidebar elements from being highlighted
                    if (this.shouldExcludeElement(element)) {
                        console.log('AccessibilityService: Skipping sidebar element:', element.tagName);
                        return;
                    }
                    
                    console.log(`AccessibilityService: Adding highlight to element:`, element.tagName, element.textContent?.substring(0, 20));
                    this.addInteractiveHighlight(element);
                    totalOverlaysCreated++;
                }
            });
        });

        // Also check for elements with event listeners (basic check)
        this.checkForEventListeners();

        console.log(`AccessibilityService: Interactive highlighting complete. Found ${totalElementsFound} elements, created ${totalOverlaysCreated} overlays`);
    }

    private checkForEventListeners(): void {
        // This is a simplified check - in a real implementation, you might want to
        // track event listeners more comprehensively
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
            if (element instanceof HTMLElement) {
                // Exclude sidebar elements from being highlighted
                if (this.shouldExcludeElement(element)) {
                    return;
                }
                
                // Check for common interactive patterns
                const hasClickHandler = element.onclick || 
                    element.getAttribute('onclick') || 
                    element.getAttribute('data-action') ||
                    element.classList.contains('clickable') ||
                    element.classList.contains('btn') ||
                    element.classList.contains('button');
                
                if (hasClickHandler && !element.classList.contains('inclusify-interactive-element')) {
                    this.addInteractiveHighlight(element);
                }
            }
        });
    }

    private addInteractiveHighlight(element: HTMLElement): void {
        console.log(`AccessibilityService: Creating interactive highlight for ${element.tagName} element`);
        
        // Add base CSS class for interactive highlighting
        element.classList.add('inclusify-interactive-element');
        
        // Add specific class based on element type
        const tagName = element.tagName.toLowerCase();
        const role = element.getAttribute('role');
        
        if (tagName === 'button' || role === 'button') {
            element.classList.add('inclusify-button');
        } else if (tagName === 'a') {
            element.classList.add('inclusify-link');
        } else if (tagName === 'input' || tagName === 'select' || tagName === 'textarea') {
            element.classList.add('inclusify-input');
        } else if (tagName === 'label' || role === 'checkbox' || role === 'radio') {
            element.classList.add('inclusify-form-control');
        } else if (element.hasAttribute('tabindex') || role) {
            element.classList.add('inclusify-focusable');
        }
        
        // Create visual overlay with icon
        const rect = element.getBoundingClientRect();
        console.log(`AccessibilityService: Element rect:`, rect);
        
        // Create overlay for interactive elements
        const overlay = document.createElement('div');
        overlay.className = 'inclusify-interactive-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = `${rect.top + window.scrollY}px`;
        overlay.style.left = `${rect.left + window.scrollX}px`;
        overlay.style.width = `${rect.width}px`;
        overlay.style.height = `${rect.height}px`;
        overlay.style.border = `2px solid ${this.getInteractiveElementColor(element)}`;
        overlay.style.backgroundColor = 'transparent'; // Make background transparent
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '10000';
        overlay.style.boxSizing = 'border-box';
        overlay.style.transition = 'all 0.3s ease';
        
        console.log(`AccessibilityService: Created overlay with styles:`, {
            top: overlay.style.top,
            left: overlay.style.left,
            width: overlay.style.width,
            height: overlay.style.height,
            border: overlay.style.border,
            backgroundColor: overlay.style.backgroundColor,
            zIndex: overlay.style.zIndex
        });
        
        // Create icon badge for interactive element
        const iconBadge = document.createElement('div');
        iconBadge.className = 'inclusify-interactive-icon';
        iconBadge.style.position = 'absolute';
        iconBadge.style.top = '-20px';
        iconBadge.style.right = '-20px';
        iconBadge.style.width = '40px';
        iconBadge.style.height = '40px';
        iconBadge.style.backgroundColor = this.getInteractiveElementColor(element);
        iconBadge.style.borderRadius = '50%';
        iconBadge.style.display = 'flex';
        iconBadge.style.alignItems = 'center';
        iconBadge.style.justifyContent = 'center';
        iconBadge.style.color = 'white';
        iconBadge.style.fontSize = '16px';
        iconBadge.style.fontWeight = 'bold';
        iconBadge.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
        iconBadge.style.zIndex = '10000';
        iconBadge.style.cursor = 'pointer';
        iconBadge.style.pointerEvents = 'auto';
        
        // Set icon based on element type
        const elementType = this.getElementType(element);
        iconBadge.innerHTML = this.getInteractiveElementIcon(elementType);
        iconBadge.title = this.getElementInfo(element).description;
        
        console.log(`AccessibilityService: Created icon badge for element type: ${elementType}`);
        
        // Create tooltip for the element
        const tooltip = document.createElement('div');
        tooltip.className = 'inclusify-interactive-tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.top = '-60px';
        tooltip.style.left = '50px';
        tooltip.style.backgroundColor = '#007bff';
        tooltip.style.color = 'white';
        tooltip.style.padding = '8px 12px';
        tooltip.style.borderRadius = '6px';
        tooltip.style.fontSize = '11px';
        tooltip.style.maxWidth = '250px';
        tooltip.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        tooltip.style.opacity = '0';
        tooltip.style.transition = 'opacity 0.3s ease';
        tooltip.style.zIndex = '10001';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.whiteSpace = 'nowrap';
        tooltip.textContent = this.getElementInfo(element).description;
        
        // Add hover effects
        iconBadge.addEventListener('mouseenter', () => {
            tooltip.style.opacity = '1';
        });
        
        iconBadge.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
        });
        
        // Add click handler for element details
        iconBadge.addEventListener('click', () => {
            this.showInteractiveElementDetails(element, elementType);
        });
        
        overlay.appendChild(iconBadge);
        overlay.appendChild(tooltip);
        document.body.appendChild(overlay);
        
        console.log(`AccessibilityService: Added overlay to document.body`);
        
        // Store overlay reference for cleanup
        if (!this.interactiveOverlays) {
            this.interactiveOverlays = [];
        }
        this.interactiveOverlays.push(overlay);
        
        console.log(`AccessibilityService: Stored overlay reference. Total overlays: ${this.interactiveOverlays.length}`);
    }

    private getElementType(element: HTMLElement): string {
        const tagName = element.tagName.toLowerCase();
        const role = element.getAttribute('role');
        const type = element.getAttribute('type');
        
        if (tagName === 'button' || role === 'button') {
            return 'button';
        } else if (tagName === 'a') {
            return 'link';
        } else if (tagName === 'input') {
            const inputType = type || 'text';
            switch (inputType) {
                case 'checkbox': return 'checkbox';
                case 'radio': return 'radio';
                case 'submit': return 'submit';
                case 'file': return 'file';
                case 'range': return 'range';
                case 'date':
                case 'time':
                case 'datetime-local': return 'date';
                default: return 'input';
            }
        } else if (tagName === 'select') {
            return 'select';
        } else if (tagName === 'textarea') {
            return 'textarea';
        } else if (tagName === 'label') {
            return 'label';
        } else if (role) {
            return role;
        } else if (element.hasAttribute('tabindex')) {
            return 'focusable';
        } else {
            return 'interactive';
        }
    }

    private getInteractiveElementIcon(elementType: string): string {
        switch (elementType) {
            case 'button': return '🔘';
            case 'link': return '🔗';
            case 'input': return '📝';
            case 'checkbox': return '☑️';
            case 'radio': return '🔘';
            case 'submit': return '📤';
            case 'file': return '📁';
            case 'range': return '🎚️';
            case 'date': return '📅';
            case 'select': return '📋';
            case 'textarea': return '📄';
            case 'label': return '🏷️';
            case 'focusable': return '⌨️';
            case 'interactive': return '👆';
            default: return '🔘';
        }
    }

    private getInteractiveElementColor(element: HTMLElement): string {
        const tagName = element.tagName.toLowerCase();
        const role = element.getAttribute('role');
        
        if (tagName === 'button' || role === 'button') {
            return '#28a745'; // Green for buttons
        } else if (tagName === 'a') {
            return '#007bff'; // Blue for links
        } else if (tagName === 'input' || tagName === 'select' || tagName === 'textarea') {
            return '#17a2b8'; // Teal for form controls
        } else if (tagName === 'label' || role === 'checkbox' || role === 'radio') {
            return '#6f42c1'; // Purple for form controls
        } else if (element.hasAttribute('tabindex') || role) {
            return '#fd7e14'; // Orange for focusable elements
        } else {
            return '#6c757d'; // Gray for other interactive elements
        }
    }

    private showInteractiveElementDetails(element: HTMLElement, elementType: string): void {
        // Create a modal for interactive element details
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.backgroundColor = 'white';
        modal.style.padding = '20px';
        modal.style.borderRadius = '8px';
        modal.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
        modal.style.zIndex = '10003';
        modal.style.maxWidth = '400px';
        modal.style.fontFamily = 'Arial, sans-serif';
        
        const elementInfo = this.getElementInfo(element);
        
        modal.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 16px;">
                <span style="font-size: 24px; margin-right: 12px;">${this.getInteractiveElementIcon(elementType)}</span>
                <div>
                    <h3 style="margin: 0; color: #333;">${elementInfo.type}</h3>
                    <span style="color: ${this.getInteractiveElementColor(element)}; font-weight: bold;">Interactive Element</span>
                </div>
            </div>
            <div style="margin-bottom: 16px;">
                <p style="margin: 0 0 8px 0; color: #666;"><strong>Description:</strong> ${elementInfo.description}</p>
                <p style="margin: 0 0 8px 0; color: #666;"><strong>Action:</strong> ${elementInfo.action}</p>
                ${elementInfo.attributes ? `<p style="margin: 0; color: #666;"><strong>Attributes:</strong> ${elementInfo.attributes}</p>` : ''}
            </div>
            <div style="background: #f8f9fa; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
                <strong>Element:</strong> ${element.outerHTML.substring(0, 100)}${element.outerHTML.length > 100 ? '...' : ''}
            </div>
            <div style="text-align: right;">
                <button onclick="this.parentElement.parentElement.remove()" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
            </div>
        `;
        
        // Add backdrop
        const backdrop = document.createElement('div');
        backdrop.style.position = 'fixed';
        backdrop.style.top = '0';
        backdrop.style.left = '0';
        backdrop.style.width = '100%';
        backdrop.style.height = '100%';
        backdrop.style.backgroundColor = 'rgba(0,0,0,0.5)';
        backdrop.style.zIndex = '10002';
        backdrop.addEventListener('click', () => {
            backdrop.remove();
            modal.remove();
        });
        
        document.body.appendChild(backdrop);
        document.body.appendChild(modal);
    }

    private getElementInfo(element: HTMLElement): { type: string; description: string; action: string; attributes?: string } {
        const tagName = element.tagName.toLowerCase();
        const role = element.getAttribute('role');
        const type = element.getAttribute('type');
        const href = element.getAttribute('href');
        const ariaLabel = element.getAttribute('aria-label');
        const title = element.getAttribute('title');
        const textContent = element.textContent?.trim();
        
        let typeLabel = '';
        let description = '';
        let action = '';
        let attributes = '';
        
        if (tagName === 'button') {
            typeLabel = 'Button';
            description = ariaLabel || title || textContent || 'Unlabeled button';
            action = 'Click to perform an action';
        } else if (tagName === 'a') {
            typeLabel = 'Link';
            description = ariaLabel || title || textContent || 'Unlabeled link';
            action = href ? `Click to navigate to ${href}` : 'Click to navigate';
        } else if (tagName === 'input') {
            const inputType = type || 'text';
            typeLabel = `${inputType.charAt(0).toUpperCase() + inputType.slice(1)} Input`;
            description = ariaLabel || title || element.getAttribute('placeholder') || 'Input field';
            action = 'Click or tab to enter text';
        } else if (tagName === 'select') {
            typeLabel = 'Dropdown';
            description = ariaLabel || title || 'Selection dropdown';
            action = 'Click to open options';
        } else if (tagName === 'textarea') {
            typeLabel = 'Text Area';
            description = ariaLabel || title || element.getAttribute('placeholder') || 'Multi-line text input';
            action = 'Click or tab to enter text';
        } else if (role) {
            typeLabel = `${role.charAt(0).toUpperCase() + role.slice(1)}`;
            description = ariaLabel || title || textContent || `Element with role "${role}"`;
            action = 'Interactive element';
        } else {
            typeLabel = 'Interactive Element';
            description = ariaLabel || title || textContent || 'Interactive element';
            action = 'Clickable element';
        }
        
        // Collect important attributes
        const importantAttrs = [];
        if (element.getAttribute('id')) importantAttrs.push(`id="${element.getAttribute('id')}"`);
        if (element.getAttribute('class')) importantAttrs.push(`class="${element.getAttribute('class')}"`);
        if (element.getAttribute('aria-label')) importantAttrs.push(`aria-label="${element.getAttribute('aria-label')}"`);
        if (element.getAttribute('tabindex')) importantAttrs.push(`tabindex="${element.getAttribute('tabindex')}"`);
        
        if (importantAttrs.length > 0) {
            attributes = importantAttrs.join(', ');
        }
        
        return { type: typeLabel, description, action, attributes };
    }

    public clearInteractiveHighlights(): void {
        // Remove all inclusify CSS classes
        const inclusifyClasses = [
            'inclusify-interactive-element',
            'inclusify-button',
            'inclusify-link',
            'inclusify-input',
            'inclusify-form-control',
            'inclusify-focusable'
        ];
        
        inclusifyClasses.forEach(className => {
            document.querySelectorAll(`.${className}`).forEach(element => {
                element.classList.remove(className);
            });
        });
        
        // Remove tooltips
        if (this.interactiveTooltips) {
            this.interactiveTooltips.forEach(tooltip => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            });
            this.interactiveTooltips = [];
        }

        // Remove interactive overlays
        if (this.interactiveOverlays) {
            this.interactiveOverlays.forEach(overlay => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            });
            this.interactiveOverlays = [];
        }
    }

    public clearAllHighlights(): void {
        this.clearHighlights();
        this.clearInteractiveHighlights();
    }

    private analyzeElement(element: HTMLElement): { description: string; suggestion: string; context: string } {
        const tagName = element.tagName.toLowerCase();
        const className = element.className;
        const id = element.id;
        const textContent = element.textContent?.trim() || '';
        const attributes = Array.from(element.attributes).map(attr => `${attr.name}="${attr.value}"`).join(' ');
        
        // Analyze based on tag name and context
        switch (tagName) {
            case 'img':
                const src = element.getAttribute('src') || '';
                const alt = element.getAttribute('alt') || '';
                const filename = src.split('/').pop()?.split('.')[0] || '';
                
                if (!alt || alt === '') {
                    return {
                        description: 'Image without alternative text',
                        suggestion: `Add descriptive alt text. Suggested: "${this.generateAltText(element)}"`,
                        context: `This image (${filename}) needs alt text for screen readers. Consider what the image represents and describe it briefly.`
                    };
                } else if (alt === filename) {
                    return {
                        description: 'Image with redundant alt text',
                        suggestion: 'Replace with descriptive alt text that explains the image content',
                        context: 'The alt text is the same as the filename, which doesn\'t help users understand the image.'
                    };
                }
                break;

            case 'button':
                if (!textContent && !element.getAttribute('aria-label')) {
                    const icon = element.querySelector('i, span, img');
                    if (icon) {
                        return {
                            description: 'Button with icon but no accessible name',
                            suggestion: 'Add aria-label or text content to describe the button\'s purpose',
                            context: 'This button has an icon but no text or label that screen readers can announce.'
                        };
                    } else {
                        return {
                            description: 'Empty button without accessible name',
                            suggestion: 'Add text content or aria-label to describe what this button does',
                            context: 'This button has no text or label, making it inaccessible to screen readers.'
                        };
                    }
                }
                break;

            case 'a':
                if (!textContent && !element.getAttribute('aria-label')) {
                    const href = element.getAttribute('href') || '';
                    return {
                        description: 'Link without accessible text',
                        suggestion: 'Add descriptive text or aria-label to explain where this link goes',
                        context: `This link (${href}) has no text content for screen readers to announce.`
                    };
                }
                break;

            case 'input':
                const type = element.getAttribute('type') || 'text';
                const placeholder = element.getAttribute('placeholder') || '';
                const label = this.findAssociatedLabel(element);
                
                if (!label && !element.getAttribute('aria-label')) {
                    return {
                        description: `Input field without label`,
                        suggestion: `Add a <label> element or aria-label to describe this ${type} input`,
                        context: `This ${type} input field needs a label so users know what information to enter.`
                    };
                }
                break;

            case 'h1':
            case 'h2':
            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6':
                if (!textContent) {
                    return {
                        description: 'Empty heading',
                        suggestion: 'Add text content to this heading or remove it if not needed',
                        context: 'This heading has no text content, which confuses screen reader users.'
                    };
                }
                break;

            case 'div':
                if (className.includes('button') || className.includes('btn')) {
                    return {
                        description: 'Div styled as button',
                        suggestion: 'Use a <button> element instead of a styled div for better accessibility',
                        context: 'This div is styled to look like a button but doesn\'t have button functionality for keyboard users.'
                    };
                }
                break;

            case 'span':
                if (className.includes('button') || className.includes('btn')) {
                    return {
                        description: 'Span styled as button',
                        suggestion: 'Use a <button> element instead of a styled span for better accessibility',
                        context: 'This span is styled to look like a button but doesn\'t have button functionality.'
                    };
                }
                break;
        }

        // Analyze based on common patterns
        if (className.includes('menu') || className.includes('nav')) {
            return {
                description: 'Navigation element',
                suggestion: 'Ensure proper ARIA roles and labels for navigation',
                context: 'This appears to be a navigation element. Make sure it has proper ARIA roles and labels.'
            };
        }

        if (className.includes('form') || element.closest('form')) {
            return {
                description: 'Form element',
                suggestion: 'Ensure all form controls have proper labels and validation',
                context: 'This is part of a form. All form controls should have labels and proper validation.'
            };
        }

        if (className.includes('card') || className.includes('item')) {
            return {
                description: 'Content card/item',
                suggestion: 'Add proper heading structure and semantic markup',
                context: 'This appears to be a content card. Use proper heading structure and semantic HTML.'
            };
        }

        // Default analysis
        return {
            description: `${tagName} element`,
            suggestion: 'Review for accessibility best practices',
            context: `This is a ${tagName} element. Consider if it needs proper labels, roles, or semantic markup.`
        };
    }

    private findAssociatedLabel(element: HTMLElement): HTMLElement | null {
        const id = element.getAttribute('id');
        if (id) {
            const label = document.querySelector(`label[for="${id}"]`);
            if (label) return label as HTMLElement;
        }
        
        // Check if element is wrapped in a label
        const parentLabel = element.closest('label');
        if (parentLabel) return parentLabel as HTMLElement;
        
        return null;
    }

    private generateContextualDescription(element: HTMLElement): string {
        const analysis = this.analyzeElement(element);
        const tagName = element.tagName.toLowerCase();
        const className = element.className;
        const id = element.id;
        
        let context = `Element: <${tagName}`;
        if (id) context += ` id="${id}"`;
        if (className) context += ` class="${className}"`;
        context += '>\n\n';
        
        context += `Analysis: ${analysis.description}\n`;
        context += `Suggestion: ${analysis.suggestion}\n`;
        context += `Context: ${analysis.context}`;
        
        return context;
    }

    private analyzeDivContent(element: HTMLElement): { label: string; description: string; suggestion: string } {
        const textContent = element.textContent?.trim() || '';
        const children = Array.from(element.children);
        const hasTextContent = textContent !== '';
        const hasChildren = children.length > 0;
        
        // Analyze child elements
        const hasImages = children.some(child => child.tagName.toLowerCase() === 'img');
        const hasButtons = children.some(child => 
            child instanceof HTMLElement && 
            (child.tagName.toLowerCase() === 'button' || child.getAttribute('role') === 'button')
        );
        const hasLinks = children.some(child => child.tagName.toLowerCase() === 'a');
        const hasInputs = children.some(child => 
            child instanceof HTMLElement && 
            ['input', 'select', 'textarea'].includes(child.tagName.toLowerCase())
        );
        const hasHeadings = children.some(child => 
            child instanceof HTMLElement && 
            /^h[1-6]$/.test(child.tagName.toLowerCase())
        );
        const hasLists = children.some(child => 
            child instanceof HTMLElement && 
            ['ul', 'ol'].includes(child.tagName.toLowerCase())
        );
        const hasForms = children.some(child => child.tagName.toLowerCase() === 'form');
        const hasParagraphs = children.some(child => child.tagName.toLowerCase() === 'p');
        
        // Count different types of content
        const imageCount = children.filter(child => child.tagName.toLowerCase() === 'img').length;
        const buttonCount = children.filter(child => 
            child instanceof HTMLElement && 
            (child.tagName.toLowerCase() === 'button' || child.getAttribute('role') === 'button')
        ).length;
        const linkCount = children.filter(child => child.tagName.toLowerCase() === 'a').length;
        const inputCount = children.filter(child => 
            child instanceof HTMLElement && 
            ['input', 'select', 'textarea'].includes(child.tagName.toLowerCase())
        ).length;
        const headingCount = children.filter(child => 
            child instanceof HTMLElement && 
            /^h[1-6]$/.test(child.tagName.toLowerCase())
        ).length;
        
        // Determine the primary content type
        if (hasForms) {
            return {
                label: '📝 Div with Form',
                description: 'Div containing form elements',
                suggestion: 'Consider if this div should be a form element or if it needs proper form semantics'
            };
        } else if (hasImages && hasTextContent) {
            return {
                label: '📷 Div with Image & Text',
                description: `Div containing ${imageCount} image(s) and text content`,
                suggestion: 'Consider if this div should be an article or figure element'
            };
        } else if (hasImages && !hasTextContent) {
            return {
                label: '📷 Div with Images',
                description: `Div containing ${imageCount} image(s)`,
                suggestion: 'Consider if this div should be a figure or gallery element'
            };
        } else if (hasButtons && hasTextContent) {
            return {
                label: '🔘 Div with Buttons & Text',
                description: `Div containing ${buttonCount} button(s) and text content`,
                suggestion: 'Consider if this div should be a toolbar or navigation element'
            };
        } else if (hasButtons && !hasTextContent) {
            return {
                label: '🔘 Div with Buttons',
                description: `Div containing ${buttonCount} button(s)`,
                suggestion: 'Consider if this div should be a toolbar or button group'
            };
        } else if (hasLinks && hasTextContent) {
            return {
                label: '🔗 Div with Links & Text',
                description: `Div containing ${linkCount} link(s) and text content`,
                suggestion: 'Consider if this div should be a navigation or content section'
            };
        } else if (hasLinks && !hasTextContent) {
            return {
                label: '🔗 Div with Links',
                description: `Div containing ${linkCount} link(s)`,
                suggestion: 'Consider if this div should be a navigation element'
            };
        } else if (hasInputs && hasTextContent) {
            return {
                label: '📝 Div with Form Controls & Text',
                description: `Div containing ${inputCount} form control(s) and text content`,
                suggestion: 'Consider if this div should be a form or fieldset element'
            };
        } else if (hasInputs && !hasTextContent) {
            return {
                label: '📝 Div with Form Controls',
                description: `Div containing ${inputCount} form control(s)`,
                suggestion: 'Consider if this div should be a form or fieldset element'
            };
        } else if (hasHeadings && hasTextContent) {
            return {
                label: '📋 Div with Headings & Text',
                description: `Div containing ${headingCount} heading(s) and text content`,
                suggestion: 'Consider if this div should be a section or article element'
            };
        } else if (hasHeadings && !hasTextContent) {
            return {
                label: '📋 Div with Headings',
                description: `Div containing ${headingCount} heading(s)`,
                suggestion: 'Consider if this div should be a section or article element'
            };
        } else if (hasLists && hasTextContent) {
            return {
                label: '📋 Div with Lists & Text',
                description: 'Div containing lists and text content',
                suggestion: 'Consider if this div should be a section or article element'
            };
        } else if (hasLists && !hasTextContent) {
            return {
                label: '📋 Div with Lists',
                description: 'Div containing lists',
                suggestion: 'Consider if this div should be a section or article element'
            };
        } else if (hasParagraphs && hasTextContent) {
            return {
                label: '📝 Div with Paragraphs & Text',
                description: 'Div containing paragraphs and text content',
                suggestion: 'Consider if this div should be a section or article element'
            };
        } else if (hasParagraphs && !hasTextContent) {
            return {
                label: '📝 Div with Paragraphs',
                description: 'Div containing paragraphs',
                suggestion: 'Consider if this div should be a section or article element'
            };
        } else if (hasTextContent && !hasChildren) {
            return {
                label: '📝 Div with Text Only',
                description: 'Div containing only text content',
                suggestion: 'Consider if this div should be a paragraph element'
            };
        } else if (hasTextContent && hasChildren) {
            return {
                label: '📄 Div with Mixed Content',
                description: 'Div containing text and other elements',
                suggestion: 'Consider if this div should be a section or article element'
            };
        } else if (hasChildren && !hasTextContent) {
            return {
                label: '📄 Div with Elements',
                description: 'Div containing other elements but no text content',
                suggestion: 'Consider if this div should be a section or if it needs semantic markup'
            };
        } else {
            return {
                label: '📄 Empty Div',
                description: 'Empty div element',
                suggestion: 'Remove this div if it serves no purpose, or add content and semantic markup'
            };
        }
    }

    private speakElement(element: HTMLElement): void {
        // Stop any currently speaking
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        
        // Get the text content to speak
        let textToSpeak = '';
        
        // For images, use alt text or generate description
        if (element.tagName.toLowerCase() === 'img') {
            const alt = element.getAttribute('alt') || '';
            if (alt) {
                textToSpeak = alt;
            } else {
                textToSpeak = this.generateAltText(element);
            }
        } else {
            // For other elements, get their text content
            textToSpeak = element.textContent?.trim() || '';
        }
        
        // If no text content, try to get a description
        if (!textToSpeak) {
            const elementInfo = this.getElementContextualInfo(element);
            textToSpeak = elementInfo.description;
        }
        
        // Create speech utterance
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        
        // Configure speech settings
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        // Try to use a good voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
            voice.lang.startsWith('en') && voice.name.includes('Female')
        ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
        
        if (preferredVoice && utterance.voice !== undefined && preferredVoice) {
            utterance.voice = preferredVoice;
        }
        
        // Add visual feedback
        this.showSpeechFeedback(element, textToSpeak, utterance);
        
        // Speak the text
        window.speechSynthesis.speak(utterance);
        
        // Log for debugging
        console.log('Speaking:', textToSpeak);
    }
    
    private showSpeechFeedback(element: HTMLElement, text: string, utterance: SpeechSynthesisUtterance): void {
        // Create a temporary feedback element
        const feedback = document.createElement('div');
        feedback.style.position = 'fixed';
        feedback.style.top = '20px';
        feedback.style.right = '20px';
        feedback.style.backgroundColor = '#007cba';
        feedback.style.color = 'white';
        feedback.style.padding = '12px 16px';
        feedback.style.borderRadius = '8px';
        feedback.style.fontSize = '14px';
        feedback.style.zIndex = '10004';
        feedback.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        feedback.style.maxWidth = '300px';
        feedback.style.wordWrap = 'break-word';
        feedback.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px;">🔊</span>
                <span>Speaking: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"</span>
            </div>
        `;
        
        document.body.appendChild(feedback);
        
        // Remove feedback after speech ends
        const removeFeedback = () => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        };
        
        // Remove after 3 seconds or when speech ends
        setTimeout(removeFeedback, 3000);
        
        // Also remove when speech ends
        utterance.onend = removeFeedback;
    }
} 