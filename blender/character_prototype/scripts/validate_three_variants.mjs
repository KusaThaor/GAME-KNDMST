import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const PROJECT_ROOT = path.resolve('C:/Users/Admin/Desktop/GAME/GAME-KNDMST');
const REPORT_PATH = path.join(PROJECT_ROOT, 'blender/character_prototype/test_variants/threejs_audit_variants_report.json');

const filesToTest = [
  { name: 'Base Canonical', path: path.join(PROJECT_ROOT, 'assets/characters/vietnamese_student_base.glb') },
  { name: 'Height 90% (Freshman)', path: path.join(PROJECT_ROOT, 'blender/character_prototype/test_variants/student_height_90.glb') },
  { name: 'Height 100% (Standard)', path: path.join(PROJECT_ROOT, 'blender/character_prototype/test_variants/student_height_100.glb') },
  { name: 'Height 110% (Senior)', path: path.join(PROJECT_ROOT, 'blender/character_prototype/test_variants/student_height_110.glb') },
  { name: 'Hairstyle Spiky', path: path.join(PROJECT_ROOT, 'blender/character_prototype/test_variants/student_hair_spiky.glb') },
  { name: 'Hairstyle Bob', path: path.join(PROJECT_ROOT, 'blender/character_prototype/test_variants/student_hair_bob.glb') },
  { name: 'Outfit Red Scarf', path: path.join(PROJECT_ROOT, 'blender/character_prototype/test_variants/student_outfit_scarf.glb') },
  { name: 'Outfit PE Sports', path: path.join(PROJECT_ROOT, 'blender/character_prototype/test_variants/student_outfit_pe.glb') }
];

const requiredBones = [
  'Root', 'Hips', 'Spine', 'Chest', 'Neck', 'Head',
  'UpperArm.L', 'Forearm.L', 'Hand.L',
  'UpperArm.R', 'Forearm.R', 'Hand.R',
  'Thigh.L', 'Shin.L', 'Foot.L',
  'Thigh.R', 'Shin.R', 'Foot.R'
];

async function validateGlb(item) {
  return new Promise((resolve) => {
    if (!fs.existsSync(item.path)) {
      resolve({ name: item.name, file: item.path, status: 'FILE_NOT_FOUND', passed: false });
      return;
    }

    const stat = fs.statSync(item.path);
    const buffer = fs.readFileSync(item.path);
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

    const loader = new GLTFLoader();
    loader.parse(arrayBuffer, '', (gltf) => {
      const scene = gltf.scene;
      const bonesFound = new Map();
      let totalVerts = 0;
      let skinnedMeshesCount = 0;

      scene.traverse((obj) => {
        if (obj.isBone) {
          bonesFound.set(obj.name, true);
        }
        if (obj.isMesh || obj.isSkinnedMesh) {
          const geo = obj.geometry;
          if (geo.attributes.position) totalVerts += geo.attributes.position.count;
          if (obj.isSkinnedMesh) skinnedMeshesCount++;
        }
      });

      // Check required bones
      const missingBones = requiredBones.filter(b => {
        const sanitized = THREE.PropertyBinding.sanitizeNodeName(b);
        return !bonesFound.has(b) && !bonesFound.has(sanitized);
      });

      // Test animation playback in Three.js AnimationMixer
      const mixer = new THREE.AnimationMixer(scene);
      const clipsTested = [];
      let animPassed = true;

      for (const clip of gltf.animations) {
        let clipOk = true;
        let err = null;
        try {
          const action = mixer.clipAction(clip);
          action.reset().play();
          for (let t = 0.0; t <= Math.min(clip.duration, 1.0); t += 0.25) {
            mixer.setTime(t);
            scene.updateMatrixWorld(true);
            for (const bName of bonesFound.keys()) {
              const bObj = scene.getObjectByName(bName);
              if (bObj) {
                const el = bObj.matrixWorld.elements;
                for (let i = 0; i < 16; i++) {
                  if (!Number.isFinite(el[i])) {
                    clipOk = false;
                    err = `NaN at bone ${bName} t=${t}`;
                    break;
                  }
                }
              }
              if (!clipOk) break;
            }
          }
          action.stop();
        } catch (e) {
          clipOk = false;
          err = e.message;
        }

        if (!clipOk) animPassed = false;
        clipsTested.push({ name: clip.name, duration: +clip.duration.toFixed(2), tracks: clip.tracks.length, ok: clipOk, error: err });
      }

      // Check key actions
      const clipNames = gltf.animations.map(a => a.name);
      const hasIdle = clipNames.includes('Action_Idle');
      const hasWalk = clipNames.includes('Action_Walk');
      const hasSit = clipNames.includes('Action_Sit');

      const passed = missingBones.length === 0 && animPassed && hasIdle && hasWalk && hasSit;

      resolve({
        name: item.name,
        file: item.path,
        size_kb: +(stat.size / 1024).toFixed(1),
        bones_count: bonesFound.size,
        missing_bones: missingBones,
        total_verts: totalVerts,
        skinned_meshes: skinnedMeshesCount,
        animations_count: gltf.animations.length,
        has_idle_walk_sit: hasIdle && hasWalk && hasSit,
        anim_playback_passed: animPassed,
        overall_passed: passed
      });
    }, (err) => {
      resolve({ name: item.name, file: item.path, status: 'PARSE_ERROR', error: err.message, overall_passed: false });
    });
  });
}

async function run() {
  console.log('=== STARTING THREE.JS PRODUCTION VALIDATION FOR ALL ASSET VARIANTS ===\n');
  const results = [];
  for (const item of filesToTest) {
    const res = await validateGlb(item);
    results.push(res);
    console.log(`[${res.overall_passed ? 'PASS' : 'FAIL'}] ${res.name.padEnd(25)} | Size: ${res.size_kb} KB | Bones: ${res.bones_count} | Meshes: ${res.skinned_meshes} | Anims: ${res.animations_count} | Idle/Walk/Sit: ${res.has_idle_walk_sit ? 'YES' : 'NO'}`);
    if (res.missing_bones && res.missing_bones.length > 0) {
      console.log(`    Missing bones: ${res.missing_bones.join(', ')}`);
    }
  }

  const allPassed = results.every(r => r.overall_passed);
  console.log(`\n==================================================`);
  console.log(`OVERALL THREE.JS AUDIT STATUS: ${allPassed ? '100% ALL VARIANTS PASSED' : 'SOME VARIANTS FAILED'}`);
  console.log(`==================================================\n`);

  fs.writeFileSync(REPORT_PATH, JSON.stringify({ timestamp: new Date().toISOString(), all_passed: allPassed, results }, null, 2), 'utf-8');
  console.log(`Audit report written to: ${REPORT_PATH}`);
}

run();
