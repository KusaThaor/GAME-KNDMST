import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { chalkboardTexture } from '../../render/canvasTex';

/**
 * Quản lý nạp và cấu hình các Asset 3D GLB cho Hành Trình Thanh Xuân (GDD 4.1, 4.5).
 * Chuẩn hóa màu sắc tươi sáng, bóng mềm mượt mà theo phong cách Pixar / Cozy Stylized 3D.
 */

const loader = new GLTFLoader();
const cache = new Map<string, THREE.Group>();

async function loadGlbModel(url: string): Promise<THREE.Group> {
  const cached = cache.get(url);
  if (cached) return cached.clone(true);

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const root = gltf.scene;
        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((mat) => {
              if (mat && (mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
                const std = mat as THREE.MeshStandardMaterial;
                std.envMapIntensity = 0.9;
                // Khử flat shading để tán lá và thân cây mềm mại, mượt mà
                mesh.geometry.computeVertexNormals();
              }
            });
          }
        });
        cache.set(url, root);
        resolve(root.clone(true));
      },
      undefined,
      (err) => reject(err)
    );
  });
}

/**
 * 1. Bảng viết phấn xanh lớp học Việt Nam (2.4m x 1.49m)
 * Tích hợp Texture viết phấn tiếng Việt 2012-2013 (in_class.png)
 */
export async function loadClassroomChalkboard(opts: {
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
} = {}): Promise<THREE.Group> {
  const model = await loadGlbModel('/assets/props/classroom_chalkboard.glb');
  model.name = 'Classroom_Chalkboard_Set';

  if (opts.position) model.position.copy(opts.position);
  if (opts.rotation) model.rotation.copy(opts.rotation);

  // Áp dụng texture chữ phấn viết tay vào mặt bảng
  const boardTex = chalkboardTexture();
  model.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.name.includes('029_1') && !mesh.name.includes('029_1_1')) {
        // Mặt bảng phấn
        mesh.material = new THREE.MeshStandardMaterial({
          map: boardTex,
          roughness: 0.65,
          metalness: 0.0,
        });
        (mesh.material as THREE.Material).userData.outlineParameters = { visible: false };
      } else {
        // Viền khung và máng phấn
        (mesh.material as THREE.Material).userData.outlineParameters = {
          visible: true,
          thickness: 0.003,
          color: [0.22, 0.15, 0.12]
        };
      }
    }
  });

  model.userData = {
    type: 'chalkboard',
    dimensions: { width: 2.40, height: 1.49, depth: 0.19 },
    socketWriteCenter: new THREE.Vector3(0, 0.75, 0.05),
    collider: {
      type: 'box',
      size: [2.40, 1.49, 0.19],
      center: [0, 0.745, 0.095]
    }
  };

  return model;
}

/**
 * 2. Cây hoa phượng vĩ học đường (Schoolyard Flamboyant Tree)
 * Khớp 100% Concept Art 'master_schoolyard.png'
 * Thân uốn lượn tự nhiên, cành xòe vòm ô rộng ~7.5m, hoa phượng đỏ rực rỡ đón hè
 */
export async function loadSchoolyardFlamboyantTree(opts: {
  position?: THREE.Vector3;
  rotationY?: number;
  scale?: number;
} = {}): Promise<THREE.Group> {
  const model = await loadGlbModel('/assets/props/schoolyard_flamboyant_tree.glb');
  model.name = 'Schoolyard_Flamboyant_Tree';

  if (opts.position) model.position.copy(opts.position);
  if (opts.rotationY !== undefined) model.rotation.y = opts.rotationY;
  if (opts.scale) model.scale.setScalar(opts.scale);

  model.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.geometry.computeVertexNormals();
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        if (m) {
          m.userData.outlineParameters = {
            visible: true,
            thickness: 0.0025,
            color: [0.22, 0.14, 0.10],
            alpha: 0.85
          };
        }
      });
    }
  });

  model.userData = {
    type: 'schoolyard_tree',
    subtype: 'flamboyant_tree',
    dimensions: { height: 5.50, canopyWidth: 7.50 },
    trunkCollider: {
      type: 'cylinder',
      radius: 0.45,
      height: 3.20,
      center: [0, 1.60, 0]
    }
  };

  return model;
}

/**
 * 3. Cây bàng phân tầng sân trường (Schoolyard Tiered Almond Tree)
 * Thân thẳng, 4 tầng cành nằm ngang dạng đĩa dẹt (Terminalia catappa)
 */
export async function loadSchoolyardTropicalTree(opts: {
  position?: THREE.Vector3;
  rotationY?: number;
  scale?: number;
} = {}): Promise<THREE.Group> {
  const model = await loadGlbModel('/assets/props/schoolyard_tropical_tree.glb');
  model.name = 'Schoolyard_Tropical_Almond_Tree';

  if (opts.position) model.position.copy(opts.position);
  if (opts.rotationY !== undefined) model.rotation.y = opts.rotationY;
  if (opts.scale) model.scale.setScalar(opts.scale);

  model.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.geometry.computeVertexNormals();
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        if (m) {
          m.userData.outlineParameters = {
            visible: true,
            thickness: 0.0025,
            color: [0.20, 0.14, 0.10],
            alpha: 0.85
          };
        }
      });
    }
  });

  model.userData = {
    type: 'schoolyard_tree',
    subtype: 'tropical_almond_tree',
    dimensions: { height: 5.20, canopyWidth: 5.50 },
    trunkCollider: {
      type: 'cylinder',
      radius: 0.40,
      height: 2.40,
      center: [0, 1.20, 0]
    }
  };

  return model;
}

/**
 * 4. Cây bóng mát sân trường (Schoolyard Shade Tree)
 */
export async function loadSchoolyardShadeTree(opts: {
  position?: THREE.Vector3;
  rotationY?: number;
  scale?: number;
} = {}): Promise<THREE.Group> {
  return loadSchoolyardFlamboyantTree(opts);
}
