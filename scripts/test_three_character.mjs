import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

console.log('THREE revision:', THREE.REVISION);
const glbPath = path.resolve('assets/characters/vietnamese_student_skinned.glb');
const buffer = fs.readFileSync(glbPath);
const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

const loader = new GLTFLoader();
loader.parse(
  arrayBuffer,
  '',
  (gltf) => {
    console.log('GLTF loaded successfully via Three.js!');
    console.log('Scene children count:', gltf.scene.children.length);
    console.log('Animations count:', gltf.animations.length);

    // Test AnimationMixer
    const mixer = new THREE.AnimationMixer(gltf.scene);
    let actionsCount = 0;
    for (const clip of gltf.animations) {
      const action = mixer.clipAction(clip);
      action.play();
      actionsCount++;
    }
    mixer.update(0.1);
    console.log(`Verified ${actionsCount} animations in AnimationMixer! Tick 0.1s executed without error.`);

    // Find SkinnedMeshes and Skeleton
    let skinnedCount = 0;
    let totalBones = 0;
    gltf.scene.traverse((child) => {
      if (child.isSkinnedMesh) {
        skinnedCount++;
        if (child.skeleton) {
          totalBones = Math.max(totalBones, child.skeleton.bones.length);
        }
      }
    });
    console.log(`SkinnedMeshes found: ${skinnedCount}, Skeleton bones: ${totalBones}`);
  },
  (err) => {
    console.error('GLTF loading error:', err);
  }
);
