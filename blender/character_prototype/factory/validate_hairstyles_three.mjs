import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const PROJECT_ROOT = path.resolve('C:/Users/Admin/Desktop/GAME/GAME-KNDMST');
const GLB_DIR = path.join(PROJECT_ROOT, 'blender/character_prototype/factory/outputs/hairstyles_glb');
const REPORT_PATH = path.join(PROJECT_ROOT, 'blender/character_prototype/factory/hairstyles_threejs_validation.json');

console.log('=== THREE.JS HAIRSTYLE LIBRARY V2 RUNTIME VALIDATION ===');

const hairstyles = [
  'HAIR_001', 'HAIR_002', 'HAIR_003', 'HAIR_004', 'HAIR_005', 'HAIR_006',
  'HAIR_007', 'HAIR_008', 'HAIR_009', 'HAIR_010', 'HAIR_011', 'HAIR_012'
];

async function loadGlb(filePath) {
  const buf = fs.readFileSync(filePath);
  const arrayBuf = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  return new Promise((resolve, reject) => {
    new GLTFLoader().parse(arrayBuf, '', resolve, reject);
  });
}

async function run() {
  const results = [];
  let allPass = true;

  for (const hairId of hairstyles) {
    const glbFile = path.join(GLB_DIR, `character_${hairId.toLowerCase()}.glb`);
    if (!fs.existsSync(glbFile)) {
      console.error(`[FAIL] Missing GLB: ${glbFile}`);
      allPass = false;
      continue;
    }

    try {
      const gltf = await loadGlb(glbFile);
      const scene = gltf.scene;

      // Find Armature
      let armatureFound = false;
      let headBoneFound = false;
      let hairMeshFound = false;
      let headMeshFound = false;
      let hairMaterialProps = null;
      let morphTargetCount = 0;

      scene.traverse((node) => {
        if (node.isBone) {
          if (node.name === 'Head') headBoneFound = true;
        }
        if (node.isSkinnedMesh || node.isMesh) {
          if (node.name.includes('Armature') || node.name.includes('Student_Armature')) armatureFound = true;
          if (node.name.toLowerCase().includes('hair')) {
            hairMeshFound = true;
            if (node.material) {
              const mat = Array.isArray(node.material) ? node.material[0] : node.material;
              hairMaterialProps = {
                name: mat.name,
                roughness: mat.roughness,
                metalness: mat.metalness,
                colorHex: '#' + mat.color.getHexString()
              };
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
      const pass = headBoneFound && hairMeshFound && headMeshFound && animCount >= 16;

      if (!pass) allPass = false;

      const itemRes = {
        hair_id: hairId,
        glb_file: path.basename(glbFile),
        file_size_kb: (fs.statSync(glbFile).size / 1024).toFixed(1),
        head_bone_found: headBoneFound,
        head_mesh_found: headMeshFound,
        morph_targets_count: morphTargetCount,
        hair_mesh_found: hairMeshFound,
        hair_material: hairMaterialProps,
        animation_actions_count: animCount,
        status: pass ? 'PASS' : 'FAIL'
      };

      console.log(`[${pass ? 'PASS' : 'FAIL'}] ${hairId}: HairMesh=${hairMeshFound}, Mat=${hairMaterialProps?.name} (roughness: ${hairMaterialProps?.roughness}), Actions=${animCount}, MorphTargets=${morphTargetCount}`);
      results.push(itemRes);
    } catch (err) {
      console.error(`[ERROR] ${hairId}:`, err);
      allPass = false;
      results.push({ hair_id: hairId, status: 'ERROR', error: err.message });
    }
  }

  const finalReport = {
    timestamp: new Date().toISOString(),
    threejs_version: THREE.REVISION,
    verdict: allPass ? 'PASS' : 'FAIL',
    total_validated: results.length,
    results
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(finalReport, null, 2), 'utf-8');
  console.log(`\nValidation complete. Verdict: ${finalReport.verdict}. Report written to ${REPORT_PATH}`);
}

run();
