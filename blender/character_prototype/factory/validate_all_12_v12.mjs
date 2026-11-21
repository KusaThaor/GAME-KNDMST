import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const PROJECT_ROOT = 'C:/Users/Admin/Desktop/GAME/GAME-KNDMST';
const GLB_DIR = path.join(PROJECT_ROOT, 'blender/character_prototype/factory/outputs/hairstyles_glb');
const OUT_REPORT = path.join(PROJECT_ROOT, 'hairstyles_v12_runtime_validation.json');

const STYLES = [
  { id: 'HAIR_001', name: 'Classic Bowl Cut (Approved V12 Pilot)', file: 'character_hair_001_v12.glb' },
  { id: 'HAIR_002', name: 'Sporty Short (V12)', file: 'character_hair_002_v12.glb' },
  { id: 'HAIR_003', name: 'Rounded Bob (V12)', file: 'character_hair_003_v12.glb' },
  { id: 'HAIR_004', name: 'Side-Parted Short (Approved V12 Pilot)', file: 'character_hair_004_v12.glb' },
  { id: 'HAIR_005', name: 'Medium Straight (V12)', file: 'character_hair_005_v12.glb' },
  { id: 'HAIR_006', name: 'Low Ponytail (V12)', file: 'character_hair_006_v12.glb' },
  { id: 'HAIR_007', name: 'High Ponytail (V12)', file: 'character_hair_007_v12.glb' },
  { id: 'HAIR_008', name: 'Twin Pigtails (Approved V12 Pilot)', file: 'character_hair_008_v12.glb' },
  { id: 'HAIR_009', name: 'Braided Hair (V12)', file: 'character_hair_009_v12.glb' },
  { id: 'HAIR_010', name: 'Shoulder-Length Hair (V12)', file: 'character_hair_010_v12.glb' },
  { id: 'HAIR_011', name: 'Side-Swept Bangs (V12)', file: 'character_hair_011_v12.glb' },
  { id: 'HAIR_012', name: 'Messy Short Hair (V12)', file: 'character_hair_012_v12.glb' }
];

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

  const passes = hairMeshFound && headBoneFound && hairTris > 0 && totalTris < 22000 && parseFloat(fileSizeKb) < 750;

  return {
    hair_id: hairId,
    name: hairName,
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
  console.log('=== THREE.JS PRODUCTION RUNTIME VALIDATION (V12 FULL LIBRARY) ===');
  const results = [];
  let allPass = true;

  for (const item of STYLES) {
    const glbPath = path.join(GLB_DIR, item.file);
    if (!fs.existsSync(glbPath)) {
      console.error(`[FAIL] File missing: ${glbPath}`);
      results.push({ hair_id: item.id, error: 'File missing', runtime_pass: false });
      allPass = false;
      continue;
    }

    try {
      const res = await validateGlb(glbPath, item.id, item.name);
      results.push(res);
      console.log(`[${res.runtime_pass ? 'PASS' : 'FAIL'}] ${item.id} (${item.name}): ${res.total_character_triangles} tris, ${res.file_size_kb} KB, HeadBone=${res.head_bone_found}, Anims=${res.animations_count}`);
      if (!res.runtime_pass) allPass = false;
    } catch (e) {
      console.error(`[ERROR] ${item.id}:`, e);
      results.push({ hair_id: item.id, error: e.message, runtime_pass: false });
      allPass = false;
    }
  }

  const summary = {
    timestamp: new Date().toISOString(),
    total_evaluated: STYLES.length,
    all_passed: allPass,
    results
  };

  fs.writeFileSync(OUT_REPORT, JSON.stringify(summary, null, 2));
  console.log(`\nValidation complete. Full report written to ${OUT_REPORT}`);
  if (!allPass) process.exit(1);
}

run();
