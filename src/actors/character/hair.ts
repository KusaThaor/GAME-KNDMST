import * as THREE from 'three';
import { toon } from '../../render/materials';
import type { CharacterRig } from './build';
import { cached, capsule, cone, mesh, onSphere, r3, shade, sphere } from './geometry';
import type { CharacterDef, Grade, GradeLook } from './presets';

function hairCap(R: number, mat: THREE.Material, thetaLen: number, tilt: number, scale = 1.05): THREE.Mesh {
  const g = cached(`cap-hair${r3(R)},${r3(thetaLen)},${r3(scale)}`, () => new THREE.SphereGeometry(R * scale, 28, 16, 0, Math.PI * 2, 0, thetaLen));
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true;
  m.rotation.x = -tilt;            // nghiêng đỉnh tóc ra sau → trán lộ, gáy được phủ
  return m;
}

/** Dựng tóc cho nhân vật theo preset `look.hair` và độ dài `look.hairLength`. */
export function buildHair(face: THREE.Group, R: number, def: CharacterDef, look: GradeLook, grade: Grade, rig: Partial<CharacterRig>) {
  const hm = toon(def.hairColor);
  const accent = toon(def.accent);
  const L = look.hairLength;
  const add = (o: THREE.Object3D) => { face.add(o); return o; };

  switch (look.hair) {
    case 'spiky': {
      add(hairCap(R, hm, Math.PI * 0.5, 0.38));
      const n = grade === 6 ? 10 : 8;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const ring = i % 2 === 0 ? 0.62 : 0.95;
        const spike = mesh(cone(0.075 * R / 0.3, 0.2 * L * R / 0.3), hm);
        const yaw = a, pitch = ring + (i % 3) * 0.06;
        onSphere(spike, R * 0.98, yaw * 0.9 + (grade === 9 ? 0.5 : 0), pitch);
        spike.rotateX(Math.PI / 2);   // nón hướng ra ngoài
        spike.rotateZ(grade === 9 ? -0.5 : 0);
        spike.position.z -= 0.03;
        add(spike);
      }
      // mái lởm chởm phía trước
      for (const x of [-0.5, -0.18, 0.14, 0.45]) {
        const s = mesh(cone(0.06 * R / 0.3, 0.13 * R / 0.3), hm);
        onSphere(s, R * 1.0, x, 0.42);
        s.rotateX(Math.PI / 2 + 1.0);
        add(s);
      }
      break;
    }
    case 'buzz': {
      add(hairCap(R, toon(shade(def.hairColor, 1.25)), Math.PI * 0.47, 0.22, 1.025));
      if (grade === 9) {
        const q = mesh(sphere(R * 0.42), hm); q.scale.set(1.2, 0.35, 0.8); onSphere(q, R * 0.98, 0, 0.72); add(q);
      }
      break;
    }
    case 'ponytail_high': {
      add(hairCap(R, hm, Math.PI * 0.52, 0.3));
      const bang = mesh(sphere(R * 0.5), hm); bang.scale.set(1.1, 0.4, 0.42); onSphere(bang, R * 0.98, -0.3, 0.42); bang.rotateZ(-0.4); add(bang);
      const tie = new THREE.Mesh(cached('tie', () => new THREE.TorusGeometry(0.05, 0.022, 8, 16)), accent);
      onSphere(tie, R * 1.02, Math.PI, 0.55); add(tie);
      const tail = new THREE.Group();
      onSphere(tail, R * 1.0, Math.PI, 0.62); tail.quaternion.identity(); add(tail);
      const sway = new THREE.Group(); tail.add(sway);
      // đuôi tóc cong: vểnh ra sau rồi rủ xuống → nhìn nghiêng/3/4 vẫn thấy
      const segs: [number, number, number][] = [[0.03, -0.06, 0.088], [-0.03, -0.15, 0.084], [-0.13, -0.21, 0.074], [-0.24, -0.22, 0.06], [-0.33 * L, -0.2, 0.045]];
      for (const [y, z, rad] of segs) { const b = mesh(sphere(rad * R / 0.3, 14, 10), hm, [0, y * R / 0.3, z * R / 0.3]); b.scale.set(0.95, 1.15, 0.9); sway.add(b); }
      rig.ponytail = sway;
      break;
    }
    case 'long_clip': {
      add(hairCap(R, hm, Math.PI * 0.56, 0.3, 1.06));
      // tóc sau lưng
      const backLen = R * (1.0 + 0.6 * (L - 1));
      const back = mesh(capsule(R * 0.92, backLen), hm, [0, -backLen / 2 - R * 0.05, -R * 0.42]);
      back.scale.set(1.04, 1, 0.62);
      add(back);
      // hai lọn hai bên má
      for (const s of [-1, 1]) {
        const lock = mesh(capsule(0.05 * R / 0.3, R * 0.65 * L), hm, [s * R * 0.93, -R * 0.35, R * 0.08]);
        lock.rotation.z = s * 0.06;
        add(lock);
      }
      // mái thẳng
      for (const y of [-0.42, -0.14, 0.14, 0.42]) {
        const b = mesh(sphere(R * 0.3), hm); b.scale.set(1.05, 0.62, 0.42); onSphere(b, R * 1.0, y, 0.34); add(b);
      }
      // kẹp tóc (bên trái nhân vật)
      for (const s2 of [-1, 1]) { const wing = mesh(sphere(0.045 * R / 0.3, 12, 8), toon('#f48fb1')); onSphere(wing, R * 1.07, 0.7 + s2 * 0.09, 0.5 + s2 * 0.05); wing.scale.set(1, 0.75, 0.45); add(wing); }
      const clip2 = mesh(sphere(0.022 * R / 0.3, 10, 8), toon('#ffe08a')); onSphere(clip2, R * 1.1, 0.7, 0.5); add(clip2);
      break;
    }
    case 'short_fringe': {
      add(hairCap(R, hm, Math.PI * 0.5, 0.36));
      const pcs: [number, number, number][] = [[-0.52, 0.36, 0.3], [-0.2, 0.31, -0.12], [0.12, 0.33, 0.18], [0.44, 0.37, -0.28]];
      for (const [yaw, pitch, rz] of pcs) {
        const f = mesh(sphere(R * 0.3), hm); f.scale.set(1.0 * L, 0.62, 0.42); onSphere(f, R * 1.01, yaw, pitch); f.rotateZ(rz); add(f);
      }
      const tuft = mesh(cone(0.05, 0.12), hm); onSphere(tuft, R * 1.02, 0.1, 1.25); tuft.rotateX(Math.PI / 2 - 0.6); add(tuft);
      if (grade === 9) for (const s of [-1, 1]) {
        const side = mesh(sphere(R * 0.3), hm); side.scale.set(0.45, 0.9, 0.6); onSphere(side, R * 0.97, s * 1.25, 0.05); add(side);
      }
      break;
    }
    case 'ponytail_low': {
      add(hairCap(R, hm, Math.PI * 0.54, 0.32, 1.055));
      const sweep = mesh(sphere(R * 0.55), hm); sweep.scale.set(1.15, 0.42, 0.42); onSphere(sweep, R * 0.98, 0.28, 0.4); sweep.rotateZ(0.42); add(sweep);
      const lock = mesh(capsule(0.045 * R / 0.3, R * 0.6), hm, [-R * 0.92, -R * 0.3, R * 0.12]); add(lock);
      const tie = new THREE.Mesh(cached('tie', () => new THREE.TorusGeometry(0.05, 0.022, 8, 16)), accent);
      onSphere(tie, R * 0.98, Math.PI, -0.35); add(tie);
      const tail = new THREE.Group(); onSphere(tail, R * 1.02, Math.PI, -0.3); tail.quaternion.identity(); add(tail);
      const len = 0.3 * L * R / 0.3;
      const sway = new THREE.Group(); tail.add(sway);
      const pt = mesh(capsule(0.075 * R / 0.3, len), hm, [0, -len / 2 + 0.02, 0]); sway.add(pt);
      tail.rotation.x = 0.3;
      rig.ponytail = sway;
      break;
    }
  }
}
