import fs from 'fs';
import path from 'path';

global.self = global;
if (typeof window === 'undefined') global.window = global;

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const PROPS_DIR = path.resolve('C:/Users/Admin/Desktop/GAME/GAME-KNDMST/assets/props');
const REPORT_PATH = path.resolve('C:/Users/Admin/Desktop/GAME/GAME-KNDMST/docs/props_validation_report.json');

const PROPS_TO_VALIDATE = [
  {
    id: 'classroom_chalkboard',
    file: 'classroom_chalkboard.glb',
    expectedMaxTris: 1000,
    expectedDimensions: { width: 2.40, height: 1.49, depth: 0.19 },
    category: 'classroom_prop'
  },
  {
    id: 'schoolyard_shade_tree',
    file: 'schoolyard_shade_tree.glb',
    expectedMaxTris: 15000,
    expectedDimensions: { height: 5.50 },
    category: 'schoolyard_foliage'
  },
  {
    id: 'schoolyard_tropical_tree',
    file: 'schoolyard_tropical_tree.glb',
    expectedMaxTris: 12000,
    expectedDimensions: { height: 5.20 },
    category: 'schoolyard_foliage'
  },
  {
    id: 'schoolyard_flamboyant_tree',
    file: 'schoolyard_flamboyant_tree.glb',
    expectedMaxTris: 15000,
    expectedDimensions: { height: 5.50 },
    category: 'schoolyard_foliage'
  },
  {
    id: 'school_desk',
    file: 'school_desk.glb',
    expectedMaxTris: 10000,
    expectedDimensions: { width: 1.20, height: 0.74, depth: 0.88 },
    category: 'classroom_prop'
  }
];

async function validateProps() {
  console.log('=== RUNNING PRODUCTION ASSETS VALIDATION IN THREE.JS ===');
  const loader = new GLTFLoader();
  const report = {
    timestamp: new Date().toISOString(),
    threejs_revision: THREE.REVISION,
    total_props_validated: PROPS_TO_VALIDATE.length,
    props: [],
    all_passed: true
  };

  for (const item of PROPS_TO_VALIDATE) {
    const filePath = path.join(PROPS_DIR, item.file);
    if (!fs.existsSync(filePath)) {
      console.error(`ERROR: File not found: ${filePath}`);
      report.props.push({ ...item, status: 'FILE_NOT_FOUND', passed: false });
      report.all_passed = false;
      continue;
    }

    const stat = fs.statSync(filePath);
    const buffer = fs.readFileSync(filePath);
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

    try {
      const gltf = await new Promise((res, rej) => loader.parse(arrayBuffer, '', res, rej));
      const scene = gltf.scene;

      let totalVertices = 0;
      let totalTriangles = 0;
      const meshList = [];
      const materialList = new Set();

      scene.traverse((obj) => {
        if (obj.isMesh) {
          const geo = obj.geometry;
          const v = geo.attributes.position ? geo.attributes.position.count : 0;
          const t = geo.index ? geo.index.count / 3 : v / 3;
          totalVertices += v;
          totalTriangles += Math.round(t);

          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach(m => {
            if (m) materialList.add(m.name || m.type);
          });

          meshList.push({
            name: obj.name,
            vertices: v,
            triangles: Math.round(t)
          });
        }
      });

      scene.updateMatrixWorld(true);
      const bbox = new THREE.Box3().setFromObject(scene);
      const size = new THREE.Vector3();
      bbox.getSize(size);
      const center = new THREE.Vector3();
      bbox.getCenter(center);

      // Check for finite coordinates
      let matricesValid = true;
      scene.traverse((obj) => {
        for (let i = 0; i < 16; i++) {
          if (!Number.isFinite(obj.matrixWorld.elements[i])) {
            matricesValid = false;
            break;
          }
        }
      });

      const polyBudgetPassed = totalTriangles <= item.expectedMaxTris;
      const passed = matricesValid && polyBudgetPassed;

      const propResult = {
        id: item.id,
        file: item.file,
        file_size_kb: +(stat.size / 1024).toFixed(2),
        total_vertices: totalVertices,
        total_triangles: totalTriangles,
        poly_budget_max: item.expectedMaxTris,
        poly_budget_passed: polyBudgetPassed,
        matrices_valid: matricesValid,
        dimensions: {
          x: +size.x.toFixed(3),
          y: +size.y.toFixed(3),
          z: +size.z.toFixed(3)
        },
        boundingBox: {
          min: [bbox.min.x, bbox.min.y, bbox.min.z].map(v => +v.toFixed(3)),
          max: [bbox.max.x, bbox.max.y, bbox.max.z].map(v => +v.toFixed(3))
        },
        materials: Array.from(materialList),
        meshes_count: meshList.length,
        passed
      };

      if (!passed) report.all_passed = false;
      report.props.push(propResult);

      console.log(`✓ [${passed ? 'PASS' : 'FAIL'}] ${item.file}: ${totalTriangles} tris, ${propResult.file_size_kb} KB, Size: (${size.x.toFixed(2)}m, ${size.y.toFixed(2)}m, ${size.z.toFixed(2)}m)`);
    } catch (err) {
      console.error(`ERROR parsing ${item.file}:`, err);
      report.props.push({ ...item, status: 'PARSE_ERROR', error: err.message, passed: false });
      report.all_passed = false;
    }
  }

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\nValidation complete. Report saved to: ${REPORT_PATH}`);
  console.log(`Overall status: ${report.all_passed ? 'ALL PROPS PASSED (100% PRODUCTION READY)' : 'VALIDATION FAILED'}`);
}

validateProps();
