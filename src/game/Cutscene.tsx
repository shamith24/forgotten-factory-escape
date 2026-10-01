import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

/** Shared cutscene clock (seconds since start, -1 = inactive). Read by animated props. */
export const cine = { t: -1 };

export type CinePhase = "intro" | "doll" | "turn" | "arm" | "fade" | "end";

const DESK = new THREE.Vector3(0, 0.8, 0);
const DOLL = new THREE.Vector3(-0.35, 1.1, 0.3);
export const WINDOW_POS = new THREE.Vector3(-3, 1.9, 7.95);

const smooth = (x: number) => {
  const c = THREE.MathUtils.clamp(x, 0, 1);
  return c * c * (3 - 2 * c);
};

export function Cutscene({ onPhase }: { onPhase: (p: CinePhase) => void }) {
  const { camera } = useThree();
  const start = useRef<{ pos: THREE.Vector3; look: THREE.Vector3 } | null>(null);
  const phase = useRef<CinePhase | null>(null);
  const shake = useRef(0);

  useEffect(() => {
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    start.current = { pos: camera.position.clone(), look: camera.position.clone().add(dir.multiplyScalar(2)) };
    cine.t = 0;
    return () => {
      cine.t = -1;
    };
  }, [camera]);

  const set = (p: CinePhase) => {
    if (phase.current !== p) {
      phase.current = p;
      onPhase(p);
    }
  };

  useFrame((_, raw) => {
    if (!start.current) return;
    const dt = Math.min(raw, 0.05);
    cine.t += dt;
    const t = cine.t;
    const pos = new THREE.Vector3();
    const look = new THREE.Vector3();

    const wide = new THREE.Vector3(4.2, 4.6, 4.2);
    const dollCam = new THREE.Vector3(-0.85, 1.3, 0.95);
    const turnCam = new THREE.Vector3(-1.9, 1.5, 4.2);

    if (t < 3) {
      set("intro");
      const k = smooth(t / 3);
      pos.lerpVectors(start.current.pos, wide, k);
      look.lerpVectors(start.current.look, DESK, k);
    } else if (t < 7.5) {
      set("doll");
      const k = smooth((t - 3) / 3);
      pos.lerpVectors(wide, dollCam, k);
      look.lerpVectors(DESK, DOLL, k);
      // slow creeping push-in
      pos.lerp(DOLL, smooth((t - 6) / 1.5) * 0.15);
    } else if (t < 8.1) {
      set("turn");
      // quick 180-degree whip toward window behind
      const k = smooth((t - 7.5) / 0.6);
      pos.lerpVectors(dollCam, turnCam, k);
      const ang = k * Math.PI;
      const base = DOLL.clone().sub(dollCam).setY(0).normalize();
      const rotated = base.applyAxisAngle(new THREE.Vector3(0, 1, 0), ang);
      const target = WINDOW_POS.clone().sub(turnCam).setY(0).normalize();
      const dir = rotated.lerp(target, k).normalize();
      look.copy(pos).add(dir.multiplyScalar(4)).setY(THREE.MathUtils.lerp(DOLL.y, WINDOW_POS.y, k));
    } else {
      set(t < 12 ? "arm" : t < 13.5 ? "fade" : "end");
      pos.copy(turnCam);
      look.copy(WINDOW_POS);
      if (t > 9.2) shake.current = Math.min(1, (t - 9.2) / 2);
    }

    if (shake.current > 0) {
      const s = shake.current * 0.03;
      pos.x += (Math.random() - 0.5) * s;
      pos.y += (Math.random() - 0.5) * s;
    }
    camera.position.copy(pos);
    camera.lookAt(look);
  });

  return null;
}

/** Porcelain doll resting on the desk. */
export function PorcelainDoll() {
  const head = useRef<THREE.Mesh>(null);
  useFrame(() => {
    // head slowly turns toward camera during the close-up
    if (head.current && cine.t > 5) head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, 0.9, 0.02);
  });
  const skin = <meshStandardMaterial color="#f3ebe1" roughness={0.18} metalness={0.05} />;
  return (
    <group position={[-0.35, 0.82, 0.3]} rotation-y={0.4} scale={1.8}>
      <pointLight position={[0.15, 0.35, 0.25]} color="#ffd9b0" intensity={cine.t >= 0 ? 0.8 : 0.15} distance={1.5} />
      <mesh position={[0, 0.07, 0]} castShadow>
        <coneGeometry args={[0.07, 0.15, 12]} />
        <meshStandardMaterial color="#7b2232" roughness={0.9} />
      </mesh>
      <mesh ref={head} position={[0, 0.19, 0]} castShadow>
        <sphereGeometry args={[0.05, 16, 14]} />
        {skin}
        <mesh position={[-0.017, 0.008, 0.044]}>
          <sphereGeometry args={[0.009, 8, 8]} />
          <meshStandardMaterial color="#05050a" roughness={0.1} />
        </mesh>
        <mesh position={[0.017, 0.008, 0.044]}>
          <sphereGeometry args={[0.009, 8, 8]} />
          <meshStandardMaterial color="#05050a" roughness={0.1} />
        </mesh>
        <mesh position={[0, -0.022, 0.044]}>
          <sphereGeometry args={[0.006, 6, 6]} />
          <meshStandardMaterial color="#a0303a" />
        </mesh>
        {/* hair */}
        <mesh position={[0, 0.02, -0.01]} scale={[1.1, 0.9, 1.1]}>
          <sphereGeometry args={[0.052, 14, 10, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
          <meshStandardMaterial color="#2a1608" roughness={1} />
        </mesh>
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.06, 0.1, 0.01]} rotation-z={s * 0.5} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.09]} />
          {skin}
        </mesh>
      ))}
    </group>
  );
}

