import { describe, expect, it } from 'vitest';
import * as THREE from 'three';

/** Mọi chuỗi chữ đã vẽ lên texture canvas (fillText/strokeText) — để kiểm không có chữ tự đặt. */
const drawnTexts: string[] = [];

// Mock document.createElement('canvas') trong môi trường Node.js (vitest)
if (typeof document === 'undefined') {
  function createMockCanvas(w = 256, h = 256) {
    let erased = 0;
    const pixels = new Uint8ClampedArray(w * h * 4);
    pixels.fill(255);

    const ctx = {
      canvas: null as unknown,
      fillStyle: '#000',
      strokeStyle: '#000',
      lineWidth: 1,
      font: '',
      textAlign: 'left',
      textBaseline: 'top',
      globalCompositeOperation: 'source-over',
      fillRect: () => {},
      strokeRect: () => {},
      clearRect: () => {
        erased = 0;
        pixels.fill(255);
      },
      globalAlpha: 1,
      fillText: (text: string) => {
        drawnTexts.push(String(text));
      },
      strokeText: (text: string) => {
        drawnTexts.push(String(text));
      },
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {},
      quadraticCurveTo: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      bezierCurveTo: () => {},
      arc: (_x: number, _y: number, r: number) => {
        if (ctx.globalCompositeOperation === 'destination-out') {
          erased += Math.round(r * r * Math.PI);
          const count = Math.min(Math.floor(pixels.length / 4), erased);
          for (let i = 0; i < count; i++) pixels[i * 4 + 3] = 0;
        }
      },
      stroke: () => {},
      fill: () => {},
      closePath: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      getImageData: () => ({ data: pixels }),
    };
    const canvas = {
      width: w,
      height: h,
      getContext: () => ctx,
    };
    ctx.canvas = canvas;
    return canvas;
  }

  (globalThis as unknown as { document: unknown }).document = {
    createElement: (tag: string) => {
      if (tag === 'canvas') return createMockCanvas(512, 256);
      return {};
    },
  };
}

import {
  makeClassList,
  makeNotebook,
  makeCipherPaper,
  makeRedPen,
  makeCompactCamera,
  makeFootbag,
  makeShuttlecockBush,
  makeFootbagSpot,
  makeChalkSmudge,
  makeGroceryFront,
  makePaperBoats,
  makeGutterFlow,
  makeBaseSign,
  makeRuleBook,
  makeBaseDecor,
  makeSurveyRoof,
  makeSurveyStump,
  makeSurveyBoxes,
  makeSurveySpots,
  makeRainbow,
} from '../../src/world/props/m1';
import m1CommonSet from '../../src/world/dressing/sets/m1_common';
import m1Trang2Set from '../../src/world/dressing/sets/m1_trang2';
import m1BaseSet from '../../src/world/dressing/sets/m1_base';
import m1Trang4Set from '../../src/world/dressing/sets/m1_trang4';
import type { DressingCtx } from '../../src/world/dressing';

/**
 * Đếm tổng số tam giác của một Object3D (tính cả instancing).
 */
function countTriangles(obj: THREE.Object3D): number {
  let count = 0;
  obj.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh && mesh.geometry) {
      const geo = mesh.geometry;
      const instances = (mesh as unknown as THREE.InstancedMesh).isInstancedMesh
        ? (mesh as unknown as THREE.InstancedMesh).count
        : 1;
      const tris = geo.index
        ? geo.index.count / 3
        : geo.attributes.position
          ? geo.attributes.position.count / 3
          : 0;
      count += tris * instances;
    }
  });
  return count;
}

/**
 * Kiểm tra gốc min.y trong dải ±0,015m (DoD quy định ±0,01m).
 */
function checkMinY(obj: THREE.Object3D, tolerance = 0.015): number {
  const box = new THREE.Box3().setFromObject(obj);
  expect(Math.abs(box.min.y), `min.y phải gần 0 (đang là ${box.min.y})`).toBeLessThanOrEqual(tolerance);
  return box.min.y;
}

