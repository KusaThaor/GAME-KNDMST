import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const GLB_PATH = 'C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/outputs/hairstyles_glb/character_hair_003_v17.glb';
const ARTIFACT_REPORT = 'C:/Users/Admin/.gemini/antigravity/brain/87b9cd6a-c34c-4a94-a366-03341960cd2e/bob_v17_runtime_validation.json';

async function validate() {
  const buf = fs.readFileSync(GLB_PATH);
  const arrayBuf = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

  new GLTFLoader().parse(arrayBuf, '', (gltf) => {
    let totalTris = 0;
    let hairTris = 0;
    let hairVerts = 0;
    let hairMeshFound = false;
    let headBoneFound = false;
    let headMeshFound = false;
    const meshNames = [];
    const eyeMeshNames = [];
    let glassesFound = false;

    gltf.scene.traverse((node) => {
      if (node.isBone && node.name === 'Head') headBoneFound = true;
      if (node.isMesh || node.isSkinnedMesh) {
        meshNames.push(node.name);
        if (node.name.toLowerCase().includes('glass')) {
          glassesFound = true;
        }
        if (node.name.toLowerCase().includes('eye')) {
          eyeMeshNames.push(node.name);
        }
        const geom = node.geometry;
        const count = geom.index ? geom.index.count / 3 : geom.attributes.position.count / 3;
        totalTris += count;
        if (node.name.toLowerCase().includes('hair')) {
          hairMeshFound = true;
          hairTris += count;
          hairVerts += geom.attributes.position.count;
        }
        if (node.name.toLowerCase().includes('head')) {
          headMeshFound = true;
        }
      }
    });

    const sizeKB = (buf.length / 1024).toFixed(1);
    const pass = hairMeshFound && headBoneFound && headMeshFound && !glassesFound && totalTris < 20000 && parseFloat(sizeKB) < 750;

    const report = {
      assetId: 'HAIR_003',
      name: 'Chin-Length Rounded Bob (V17 Architectural Rebuild)',
      file: path.basename(GLB_PATH),
      fileSizeKB: parseFloat(sizeKB),
      totalTriangles: totalTris,
      hairTriangles: hairTris,
      hairVertices: hairVerts,
      headBoneBound: headBoneFound,
      glassesDetected: glassesFound,
      eyeMeshes: eyeMeshNames,
      allMeshes: meshNames,
      animationClipCount: gltf.animations.length,
      budgetChecks: {
        trianglesUnder20k: totalTris < 20000,
        fileSizeUnder750KB: parseFloat(sizeKB) < 750,
        headBoneBound: headBoneFound,
        zeroGlassesArtifacts: !glassesFound
      },
      status: pass ? 'PASS' : 'FAIL'
    };

    console.log('=== THREE.JS VALIDATION FOR BOB V17 ===');
    console.log(JSON.stringify(report, null, 2));
    fs.writeFileSync(ARTIFACT_REPORT, JSON.stringify(report, null, 2), 'utf-8');
  });
}

validate().catch(console.error);
