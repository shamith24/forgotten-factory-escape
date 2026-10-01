/**
 * Horror dialogue / subtitle lines for the Poppy Playtime-style storyline.
 * Easily editable — add, remove, or reorder entries to script cutscenes.
 *
 * Each dialogue line has:
 * - id: unique key
 * - speaker: character name shown in the subtitle box
 * - text: the spoken line
 * - trigger: when it fires — "start" (game begins), "pickup" (keycard collected),
 *            "doll" (doll close-up), "turn" (whip pan), "arm" (creature appears), "end"
 */

export type DialogueTrigger = "start" | "pickup" | "intro" | "doll" | "turn" | "arm" | "fade" | "end";

export interface DialogueLine {
  id: string;
  speaker: string;
  text: string;
  trigger: DialogueTrigger;
}

export const DIALOGUE_SCRIPT: DialogueLine[] = [
  // Fired when the player clicks ENTER FACTORY and the game starts
  {
    id: "start_1",
    speaker: "PROTAGONIST",
    text: "I shouldn't have come back here... Elliot? Is someone there?",
    trigger: "start",
  },
  {
    id: "start_2",
    speaker: "PROTAGONIST",
    text: "The factory's been dead for years. But something's still moving in the dark.",
    trigger: "start",
  },
  {
    id: "start_3",
    speaker: "PROTAGONIST",
    text: "I need to find a way out. Maybe there's a keycard somewhere on this floor.",
    trigger: "start",
  },

  // Fired when the keycard is picked up — triggers the cutscene
  {
    id: "pickup_1",
    speaker: "PROTAGONIST",
    text: "Got it. Security keycard, level 3. Now I just need to reach the door...",
    trigger: "pickup",
  },

  // During the doll close-up
  {
    id: "doll_1",
    speaker: "POPPY",
    text: "Safe? No one is safe here anymore...",
    trigger: "doll",
  },
  {
    id: "doll_2",
    speaker: "POPPY",
    text: "He's been waiting for you. They all have.",
    trigger: "doll",
  },

  // During the whip-pan turn
  {
    id: "turn_1",
    speaker: "PROTAGONIST",
    text: "What was that?! Something moved by the window—",
    trigger: "turn",
  },

  // When the creature arm appears
  {
    id: "arm_1",
    speaker: "PROTAGONIST",
    text: "No... no no no, GET BACK—",
    trigger: "arm",
  },

  // Ending
  {
    id: "end_1",
    speaker: "???",
    text: "Playtime isn't over yet.",
    trigger: "end",
  },
];

/** Get all lines for a given trigger, in script order */
export function getLinesForTrigger(trigger: DialogueTrigger): DialogueLine[] {
  return DIALOGUE_SCRIPT.filter((l) => l.trigger === trigger);
}

/**
 * Uses the browser's built-in Text-to-Speech engine to speak a line aloud.
 * Lowered pitch and slower rate for a dark, scary protagonist tone.
 */
export function speakDialogue(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = 0.8;
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}
