'use client';

/**
 * Sound of Cloth — Web Audio synthesizer for fabric, wood, gold sounds.
 * No external mp3 files. Pure synthesis.
 */

let ctx: AudioContext | null = null;
let enabled = true;
let initialized = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try { ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch { return null; }
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function initSound() {
  if (initialized) return;
  initialized = true;
  if (typeof window === 'undefined') return;
  enabled = localStorage.getItem('fantasia-sound') !== 'off';
}

export function setSoundEnabled(v: boolean) {
  enabled = v;
  if (typeof window !== 'undefined') localStorage.setItem('fantasia-sound', v ? 'on' : 'off');
}

export function isSoundEnabled() { return enabled; }

/** Fabric whisper (noise burst with lowpass) — used on hover */
export function playFabric(volume = 0.05) {
  if (!enabled) return;
  const c = getCtx(); if (!c) return;
  const bufferSize = 0.18 * c.sampleRate;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    // Pink-ish noise
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 0.5;
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 1600;
  lp.Q.value = 0.6;
  const hp = c.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 200;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(volume, c.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.18);
  src.connect(hp).connect(lp).connect(gain).connect(c.destination);
  src.start();
  src.stop(c.currentTime + 0.2);
}

/** Wood click — short high-pitched tone (for clicks) */
export function playWood(volume = 0.08) {
  if (!enabled) return;
  const c = getCtx(); if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(2400, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(420, c.currentTime + 0.05);
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(volume, c.currentTime + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.08);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.1);
}

/** Gold ding — small bell tone (for add to bag, success) */
export function playDing(volume = 0.07) {
  if (!enabled) return;
  const c = getCtx(); if (!c) return;
  const freqs = [880, 1320, 1760]; // C, E, G-like
  freqs.forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sine';
    o.frequency.value = f;
    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(volume * (1 - i * 0.3), c.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.6);
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + 0.7);
  });
}

/** Swoosh — used for page transitions */
export function playSwoosh(volume = 0.04) {
  if (!enabled) return;
  const c = getCtx(); if (!c) return;
  const bufferSize = 0.35 * c.sampleRate;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
  const src = c.createBufferSource(); src.buffer = buffer;
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(400, c.currentTime);
  lp.frequency.linearRampToValueAtTime(3000, c.currentTime + 0.15);
  lp.frequency.linearRampToValueAtTime(400, c.currentTime + 0.35);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(volume, c.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.35);
  src.connect(lp).connect(gain).connect(c.destination);
  src.start();
  src.stop(c.currentTime + 0.4);
}

/** Bell — formal bespoke submission */
export function playBell(volume = 0.06) {
  if (!enabled) return;
  const c = getCtx(); if (!c) return;
  const freqs = [523.25, 659.25, 783.99, 1046.5];
  freqs.forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sine';
    o.frequency.value = f;
    const startTime = c.currentTime + i * 0.12;
    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(volume * 0.8, startTime + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.9);
    o.connect(g).connect(c.destination);
    o.start(startTime);
    o.stop(startTime + 1);
  });
}
