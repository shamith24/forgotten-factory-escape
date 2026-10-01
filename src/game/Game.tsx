import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { Player } from "./Player";
import { Room } from "./Room";
import { BrokenWindow, CreatureArm, Cutscene, PorcelainDoll, type CinePhase } from "./Cutscene";
import { startAudio } from "./audio";
import { getLinesForTrigger, speakDialogue, type DialogueLine } from "./dialogue";

function PickupWatcher({ onNear, active }: { onNear: (n: boolean) => void; active: boolean }) {
  const { camera } = useThree();
  const last = useRef(false);
  useFrame(() => {
    const d = Math.hypot(camera.position.x, camera.position.z);
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const to = new THREE.Vector3(-camera.position.x, 0.93 - camera.position.y, -camera.position.z).normalize();
    const near = active && d < 2.2 && dir.dot(to) > 0.8;
    if (near !== last.current) {
      last.current = near;
      onNear(near);
    }
  });
  return null;
}

export default function Game() {
  const [flash, setFlash] = useState(true);
  const [locked, setLocked] = useState(false);
  const [near, setNear] = useState(false);
  const [collected, setCollected] = useState(false);
  const [phase, setPhase] = useState<CinePhase | null>(null);
  const [started, setStarted] = useState(false);
  const [activeLine, setActiveLine] = useState<DialogueLine | null>(null);
  const inCutscene = collected;

  const showLine = useCallback((line: DialogueLine) => {
    setActiveLine(line);
    speakDialogue(line.text);
  }, []);

  const handleStart = () => {
    startAudio();
    setStarted(true);
    // Play the opening dialogue lines sequentially
    const startLines = getLinesForTrigger("start");
    startLines.forEach((line, i) => {
      setTimeout(() => showLine(line), i * 4500);
    });
  };

  // Pickup triggers dialogue + cutscene
  const handlePickup = () => {
    setCollected(true);
    document.exitPointerLock?.();
    const pickupLines = getLinesForTrigger("pickup");
    pickupLines.forEach((line, i) => {
      setTimeout(() => showLine(line), i * 4000);
    });
  };

  useEffect(() => {
    if (inCutscene) return;
    const h = (e: KeyboardEvent) => {
      if (e.code === "KeyF") setFlash((f) => !f);
      if (e.code === "KeyE" && near) handlePickup();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [near, inCutscene]);

  // Trigger dialogue based on cutscene phase
  useEffect(() => {
    if (!phase) return;
    const lines = getLinesForTrigger(phase);
    lines.forEach((line, i) => {
      setTimeout(() => showLine(line), i * 3500);
    });
  }, [phase, showLine]);

  const ended = phase === "end";

  return (
    <div className="fixed inset-0 bg-black">
      <Canvas shadows dpr={[1, 1.5]} camera={{ fov: 70, near: 0.05, far: 40 }} frameloop={ended ? "never" : "always"}>
        {/* Pure black background */}
        <color attach="background" args={["#000000"]} />
        {/* Thick volumetric horror fog */}
        <fogExp2 attach="fog" args={["#050505", 0.12]} />
        {/* Dim ambient so player can faintly see silhouettes, flashlight is primary */}
        <ambientLight intensity={0.5} color="#111111" />
        {inCutscene && <ambientLight intensity={0.03} color="#1a1a2a" />}
        <Room collected={collected} />
        <PorcelainDoll />
        <BrokenWindow />
        <CreatureArm />
        {inCutscene && (
          <>
            <spotLight position={[2, 3.4, 2]} angle={0.5} penumbra={0.8} intensity={6} color="#aabbdd" distance={8} castShadow />
            <Cutscene onPhase={setPhase} />
          </>
        )}
        <Player flashlightOn={flash} onLock={setLocked} disabled={inCutscene} />
        <PickupWatcher onNear={setNear} active={!inCutscene} />
      </Canvas>

      <div className="pointer-events-none fixed inset-0 vignette" />
      <div className="pointer-events-none fixed inset-0 grain" />

      {inCutscene && (
        <>
          <div className="pointer-events-none fixed inset-x-0 top-0 h-[10vh] bg-black letterbox" />
          <div className="pointer-events-none fixed inset-x-0 bottom-0 h-[10vh] bg-black letterbox" />
        </>
      )}

      {/* Crosshair */}
      {!inCutscene && locked && (
        <div className="pointer-events-none fixed left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/40" />
      )}

      {/* HUD */}
      {!inCutscene && locked && (
        <div className="pointer-events-none fixed bottom-6 left-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <div>
            Flashlight [F]: <span className={flash ? "text-signal" : "text-destructive"}>{flash ? "on" : "off"}</span>
          </div>
          <div className="mt-1">Keycard: {collected ? "acquired" : "missing"}</div>
        </div>
      )}

      {/* Interaction prompt */}
      {!inCutscene && locked && near && (
        <div className="pointer-events-none fixed left-1/2 top-[58%] -translate-x-1/2 font-mono text-sm tracking-widest text-signal">
          [E] Take Security Keycard
        </div>
      )}

      {/* Subtitle / dialogue overlay — horror styled text box at bottom */}
      {activeLine && !ended && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[6vh] flex justify-center px-6">
          <div className="dialogue-box w-full max-w-2xl animate-fade-in px-6 py-4">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-destructive">{activeLine.speaker}</p>
            <p className="mt-2 font-display text-xl text-foreground">"{activeLine.text}"</p>
          </div>
        </div>
      )}

      {/* Fade overlay */}
      <div
        className={`pointer-events-none fixed inset-0 bg-black transition-opacity duration-[1500ms] ${
          phase === "fade" || ended ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* End screen */}
      {ended && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black px-6 text-center">
          <h1 className="glitch font-display text-5xl text-foreground md:text-7xl" data-text="PLAYTIME:">
            PLAYTIME:
          </h1>
          <p className="glitch mt-4 font-mono text-lg tracking-[0.5em] text-destructive md:text-2xl" data-text="INSIDE THE UNKNOWN">
            INSIDE THE UNKNOWN
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-14 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            Play again
          </button>
        </div>
      )}

      {/* ENTER FACTORY startup screen */}
      {!started && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="max-w-md px-6 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-destructive">Jolly Toys Co. — Floor 2</p>
            <h1 className="mt-4 font-display text-6xl text-foreground">The Night Shift</h1>
            <p className="mt-4 text-sm text-muted-foreground">
              The factory has been locked since 1987. Find the security keycard. Something is still inside.
            </p>
            <div className="mt-8 space-y-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              <p>Mouse — look · WASD — walk</p>
              <p>F — flashlight · E — interact · Esc — pause</p>
            </div>
            <button
              onClick={handleStart}
              className="mt-10 border border-foreground/30 bg-black px-10 py-4 font-mono text-sm uppercase tracking-[0.3em] text-foreground transition-all hover:border-destructive hover:text-destructive hover:shadow-[0_0_25px_rgba(180,40,30,0.4)]"
            >
              Enter Factory
            </button>
          </div>
        </div>
      )}

      {/* Click to look around prompt (after ENTER FACTORY, before pointer lock) */}
      {started && !locked && !inCutscene && (
        <div className="pointer-events-none fixed inset-0 flex items-center justify-center bg-black/60">
          <p className="animate-pulse font-mono text-sm tracking-widest text-foreground">Click to look around</p>
        </div>
      )}
    </div>
  );
}
