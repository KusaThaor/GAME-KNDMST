import * as THREE from 'three';

/**
 * Vật liệu "toon" 3 bậc sáng cho cả nhân vật lẫn bối cảnh → phong cách cozy đồng bộ, không cần texture.
 * Vật liệu được cache theo màu để tiết kiệm bộ nhớ và draw call.
 */
let gradient: THREE.DataTexture | null = null;
function gradientMap(): THREE.DataTexture {
  if (gradient) return gradient;
  const steps = new Uint8Array([150, 150, 150, 255, 212, 212, 212, 255, 255, 255, 255, 255]);
  gradient = new THREE.DataTexture(steps, 3, 1, THREE.RGBAFormat);
  gradient.minFilter = THREE.NearestFilter;
  gradient.magFilter = THREE.NearestFilter;
  gradient.generateMipmaps = false;
  gradient.needsUpdate = true;
  return gradient;
}

export interface ToonOpts {
  outline?: boolean;          // có viền nét vẽ (OutlineEffect)
  emissive?: THREE.ColorRepresentation;
  transparent?: boolean;
  opacity?: number;
  side?: THREE.Side;
  vertexColors?: boolean;
}

const cache = new Map<string, THREE.MeshToonMaterial>();

export function toon(color: THREE.ColorRepresentation, opts: ToonOpts = {}): THREE.MeshToonMaterial {
  const key = `${new THREE.Color(color).getHexString()}|${JSON.stringify(opts)}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const m = new THREE.MeshToonMaterial({
    color, gradientMap: gradientMap(),
    transparent: opts.transparent ?? false, opacity: opts.opacity ?? 1,
    side: opts.side ?? THREE.FrontSide, vertexColors: opts.vertexColors ?? false,
  });
  if (opts.emissive) { m.emissive = new THREE.Color(opts.emissive); m.emissiveIntensity = 1; }
  m.userData.outlineParameters = { visible: opts.outline ?? true, thickness: 0.0018, color: [0.35, 0.32, 0.30], alpha: 0.7 };
  cache.set(key, m);
  return m;
}

/** Vật liệu phẳng không chịu ánh sáng (mắt, má hồng, chữ) — không viền. */
export function flat(color: THREE.ColorRepresentation, opts: { transparent?: boolean; opacity?: number } = {}): THREE.MeshBasicMaterial {
  const key = `flat|${new THREE.Color(color).getHexString()}|${opts.opacity ?? 1}`;
  const hit = cache.get(key) as unknown as THREE.MeshBasicMaterial | undefined;
  if (hit) return hit;
  const m = new THREE.MeshBasicMaterial({ color, transparent: opts.transparent ?? false, opacity: opts.opacity ?? 1, depthWrite: !opts.transparent });
  m.userData.outlineParameters = { visible: false };
  cache.set(key, m as unknown as THREE.MeshToonMaterial);
  return m;
}
