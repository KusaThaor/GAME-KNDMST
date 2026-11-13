import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Gộp mọi mesh tĩnh trong một nhóm theo vật liệu → giảm mạnh số draw call
 * (một dãy lớp từ ~150 mesh còn ~10). Chỉ dùng cho vật không chuyển động riêng lẻ.
 */
export function mergeStatic(root: THREE.Object3D): THREE.Group {
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const buckets = new Map<THREE.Material, { geos: THREE.BufferGeometry[]; cast: boolean; receive: boolean }>();
  const keep: THREE.Object3D[] = [];
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    if (Array.isArray(m.material) || (m as unknown as THREE.InstancedMesh).isInstancedMesh || m.userData.noMerge) { keep.push(m); return; }
    const mat = m.material as THREE.Material;
    let g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
    for (const name of Object.keys(g.attributes)) if (!['position', 'normal', 'uv', 'color'].includes(name)) g.deleteAttribute(name);
    if (!g.getAttribute('uv')) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.getAttribute('position').count * 2), 2));
    g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld));
    const b = buckets.get(mat) ?? { geos: [], cast: false, receive: false };
    b.geos.push(g); b.cast ||= m.castShadow; b.receive ||= m.receiveShadow;
    buckets.set(mat, b);
  });
  const out = new THREE.Group();
  out.name = `${root.name || 'static'}:merged`;
  for (const [mat, b] of buckets) {
    const hasColor = b.geos.some((g) => g.getAttribute('color'));
    if (hasColor) for (const g of b.geos) if (!g.getAttribute('color')) {
      const n = g.getAttribute('position').count; const c = new Float32Array(n * 3).fill(1);
      g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    }
    const merged = mergeGeometries(b.geos, false);
    if (!merged) continue;
    const mesh = new THREE.Mesh(merged, mat);
    mesh.castShadow = b.cast; mesh.receiveShadow = b.receive;
    out.add(mesh);
  }
  for (const k of keep) {
    const clone = k.clone();
    k.updateMatrixWorld(true);
    clone.matrix.multiplyMatrices(inv, k.matrixWorld);
    clone.matrix.decompose(clone.position, clone.quaternion, clone.scale);
    out.add(clone);
  }
  return out;
}
