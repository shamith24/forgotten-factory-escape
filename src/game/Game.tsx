import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { Player } from "./Player";
import { Room } from "./Room";

function PickupWatcher({ onNear }: { onNear: (n: boolean) => void }) {
  const { camera } = useThree();
  let last = false;
  useFrame(() => {
    const d = Math.hypot(camera.position.x, camera.position.z);
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const to = new THREE.Vector3(-camera.position.x, 0.93 - camera.position.y, -camera.position.z).normalize();
    const near = d < 2.2 && dir.dot(to) > 0.8;
    if (near !== last) {
      last = near;
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

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.code === "KeyF") setFlash((f) => !f);
      if (e.code === "KeyE" && near) setCollected(true);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [near]);

  return (
    <div className="fixed inset-0 bg-background">
      <Canvas shadows dpr={[1, 1.5]} camera={{ fov: 70, near: 0.05, far: 40 }}>
        <color attach="background" args={["#050403"]} />
        <fog attach="fog" args={["#070605", 2, 14]} />
        <ambientLight intensity={0.12} color="#6b7a8a" />
        <hemisphereLight args={["#3a3f4a", "#1a120a", 0.15]} />
        <Room collected={collected} />
        <Player flashlightOn={flash} onLock={setLocked} />
        <PickupWatcher onNear={setNear} />
      </Canvas>

      <div className="pointer-events-none fixed inset-0 vignette" />
      <div className="pointer-events-none fixed inset-0 grain" />

      {locked && <div className="pointer-events-none fixed left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/60" />}

      {locked && (
        <div className="pointer-events-none fixed bottom-6 left-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <div>Flashlight [F]: <span className={flash ? "text-signal" : "text-destructive"}>{flash ? "on" : "off"}</span></div>
          <div className="mt-1">Keycard: {collected ? <span className="text-signal">acquired</span> : "missing"}</div>
        </div>
      )}

      {locked && near && !collected && (
        <div className="pointer-events-none fixed left-1/2 top-[58%] -translate-x-1/2 font-mono text-sm tracking-widest text-signal">
          [E] Take Security Keycard
        </div>
      )}

      {locked && collected && (
        <div className="pointer-events-none fixed left-1/2 top-12 -translate-x-1/2 font-display text-2xl text-foreground animate-pulse">
          Something heard you.
        </div>
      )}

      {!locked && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 pointer-events-none">
          <div className="max-w-md px-6 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-destructive">Jolly Toys Co. — Floor 2</p>
            <h1 className="mt-4 font-display text-6xl text-foreground">The Night Shift</h1>
            <p className="mt-4 text-sm text-muted-foreground">
              The office has been locked since 1987. Find the security keycard.
            </p>
            <div className="mt-8 font-mono text-xs uppercase tracking-widest text-muted-foreground space-y-1">
              <p>Mouse — look · WASD — walk</p>
              <p>F — flashlight · E — interact · Esc — pause</p>
            </div>
            <p className="mt-10 font-mono text-sm tracking-widest text-foreground animate-pulse">Click to enter</p>
          </div>
        </div>
      )}
    </div>
  );
}
