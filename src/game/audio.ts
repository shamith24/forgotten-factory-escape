/**
 * Deep ambient drone audio using the standard browser Web Audio API.
 * No procedural static or high-pitched noise — just a low 60Hz rumble
 * with subtle harmonic layers for an ominous industrial atmosphere.
 */

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let droneNodes: AudioNode[] = [];

/** Must be called from a user gesture (ENTER FACTORY click). */
export function startAudio(): AudioContext | null {
  if (ctx) {
    void ctx.resume();
    return ctx;
  }

  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;

  ctx = new AC();
  void ctx.resume();

  masterGain = ctx.createGain();
  masterGain.gain.value = 0.0;
  masterGain.connect(ctx.destination);
  // fade in gently
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 3);

  // Deep 60Hz rumble — the core drone
  const osc1 = ctx.createOscillator();
  osc1.type = "sine";
  osc1.frequency.value = 60;
  const g1 = ctx.createGain();
  g1.gain.value = 0.5;
  osc1.connect(g1).connect(masterGain);
  osc1.start();
  droneNodes.push(osc1, g1);

  // Sub-harmonic at 30Hz for extra depth
  const osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.value = 30;
  const g2 = ctx.createGain();
  g2.gain.value = 0.3;
  osc2.connect(g2).connect(masterGain);
  osc2.start();
  droneNodes.push(osc2, g2);

  // Slow detuned fifth at 90Hz for tension
  const osc3 = ctx.createOscillator();
  osc3.type = "triangle";
  osc3.frequency.value = 90;
  const g3 = ctx.createGain();
  g3.gain.value = 0.08;
  // slow wobble on the fifth
  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.08;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.04;
  lfo.connect(lfoGain).connect(g3.gain);
  lfo.start();
  osc3.connect(g3).connect(masterGain);
  osc3.start();
  droneNodes.push(osc3, g3, lfo, lfoGain);

  // Low-pass filter on a brownish noise floor for "industrial room tone"
  const bufferSize = ctx.sampleRate * 4;
  const noiseBuf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = noiseBuf.getChannelData(0);
  let lastOut = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    lastOut = (lastOut + 0.02 * white) / 1.02;
    data[i] = lastOut * 3.5;
  }
  const noiseSrc = ctx.createBufferSource();
  noiseSrc.loop = true;
  noiseSrc.buffer = noiseBuf;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.value = 120;
  noiseFilter.Q.value = 0.5;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.06;
  noiseSrc.connect(noiseFilter).connect(noiseGain).connect(masterGain);
  void noiseSrc.start();
  droneNodes.push(noiseSrc, noiseFilter, noiseGain);

  return ctx;
}

export function stopAudio() {
  if (!ctx || !masterGain) return;
  masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
  setTimeout(() => {
    droneNodes.forEach((n) => {
      try {
        if ("stop" in n && typeof n.stop === "function") n.stop();
      } catch {
        // already stopped
      }
      try {
        n.disconnect();
      } catch {
        // already disconnected
      }
    });
    droneNodes = [];
    void ctx?.close();
    ctx = null;
    masterGain = null;
  }, 1100);
}

export function getAudioContext() {
  return ctx;
}
