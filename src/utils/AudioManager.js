import { Storage } from './Storage.js';

class AudioManagerClass {
  constructor() {
    this.ctx = null;
    this.lastSoundTime = {};
    this.musicGain = null;
    this.currentTrack = null;
    this.pendingTrack = 'menu';
    this.activeNodes = [];
    this.musicStepTimer = null;

    const autoUnlock = () => {
      this.unlockAudio();
      if (!this.isMusicDisabled() && !this.isMusicPlaying && this.pendingTrack) {
        this.playEraMusic(this.pendingTrack);
      }
    };
    window.addEventListener('pointerdown', autoUnlock, { once: true });
    window.addEventListener('touchstart', autoUnlock, { once: true });
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) this.ctx = new AudioContextClass();
    }
  }

  unlockAudio() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  isSfxDisabled() {
    return Storage.isSfxMuted ? Storage.isSfxMuted() : false;
  }

  isMusicDisabled() {
    return Storage.isMusicMuted ? Storage.isMusicMuted() : false;
  }
  toggleMusic() {
    const nextMuted = !this.isMusicDisabled();
    if (Storage.setMusicMuted) Storage.setMusicMuted(nextMuted);
    if (nextMuted) {
      this.stopMusic();
    } else {
      if (this.pendingTrack) this.playEraMusic(this.pendingTrack);
    }
    return !nextMuted;
  }

  toggleSfx() {
    const nextMuted = !this.isSfxDisabled();
    if (Storage.setSfxMuted) Storage.setSfxMuted(nextMuted);
    return !nextMuted;
  }

  isMusicOn() {
    return !this.isMusicDisabled();
  }

  isSfxOn() {
    return !this.isSfxDisabled();
  }

  throttle(key, minIntervalMs) {
    const now = performance.now();
    if (this.lastSoundTime[key] && now - this.lastSoundTime[key] < minIntervalMs) return false;
    this.lastSoundTime[key] = now;
    return true;
  }

  createNoiseBuffer(durationSec = 0.2) {
    if (!this.ctx) return null;
    const bufferSize = Math.floor(this.ctx.sampleRate * durationSec);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
    return buffer;
  }

  // --- МЯГКИЙ БАРХАТНЫЙ ЗВОН ВИТРИНЫ ---
  playShopBell() {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [{ f: 784, d: 0 }, { f: 1046.5, d: 0.12 }].forEach(tone => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(tone.f, t + tone.d);

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t + tone.d);
      g.gain.linearRampToValueAtTime(0.12, t + tone.d + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + tone.d + 0.9);

      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(1800, t + tone.d);

      osc.connect(f);
      f.connect(g);
      g.connect(this.ctx.destination);
      osc.start(t + tone.d);
      osc.stop(t + tone.d + 0.95);
    });
  }

  // --- ЭФФЕКТЫ ---
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

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  playSpray() {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx || !this.throttle('spray', 160)) return;

    const t = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    const nBuf = this.createNoiseBuffer(0.2);
    if (!nBuf) return;
    noise.buffer = nBuf;

    const bpf = this.ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.setValueAtTime(3000, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.19);

    noise.connect(bpf);
    bpf.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + 0.2);
  }

  playCloth() {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx || !this.throttle('cloth', 130)) return;

    const t = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    const nBuf = this.createNoiseBuffer(0.15);
    if (!nBuf) return;
    noise.buffer = nBuf;

    const lpf = this.ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.setValueAtTime(500, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    noise.connect(lpf);
    lpf.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + 0.15);
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
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
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

  // --- МЕДИТАТИВНЫЙ МУЗЫКАЛЬНЫЙ ДВИЖОК ЭПОХ (ЛОУ-ФАЙ АРХЕОЛОГИЯ) ---
  playEraMusic(era = 'menu') {
    this.pendingTrack = era;
    if (this.isMusicDisabled()) return;
    this.unlockAudio();
    if (!this.ctx) return;

    if (this.currentTrack === era && this.isMusicPlaying) return;
    this.stopMusic();
    this.currentTrack = era;

    // Палитры нот под каждую эпоху (мягкие чистые синусоиды)
    const palettes = {
      menu: [261.63, 329.63, 392.00, 523.25], // C - E - G - C (Уют и покой)
      egypt: [220.00, 246.94, 261.63, 329.63, 349.23], // Восточный ночной Нил
      antique: [293.66, 329.63, 369.99, 440.00], // Солнечная лира
      europe: [261.63, 293.66, 329.63, 392.00], // Лютня замка
      japan: [220.00, 233.08, 293.66, 329.63], // Сакура (Ивато)
      aztec: [196.00, 220.00, 261.63, 293.66], // Тропическая флейта
      vikings: [220.00, 261.63, 329.63, 392.00], // Скандинавская баллада
      renaissance: [329.63, 392.00, 440.00, 523.25] // Светлый клавесин
    };

    const notes = palettes[era] || palettes.menu;
    let step = 0;

    this.isMusicPlaying = true;

    // Функция проигрывания одной мягкой ноты саундтрека
    const playNextNote = () => {
      if (!this.isMusicPlaying || !this.ctx) return;
      const t = this.ctx.currentTime;
      const freq = notes[step % notes.length];
      step++;

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.045, t + 0.3); // Мягкая атака
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.4); // Долгий благородный хвост

      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(1400, t);

      osc.connect(f);
      f.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 2.5);

      // Следующая нота через 1.6 - 2.2 секунды (непринуждённый ритм)
      const nextDelay = 1600 + Math.random() * 600;
      this.musicStepTimer = setTimeout(playNextNote, nextDelay);
    };

    playNextNote();
  }

  stopMusic() {
    this.isMusicPlaying = false;
    this.currentTrack = null;
    if (this.musicStepTimer) {
      clearTimeout(this.musicStepTimer);
      this.musicStepTimer = null;
    }
  }
}

export const AudioManager = new AudioManagerClass();
