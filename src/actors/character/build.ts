import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { flat, toon } from '../../render/materials';
import { CHARACTERS, UNIFORM, type CharacterDef, type CharacterId, type Grade, type GradeLook, type PropId } from './presets';

/**
 * Nhà máy nhân vật chibi dựng hoàn toàn bằng khối cơ bản (GDD 10.1).
 * Nhân vật nhìn về hướng +Z, gốc tọa độ ở giữa hai bàn chân. Đơn vị ≈ mét.
 */

export type Expression = 'neutral' | 'happy' | 'talk' | 'surprised';

export interface CharacterRig {
  def: CharacterDef;
  grade: Grade;
  look: GradeLook;
  root: THREE.Group;
  hips: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  legL: THREE.Group; legR: THREE.Group;
  armL: THREE.Group; armR: THREE.Group;
  handL: THREE.Group; handR: THREE.Group;
  eyes: { open: THREE.Object3D[]; happy: THREE.Object3D[] };
  mouth: { smile: THREE.Object3D; open: THREE.Object3D; flat: THREE.Object3D };
  ponytail?: THREE.Object3D;
  dims: Dims;
  setExpression(e: Expression): void;
  setBlink(amount: number): void;        // 0 = mở, 1 = nhắm
  setMouthOpen(amount: number): void;
}

interface Dims {
  legLen: number; hipW: number; torsoH: number; torsoW: number; torsoD: number;
  headR: number; armLen: number; armR: number; legR: number; shoeH: number; height: number;
}

const BASE: Record<Grade, Omit<Dims, 'hipW' | 'height' | 'shoeH'>> = {
  6: { legLen: 0.36, torsoH: 0.4, torsoW: 0.4, torsoD: 0.27, headR: 0.3, armLen: 0.3, armR: 0.052, legR: 0.072 },
  9: { legLen: 0.5, torsoH: 0.49, torsoW: 0.43, torsoD: 0.28, headR: 0.285, armLen: 0.4, armR: 0.056, legR: 0.08 },
};

function dimsFor(grade: Grade, look: GradeLook): Dims {
  const b = BASE[grade];
  const w = look.width, h = look.height;
  const d: Dims = {
    legLen: b.legLen * h, torsoH: b.torsoH * h, torsoW: b.torsoW * w, torsoD: b.torsoD * (0.6 + 0.4 * w),
    headR: b.headR * (0.92 + 0.08 * w), armLen: b.armLen * h, armR: b.armR * (0.7 + 0.3 * w), legR: b.legR * (0.6 + 0.4 * w),
    hipW: 0, shoeH: 0.07, height: 0,
  };
  d.hipW = d.torsoW * 0.94;
  d.height = d.legLen + d.torsoH + 0.06 + d.headR * 1.9;
  return d;
}

// ---------- hình khối dùng chung ----------
const geoCache = new Map<string, THREE.BufferGeometry>();
function cached<T extends THREE.BufferGeometry>(key: string, make: () => T): T {
  let g = geoCache.get(key) as T | undefined;
  if (!g) { g = make(); geoCache.set(key, g); }
  return g;
}
const r3 = (n: number) => Math.round(n * 1000) / 1000;
const rbox = (w: number, h: number, d: number, r: number) =>
  cached(`rb${r3(w)},${r3(h)},${r3(d)},${r3(r)}`, () => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2) * 0.999));
const capsule = (rad: number, len: number) => cached(`cap${r3(rad)},${r3(len)}`, () => new THREE.CapsuleGeometry(rad, Math.max(0.001, len), 5, 12));
const sphere = (rad: number, ws = 20, hs = 14) => cached(`sp${r3(rad)},${ws}`, () => new THREE.SphereGeometry(rad, ws, hs));
const cone = (rad: number, h: number) => cached(`co${r3(rad)},${r3(h)}`, () => new THREE.ConeGeometry(rad, h, 7));
const cyl = (rt: number, rb: number, h: number, seg = 12) => cached(`cy${r3(rt)},${r3(rb)},${r3(h)},${seg}`, () => new THREE.CylinderGeometry(rt, rb, h, seg));

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, pos?: [number, number, number], parent?: THREE.Object3D): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  if (pos) m.position.set(...pos);
  parent?.add(m);
  return m;
}

