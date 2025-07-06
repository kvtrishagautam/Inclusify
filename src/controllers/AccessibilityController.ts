import { AccessibilityService, type AccessibilityIssue, type AltTextSuggestion } from '../services/AccessibilityService';

export class AccessibilityController {
    private accessibilityService: AccessibilityService;
    private isEnabled: boolean = false;
    private currentIssues: AccessibilityIssue[] = [];
    private altTextSuggestions: AltTextSuggestion[] = [];
    private isAuditRunning: boolean = false;

    constructor() {
        this.accessibilityService = new AccessibilityService();
        this.loadSettings();
    }

    private async loadSettings(): Promise<void> {
        try {
            console.log('Loading settings from chrome.storage...');
            const result = await chrome.storage.sync.get(['accessibilityEnabled']);
            console.log('Loaded settings:', result);
            this.isEnabled = result.accessibilityEnabled || false;
            console.log('Set isEnabled to:', this.isEnabled);
            this.accessibilityService.setEnabled(this.isEnabled);
        } catch (error) {
            console.error('Failed to load accessibility settings:', error);
            // Fallback to local storage if chrome.storage fails
            this.isEnabled = false;
            this.accessibilityService.setEnabled(false);
        }
    }

    private async saveSettings(): Promise<void> {
        try {
            console.log('Saving settings to chrome.storage:', { accessibilityEnabled: this.isEnabled });
            await chrome.storage.sync.set({ accessibilityEnabled: this.isEnabled });
            console.log('Settings saved successfully');
        } catch (error) {
            console.error('Failed to save accessibility settings:', error);
        }
    }

    public async toggleAccessibility(): Promise<void> {
        console.log('AccessibilityController: toggleAccessibility called, current state:', this.isEnabled);
        this.isEnabled = !this.isEnabled;
        console.log('AccessibilityController: new state:', this.isEnabled);
        this.accessibilityService.setEnabled(this.isEnabled);
        await this.saveSettings();

        if (this.isEnabled) {
            console.log('AccessibilityController: running full audit...');
            await this.runFullAudit();
        } else {
            console.log('AccessibilityController: clearing highlights...');
            this.clearAllHighlights();
        }
    }

    public async runFullAudit(): Promise<void> {
        if (!this.isEnabled || this.isAuditRunning) {
            console.log('Audit skipped - disabled or already running');
            return;
        }

        this.isAuditRunning = true;

        try {
            console.log('Starting full accessibility audit...');
            
            // Run accessibility audit
            this.currentIssues = await this.accessibilityService.runAudit();
            
            // Generate alt-text suggestions
            this.altTextSuggestions = await this.accessibilityService.generateAltTextForImages();
            
            // Highlight issues
            this.accessibilityService.highlightIssues(this.currentIssues);
            
            // Highlight interactive elements
            this.accessibilityService.highlightInteractiveElements();
            
            // Apply accessibility styles
            this.accessibilityService.applyAccessibilityStyles();
            
            console.log(`Accessibility audit completed. Found ${this.currentIssues.length} issues and ${this.altTextSuggestions.length} alt-text suggestions.`);
        } catch (error) {
            console.error('Accessibility audit failed:', error);
        } finally {
            this.isAuditRunning = false;
        }
    }

    public async runQuickAudit(): Promise<AccessibilityIssue[]> {
        if (!this.isEnabled || this.isAuditRunning) {
            console.log('Quick audit skipped - disabled or already running');
            return [];
        }

        this.isAuditRunning = true;

        try {
            const issues = await this.accessibilityService.runAudit();
            this.currentIssues = issues;
            return issues;
        } catch (error) {
            console.error('Quick accessibility audit failed:', error);
            return [];
        } finally {
            this.isAuditRunning = false;
        }
    }

    public getCurrentIssues(): AccessibilityIssue[] {
        return this.currentIssues;
    }

    public getAltTextSuggestions(): AltTextSuggestion[] {
        return this.altTextSuggestions;
    }

    public async applyAltTextSuggestion(suggestion: AltTextSuggestion): Promise<void> {
        if (!this.isEnabled) {
            return;
        }

        try {
            suggestion.element.setAttribute('alt', suggestion.suggestedAltText);
            
            // Remove the suggestion from the list
            this.altTextSuggestions = this.altTextSuggestions.filter(s => s !== suggestion);
            
            console.log('Alt text applied:', suggestion.suggestedAltText);
        } catch (error) {
            console.error('Failed to apply alt text:', error);
        }
    }

    public clearAllHighlights(): void {
        this.accessibilityService.clearAllHighlights();
        this.accessibilityService.removeAccessibilityStyles();
    }

    public isAccessibilityEnabled(): boolean {
        return this.isEnabled;
    }

    public setEnabled(enabled: boolean): void {
        console.log('AccessibilityController: setEnabled called with:', enabled);
        this.isEnabled = enabled;
        this.accessibilityService.setEnabled(enabled);
        
        if (enabled) {
            // Save the enabled state
            this.saveSettings();
        } else {
            // Clear highlights when disabled
            this.clearAllHighlights();
            this.saveSettings();
        }
    }

    public getIssueCount(): number {
        return this.currentIssues.length;
    }

    public getAltTextSuggestionCount(): number {
        return this.altTextSuggestions.length;
    }

    public getIssuesByImpact(impact: string): AccessibilityIssue[] {
        return this.currentIssues.filter(issue => issue.impact === impact);
    }

    public getCriticalIssues(): AccessibilityIssue[] {
        return this.getIssuesByImpact('critical');
    }

    public getSeriousIssues(): AccessibilityIssue[] {
        return this.getIssuesByImpact('serious');
    }

    public getModerateIssues(): AccessibilityIssue[] {
        return this.getIssuesByImpact('moderate');
    }

    public getMinorIssues(): AccessibilityIssue[] {
        return this.getIssuesByImpact('minor');
    }

    public async refreshAudit(): Promise<void> {
        if (this.isAuditRunning) {
            console.log('Refresh audit skipped - already running');
            return;
        }
        
        this.clearAllHighlights();
        await this.runFullAudit();
    }

    // Manual audit trigger for testing
    public async manualAudit(): Promise<void> {
        console.log('Manual audit triggered');
        if (this.isAuditRunning) {
            console.log('Manual audit skipped - already running');
            return;
        }
        
        try {
            const issues = await this.accessibilityService.runAudit();
            this.currentIssues = issues;
            this.accessibilityService.highlightIssues(issues);
            console.log(`Manual audit completed with ${issues.length} issues`);
        } catch (error) {
            console.error('Manual audit failed:', error);
        }
    }
} 