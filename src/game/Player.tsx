import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const SPEED = 2.6;
const ROOM = 7.4; // half-size minus margin
const DESK = { x: 1.5, z: 1.0 }; // desk half extents + player radius

export function Player({ flashlightOn, onLock, disabled = false }: { flashlightOn: boolean; onLock: (l: boolean) => void; disabled?: boolean }) {
  const { camera } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const light = useRef<THREE.SpotLight>(null);
  const target = useRef(new THREE.Object3D());
  const bob = useRef(0);

  useEffect(() => {
    camera.position.set(0, 1.65, 5.5);
    camera.lookAt(0, 1, 0);
    const d = (e: KeyboardEvent) => (keys.current[e.code] = true);
    const u = (e: KeyboardEvent) => (keys.current[e.code] = false);
    window.addEventListener("keydown", d);
    window.addEventListener("keyup", u);
    return () => {
      window.removeEventListener("keydown", d);
      window.removeEventListener("keyup", u);
    };
  }, [camera]);

  useFrame((state, raw) => {
    if (disabled) {
      if (light.current) light.current.intensity = 0;
      return;
    }
    const dt = Math.min(raw, 0.05);
    const k = keys.current;
    const fwd = new THREE.Vector3();
    camera.getWorldDirection(fwd);
    fwd.y = 0;
    fwd.normalize();
    const right = new THREE.Vector3().crossVectors(fwd, camera.up).normalize();
    const move = new THREE.Vector3();
    if (k["KeyW"]) move.add(fwd);
    if (k["KeyS"]) move.sub(fwd);
    if (k["KeyD"]) move.add(right);
    if (k["KeyA"]) move.sub(right);
    const p = camera.position;
    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(SPEED * dt);
      const nx = THREE.MathUtils.clamp(p.x + move.x, -ROOM, ROOM);
      const nz = THREE.MathUtils.clamp(p.z + move.z, -ROOM, ROOM);
      const inDesk = (x: number, z: number) => Math.abs(x) < DESK.x && Math.abs(z) < DESK.z;
      if (!inDesk(nx, p.z)) p.x = nx;
      if (!inDesk(p.x, nz)) p.z = nz;
      bob.current += dt * 9;
    }
    p.y = 1.65 + Math.sin(bob.current) * 0.035;

    // flashlight follows camera with slight sway
    if (light.current) {
      light.current.position.copy(p).add(right.clone().multiplyScalar(0.2)).add(new THREE.Vector3(0, -0.15, 0));
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      target.current.position.copy(p).add(dir.multiplyScalar(5));
      target.current.updateMatrixWorld();
      const flick = Math.random() > 0.985 ? 0.3 : 1;
      light.current.intensity = flashlightOn ? 38 * flick : 0;
    }
    void state;
  });

  return (
    <>
      {!disabled && <PointerLockControls onLock={() => onLock(true)} onUnlock={() => onLock(false)} />}
      <primitive object={target.current} />
      <spotLight
        ref={light}
        target={target.current}
        angle={0.42}
        penumbra={0.55}
        distance={18}
        decay={1.6}
        color="#ffe9c4"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0005}
      />
    </>
  );
}
