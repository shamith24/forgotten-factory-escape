import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { floorTex, keycardTex, metalTex, posterTex, wallTex, woodTex } from "./textures";

const S = 16;
const H = 3.6;

/** Shared dark metallic material factory */
function darkMetal(tex?: THREE.Texture): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    map: tex ?? null,
    color: "#1a1a1a",
    roughness: 0.9,
    metalness: 0.8,
  });
}

function Crate({ p, s = 0.7, r = 0, mat }: { p: [number, number, number]; s?: number; r?: number; mat: THREE.Material }) {
  return (
    <mesh position={[p[0], p[1] + s / 2, p[2]]} rotation-y={r} castShadow receiveShadow material={mat}>
      <boxGeometry args={[s, s, s]} />
    </mesh>
  );
}

function Bear({ p, r = 0, tilt = 0 }: { p: [number, number, number]; r?: number; tilt?: number }) {
  const fur = "#3a2a1a";
  const eyeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0a0000", roughness: 0.2 }), []);
  const redEyeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#5a0000", emissive: "#300000", emissiveIntensity: 0.5, roughness: 0.3 }), []);
  const furMat = useMemo(() => new THREE.MeshStandardMaterial({ color: fur, roughness: 1, metalness: 0.1 }), []);
  return (
    <group position={p} rotation={[tilt, r, 0]}>
      <mesh position={[0, 0.22, 0]} castShadow material={furMat}>
        <sphereGeometry args={[0.2, 12, 10]} />
      </mesh>
      <mesh position={[0, 0.52, 0]} castShadow material={furMat}>
        <sphereGeometry args={[0.15, 12, 10]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.11, 0.65, 0]} material={furMat}>
          <sphereGeometry args={[0.055, 8, 8]} />
        </mesh>
      ))}
      <mesh position={[-0.055, 0.55, 0.135]} material={eyeMat}>
        <sphereGeometry args={[0.022, 8, 8]} />
      </mesh>
      <mesh position={[0.06, 0.55, 0.14]} material={redEyeMat}>
        <sphereGeometry args={[0.012, 6, 6]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={"l" + s} position={[s * 0.12, 0.05, 0.1]} castShadow material={furMat}>
          <sphereGeometry args={[0.08, 8, 8]} />
        </mesh>
      ))}
    </group>
  );
}

function FlickerBulb({ p }: { p: [number, number, number] }) {
  const l = useRef<THREE.PointLight>(null);
  const m = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const on = Math.sin(t * 13) + Math.sin(t * 7.3) + Math.sin(t * 2.1) > 0.6;
    // Very dim — barely visible, just atmosphere
    const v = on ? 0.3 : 0.01;
    if (l.current) l.current.intensity = v;
    if (m.current) m.current.emissiveIntensity = on ? 0.5 : 0.02;
  });
  return (
    <group position={p}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 1]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} metalness={0.8} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshStandardMaterial ref={m} color="#33291a" emissive="#2a1a08" emissiveIntensity={0.5} roughness={0.9} />
      </mesh>
      <pointLight ref={l} color="#aa7030" distance={4} decay={2} />
    </group>
  );
}

function Keycard({ collected }: { collected: boolean }) {
  const g = useRef<THREE.Group>(null);
  const tex = useMemo(keycardTex, []);
  useFrame(({ clock }) => {
    if (!g.current) return;
    const t = clock.elapsedTime;
    g.current.position.y = 0.93 + Math.sin(t * 2) * 0.03;
    g.current.rotation.y = t * 0.8;
  });
  if (collected) return null;
  return (
    <group ref={g} position={[0, 0.93, 0]}>
      <mesh rotation-x={-Math.PI / 2.4}>
        <boxGeometry args={[0.3, 0.19, 0.008]} />
        <meshStandardMaterial map={tex} emissive="#1a8aaa" emissiveIntensity={0.2} emissiveMap={tex} roughness={0.6} metalness={0.3} />
      </mesh>
      <pointLight color="#1a8aaa" intensity={0.8} distance={2} decay={2} />
    </group>
  );
}

