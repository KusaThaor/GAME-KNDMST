import { describe, expect, it } from 'vitest';
import { getMinigame } from '../../src/game/minigames/registry';
import { BASE_BUILD, BaseBuildLogic } from '../../src/game/minigames/games/mg_base_build';
import { BOAT, BoatLogic, makeCourse, powerAt, zoneOf, type FoldId } from '../../src/game/minigames/games/mg_boat';
import { LINEUP, LineupLogic } from '../../src/game/minigames/games/mg_lineup';
import { RULES, RulesLogic, ruleText } from '../../src/game/minigames/games/mg_rules';
import { CHARACTERS } from '../../src/actors/character/presets';

describe('Trang 2–4 — đăng ký trò', () => {
  it.each([
    ['mg_boat', 'K5'], ['mg_base_build', 'K3'], ['mg_rules', 'K4'], ['mg_lineup', 'K3'],
  ] as const)('%s có trong registry, kiểu %s, luật 1–3 dòng', (id, kind) => {
    const game = getMinigame(id);
    expect(game.id).toBe(id);
    expect(game.kind).toBe(kind);
    expect(game.rules.lines.length).toBeGreaterThan(0);
    expect(game.rules.lines.length).toBeLessThanOrEqual(3);
  });
});

describe('mg_boat — đua thuyền giấy', () => {
  const empty = () => ({ trash: [], whirls: [] });
  const run = (logic: BoatLogic, steer = 0, maxMs = 60_000) => {
    for (let t = 0; t < maxMs && logic.phase === 'race'; t += 50) logic.update(50, steer);
  };

  it('thanh lực chạy lên xuống chu kỳ 1,2 giây; vùng xanh rộng 25% ở giữa', () => {
    expect(powerAt(0)).toBe(0);
    expect(powerAt(300)).toBeCloseTo(0.5);
    expect(powerAt(600)).toBeCloseTo(1);
    expect(powerAt(1200)).toBe(0);
    expect([zoneOf(0.5), zoneOf(0.375), zoneOf(0.625), zoneOf(0.3), zoneOf(0.74), zoneOf(0.1)])
      .toEqual(['green', 'green', 'green', 'yellow', 'yellow', 'red']);
  });

  it.each([['sail', 25, 2], ['double', 27.5, 2], ['roof', 30, 3]] as const)(
    'rãnh trống, thả vùng xanh: %s về đích sau ~%s giây, thứ %s (Quân luôn nhất) → thắng', (fold, secs, rank) => {
      const logic = new BoatLogic(empty());
      logic.chooseFold(fold);
      expect(logic.launch(0.5)).toBe('green');
      run(logic);
      expect(logic.phase).toBe('finished');
      expect(logic.elapsed / 1000).toBeCloseTo(secs, 0);
      expect(logic.rank).toBe(rank);
      expect(logic.result()).toEqual({ result: 'win' });
    });

  it('mọi thuyền về đích đều chậm hơn Quân và nhanh hơn Hạ (giữ đúng kịch bản)', () => {
    const fastest = Math.min(...Object.values(BOAT.folds).map(f => BOAT.lengthM / f.speed));
    const slowest = Math.max(...Object.values(BOAT.folds).map(f => BOAT.lengthM / f.speed))
      + (BOAT.slowStartMs + (BOAT.maxHits - 1) * BOAT.trashSlowMs + BOAT.whirlAtM.length * BOAT.whirlSpinMs) / 1000;
    expect(BOAT.rivals.quan).toBeLessThan(fastest);
    expect(BOAT.rivals.ha).toBeGreaterThan(slowest);
  });

  it('đụng rác 3 lần thì lật → thua, thứ 5; mỗi lần đụng chậm 1 giây', () => {
    const trash = [3, 6, 9].map(m => ({ m, x: 0, kind: 'leaf' as const, hit: false }));
    const logic = new BoatLogic({ trash, whirls: [] });
    logic.chooseFold('double');
    logic.launch(0.5);
    run(logic, 0);
    expect(logic.hits).toBe(3);
    expect(logic.phase).toBe('capsized');
    expect(logic.rank).toBe(5);
    expect(logic.result()).toEqual({ result: 'lose' });
  });

  it('lái tránh rác thì không va chạm', () => {
    const trash = [3, 6, 9].map(m => ({ m, x: -0.5, kind: 'stick' as const, hit: false }));
    const logic = new BoatLogic({ trash, whirls: [] });
    logic.chooseFold('sail');
    logic.launch(0.5);
    for (let i = 0; i < 20; i++) logic.update(50, 1); // lái sang phải trước
    run(logic, 0);
    expect(logic.hits).toBe(0);
    expect(logic.phase).toBe('finished');
  });

  it('thả vùng đỏ: nghiêng ngay (1 va chạm) và xuất phát chậm; vùng vàng chỉ chậm', () => {
    const red = new BoatLogic(empty()); red.chooseFold('sail');
    expect(red.launch(0.05)).toBe('red');
    expect(red.hits).toBe(1);
    run(red);
    const yellow = new BoatLogic(empty()); yellow.chooseFold('sail');
    expect(yellow.launch(0.3)).toBe('yellow');
    expect(yellow.hits).toBe(0);
    run(yellow);
    expect(red.elapsed).toBeCloseTo(yellow.elapsed, -2);
    expect(yellow.elapsed / 1000).toBeCloseTo(25 + BOAT.slowStartMs / 1000, 0);
  });

  it('xoáy nước làm quay vòng mất 1,5 giây, không tính va chạm; né phía kia thì không sao', () => {
    const hitW = new BoatLogic({ trash: [], whirls: [{ m: 4.5, side: 1, used: false }] });
    hitW.chooseFold('sail'); hitW.launch(0.5);
    run(hitW, 0);
    // x = 0 nằm ở mép giữa → tính là trong xoáy phía phải (x * side >= 0)
    expect(hitW.hits).toBe(0);
    expect(hitW.elapsed / 1000).toBeCloseTo(25 + BOAT.whirlSpinMs / 1000, 0);
    const dodge = new BoatLogic({ trash: [], whirls: [{ m: 4.5, side: 1, used: false }] });
    dodge.chooseFold('sail'); dodge.launch(0.5);
    run(dodge, -1);
    expect(dodge.elapsed / 1000).toBeCloseTo(25, 0);
  });

  it('đường đua theo seed: 8 rác, 2 xoáy ở 4,5 m và 8,5 m, rác nằm trong rãnh và chừa lối đi', () => {
    const c = makeCourse(1234);
    expect(c.trash).toHaveLength(BOAT.trashCount);
    expect(c.whirls.map(w => w.m)).toEqual([4.5, 8.5]);
    for (const t of c.trash) { expect(Math.abs(t.x)).toBeLessThanOrEqual(0.7); expect(t.m).toBeLessThan(BOAT.lengthM); }
    expect(makeCourse(1234)).toEqual(c);
  });

  it('bản ghi kể chuyện có kiểu gấp, thứ hạng, lật hay không', () => {
    const logic = new BoatLogic(empty());
    logic.chooseFold('roof' as FoldId); logic.launch(0.5); run(logic);
    expect(logic.story()).toMatchObject({ fold: 'roof', launch: 'green', rank: 3, capsized: false });
  });
});

