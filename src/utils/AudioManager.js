import { Storage } from './Storage.js';

class AudioManagerClass {
  constructor() {
    this.ctx = null;
    this.lastSoundTime = {};
    this.musicNode = null;
    this.musicGain = null;
    this.isMusicPlaying = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
  }

  unlockAudio() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  isSfxDisabled() {
    return Storage.isSfxMuted ? Storage.isSfxMuted() : false;
  }

  isMusicDisabled() {
    return Storage.isMusicMuted ? Storage.isMusicMuted() : false;
  }

  throttle(key, minIntervalMs) {
    const now = performance.now();
    if (this.lastSoundTime[key] && now - this.lastSoundTime[key] < minIntervalMs) {
      return false;
    }
    this.lastSoundTime[key] = now;
    return true;
  }

  createNoiseBuffer(durationSec = 0.2) {
    if (!this.ctx) return null;
    const bufferSize = Math.floor(this.ctx.sampleRate * durationSec);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // МЯГКАЯ КИСТЬ
  playBrush() {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx || !this.throttle('brush', 110)) return;

    const t = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    const noiseBuf = this.createNoiseBuffer(0.14);
    if (!noiseBuf) return;
    noise.buffer = noiseBuf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.frequency.exponentialRampToValueAtTime(2600, t + 0.08);
    filter.Q.setValueAtTime(1.8, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + 0.14);
  }

  // СКРЕБОК
  playScrub() {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx || !this.throttle('scraper', 100)) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(260, t + 0.07);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.08, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    const noise = this.ctx.createBufferSource();
    const nBuf = this.createNoiseBuffer(0.08);
    if (nBuf) {
      noise.buffer = nBuf;
      const hpf = this.ctx.createBiquadFilter();
      hpf.type = 'highpass';
      hpf.frequency.setValueAtTime(2200, t);

      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.14, t);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

      noise.connect(hpf);
      hpf.connect(nGain);
      nGain.connect(this.ctx.destination);
      noise.start(t);
      noise.stop(t + 0.08);
    }

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  // СПРЕЙ
  playSpray() {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx || !this.throttle('spray', 160)) return;

    const t = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    const nBuf = this.createNoiseBuffer(0.22);
    if (!nBuf) return;
    noise.buffer = nBuf;

    const bpf = this.ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.setValueAtTime(3200, t);
    bpf.frequency.exponentialRampToValueAtTime(1800, t + 0.2);
    bpf.Q.setValueAtTime(1.2, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.21);

    noise.connect(bpf);
    bpf.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + 0.22);
  }

  // ЗАМША
  playCloth() {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx || !this.throttle('cloth', 130)) return;

    const t = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    const nBuf = this.createNoiseBuffer(0.16);
    if (!nBuf) return;
    noise.buffer = nBuf;

    const lpf = this.ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.setValueAtTime(550, t);
    lpf.frequency.linearRampToValueAtTime(380, t + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    noise.connect(lpf);
    lpf.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + 0.16);
  }

  playWash() {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(580, t + 0.12);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  playCoin() {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [987.77, 1318.51].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.08);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15, t + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.26);
    });
  }

  // Одиночная сияющая нота для звезды
  playStarChime(step = 0) {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50];
    const freq = notes[step % notes.length];
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.16, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.61);
  }

  playShine() {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((freq, idx) => {
      const delay = idx * 0.07;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + delay);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.46);
    });
  }

  playClick() {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.04);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  playBreakSnap() {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.08);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  // ФОНОВЫЙ САУНДТРЕК (Мягкий эмбиент-дрон)
  playEraMusic(era = 'egypt') {
    if (this.isMusicDisabled()) return;
    this.unlockAudio();
    if (!this.ctx || this.isMusicPlaying) return;

    try {
      const t = this.ctx.currentTime;
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.001, t);
      this.musicGain.linearRampToValueAtTime(0.045, t + 2.0);

      // Глубокий резонансный фильтр
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, t);

      // Генератор атмосферного аккорда
      const freqs = [110, 164.81, 220]; // A2 + E3 + A3
      this.activeOscs = [];

      freqs.forEach(f => {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);
        osc.connect(filter);
        osc.start(t);
        this.activeOscs.push(osc);
      });

      filter.connect(this.musicGain);
      this.musicGain.connect(this.ctx.destination);
      this.isMusicPlaying = true;
    } catch {
      // Игнорируем блокировку до первого пользовательского ввода
    }
  }

  stopMusic() {
    if (!this.ctx || !this.isMusicPlaying) return;
    try {
      const t = this.ctx.currentTime;
      if (this.musicGain) {
        this.musicGain.gain.linearRampToValueAtTime(0.001, t + 0.6);
      }
      setTimeout(() => {
        if (this.activeOscs) {
          this.activeOscs.forEach(o => {
            try { o.stop(); o.disconnect(); } catch {}
          });
          this.activeOscs = null;
        }
        this.isMusicPlaying = false;
      }, 700);
    } catch {
      this.isMusicPlaying = false;
    }
  }
}

export const AudioManager = new AudioManagerClass();
