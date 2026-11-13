import { Storage } from './Storage.js';

class AudioManagerClass {
  constructor() {
    this.ctx = null;
    this.lastSoundTime = {};
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.pendingTrack = null;
    this.isMusicPlaying = false;
    this.wasPlayingBeforeHide = false;

    const unlock = () => {
      this.unlockAudio();
      if (this.pendingTrack && !this.isMusicPlaying && !this.isMusicMuted()) {
        this.playEraMusic(this.pendingTrack);
      }
    };

    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });

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
        if (this.wasPlayingBeforeHide && !this.isMusicMuted()) {
          this.wasPlayingBeforeHide = false;
          this.playEraMusic(this.currentTrack || this.pendingTrack || 'menu');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', handleVisibility);
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
    const isM = this.isMusicMuted();
    this.musicGain.gain.setValueAtTime(isM ? 0.0 : 0.28, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    const isS = this.isSfxDisabled();
    this.sfxGain.gain.setValueAtTime(isS ? 0.0 : 0.85, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);
  }

  unlockAudio() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  isSfxDisabled() {
    return Storage.isSfxMuted ? Storage.isSfxMuted() : false;
  }

  isMusicMuted() {
    return Storage.isMusicMuted ? Storage.isMusicMuted() : false;
  }

  toggleMusic() {
    this.unlockAudio();
    const willBeMuted = !this.isMusicMuted();
    if (Storage.setMusicMuted) Storage.setMusicMuted(willBeMuted);

    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(willBeMuted ? 0.0 : 0.28, this.ctx.currentTime);
    }
    if (!willBeMuted && !this.isMusicPlaying && this.pendingTrack) {
      this.playEraMusic(this.pendingTrack);
    } else if (willBeMuted && this.isMusicPlaying) {
      this.stopMusic();
    }
    return !willBeMuted;
  }

  toggleSfx() {
    this.unlockAudio();
    const willBeMuted = !this.isSfxDisabled();
    if (Storage.setSfxMuted) Storage.setSfxMuted(willBeMuted);

    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(willBeMuted ? 0.0 : 0.85, this.ctx.currentTime);
    }
    return !willBeMuted;
  }

  isMusicOn() {
    return !this.isMusicMuted();
  }

  isSfxOn() {
    return !this.isSfxDisabled();
  }

  throttle(key, minIntervalMs = 80) {
    const now = performance.now();
    if (this.lastSoundTime[key] && now - this.lastSoundTime[key] < minIntervalMs) {
      return false;
    }
    this.lastSoundTime[key] = now;
    return true;
  }

  createNoiseBuffer(durationSec = 0.3) {
    if (!this.ctx) return null;
    const bufferSize = Math.floor(this.ctx.sampleRate * durationSec);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  playScrape(tier = 1) {
    this.playScrub(tier);
  }

  playScrub(tier = 1) {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx || !this.throttle('scraper', 85)) return;

    const t = this.ctx.currentTime;

    if (tier >= 4) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, t);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.08);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.08);
      return;
    }

    if (tier === 3) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(750, t);
      osc.frequency.exponentialRampToValueAtTime(520, t + 0.06);
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.06);
      return;
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(tier === 2 ? 480 : 420, t);
    osc.frequency.exponentialRampToValueAtTime(tier === 2 ? 260 : 200, t + 0.07);
    gain.gain.setValueAtTime(0.24, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.07);
  }

  playBrush(tier = 1) {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx || !this.throttle('brush', 90)) return;

    const t = this.ctx.currentTime;
    const dur = tier >= 4 ? 0.08 : (tier === 3 ? 0.18 : 0.14);
    const noiseBuffer = this.createNoiseBuffer(dur);
    if (!noiseBuffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    if (tier >= 4) {
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(3200, t);
      filter.frequency.exponentialRampToValueAtTime(4500, t + dur);
    } else if (tier === 3) {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, t);
      filter.frequency.exponentialRampToValueAtTime(1400, t + dur);
    } else {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, t);
      filter.frequency.exponentialRampToValueAtTime(2800, t + dur);
    }

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(tier >= 4 ? 0.12 : 0.18, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(t);
    noise.stop(t + dur);
  }

  playSpray(tier = 1) {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx || !this.throttle('spray', 100)) return;

    const t = this.ctx.currentTime;

    if (tier >= 4) {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, t);
      osc.frequency.exponentialRampToValueAtTime(1800, t + 0.12);
      oscGain.gain.setValueAtTime(0.14, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(oscGain);
      oscGain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.12);
    }

    const dur = 0.18;
    const noiseBuffer = this.createNoiseBuffer(dur);
    if (!noiseBuffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const bpf = this.ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.setValueAtTime(tier === 3 ? 1800 : 3000, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.16, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(bpf);
    bpf.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(t);
    noise.stop(t + dur);
  }

  playCloth(tier = 1) {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx || !this.throttle('cloth', 90)) return;

    const t = this.ctx.currentTime;

    if (tier >= 4) {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1950, t);
      osc.frequency.exponentialRampToValueAtTime(2600, t + 0.07);
      oscGain.gain.setValueAtTime(0.12, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
      osc.connect(oscGain);
      oscGain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.07);
    }

    const dur = 0.16;
    const noiseBuffer = this.createNoiseBuffer(dur);
    if (!noiseBuffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const lpf = this.ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.setValueAtTime(tier === 3 ? 1200 : 900, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.20, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(lpf);
    lpf.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(t);
    noise.stop(t + dur);
  }

  playShopBell() {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx) return;

    const times = [0.00, 0.08, 0.16];
    const freqs = [784.0, 880.0, 1046.5];
    freqs.forEach((freq, i) => {
      const t = this.ctx.currentTime + times[i];
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.18, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(1800, t);

      osc.connect(f);
      f.connect(g);
      g.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.46);
    });
  }

  playRub() {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx || !this.throttle('rub', 70)) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.12);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  playCoin() {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx) return;

    const freqs = [987.77, 1318.51];
    freqs.forEach((freq, i) => {
      const t = this.ctx.currentTime + i * 0.06;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.16, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.26);
    });
  }

  playStarChime(step = 0) {
    this.playTaskChime(step);
  }

  playTaskChime(step = 0) {
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
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.41);
  }

  playShine() {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx) return;

    const freqs = [1046.50, 659.25, 783.99, 1046.50];
    freqs.forEach((freq, idx) => {
      const delay = idx * 0.08;
      const t = this.ctx.currentTime + delay;

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.40);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.40);
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
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);
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
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.05);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.24, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  playMusic(era = 'menu') {
    this.playEraMusic(era);
  }

  playEraMusic(era = 'menu') {
    this.unlockAudio();
    if (!this.ctx) return;
    this.pendingTrack = era;
    if (this.isMusicMuted()) return;

    if (this.currentTrack === era && this.isMusicPlaying) return;

    this.stopMusic();
    this.currentTrack = era;

    const palettes = {
      menu: [220.00, 329.63, 440.00, 523.25],
      egypt: [293.66, 311.13, 369.99, 440.00],
      antique: [220.00, 246.94, 329.63, 392.00],
      europe: [220.00, 261.63, 329.63, 392.00],
      japan: [220.00, 233.08, 293.66, 349.23],
      aztec: [196.00, 220.00, 261.63, 311.13],
      vikings: [220.00, 247.42, 329.63, 440.00],
      renaissance: [220.00, 261.63, 329.63, 523.25]
    };

    const notes = palettes[era] || palettes.menu;
    let step = 0;
    this.isMusicPlaying = true;

    const playNextNote = () => {
      if (!this.isMusicPlaying || this.isMusicMuted()) return;

      const t = this.ctx.currentTime;
      const freq = notes[step % notes.length];
      step++;

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.08, t + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 3.4);

      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(1000, t);

      osc.connect(f);
      f.connect(gain);
      gain.connect(this.musicGain);

      osc.start(t);
      osc.stop(t + 3.5);

      const delay = 1600 + Math.random() * 800;
      this.musicStepTimer = setTimeout(playNextNote, delay);
    };

    playNextNote();
  }

  stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicStepTimer) {
      clearTimeout(this.musicStepTimer);
      this.musicStepTimer = null;
    }
  }
}

export const AudioManager = new AudioManagerClass();
