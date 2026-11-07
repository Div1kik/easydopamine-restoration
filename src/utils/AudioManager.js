import { Storage } from './Storage.js';

class AudioManagerClass {
  constructor() {
    this.ctx = null;
    this.lastScrubTime = 0;
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

  // ASMR-шелест кисти
  playScrub() {
    if (Storage.isMuted()) return;
    this.init();
    if (!this.ctx) return;

    const now = performance.now();
    if (now - this.lastScrubTime < 80) return;
    this.lastScrubTime = now;

    const sampleRate = this.ctx.sampleRate;
    const duration = 0.07;
    const bufferSize = Math.floor(sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    let lastVal = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastVal + (0.04 * white)) / 1.04;
      lastVal = data[i];
      data[i] *= 3.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(750, this.ctx.currentTime);

    const gainNode = this.ctx.createGain();
    const t = this.ctx.currentTime;
    gainNode.gain.setValueAtTime(0.001, t);
    gainNode.gain.linearRampToValueAtTime(0.08, t + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    noise.start(t);
  }

  // Губка
  playWash() {
    if (Storage.isMuted()) return;
    this.init();
    if (!this.ctx) return;

    const now = performance.now();
    if (now - this.lastScrubTime < 90) return;
    this.lastScrubTime = now;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';

    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(280 + Math.random() * 100, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.06);

    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  // Замша
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
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.linearRampToValueAtTime(320, t + 0.05);

    gain.gain.setValueAtTime(0.03, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  // Ультразвуковой бустер (Dopamine Wave)
  playPulse() {
    if (Storage.isMuted()) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';

    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.2);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.45);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.45);
  }

  // Звон монет
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

  // Победный аккорд
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
