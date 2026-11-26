import * as THREE from 'three';
import { toon } from '../../render/materials';
import { makeBaseSign } from '../../world/props/m1/baseSign';
import { makeFootbag } from '../../world/props/m1/footbag';
import { makeCipherPaper, makeCompactCamera, makeNotebook, makeRedPen } from '../../world/props/m1/handProps';
import { createPaperBoatGeometry } from '../../world/props/m1/paperBoats';
import { makeRuleBook } from '../../world/props/m1/ruleBook';
import type { CharacterRig } from './build';
import { cached, cyl, mesh, r3, rbox, shade, sphere } from './geometry';
import type { PropId } from './presets';

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

type PropBuilder = (rig: CharacterRig) => THREE.Object3D;

const PROP_BUILDERS: Record<PropId, PropBuilder> = {
  marble_pouch(rig) {
    const d = rig.dims;
    const g = new THREE.Group();
    const pouch = mesh(sphere(0.05), toon('#5b8fd6'), [d.hipW * 0.55, -0.02, 0.06], g);
    pouch.scale.set(1, 1.15, 0.85);
    mesh(cyl(0.022, 0.03, 0.03), toon('#4a74b0'), [d.hipW * 0.55, 0.035, 0.06], g);
    rig.hips.add(g);
    return g;
  },
  pen(rig) {
    const g = new THREE.Group();
    const pen = mesh(cyl(0.011, 0.011, 0.14, 8), toon('#2e5fd0'), [0, -0.01, 0.03], g);
    pen.rotation.x = Math.PI / 2.4;
    mesh(cyl(0.012, 0.004, 0.03, 8), toon('#f0f0f0'), [0, -0.035, 0.088], g).rotation.x = Math.PI / 2.4;
    rig.handR.add(g);
    return g;
  },
  football(rig) {
    const ball = new THREE.Mesh(footballGeometry(), toon('#ffffff', { vertexColors: true }));
    ball.castShadow = true;
    ball.position.set(0.05, -0.06, 0.04);
    rig.handL.add(ball);
    rig.armL.userData.holdOut = 0.35;     // dang tay ôm bóng
    return ball;
  },
  water_bottle(rig) {
    const d = rig.dims;
    const b = mesh(cyl(0.035, 0.035, 0.14, 12), toon('#4fb3e8'), [-d.hipW * 0.58, 0.0, -0.02], rig.hips);
    mesh(cyl(0.025, 0.03, 0.03, 10), toon('#2b6fa0'), [0, 0.085, 0], b);
    return b;
  },
  watch(rig) {
    const d = rig.dims;
    const g = new THREE.Group();
    const w = new THREE.Mesh(cached(`watch${r3(d.armR)}`, () => new THREE.TorusGeometry(d.armR * 1.05, 0.012, 6, 14)), toon('#3b3b45'));
    w.rotation.x = Math.PI / 2; w.position.y = -d.armLen * 0.78; g.add(w);
    mesh(rbox(0.035, 0.012, 0.035, 0.005), toon('#e9e4d4'), [0, -d.armLen * 0.78, d.armR * 1.05], g);
    rig.armL.add(g);
    return g;
  },
  planner(rig) {
    const book = mesh(rbox(0.13, 0.17, 0.03, 0.01), toon('#7c5cc4'), [0.02, -0.02, 0.07], rig.handR);
    book.rotation.set(0.15, -0.3, 0.1);
    for (const [i, c] of ['#f26d6d', '#f2c14e', '#53b87a'].entries()) mesh(rbox(0.02, 0.03, 0.032, 0.004), toon(c), [0.07, 0.05 - i * 0.035, 0], book);
    rig.armR.userData.holdIn = 0.5;
    return book;
  },
  sketchbook(rig) {
    const book = mesh(rbox(0.16, 0.2, 0.025, 0.01), toon('#9ccfd8'), [-0.02, 0.0, 0.08], rig.handL);
    book.rotation.set(0.25, 0.4, -0.1);
    mesh(rbox(0.1, 0.07, 0.027, 0.005), toon('#fff6e0'), [0, 0.02, 0], book);
    rig.armL.userData.holdIn = 0.55;
    return book;
  },
  backpack(rig) {
    const { def, dims: d } = rig;
    const accent = toon(def.accent);
    const g = new THREE.Group();
    const bag = mesh(rbox(d.torsoW * 0.82, d.torsoH * 0.82, 0.14, 0.05), accent, [0, d.torsoH * 0.52, -d.torsoD / 2 - 0.06], g);
    mesh(rbox(d.torsoW * 0.6, d.torsoH * 0.3, 0.05, 0.03), toon(shade(def.accent, 0.8)), [0, -d.torsoH * 0.18, -0.08], bag);
    for (const s of [-1, 1]) {
      mesh(rbox(0.04, 0.05, d.torsoD * 1.02, 0.015), toon(shade(def.accent, 0.7)), [s * d.torsoW * 0.27, d.torsoH - 0.01, 0], g);
      mesh(rbox(0.032, d.torsoH * 0.32, 0.016, 0.008), toon(shade(def.accent, 0.7)), [s * d.torsoW * 0.29, d.torsoH * 0.8, d.torsoD / 2 + 0.004], g);
    }
    rig.torso.add(g);
    return g;
  },
};

interface HandPropSpec { obj: THREE.Object3D; holdIn?: number }

