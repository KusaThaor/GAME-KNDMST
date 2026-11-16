import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

describe('Skinned Character Rig & GLB Validation (Option B)', () => {
  const glbPath = path.resolve(__dirname, '../../assets/characters/vietnamese_student_skinned.glb');

  it('GLB file should exist and be within lightweight web budget (< 600 KB)', () => {
    expect(fs.existsSync(glbPath)).toBe(true);
    const stats = fs.statSync(glbPath);
    const kb = stats.size / 1024;
    expect(kb).toBeLessThan(600);
    expect(kb).toBeGreaterThan(100);
  });

  it('GLB should load in Three.js and contain the standard humanoid bone hierarchy', async () => {
    const buffer = fs.readFileSync(glbPath);
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

    const loader = new GLTFLoader();
    const gltf = await new Promise<any>((resolve, reject) => {
      loader.parse(arrayBuffer, '', resolve, reject);
    });

    expect(gltf).toBeDefined();
    expect(gltf.scene).toBeDefined();

    const bonesFound = new Set<string>();
    gltf.scene.traverse((obj: THREE.Object3D) => {
      if ((obj as THREE.Bone).isBone) {
        bonesFound.add(obj.name);
      }
    });

    const expectedBones = [
      'Root', 'Hips', 'Spine', 'Chest', 'Neck', 'Head',
      'UpperArmL', 'ForearmL', 'HandL',
      'UpperArmR', 'ForearmR', 'HandR',
      'ThighL', 'ShinL', 'FootL',
      'ThighR', 'ShinR', 'FootR'
    ];

    for (const b of expectedBones) {
      expect(bonesFound.has(b)).toBe(true);
    }
  });

  it('GLB should contain all 16 narrative actions and update cleanly in AnimationMixer', async () => {
    const buffer = fs.readFileSync(glbPath);
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

    const loader = new GLTFLoader();
    const gltf = await new Promise<any>((resolve, reject) => {
      loader.parse(arrayBuffer, '', resolve, reject);
    });

    expect(gltf.animations.length).toBe(16);

    const mixer = new THREE.AnimationMixer(gltf.scene);
    for (const clip of gltf.animations) {
      const action = mixer.clipAction(clip);
      expect(action).toBeDefined();
      action.play();
    }

    // Step mixer
    expect(() => {
      mixer.update(0.1);
      gltf.scene.updateMatrixWorld(true);
    }).not.toThrow();
  });
});
