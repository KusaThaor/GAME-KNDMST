/**
 * Kho sticker SVG thủ công cho Album kỷ niệm (phong cách sổ tay học đường 2014–2016).
 */
export type StickerKind =
  | 'flower'
  | 'shuttle'
  | 'boat'
  | 'camera'
  | 'rainbow'
  | 'star'
  | 'clover'
  | 'heart'
  | 'chalk'
  | 'note_pin'
  | 'ribbon'
  | 'paper_plane'
  | 'crown'
  | 'sparkle'
  | 'cat'
  | 'butterfly'
  | 'cassette'
  | 'polaroid'
  | 'stamp';

export const ALL_STICKERS: readonly { kind: StickerKind; label: string }[] = [
  { kind: 'star', label: 'Ngôi sao' },
  { kind: 'flower', label: 'Hoa phượng' },
  { kind: 'shuttle', label: 'Quả cầu' },
  { kind: 'boat', label: 'Thuyền giấy' },
  { kind: 'chalk', label: 'Viên phấn' },
  { kind: 'camera', label: 'Máy ảnh' },
  { kind: 'rainbow', label: 'Cầu vồng' },
  { kind: 'clover', label: 'Cỏ 4 lá' },
  { kind: 'heart', label: 'Trái tim' },
  { kind: 'note_pin', label: 'Đinh ghim' },
];

/** Ánh xạ ID ô Album hoặc loại ô sang sticker phù hợp trong kho. */
export function pickStickerKind(entryId: string, slotType: string, index: number): StickerKind {
  if (entryId.includes('g06.01')) {
    if (slotType === 'artifact') return 'chalk';
    if (slotType === 'quest_record') return 'shuttle';
    return 'star';
  }
  if (entryId.includes('g07.01')) {
    if (slotType === 'artifact') return 'boat';
    return index % 2 === 0 ? 'clover' : 'boat';
  }
  if (entryId.includes('g07.02')) {
    return index % 2 === 0 ? 'heart' : 'star';
  }
  if (entryId.includes('g07.03')) {
    if (slotType === 'artifact') return 'camera';
    return index % 2 === 0 ? 'rainbow' : 'flower';
  }
  const pool: StickerKind[] = ['star', 'flower', 'clover', 'heart', 'boat', 'camera', 'shuttle', 'rainbow'];
  return pool[index % pool.length];
}

/** Sticker trang trí góc trang dựa theo mã Trang. */
export function pageDecoStickers(pageId: string): { kind: StickerKind; rotate: number }[] {
  if (pageId.includes('g06.01')) return [{ kind: 'shuttle', rotate: -14 }, { kind: 'chalk', rotate: 10 }];
  if (pageId.includes('g07.01')) return [{ kind: 'boat', rotate: 12 }, { kind: 'clover', rotate: -10 }];
  if (pageId.includes('g07.02')) return [{ kind: 'star', rotate: -11 }, { kind: 'heart', rotate: 14 }];
  if (pageId.includes('g07.03')) return [{ kind: 'flower', rotate: 11 }, { kind: 'rainbow', rotate: -8 }];
  return [{ kind: 'star', rotate: -9 }, { kind: 'clover', rotate: 12 }];
}