/** Đặt vật lên mặt cầu bán kính r tại góc ngang yaw (0 = chính diện, + về bên trái nhân vật) và góc dọc pitch. */
function onSphere(obj: THREE.Object3D, r: number, yaw: number, pitch: number, lift = 0) {
  const n = new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
  obj.position.copy(n).multiplyScalar(r + lift);
  obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
  return obj;
}

// ---------- tóc ----------
function hairCap(R: number, mat: THREE.Material, thetaLen: number, tilt: number, scale = 1.05): THREE.Mesh {
  const g = cached(`cap-hair${r3(R)},${r3(thetaLen)},${r3(scale)}`, () => new THREE.SphereGeometry(R * scale, 28, 16, 0, Math.PI * 2, 0, thetaLen));
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true;
  m.rotation.x = -tilt;            // nghiêng đỉnh tóc ra sau → trán lộ, gáy được phủ
  return m;
}

function buildHair(face: THREE.Group, R: number, def: CharacterDef, look: GradeLook, grade: Grade, rig: Partial<CharacterRig>) {
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

function shade(hex: string, k: number): string {
  const c = new THREE.Color(hex);
  c.r = Math.min(1, c.r * k); c.g = Math.min(1, c.g * k); c.b = Math.min(1, c.b * k);
  return `#${c.getHexString()}`;
}

// ---------- đạo cụ ----------
function footballGeometry(): THREE.BufferGeometry {
  return cached('football', () => {
    const g = new THREE.IcosahedronGeometry(0.11, 1).toNonIndexed();
    const pos = g.getAttribute('position');
    const colors = new Float32Array(pos.count * 3);
    const base = new THREE.IcosahedronGeometry(1, 0);
    const bp = base.getAttribute('position');
    const corners: THREE.Vector3[] = [];
    for (let i = 0; i < bp.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(bp, i).normalize();
      if (!corners.some((c) => c.distanceTo(v) < 1e-3)) corners.push(v);
    }
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
    for (let i = 0; i < pos.count; i += 3) {
      a.fromBufferAttribute(pos, i); b.fromBufferAttribute(pos, i + 1); c.fromBufferAttribute(pos, i + 2);
      const cen = a.add(b).add(c).normalize();
      const dark = corners.some((k) => k.dot(cen) > 0.93);
      const col = dark ? [0.16, 0.16, 0.18] : [0.96, 0.95, 0.92];
      for (let j = 0; j < 3; j++) colors.set(col, (i + j) * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  });
}

function buildProps(rig: CharacterRig) {
  const { def, look, dims: d } = rig;
  const accent = toon(def.accent);
  for (const p of look.props) {
    switch (p as PropId) {
      case 'marble_pouch': {
        const pouch = mesh(sphere(0.05), toon('#5b8fd6'), [d.hipW * 0.55, -0.02, 0.06], rig.hips);
        pouch.scale.set(1, 1.15, 0.85);
        mesh(cyl(0.022, 0.03, 0.03), toon('#4a74b0'), [d.hipW * 0.55, 0.035, 0.06], rig.hips);
        break;
      }
      case 'pen': {
        const pen = mesh(cyl(0.011, 0.011, 0.14, 8), toon('#2e5fd0'), [0, -0.01, 0.03], rig.handR);
        pen.rotation.x = Math.PI / 2.4;
        mesh(cyl(0.012, 0.004, 0.03, 8), toon('#f0f0f0'), [0, -0.035, 0.088], rig.handR).rotation.x = Math.PI / 2.4;
        break;
      }
      case 'football': {
        const ball = new THREE.Mesh(footballGeometry(), toon('#ffffff', { vertexColors: true }));
        ball.castShadow = true;
        ball.position.set(0.05, -0.06, 0.04);
        rig.handL.add(ball);
        rig.armL.userData.holdOut = 0.35;     // dang tay ôm bóng
        break;
      }
      case 'water_bottle': {
        const b = mesh(cyl(0.035, 0.035, 0.14, 12), toon('#4fb3e8'), [-d.hipW * 0.58, 0.0, -0.02], rig.hips);
        mesh(cyl(0.025, 0.03, 0.03, 10), toon('#2b6fa0'), [0, 0.085, 0], b);
        break;
      }
      case 'watch': {
        const w = new THREE.Mesh(cached(`watch${r3(d.armR)}`, () => new THREE.TorusGeometry(d.armR * 1.05, 0.012, 6, 14)), toon('#3b3b45'));
        w.rotation.x = Math.PI / 2; w.position.y = -d.armLen * 0.78; rig.armL.add(w);
        mesh(rbox(0.035, 0.012, 0.035, 0.005), toon('#e9e4d4'), [0, -d.armLen * 0.78, d.armR * 1.05], rig.armL);
        break;
      }
      case 'planner': {
        const book = mesh(rbox(0.13, 0.17, 0.03, 0.01), toon('#7c5cc4'), [0.02, -0.02, 0.07], rig.handR);
        book.rotation.set(0.15, -0.3, 0.1);
        for (const [i, c] of ['#f26d6d', '#f2c14e', '#53b87a'].entries()) mesh(rbox(0.02, 0.03, 0.032, 0.004), toon(c), [0.07, 0.05 - i * 0.035, 0], book);
        rig.armR.userData.holdIn = 0.5;
        break;
      }
      case 'sketchbook': {
        const book = mesh(rbox(0.16, 0.2, 0.025, 0.01), toon('#9ccfd8'), [-0.02, 0.0, 0.08], rig.handL);
        book.rotation.set(0.25, 0.4, -0.1);
        mesh(rbox(0.1, 0.07, 0.027, 0.005), toon('#fff6e0'), [0, 0.02, 0], book);
        rig.armL.userData.holdIn = 0.55;
        break;
      }
      case 'backpack': {
        const bag = mesh(rbox(d.torsoW * 0.82, d.torsoH * 0.82, 0.14, 0.05), accent, [0, d.torsoH * 0.52, -d.torsoD / 2 - 0.06], rig.torso);
        mesh(rbox(d.torsoW * 0.6, d.torsoH * 0.3, 0.05, 0.03), toon(shade(def.accent, 0.8)), [0, -d.torsoH * 0.18, -0.08], bag);
        for (const s of [-1, 1]) {
          mesh(rbox(0.04, 0.05, d.torsoD * 1.02, 0.015), toon(shade(def.accent, 0.7)), [s * d.torsoW * 0.27, d.torsoH - 0.01, 0], rig.torso);
          mesh(rbox(0.032, d.torsoH * 0.32, 0.016, 0.008), toon(shade(def.accent, 0.7)), [s * d.torsoW * 0.29, d.torsoH * 0.8, d.torsoD / 2 + 0.004], rig.torso);
        }
        break;
      }
    }
  }
}

// ---------- dựng nhân vật ----------
export function buildCharacter(id: CharacterId, grade: Grade, opts: { scarf?: boolean } = {}): CharacterRig {
  const def = CHARACTERS[id];
  const look = grade === 6 ? def.g6 : def.g9;
  const d = dimsFor(grade, look);
  const skin = toon(def.skin, { emissive: shade(def.skin, 0.16) });
  const shirt = toon(UNIFORM.shirt);
  const trousers = toon(UNIFORM.trousers);

  const root = new THREE.Group(); root.name = `char:${id}:g${grade}`;
  const hips = new THREE.Group(); hips.position.y = d.legLen; root.add(hips);

  // quần + chân + giày
  mesh(rbox(d.hipW + 0.02, 0.16, d.torsoD * 0.94, 0.06), trousers, [0, 0.02, 0], hips);
  const mkLeg = (s: number) => {
    const g = new THREE.Group(); g.position.set(s * d.hipW * 0.26, 0, 0); hips.add(g);
    const span = d.legLen - d.shoeH;
    mesh(capsule(d.legR, span - d.legR * 1.2), trousers, [0, -span / 2 + 0.01, 0], g);
    const shoe = new THREE.Group(); shoe.position.set(0, -d.legLen + d.shoeH / 2, d.legR * 0.45); g.add(shoe);
    mesh(rbox(d.legR * 2.35, d.shoeH, d.legR * 3.5, 0.03), toon(UNIFORM.shoe), [0, 0.008, 0], shoe);
    mesh(rbox(d.legR * 2.45, 0.025, d.legR * 3.6, 0.01), toon(UNIFORM.sole), [0, -d.shoeH / 2 + 0.008, 0], shoe);
    return g;
  };
  const legL = mkLeg(1), legR = mkLeg(-1);

  // thân áo
  const torso = new THREE.Group(); torso.position.y = 0.06; hips.add(torso);
  mesh(rbox(d.torsoW, d.torsoH, d.torsoD, 0.1), shirt, [0, d.torsoH / 2, 0], torso);
  mesh(rbox(d.torsoW * 1.005, 0.035, d.torsoD * 1.01, 0.015), toon(UNIFORM.belt), [0, 0.0, 0], torso);
  mesh(rbox(0.012, d.torsoH * 0.62, 0.006, 0.003), flat(UNIFORM.shirtShade), [0, d.torsoH * 0.55, d.torsoD / 2 + 0.002], torso);
  for (const s of [-1, 1]) {
    const c = mesh(rbox(0.12, 0.035, 0.07, 0.012), shirt, [s * 0.055, d.torsoH - 0.005, d.torsoD / 2 - 0.035], torso);
    c.rotation.set(-0.35, 0, s * 0.42);
  }
  mesh(rbox(0.085, 0.03, 0.008, 0.004), toon(UNIFORM.nametag, { outline: false }), [d.torsoW * 0.24, d.torsoH * 0.74, d.torsoD / 2 + 0.003], torso);
  const scarf = opts.scarf ?? grade === 6;
  if (scarf) {
    const red = toon(UNIFORM.scarf);
    const ring = new THREE.Mesh(cached('scarf-ring', () => new THREE.TorusGeometry(0.105, 0.028, 8, 20)), red);
    ring.rotation.x = Math.PI / 2; ring.scale.set(1.15, 0.85, 1); ring.position.set(0, d.torsoH - 0.01, 0.005); torso.add(ring);
    mesh(sphere(0.036, 12, 10), red, [0, d.torsoH - 0.045, d.torsoD / 2 + 0.012], torso);
    for (const s of [-1, 1]) {
      const tail = mesh(rbox(0.05, 0.13, 0.014, 0.008), red, [s * 0.03, d.torsoH - 0.12, d.torsoD / 2 + 0.01], torso);
      tail.rotation.z = s * 0.32;
    }
  }

  // tay (tay áo ngắn trắng)
  const mkArm = (s: number) => {
    const g = new THREE.Group(); g.position.set(s * (d.torsoW / 2 + d.armR * 0.3), d.torsoH - d.armR * 1.6, 0); torso.add(g);
    g.rotation.z = s * 0.1;
    mesh(capsule(d.armR * 1.55, 0.06), shirt, [0, -0.045, 0], g);
    mesh(capsule(d.armR, d.armLen - d.armR * 2), skin, [0, -d.armLen / 2, 0], g);
    const hand = new THREE.Group(); hand.position.y = -d.armLen; g.add(hand);
    mesh(sphere(d.armR * 1.3, 12, 10), skin, [0, 0, 0], hand);
    return { g, hand };
  };
  const aL = mkArm(1), aR = mkArm(-1);

  // đầu
  const head = new THREE.Group(); head.position.y = d.torsoH + 0.015; torso.add(head);
  mesh(cyl(0.065, 0.075, 0.07, 10), skin, [0, 0.01, 0], head);
  const R = d.headR;
  const face = new THREE.Group(); face.position.y = R * 0.9; head.add(face);
  const skull = mesh(sphere(R, 28, 20), skin, [0, 0, 0], face);
  skull.scale.set(1.04, 0.96, 1);
  // tai
  for (const s of [-1, 1]) { const e = mesh(sphere(R * 0.17, 10, 8), skin); onSphere(e, R * 0.98, s * Math.PI / 2, -0.12); e.scale.set(0.55, 0.85, 0.5); face.add(e); }

  // mắt
  const eyeMat = flat('#2b201e');
  const eyesOpen: THREE.Object3D[] = [], eyesHappy: THREE.Object3D[] = [];
  const k = R / 0.3;
  for (const s of [-1, 1]) {
    const eye = new THREE.Group(); onSphere(eye, R * 0.985, s * 0.34, -0.06); face.add(eye);
    const ball = new THREE.Mesh(sphere(1, 16, 12), eyeMat); ball.scale.set(0.05 * k, 0.07 * k, 0.022); eye.add(ball);
    const hl = new THREE.Mesh(sphere(1, 10, 8), flat('#ffffff')); hl.scale.set(0.016 * k, 0.018 * k, 0.01); hl.position.set(-0.014 * k, 0.026 * k, 0.018); eye.add(hl);
    const hl2 = new THREE.Mesh(sphere(1, 8, 6), flat('#ffffff')); hl2.scale.setScalar(0.008 * k); hl2.position.set(-0.012 * k, -0.025 * k, 0.018); eye.add(hl2);
    eyesOpen.push(eye);
    const happy = new THREE.Mesh(cached('eye-happy', () => new THREE.TorusGeometry(0.042, 0.012, 6, 14, Math.PI)), eyeMat);
    onSphere(happy, R * 0.99, s * 0.34, -0.08); happy.scale.setScalar(k); happy.visible = false; face.add(happy);
    eyesHappy.push(happy);
    const brow = mesh(rbox(0.075 * k, 0.016, 0.012, 0.006), toon(def.hairColor, { outline: false }));
    onSphere(brow, R * 0.995, s * 0.34, 0.2); brow.rotateZ(-s * 0.08); face.add(brow);
    const blush = new THREE.Mesh(cached('blush', () => new THREE.CircleGeometry(0.048, 18)), flat('#f2958f', { transparent: true, opacity: 0.5 }));
    onSphere(blush, R * 1.0, s * 0.62, -0.22, 0.004); blush.scale.set(k * 1.1, k * 0.75, 1); face.add(blush);
  }
  // miệng
  const mouthMat = flat('#7a3a33');
  const smile = new THREE.Mesh(cached('mouth-smile', () => new THREE.TorusGeometry(0.034, 0.009, 6, 14, Math.PI)), mouthMat);
  onSphere(smile, R * 0.995, 0, -0.3); smile.rotateZ(Math.PI); face.add(smile);
  const open = new THREE.Mesh(sphere(1, 14, 10), flat('#8c3b36'));
  onSphere(open, R * 0.985, 0, -0.33); open.scale.set(0.034 * k, 0.03 * k, 0.012); open.visible = false; face.add(open);
  const flatMouth = mesh(rbox(0.05 * k, 0.012, 0.01, 0.005), mouthMat); onSphere(flatMouth, R * 0.995, 0, -0.3); flatMouth.visible = false; face.add(flatMouth);

  const rig: CharacterRig = {
    def, grade, look, root, hips, torso, head, legL, legR, armL: aL.g, armR: aR.g, handL: aL.hand, handR: aR.hand,
    eyes: { open: eyesOpen, happy: eyesHappy }, mouth: { smile, open, flat: flatMouth }, dims: d,
    setExpression(e) {
      const happyEyes = e === 'happy';
      eyesOpen.forEach((o) => (o.visible = !happyEyes));
      eyesHappy.forEach((o) => (o.visible = happyEyes));
      smile.visible = e === 'happy' || e === 'neutral';
      open.visible = e === 'talk' || e === 'surprised';
      flatMouth.visible = false;
      if (e === 'surprised') { open.scale.set(0.03 * k, 0.04 * k, 0.012); }
    },
    setBlink(a) { for (const o of eyesOpen) o.scale.y = Math.max(0.08, 1 - a); },
    setMouthOpen(a) {
      if (!open.visible && a > 0.05) { open.visible = true; smile.visible = false; }
      open.scale.y = 0.03 * k * (0.25 + a);
    },
  };
  buildHair(face, R, def, look, grade, rig);
  buildProps(rig);
  root.userData.rig = rig;
  return rig;
}
