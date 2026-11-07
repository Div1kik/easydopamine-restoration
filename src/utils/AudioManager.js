import { Storage } from './Storage.js';

class AudioManagerClass {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.ambientTimer = null;
    this.lastScrubTime = 0;
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

  // Уютный, теплый, медитативный фон реставратора (Lo-Fi / ASMR)
  playEraMusic(eraId) {
    this.init();
    if (!this.ctx || Storage.isMuted()) return;

    this.stopMusic();

    // Гармоничные мягкие мажорные пентатоники (без тревоги и гула)
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C D E G A C

    const playGentleNote = () => {
      if (Storage.isMuted() || !this.ctx) return;
      const freq = scale[Math.floor(Math.random() * scale.length)];

      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Теплый мягкий фильтр срезает резкий писк и гул
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, this.ctx.currentTime);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const t = this.ctx.currentTime;
      noteGain.gain.setValueAtTime(0.001, t);
      noteGain.gain.linearRampToValueAtTime(0.035, t + 0.3);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 2.9);
    };

    // Запускаем неспешный мягкий перебор раз в 1.8 - 2.6 сек
    const scheduleNext = () => {
      playGentleNote();
      const delay = 1800 + Math.random() * 900;
      this.ambientTimer = setTimeout(scheduleNext, delay);
    };

    scheduleNext();
  }

  stopMusic() {
    if (this.ambientTimer) {
      clearTimeout(this.ambientTimer);
      this.ambientTimer = null;
    }
  }

  // Латунные колокольчики над дверью лавки
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

      g.gain.setValueAtTime(0.06, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);

      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  }

  playScrub() {
    if (Storage.isMuted()) return;
    this.init();
    if (!this.ctx) return;

    const now = performance.now();
    if (now - this.lastScrubTime < 75) return;
    this.lastScrubTime = now;

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.05);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.12;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(750, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(t);
  }

  playWash() {
    if (Storage.isMuted()) return;
    this.init();
    if (!this.ctx) return;

    const now = performance.now();
    if (now - this.lastScrubTime < 80) return;
    this.lastScrubTime = now;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(360, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.06);
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  playBrush() {
    if (Storage.isMuted()) return;
    this.init();
    if (!this.ctx) return;

    const now = performance.now();
    if (now - this.lastScrubTime < 75) return;
    this.lastScrubTime = now;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.linearRampToValueAtTime(380, t + 0.05);
    gain.gain.setValueAtTime(0.03, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  playCloth() {
    this.playBrush();
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

  playCoin() {
    if (Storage.isMuted()) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, this.ctx.currentTime);
    osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
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
}

export const AudioManager = new AudioManagerClass();