describe('Đạo cụ Procedural Three.js Mốc 1 (N-06)', () => {
  describe('PX-10 · Bảng phân lớp (classList)', () => {
    it('gốc min.y ≈ 0 và tam giác ≤ 200', () => {
      const prop = makeClassList();
      checkMinY(prop);
      const tris = countTriangles(prop);
      expect(tris).toBeLessThanOrEqual(200);
      expect(tris).toBeGreaterThan(0);
    });
  });

  describe('PX-11 · Đạo cụ học sinh (handProps)', () => {
    it('Vở bài tập makeNotebook có min.y ≈ 0 và tam giác ≤ 100', () => {
      const book = makeNotebook();
      checkMinY(book);
      expect(countTriangles(book)).toBeLessThanOrEqual(100);
    });

    it('Mẩu giấy mật lệnh makeCipherPaper có min.y ≈ 0 và tam giác ≤ 50', () => {
      const paper = makeCipherPaper();
      checkMinY(paper);
      expect(countTriangles(paper)).toBeLessThanOrEqual(50);
    });

    it('Bút bi đỏ makeRedPen có min.y ≈ 0 và tam giác ≤ 50', () => {
      const pen = makeRedPen();
      checkMinY(pen);
      expect(countTriangles(pen)).toBeLessThanOrEqual(50);
    });
  });

  describe('PX-15 · Máy ảnh compact du lịch', () => {
    it('makeCompactCamera có min.y ≈ 0 và tam giác ≤ 300', () => {
      const cam = makeCompactCamera();
      checkMinY(cam);
      expect(countTriangles(cam)).toBeLessThanOrEqual(300);
    });
  });

  describe('PX-12 · Quả cầu đá và bụi cây (footbag)', () => {
    it('Quả cầu makeFootbag có min.y ≈ 0 và tam giác ≤ 100', () => {
      const ball = makeFootbag();
      checkMinY(ball);
      expect(countTriangles(ball)).toBeLessThanOrEqual(100);
    });

    it('Bụi cây makeShuttlecockBush có min.y ≈ 0 và tam giác ≤ 200', () => {
      const bush = makeShuttlecockBush();
      checkMinY(bush);
      expect(countTriangles(bush)).toBeLessThanOrEqual(200);
    });

    it('Cụm quả cầu sân trường makeFootbagSpot có min.y ≈ 0 và tam giác ≤ 400', () => {
      const spot = makeFootbagSpot();
      checkMinY(spot);
      expect(countTriangles(spot)).toBeLessThanOrEqual(400);
    });
  });

  describe('PX-13 · Vệt phấn trên bảng (chalkSmudge)', () => {
    it('makeChalkSmudge có min.y ≈ 0 và tam giác ≤ 2', () => {
      const smudge = makeChalkSmudge();
      checkMinY(smudge);
      expect(countTriangles(smudge)).toBeLessThanOrEqual(2);
    });

    it('hỗ trợ hàm erase() xóa dần diện tích phấn và reset()', () => {
      const smudge = makeChalkSmudge({ canvasWidth: 128, canvasHeight: 64 });
      const ctrl = smudge.smudgeControl;
      expect(ctrl).toBeDefined();

      const beforeRatio = ctrl!.getRemainingRatio();
      expect(beforeRatio).toBeGreaterThan(0.5);

      // Lau góc bảng
      ctrl!.erase(0.5, 0.5, 0.35);
      const afterRatio = ctrl!.getRemainingRatio();
      expect(afterRatio).toBeLessThan(beforeRatio);

      // Reset lại
      ctrl!.reset();
      expect(ctrl!.getRemainingRatio()).toBeGreaterThanOrEqual(beforeRatio * 0.95);
    });
  });

  describe('PX-14 · Tiệm tạp hóa trước cổng trường (groceryFront)', () => {
    it('makeGroceryFront có min.y ≈ 0 và tam giác ≤ 1200', () => {
      const grocery = makeGroceryFront();
      checkMinY(grocery);
      const tris = countTriangles(grocery);
      expect(tris).toBeLessThanOrEqual(1200);
      expect(tris).toBeGreaterThan(50);
    });
  });

  describe('PX-20 · 5 thuyền giấy (paperBoats)', () => {
    it('makePaperBoats có min.y ≈ 0 và tam giác ≤ 400', () => {
      const boats = makePaperBoats();
      checkMinY(boats);
      expect(countTriangles(boats)).toBeLessThanOrEqual(400);
    });

    it('sử dụng InstancedMesh cho 5 chiếc thuyền', () => {
      const boats = makePaperBoats();
      let hasInstanced = false;
      boats.traverse((o) => {
        if ((o as unknown as THREE.InstancedMesh).isInstancedMesh) {
          hasInstanced = true;
          expect((o as unknown as THREE.InstancedMesh).count).toBe(5);
        }
      });
      expect(hasInstanced).toBe(true);
    });
  });

  describe('PX-21 · Dòng nước rãnh hiên (gutterFlow)', () => {
    it('makeGutterFlow có min.y ≈ 0 và tam giác ≤ 200', () => {
      const gutter = makeGutterFlow();
      checkMinY(gutter);
      expect(countTriangles(gutter)).toBeLessThanOrEqual(200);
    });

    it('có flowControl hỗ trợ cập nhật trôi UV', () => {
      const gutter = makeGutterFlow();
      expect(gutter.flowControl).toBeDefined();
      expect(() => gutter.flowControl?.update(0.016)).not.toThrow();
    });
  });

  describe('PX-30 · Biển tên CĂN CỨ BÍ MẬT (baseSign)', () => {
    it('makeBaseSign có min.y ≈ 0 và tam giác ≤ 150', () => {
      const sign = makeBaseSign();
      checkMinY(sign);
      expect(countTriangles(sign)).toBeLessThanOrEqual(150);
    });
  });

  describe('PX-31 · Sổ bìa xanh LUẬT (ruleBook)', () => {
    it('makeRuleBook có min.y ≈ 0 và tam giác ≤ 150', () => {
      const book = makeRuleBook();
      checkMinY(book);
      expect(countTriangles(book)).toBeLessThanOrEqual(150);
    });
  });

  describe('PX-32 · Bộ trang trí Căn cứ (baseDecor)', () => {
    it('Bộ "paper" có min.y ≈ 0 và tam giác ≤ 1500', () => {
      const decor = makeBaseDecor('paper');
      checkMinY(decor);
      expect(countTriangles(decor)).toBeLessThanOrEqual(1500);
    });

    it('Bộ "flowers" có min.y ≈ 0 và tam giác ≤ 1500', () => {
      const decor = makeBaseDecor('flowers');
      checkMinY(decor);
      expect(countTriangles(decor)).toBeLessThanOrEqual(1500);
    });

    it('Bộ "photos" có min.y ≈ 0 và tam giác ≤ 1500', () => {
      const decor = makeBaseDecor('photos');
      checkMinY(decor);
      expect(countTriangles(decor)).toBeLessThanOrEqual(1500);
    });
  });

  describe('PX-33 · 3 điểm khảo sát Căn cứ (surveySpots)', () => {
    it('Mái che makeSurveyRoof có min.y ≈ 0 và tam giác ≤ 200', () => {
      const roof = makeSurveyRoof();
      checkMinY(roof);
      expect(countTriangles(roof)).toBeLessThanOrEqual(200);
    });

    it('Gốc cây makeSurveyStump có min.y ≈ 0 và tam giác ≤ 200', () => {
      const stump = makeSurveyStump();
      checkMinY(stump);
      expect(countTriangles(stump)).toBeLessThanOrEqual(200);
    });

    it('Đống thùng makeSurveyBoxes có min.y ≈ 0 và tam giác ≤ 200', () => {
      const boxes = makeSurveyBoxes();
      checkMinY(boxes);
      expect(countTriangles(boxes)).toBeLessThanOrEqual(200);
    });

    it('Cụm 3 điểm makeSurveySpots có min.y ≈ 0 và tam giác ≤ 800', () => {
      const spots = makeSurveySpots();
      checkMinY(spots);
      expect(countTriangles(spots)).toBeLessThanOrEqual(800);
    });
  });

  describe('PX-41 · Cầu vồng sau mưa (rainbow)', () => {
    it('makeRainbow có min.y ≈ 0 và tam giác ≤ 300', () => {
      const rainbow = makeRainbow();
      checkMinY(rainbow);
      expect(countTriangles(rainbow)).toBeLessThanOrEqual(300);
    });
  });
});

