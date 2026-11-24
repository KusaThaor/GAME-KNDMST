import { describe, expect, it } from 'vitest';
import { getMinigame } from '../../src/game/minigames/registry';
import { CIPHER, CipherLogic } from '../../src/game/minigames/games/mg_cipher';
import { FOOTBAG, FootbagLogic } from '../../src/game/minigames/games/mg_footbag';
import { NOODLE, NoodleLogic, noodleStars } from '../../src/game/minigames/games/mg_noodle';
import { WIPE, WipeLogic, wipeStars } from '../../src/game/minigames/games/mg_wipe_board';

describe('Trang 1 — đăng ký trò', () => {
  it.each([
    ['mg_cipher', 'K4'], ['mg_footbag', 'K5'], ['mg_wipe_board', 'K6'], ['mg_noodle', 'K6'],
  ] as const)('%s có trong registry, kiểu %s, luật 1–3 dòng', (id, kind) => {
    const game = getMinigame(id);
    expect(game.id).toBe(id);
    expect(game.kind).toBe(kind);
    expect(game.rules.lines.length).toBeGreaterThan(0);
    expect(game.rules.lines.length).toBeLessThanOrEqual(3);
    expect(game.title).not.toMatch(/PLACEHOLDER/);
  });
});

describe('mg_cipher — giải mật lệnh', () => {
  it('6 ký hiệu ↔ 6 chữ cái khác nhau của "RA CHƠI", ô lem đúng số lượng', () => {
    const logic = new CipherLogic(42);
    expect(logic.symbols).toHaveLength(6);
    expect(new Set(logic.letters)).toEqual(new Set(['R', 'A', 'C', 'H', 'Ơ', 'I']));
    expect(logic.blots.size).toBe(CIPHER.blotted);
    expect(logic.encoded.map(s => (s === ' ' ? ' ' : logic.key.get(s))).join('')).toBe(CIPHER.message);
  });

  it('cùng seed thì cùng đề, khác seed thì xáo khác', () => {
    expect(new CipherLogic(7).symbols).toEqual(new CipherLogic(7).symbols);
    const layouts = new Set([1, 2, 3, 4, 5].map(s => new CipherLogic(s).encoded.join('')));
    expect(layouts.size).toBeGreaterThan(1);
  });

  it('ghép đúng hết là hoàn thành, không có gợi ý', () => {
    const logic = new CipherLogic(1);
    for (const s of logic.symbols) expect(logic.try(s, logic.key.get(s)!)).toBe('ok');
    expect(logic.done).toBe(true);
    expect(logic.result()).toEqual({ result: 'complete', hints_used: 0 });
  });

  it('ghép sai: Châu gạch chữ sai, khoanh gợi ý, đếm hints_used; không có thua', () => {
    const logic = new CipherLogic(3);
    const [s] = logic.symbols;
    const wrong = logic.letters.find(l => l !== logic.key.get(s))!;
    expect(logic.try(s, wrong)).toBe('wrong');
    expect(logic.struck.get(s)?.has(wrong)).toBe(true);
    expect(logic.hinted(s)).toBe(true);
    expect(logic.try(s, wrong)).toBe('ignored'); // gạch rồi thì không tính lại
    expect(logic.hints).toBe(1);
    for (const sym of logic.symbols) logic.try(sym, logic.key.get(sym)!);
    expect(logic.hinted(s)).toBe(false);
    expect(logic.result()).toEqual({ result: 'complete', hints_used: 1 });
  });

  it('chữ đã dùng và ký hiệu đã giải thì bỏ qua', () => {
    const logic = new CipherLogic(9);
    const [a, b] = logic.symbols;
    logic.try(a, logic.key.get(a)!);
    expect(logic.try(a, logic.key.get(a)!)).toBe('ignored');
    expect(logic.try(b, logic.key.get(a)!)).toBe('ignored');
    expect(logic.hints).toBe(0);
  });
});