const FUR = "#2a4a9e";

/** Multi-jointed furred arm that reaches in through the window once cine.t > 8.3. */
export function CreatureArm() {
  const root = useRef<THREE.Group>(null);
  const j1 = useRef<THREE.Group>(null);
  const j2 = useRef<THREE.Group>(null);
  const j3 = useRef<THREE.Group>(null);
  const fingers = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!root.current) return;
    const t = cine.t;
    const active = t > 8.1;
    root.current.visible = active;
    if (!active) return;
    const k = smooth((t - 8.3) / 3);
    const w = clock.elapsedTime;
    // slide in through the window (window faces -z into the room)
    root.current.position.set(WINDOW_POS.x, WINDOW_POS.y - 0.05, WINDOW_POS.z + 1.4 - k * 1.5);
    if (j1.current) j1.current.rotation.x = 0.25 - k * 0.35 + Math.sin(w * 3) * 0.04;
    if (j2.current) j2.current.rotation.x = 0.7 - k * 0.95 + Math.sin(w * 4) * 0.05;
    if (j3.current) j3.current.rotation.x = 0.6 - k * 0.9;
    if (fingers.current) fingers.current.children.forEach((f, i) => (f.rotation.x = 0.3 + Math.sin(w * 6 + i) * 0.35 * k));
  });

  const seg = (len: number, r: number) => (
    <>
      <mesh position={[0, 0, -len / 2]} rotation-x={Math.PI / 2} castShadow>
        <capsuleGeometry args={[r, len, 6, 10]} />
        <meshStandardMaterial color={FUR} roughness={1} />
      </mesh>
      {/* fur tufts */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[Math.sin(i * 2.1) * r, Math.cos(i * 2.1) * r, -((i + 0.5) / 6) * len]} rotation={[i, i * 1.7, 0]}>
          <coneGeometry args={[r * 0.35, r * 0.9, 5]} />
          <meshStandardMaterial color="#1f3a80" roughness={1} />
        </mesh>
      ))}
    </>
  );

  return (
    <group ref={root} visible={false}>
      <pointLight position={[0.4, 0.6, -1.8]} color="#9fb4ff" intensity={4} distance={4} />
      <group ref={j1}>
        {seg(0.9, 0.13)}
        <group ref={j2} position={[0, 0, -0.95]}>
          <mesh>
            <sphereGeometry args={[0.15, 10, 10]} />
            <meshStandardMaterial color={FUR} roughness={1} />
          </mesh>
          {seg(0.8, 0.11)}
          <group ref={j3} position={[0, 0, -0.85]}>
            <mesh>
              <sphereGeometry args={[0.13, 10, 10]} />
              <meshStandardMaterial color={FUR} roughness={1} />
            </mesh>
            {seg(0.5, 0.1)}
            {/* hand */}
            <group ref={fingers} position={[0, 0, -0.62]}>
              {[-0.09, -0.03, 0.03, 0.09].map((x, i) => (
                <group key={i} position={[x, 0, 0]} rotation-y={x * 1.5}>
                  <mesh position={[0, 0, -0.14]} rotation-x={Math.PI / 2}>
                    <capsuleGeometry args={[0.025, 0.24, 4, 6]} />
                    <meshStandardMaterial color={FUR} roughness={1} />
                  </mesh>
                  <mesh position={[0, -0.02, -0.3]} rotation-x={-Math.PI / 2 - 0.4}>
                    <coneGeometry args={[0.018, 0.09, 6]} />
                    <meshStandardMaterial color="#d8d0b8" roughness={0.4} />
                  </mesh>
                </group>
              ))}
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

/** Broken window on the wall behind the player's start position. */
export function BrokenWindow() {
  const p = WINDOW_POS;
  const frame = "#2b2620";
  return (
    <group position={[p.x, p.y, p.z]} rotation-y={Math.PI}>
      {/* night outside */}
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={[1.6, 1.2]} />
        <meshBasicMaterial color="#0b1424" />
      </mesh>
      {[[0, 0.63, 1.75, 0.08], [0, -0.63, 1.75, 0.08], [-0.84, 0, 0.08, 1.3], [0.84, 0, 0.08, 1.3], [0, 0, 0.05, 1.2]].map(
        ([x = 0, y = 0, w = 0, h = 0], i) => (
          <mesh key={i} position={[x, y, 0.02]} castShadow>
            <boxGeometry args={[w, h, 0.08]} />
            <meshStandardMaterial color={frame} roughness={0.9} />
          </mesh>
        ),
      )}
      {/* jagged glass shards */}
      {[[-0.6, 0.45, 0.4], [0.55, -0.4, 2.5], [0.62, 0.42, 3.6], [-0.55, -0.45, 1.2]].map(([x = 0, y = 0, r = 0], i) => (
        <mesh key={i} position={[x, y, 0.01]} rotation-z={r}>
          <circleGeometry args={[0.2, 3]} />
          <meshStandardMaterial color="#8fb3c9" transparent opacity={0.35} roughness={0.05} metalness={0.3} />
        </mesh>
      ))}
      <pointLight position={[0, 0, 0.6]} color="#7fa0ff" intensity={2.5} distance={5} decay={2} />
    </group>
  );
}
