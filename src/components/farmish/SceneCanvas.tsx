import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useTexture } from "@react-three/drei";
import { useInView } from "motion/react";
import * as THREE from "three";
import { SCENES, journeyProgress } from "@/lib/journeyStore";
import type { SceneDef } from "@/lib/journeyStore";

/* ------------------------------------------------------------------ */
/* Tunables — tweak these first when dialing in the look               */
/* ------------------------------------------------------------------ */
const LOOK = {
  exposure: 1.0, // global tone-mapping exposure (beans only; photo planes are untonemapped)
  beanEnvIntensity: 0.75, // how strongly the studio environment lights the beans
  beanClearcoat: 0.28, // glossy sheen on the bean skin
  beanBump: 0.035, // micro surface relief derived from the bean texture
  beanTint: "#d2bba6", // multiplies the bean texture
  pointerParallax: { x: 0.28, y: 0.16 }, // camera drift following the cursor
  handheld: 0.018, // subtle "breathing" camera motion (world units)
  parallax: 0.05, // depth-map parallax: UV shift between nearest and farthest pixels per unit of camera offset
  parallaxMaxUv: 0.07, // hard cap on that shift so image edges are never revealed
  parallaxSteps: { desktop: 14, mobile: 8 }, // ray-march layers (quality vs. GPU cost)
  haze: 0.1, // atmospheric perspective: how much distant pixels fade toward hazeColor
  hazeColor: "#F2DDBA",
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const sstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

let smooth = 0;

/* ------------------------------------------------------------------ */
/* Camera: scroll dolly + cursor parallax + handheld breathing         */
/* ------------------------------------------------------------------ */
function CameraRig() {
  const px = useRef(0);
  const py = useRef(0);

  useFrame(({ camera, pointer, clock }, delta) => {
    smooth = THREE.MathUtils.damp(smooth, journeyProgress.value, 3.2, delta);
    px.current = THREE.MathUtils.damp(px.current, pointer.x, 2.5, delta);
    py.current = THREE.MathUtils.damp(py.current, pointer.y, 2.5, delta);

    const t = clock.elapsedTime;
    const breatheX = Math.sin(t * 0.37) * LOOK.handheld + Math.sin(t * 0.91) * LOOK.handheld * 0.4;
    const breatheY = Math.cos(t * 0.29) * LOOK.handheld + Math.sin(t * 1.13) * LOOK.handheld * 0.3;

    camera.position.z = lerp(11, 7, sstep(0, 1, smooth));
    camera.position.x = Math.sin(smooth * Math.PI) * 0.35 + px.current * LOOK.pointerParallax.x + breatheX;
    camera.position.y = Math.sin(smooth * Math.PI * 2) * 0.18 + py.current * LOOK.pointerParallax.y + breatheY;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/* ------------------------------------------------------------------ */
/* Photo planes with optional depth-map parallax                       */
/* ------------------------------------------------------------------ */

// Flipped to true if the parallax shader ever fails to compile on a device,
// in which case every plane silently falls back to the flat MeshBasicMaterial.
const parallaxState = { failed: false };

const PARALLAX_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Steep parallax mapping: march a ray through the depth field, then interpolate
// between the last two samples. Depth map convention: white = near, black = far.
const PARALLAX_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform sampler2D uDepth;
  uniform float uOpacity;
  uniform vec2 uShift;
  uniform float uHaze;
  uniform vec3 uHazeColor;
  varying vec2 vUv;

  void main() {
    float stepSize = 1.0 / float(STEPS);
    vec2 delta = uShift * stepSize;

    // Anchor the focal plane at mid-depth so the centre of the frame stays put
    vec2 cur = vUv + uShift * 0.5;
    vec2 prev = cur;
    float layer = 0.0;
    float prevLayer = 0.0;
    float h = 1.0 - textureLod(uDepth, cur, 0.0).r;
    float prevH = h;

    for (int i = 0; i < STEPS; i++) {
      if (layer >= h) break;
      prev = cur;
      prevH = h;
      prevLayer = layer;
      cur -= delta;
      h = 1.0 - textureLod(uDepth, cur, 0.0).r;
      layer += stepSize;
    }

    float after = h - layer;
    float before = prevH - prevLayer;
    float denom = after - before;
    float w = abs(denom) < 1e-5 ? 0.0 : clamp(after / denom, 0.0, 1.0);
    vec2 uv = mix(cur, prev, w);

    float depth = textureLod(uDepth, uv, 0.0).r;
    vec3 col = texture2D(uMap, uv).rgb;

    // Atmospheric perspective: distant pixels drift toward a warm haze
    col = mix(col, uHazeColor, (1.0 - depth) * uHaze);

    gl_FragColor = vec4(col, uOpacity);
    #include <colorspace_fragment>
  }
`;

/** Loads a depth map as optional progressive enhancement (never blocks the loader, never throws). */
function useDepthTexture(url?: string) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    let loaded: THREE.Texture | null = null;
    // Private manager so depth maps don't hold up the page loader overlay
    const loader = new THREE.TextureLoader(new THREE.LoadingManager());
    loader.load(
      url,
      (t) => {
        if (cancelled) {
          t.dispose();
          return;
        }
        t.colorSpace = THREE.NoColorSpace;
        t.minFilter = THREE.LinearFilter;
        t.magFilter = THREE.LinearFilter;
        t.generateMipmaps = false;
        t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
        loaded = t;
        setTex(t);
      },
      undefined,
      () => {
        /* no depth map for this scene yet: stay flat */
      }
    );
    return () => {
      cancelled = true;
      loaded?.dispose();
    };
  }, [url]);

  return tex;
}

/** Catches shader compile failures so a bad GPU/driver degrades to flat photos instead of a blank scene. */
function ShaderGuard() {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const prev = gl.debug.onShaderError;
    gl.debug.onShaderError = (ctx, program, vs, fs) => {
      parallaxState.failed = true;
      console.error(
        "[Farmish] A shader failed to compile; depth parallax disabled.",
        ctx.getShaderInfoLog(fs) || ctx.getShaderInfoLog(vs)
      );
    };
    return () => {
      gl.debug.onShaderError = prev;
    };
  }, [gl]);
  return null;
}

function CoverPlane({
  scene,
  index,
  total,
  isMobile,
}: {
  scene: SceneDef;
  index: number;
  total: number;
  isMobile: boolean;
}) {
  const tex = useTexture(scene.img);
  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
  }, [tex]);
  const aspect = useMemo(
    () =>
      tex.image
        ? (tex.image as { width: number; height: number }).width /
          (tex.image as { width: number; height: number }).height
        : 1.5,
    [tex]
  );

  const depthTex = useDepthTexture(scene.depth);
  const [parallaxFailed, setParallaxFailed] = useState(false);
  const parallaxOn = !!depthTex && !parallaxFailed;

  const mesh = useRef<THREE.Mesh>(null);
  const basicMat = useRef<THREE.MeshBasicMaterial>(null);
  const reveal = useRef(0);

  const shaderMat = useMemo(() => {
    if (!depthTex) return null;
    return new THREE.ShaderMaterial({
      defines: { STEPS: isMobile ? LOOK.parallaxSteps.mobile : LOOK.parallaxSteps.desktop },
      uniforms: {
        uMap: { value: tex },
        uDepth: { value: depthTex },
        uOpacity: { value: 0 },
        uShift: { value: new THREE.Vector2() },
        uHaze: { value: 0 },
        uHazeColor: { value: new THREE.Color(LOOK.hazeColor) },
      },
      vertexShader: PARALLAX_VERT,
      fragmentShader: PARALLAX_FRAG,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    });
  }, [depthTex, tex, isMobile]);

  useEffect(() => () => shaderMat?.dispose(), [shaderMat]);

  useFrame(({ camera, size }, delta) => {
    const m = mesh.current;
    if (!m) return;

    if (parallaxState.failed && !parallaxFailed) setParallaxFailed(true);

    const p = smooth;
    const [s, e] = scene.imgRange;
    const f = 0.04;
    let o = sstep(s, s + f, p) * (1 - sstep(e - f, e, p));
    if (index === 0) o = 1 - sstep(e - f, e, p);
    if (index === total - 1) o = sstep(s, s + f, p);
    m.visible = o > 0.004;

    const cam = camera as THREE.PerspectiveCamera;

    if (parallaxOn && shaderMat) {
      const u = shaderMat.uniforms;
      u.uOpacity.value = o;
      // Fade the effect in once the depth map arrives so there is no visible pop
      reveal.current = THREE.MathUtils.damp(reveal.current, 1, 2.2, delta);
      const k = LOOK.parallax * reveal.current;
      const cap = LOOK.parallaxMaxUv;
      // y is scaled by aspect so the apparent parallax is equal on both axes
      (u.uShift.value as THREE.Vector2).set(
        THREE.MathUtils.clamp(cam.position.x * k, -cap, cap),
        THREE.MathUtils.clamp(cam.position.y * k * aspect, -cap, cap)
      );
      u.uHaze.value = LOOK.haze * reveal.current;
    } else if (basicMat.current) {
      basicMat.current.opacity = o;
    }

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
      {parallaxOn && shaderMat ? (
        <primitive object={shaderMat} attach="material" />
      ) : (
        <meshBasicMaterial ref={basicMat} map={tex} transparent opacity={0} toneMapped={false} depthWrite={false} />
      )}
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Beans                                                               */
/* ------------------------------------------------------------------ */
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

    // Pinto-bean proportions: length (Y), width (X), thickness (Z)
    py *= 1.45;
    px *= 1.0;
    pz *= 0.65;

    // Kidney curvature: concave belly (-X), convex spine (+X)
    const ny = Math.abs(py / 1.45);
    const midCurve = Math.max(0, 1.0 - ny * ny);
    if (px < 0) px *= 1.0 - midCurve * 0.32;
    else px *= 1.0 + midCurve * 0.14;

    // Organic taper
    const taper = 1.0 + 0.1 * (py / 1.45);
    px *= taper;
    pz *= taper;

    pos.setXYZ(i, px, py, pz);

    // Equirectangular UVs
    const v = THREE.MathUtils.clamp(0.5 + py / (2 * 1.45), 0.001, 0.999);
    const angle = Math.atan2(px, pz);
    let u = 0.5 + angle / (2 * Math.PI);
    if (u < 0) u += 1;
    if (u > 1) u -= 1;
    uvs.setXY(i, u, v);
  }

  geom.computeVertexNormals();
  return geom;
}

interface BeanSeed {
  x: number;
  y: number;
  z: number;
  phase: number;
  speed: number;
  rotSpeedX: number;
  rotSpeedY: number;
  rotSpeedZ: number;
  s: number;
  stagger: number; // 0..1 — beans don't all start falling on the same frame
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
  const matRefs = useRef<(THREE.MeshPhysicalMaterial | null)[]>([]);
  const perGroup = Math.ceil(count / BEAN_TEXTURE_URLS.length);

  const seeds = useMemo<BeanSeed[][]>(() => {
    return Array.from({ length: BEAN_TEXTURE_URLS.length }, () =>
      Array.from({ length: perGroup }, () => {
        // Wider depth range → real parallax between near and far beans
        const z = 3.4 + Math.random() * 3.0;
        // Nearer beans read slightly larger, farther ones smaller
        const depthScale = 0.92 + (z - 3.4) / 3.0 * 0.22;
        return {
          x: (Math.random() - 0.5) * 3.0,
          y: 0.6 + (Math.random() - 0.5) * 2.5,
          z,
          phase: Math.random() * Math.PI * 2,
          speed: 0.5 + Math.random() * 0.85,
          rotSpeedX: (Math.random() - 0.5) * 2.0,
          rotSpeedY: (Math.random() - 0.5) * 2.6,
          rotSpeedZ: (Math.random() - 0.5) * 1.5,
          s: (0.082 + Math.random() * 0.038) * depthScale,
          stagger: Math.random(),
        };
      })
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
      const groupSeeds = seeds[g];

      for (let i = 0; i < perGroup; i++) {
        const sd = groupSeeds[i];
        // Staggered, gravity-like fall: each bean starts a little earlier/later
        const fall = sstep(0.46 + sd.stagger * 0.06, 0.6 + sd.stagger * 0.07, p);
        const fallAccel = fall * fall; // eases in like real acceleration
        const converge = 1 - fall * 0.74;

        dummy.position.set(
          (sd.x + Math.sin(t * sd.speed + sd.phase) * 0.16) * converge - fall * 0.05,
          sd.y + Math.sin(t * 0.5 + sd.phase) * 0.08 - (fall * 0.55 + fallAccel * 0.45) * (3.5 + sd.speed * 1.4),
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
          frustumCulled={false}
        >
          {/* Physical material: clearcoat sheen + bump from the colour map + image-based light */}
          <meshPhysicalMaterial
            ref={(el) => {
              matRefs.current[g] = el;
            }}
            map={tex}
            bumpMap={tex}
            bumpScale={LOOK.beanBump}
            color={LOOK.beanTint}
            roughness={0.5}
            metalness={0}
            clearcoat={LOOK.beanClearcoat}
            clearcoatRoughness={0.38}
            envMapIntensity={LOOK.beanEnvIntensity}
            transparent
            depthWrite={false}
          />
        </instancedMesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Dust motes: soft round sprites that drift upward and sway           */
/* ------------------------------------------------------------------ */
function useSoftSprite() {
  const texture = useMemo(() => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.35, "rgba(255,255,255,0.45)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useLayoutEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const sprite = useSoftSprite();

  const { positions, base, phases, rise } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const b = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    const r = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      b[i * 3] = (Math.random() - 0.5) * 9;
      b[i * 3 + 1] = (Math.random() - 0.5) * 5.5;
      b[i * 3 + 2] = 2.5 + Math.random() * 3.2;
      pos.set([b[i * 3], b[i * 3 + 1], b[i * 3 + 2]], i * 3);
      ph[i] = Math.random() * Math.PI * 2;
      r[i] = 0.04 + Math.random() * 0.1;
    }
    return { positions: pos, base: b, phases: ph, rise: r };
  }, [count]);

  useFrame(({ clock }) => {
    const pts = ref.current;
    if (!pts) return;
    const t = clock.elapsedTime;
    const attr = pts.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const H = 5.5;
    for (let i = 0; i < count; i++) {
      const ph = phases[i];
      const y = ((base[i * 3 + 1] + H / 2 + t * rise[i]) % H) - H / 2; // slow upward drift, wraps
      arr[i * 3] = base[i * 3] + Math.sin(t * 0.21 + ph) * 0.18;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * 0.17 + ph) * 0.12;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={sprite}
        size={0.085}
        color="#F2C98A"
        transparent
        opacity={0.42}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        toneMapped={false}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/* Procedural studio environment (no external HDR download)            */
/* ------------------------------------------------------------------ */
function StudioEnvironment() {
  return (
    <Environment resolution={256} frames={1}>
      {/* warm key softbox, upper right */}
      <Lightformer form="rect" intensity={4.2} color="#ffe2b8" position={[4, 5, 6]} scale={[6, 4, 1]} target={[0, 0, 0]} />
      {/* cool green bounce from the field, lower left */}
      <Lightformer form="rect" intensity={1.1} color="#a9c98d" position={[-5, -2, 4]} scale={[5, 3, 1]} target={[0, 0, 0]} />
      {/* overhead strip for specular highlights along the bean spine */}
      <Lightformer form="rect" intensity={2.2} color="#fff4e0" position={[0, 7, 2]} rotation-x={Math.PI / 2} scale={[8, 1.4, 1]} />
      {/* soft warm fill so shadow sides never go muddy */}
      <Lightformer form="circle" intensity={0.8} color="#f3e1c6" position={[0, 0, 9]} scale={8} />
    </Environment>
  );
}

/* ------------------------------------------------------------------ */
/* Canvas                                                              */
/* ------------------------------------------------------------------ */
export function SceneCanvas({ isMobile }: { isMobile: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  // Stop rendering entirely once the journey has scrolled out of view
  const inView = useInView(wrapRef, { margin: "200px 0px 200px 0px" });

  useLayoutEffect(() => {
    journeyProgress.value = 0;
    smooth = 0;
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0 z-0" data-testid="scene-canvas">
      <Canvas
        frameloop={inView ? "always" : "never"}
        dpr={[1, isMobile ? 1.5 : 1.8]}
        camera={{ fov: 42, position: [0, 0, 11], near: 0.1, far: 60 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: LOOK.exposure,
        }}
      >
        <color attach="background" args={["#F7F2E8"]} />
        <Suspense fallback={null}>
          <ShaderGuard />
          <CameraRig />
          <StudioEnvironment />
          {SCENES.map((s, i) => (
            <CoverPlane key={s.id} scene={s} index={i} total={SCENES.length} isMobile={isMobile} />
          ))}
          <Beans count={isMobile ? 54 : 96} />
          <Dust count={isMobile ? 120 : 260} />
          <ambientLight intensity={0.25} color="#ede0cf" />
          <directionalLight position={[4, 5, 8]} intensity={1.3} color="#f2dfc5" />
          <directionalLight position={[-4, -2, 6]} intensity={0.3} color="#8fb380" />
        </Suspense>
      </Canvas>
    </div>
  );
}
