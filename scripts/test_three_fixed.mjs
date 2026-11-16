import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const glbPath = 'C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/test_variants/test_export_apply.glb';
const buf = fs.readFileSync(glbPath);
const arrayBuf = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

new GLTFLoader().parse(arrayBuf, '', (gltf) => {
  console.log('Successfully parsed GLB in Three.js!');
  console.log('Scene children count:', gltf.scene.children.length);
  console.log('Animations count:', gltf.animations.length);
  const mixer = new THREE.AnimationMixer(gltf.scene);
  for (const clip of gltf.animations) {
    const act = mixer.clipAction(clip);
    act.play();
    mixer.setTime(0.5);
    gltf.scene.updateMatrixWorld(true);
    act.stop();
  }
  console.log('All animations evaluated cleanly in Three.js AnimationMixer!');
}, (err) => {
  console.error('Three.js Error:', err);
});
