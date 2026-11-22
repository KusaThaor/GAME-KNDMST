import * as THREE from 'three';
import { toon } from '../../render/materials';

/**
 * PX-03 · Mặt đất mở rộng toàn cảnh (220 x 220 m).
 * Nằm dưới mặt sân y = -0.02, receiveShadow = true, tắt outline, không collider.
 */
export function makeGroundPlane(size = 220): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(size, size);
  geo.rotateX(-Math.PI / 2);

  const mat = toon('#8fa878', { outline: false });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'backdrop_ground_plane';
  mesh.position.set(9, -0.02, -3); // Căn giữa bao trùm bounds [-34, -36, 52, 30]
  mesh.receiveShadow = true;
  mesh.castShadow = false;

  return mesh;
}
