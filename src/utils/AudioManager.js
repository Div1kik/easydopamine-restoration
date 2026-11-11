import { Storage } from './Storage.js';

class AudioManagerClass {
  constructor() {
    this.ctx = null;
    this.lastSoundTime = {};
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.currentTrack = null;
    this.pendingTrack = 'menu';
    this.activeNodes = [];
    this.musicStepTimer = null;
    this.isMusicPlaying = false;
    this.wasPlayingBeforeHide = false;

    const unlock = () => {
      this.unlockAudio();
      if (!this.isMusicDisabled() && !this.isMusicPlaying && this.pendingTrack) {
        this.playEraMusic(this.pendingTrack);
      }
    };

    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });

    // Глушение музыки при сворачивании браузера или переключении вкладки
    const handleVisibility = () => {
      if (document.hidden) {
        if (this.isMusicPlaying) {
          this.wasPlayingBeforeHide = true;
          this.stopMusic();
        }
        if (this.ctx && this.ctx.state === 'running') {
          this.ctx.suspend().catch(() => {});
        }
      } else {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        if (this.wasPlayingBeforeHide && !this.isMusicDisabled()) {
          this.wasPlayingBeforeHide = false;
          this.playEraMusic(this.currentTrack || this.pendingTrack || 'menu');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', handleVisibility);
    window.addEventListener('blur', () => {
      if (this.ctx && this.ctx.state === 'running') {
        this.ctx.suspend().catch(() => {});
      }
    });
    window.addEventListener('focus', () => {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    });
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(this.isMusicDisabled() ? 0.0 : 0.28, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(this.isSfxDisabled() ? 0.0 : 0.35, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);
  }

  unlockAudio() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  isSfxEnabled() {
    return Storage.isSfxMuted ? !Storage.isSfxMuted() : true;
  }

  isMusicDisabled() {
    return Storage.isMusicMuted ? Storage.isMusicMuted() : false;
  }

  isSfxDisabled() {
    return Storage.isSfxMuted ? Storage.isSfxMuted() : false;
  }

  toggleMusic() {
    this.unlockAudio();
    const willBeMuted = !this.isMusicDisabled();
    if (Storage.setMusicMuted) Storage.setMusicMuted(willBeMuted);

    if (this.musicGain && this.ctx) {
      this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.musicGain.gain.setValueAtTime(willBeMuted ? 0.0 : 0.28, this.ctx.currentTime);
    }

    if (willBeMuted) {
      this.stopMusic();
    } else {
      this.playEraMusic(this.pendingTrack);
    }
    return willBeMuted;
  }

  toggleSfx() {
    this.unlockAudio();
    const willBeMuted = !this.isSfxDisabled();
    if (Storage.setSfxMuted) Storage.setSfxMuted(willBeMuted);

    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(willBeMuted ? 0.0 : 0.35, this.ctx.currentTime);
    }
    return willBeMuted;
  }

  isMusicOn() {
    return !this.isMusicDisabled();
  }

  isSfxOn() {
    return !this.isSfxDisabled();
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

  playSnapRoll() {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx) return;

    const times = [0, 0.03, 0.06];
    const freqs = [784.0, 880.0, 1046.5];
    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const t = this.ctx.currentTime + times[i];
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.18, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);

      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(1800, t);

      osc.connect(f);
      f.connect(g);
      g.connect(this.sfxGain || this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.09);
    });
  }

  playBrush() {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx || !this.throttle('brush', 130)) return;

    const t = this.ctx.currentTime;
    const noiseBuffer = this.createNoiseBuffer(0.14);
    if (!noiseBuffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.frequency.exponentialRampToValueAtTime(2800, t + 0.09);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain || this.ctx.destination);
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
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.07);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.2, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain || this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  playSpray() {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx || !this.throttle('spray', 190)) return;

    const t = this.ctx.currentTime;
    const nBuf = this.createNoiseBuffer(0.2);
    if (!nBuf) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = nBuf;

    const bpf = this.ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.setValueAtTime(3000, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.19);

    noise.connect(bpf);
    bpf.connect(gain);
    gain.connect(this.sfxGain || this.ctx.destination);
    noise.start(t);
    noise.stop(t + 0.2);
  }

  playCloth() {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx || !this.throttle('cloth', 130)) return;

    const t = this.ctx.currentTime;
    const nBuf = this.createNoiseBuffer(0.15);
    if (!nBuf) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = nBuf;

    const lpf = this.ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.setValueAtTime(900, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    noise.connect(lpf);
    lpf.connect(gain);
    gain.connect(this.sfxGain || this.ctx.destination);
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
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.12);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

    osc.connect(gain);
    gain.connect(this.sfxGain || this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  playCoin() {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx) return;

    const freqs = [987.77, 1318.51];
    freqs.forEach((freq, i) => {
      const t = this.ctx.currentTime + i * 0.08;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.16, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain || this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.26);
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
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGain || this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.61);
  }

  playShine() {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx) return;

    const freqs = [523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((freq, idx) => {
      const delay = idx * 0.07;
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.13, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.connect(gain);
      gain.connect(this.sfxGain || this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.46);
    });
  }

  playClick() {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.04);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain || this.ctx.destination);
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
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.05);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain || this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  playEraMusic(era = 'menu') {
    this.pendingTrack = era;
    if (this.isMusicDisabled()) return;
    this.unlockAudio();
    if (!this.ctx) return;

    if (this.currentTrack === era && this.isMusicPlaying) return;

    this.stopMusic();
    this.currentTrack = era;

    const palettes = {
      menu: [220.00, 329.63, 440.00, 523.25],
      egypt: [293.66, 311.13, 369.99, 440.00],
      antique: [293.66, 329.63, 369.99, 440.00],
      europe: [220.00, 261.63, 329.63, 392.00],
      japan: [220.00, 233.08, 293.66, 349.23],
      aztec: [196.00, 220.00, 261.63, 293.66],
      vikings: [220.00, 261.63, 329.63, 392.00],
      renaissance: [329.63, 392.00, 440.00, 523.25]
    };

    const notes = palettes[era] || palettes.menu;
    let step = 0;
    this.isMusicPlaying = true;

    const playNextNote = () => {
      if (!this.isMusicPlaying || this.isMusicDisabled() || !this.ctx) return;

      const t = this.ctx.currentTime;
      const freq = notes[step % notes.length];
      step++;

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.045, t + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);

      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(1400, t);

      osc.connect(f);
      f.connect(gain);
      gain.connect(this.musicGain || this.ctx.destination);

      osc.start(t);
      osc.stop(t + 2.5);

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
