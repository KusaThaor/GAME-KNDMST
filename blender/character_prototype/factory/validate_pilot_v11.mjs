import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const PROJECT_ROOT = 'C:/Users/Admin/Desktop/GAME/GAME-KNDMST';
const V11_DIR = path.join(PROJECT_ROOT, 'blender/character_prototype/factory/previews/pilot_v11');

async function loadGlb(filePath) {
  const buf = fs.readFileSync(filePath);
  const arrayBuf = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  return new Promise((resolve, reject) => {
    new GLTFLoader().parse(arrayBuf, '', resolve, reject);
  });
}

async function validateGlb(filePath, hairId, hairName) {
  const gltf = await loadGlb(filePath);
  const scene = gltf.scene;

  let totalTris = 0;
  let hairTris = 0;
  let hairVerts = 0;
  let hairMeshFound = false;
  let headBoneFound = false;
  let headMeshFound = false;
  let morphTargetCount = 0;
  let hairMaterials = [];

  scene.traverse((node) => {
    if (node.isBone && node.name === 'Head') headBoneFound = true;
    if (node.isMesh || node.isSkinnedMesh) {
      const geom = node.geometry;
      const count = geom.index ? geom.index.count / 3 : geom.attributes.position.count / 3;
      totalTris += count;

      if (node.name.toLowerCase().includes('hair') || node.material?.name?.toLowerCase().includes('hair')) {
        hairMeshFound = true;
        hairTris += count;
        hairVerts += geom.attributes.position.count;

        const mats = Array.isArray(node.material) ? node.material : [node.material];
        for (const m of mats) {
          if (m && !hairMaterials.some(x => x.name === m.name)) {
            hairMaterials.push({
              name: m.name,
              roughness: m.roughness,
              metalness: m.metalness,
              colorHex: '#' + m.color.getHexString()
            });
          }
        }
      }

      if (node.name === 'Body_Head') {
        headMeshFound = true;
        if (node.morphTargetDictionary) {
          morphTargetCount = Object.keys(node.morphTargetDictionary).length;
        }
      }
    }
  });

  const animCount = gltf.animations ? gltf.animations.length : 0;
  const passed = headBoneFound && hairMeshFound && headMeshFound && animCount >= 16;

  return {
    hair_id: hairId,
    name: hairName,
    glb_file: path.basename(filePath),
    file_size_kb: (fs.statSync(filePath).size / 1024).toFixed(1),
    total_triangles: totalTris,
    hair_triangles: hairTris,
    hair_vertices: hairVerts,
    head_bone_bound: headBoneFound,
    head_mesh_present: headMeshFound,
    morph_targets: morphTargetCount,
    animations_count: animCount,
    hair_materials: hairMaterials,
    status: passed ? 'PASS' : 'FAIL'
  };
}

async function run() {
  console.log('=== THREE.JS RUNTIME GLB VALIDATION FOR V11 PILOT HAIRSTYLES ===');
  const styles = [
    { id: 'HAIR_001', name: 'Classic Bowl Cut', file: 'character_hair_001_v11.glb' },
    { id: 'HAIR_004', name: 'Side-Parted Short', file: 'character_hair_004_v11.glb' },
    { id: 'HAIR_008', name: 'Twin Pigtails', file: 'character_hair_008_v11.glb' }
  ];

  const report = {};
  let allPass = true;

  for (const s of styles) {
    const p = path.join(V11_DIR, s.file);
    if (!fs.existsSync(p)) {
      console.error(`[FAIL] File missing: ${p}`);
      allPass = false;
      continue;
    }
    const res = await validateGlb(p, s.id, s.name);
    report[s.id] = res;
    if (res.status !== 'PASS') allPass = false;
    console.log(`[${res.status}] ${s.id} (${s.name}): HairTris=${res.hair_triangles}, TotalTris=${res.total_triangles}, Size=${res.file_size_kb}KB, Actions=${res.animations_count}, Roughness=${res.hair_materials[0]?.roughness}`);
  }

  const outPath = path.join(V11_DIR, 'pilot_v11_runtime_validation.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`Validation report written to: ${outPath}`);
  console.log(`Overall Three.js Runtime Result: ${allPass ? 'ALL CHECKS PASSED' : 'FAILED'}`);
}

run();
