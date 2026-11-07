import { Storage } from './Storage.js';

class AudioManagerClass {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.ambientTimer = null;
    this.lastSoundTime = 0;
    this.currentTrack = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(Storage.isMuted() ? 0 : 0.8, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    const isMuted = Storage.toggleMute();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(isMuted ? 0 : 0.8, this.ctx.currentTime);
    }
    if (isMuted) {
      this.stopMusic();
    }
    return isMuted;
  }

  // Музыка главного меню (уютная акустическая гармония)
  playMenuMusic() {
    this.init();
    if (!this.ctx || Storage.isMuted() || this.currentTrack === 'menu') return;
    this.stopMusic();
    this.currentTrack = 'menu';

    const chords = [
      [261.63, 329.63, 392.00], // C
      [220.00, 261.63, 329.63], // Am
      [174.61, 220.00, 261.63], // F
      [196.00, 246.94, 293.66]  // G
    ];
    let chordIdx = 0;

    const playArpeggio = () => {
      if (Storage.isMuted() || !this.ctx || this.currentTrack !== 'menu') return;
      const currentChord = chords[chordIdx];
      chordIdx = (chordIdx + 1) % chords.length;

      currentChord.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(550, this.ctx.currentTime);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        const t = this.ctx.currentTime + i * 0.28;
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.035, t + 0.15);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);

        osc.connect(filter);
        filter.connect(g);
        g.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 2.3);
      });

      this.ambientTimer = setTimeout(playArpeggio, 2200);
    };

    playArpeggio();
  }

  // Фоновая музыка эпох для верстака и лавки
  playEraMusic(eraId) {
    this.init();
    if (!this.ctx || Storage.isMuted() || this.currentTrack === eraId) return;
    this.stopMusic();
    this.currentTrack = eraId;

    const scale = (eraId === 'japan') ? [146.83, 155.56, 196.00, 220.00, 293.66] : [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];

    const playNote = () => {
      if (Storage.isMuted() || !this.ctx || this.currentTrack !== eraId) return;
      const freq = scale[Math.floor(Math.random() * scale.length)];

      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, this.ctx.currentTime);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const t = this.ctx.currentTime;
      noteGain.gain.setValueAtTime(0.001, t);
      noteGain.gain.linearRampToValueAtTime(0.032, t + 0.25);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 2.7);

      this.ambientTimer = setTimeout(playNote, 1600 + Math.random() * 800);
    };

    playNote();
  }

  stopMusic() {
    if (this.ambientTimer) {
      clearTimeout(this.ambientTimer);
      this.ambientTimer = null;
    }
    this.currentTrack = null;
  }

  // 1. СКРЕБОК (хруст срезаемого камня и окалины)
  playScrub() {
    if (Storage.isMuted()) return;
    this.init();
    if (!this.ctx) return;

    const now = performance.now();
    if (now - this.lastSoundTime < 70) return;
    this.lastSoundTime = now;

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.045);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.18;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(850, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.07, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(t);
  }

  // 2. КИСТЬ (мягкое бархатное шорканье натуральной щетины)
  playBrush() {
    if (Storage.isMuted()) return;
    this.init();
    if (!this.ctx) return;

    const now = performance.now();
    if (now - this.lastSoundTime < 65) return;
    this.lastSoundTime = now;

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.06);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.06;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(t);
  }

  // 3. РАСПЫЛИТЕЛЬ (аэрозольный мягкий «пшик»)
  playSpray() {
    if (Storage.isMuted()) return;
    this.init();
    if (!this.ctx) return;

    const now = performance.now();
    if (now - this.lastSoundTime < 110) return;
    this.lastSoundTime = now;

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.14;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2200, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(t);
  }

  // 4. ГУБКА С РАСТВОРИТЕЛЕМ (влажное трение)
  playWash() {
    if (Storage.isMuted()) return;
    this.init();
    if (!this.ctx) return;

    const now = performance.now();
    if (now - this.lastSoundTime < 80) return;
    this.lastSoundTime = now;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.06);
    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  // 5. ЗАМША (шелковистый скрип и зеркальная полировка)
  playCloth() {
    if (Storage.isMuted()) return;
    this.init();
    if (!this.ctx) return;

    const now = performance.now();
    if (now - this.lastSoundTime < 85) return;
    this.lastSoundTime = now;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(750, t);
    osc.frequency.linearRampToValueAtTime(920, t + 0.04);
    gain.gain.setValueAtTime(0.03, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  playDoorBells() {
    if (Storage.isMuted()) return;
    this.init();
    if (!this.ctx) return;

    const notes = [2093, 2637, 3135, 3520];
    notes.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      const t = this.ctx.currentTime + i * 0.08;
      osc.frequency.setValueAtTime(f + (Math.random() * 20 - 10), t);
      g.gain.setValueAtTime(0.05, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  }

  playCoin() {
    if (Storage.isMuted()) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, this.ctx.currentTime);
    osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playVictory() {
    if (Storage.isMuted()) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const startTime = this.ctx.currentTime + idx * 0.08;
      gain.gain.setValueAtTime(0.09, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(startTime);
      osc.stop(startTime + 0.6);
    });
  }

  playShine() {
    if (Storage.isMuted()) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(1864, t);
    osc.frequency.exponentialRampToValueAtTime(2793, t + 0.3);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.45);
  }
}

export const AudioManager = new AudioManagerClass();
