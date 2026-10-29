// Web Audio API Synthesizer for Séance Ambiance (100% Offline, Zero external assets)

class SeanceAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.tapeGain = null;
    this.humGain = null;
    this.oscillators = [];
    this.noiseNode = null;
    this.keyclickEnabled = true;
    this.volume = 0.4;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Tape Hiss Sub-gain
    this.tapeGain = this.ctx.createGain();
    this.tapeGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    this.tapeGain.connect(this.masterGain);

    // Hum Sub-gain
    this.humGain = this.ctx.createGain();
    this.humGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    this.humGain.connect(this.masterGain);
  }

  startAmbiance() {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) return;
    this.isPlaying = true;

    // 1. Binaural Séance Hum (Low 108Hz & 111Hz for an eerie 3Hz beat frequency)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(108, this.ctx.currentTime);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(111, this.ctx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, this.ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(this.humGain);

    osc1.start();
    osc2.start();
    this.oscillators.push(osc1, osc2);

    // 2. Analog Tape Hiss / Mainframe Core Whispers
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + white * 0.05;
      b1 = 0.95 * b1 + white * 0.03;
      b2 = 0.90 * b2 + white * 0.01;
      output[i] = (b0 + b1 + b2) * 0.4;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    noiseFilter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(this.tapeGain);
    whiteNoise.start();
    this.noiseNode = whiteNoise;
  }

  stopAmbiance() {
    if (!this.isPlaying) return;
    this.oscillators.forEach(osc => {
      try { osc.stop(); osc.disconnect(); } catch (e) {}
    });
    this.oscillators = [];

    if (this.noiseNode) {
      try { this.noiseNode.stop(); this.noiseNode.disconnect(); } catch (e) {}
      this.noiseNode = null;
    }

    this.isPlaying = false;
  }

  toggleAmbiance() {
    if (this.isPlaying) {
      this.stopAmbiance();
      return false;
    } else {
      this.startAmbiance();
      return true;
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  // Chime when a spirit awakens / completes an incantation
  playChime() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const chimeOsc = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();

    chimeOsc.type = 'sine';
    chimeOsc.frequency.setValueAtTime(880, now); // A5
    chimeOsc.frequency.exponentialRampToValueAtTime(440, now + 1.2);

    chimeGain.gain.setValueAtTime(0.08 * this.volume, now);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    chimeOsc.connect(chimeGain);
    chimeGain.connect(this.ctx.destination);

    chimeOsc.start(now);
    chimeOsc.stop(now + 1.25);
  }

  // IBM Keypunch relay / typewriter click during streaming
  playKeyClick() {
    if (!this.keyclickEnabled) return;
    this.init();
    if (!this.ctx || this.ctx.state === 'suspended') return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(320 + Math.random() * 140, now);

    gain.gain.setValueAtTime(0.015 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }
}

export const seanceAudio = new SeanceAudioEngine();
