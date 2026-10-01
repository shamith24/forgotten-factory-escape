import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Player } from "./Player";
import { Room } from "./Room";
import { BrokenWindow, CreatureArm, Cutscene, PorcelainDoll, type CinePhase } from "./Cutscene";

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
  const inCutscene = collected;

  useEffect(() => {
    if (inCutscene) return; // all controls disabled during cutscene
    const h = (e: KeyboardEvent) => {
      if (e.code === "KeyF") setFlash((f) => !f);
      if (e.code === "KeyE" && near) {
        setCollected(true);
        document.exitPointerLock?.();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [near, inCutscene]);

  useEffect(() => { if (location.search.includes("cinetest")) setCollected(true); }, []);
  const ended = phase === "end";

  return (
    <div className="fixed inset-0 bg-background">
      <Canvas shadows dpr={[1, 1.5]} camera={{ fov: 70, near: 0.05, far: 40 }} frameloop={ended ? "never" : "always"}>
        <color attach="background" args={["#050403"]} />
        <fog attach="fog" args={["#070605", 2, 14]} />
        <ambientLight intensity={inCutscene ? 0.35 : 0.12} color="#6b7a8a" />
        <hemisphereLight args={["#3a3f4a", "#1a120a", 0.15]} />
        <Room collected={collected} />
        <PorcelainDoll />
        <BrokenWindow />
        <CreatureArm />
        {inCutscene && (
          <>
            <spotLight position={[2, 3.4, 2]} angle={0.6} penumbra={0.8} intensity={14} color="#cfd8ff" distance={10} castShadow />
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
          <div className="pointer-events-none fixed inset-x-0 top-0 h-[10vh] bg-background letterbox" />
          <div className="pointer-events-none fixed inset-x-0 bottom-0 h-[10vh] bg-background letterbox" />
        </>
      )}

      {!inCutscene && locked && (
        <div className="pointer-events-none fixed left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/60" />
      )}

      {!inCutscene && locked && (
        <div className="pointer-events-none fixed bottom-6 left-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <div>
            Flashlight [F]: <span className={flash ? "text-signal" : "text-destructive"}>{flash ? "on" : "off"}</span>
          </div>
          <div className="mt-1">Keycard: missing</div>
        </div>
      )}

      {!inCutscene && locked && near && (
        <div className="pointer-events-none fixed left-1/2 top-[58%] -translate-x-1/2 font-mono text-sm tracking-widest text-signal">
          [E] Take Security Keycard
        </div>
      )}

      {phase === "doll" && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[13vh] flex justify-center px-6">
          <div className="dialogue-box w-full max-w-2xl animate-fade-in px-6 py-4">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-destructive">Poppy</p>
            <p className="mt-2 font-display text-xl text-foreground">"Safe? No one is safe here anymore..."</p>
          </div>
        </div>
      )}

      <div
        className={`pointer-events-none fixed inset-0 bg-background transition-opacity duration-[1500ms] ${
          phase === "fade" || ended ? "opacity-100" : "opacity-0"
        }`}
      />

      {ended && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-background px-6 text-center">
          <h1 className="glitch font-display text-5xl text-foreground md:text-7xl" data-text="PLAYTIME">
            PLAYTIME
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

      {!locked && !inCutscene && (
        <div className="pointer-events-none fixed inset-0 flex items-center justify-center bg-background/80">
          <div className="max-w-md px-6 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-destructive">Jolly Toys Co. — Floor 2</p>
            <h1 className="mt-4 font-display text-6xl text-foreground">The Night Shift</h1>
            <p className="mt-4 text-sm text-muted-foreground">The office has been locked since 1987. Find the security keycard.</p>
            <div className="mt-8 space-y-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              <p>Mouse — look · WASD — walk</p>
              <p>F — flashlight · E — interact · Esc — pause</p>
            </div>
            <p className="mt-10 animate-pulse font-mono text-sm tracking-widest text-foreground">Click to enter</p>
          </div>
        </div>
      )}
    </div>
  );
}
