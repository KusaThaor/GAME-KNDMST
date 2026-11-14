import { describe, expect, it } from 'vitest';
import { formatText, resolveLines, speakerName } from '../../src/systems/dialogue';
import { indexContent } from '../../src/content/indexContent';
import { makeConfig, makePack } from './fixtures/pack';

const male = { player_name: 'Thảo', gender: 'male' as const };
const female = { player_name: 'Nguyễn Thị Á', gender: 'female' as const };

describe('formatText', () => {
  it('thay {player_name} bằng tên có dấu, giữ nguyên hoa/thường', () => {
    expect(formatText('Ê {player_name}, lại đây nè!', male)).toBe('Ê Thảo, lại đây nè!');
    expect(formatText('{player_name} ơi, {player_name}!', female)).toBe('Nguyễn Thị Á ơi, Nguyễn Thị Á!');
    expect(formatText('x {player_name}', { player_name: 'ánh', gender: 'female' })).toBe('x ánh');
  });
  it('{g:nam|nữ} theo giới của Player', () => {
    const t = 'Nhìn {g:thằng|con} {player_name} kìa, {g:nó|nhỏ} cười hoài!';
    expect(formatText(t, male)).toBe('Nhìn thằng Thảo kìa, nó cười hoài!');
    expect(formatText(t, female)).toBe('Nhìn con Nguyễn Thị Á kìa, nhỏ cười hoài!');
  });
  it('nhánh rỗng được phép', () => {
    expect(formatText('anh{g: trai|} tớ', male)).toBe('anh trai tớ');
    expect(formatText('anh{g: trai|} tớ', female)).toBe('anh tớ');
  });
  it('tên chứa ký tự đặc biệt của replace ($&, $1) không làm hỏng câu', () => {
    expect(formatText('Chào {player_name}!', { player_name: '$& $1', gender: 'male' })).toBe('Chào $& $1!');
  });
  it('chưa có tên → dùng tên mặc định, không để trống', () => {
    expect(formatText('Chào {player_name}!', { player_name: '', gender: 'male' })).toBe('Chào bạn!');
  });
  it('mẫu sai cú pháp thì để nguyên (validator sẽ nhắc)', () => {
    expect(formatText('{g:chỉ một nhánh} {playername}', male)).toBe('{g:chỉ một nhánh} {playername}');
  });
});

describe('resolveLines — dòng có điều kiện + dòng dự phòng', () => {
  const ctx = (flags: Record<string, string>) => ({ flag: (n: string) => flags[n], questCompleted: () => false, dayCompleted: () => false });
  const lines = [
    { speaker: 'NPC_A', text: 'mở đầu' },
    { speaker: 'NPC_A', text: 'cậu còn nhớ lời ước đó hông?', when: { flag: 'm1.wish', equals: 'together' }, fallback: 'hồi đó vui ghê ha' },
    { speaker: 'NPC_B', text: 'chỉ nói khi có flag', when: { flag: 'm1.extra' }, fallback: '' },
  ];
  it('flag khớp → dòng callback', () => {
    expect(resolveLines(lines, ctx({ 'm1.wish': 'together', 'm1.extra': 'y' })).map((l) => l.text)).toEqual(['mở đầu', 'cậu còn nhớ lời ước đó hông?', 'chỉ nói khi có flag']);
  });
  it('flag không có (chơi lại, dữ liệu cũ) → dòng dự phòng; dự phòng rỗng → bỏ dòng', () => {
    expect(resolveLines(lines, ctx({})).map((l) => l.text)).toEqual(['mở đầu', 'hồi đó vui ghê ha']);
    expect(resolveLines(lines, ctx({ 'm1.wish': 'apart' })).map((l) => l.text)).toEqual(['mở đầu', 'hồi đó vui ghê ha']);
  });
});

describe('speakerName', () => {
  const idx = indexContent(makePack(), makeConfig());
  it('vai tạm → tên nhân vật theo bảng cast; player → tên người chơi; narrator → rỗng', () => {
    expect(speakerName('NPC_A', idx, male)).toBe('Đức');
    expect(speakerName('NPC_B', idx, male)).toBe('Minh Châu');
    expect(speakerName('player', idx, female)).toBe('Nguyễn Thị Á');
    expect(speakerName('narrator', idx, male)).toBe('');
  });
  it('đổi bảng cast → đổi tên, không sửa nội dung', () => {
    const other = indexContent(makePack(), makeConfig({ cast: { NPC_A: 'chr_ha', NPC_B: 'chr_quan', NPC_C: 'chr_duc', NPC_D: 'chr_chau' } }));
    expect(speakerName('NPC_A', other, male)).toBe('Hạ');
  });
});
