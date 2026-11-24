import * as THREE from 'three';

export interface InstanceTransform {
  pos: [number, number, number];
  rot?: [number, number, number];
  scale?: [number, number, number];
  color?: THREE.ColorRepresentation;
}

export interface CreateInstancedMeshOpts {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  instances: InstanceTransform[];
  castShadow?: boolean;
  receiveShadow?: boolean;
  name?: string;
}

/**
 * Tạo một InstancedMesh từ danh sách transform và màu tùy chọn.
 * Tự động tắt bóng cho vật vành nền (theo yêu cầu N-07).
 */
export function createInstancedMesh(opts: CreateInstancedMeshOpts): THREE.InstancedMesh {
  const count = opts.instances.length;
  const imesh = new THREE.InstancedMesh(opts.geometry, opts.material, Math.max(count, 1));
  if (opts.name) imesh.name = opts.name;

  imesh.castShadow = opts.castShadow ?? false;
  imesh.receiveShadow = opts.receiveShadow ?? false;

  const dummy = new THREE.Object3D();
  let hasColor = false;

  for (let i = 0; i < count; i++) {
    const inst = opts.instances[i];
    dummy.position.set(...inst.pos);
    if (inst.rot) {
      dummy.rotation.set(...inst.rot);
    } else {
      dummy.rotation.set(0, 0, 0);
    }
    if (inst.scale) {
      dummy.scale.set(...inst.scale);
    } else {
      dummy.scale.set(1, 1, 1);
    }
    dummy.updateMatrix();
    imesh.setMatrixAt(i, dummy.matrix);

    if (inst.color) {
      imesh.setColorAt(i, new THREE.Color(inst.color));
      hasColor = true;
    }
  }

  imesh.instanceMatrix.needsUpdate = true;
  if (hasColor && imesh.instanceColor) {
    imesh.instanceColor.needsUpdate = true;
  }

  return imesh;
}
