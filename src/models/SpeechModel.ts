export class SpeechModel {
    private synth: SpeechSynthesis;
    private utterance: SpeechSynthesisUtterance | null = null;
    private voices: SpeechSynthesisVoice[] = [];

    constructor() {
        this.synth = window.speechSynthesis;
        this.loadVoices();
    }

    private loadVoices() {
        this.voices = this.synth.getVoices();
        if (this.voices.length === 0) {
            this.synth.onvoiceschanged = () => {
                this.voices = this.synth.getVoices();
            };
        }
    }

    public getVoices(): SpeechSynthesisVoice[] {
        return this.voices;
    }

    public speak(text: string, rate: number = 1.0, voiceName: string = ""): void {
        this.stop();
        this.utterance = new SpeechSynthesisUtterance(text);
        this.utterance.rate = rate;
        if (voiceName) {
            const voice = this.voices.find(v => v.name === voiceName);
            if (voice) {
                this.utterance.voice = voice;
            }
        }
        this.synth.speak(this.utterance);
    }

    public stop(): void {
        if (this.synth.speaking) {
            this.synth.cancel();
        }
        this.utterance = null;
    }
} 