export function Room({ collected }: { collected: boolean }) {
  const mats = useMemo(() => {
    const wall = darkMetal(wallTex());
    const floor = darkMetal(floorTex());
    floor.roughness = 0.7;
    const wood = new THREE.MeshStandardMaterial({ map: woodTex(), roughness: 0.9, metalness: 0.3, color: "#1a1a1a" });
    const metal = darkMetal(metalTex());
    metal.roughness = 0.6;
    metal.metalness = 0.85;
    const ceiling = new THREE.MeshStandardMaterial({ color: "#0a0a0a", roughness: 1, metalness: 0.5 });
    const cardboard = new THREE.MeshStandardMaterial({ color: "#2a1e10", roughness: 1, metalness: 0.2 });
    const poster = new THREE.MeshStandardMaterial({ map: posterTex(), roughness: 1, metalness: 0.1 });
    return { wall, floor, wood, metal, ceiling, cardboard, poster };
  }, []);

  return (
    <group>
      {/* floor & ceiling */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow material={mats.floor}>
        <planeGeometry args={[S, S]} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position-y={H} material={mats.ceiling}>
        <planeGeometry args={[S, S]} />
      </mesh>
      {/* walls */}
      {[
        [0, H / 2, -S / 2, 0],
        [0, H / 2, S / 2, Math.PI],
        [-S / 2, H / 2, 0, Math.PI / 2],
        [S / 2, H / 2, 0, -Math.PI / 2],
      ].map(([x = 0, y = 0, z = 0, r = 0], i) => (
        <mesh key={i} position={[x, y, z]} rotation-y={r} receiveShadow material={mats.wall}>
          <planeGeometry args={[S, H]} />
        </mesh>
      ))}

      {/* ceiling pipes */}
      {[-2.5, 0.8, 3.6].map((x, i) => (
        <mesh key={i} position={[x, H - 0.25 - i * 0.08, 0]} rotation-x={Math.PI / 2} material={mats.metal} castShadow>
          <cylinderGeometry args={[0.09 + i * 0.03, 0.09 + i * 0.03, S, 10]} />
        </mesh>
      ))}
      {/* steel beams */}
      {[-5, 0, 5].map((z) => (
        <mesh key={z} position={[0, H - 0.1, z]} material={mats.metal}>
          <boxGeometry args={[S, 0.2, 0.25]} />
        </mesh>
      ))}

      {/* central desk */}
      <group>
        <mesh position={[0, 0.78, 0]} castShadow receiveShadow material={mats.wood}>
          <boxGeometry args={[2.2, 0.08, 1.1]} />
        </mesh>
        {[[-1, -0.45], [1, -0.45], [-1, 0.45], [1, 0.45]].map(([x = 0, z = 0], i) => (
          <mesh key={i} position={[x, 0.37, z]} castShadow material={mats.wood}>
            <boxGeometry args={[0.08, 0.74, 0.08]} />
          </mesh>
        ))}
        <mesh position={[0.65, 0.45, 0]} castShadow material={mats.wood}>
          <boxGeometry args={[0.7, 0.6, 1]} />
        </mesh>
        {/* old monitor — dark, faint glow */}
        <mesh position={[-0.65, 1.05, -0.25]} rotation-y={0.3} castShadow material={mats.metal}>
          <boxGeometry args={[0.5, 0.42, 0.42]} />
        </mesh>
        <mesh position={[-0.58, 1.06, -0.03]} rotation-y={0.3}>
          <planeGeometry args={[0.38, 0.3]} />
          <meshStandardMaterial color="#050805" emissive="#06180a" emissiveIntensity={0.15} roughness={0.9} />
        </mesh>
        {/* scattered papers — darkened */}
        {[[0.4, 0.2, 0.4], [0.7, -0.25, -0.6], [-0.2, 0.35, 1.2]].map(([x = 0, z = 0, r = 0], i) => (
          <mesh key={i} position={[x, 0.825, z]} rotation={[-Math.PI / 2, 0, r]}>
            <planeGeometry args={[0.21, 0.29]} />
            <meshStandardMaterial color="#4a4438" roughness={1} metalness={0.1} />
          </mesh>
        ))}
        <Bear p={[0.85, 0.82, 0.3]} r={-0.6} tilt={0.25} />
      </group>
      <Keycard collected={collected} />

      {/* office chair knocked over */}
      <group position={[0.6, 0.25, 1.6]} rotation={[0, 0.7, Math.PI / 2.2]}>
        <mesh castShadow material={mats.metal}>
          <boxGeometry args={[0.5, 0.06, 0.5]} />
        </mesh>
        <mesh position={[0, 0.3, -0.24]} castShadow>
          <boxGeometry args={[0.5, 0.55, 0.06]} />
          <meshStandardMaterial color="#1a0a08" roughness={1} metalness={0.3} />
        </mesh>
      </group>

      {/* shelving with toys along back wall */}
      {[-5, -2.2].map((x) => (
        <group key={x} position={[x, 0, -7.5]}>
          {[0.4, 1.1, 1.8, 2.5].map((y) => (
            <mesh key={y} position={[0, y, 0]} castShadow receiveShadow material={mats.metal}>
              <boxGeometry args={[2.2, 0.05, 0.7]} />
            </mesh>
          ))}
          {[-1.05, 1.05].map((sx) => (
            <mesh key={sx} position={[sx, 1.4, 0]} material={mats.metal}>
              <boxGeometry args={[0.06, 2.8, 0.7]} />
            </mesh>
          ))}
          <Bear p={[-0.6, 0.43, 0]} />
          <Bear p={[0.1, 1.13, 0]} r={0.4} tilt={-0.2} />
          <Bear p={[0.6, 1.83, 0]} r={-0.2} />
          <Crate p={[0.4, 0.43, 0]} s={0.4} mat={mats.cardboard} />
          <Crate p={[-0.5, 1.83, 0]} s={0.45} mat={mats.cardboard} />
        </group>
      ))}

      {/* conveyor belt along right wall */}
      <group position={[6.6, 0, -1]}>
        <mesh position={[0, 0.85, 0]} castShadow material={mats.metal}>
          <boxGeometry args={[0.9, 0.1, 8]} />
        </mesh>
        <mesh position={[0, 0.91, 0]}>
          <boxGeometry args={[0.8, 0.02, 8]} />
          <meshStandardMaterial color="#080808" roughness={0.9} metalness={0.6} />
        </mesh>
        {[-3.5, -1, 1.5, 3.5].map((z) => (
          <mesh key={z} position={[0, 0.4, z]} material={mats.metal}>
            <boxGeometry args={[0.8, 0.8, 0.1]} />
          </mesh>
        ))}
        {/* doll heads on belt — darkened */}
        {[-3, -1.6, 0.2, 2.1].map((z, i) => (
          <mesh key={z} position={[0, 1.04, z]} rotation-y={i} castShadow>
            <sphereGeometry args={[0.12, 14, 12]} />
            <meshStandardMaterial color="#6a5848" roughness={0.6} metalness={0.2} />
          </mesh>
        ))}
      </group>

      {/* crate stacks */}
      <Crate p={[-6.5, 0, 5.5]} s={1} r={0.2} mat={mats.wood} />
      <Crate p={[-6.4, 1, 5.6]} s={0.7} r={-0.3} mat={mats.cardboard} />
      <Crate p={[-5.3, 0, 6.4]} s={0.8} r={0.6} mat={mats.cardboard} />
      <Crate p={[5.8, 0, 6.4]} s={0.9} mat={mats.wood} />
      <Crate p={[-6.6, 0, -2]} s={0.6} r={0.8} mat={mats.cardboard} />

      {/* hanging marionette */}
      <group position={[-3.4, 2.2, 2.6]} rotation-z={0.15}>
        <mesh position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 1.4]} />
          <meshStandardMaterial color="#333" roughness={0.8} metalness={0.6} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.13, 12, 12]} />
          <meshStandardMaterial color="#5a4838" roughness={0.5} metalness={0.2} />
        </mesh>
        <mesh position={[0, -0.35, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.16, 0.5, 8]} />
          <meshStandardMaterial color="#3a0808" roughness={1} metalness={0.3} />
        </mesh>
      </group>

      {/* posters — darkened */}
      <mesh position={[2, 1.9, -7.98]} rotation-z={0.04} material={mats.poster}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      <mesh position={[-7.98, 1.8, -4.5]} rotation-y={Math.PI / 2} rotation-z={-0.08} material={mats.poster}>
        <planeGeometry args={[0.9, 0.9]} />
      </mesh>

      {/* rusted door */}
      <mesh position={[0, 1.1, 7.97]} rotation-y={Math.PI} material={mats.metal}>
        <planeGeometry args={[1.2, 2.2]} />
      </mesh>
      <mesh position={[0, 2.35, 7.95]} rotation-y={Math.PI}>
        <planeGeometry args={[0.5, 0.15]} />
        <meshStandardMaterial color="#1a0000" emissive="#aa1000" emissiveIntensity={0.3} roughness={0.8} />
      </mesh>
      <pointLight position={[0, 2.3, 7.4]} color="#aa1000" intensity={0.15} distance={2} />

      <FlickerBulb p={[-4.5, 2.6, -4]} />
      <FlickerBulb p={[4, 2.7, 4.5]} />
    </group>
  );
}