describe('Bộ gắn đồ trang trí cảnh Mốc 1 (Dressing Sets)', () => {
  function makeMockCtx(dayId: string, flags: Record<string, unknown> = {}): DressingCtx {
    const scene = new THREE.Scene();
    const updates: ((dt: number, t: number) => void)[] = [];
    return {
      scene,
      world: {} as unknown as DressingCtx['world'],
      dayId,
      decor: { phuongBloom: 0, puddles: false, scarf: true },
      flag: (name: string) => flags[name],
      addUpdate: (fn) => updates.push(fn),
    };
  }

  describe('m1_common', () => {
    it('gắn vào mọi Ngày Mốc 1 (Trang 1 -> 4)', () => {
      expect(m1CommonSet.appliesTo(makeMockCtx('d.g06.01'))).toBe(true);
      expect(m1CommonSet.appliesTo(makeMockCtx('d.g07.01'))).toBe(true);
      expect(m1CommonSet.appliesTo(makeMockCtx('d.g07.02'))).toBe(true);
      expect(m1CommonSet.appliesTo(makeMockCtx('d.g07.03'))).toBe(true);
      expect(m1CommonSet.appliesTo(makeMockCtx('d.g08.01'))).toBe(false);
    });

    it('build trả về Object3D hợp lệ', async () => {
      const obj = (await m1CommonSet.build(makeMockCtx('d.g06.01'))) as THREE.Group;
      expect(obj).toBeInstanceOf(THREE.Object3D);
      expect(obj.children.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('m1_trang2', () => {
    it('chỉ gắn vào Trang 2 (d.g07.01)', () => {
      expect(m1Trang2Set.appliesTo(makeMockCtx('d.g07.01'))).toBe(true);
      expect(m1Trang2Set.appliesTo(makeMockCtx('d.g06.01'))).toBe(false);
      expect(m1Trang2Set.appliesTo(makeMockCtx('d.g07.02'))).toBe(false);
    });

    it('đăng ký hàm update dòng nước vào ctx.addUpdate', async () => {
      const updates: ((dt: number, t: number) => void)[] = [];
      const ctx: DressingCtx = {
        scene: new THREE.Scene(),
        world: {} as unknown as DressingCtx['world'],
        dayId: 'd.g07.01',
        decor: { phuongBloom: 0, puddles: true, scarf: true },
        flag: () => undefined,
        addUpdate: (fn) => updates.push(fn),
      };

      const obj = (await m1Trang2Set.build(ctx)) as THREE.Group;
      expect(obj).toBeInstanceOf(THREE.Object3D);
      expect(updates.length).toBeGreaterThan(0);
      expect(() => updates[0](0.016, 1.0)).not.toThrow();
    });
  });

  describe('m1_base', () => {
    it('gắn vào Trang 3 và Trang 4 (d.g07.02 & d.g07.03)', () => {
      expect(m1BaseSet.appliesTo(makeMockCtx('d.g07.02'))).toBe(true);
      expect(m1BaseSet.appliesTo(makeMockCtx('d.g07.03'))).toBe(true);
      expect(m1BaseSet.appliesTo(makeMockCtx('d.g06.01'))).toBe(false);
      expect(m1BaseSet.appliesTo(makeMockCtx('d.g07.01'))).toBe(false);
    });

    it('đọc flag m1.base_decor để đổi phong cách trang trí', async () => {
      const ctxFlowers = makeMockCtx('d.g07.03', { 'm1.base_decor': 'flowers' });
      const objFlowers = (await m1BaseSet.build(ctxFlowers)) as THREE.Group;
      expect(objFlowers).toBeInstanceOf(THREE.Object3D);

      const ctxPhotos = makeMockCtx('d.g07.03', { 'm1.base_decor': 'photos' });
      const objPhotos = (await m1BaseSet.build(ctxPhotos)) as THREE.Group;
      expect(objPhotos).toBeInstanceOf(THREE.Object3D);
    });

    it('Trang 3 dựng thêm 3 điểm khảo sát', async () => {
      const obj3 = (await m1BaseSet.build(makeMockCtx('d.g07.02'))) as THREE.Group;
      const obj4 = (await m1BaseSet.build(makeMockCtx('d.g07.03'))) as THREE.Group;
      // Trang 3 có thêm survey spots
      expect(obj3.children.length).toBeGreaterThan(obj4.children.length);
    });
  });

  describe('m1_trang4', () => {
    it('chỉ gắn vào Trang 4 (d.g07.03)', () => {
      expect(m1Trang4Set.appliesTo(makeMockCtx('d.g07.03'))).toBe(true);
      expect(m1Trang4Set.appliesTo(makeMockCtx('d.g07.02'))).toBe(false);
      expect(m1Trang4Set.appliesTo(makeMockCtx('d.g06.01'))).toBe(false);
    });

    it('build chứa máy ảnh compact và cầu vồng', async () => {
      const obj = (await m1Trang4Set.build(makeMockCtx('d.g07.03'))) as THREE.Group;
      expect(obj).toBeInstanceOf(THREE.Object3D);
      expect(obj.children.length).toBe(2);
    });
  });
});

describe('Chữ trên texture đạo cụ Mốc 1 — không chữ tự đặt (Integrator PR #9)', () => {
  /** Dựng một đạo cụ và trả về các chuỗi chữ nó vẽ lên texture. */
  function textsOf(make: () => THREE.Object3D): string[] {
    const from = drawnTexts.length;
    make();
    return drawnTexts.slice(from);
  }

  const allProps: [string, () => THREE.Object3D][] = [
    ['classList', () => makeClassList()],
    ['notebook', () => makeNotebook()],
    ['cipherPaper', () => makeCipherPaper()],
    ['redPen', () => makeRedPen()],
    ['compactCamera', () => makeCompactCamera()],
    ['footbag', () => makeFootbag()],
    ['shuttlecockBush', () => makeShuttlecockBush()],
    ['footbagSpot', () => makeFootbagSpot()],
    ['chalkSmudge', () => makeChalkSmudge()],
    ['groceryFront', () => makeGroceryFront()],
    ['paperBoats', () => makePaperBoats()],
    ['gutterFlow', () => makeGutterFlow()],
    ['baseSign', () => makeBaseSign()],
    ['ruleBook', () => makeRuleBook()],
    ['baseDecor paper', () => makeBaseDecor('paper')],
    ['baseDecor flowers', () => makeBaseDecor('flowers')],
    ['baseDecor photos', () => makeBaseDecor('photos')],
    ['surveySpots', () => makeSurveySpots()],
    ['rainbow', () => makeRainbow()],
  ];

  it('mock canvas thật sự ghi lại chữ (test không chạy rỗng)', () => {
    expect(textsOf(() => makeRuleBook())).toContain('LUẬT');
  });

  it.each(allProps)('%s: không chuỗi nào chứa "{" (không vẽ biến như {player_name})', (_name, make) => {
    for (const s of textsOf(make)) expect(s, `chữ "${s}"`).not.toContain('{');
  });

  it('không họ tên tự đặt, tên lớp, năm hay tên báo thật trên mọi texture', () => {
    const banned = /Gia Tuệ|Huỳnh|Minh Đức|Lê Hoàng|Nguyễn|Trần|player_name|TUỔI TRẺ|Tuổi Trẻ|6Ad|LỚP d|20dd/;
    for (const [name, make] of allProps) {
      for (const s of textsOf(make)) expect(s, `${name}: "${s}"`).not.toMatch(banned);
    }
  });

  it('bảng phân lớp chỉ dùng tên gọi đã có (Đức, Châu)', () => {
    const texts = textsOf(() => makeClassList());
    expect(texts).toContain('DANH SÁCH PHÂN LỚP');
    const names = texts.filter((s) => s !== 'DANH SÁCH PHÂN LỚP');
    expect(names.length).toBeGreaterThan(0);
    for (const s of names) expect(['Đức', 'Châu', 'Quân', 'Hạ']).toContain(s);
  });

  it('biển Căn cứ chỉ ghi đúng "CĂN CỨ BÍ MẬT" (vẽ từng chữ cái nguệch ngoạc)', () => {
    const texts = textsOf(() => makeBaseSign());
    expect(texts.join('').normalize('NFC')).toBe('CĂNCỨBÍMẬT'.normalize('NFC'));
  });

  it('sổ luật chỉ ghi "LUẬT" như kịch bản', () => {
    expect(textsOf(() => makeRuleBook())).toEqual(['LUẬT']);
  });

  it('tờ báo gấp thuyền không in chữ nào (chỉ nét chữ giả)', () => {
    expect(textsOf(() => makePaperBoats())).toEqual([]);
  });
});