describe('mg_base_build — dựng Căn cứ', () => {
  it('đặt đủ 1 bàn + 5 thùng giấy vào 6 chỗ là xong', () => {
    const logic = new BaseBuildLogic();
    expect(BASE_BUILD.items).toHaveLength(6);
    expect(logic.place('table', 's1')).toBe('ok');
    ['s2', 's3', 's4', 's5', 's6'].forEach((s, i) => expect(logic.place(`box${i + 1}`, s)).toBe('ok'));
    expect(logic.done).toBe(true);
    expect(logic.result()).toEqual({ result: 'complete' });
  });

  it('sai loại chỗ thì không nhận; chỗ đã có món thì không đè; nhấc ra rồi đặt lại được', () => {
    const logic = new BaseBuildLogic();
    expect(logic.place('box1', 's1')).toBe('wrong_type');
    expect(logic.place('table', 's2')).toBe('wrong_type');
    expect(logic.mistakes).toBe(2);
    expect(logic.place('box1', 's2')).toBe('ok');
    expect(logic.place('box2', 's2')).toBe('occupied');
    logic.lift('box1');
    expect(logic.place('box2', 's2')).toBe('ok');
    expect(logic.place('box1', 's3')).toBe('ok');
    expect(logic.done).toBe(false);
  });
});

describe('mg_rules — luật Căn cứ', () => {
  it('năm điều đúng nguyên văn kịch bản Trang 3 bước 4', () => {
    expect(RULES.lines.map((_, i) => ruleText(i))).toEqual([
      'Điều 1: không tự lấy đồ của người khác.',
      'Điều 2: đứa nào ăn hết đồ ăn thì tự giác mua thêm!',
      'Điều 3: Ai tới trước thì dọn chỗ ngồi.',
      'Điều 4: Nếu có ai buồn thì… mọi người đừng bỏ bạn đó ở lại một mình nha.',
      'Điều 5: chụp ảnh thì phải đủ người.',
    ]);
    expect(RULES.lines.map(l => l.by)).toEqual(['Châu', 'Đức', 'Quân', 'Hạ', null]);
  });

  it('ghép theo lượt; sai thì đếm, không có thua; đủ 5 là xong', () => {
    const logic = new RulesLogic(5);
    expect(new Set(logic.cards)).toEqual(new Set([0, 1, 2, 3, 4]));
    expect(logic.pick(1)).toBe('wrong');
    expect(logic.pick(0)).toBe('ok');
    expect(logic.pick(0)).toBe('ignored'); // đã dùng
    for (const c of [1, 2, 3, 4]) expect(logic.pick(c)).toBe('ok');
    expect(logic.done).toBe(true);
    expect(logic.result()).toEqual({ result: 'complete', hints_used: 1 });
  });
});

describe('mg_lineup — xếp đội hình', () => {
  it('chiều cao khớp presets lớp 6–7', () => {
    for (const p of LINEUP.people) {
      if (p.id === 'player') continue;
      expect(p.height).toBe(CHARACTERS[p.id as 'duc'].g6.height);
    }
  });

  it('Quân đứng hàng trước che người sau lưng; đổi lên hàng sau thì xong', () => {
    const logic = new LineupLogic();
    ['duc', 'chau', 'player', 'quan', 'ha'].forEach((id, i) => logic.place(id, i));
    expect(logic.full).toBe(true);
    expect(logic.covered()).toEqual([0, 1]);
    expect(logic.done).toBe(false);
    logic.place('quan', 1); // đổi chỗ với Châu
    expect(logic.slots).toEqual(['duc', 'quan', 'player', 'chau', 'ha']);
    expect(logic.covered()).toEqual([]);
    expect(logic.done).toBe(true);
    expect(logic.result()).toEqual({ result: 'complete' });
  });

  it('Hạ (thấp nhất) đứng sau người cao hơn thì bị che; thiếu người thì chưa xong', () => {
    const logic = new LineupLogic();
    logic.place('ha', 2);
    logic.place('duc', 4);
    expect(logic.covered()).toEqual([2]);
    expect(logic.done).toBe(false);
    logic.remove('duc');
    expect(logic.covered()).toEqual([]);
    expect(logic.full).toBe(false);
  });
});
