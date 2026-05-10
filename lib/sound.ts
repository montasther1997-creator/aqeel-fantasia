'use client';

let ctx: AudioContext | null = null;
let ambientNodes: { osc: OscillatorNode[]; gain: GainNode } | null = null;

function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
}

export function playHover(volume = 0.04) {
  const c = getCtx(); if (!c) return;
  if (c.state === 'suspended') c.resume();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(660, c.currentTime + 0.18);
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(volume, c.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.2);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.22);
}

export function playClick(volume = 0.06) {
  const c = getCtx(); if (!c) return;
  if (c.state === 'suspended') c.resume();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1320, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(440, c.currentTime + 0.08);
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(volume, c.currentTime + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.1);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.12);
}

export function startAmbient(volume = 0.06) {
  const c = getCtx(); if (!c) return;
  if (c.state === 'suspended') c.resume();
  if (ambientNodes) return;

  const gain = c.createGain();
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(volume, c.currentTime + 1.5);

  // Layered low drones for cinematic luxury feel
  const freqs = [55, 82.5, 110, 138.5];
  const oscs = freqs.map((f, i) => {
    const o = c.createOscillator();
    o.type = i === 0 ? 'sine' : i === 1 ? 'sine' : 'triangle';
    o.frequency.value = f;
    const og = c.createGain();
    og.gain.value = i === 0 ? 0.6 : i === 1 ? 0.4 : 0.2;
    // slow LFO for shimmer
    const lfo = c.createOscillator();
    lfo.frequency.value = 0.08 + i * 0.03;
    const lfoGain = c.createGain();
    lfoGain.gain.value = 0.15;
    lfo.connect(lfoGain).connect(og.gain);
    lfo.start();
    o.connect(og).connect(gain);
    o.start();
    return o;
  });

  // Reverb-ish via small filter
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;
  filter.Q.value = 0.5;
  gain.connect(filter).connect(c.destination);

  ambientNodes = { osc: oscs, gain };
}

export function stopAmbient() {
  const c = getCtx(); if (!c || !ambientNodes) return;
  const { gain, osc } = ambientNodes;
  gain.gain.linearRampToValueAtTime(0, c.currentTime + 1);
  setTimeout(() => {
    osc.forEach((o) => { try { o.stop(); o.disconnect(); } catch {} });
    ambientNodes = null;
  }, 1100);
}

export function isAmbientPlaying() { return !!ambientNodes; }
