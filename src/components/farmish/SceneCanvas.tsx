import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { SCENES, journeyProgress } from "@/lib/journeyStore";
import type { SceneDef } from "@/lib/journeyStore";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const sstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

let smooth = 0;

function CameraRig() {
  useFrame(({ camera }, delta) => {
    smooth = THREE.MathUtils.damp(smooth, journeyProgress.value, 3.2, delta);
    camera.position.z = lerp(11, 7, sstep(0, 1, smooth));
    camera.position.x = Math.sin(smooth * Math.PI) * 0.35;
    camera.position.y = Math.sin(smooth * Math.PI * 2) * 0.18;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function CoverPlane({ scene, index, total }: { scene: SceneDef; index: number; total: number }) {
  const tex = useTexture(scene.img);
  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
  }, [tex]);
  const aspect = useMemo(
    () => (tex.image ? (tex.image as { width: number; height: number }).width / (tex.image as { width: number; height: number }).height : 1.5),
    [tex]
  );
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ camera, size }) => {
    const m = mesh.current;
    const mt = mat.current;
    if (!m || !mt) return;
    const p = smooth;
    const [s, e] = scene.imgRange;
    const f = 0.04;
    let o = sstep(s, s + f, p) * (1 - sstep(e - f, e, p));
    if (index === 0) o = 1 - sstep(e - f, e, p);
    if (index === total - 1) o = sstep(s, s + f, p);
    mt.opacity = o;
    m.visible = o > 0.004;

    const cam = camera as THREE.PerspectiveCamera;
    const vh = 2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * cam.position.z;
    const vw = vh * (size.width / size.height);
    const local = clamp01((p - s) / (e - s));
    const zoom = 1.24 - local * 0.15;
    const sx = Math.max(vw, vh * aspect) * zoom;
    m.scale.set(sx, sx / aspect, 1);
    m.position.y = (local - 0.5) * vh * 0.07;
    m.position.x = -cam.position.x * 0.45;
  });

  return (
    <mesh ref={mesh} renderOrder={index} position={[0, 0, -index * 0.01]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial ref={mat} map={tex} transparent opacity={0} toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

const BEAN_COLORS = ["#d9c8a9", "#c9b18c", "#8a6b4f", "#6f5238", "#e5d6ba"];

function Beans({ count }: { count: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 4.6,
        y: (Math.random() - 0.5) * 3.0,
        z: 3.2 + Math.random() * 1.6,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.9,
        s: 0.035 + Math.random() * 0.05,
      })),
    [count]
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      c.set(BEAN_COLORS[i % BEAN_COLORS.length]);
      m.setColorAt(i, c);
    }
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [count]);

  useFrame(({ clock }) => {
    const m = ref.current;
    const mt = matRef.current;
    if (!m || !mt) return;
    const p = smooth;
    const env = sstep(0.3, 0.37, p) * (1 - sstep(0.7, 0.78, p));
    m.visible = env > 0.01;
    if (!m.visible) return;
    mt.opacity = env;
    const t = clock.elapsedTime;
    const fall = sstep(0.46, 0.66, p);
    for (let i = 0; i < count; i++) {
      const sd = seeds[i];
      const converge = 1 - fall * 0.8;
      dummy.position.set(
        (sd.x + Math.sin(t * sd.speed + sd.phase) * 0.25) * converge,
        sd.y + Math.sin(t * 0.6 + sd.phase) * 0.12 - fall * (2.6 + sd.speed * 1.8),
        sd.z
      );
      dummy.rotation.set(t * sd.speed, sd.phase + t * 0.4, sd.phase);
      dummy.scale.set(sd.s, sd.s * 0.72, sd.s * 1.25);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} visible={false}>
      <sphereGeometry args={[1, 12, 10]} />
      <meshStandardMaterial ref={matRef} roughness={0.85} metalness={0.05} transparent opacity={0} />
    </instancedMesh>
  );
}

function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 9;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 5.5;
      arr[i * 3 + 2] = 2.5 + Math.random() * 3;
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.elapsedTime;
    g.rotation.z = Math.sin(t * 0.05) * 0.03;
    g.position.y = Math.sin(t * 0.12) * 0.25;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#E8B86D"
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

export function SceneCanvas({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="absolute inset-0 z-0" data-testid="scene-canvas">
      <Canvas
        dpr={[1, isMobile ? 1.5 : 1.8]}
        camera={{ fov: 42, position: [0, 0, 11], near: 0.1, far: 60 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#0D130E"]} />
        <Suspense fallback={null}>
          <CameraRig />
          {SCENES.map((s, i) => (
            <CoverPlane key={s.id} scene={s} index={i} total={SCENES.length} />
          ))}
          <Beans count={isMobile ? 90 : 220} />
          <Dust count={isMobile ? 120 : 260} />
          <ambientLight intensity={0.75} color="#ffeedd" />
          <directionalLight position={[5, 6, 8]} intensity={2.2} color="#ffc98a" />
          <directionalLight position={[-4, -2, 6]} intensity={0.4} color="#7a9a6d" />
        </Suspense>
      </Canvas>
    </div>
  );
}
