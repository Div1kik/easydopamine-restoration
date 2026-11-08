import { Storage } from './Storage.js';

class AudioManagerClass {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.ambientTimer = null;
    this.currentTrack = null;
    this.lastSoundTimes = {};
  }

  // Мгновенная разблокировка звука при первом касании экрана
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(Storage.isMuted() ? 0 : 0.75, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  unlockAudio() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    // Если трек меню еще не играет — стартуем сразу
    if (!this.currentTrack && !Storage.isMuted()) {
      this.playMenuMusic();
    }
  }

  toggleMute() {
    const isMuted = Storage.toggleMute();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(isMuted ? 0 : 0.75, this.ctx.currentTime);
    }
    if (isMuted) {
      this.stopMusic();
    } else {
      this.playMenuMusic();
    }
    return isMuted;
  }

  // 1. МУЗЫКА МЕНЮ (Уютный Lo-Fi ASMR)
  playMenuMusic() {
    this.init();
    if (!this.ctx || Storage.isMuted() || this.currentTrack === 'menu') return;
    this.stopMusic();
    this.currentTrack = 'menu';

    const chords = [
      [261.63, 329.63, 392.00, 523.25], // Cmaj7
      [220.00, 261.63, 329.63, 440.00], // Am7
      [174.61, 220.00, 261.63, 349.23], // Fmaj7
      [196.00, 246.94, 293.66, 392.00]  // G7
    ];
    let chordIdx = 0;

    const tick = () => {
      if (Storage.isMuted() || !this.ctx || this.currentTrack !== 'menu') return;
      const notes = chords[chordIdx];
      chordIdx = (chordIdx + 1) % chords.length;

      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, this.ctx.currentTime);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        const t = this.ctx.currentTime + i * 0.22;
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.035, t + 0.12);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);

        osc.connect(filter);
        filter.connect(g);
        g.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 2.5);
      });

      this.ambientTimer = setTimeout(tick, 2400);
    };

    tick();
  }

  // 2. ИНДИВИДУАЛЬНАЯ МУЗЫКА ПОД 7 РЕГИОНОВ
  playEraMusic(eraId) {
    this.init();
    if (!this.ctx || Storage.isMuted() || this.currentTrack === eraId) return;
    this.stopMusic();
    this.currentTrack = eraId;

    let notes = [261.63, 293.66, 329.63, 392.00, 440.00];
    let oscType = 'sine';
    let filterCutoff = 600;

    if (eraId === 'egypt') {
      notes = [110.00, 116.54, 146.83, 164.81, 220.00]; // Фригийский лад с восточным оттенком
      oscType = 'triangle';
      filterCutoff = 550;
    } else if (eraId === 'greece') {
      notes = [146.83, 164.81, 174.61, 196.00, 220.00, 261.63]; // Дорийская кифара
      oscType = 'sine';
      filterCutoff = 700;
    } else if (eraId === 'europe') {
      notes = [130.81, 164.81, 196.00, 246.94, 261.63]; // Готический орган
      oscType = 'triangle';
      filterCutoff = 480;
    } else if (eraId === 'japan') {
      notes = [146.83, 155.56, 196.00, 220.00, 293.66]; // Пентатоника Инсэн
      oscType = 'sine';
      filterCutoff = 650;
    } else if (eraId === 'mesoamerica') {
      notes = [110.00, 130.81, 146.83, 164.81, 196.00]; // Низкая шаманская окарина
      oscType = 'triangle';
      filterCutoff = 420;
    } else if (eraId === 'viking') {
      notes = [98.00, 110.00, 130.81, 146.83, 174.61]; // Суровая нордическая тальхарпа
      oscType = 'sawtooth';
      filterCutoff = 320;
    } else if (eraId === 'china') {
      notes = [196.00, 220.00, 261.63, 293.66, 329.63, 392.00]; // Гучжэн / пентатоника Юй
      oscType = 'sine';
      filterCutoff = 800;
    }

    const step = () => {
      if (Storage.isMuted() || !this.ctx || this.currentTrack !== eraId) return;
      const freq = notes[Math.floor(Math.random() * notes.length)];

      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      const f = this.ctx.createBiquadFilter();

      f.type = 'lowpass';
      f.frequency.setValueAtTime(filterCutoff, this.ctx.currentTime);

      osc.type = oscType;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const t = this.ctx.currentTime;
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.038, t + 0.35);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);

      osc.connect(f);
      f.connect(g);
      g.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 2.9);

      this.ambientTimer = setTimeout(step, 1500 + Math.random() * 900);
    };

    step();
  }

  stopMusic() {
    if (this.ambientTimer) {
      clearTimeout(this.ambientTimer);
      this.ambientTimer = null;
    }
    this.currentTrack = null;
  }

  // 3. ЗВУКИ ИНСТРУМЕНТОВ
  playBrush() {
    if (Storage.isMuted()) return;
    this.init();
    if (!this.ctx) return;
    const now = performance.now();
    if (now - (this.lastSoundTimes['brush'] || 0) < 55) return;
    this.lastSoundTimes['brush'] = now;

    // Мягкий, осязаемый шелест соболиной щетины (шум + bandpass)
    const bufSize = Math.floor(this.ctx.sampleRate * 0.07);
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize) * 0.22;
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.2, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    src.start(t);
  }

  playSpray() {
    if (Storage.isMuted()) return;
    this.init();
    if (!this.ctx) return;
    const now = performance.now();
    if (now - (this.lastSoundTimes['spray'] || 0) < 95) return;
    this.lastSoundTimes['spray'] = now;

    // Плотный шипящий спрей пульверизатора с мягким затуханием
    const bufSize = Math.floor(this.ctx.sampleRate * 0.14);
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.4)) * 0.35;
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3200, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    src.start(t);
  }

  playCloth() {
    if (Storage.isMuted()) return;
    this.init();
    if (!this.ctx) return;
    const now = performance.now();
    if (now - (this.lastSoundTimes['cloth'] || 0) < 75) return;
    this.lastSoundTimes['cloth'] = now;

    // Глубокий шелковистый скрип полируемого металла
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
    filter.Q.setValueAtTime(4.0, this.ctx.currentTime);

    osc.type = 'triangle';
    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(480, t);
    osc.frequency.linearRampToValueAtTime(780, t + 0.05);

    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  playScrub() {
    if (Storage.isMuted()) return;
    this.init();
    if (!this.ctx) return;
    const now = performance.now();
    if (now - (this.lastSoundTimes['scrub'] || 0) < 65) return;
    this.lastSoundTimes['scrub'] = now;

    const bufSize = Math.floor(this.ctx.sampleRate * 0.05);
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.24;
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    src.start(t);
  }

  playBreakSnap() {
    if (Storage.isMuted()) return;
    this.init();
    if (!this.ctx) return;

    // Звук раскалывания керамики / хруста трещины
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(950, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.08);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  playWash() {
    this.playSpray();
  }

  playDoorBells() {
    if (Storage.isMuted()) return;
    this.init();
    if (!this.ctx) return;

    [2093, 2637, 3135, 3520].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      const t = this.ctx.currentTime + i * 0.07;
      osc.frequency.setValueAtTime(f + (Math.random() * 15 - 7), t);
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

    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t = this.ctx.currentTime + idx * 0.08;
      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.6);
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
