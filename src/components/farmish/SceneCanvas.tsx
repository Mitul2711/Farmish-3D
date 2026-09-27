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

const BEAN_TEXTURE_URLS = [
  "/textures/real_beans_360/bean_360_1.jpg",
  "/textures/real_beans_360/bean_360_2.jpg",
  "/textures/real_beans_360/bean_360_3.jpg",
  "/textures/real_beans_360/bean_360_4.jpg",
  "/textures/real_beans_360/bean_360_5.jpg",
  "/textures/real_beans_360/bean_360_6.jpg",
];

function createBeanGeometry(): THREE.BufferGeometry {
  const geom = new THREE.SphereGeometry(1, 32, 24);
  const pos = geom.attributes.position;
  const uvs = geom.attributes.uv;

  for (let i = 0; i < pos.count; i++) {
    let px = pos.getX(i);
    let py = pos.getY(i);
    let pz = pos.getZ(i);

    // 1. Proportions of authentic heirloom pinto bean:
    // Y: Length (2.9)
    // X: Width / Kidney curve axis (2.0)
    // Z: Thickness / 3D depth (1.25)
    py *= 1.45;
    px *= 1.0;
    pz *= 0.65;

    // 2. Kidney bean curvature along length Y:
    // Inner belly (-X) curves inward (concave hilum depression)
    // Outer spine (+X) curves outward (smooth convex arch)
    const ny = Math.abs(py / 1.45);
    const midCurve = Math.max(0, 1.0 - ny * ny);

    if (px < 0) {
      px *= (1.0 - midCurve * 0.32); // Inward concave belly
    } else {
      px *= (1.0 + midCurve * 0.14); // Convex arched spine
    }

    // Organic taper: slightly fuller on one half
    const taper = 1.0 + 0.1 * (py / 1.45);
    px *= taper;
    pz *= taper;

    pos.setXYZ(i, px, py, pz);

    // 3. Exact 360 equirectangular UV mapping:
    // v: 0 at south pole to 1 at north pole
    const v = THREE.MathUtils.clamp(0.5 + py / (2 * 1.45), 0.001, 0.999);
    // angle around Y axis
    const angle = Math.atan2(px, pz);
    // u: 0.5 at front (+Z), 0.0/1.0 at back (-Z), 0.25 at belly (-X), 0.75 at spine (+X)
    let u = 0.5 + angle / (2 * Math.PI);
    if (u < 0) u += 1;
    if (u > 1) u -= 1;
    uvs.setXY(i, u, v);
  }

  geom.computeVertexNormals();
  return geom;
}

function Beans({ count }: { count: number }) {
  const textures = useTexture(BEAN_TEXTURE_URLS);
  useMemo(() => {
    textures.forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      tex.generateMipmaps = true;
    });
  }, [textures]);

  const beanGeometry = useMemo(() => createBeanGeometry(), []);
  const meshRefs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const matRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const perGroup = Math.ceil(count / BEAN_TEXTURE_URLS.length);

  const seeds = useMemo(() => {
    return Array.from({ length: BEAN_TEXTURE_URLS.length }, () =>
      Array.from({ length: perGroup }, () => ({
        x: (Math.random() - 0.5) * 2.8,
        y: 0.6 + (Math.random() - 0.5) * 2.4,
        z: 4.0 + Math.random() * 1.6,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 0.85,
        rotSpeedX: (Math.random() - 0.5) * 2.4,
        rotSpeedY: (Math.random() - 0.5) * 3.0,
        rotSpeedZ: (Math.random() - 0.5) * 1.8,
        s: 0.082 + Math.random() * 0.038,
      }))
    );
  }, [perGroup]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const p = smooth;
    const env = sstep(0.3, 0.37, p) * (1 - sstep(0.7, 0.78, p));
    const isVis = env > 0.005;

    for (let g = 0; g < BEAN_TEXTURE_URLS.length; g++) {
      const m = meshRefs.current[g];
      const mt = matRefs.current[g];
      if (!m || !mt) continue;

      m.visible = isVis;
      if (!isVis) continue;
      mt.opacity = env;
      mt.depthWrite = env > 0.92;

      const t = clock.elapsedTime;
      const fall = sstep(0.46, 0.66, p);
      const groupSeeds = seeds[g];

      for (let i = 0; i < perGroup; i++) {
        const sd = groupSeeds[i];
        const converge = 1 - fall * 0.74;
        dummy.position.set(
          (sd.x + Math.sin(t * sd.speed + sd.phase) * 0.16) * converge - fall * 0.05,
          sd.y + Math.sin(t * 0.5 + sd.phase) * 0.08 - fall * (3.5 + sd.speed * 1.4),
          sd.z
        );
        dummy.rotation.set(
          sd.phase + t * sd.rotSpeedX + fall * 3.8,
          sd.phase + t * sd.rotSpeedY + fall * 3.0,
          sd.phase + t * sd.rotSpeedZ + fall * 1.6
        );
        dummy.scale.set(sd.s, sd.s, sd.s);
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);
      }
      m.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group renderOrder={10}>
      {textures.map((tex, g) => (
        <instancedMesh
          key={g}
          ref={(el) => {
            meshRefs.current[g] = el;
          }}
          args={[beanGeometry, undefined, perGroup]}
          visible={false}
          renderOrder={10}
        >
          <meshStandardMaterial
            ref={(el) => {
              matRefs.current[g] = el;
            }}
            map={tex}
            color="#bca38e"
            roughness={0.38}
            metalness={0.02}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </instancedMesh>
      ))}
    </group>
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
          <Beans count={isMobile ? 54 : 96} />
          <Dust count={isMobile ? 120 : 260} />
          <ambientLight intensity={0.7} color="#ede0cf" />
          <directionalLight position={[4, 5, 8]} intensity={1.7} color="#f2dfc5" />
          <directionalLight position={[-4, -2, 6]} intensity={0.4} color="#8fb380" />
          <pointLight position={[0, 0, 8]} intensity={0.9} color="#fff0db" />
        </Suspense>
      </Canvas>
    </div>
  );
}
