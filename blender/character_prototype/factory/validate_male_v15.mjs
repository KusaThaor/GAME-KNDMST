import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const PROJECT_ROOT = 'C:/Users/Admin/Desktop/GAME/GAME-KNDMST';
const GLB_DIR = path.join(PROJECT_ROOT, 'blender/character_prototype/factory/outputs/hairstyles_glb');
const OUT_REPORT = path.join(PROJECT_ROOT, 'male_v15_runtime_validation.json');
const ARTIFACT_REPORT = 'C:/Users/Admin/.gemini/antigravity/brain/87b9cd6a-c34c-4a94-a366-03341960cd2e/male_v15_runtime_validation.json';

const REFINED_MALE = [
  { id: 'HAIR_001', name: 'Classic Bowl Cut (V15 Refined)', file: 'character_hair_001_v15.glb' },
  { id: 'HAIR_002', name: 'Sporty Short (V15 Refined)', file: 'character_hair_002_v15.glb' },
  { id: 'HAIR_004', name: 'Side-Parted Short (V15 Refined)', file: 'character_hair_004_v15.glb' }
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
          if (m && !hairMaterials.includes(m.name)) {
            hairMaterials.push(m.name);
          }
        }
      }

      if (node.name.toLowerCase().includes('head')) {
        headMeshFound = true;
      }
    }
  });

  const fileSizeKB = (fs.statSync(filePath).size / 1024).toFixed(1);
  const animCount = gltf.animations ? gltf.animations.length : 0;

  const pass = hairMeshFound && headBoneFound && headMeshFound && (totalTris < 20000) && (parseFloat(fileSizeKB) < 750);

  return {
    hairId,
    hairName,
    file: path.basename(filePath),
    fileSizeKB: parseFloat(fileSizeKB),
    totalTris,
    hairTris,
    hairVerts,
    hairMeshFound,
    headBoneFound,
    headMeshFound,
    hairMaterials,
    animationClipCount: animCount,
    budgetChecks: {
      trianglesUnder20k: totalTris < 20000,
      fileSizeUnder750KB: parseFloat(fileSizeKB) < 750,
      headBoneBound: headBoneFound,
      materialsAssigned: hairMaterials.length > 0
    },
    status: pass ? 'PASS' : 'FAIL'
  };
}

async function run() {
  console.log('=== RUNTIME THREE.JS WEBGL GLTF VALIDATION (MALE V15) ===\n');
  const results = [];

  for (const item of REFINED_MALE) {
    const fullPath = path.join(GLB_DIR, item.file);
    if (!fs.existsSync(fullPath)) {
      console.error(`[ERROR] Missing GLB: ${fullPath}`);
      results.push({ hairId: item.id, hairName: item.name, status: 'FILE_NOT_FOUND' });
      continue;
    }
    const res = await validateGlb(fullPath, item.id, item.name);
    results.push(res);
    console.log(`[${res.status}] ${res.hairId} (${res.hairName}):`);
    console.log(`  File size: ${res.fileSizeKB} KB | Total Tris: ${res.totalTris} | Hair Tris: ${res.hairTris} (${res.hairVerts} verts)`);
    console.log(`  Materials: ${res.hairMaterials.join(', ')} | Head Bone: ${res.headBoneFound ? 'YES' : 'NO'} | Animations: ${res.animationClipCount}`);
  }

  const allPass = results.every(r => r.status === 'PASS');
  const summary = {
    timestamp: new Date().toISOString(),
    overallStatus: allPass ? 'ALL_PASS' : 'FAILURES_DETECTED',
    testedCount: results.length,
    results
  };

  fs.writeFileSync(OUT_REPORT, JSON.stringify(summary, null, 2), 'utf-8');
  fs.writeFileSync(ARTIFACT_REPORT, JSON.stringify(summary, null, 2), 'utf-8');
  console.log(`\nValidation complete. Report written to:\n- ${OUT_REPORT}\n- ${ARTIFACT_REPORT}`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