const HAND_PROP_BUILDERS: Record<string, () => HandPropSpec> = {
  'prop.notebook': () => {
    const obj = makeNotebook();
    obj.scale.setScalar(0.85);
    obj.position.set(0.01, -0.01, 0.06);
    obj.rotation.set(0.2, -0.25, 0.1);
    return { obj, holdIn: 0.5 };
  },
  'prop.shuttle': () => {
    const obj = makeFootbag();
    obj.position.set(0, -0.02, 0.045);
    obj.rotation.set(0.3, 0, -0.2);
    return { obj, holdIn: 0.4 };
  },
  'prop.paper_boat': () => {
    const obj = new THREE.Mesh(cached('hand:paper_boat', createPaperBoatGeometry), toon('#f7f2e7', { side: THREE.DoubleSide }));
    obj.position.set(0, 0.01, 0.06);
    obj.rotation.set(0.1, Math.PI / 4, 0);
    return { obj, holdIn: 0.5 };
  },
  'prop.paper_stack': () => {
    const obj = new THREE.Group();
    const sheet = cached('hand:paper_sheet', () => new THREE.BoxGeometry(0.14, 0.005, 0.19));
    for (let i = 0; i < 3; i++) {
      const m = new THREE.Mesh(sheet, toon(i === 1 ? '#ebe4d4' : '#fbf7ee'));
      m.position.set(0, i * 0.006, 0);
      m.rotation.y = (i - 1) * 0.06;
      obj.add(m);
    }
    obj.position.set(0.01, -0.01, 0.06);
    obj.rotation.set(0.18, -0.2, 0.08);
    return { obj, holdIn: 0.5 };
  },
  'prop.red_pen': () => {
    const obj = makeRedPen();
    obj.scale.setScalar(1.1);
    obj.position.set(0, -0.01, 0.04);
    obj.rotation.set(0, Math.PI / 2, -0.35);
    return { obj, holdIn: 0.35 };
  },
  'prop.rulebook': () => {
    const obj = makeRuleBook({ variant: 'flat' });
    obj.scale.setScalar(0.8);
    obj.position.set(0.01, -0.01, 0.06);
    obj.rotation.set(0.25, -0.2, 0.1);
    return { obj, holdIn: 0.55 };
  },
  'prop.base_sign': () => {
    const obj = makeBaseSign();
    obj.scale.setScalar(0.45);
    obj.position.set(0, -0.04, 0.07);
    obj.rotation.set(0.1, 0, 0);
    return { obj, holdIn: 0.6 };
  },
  'prop.camera': () => {
    const obj = makeCompactCamera();
    obj.scale.setScalar(1.2);
    obj.position.set(0, -0.02, 0.055);
    return { obj, holdIn: 0.65 };
  },
  'prop.cipher_paper': () => {
    const obj = makeCipherPaper();
    obj.scale.setScalar(1.1);
    obj.position.set(0, 0, 0.05);
    obj.rotation.set(0.35, 0, 0);
    return { obj, holdIn: 0.45 };
  },
};

export const HAND_PROP_IDS = Object.keys(HAND_PROP_BUILDERS);

function resolveHandProp(propId: string): (() => HandPropSpec) | undefined {
  return HAND_PROP_BUILDERS[propId] ?? HAND_PROP_BUILDERS[`prop.${propId}`];
}

/** Gắn một đạo cụ vào rig theo mã (dùng khi spawn hoặc khi R-B3 cầm/trao đồ động). */
export function attachProp(rig: CharacterRig, propId: PropId | string): THREE.Object3D | null {
  const build = PROP_BUILDERS[propId as PropId];
  if (build) {
    const obj = build(rig);
    if (!obj.name) obj.name = `prop:${propId}`;
    return obj;
  }
  const handBuild = resolveHandProp(propId);
  if (!handBuild) return null;
  const { obj, holdIn } = handBuild();
  obj.name = `prop:${propId}`;
  rig.handR.add(obj);
  if (holdIn !== undefined) rig.armR.userData.holdIn = Math.max((rig.armR.userData.holdIn as number | undefined) ?? 0, holdIn);
  return obj;
}

/** Gắn/gỡ động đạo cụ trên slot cầm tay (`handPropSlot`); `null` = gỡ về tay không. */
export function setDynamicProp(rig: CharacterRig, propId: string | null): THREE.Object3D | null {
  let slot = rig.handPropSlot;
  if (!slot) {
    slot = new THREE.Group();
    slot.name = 'handPropSlot';
    rig.handR.add(slot);
    rig.handPropSlot = slot;
  }
  if (rig.armR.userData.baseHoldIn === undefined) {
    rig.armR.userData.baseHoldIn = (rig.armR.userData.holdIn as number | undefined) ?? 0;
  }
  slot.clear();
  rig.armR.userData.holdIn = rig.armR.userData.baseHoldIn;
  rig.root.userData.currentProp = propId ?? null;
  if (!propId) return null;

  const handBuild = resolveHandProp(propId);
  let obj: THREE.Object3D;
  if (handBuild) {
    const spec = handBuild();
    obj = spec.obj;
    if (spec.holdIn !== undefined) {
      rig.armR.userData.holdIn = Math.max(rig.armR.userData.baseHoldIn as number, spec.holdIn);
    }
  } else {
    const built = PROP_BUILDERS[propId as PropId]?.(rig);
    if (!built) return null;
    obj = built;
  }
  obj.name = `prop:${propId}`;
  slot.add(obj);
  return obj;
}

/** Gắn toàn bộ đạo cụ mặc định của nhân vật theo preset `rig.look.props`. */
export function buildProps(rig: CharacterRig): void {
  for (const p of rig.look.props) attachProp(rig, p);
}
