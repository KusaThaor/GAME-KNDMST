import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const PROJECT_ROOT = 'C:/Users/Admin/Desktop/GAME/GAME-KNDMST';
const GLB_DIR = path.join(PROJECT_ROOT, 'blender/character_prototype/factory/outputs/hairstyles_glb');
const OUT_REPORT = path.join(PROJECT_ROOT, 'six_hairstyles_v14_runtime_validation.json');
const ARTIFACT_REPORT = 'C:/Users/Admin/.gemini/antigravity/brain/87b9cd6a-c34c-4a94-a366-03341960cd2e/six_hairstyles_v14_runtime_validation.json';

const ACTIVE_SIX = [
  { id: 'HAIR_001', name: 'Classic Bowl Cut', gender: 'male', file: 'character_hair_001_v14.glb' },
  { id: 'HAIR_002', name: 'Sporty Short', gender: 'male', file: 'character_hair_002_v14.glb' },
  { id: 'HAIR_003', name: 'Chin-Length Rounded Bob', gender: 'female', file: 'character_hair_003_v14.glb' },
  { id: 'HAIR_004', name: 'Side-Parted Short', gender: 'male', file: 'character_hair_004_v14.glb' },
  { id: 'HAIR_007', name: 'High Ponytail', gender: 'female', file: 'character_hair_007_v14.glb' },
  { id: 'HAIR_010', name: 'Shoulder-Length Loose Hair', gender: 'female', file: 'character_hair_010_v14.glb' }
];

async function loadGlb(filePath) {
  const buf = fs.readFileSync(filePath);
  const arrayBuf = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  return new Promise((resolve, reject) => {
    new GLTFLoader().parse(arrayBuf, '', resolve, reject);
  });
}

async function validateGlb(filePath, hairId, hairName, gender) {
  const gltf = await loadGlb(filePath);
  const scene = gltf.scene;

  let totalTris = 0;
  let hairTris = 0;
  let hairVerts = 0;
  let hairMeshFound = false;
  let headBoneFound = false;
  let headMeshFound = false;
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
      if (node.name.toLowerCase().includes('head')) {
        headMeshFound = true;
      }
    }
  });

  const animCount = (gltf.animations || []).length;
  const fileSizeKb = (fs.statSync(filePath).size / 1024).toFixed(1);

  // Technical checks
  const passes = hairMeshFound && headBoneFound && hairTris > 0 && totalTris < 22000 && parseFloat(fileSizeKb) < 750;

  return {
    hair_id: hairId,
    name: hairName,
    gender: gender,
    glb_file: path.basename(filePath),
    total_character_triangles: totalTris,
    hair_triangles: hairTris,
    hair_vertices: hairVerts,
    head_bone_found: headBoneFound,
    hair_mesh_found: hairMeshFound,
    head_mesh_found: headMeshFound,
    animations_count: animCount,
    file_size_kb: parseFloat(fileSizeKb),
    materials: hairMaterials,
    runtime_pass: passes
  };
}

async function run() {
  console.log('=== THREE.JS PRODUCTION RUNTIME VALIDATION (SIX HAIRSTYLES V14) ===\n');
  const results = [];
  let allPass = true;

  for (const style of ACTIVE_SIX) {
    const filePath = path.join(GLB_DIR, style.file);
    if (!fs.existsSync(filePath)) {
      console.error(`[ERROR] Missing GLB file: ${filePath}`);
      allPass = false;
      continue;
    }

    try {
      const res = await validateGlb(filePath, style.id, style.name, style.gender);
      results.push(res);
      const statusStr = res.runtime_pass ? 'PASS' : 'FAIL';
      console.log(`[${statusStr}] ${res.hair_id.padEnd(8)}: ${res.name.padEnd(28)} | HairTris: ${String(res.hair_triangles).padStart(5)} | TotalTris: ${String(res.total_character_triangles).padStart(5)} | Size: ${res.file_size_kb.toFixed(1).padStart(5)} KB | HeadBone: ${res.head_bone_found}`);
      if (!res.runtime_pass) allPass = false;
    } catch (err) {
      console.error(`[FAIL] Exception parsing ${style.id}:`, err);
      allPass = false;
    }
  }

  const output = {
    release: 'V14 Six Production Hairstyles',
    total_styles: results.length,
    all_passed: allPass,
    active_selection: {
      male_presets: ['HAIR_001', 'HAIR_002', 'HAIR_004'],
      female_presets: ['HAIR_003', 'HAIR_007', 'HAIR_010']
    },
    archived_styles: ['HAIR_005', 'HAIR_006', 'HAIR_008', 'HAIR_009', 'HAIR_011', 'HAIR_012'],
    styles: results
  };

  fs.writeFileSync(OUT_REPORT, JSON.stringify(output, null, 2), 'utf-8');
  fs.writeFileSync(ARTIFACT_REPORT, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\nValidation complete. All Passed: ${allPass}. Report saved to ${OUT_REPORT}`);
}

run();
