/**
 * Audio module — all procedural oscillators and noise generators removed.
 * The game is silent unless an audio file is loaded in the future.
 * The startAudio() function is kept as a no-op stub so existing call sites
 * don't break; it no longer creates any AudioContext or sound.
 */

/** No-op — no audio is generated. Kept for compatibility with existing call sites. */
export function startAudio(): null {
  return null;
}

export function stopAudio() {
  // no-op
}

export function getAudioContext(): AudioContext | null {
  return null;
}
