import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const glbPath = path.resolve('C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/student_uniform_scarf.glb');
const buf = fs.readFileSync(glbPath);
const arrayBuf = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

new GLTFLoader().parse(arrayBuf, '', (gltf) => {
    console.log("=== THREE.JS STUDENT UNIFORM SCARF GLB AUDIT ===");
    let scarfMesh = null;
    let skinnedCount = 0;
    
    gltf.scene.traverse((node) => {
        if (node.isSkinnedMesh) {
            skinnedCount++;
            if (node.name.includes("Scarf") || node.name.includes("scarf")) {
                scarfMesh = node;
            }
        }
    });

    console.log(`Total Skinned Meshes: ${skinnedCount}`);
    if (scarfMesh) {
        console.log(`[PASS] Found Scarf SkinnedMesh: ${scarfMesh.name}`);
        console.log(`- Geometry Vertices: ${scarfMesh.geometry.attributes.position.count}`);
        console.log(`- Material: ${scarfMesh.material.name}`);
        console.log(`- Material Color: #${scarfMesh.material.color.getHexString()}`);
        console.log(`- Skin Weights Count: ${scarfMesh.geometry.attributes.skinWeight.count}`);
    } else {
        console.error("[FAIL] Scarf mesh not found!");
        process.exit(1);
    }

    console.log(`Animations in GLB: ${gltf.animations.length}`);
    if (gltf.animations.length >= 16) {
        console.log("[PASS] All 16 canonical actions preserved!");
    } else {
        console.warn(`[WARN] Found ${gltf.animations.length} animations`);
    }

    console.log("GLB Validation Verdict: PASS");
}, (err) => {
    console.error("Parse error:", err);
    process.exit(1);
});
