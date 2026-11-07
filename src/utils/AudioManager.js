import { Storage } from './Storage.js';

class AudioManagerClass {
  constructor() {
    this.ctx = null;
    this.lastScrubTime = 0;
    this.ambientOscillators = [];
    this.ambientGain = null;
    this.currentEraTrack = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Звон колокольчиков над дверью при входе в антикварную лавку
  playDoorBells() {
    if (Storage.isMuted()) return;
    this.init();
    if (!this.ctx) return;

    const freqs = [2093, 2637, 3135, 2093, 3520]; // Звон маленьких латунных колокольчиков
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f + (Math.random() * 40 - 20), this.ctx.currentTime + idx * 0.08);

      const t = this.ctx.currentTime + idx * 0.08;
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.45);
    });
  }

  // Фоновая атмосферная музыка под текущую эпоху
  playEraMusic(eraId) {
    if (Storage.isMuted()) return;
    this.init();
    if (!this.ctx || this.currentEraTrack === eraId) return;

    this.stopMusic();
    this.currentEraTrack = eraId;

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.ambientGain.gain.linearRampToValueAtTime(0.035, this.ctx.currentTime + 1.5);
    this.ambientGain.connect(this.ctx.destination);

    // Ноты под лад эпохи
    let baseNotes = [130.81, 164.81, 196.00]; // До-мажор по умолчанию
    if (eraId === 'egypt') {
      baseNotes = [110.00, 116.54, 146.83, 164.81]; // Египетский фригийский лад
    } else if (eraId === 'greece') {
      baseNotes = [146.83, 164.81, 174.61, 220.00]; // Античный дорийский лад
    } else if (eraId === 'europe') {
      baseNotes = [130.81, 174.61, 196.00, 261.63]; // Средневековый органный лад
    } else if (eraId === 'japan') {
      baseNotes = [146.83, 155.56, 196.00, 220.00]; // Японская пентатоника хирароси
    } else if (eraId === 'shop') {
      baseNotes = [261.63, 329.63, 392.00, 523.25]; // Теплый перезвон шкатулки лавки
    }

    baseNotes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = (eraId === 'shop' || eraId === 'greece') ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Легкое естественное плавание тона (vibrato)
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.2 + i * 0.1, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(1.5, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      osc.connect(this.ambientGain);
      osc.start();

      this.ambientOscillators.push(osc, lfo);
    });
  }

  stopMusic() {
    if (this.ambientGain && this.ctx) {
      try {
        this.ambientGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
      } catch {}
    }
    this.ambientOscillators.forEach(o => {
      try { o.stop(); o.disconnect(); } catch {}
    });
    this.ambientOscillators = [];
    this.currentEraTrack = null;
  }

  playScrub() {
    if (Storage.isMuted()) return;
    this.init();
    if (!this.ctx) return;

    const now = performance.now();
    if (now - this.lastScrubTime < 75) return;
    this.lastScrubTime = now;

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.06);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.18;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
  }

  playWash() {
    if (Storage.isMuted()) return;
    this.init();
    if (!this.ctx) return;

    const now = performance.now();
    if (now - this.lastScrubTime < 85) return;
    this.lastScrubTime = now;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(160, t + 0.07);
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.07);
  }

  playCloth() {
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
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.linearRampToValueAtTime(320, t + 0.05);
    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  playShine() {
    if (Storage.isMuted()) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(2093, t);
    osc.frequency.exponentialRampToValueAtTime(2637, t + 0.25);
    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.4);
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
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
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
      const startTime = this.ctx.currentTime + idx * 0.07;
      gain.gain.setValueAtTime(0.1, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.6);
    });
  }
}

export const AudioManager = new AudioManagerClass();
