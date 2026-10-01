import * as THREE from "three";

/** Procedurally synthesized horror audio routed through a THREE.AudioListener on the camera. */
let listener: THREE.AudioListener | null = null;
let musicBox: THREE.Audio | null = null;

const rand = () => Math.random() * 2 - 1;

function buffer(ctx: AudioContext, seconds: number, fill: (d: Float32Array, sr: number) => void) {
  const sr = ctx.sampleRate;
  const b = ctx.createBuffer(1, Math.floor(sr * seconds), sr);
  fill(b.getChannelData(0), sr);
  return b;
}

function humBuffer(ctx: AudioContext) {
  return buffer(ctx, 8, (d, sr) => {
    let lp = 0;
    let lp2 = 0;
    for (let i = 0; i < d.length; i++) {
      const t = i / sr;
      // electrical hum (whole Hz so it loops seamlessly over 8s)
      const hum = Math.sin(2 * Math.PI * 50 * t) * 0.35 + Math.sin(2 * Math.PI * 100 * t) * 0.15 + Math.sin(2 * Math.PI * 150 * t) * 0.05;
      // howling wind: low-passed noise with slow swell
      lp += (rand() - lp) * 0.02;
      lp2 += (lp - lp2) * 0.05;
      const swell = 0.6 + 0.4 * Math.sin((2 * Math.PI * t) / 8) * Math.sin((2 * Math.PI * t * 3) / 8);
      d[i] = hum * 0.5 + lp2 * 6 * swell;
    }
  });
}

function breathBuffer(ctx: AudioContext) {
  return buffer(ctx, 4.5, (d, sr) => {
    let bp = 0;
    let prev = 0;
    for (let i = 0; i < d.length; i++) {
      const t = i / sr;
      // inhale 0-1.6s, exhale 2-3.8s
      let env = 0;
      if (t < 1.6) env = Math.sin((Math.PI * t) / 1.6) ** 2 * 0.7;
      else if (t > 2 && t < 3.8) env = Math.sin((Math.PI * (t - 2)) / 1.8) ** 1.5;
      // breathy band-pass noise, darker on exhale
      const n = rand();
      const k = t < 1.8 ? 0.25 : 0.12;
      bp += (n - bp) * k;
      const hp = bp - prev;
      prev = bp;
      d[i] = (bp * 0.6 + hp * 0.8) * env * 0.9;
    }
  });
}

function musicBoxBuffer(ctx: AudioContext) {
  // "Pop goes the weasel"-esque minor lullaby, pitched up and detuned
  const notes = [76, 81, 81, 83, 83, 84, 88, 84, 81, 76, 81, 81, 83, 83, 84, 81, 0, 80, 77, 76];
  const step = 0.28;
  return buffer(ctx, notes.length * step + 1.5, (d, sr) => {
    notes.forEach((n, idx) => {
      if (!n) return;
      const wobble = 1 + rand() * 0.012;
      const f = 440 * Math.pow(2, (n - 69) / 12) * wobble;
      const start = Math.floor(idx * step * sr);
      const len = Math.floor(1.4 * sr);
      for (let i = 0; i < len && start + i < d.length; i++) {
        const t = i / sr;
        const env = Math.exp(-t * 4.5);
        const s = Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(2 * Math.PI * f * 2.01 * t) * Math.exp(-t * 9) + 0.15 * Math.sin(2 * Math.PI * f * 3.98 * t);
        d[start + i]! += s * env * 0.35;
      }
    });
    // distortion + bitcrush
    for (let i = 0; i < d.length; i++) {
      const crushed = Math.round(d[i]! * 12) / 12;
      d[i] = Math.tanh(crushed * 2.2) * 0.6 + rand() * 0.008;
    }
  });
}

/** Must be called from a user gesture (START GAME click). */
export function startAudio() {
  if (listener) {
    void listener.context.resume();
    return listener;
  }
  listener = new THREE.AudioListener();
  const ctx = listener.context;
  void ctx.resume();

  const hum = new THREE.Audio(listener);
  hum.setBuffer(humBuffer(ctx));
  hum.setLoop(true);
  hum.setVolume(0.18);
  hum.play();

  const breath = new THREE.Audio(listener);
  breath.setBuffer(breathBuffer(ctx));
  breath.setLoop(true);
  breath.setVolume(0.35);
  breath.play();

  musicBox = new THREE.Audio(listener);
  musicBox.setBuffer(musicBoxBuffer(ctx));
  musicBox.setVolume(0.5);
  return listener;
}

export function getListener() {
  return listener;
}

export function playMusicBox(rate = 1) {
  if (!musicBox) return;
  if (musicBox.isPlaying) musicBox.stop();
  musicBox.setPlaybackRate(rate);
  musicBox.play();
}
