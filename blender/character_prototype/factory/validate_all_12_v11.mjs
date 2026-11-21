import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const PROJECT_ROOT = 'C:/Users/Admin/Desktop/GAME/GAME-KNDMST';
const GLB_DIR = path.join(PROJECT_ROOT, 'blender/character_prototype/factory/outputs/hairstyles_glb');
const OUT_REPORT = path.join(PROJECT_ROOT, 'blender/character_prototype/factory/previews/all_12_v11/v11_all_12_validation_report.json');

const HAIRSTYLES = [
  { id: 'HAIR_001', name: 'Classic Bowl Cut' },
  { id: 'HAIR_002', name: 'Sporty Short' },
  { id: 'HAIR_003', name: 'Rounded Bob' },
  { id: 'HAIR_004', name: 'Side-Parted Short' },
  { id: 'HAIR_005', name: 'Medium Straight' },
  { id: 'HAIR_006', name: 'Low Ponytail' },
  { id: 'HAIR_007', name: 'High Ponytail' },
  { id: 'HAIR_008', name: 'Twin Pigtails' },
  { id: 'HAIR_009', name: 'Braided Hair' },
  { id: 'HAIR_010', name: 'Shoulder-Length Hair' },
  { id: 'HAIR_011', name: 'Side-Swept Bangs' },
  { id: 'HAIR_012', name: 'Messy Short Hair' }
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

  const passes = hairMeshFound && headBoneFound && hairTris > 0 && totalTris < 25000 && parseFloat(fileSizeKb) < 800;

  return {
    hair_id: hairId,
    name: hairName,
    glb_file: path.basename(filePath),
    file_size_kb: fileSizeKb,
    total_triangles: Math.round(totalTris),
    hair_triangles: Math.round(hairTris),
    hair_vertices: Math.round(hairVerts),
    head_bone_bound: headBoneFound,
    head_mesh_present: headMeshFound,
    animations_count: animCount,
    hair_materials: hairMaterials,
    status: passes ? 'PASS' : 'FAIL'
  };
}

async function main() {
  console.log('=== RUNTIME THREE.JS VALIDATION: ALL 12 HAIRSTYLES V11 ===');
  const report = {};
  let allPass = true;

  for (const h of HAIRSTYLES) {
    const glbFile = path.join(GLB_DIR, `character_${h.id.toLowerCase()}_v11.glb`);
    if (!fs.existsSync(glbFile)) {
      console.error(`[MISSING] ${glbFile}`);
      report[h.id] = { status: 'MISSING_FILE' };
      allPass = false;
      continue;
    }

    try {
      const res = await validateGlb(glbFile, h.id, h.name);
      report[h.id] = res;
      console.log(`[${res.status}] ${h.id} (${h.name}): ${res.total_triangles} total tris (${res.hair_triangles} hair), ${res.file_size_kb} KB, Anim: ${res.animations_count}, Head Bone: ${res.head_bone_bound}`);
      if (res.status !== 'PASS') allPass = false;
    } catch (err) {
      console.error(`[ERROR] ${h.id}:`, err.message);
      report[h.id] = { status: 'ERROR', error: err.message };
      allPass = false;
    }
  }

  fs.writeFileSync(OUT_REPORT, JSON.stringify(report, null, 2));
  console.log(`Report written to ${OUT_REPORT}`);
  console.log(`OVERALL RESULT: ${allPass ? 'ALL 12 PASSED' : 'SOME FAILED'}`);
}

main().catch(console.error);
