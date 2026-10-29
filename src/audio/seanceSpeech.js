// Advanced Speech Synthesis (TTS) & Recognition (STT) Engine for Séance
// Handles Chrome 15s audio cutoff bug, custom persona voice routing, and live continuous dictation.

class SeanceSpeechEngine {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.isSpeaking = false;
    this.currentUtteranceQueue = [];
    this.currentQueueIndex = 0;
    this.speechCallbacks = {};

    // Recognition
    this.recognition = null;
    this.isListening = false;
    this.recognitionCallbacks = {};

    this.initVoices();
  }

  initVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
      };
    }
  }

  getBestVoiceForSpirit(spiritId = 'pli') {
    if (!this.voices || this.voices.length === 0) {
      this.initVoices();
    }
    const englishVoices = this.voices.filter(v => v.lang.startsWith('en'));

    // Spirit voice preference heuristics
    switch (spiritId) {
      case 'pli': {
        // Deep, resonant, authoritative mainframe voice
        const deepVoice = englishVoices.find(v => 
          /Daniel|George|Oliver|Microsoft David|Google UK English Male|Guy/i.test(v.name)
        );
        return deepVoice || englishVoices[0] || this.voices[0];
      }
      case 'algol68': {
        // Aristocratic British/Oxford formal cadence
        const britishVoice = englishVoices.find(v => 
          /en-GB|Arthur|Oliver|Google UK English/i.test(v.lang + v.name)
        );
        return britishVoice || englishVoices[0] || this.voices[0];
      }
      case 'snobol4': {
        // Mystical, melodic, ethereal tone
        const etherealVoice = englishVoices.find(v => 
          /Serena|Victoria|Karen|Samantha|Zira/i.test(v.name)
        );
        return etherealVoice || englishVoices[0] || this.voices[0];
      }
      case 'plankalkul': {
        // Solemn, continental European / vintage tone
        const germanicOrDeep = this.voices.find(v => /de-DE|German/i.test(v.lang)) ||
          englishVoices.find(v => /Daniel|David/i.test(v.name));
        return germanicOrDeep || englishVoices[0] || this.voices[0];
      }
      case 'intercal': {
        // High, eccentric, chaotic tone
        const livelyVoice = englishVoices.find(v => /Fred|Junior|Albert|Alex/i.test(v.name));
        return livelyVoice || englishVoices[0] || this.voices[0];
      }
      default:
        return englishVoices[0] || this.voices[0];
    }
  }

  getSpiritAcoustics(spiritId = 'pli') {
    switch (spiritId) {
      case 'pli':
        return { pitch: 0.78, rate: 0.92 };
      case 'algol68':
        return { pitch: 0.98, rate: 0.94 };
      case 'snobol4':
        return { pitch: 1.15, rate: 0.90 };
      case 'plankalkul':
        return { pitch: 0.72, rate: 0.85 };
      case 'intercal':
        return { pitch: 1.30, rate: 1.10 };
      default:
        return { pitch: 0.85, rate: 0.95 };
    }
  }

  // Clean Markdown & stage directions for spoken performance
  cleanMarkdownForSpeech(text) {
    if (!text) return '';
    return text
      .replace(/```[\s\S]*?```/g, ' [Sacred code block omitted] ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      .replace(/[*_~#]/g, '')
      .replace(/\n{2,}/g, '. ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  // Split into manageable sentences to prevent Chrome's 15s synthesis pause bug
  splitIntoSentences(text) {
    const raw = this.cleanMarkdownForSpeech(text);
    const matches = raw.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g);
    return matches ? matches.map(s => s.trim()).filter(Boolean) : [raw];
  }

  // Speak message aloud with sentence queuing
  speak(text, spiritId = 'pli', callbacks = {}) {
    if (!this.synth) return;

    this.stopSpeaking();
    this.speechCallbacks = callbacks;

    const sentences = this.splitIntoSentences(text);
    if (sentences.length === 0) return;

    this.currentUtteranceQueue = sentences;
    this.currentQueueIndex = 0;
    this.isSpeaking = true;

    if (this.speechCallbacks.onStart) {
      this.speechCallbacks.onStart();
    }

    this.playNextSentence(spiritId);
  }

  playNextSentence(spiritId) {
    if (!this.isSpeaking || this.currentQueueIndex >= this.currentUtteranceQueue.length) {
      this.isSpeaking = false;
      if (this.speechCallbacks.onEnd) {
        this.speechCallbacks.onEnd();
      }
      return;
    }

    const sentence = this.currentUtteranceQueue[this.currentQueueIndex];
    const utterance = new SpeechSynthesisUtterance(sentence);
    const voice = this.getBestVoiceForSpirit(spiritId);
    const acoustics = this.getSpiritAcoustics(spiritId);

    if (voice) utterance.voice = voice;
    utterance.pitch = acoustics.pitch;
    utterance.rate = acoustics.rate;

    utterance.onend = () => {
      this.currentQueueIndex++;
      this.playNextSentence(spiritId);
    };

    utterance.onerror = (e) => {
      // Don't error out on intentional cancel
      if (e.error === 'canceled' || e.error === 'interrupted') return;
      this.currentQueueIndex++;
      this.playNextSentence(spiritId);
    };

    if (this.speechCallbacks.onSentence) {
      this.speechCallbacks.onSentence(this.currentQueueIndex, sentence);
    }

    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.currentUtteranceQueue = [];
    this.currentQueueIndex = 0;
    if (this.speechCallbacks.onEnd) {
      this.speechCallbacks.onEnd();
    }
  }

  // --- Speech Recognition (STT Dictation) ---
  isRecognitionSupported() {
    return typeof window !== 'undefined' && 
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }

  startListening(callbacks = {}) {
    if (!this.isRecognitionSupported()) {
      throw new Error('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
    }

    if (this.isListening) {
      this.stopListening();
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognitionCallbacks = callbacks;

    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.recognitionCallbacks.onStart) {
        this.recognitionCallbacks.onStart();
      }
    };

    this.recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (this.recognitionCallbacks.onTranscript) {
        this.recognitionCallbacks.onTranscript({ final, interim });
      }
    };

    this.recognition.onerror = (event) => {
      if (this.recognitionCallbacks.onError) {
        this.recognitionCallbacks.onError(event.error);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.recognitionCallbacks.onEnd) {
        this.recognitionCallbacks.onEnd();
      }
    };

    this.recognition.start();
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
    this.isListening = false;
  }
}

export const seanceSpeech = new SeanceSpeechEngine();
