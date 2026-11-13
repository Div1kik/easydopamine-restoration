  getToolPitchMult() {
    const skin = Storage.getActiveToolSkin ? Storage.getActiveToolSkin() : 'default';
    if (skin === 'gold') return 1.25;
    if (skin === 'jade') return 0.85;
    if (skin === 'damascus') return 1.15;
    if (skin === 'ruby') return 0.95;
    return 1.0;
  }

  playScrape(tier = 1) {
    this.playScrub(tier);
  }

  playScrub(tier = 1) {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx || !this.throttle('scraper', 85)) return;

    const t = this.ctx.currentTime;
    const pm = this.getToolPitchMult();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = tier >= 4 ? 'sawtooth' : 'triangle';
    const baseFreq = (tier >= 4 ? 1200 : (tier === 3 ? 720 : (tier === 2 ? 480 : 420))) * pm;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.45, t + 0.075);

    gain.gain.setValueAtTime(0.20, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.075);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.075);
  }

  playBrush(tier = 1) {
    if (this.isSfxDisabled()) return;
    this.unlockAudio();
    if (!this.ctx || !this.throttle('brush', 90)) return;

    const t = this.ctx.currentTime;
    const pm = this.getToolPitchMult();
    const dur = tier >= 4 ? 0.09 : 0.14;
    const noiseBuffer = this.createNoiseBuffer(dur);
    if (!noiseBuffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = tier >= 4 ? 'highpass' : 'bandpass';
    filter.frequency.setValueAtTime((tier >= 4 ? 2800 : 1800) * pm, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.16, t + 0.02);
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
    const pm = this.getToolPitchMult();
    const dur = 0.17;
    const noiseBuffer = this.createNoiseBuffer(dur);
    if (!noiseBuffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const bpf = this.ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.setValueAtTime(2600 * pm, t);

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
    const pm = this.getToolPitchMult();
    const dur = 0.15;
    const noiseBuffer = this.createNoiseBuffer(dur);
    if (!noiseBuffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const lpf = this.ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.setValueAtTime(1050 * pm, t);

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