describe('mg_footbag — đá cầu', () => {
  const hitAll = (logic: FootbagLogic, n: number, offset = 0) => {
    for (let i = 0; i < n; i++) logic.press(logic.target + offset);
  };

  it('cửa sổ nhịp ±80 ms hoàn hảo, ±160 ms được, ngoài là hụt', () => {
    expect(FootbagLogic.judge(0)).toBe('perfect');
    expect(FootbagLogic.judge(-80)).toBe('perfect');
    expect(FootbagLogic.judge(81)).toBe('good');
    expect(FootbagLogic.judge(-160)).toBe('good');
    expect(FootbagLogic.judge(161)).toBe('miss');
  });

  it('10 lượt chuyền liên tiếp là thắng', () => {
    const logic = new FootbagLogic();
    hitAll(logic, 9, 120);
    expect(logic.state).toBe('playing');
    hitAll(logic, 1);
    expect(logic.state).toBe('win');
    expect(logic.result()).toEqual({ result: 'win', score: 10 });
    expect(logic.press(logic.target)).toBeNull(); // hết ván thì không nhận thêm
  });

  it('hụt 3 lần là thua; hụt làm mất chuỗi', () => {
    const logic = new FootbagLogic();
    hitAll(logic, 4);
    expect(logic.press(logic.target + 300)).toBe('miss');
    expect(logic.streak).toBe(0);
    expect(logic.best).toBe(4);
    expect(logic.update(logic.target + FOOTBAG.goodMs + 1)).toBe('miss'); // cầu rơi mà không bấm
    expect(logic.state).toBe('playing');
    logic.press(logic.target - 200);
    expect(logic.state).toBe('lose');
    expect(logic.result()).toEqual({ result: 'lose', score: 4 });
  });

  it('bấm quá sớm (trước cửa sổ chờ) không tính; chưa tới hạn thì update không báo hụt', () => {
    const logic = new FootbagLogic();
    expect(logic.press(logic.target - FOOTBAG.earlyIgnoreMs - 1)).toBeNull();
    expect(logic.update(logic.target + FOOTBAG.goodMs)).toBeNull();
    expect(logic.misses).toBe(0);
  });

  it('nhịp nhanh dần từ 1,4 giây xuống 0,9 giây theo chuỗi chuyền', () => {
    const logic = new FootbagLogic();
    expect(logic.gap()).toBe(FOOTBAG.gapStartMs);
    const gaps: number[] = [];
    for (let i = 0; i < 9; i++) { const before = logic.target; logic.press(logic.target); gaps.push(logic.target - before); }
    expect(gaps[0]).toBeLessThan(FOOTBAG.gapStartMs);
    expect(gaps.at(-1)).toBe(FOOTBAG.gapEndMs);
    for (let i = 1; i < gaps.length; i++) expect(gaps[i]).toBeLessThanOrEqual(gaps[i - 1]);
  });
});

describe('mg_wipe_board — lau bảng', () => {
  it('cọ = 8% chiều rộng bảng', () => {
    expect(new WipeLogic().radius).toBeCloseTo(WIPE.width * 0.08);
  });

  it('một chấm chỉ lau phần trong bán kính', () => {
    const logic = new WipeLogic();
    logic.wipe(240, 120);
    const area = Math.PI * logic.radius ** 2 / (WIPE.width * WIPE.height);
    expect(logic.coverage).toBeGreaterThan(area * 0.8);
    expect(logic.coverage).toBeLessThan(area * 1.2);
    expect(logic.done).toBe(false);
  });

  it('lau kín bảng theo hàng ngang thì xong (≥ 90%) và không đếm lại ô đã sạch', () => {
    const logic = new WipeLogic();
    for (let y = 0; y <= WIPE.height; y += logic.radius) logic.wipe(0, y, WIPE.width, y);
    expect(logic.done).toBe(true);
    const n = logic.cleaned;
    logic.wipe(0, 0, WIPE.width, WIPE.height);
    expect(logic.cleaned).toBeGreaterThanOrEqual(n);
    expect(logic.coverage).toBeLessThanOrEqual(1);
  });

  it('chưa tới 90% thì chưa xong', () => {
    const logic = new WipeLogic();
    for (let y = 0; y <= WIPE.height * 0.6; y += logic.radius) logic.wipe(0, y, WIPE.width, y);
    expect(logic.coverage).toBeLessThan(WIPE.doneCoverage);
    expect(logic.done).toBe(false);
  });

  it('sao: ≤ 10 giây 3 sao, ≤ 16 giây 2 sao, còn lại 1 sao; kết quả luôn là hoàn thành', () => {
    expect([wipeStars(10_000), wipeStars(10_001), wipeStars(16_000), wipeStars(16_001)]).toEqual([3, 2, 2, 1]);
    expect(new WipeLogic().result(60_000)).toMatchObject({ result: 'complete', stars: 1 });
  });
});

describe('mg_noodle — bóp mì gói', () => {
  it('đi đủ ba chặng: bóp vụn → thả gia vị vào bịch → lắc đều vị', () => {
    const logic = new NoodleLogic();
    expect(logic.drop(true)).toBe(false); // chưa bóp xong thì chưa thả được
    logic.shake(NOODLE.crushPx / 2);
    logic.shake(-NOODLE.crushPx / 2);
    expect(logic.phase).toBe('season');
    expect(logic.crushProgress).toBe(1);
    expect(logic.drop(false)).toBe(false); // thả trượt bịch
    expect(logic.drop(true)).toBe(true);
    expect(logic.phase).toBe('mix');
    logic.shake(NOODLE.mixPx - 1);
    expect(logic.phase).toBe('mix');
    logic.shake(-1);
    expect(logic.phase).toBe('done');
  });

  it('lắc lúc đang thả gia vị không tính vào thanh nào', () => {
    const logic = new NoodleLogic();
    logic.shake(NOODLE.crushPx);
    logic.shake(5000);
    expect(logic.mix).toBe(0);
  });

  it('sao: ≤ 6 giây 3 sao, ≤ 10 giây 2 sao, còn lại 1 sao; không có thua', () => {
    expect([noodleStars(6_000), noodleStars(6_001), noodleStars(10_000), noodleStars(10_001)]).toEqual([3, 2, 2, 1]);
    expect(new NoodleLogic().result(5_400)).toEqual({ result: 'complete', stars: 3, score: 5.4 });
  });
});
