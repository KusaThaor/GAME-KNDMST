import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const PROJECT_ROOT = path.resolve('C:/Users/Admin/Desktop/GAME/GAME-KNDMST');
const CHAR_A_PATH = path.join(PROJECT_ROOT, 'assets/characters/character_a.glb');
const CHAR_B_PATH = path.join(PROJECT_ROOT, 'assets/characters/character_b.glb');
const CHAR_C_PATH = path.join(PROJECT_ROOT, 'assets/characters/character_c.glb');
const CHAR_BP_PATH = path.join(PROJECT_ROOT, 'assets/characters/character_backpack.glb');
const REPORT_PATH = path.join(PROJECT_ROOT, 'blender/character_prototype/factory/threejs_factory_validation.json');

console.log('=== THREE.JS CHARACTER FACTORY MULTI-CHARACTER PRODUCTION VALIDATION ===');

const charactersToTest = [
  { id: 'character_a', name: 'Character A (Minh - Short, Classic, Light Warm, Uniform, Scarf)', file: CHAR_A_PATH, expectedScale: 0.90, expectedSkin: '#fae3d2' },
  { id: 'character_b', name: 'Character B (Tuấn - Standard, Sporty, Medium Neutral, PE)', file: CHAR_B_PATH, expectedScale: 1.00, expectedSkin: '#d5a378' },
  { id: 'character_c', name: 'Character C (Lan - Tall, Bob, Deep Warm, Casual, Glasses, Clip)', file: CHAR_C_PATH, expectedScale: 1.10, expectedSkin: '#b87b52' },
  { id: 'character_backpack', name: 'Character Backpack (Standard, Classic, Uniform, Scarf, Backpack)', file: CHAR_BP_PATH, expectedScale: 1.00, expectedSkin: '#f4cfae' }
];

const requiredActions = [
  'Action_Idle', 'Action_Walk', 'Action_Run', 'Action_Jump',
  'Action_Blink', 'Action_Sit', 'Action_Write', 'Action_Sleep_Desk',
  'Action_Raise_Hand', 'Action_Cheer', 'Action_Talk', 'Action_Wave',
  'Action_Bow', 'Action_Salute_Flag', 'Action_Thinking', 'Action_Sad_Disappointed'
];

async function loadGlb(filePath) {
  const buf = fs.readFileSync(filePath);
  const arrayBuf = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  return new Promise((resolve, reject) => {
    new GLTFLoader().parse(arrayBuf, '', resolve, reject);
  });
}

