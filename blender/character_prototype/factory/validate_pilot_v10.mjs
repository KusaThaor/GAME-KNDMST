import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const PROJECT_ROOT = 'C:/Users/Admin/Desktop/GAME/GAME-KNDMST';

async function loadGlb(filePath) {
  const buf = fs.readFileSync(filePath);
  const arrayBuf = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  return new Promise((resolve, reject) => {
    new GLTFLoader().parse(arrayBuf, '', resolve, reject);
  });
}

async function analyze(filePath) {
  const gltf = await loadGlb(filePath);
  let totalTris = 0;
  let hairTris = 0;
  let hairVerts = 0;
  let hairMeshNames = [];
  let matInfo = [];
  let headBoneFound = false;
  let headMeshFound = false;
  let morphTargets = 0;

  gltf.scene.traverse((node) => {
    if (node.isBone && node.name === 'Head') headBoneFound = true;
    if (node.isMesh || node.isSkinnedMesh) {
      const geom = node.geometry;
      const count = geom.index ? geom.index.count / 3 : geom.attributes.position.count / 3;
      totalTris += count;
      if (node.name.toLowerCase().includes('hair') || node.material?.name?.toLowerCase().includes('hair')) {
        hairMeshNames.push(node.name);
        hairTris += count;
        hairVerts += geom.attributes.position.count;
        const mats = Array.isArray(node.material) ? node.material : [node.material];
        for (const m of mats) {
          if (m && !matInfo.some(x => x.name === m.name)) {
            matInfo.push({
              name: m.name,
              roughness: m.roughness,
              metalness: m.metalness,
              color: '#' + m.color.getHexString()
            });
          }
        }
      }
      if (node.name === 'Body_Head') {
        headMeshFound = true;
        if (node.morphTargetDictionary) {
          morphTargets = Object.keys(node.morphTargetDictionary).length;
        }
      }
    }
  });

  return {
    hairMeshNames,
    hairTris,
    hairVerts,
    totalTris,
    matInfo,
    headBoneFound,
    headMeshFound,
    morphTargets,
    animations: gltf.animations.length,
    sizeKB: (fs.statSync(filePath).size / 1024).toFixed(1)
  };
}

async function run() {
  const pairs = [
    {
      id: 'HAIR_001',
      name: 'Classic Bowl Cut',
      v2: path.join(PROJECT_ROOT, 'blender/character_prototype/factory/outputs/hairstyles_glb/character_hair_001.glb'),
      v10: path.join(PROJECT_ROOT, 'blender/character_prototype/factory/previews/pilot_v10/character_hair_001_v10.glb')
    },
    {
      id: 'HAIR_004',
      name: 'Side-Parted Short',
      v2: path.join(PROJECT_ROOT, 'blender/character_prototype/factory/outputs/hairstyles_glb/character_hair_004.glb'),
      v10: path.join(PROJECT_ROOT, 'blender/character_prototype/factory/previews/pilot_v10/character_hair_004_v10.glb')
    },
    {
      id: 'HAIR_008',
      name: 'Twin Pigtails',
      v2: path.join(PROJECT_ROOT, 'blender/character_prototype/factory/outputs/hairstyles_glb/character_hair_008.glb'),
      v10: path.join(PROJECT_ROOT, 'blender/character_prototype/factory/previews/pilot_v10/character_hair_008_v10.glb')
    }
  ];

  const results = {};
  for (const p of pairs) {
    const r2 = await analyze(p.v2);
    const r10 = await analyze(p.v10);
    results[p.id] = { name: p.name, v2: r2, v10: r10 };
    console.log(`=== ${p.id} (${p.name}) ===`);
    console.log(`  V2 (Old): Hair Tris=${r2.hairTris}, Total Tris=${r2.totalTris}, Size=${r2.sizeKB} KB, Roughness=${r2.matInfo[0]?.roughness?.toFixed(2)}`);
    console.log(`  V10 (New): Hair Tris=${r10.hairTris}, Total Tris=${r10.totalTris}, Size=${r10.sizeKB} KB, Roughness=${r10.matInfo[0]?.roughness?.toFixed(2)}, Anims=${r10.animations}, HeadBone=${r10.headBoneFound}`);
  }

  const outReport = path.join(PROJECT_ROOT, 'blender/character_prototype/factory/previews/pilot_v10/pilot_v10_validation_report.json');
  fs.writeFileSync(outReport, JSON.stringify(results, null, 2));
  console.log(`Saved validation report: ${outReport}`);
}

run();
