import * as THREE from 'three';
import { flat, toon } from '../../render/materials';
import { cached, capsule, cyl, mesh, onSphere, rbox, shade, sphere } from './geometry';
import { buildHair } from './hair';
import { CHARACTERS, UNIFORM, type CharacterDef, type CharacterId, type Grade, type GradeLook } from './presets';
import { buildProps } from './props';

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