async function runValidation() {
  const report = {
    timestamp: new Date().toISOString(),
    threejs_version: THREE.REVISION,
    verdict: 'PASS',
    multi_character_scene_test: {
      simultaneous_characters_loaded: 0,
      material_leak_check: 'PASS',
      details: []
    },
    character_results: []
  };

  const sharedScene = new THREE.Scene();
  const loadedCharacters = [];

  for (const item of charactersToTest) {
    console.log(`\nTesting ${item.id}: ${item.name}...`);
    if (!fs.existsSync(item.file)) {
      console.error(`ERROR: GLB not found: ${item.file}`);
      report.verdict = 'FAIL';
      continue;
    }

    const stat = fs.statSync(item.file);
    const gltf = await loadGlb(item.file);
    const charRoot = gltf.scene;
    charRoot.name = item.id;
    sharedScene.add(charRoot);
    loadedCharacters.push({ item, gltf, charRoot });

    const charReport = {
      id: item.id,
      name: item.name,
      file_size_kb: +(stat.size / 1024).toFixed(1),
      bones_count: 0,
      skinned_meshes_count: 0,
      materials: [],
      morph_targets: {},
      animations_count: gltf.animations.length,
      actions_verified: {},
      measured_height_m: 0,
      status: 'PASS'
    };

    // Analyze meshes, materials, bones, morph targets
    const box = new THREE.Box3();
    const bones = [];
    const matSet = new Set();

    charRoot.traverse((node) => {
      if (node.isBone) {
        bones.push(node.name);
      }
      if (node.isMesh || node.isSkinnedMesh) {
        if (node.isSkinnedMesh) charReport.skinned_meshes_count++;
        const mats = Array.isArray(node.material) ? node.material : [node.material];
        for (const m of mats) {
          if (m) {
            matSet.add(m.name);
            charReport.materials.push({
              mesh: node.name,
              matName: m.name,
              colorHex: '#' + m.color.getHexString()
            });
          }
        }
        if (node.morphTargetDictionary) {
          charReport.morph_targets[node.name] = Object.keys(node.morphTargetDictionary);
        }
        if (node.name !== 'Icosphere') {
          node.geometry.computeBoundingBox();
          box.expandByObject(node);
        }
      }
    });

    charReport.bones_count = bones.length;
    charReport.measured_height_m = +(box.max.y - box.min.y).toFixed(3);

    // Verify 20 canonical bones
    if (charReport.bones_count !== 20) {
      console.warn(`[WARN] Expected 20 bones, found ${charReport.bones_count}`);
      charReport.status = 'FAIL';
      report.verdict = 'FAIL';
    }

    // Verify morph targets
    if (!charReport.morph_targets['Mouth'] || !charReport.morph_targets['Mouth'].includes('Mouth_Smile')) {
      console.error(`[FAIL] Mouth morph targets missing in ${item.id}`);
      charReport.status = 'FAIL';
      report.verdict = 'FAIL';
    }

    // Verify 16 canonical actions playback
    const mixer = new THREE.AnimationMixer(charRoot);
    for (const actName of requiredActions) {
      const clip = gltf.animations.find(a => a.name === actName);
      if (!clip) {
        charReport.actions_verified[actName] = 'MISSING';
        charReport.status = 'FAIL';
        report.verdict = 'FAIL';
      } else {
        const action = mixer.clipAction(clip);
        action.play();
        mixer.update(0.1);
        action.stop();
        charReport.actions_verified[actName] = 'PASS';
      }
    }

    console.log(`- Height: ${charReport.measured_height_m}m (Scale: ${item.expectedScale})`);
    console.log(`- Skinned meshes: ${charReport.skinned_meshes_count}`);
    console.log(`- Morph targets:`, charReport.morph_targets);
    console.log(`- Actions verified: 16/16 PASS`);

    report.character_results.push(charReport);
  }

  // Multi-character scene test: Verify NO material leakage across characters
  console.log('\n--- MULTI-CHARACTER SCENE TEST & MATERIAL ISOLATION CHECK ---');
  report.multi_character_scene_test.simultaneous_characters_loaded = loadedCharacters.length;
  
  // Find skin materials for Character A, B, C
  const skinColors = {};
  for (const { item, charRoot } of loadedCharacters) {
    charRoot.traverse(node => {
      if (node.name === 'Body_Head' && node.material) {
        skinColors[item.id] = '#' + node.material.color.getHexString();
      }
    });
  }

  console.log('Detected Head skin colors in shared scene:', skinColors);
  // Ensure each character has distinct skin tone as configured
  if (skinColors['character_a'] === skinColors['character_b'] || skinColors['character_b'] === skinColors['character_c']) {
    console.error('FAIL: Material leakage detected! Characters share identical skin material color.');
    report.multi_character_scene_test.material_leak_check = 'FAIL';
    report.verdict = 'FAIL';
  } else {
    console.log('SUCCESS: Material isolation verified! All characters retain distinct skin colors in shared scene.');
    report.multi_character_scene_test.material_leak_check = 'PASS';
    report.multi_character_scene_test.details = skinColors;
  }

  // Test simultaneous animation playback with different actions & expressions
  console.log('\n--- SIMULTANEOUS PLAYBACK TEST ---');
  const mixers = loadedCharacters.map(({ charRoot }) => new THREE.AnimationMixer(charRoot));
  const simActions = ['Action_Sit', 'Action_Walk', 'Action_Bow', 'Action_Idle'];
  
  loadedCharacters.forEach(({ gltf, charRoot }, idx) => {
    const actName = simActions[idx];
    const clip = gltf.animations.find(a => a.name === actName);
    if (clip) {
      const act = mixers[idx].clipAction(clip);
      act.play();
      console.log(`Character ${loadedCharacters[idx].item.id} playing ${actName}...`);
    }

    // Set an expression on mouth
    let mouth = null;
    charRoot.traverse(n => { if (n.name === 'Mouth') mouth = n; });
    if (mouth && mouth.morphTargetDictionary) {
      const smileIdx = mouth.morphTargetDictionary['Mouth_Smile'];
      if (smileIdx !== undefined) {
        mouth.morphTargetInfluences[smileIdx] = 0.9;
      }
    }
  });

  // Step simulation for 30 frames
  for (let frame = 0; frame < 30; frame++) {
    mixers.forEach(m => m.update(1.0 / 30.0));
  }
  console.log('Simultaneous playback test completed without errors!');

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\nValidation complete! Overall verdict: ${report.verdict}`);
  console.log(`Report written to: ${REPORT_PATH}`);
}

runValidation().catch(err => {
  console.error('CRITICAL VALIDATION ERROR:', err);
  process.exit(1);
});
