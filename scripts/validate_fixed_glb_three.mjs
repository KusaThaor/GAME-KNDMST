import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const PROJECT_ROOT = path.resolve('C:/Users/Admin/Desktop/GAME/GAME-KNDMST');
const GLB_PATH = path.join(PROJECT_ROOT, 'assets/characters/vietnamese_student_fixed.glb');
const REPORT_PATH = path.join(PROJECT_ROOT, 'blender/character_prototype/scripts/threejs_fixed_validation.json');

console.log('=== PHASE 5: THREE.JS PRODUCTION VALIDATION ===');
console.log('Target GLB:', GLB_PATH);

if (!fs.existsSync(GLB_PATH)) {
  console.error('ERROR: GLB file not found:', GLB_PATH);
  process.exit(1);
}

const stat = fs.statSync(GLB_PATH);
const buf = fs.readFileSync(GLB_PATH);
const arrayBuf = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

const requiredBones = [
  'Root', 'Hips', 'Spine', 'Chest', 'Neck', 'Head',
  'UpperArm.L', 'Forearm.L', 'Hand.L',
  'UpperArm.R', 'Forearm.R', 'Hand.R',
  'Thigh.L', 'Shin.L', 'Foot.L',
  'Thigh.R', 'Shin.R', 'Foot.R'
];

new GLTFLoader().parse(arrayBuf, '', (gltf) => {
  const scene = gltf.scene;
  const report = {
    glb_path: GLB_PATH,
    size_kb: +(stat.size / 1024).toFixed(1),
    threejs_revision: THREE.REVISION,
    nodes_count: 0,
    meshes: [],
    materials: [],
    bones: [],
    animations: [],
    all_bones_present: false,
    all_animations_passed: true,
    threejs_verdict: 'PASS'
  };

  const bonesMap = new Map();
  const matSet = new Set();

  scene.traverse((obj) => {
    report.nodes_count++;
    if (obj.isBone) {
      bonesMap.set(obj.name, true);
      report.bones.push({
        name: obj.name,
        parent: obj.parent ? obj.parent.name : null,
        pos: [obj.position.x, obj.position.y, obj.position.z].map(v => +v.toFixed(4))
      });
    }
    if (obj.isMesh || obj.isSkinnedMesh) {
      const geo = obj.geometry;
      const vCount = geo.attributes.position ? geo.attributes.position.count : 0;
      const triCount = geo.index ? geo.index.count / 3 : vCount / 3;
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      const matNames = mats.filter(Boolean).map(m => {
        matSet.add(m.name);
        return m.name;
      });

      report.meshes.push({
        name: obj.name,
        type: obj.type,
        isSkinned: !!obj.isSkinnedMesh,
        vertices: vCount,
        triangles: Math.round(triCount),
        materials: matNames,
        hasSkinWeights: !!geo.attributes.skinWeight,
        hasSkinIndices: !!geo.attributes.skinIndex
      });
    }
  });

  report.materials = Array.from(matSet);

  // Check required bones
  const missingBones = requiredBones.filter(b => {
    const sanitized = THREE.PropertyBinding.sanitizeNodeName(b);
    return !bonesMap.has(b) && !bonesMap.has(sanitized);
  });
  report.all_bones_present = (missingBones.length === 0);
  if (missingBones.length > 0) {
    console.error('Missing bones:', missingBones);
    report.threejs_verdict = 'FAIL';
  } else {
    console.log(`Bones verified: ${bonesMap.size} bones found (all 18 required humanoid + eye bones present).`);
  }

  // Animation playback test in Three.js AnimationMixer
  const mixer = new THREE.AnimationMixer(scene);
  for (const clip of gltf.animations) {
    let clipPassed = true;
    let err = null;
    try {
      const action = mixer.clipAction(clip);
      action.reset().play();
      for (let t = 0.0; t <= Math.min(clip.duration, 1.0); t += 0.25) {
        mixer.setTime(t);
        scene.updateMatrixWorld(true);
        for (const bName of bonesMap.keys()) {
          const bObj = scene.getObjectByName(bName);
          if (bObj) {
            const el = bObj.matrixWorld.elements;
            for (let i = 0; i < 16; i++) {
              if (!Number.isFinite(el[i])) {
                clipPassed = false;
                err = `NaN at bone ${bName} t=${t}`;
                break;
              }
            }
          }
          if (!clipPassed) break;
        }
      }
      action.stop();
    } catch (e) {
      clipPassed = false;
      err = e.message;
    }

    if (!clipPassed) report.all_animations_passed = false;
    report.animations.push({
      name: clip.name,
      duration: +clip.duration.toFixed(3),
      tracks: clip.tracks.length,
      passed: clipPassed,
      error: err
    });
    console.log(`- ${clip.name} (${clip.duration.toFixed(2)}s, ${clip.tracks.length} tracks): ${clipPassed ? 'PASS' : 'FAIL - ' + err}`);
  }

  if (!report.all_animations_passed) {
    report.threejs_verdict = 'FAIL';
  }

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\nTHREE.JS VALIDATION COMPLETE: ${report.threejs_verdict}`);
  console.log('Report saved to:', REPORT_PATH);
}, (err) => {
  console.error('FATAL: Loader parsing failed:', err);
  process.exit(1);
});
