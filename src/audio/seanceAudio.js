// Web Audio API Synthesizer for Séance Ambiance & Persona-Specific Mechanical Typing Sounds
// 100% Offline, Zero external assets

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
    this.volume = 0.35;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.tapeGain = this.ctx.createGain();
    this.tapeGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    this.tapeGain.connect(this.masterGain);

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

    // 2. Analog Tape Hiss / Mainframe Blower
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
    chimeOsc.frequency.setValueAtTime(880, now);
    chimeOsc.frequency.exponentialRampToValueAtTime(440, now + 1.2);

    chimeGain.gain.setValueAtTime(0.08 * this.volume, now);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    chimeOsc.connect(chimeGain);
    chimeGain.connect(this.ctx.destination);

    chimeOsc.start(now);
    chimeOsc.stop(now + 1.25);
  }

  // Persona-specific typing sounds
  // PL/I: electric keypunch relay click
  // COBOL: mechanical teletype / terminal thud
  // FORTRAN: punchcard perforation chunk
  // ALGOL 68: high electronic typewriter tick
  // SNOBOL4: soft ethereal glass chime/click
  // Plankalkül: metallic relay coil pulse
  // INTERCAL: chaotic pitch-randomized typewriter plink
  playKeyClick(spiritId = 'pli') {
    if (!this.keyclickEnabled) return;
    this.init();
    if (!this.ctx || this.ctx.state === 'suspended') return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    switch (spiritId) {
      case 'cobol': {
        // Heavy, resonant mechanical teletype clack
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(170 + Math.random() * 50, now);
        gain.gain.setValueAtTime(0.035 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
        osc.stop(now + 0.065);
        break;
      }
      case 'fortran': {
        // IBM 026 card punch mechanical perforation chunk
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220 + Math.random() * 70, now);
        gain.gain.setValueAtTime(0.028 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        osc.stop(now + 0.055);
        break;
      }
      case 'algol68': {
        // Crisp high-speed electronic typewriter tick
        osc.type = 'square';
        osc.frequency.setValueAtTime(520 + Math.random() * 80, now);
        gain.gain.setValueAtTime(0.015 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
        osc.stop(now + 0.03);
        break;
      }
      case 'snobol4': {
        // Soft ethereal glass chime click
        osc.type = 'sine';
        osc.frequency.setValueAtTime(740 + Math.random() * 120, now);
        gain.gain.setValueAtTime(0.02 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        osc.stop(now + 0.045);
        break;
      }
      case 'plankalkul': {
        // Metallic Konrad Zuse Z3 relay pulse
        osc.type = 'square';
        osc.frequency.setValueAtTime(130 + Math.random() * 30, now);
        gain.gain.setValueAtTime(0.03 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        osc.stop(now + 0.055);
        break;
      }
      case 'intercal': {
        // Chaotic pitch-warping comedic click
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180 + Math.random() * 750, now);
        gain.gain.setValueAtTime(0.025 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        osc.stop(now + 0.045);
        break;
      }
      case 'pli':
      default: {
        // IBM 029 electric keypunch relay click
        osc.type = 'square';
        osc.frequency.setValueAtTime(320 + Math.random() * 130, now);
        gain.gain.setValueAtTime(0.02 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);
        osc.stop(now + 0.042);
        break;
      }
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
  }
}

export const seanceAudio = new SeanceAudioEngine();