export function AlbumSticker({ kind, className = '', rotate = 0, label }: { kind: StickerKind; className?: string; rotate?: number; label?: string }) {
  return (
    <span
      class={`g-sticker ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
      title={label}
      aria-hidden={label ? undefined : true}
    >
      <svg viewBox="0 0 64 64" width="44" height="44" fill="none" stroke="#3a2c26" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        {kind === 'star' && (
          <path d="M32 7l7.4 15 16.6 2.4-12 11.7 2.8 16.5L32 44.8 17.2 52.6 20 36.1 8 24.4 24.6 22z" fill="#ffd95a" />
        )}
        {kind === 'heart' && (
          <path d="M32 53S11 40 11 24a11 11 0 0 1 21-4.5A11 11 0 0 1 53 24c0 16-21 29-21 29z" fill="#f57c73" />
        )}
        {kind === 'boat' && (
          <>
            <path d="M8 39h48l-8 12H16z" fill="#fffdf6" />
            <path d="M16 39L32 14l16 25z" fill="#f7eed7" />
            <path d="M32 14v25" />
          </>
        )}
        {kind === 'camera' && (
          <>
            <rect x="9" y="19" width="46" height="32" rx="6" fill="#6f86a0" />
            <path d="M22 19l4-7h12l4 7" fill="#a9bcd0" />
            <circle cx="32" cy="35" r="10" fill="#fffdf6" />
            <circle cx="32" cy="35" r="5" fill="#3a2c26" />
            <circle cx="46" cy="26" r="2.5" fill="#ffd95a" />
          </>
        )}
        {kind === 'flower' && (
          <>
            <circle cx="32" cy="16" r="8" fill="#e85845" />
            <circle cx="47" cy="27" r="8" fill="#e85845" />
            <circle cx="41" cy="45" r="8" fill="#e85845" />
            <circle cx="23" cy="45" r="8" fill="#e85845" />
            <circle cx="17" cy="27" r="8" fill="#e85845" />
            <circle cx="32" cy="32" r="7" fill="#ffd95a" />
          </>
        )}
        {kind === 'shuttle' && (
          <>
            <path d="M22 44l-8-26 12 4 6-8 6 8 12-4-8 26z" fill="#fffdf6" />
            <path d="M22 44h20l-4 10H26z" fill="#d8332a" />
            <path d="M26 22l4 22M38 22l-4 22" />
          </>
        )}
        {kind === 'rainbow' && (
          <>
            <path d="M10 46a22 22 0 0 1 44 0" stroke="#e85845" stroke-width="5" />
            <path d="M16 46a16 16 0 0 1 32 0" stroke="#ffd95a" stroke-width="5" />
            <path d="M22 46a10 10 0 0 1 20 0" stroke="#5fa8d3" stroke-width="5" />
            <circle cx="14" cy="48" r="6" fill="#fffdf6" />
            <circle cx="50" cy="48" r="6" fill="#fffdf6" />
          </>
        )}
        {kind === 'clover' && (
          <>
            <circle cx="24" cy="24" r="9" fill="#7ec876" />
            <circle cx="40" cy="24" r="9" fill="#7ec876" />
            <circle cx="24" cy="38" r="9" fill="#7ec876" />
            <circle cx="40" cy="38" r="9" fill="#7ec876" />
            <path d="M32 38c0 9-4 14-8 17" />
          </>
        )}
        {kind === 'chalk' && (
          <>
            <rect x="14" y="28" width="36" height="12" rx="3" transform="rotate(-22 32 34)" fill="#fffdf6" />
            <path d="M23 23l18 20" stroke="#c9b994" stroke-width="2" />
          </>
        )}
        {kind === 'note_pin' && (
          <>
            <circle cx="32" cy="22" r="10" fill="#f2b53a" />
            <path d="M32 32v20" />
          </>
        )}
        {kind === 'ribbon' && (
          <>
            <path d="M32 30c-9-12-20-12-20-2s11 8 20 2z" fill="#f58aa8" />
            <path d="M32 30c9-12 20-12 20-2s-11 8-20 2z" fill="#f58aa8" />
            <path d="M28 33l-8 20 8-5 4 5M36 33l8 20-8-5-4 5" fill="#f58aa8" />
            <circle cx="32" cy="30" r="5" fill="#ffd95a" />
          </>
        )}
        {kind === 'paper_plane' && (
          <>
            <path d="M9 32L55 12 41 52 29 37z" fill="#fffdf6" />
            <path d="M29 37L55 12 34 43z" fill="#cfe4f7" />
          </>
        )}
        {kind === 'crown' && (
          <>
            <path d="M10 46L14 20l11 11 7-15 7 15 11-11 4 26z" fill="#ffd95a" />
            <rect x="10" y="46" width="44" height="6" rx="2" fill="#f2b53a" />
            <circle cx="32" cy="14" r="3" fill="#e85845" />
          </>
        )}
        {kind === 'sparkle' && (
          <>
            <path d="M32 8c2 14 10 22 24 24-14 2-22 10-24 24-2-14-10-22-24-24 14-2 22-10 24-24z" fill="#ffe77a" />
            <circle cx="50" cy="14" r="3" fill="#ffd95a" />
            <circle cx="14" cy="50" r="2.5" fill="#ffd95a" />
          </>
        )}
        {kind === 'cat' && (
          <>
            <path d="M16 26l-2-14 11 8h14l11-8-2 14c4 5 5 13 0 19-4 5-10 7-16 7s-12-2-16-7c-5-6-4-14 0-19z" fill="#fde3b4" />
            <circle cx="25" cy="34" r="2.5" fill="#3a2c26" />
            <circle cx="39" cy="34" r="2.5" fill="#3a2c26" />
            <path d="M29 40l3 3 3-3" />
          </>
        )}
        {kind === 'butterfly' && (
          <>
            <path d="M32 32C22 14 8 14 10 28c2 9 14 10 22 4z" fill="#7dc9e8" />
            <path d="M32 32C42 14 56 14 54 28c-2 9-14 10-22 4z" fill="#7dc9e8" />
            <path d="M32 34c-8 4-16 14-10 18 6 4 10-6 10-18z" fill="#a7def5" />
            <path d="M32 34c8 4 16 14 10 18-6 4-10-6-10-18z" fill="#a7def5" />
            <path d="M32 18v30" />
          </>
        )}
        {kind === 'cassette' && (
          <>
            <rect x="8" y="16" width="48" height="32" rx="4" fill="#4f5d75" />
            <rect x="14" y="21" width="36" height="14" rx="2" fill="#fdfaf2" />
            <circle cx="24" cy="28" r="4" fill="#3a2c26" />
            <circle cx="40" cy="28" r="4" fill="#3a2c26" />
            <path d="M18 48l3-6h22l3 6" fill="#bfc8d6" />
          </>
        )}
        {kind === 'polaroid' && (
          <>
            <rect x="13" y="9" width="38" height="46" rx="3" fill="#fffdf6" />
            <rect x="18" y="14" width="28" height="26" fill="#9bc7e5" />
            <circle cx="26" cy="23" r="4" fill="#ffd95a" />
            <path d="M18 36l9-7 7 5 5-4 7 6v4H18z" fill="#7ec876" />
          </>
        )}
        {kind === 'stamp' && (
          <>
            <circle cx="32" cy="32" r="20" fill="#fdeef1" stroke="#d8332a" />
            <circle cx="32" cy="32" r="14" stroke="#d8332a" stroke-dasharray="4 3" />
            <path d="M24 32h16M32 24v16" stroke="#d8332a" />
          </>
        )}
      </svg>
    </span>
  );
}
