import { Storage } from './Storage.js';

class AudioManagerClass {
  constructor() {
    this.ctx = null;
    this.lastSoundTime = {};
    this.musicGain = null;
    this.currentTrack = null;
    this.pendingTrack = 'menu';
    this.activeNodes = [];
    this.musicInterval = null;

    // Глобальный перехват первого тапа для гарантированного снятия блокировки автоплея Chrome
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

  // --- МЯГКИЙ БАРХАТНЫЙ КОЛОКОЛЬЧИК АНТИКВАРНОЙ ЛАВКИ ---
  playShopBell() {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Тёплые, не режущие ухо латунные ноты (A5 и D6 с мягкой обёрткой)
    const tones = [
      { f: 880, delay: 0, dur: 1.1, gain: 0.12 },
      { f: 1174.66, delay: 0.12, dur: 0.9, gain: 0.09 },
      { f: 1760, delay: 0.14, dur: 0.6, gain: 0.04 }
    ];

    tones.forEach((tone) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(tone.f, t + tone.delay);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t + tone.delay);
      gain.gain.linearRampToValueAtTime(tone.gain, t + tone.delay + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + tone.delay + tone.dur);

      // Мягкий фильтр для среза излишней визгливости
      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(2200, t + tone.delay);

      osc.connect(f);
      f.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + tone.delay);
      osc.stop(t + tone.delay + tone.dur + 0.05);
    });
  }

  // --- ЭФФЕКТЫ ИНСТРУМЕНТОВ ---
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

  // --- ЖИВОЙ САУНДТРЕК ЭПОХ (БЕЗ ОШИБОК ПОДКЛЮЧЕНИЯ НОД) ---
  playEraMusic(era = 'menu') {
    this.pendingTrack = era;
    if (this.isMusicDisabled()) return;
    this.unlockAudio();
    if (!this.ctx) return;

    if (this.currentTrack === era && this.isMusicPlaying) return;
    this.stopMusic();
    this.currentTrack = era;

    try {
      const t = this.ctx.currentTime;
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.0001, t);
      // Плавное нарастание музыки без щелчков
      this.musicGain.gain.linearRampToValueAtTime(0.065, t + 2.0);
      this.musicGain.connect(this.ctx.destination);

      let baseNotes = [110, 164.81, 220]; // Меню: A2 + E3 + A3
      let filterFreq = 340;
      let oscType = 'sine';

      if (era === 'egypt') {
        // Мистический хиджаз
        baseNotes = [146.83, 185.00, 220.00, 233.08];
        filterFreq = 380;
        oscType = 'triangle';
      } else if (era === 'antique') {
        // Дорийская лира
        baseNotes = [164.81, 196.00, 246.94, 293.66];
        filterFreq = 420;
        oscType = 'sine';
      } else if (era === 'europe') {
        // Средневековый соборный хорал
        baseNotes = [130.81, 196.00, 261.63, 329.63];
        filterFreq = 280;
        oscType = 'triangle';
      } else if (era === 'japan') {
        // Пентатоника Ёсэн
        baseNotes = [146.83, 155.56, 196.00, 220.00];
        filterFreq = 460;
        oscType = 'sine';
      } else if (era === 'aztec') {
        // Низкий шаманский гул
        baseNotes = [87.31, 130.81, 174.61];
        filterFreq = 220;
        oscType = 'triangle';
      } else if (era === 'vikings') {
        // Скандинавский варган и смычковый дрон
        baseNotes = [110.00, 164.81, 246.94];
        filterFreq = 260;
        oscType = 'triangle';
      } else if (era === 'renaissance') {
        // Светлая лютня
        baseNotes = [196.00, 246.94, 293.66, 392.00];
        filterFreq = 520;
        oscType = 'triangle';
      }

      const masterFilter = this.ctx.createBiquadFilter();
      masterFilter.type = 'lowpass';
      masterFilter.frequency.setValueAtTime(filterFreq, t);

      this.activeNodes = [];

      baseNotes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        osc.type = oscType;
        osc.frequency.setValueAtTime(freq, t);
        osc.detune.setValueAtTime((idx % 2 === 0 ? 4 : -4), t);

        const voiceGain = this.ctx.createGain();
        voiceGain.gain.setValueAtTime(0.28, t);

        osc.connect(voiceGain);
        voiceGain.connect(masterFilter);
        osc.start(t);

        this.activeNodes.push(osc);
      });

      masterFilter.connect(this.musicGain);
      this.isMusicPlaying = true;
    } catch (e) {
      console.warn('Audio start error:', e);
    }
  }

  stopMusic() {
    if (!this.ctx || !this.currentTrack) return;
    try {
      const t = this.ctx.currentTime;
      if (this.musicGain) {
        this.musicGain.gain.linearRampToValueAtTime(0.0001, t + 0.6);
      }
      setTimeout(() => {
        if (this.activeNodes) {
          this.activeNodes.forEach((n) => {
            try { n.stop(); n.disconnect(); } catch {}
          });
          this.activeNodes = [];
        }
        this.currentTrack = null;
        this.isMusicPlaying = false;
      }, 650);
    } catch {
      this.currentTrack = null;
      this.isMusicPlaying = false;
    }
  }
}

export const AudioManager = new AudioManagerClass();
