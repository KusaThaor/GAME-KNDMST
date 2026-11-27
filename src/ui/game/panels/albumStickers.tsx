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
  | 'note_pin';

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
      </svg>
    </span>
  );
}
