export class SpeechModel {
    private speechSynthesis: SpeechSynthesis | null = null;
    private voices: SpeechSynthesisVoice[] = [];

    constructor() {
        this.initializeSpeechSynthesis();
    }

    private initializeSpeechSynthesis(): void {
        // Check if we're in a context where window is available
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            this.speechSynthesis = window.speechSynthesis;
            this.loadVoices();
            
            // Listen for voices to be loaded
            if (this.speechSynthesis.onvoiceschanged) {
                this.speechSynthesis.onvoiceschanged = () => {
                    this.loadVoices();
                };
            }
        }
    }

    private loadVoices(): void {
        if (this.speechSynthesis) {
            this.voices = this.speechSynthesis.getVoices();
        }
    }

    public getVoices(): SpeechSynthesisVoice[] {
        return this.voices;
    }

    public speak(text: string, rate: number = 1.0, voiceName?: string): void {
        if (!this.speechSynthesis || !text.trim() || typeof window === 'undefined') {
            return;
        }

        // Stop any current speech
        this.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        
        if (voiceName) {
            const voice = this.voices.find(v => v.name === voiceName);
            if (voice) {
                utterance.voice = voice;
            }
        }

        this.speechSynthesis.speak(utterance);
    }

    public stop(): void {
        if (this.speechSynthesis && typeof window !== 'undefined') {
            this.speechSynthesis.cancel();
        }
    }

    public isSpeaking(): boolean {
        return this.speechSynthesis && typeof window !== 'undefined' ? this.speechSynthesis.speaking : false;
    }
} 