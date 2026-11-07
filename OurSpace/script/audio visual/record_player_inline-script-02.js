(() => {
  'use strict';

  class RetroAudioEngine {
    constructor(audioElement, canvas, options = {}) {
      this.audio = audioElement;
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.webAudioEnabled = options.webAudioEnabled !== false;
      this.audioContext = null;
      this.sourceNode = null;
      this.analyser = null;
      this.frequencyData = null;
      this.bandRanges = [];
      this.barLevels = new Float32Array(options.barCount || 86);
      this.barCount = this.barLevels.length;
      this.cssWidth = 1;
      this.cssHeight = 1;
      this.dpr = 1;
      this.frameId = 0;
      this.running = false;
      this.visible = !document.hidden;
      this.minFrequency = options.minFrequency || 45;
      this.maxFrequency = options.maxFrequency || 16000;
      this.smoothing = options.smoothing ?? 0.78;
      this.attack = options.attack ?? 0.48;
      this.release = options.release ?? 0.14;
      this.idleBars = this.makeIdleBars();
      this.resizeObserver = null;
      this.graphFailed = false;

      this.draw = this.draw.bind(this);
      this.resize = this.resize.bind(this);
      this.handleVisibility = this.handleVisibility.bind(this);
      this.start();
    }

    makeIdleBars() {
      const bars = new Float32Array(this.barCount);
      for (let i = 0; i < this.barCount; i += 1) {
        const a = Math.sin(i * 0.44) * 0.20;
        const b = Math.sin(i * 1.13 + 1.2) * 0.11;
        const c = Math.cos(i * 0.21 - 0.7) * 0.15;
        const centerBias = 0.18 + 0.13 * Math.sin((i / this.barCount) * Math.PI);
        bars[i] = Math.max(0.08, Math.min(0.50, centerBias + a + b + c));
      }
      return bars;
    }

    get mode() {
      if (this.analyser) return 'live-frequency';
      if (!this.webAudioEnabled) return 'local-safe-animation';
      if (this.graphFailed || !this.AudioContextClass) return 'fallback-animation';
      return 'pending';
    }

    async ensureGraph() {
      if (this.analyser) return true;
      if (!this.webAudioEnabled || !this.AudioContextClass || this.graphFailed) return false;

      try {
        this.audioContext = new this.AudioContextClass();
        this.sourceNode = this.audioContext.createMediaElementSource(this.audio);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = this.smoothing;
        this.analyser.minDecibels = -92;
        this.analyser.maxDecibels = -18;
        this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
        this.sourceNode.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
        this.rebuildBandRanges();
        return true;
      } catch (error) {
        // Do not keep retrying a graph that the current browser/security mode rejected.
        // Native HTMLAudioElement playback remains available because this method is only
        // called where MediaElementSource routing is considered safe.
        console.warn('Web Audio visualizer unavailable; using animated fallback:', error);
        this.graphFailed = true;
        this.analyser = null;
        this.frequencyData = null;
        return false;
      }
    }

    async resume() {
      if (!this.webAudioEnabled) return false;
      const graphReady = await this.ensureGraph();
      if (!graphReady) return false;

      if (this.audioContext?.state === 'suspended') {
        try {
          await this.audioContext.resume();
        } catch (error) {
          console.warn('Unable to resume AudioContext:', error);
        }
      }
      return this.audioContext?.state === 'running';
    }

    rebuildBandRanges() {
      if (!this.analyser || !this.audioContext) return;
      const nyquist = this.audioContext.sampleRate / 2;
      const maxHz = Math.min(this.maxFrequency, nyquist * 0.96);
      const minHz = Math.min(this.minFrequency, maxHz * 0.5);
      const binCount = this.analyser.frequencyBinCount;
      this.bandRanges = new Array(this.barCount);

      for (let i = 0; i < this.barCount; i += 1) {
        const loT = i / this.barCount;
        const hiT = (i + 1) / this.barCount;
        const loHz = minHz * Math.pow(maxHz / minHz, loT);
        const hiHz = minHz * Math.pow(maxHz / minHz, hiT);
        const start = Math.max(1, Math.floor((loHz / nyquist) * binCount));
        const end = Math.min(binCount - 1, Math.max(start + 1, Math.ceil((hiHz / nyquist) * binCount)));
        this.bandRanges[i] = [start, end];
      }
    }

    sampleBand(index) {
      if (!this.frequencyData || !this.bandRanges[index]) return 0;
      const [start, end] = this.bandRanges[index];
      let sum = 0;
      let peak = 0;
      let count = 0;

      for (let bin = start; bin <= end; bin += 1) {
        const value = this.frequencyData[bin] / 255;
        sum += value * value;
        if (value > peak) peak = value;
        count += 1;
      }

      if (!count) return 0;
      const rms = Math.sqrt(sum / count);
      const blended = rms * 0.76 + peak * 0.24;
      return Math.min(1, Math.pow(blended, 0.72) * 1.18);
    }

    sampleFallback(index) {
      // A deterministic, music-like fallback for file:// pages or browsers where a
      // MediaElementSource analyser is unsafe. It is intentionally not presented as
      // measured frequency data; its purpose is to keep the bars visibly alive while
      // native audio playback remains reliable.
      const t = Number.isFinite(this.audio.currentTime) ? this.audio.currentTime : performance.now() / 1000;
      const x = index / Math.max(1, this.barCount - 1);
      const pulseA = 0.5 + 0.5 * Math.sin(t * 6.1 + index * 0.37);
      const pulseB = 0.5 + 0.5 * Math.sin(t * 3.35 - index * 0.19 + Math.sin(t * 0.8));
      const ripple = 0.5 + 0.5 * Math.sin(t * 9.7 + index * 0.91);
      const lowBias = 1 - x * 0.46;
      const centerLift = 0.76 + 0.24 * Math.sin(x * Math.PI);
      return Math.min(0.94, 0.10 + (pulseA * 0.42 + pulseB * 0.34 + ripple * 0.24) * lowBias * centerLift);
    }

    updateLevels() {
      const playing = !this.audio.paused && !this.audio.ended;
      const usingAnalyser = Boolean(this.analyser && playing);
      if (usingAnalyser) this.analyser.getByteFrequencyData(this.frequencyData);

      for (let i = 0; i < this.barCount; i += 1) {
        let target;
        if (usingAnalyser) target = Math.max(0.025, this.sampleBand(i));
        else if (playing) target = this.sampleFallback(i);
        else target = this.idleBars[i];

        const current = this.barLevels[i];
        const speed = target > current ? this.attack : this.release;
        this.barLevels[i] = current + (target - current) * speed;
      }
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      // The parent record-player artwork is proportionally transformed. Canvas
      // drawing coordinates must remain in the unscaled CSS coordinate system;
      // otherwise the waveform would become clipped to a corner on shrink.
      const root = this.canvas.closest('#recordPlayerFlow');
      const visualScale = Math.max(0.01, Number(root?.style.getPropertyValue('--rp-visual-scale')) || 1);
      this.cssWidth = Math.max(1, rect.width / visualScale);
      this.cssHeight = Math.max(1, rect.height / visualScale);
      this.dpr = Math.min((window.devicePixelRatio || 1) * visualScale, 3);
      const width = Math.max(1, Math.round(this.cssWidth * this.dpr));
      const height = Math.max(1, Math.round(this.cssHeight * this.dpr));
      if (this.canvas.width !== width) this.canvas.width = width;
      if (this.canvas.height !== height) this.canvas.height = height;
    }

    draw() {
      if (!this.running) return;
      this.frameId = requestAnimationFrame(this.draw);
      if (!this.ctx || !this.visible) return;

      this.updateLevels();

      const width = this.cssWidth;
      const height = this.cssHeight;
      const dpr = this.dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.ctx.clearRect(0, 0, width, height);

      // Preserve discernible bars even inside the 218px-wide profile sidebar.
      const count = Math.min(this.barCount, Math.max(22, Math.floor(width / 3.45)));
      const gap = Math.max(1.25, Math.min(3, width * 0.006));
      const barWidth = Math.max(1.75, (width - gap * (count - 1) - 3) / count);
      const usedWidth = count * barWidth + (count - 1) * gap;
      const startX = (width - usedWidth) / 2;
      const centerY = height / 2;
      const maxHalf = height * 0.45;
      this.ctx.lineCap = 'round';
      this.ctx.lineWidth = barWidth;
      this.ctx.shadowBlur = 0;
      const material = getComputedStyle(this.canvas.closest('.retro-player') || this.canvas);
      const barA = material.getPropertyValue('--osd-wave-a').trim() || '#714a30';
      const barB = material.getPropertyValue('--osd-wave-b').trim() || '#29231f';
      const axis = material.getPropertyValue('--osd-wave-axis').trim() || 'rgba(0,132,132,0.25)';
      this.ctx.strokeStyle = axis;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();this.ctx.moveTo(0,centerY);this.ctx.lineTo(width,centerY);this.ctx.stroke();
      this.ctx.lineWidth = barWidth;
      for (let i = 0; i < count; i += 1) {
        const index = Math.min(this.barCount - 1, Math.floor(i * this.barCount / count));
        const shaped = Math.min(1, 0.09 + this.barLevels[index] * 1.08);
        const half = Math.max(3, shaped * maxHalf);
        const x = startX + i * (barWidth + gap) + barWidth / 2;
        this.ctx.strokeStyle = i % 7 === 0 ? barA : (i % 3 === 0 ? barA : barB);
        this.ctx.beginPath();
        this.ctx.moveTo(x, centerY - half);
        this.ctx.lineTo(x, centerY + half);
        this.ctx.stroke();
      }
      // Draw playback progress without concealing the live signal.
      const duration = Number(this.audio.duration) || 0;
      if (duration > 0) {
        const ratio = Math.min(1,Math.max(0,(Number(this.audio.currentTime)||0)/duration));
        this.ctx.strokeStyle = axis;this.ctx.lineWidth = 1.75;
        this.ctx.beginPath();this.ctx.moveTo(width*ratio,0);this.ctx.lineTo(width*ratio,height);this.ctx.stroke();
      }
    }

    start() {
      if (this.running) return;
      this.running = true;
      this.resize();

      if ('ResizeObserver' in window) {
        this.resizeObserver = new ResizeObserver(this.resize);
        this.resizeObserver.observe(this.canvas);
      } else {
        window.addEventListener('resize', this.resize);
      }

      window.addEventListener('ourspace:record-player-resized', this.resize);
      document.addEventListener('visibilitychange', this.handleVisibility);
      this.draw();
    }

    handleVisibility() {
      this.visible = !document.hidden;
      if (this.visible) this.resize();
    }

    destroy() {
      this.running = false;
      if (this.frameId) cancelAnimationFrame(this.frameId);
      this.resizeObserver?.disconnect();
      window.removeEventListener('resize', this.resize);
      window.removeEventListener('ourspace:record-player-resized', this.resize);
      document.removeEventListener('visibilitychange', this.handleVisibility);
      this.sourceNode?.disconnect();
      this.analyser?.disconnect();
      if (this.audioContext && this.audioContext.state !== 'closed') this.audioContext.close().catch(() => {});
    }
  }

  window.RetroAudioEngine = RetroAudioEngine;
})();

