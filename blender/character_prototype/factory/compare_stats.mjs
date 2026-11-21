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
  let hairMeshName = '';
  let matInfo = [];
  let meshes = [];
  gltf.scene.traverse((node) => {
    if (node.isMesh || node.isSkinnedMesh) {
      const geom = node.geometry;
      const count = geom.index ? geom.index.count / 3 : geom.attributes.position.count / 3;
      totalTris += count;
      meshes.push({ name: node.name, tris: count });
      if (node.name.toLowerCase().includes('hair')) {
        hairMeshName = node.name;
        hairTris += count;
        hairVerts += geom.attributes.position.count;
        const mats = Array.isArray(node.material) ? node.material : [node.material];
        matInfo = mats.map(m => ({ name: m.name, roughness: m.roughness, metalness: m.metalness, color: '#' + m.color.getHexString() }));
      }
    }
  });
  return {
    meshes,
    hairMeshName,
    hairTris,
    hairVerts,
    totalTris,
    matInfo,
    anims: gltf.animations.length,
    sizeKB: (fs.statSync(filePath).size / 1024).toFixed(1)
  };
}

async function run() {
  const pairs = [
    {
      id: 'HAIR_001',
      name: 'Classic Bowl Cut',
      v2: path.join(PROJECT_ROOT, 'blender/character_prototype/factory/outputs/hairstyles_glb/character_hair_001.glb'),
      v8: path.join(PROJECT_ROOT, 'blender/character_prototype/factory/previews/pilot_v8/character_hair_001_v8.glb')
    },
    {
      id: 'HAIR_004',
      name: 'Side-Parted Short',
      v2: path.join(PROJECT_ROOT, 'blender/character_prototype/factory/outputs/hairstyles_glb/character_hair_004.glb'),
      v8: path.join(PROJECT_ROOT, 'blender/character_prototype/factory/previews/pilot_v8/character_hair_004_v8.glb')
    },
    {
      id: 'HAIR_008',
      name: 'Twin Pigtails',
      v2: path.join(PROJECT_ROOT, 'blender/character_prototype/factory/outputs/hairstyles_glb/character_hair_008.glb'),
      v8: path.join(PROJECT_ROOT, 'blender/character_prototype/factory/previews/pilot_v8/character_hair_008_v8.glb')
    }
  ];

  const report = {};
  for (const p of pairs) {
    const r2 = await analyze(p.v2);
    const r8 = await analyze(p.v8);
    report[p.id] = { name: p.name, v2: r2, v8: r8 };
    console.log(`=== ${p.id} (${p.name}) ===`);
    console.log(`  V2 (Old): Hair Tris=${r2.hairTris}, Total Tris=${r2.totalTris}, Size=${r2.sizeKB} KB, Roughness=${r2.matInfo[0]?.roughness}`);
    console.log(`  V8 (New): Hair Tris=${r8.hairTris}, Total Tris=${r8.totalTris}, Size=${r8.sizeKB} KB, Roughness=${r8.matInfo[0]?.roughness}, Anims=${r8.anims}`);
    if (p.id === 'HAIR_008') {
      console.log('  V8 Meshes:', r8.meshes);
    }
  }

  fs.writeFileSync(
    path.join(PROJECT_ROOT, 'blender/character_prototype/factory/previews/pilot_v8/pilot_glb_comparison.json'),
    JSON.stringify(report, null, 2)
  );
  console.log('Saved comparison report to pilot_glb_comparison.json');
}

run();
