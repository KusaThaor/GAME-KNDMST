/**
 * Bộ icon SVG nội tuyến cho Tiệm Ký Ức và ví tiền tệ (Xu Kỷ Niệm, Tem Thanh Xuân).
 * Dùng SVG thuần để hiển thị đồng nhất trên mọi hệ điều hành, không phụ thuộc font emoji.
 */

export type ShopItemArtKind =
  | 'desk'
  | 'garden'
  | 'lab'
  | 'album'
  | 'outfit'
  | 'highlighter'
  | 'film'
  | 'eraser'
  | 'snack'
  | 'blindbox'
  | 'diary_chau'
  | 'crayon_ha'
  | 'daily'
  | 'keepsakes'
  | 'pass'
  | 'ads';

/** Icon Xu Kỷ Niệm (vàng ấm, ánh sao giữa đồng xu). */
export function CoinSvg({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#fbbf24" stroke="#78350f" stroke-width="2" />
      <circle cx="12" cy="12" r="7" fill="#fde68a" stroke="#d97706" stroke-width="1.2" />
      <path
        d="M12 7.2l1.25 2.75 2.95.35-2.2 2.02.58 2.93L12 13.78l-2.58 1.47.58-2.93-2.2-2.02 2.95-.35L12 7.2z"
        fill="#d97706"
      />
    </svg>
  );
}

/** Icon Tem Thanh Xuân (lấy cảm hứng từ kim cương hồng-tím NSTT kết hợp tem thư). */
export function StampSvg({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="kndmst-stamp-grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#f472b6" />
          <stop offset="55%" stop-color="#c084fc" />
          <stop offset="100%" stop-color="#7c3aed" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.5l8 5.2-3 11.8H7L4 7.7l8-5.2z"
        fill="url(#kndmst-stamp-grad)"
        stroke="#4c1d95"
        stroke-width="1.9"
        stroke-linejoin="round"
      />
      <path d="M4.5 8.2h15M12 2.8l-3 5.4 3 11.1 3-11.1-3-5.4z" stroke="#fbcfe8" stroke-width="1.2" stroke-linejoin="round" />
      <circle cx="17.5" cy="5.5" r="1.3" fill="#fdf2f8" />
    </svg>
  );
}

/** Icon túi cửa hàng cho thanh HUD. */
export function ShopBagSvg({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M6 7h12l1.2 13H4.8L6 7z" fill="#fff7e2" />
      <path d="M9 7a3 3 0 0 1 6 0" />
      <path d="M9.5 12.5h5" />
    </svg>
  );
}

/** Hình minh họa vector gọn cho từng vật phẩm trong cửa hàng. */
export function ItemArtSvg({ kind, size = 42 }: { kind: ShopItemArtKind; size?: number }) {
  switch (kind) {
    case 'desk':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="7" y="29" width="34" height="5" rx="2" fill="#d9a066" stroke="#3a2c26" stroke-width="2.2" />
          <path d="M12 34v8M36 34v8" stroke="#3a2c26" stroke-width="2.5" stroke-linecap="round" />
          <path d="M16 29v-7l5-7h6l-3 7" stroke="#3a2c26" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M21 15h10l3 6H18l3-6z" fill="#fde047" stroke="#3a2c26" stroke-width="2" stroke-linejoin="round" />
          <rect x="29" y="21" width="9" height="8" rx="1.5" fill="#93c5fd" stroke="#3a2c26" stroke-width="2" />
        </svg>
      );
    case 'garden':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M15 30h18l-2.5 11h-13L15 30z" fill="#e07a5f" stroke="#3a2c26" stroke-width="2.2" stroke-linejoin="round" />
          <path d="M24 30V14" stroke="#15803d" stroke-width="2.6" stroke-linecap="round" />
          <path d="M24 22c-6 0-9-4-9-8 5 0 9 3 9 8zM24 19c6 0 9-4 9-8-5 0-9 3-9 8z" fill="#4ade80" stroke="#3a2c26" stroke-width="2" stroke-linejoin="round" />
          <circle cx="14" cy="11" r="2.2" fill="#fbbf24" />
          <circle cx="34" cy="10" r="2" fill="#f472b6" />
        </svg>
      );
    case 'lab':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M24 7c6 5 8 12 8 20H16c0-8 2-15 8-20z" fill="#f87171" stroke="#3a2c26" stroke-width="2.2" stroke-linejoin="round" />
          <circle cx="24" cy="18" r="3.5" fill="#e0f2fe" stroke="#3a2c26" stroke-width="2" />
          <path d="M16 23l-5 6h5M32 23l5 6h-5" fill="#fbbf24" stroke="#3a2c26" stroke-width="2" stroke-linejoin="round" />
          <path d="M20 27l4 10 4-10" fill="#fb923c" stroke="#3a2c26" stroke-width="2" stroke-linejoin="round" />
        </svg>
      );
    case 'album':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="10" y="9" width="28" height="30" rx="4" fill="#fbcfe8" stroke="#3a2c26" stroke-width="2.2" />
          <path d="M15 9v30" stroke="#3a2c26" stroke-width="2" />
          <rect x="20" y="15" width="13" height="11" rx="2" fill="#fff" stroke="#3a2c26" stroke-width="1.8" />
          <path d="M22 24l3.5-4 3 3 2-2 2.5 3" stroke="#db2777" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M21 31h11" stroke="#3a2c26" stroke-width="2" stroke-linecap="round" />
        </svg>
      );
    case 'outfit':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M16 11l4-3h8l4 3 7 6-4 6-4-2v18H17V21l-4 2-4-6 7-6z" fill="#93c5fd" stroke="#3a2c26" stroke-width="2.2" stroke-linejoin="round" />
          <path d="M20 8c1 3 7 3 8 0" stroke="#3a2c26" stroke-width="2" stroke-linecap="round" />
          <path d="M22 15l2 3 2-3" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      );
    case 'highlighter':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="10" y="17" width="22" height="14" rx="3" transform="rotate(-25 21 24)" fill="#fde047" stroke="#3a2c26" stroke-width="2.2" />
          <path d="M31 14l7-3-2 7-5-4z" fill="#f472b6" stroke="#3a2c26" stroke-width="2" stroke-linejoin="round" />
          <path d="M12 36h24" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" />
        </svg>
      );
    case 'film':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="9" y="13" width="22" height="24" rx="3" fill="#fcd34d" stroke="#3a2c26" stroke-width="2.2" />
          <rect x="13" y="9" width="14" height="4" rx="1" fill="#3a2c26" />
          <path d="M31 18h8v15h-8" fill="#64748b" stroke="#3a2c26" stroke-width="2.2" stroke-linejoin="round" />
          <rect x="14" y="19" width="12" height="11" rx="2" fill="#fffdf6" stroke="#3a2c26" stroke-width="1.8" />
        </svg>
      );
    case 'eraser':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M10 27l14-14 14 14-10 10H16l-6-10z" fill="#f9a8d4" stroke="#3a2c26" stroke-width="2.2" stroke-linejoin="round" />
          <path d="M17 20l14 14" stroke="#3a2c26" stroke-width="2" />
          <path d="M29 37h11" stroke="#3a2c26" stroke-width="2.2" stroke-linecap="round" />
        </svg>
      );
    case 'snack':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M14 15h20l-2 23H16l-2-23z" fill="#fed7aa" stroke="#3a2c26" stroke-width="2.2" stroke-linejoin="round" />
          <path d="M14 15c2-4 18-4 20 0" stroke="#3a2c26" stroke-width="2.2" />
          <circle cx="21" cy="24" r="2.2" fill="#ef4444" />
          <circle cx="27" cy="28" r="2.2" fill="#22c55e" />
          <path d="M20 31c2.5-1.5 5.5-1.5 8 0" stroke="#ea580c" stroke-width="2" stroke-linecap="round" />
        </svg>
      );
    case 'blindbox':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="9" y="17" width="30" height="22" rx="4" fill="#c4b5fd" stroke="#3a2c26" stroke-width="2.2" />
          <rect x="7" y="12" width="34" height="7" rx="2.5" fill="#f472b6" stroke="#3a2c26" stroke-width="2.2" />
          <path d="M24 12v27" stroke="#fde047" stroke-width="4" />
          <path d="M24 12c-3-4-8-4-7 0h7zm0 0c3-4 8-4 7 0h-7z" fill="#fde047" stroke="#3a2c26" stroke-width="2" />
        </svg>
      );
    case 'diary_chau':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="11" y="9" width="26" height="30" rx="3.5" fill="#fca5a5" stroke="#3a2c26" stroke-width="2.2" />
          <path d="M16 9v30" stroke="#3a2c26" stroke-width="2" />
          <circle cx="27" cy="22" r="4.5" fill="#fffdf6" stroke="#3a2c26" stroke-width="1.8" />
          <path d="M22 31h10" stroke="#3a2c26" stroke-width="2" stroke-linecap="round" />
        </svg>
      );
    case 'crayon_ha':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="10" y="13" width="28" height="24" rx="4" fill="#bae6fd" stroke="#3a2c26" stroke-width="2.2" />
          <rect x="14" y="18" width="4" height="14" rx="1" fill="#fb7185" stroke="#3a2c26" stroke-width="1.5" />
          <rect x="22" y="18" width="4" height="14" rx="1" fill="#facc15" stroke="#3a2c26" stroke-width="1.5" />
          <rect x="30" y="18" width="4" height="14" rx="1" fill="#4ade80" stroke="#3a2c26" stroke-width="1.5" />
        </svg>
      );
    case 'pass':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="7" y="14" width="34" height="20" rx="5" fill="#fde047" stroke="#3a2c26" stroke-width="2.2" />
          <path d="M17 14v20" stroke="#3a2c26" stroke-width="2" stroke-dasharray="3 3" />
          <path d="M29 19l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6L29 19z" fill="#f472b6" stroke="#3a2c26" stroke-width="1.6" />
        </svg>
      );
    case 'ads':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="8" y="13" width="32" height="22" rx="4" fill="#a7f3d0" stroke="#3a2c26" stroke-width="2.2" />
          <path d="M21 19l9 5-9 5V19z" fill="#fffdf6" stroke="#3a2c26" stroke-width="2" stroke-linejoin="round" />
        </svg>
      );
    case 'daily':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M10 23l14-11 14 11v16H10V23z" fill="#fed7aa" stroke="#3a2c26" stroke-width="2.2" stroke-linejoin="round" />
          <circle cx="24" cy="24" r="4" fill="#fffdf6" stroke="#3a2c26" stroke-width="1.8" />
          <path d="M20 39v-7h8v7" fill="#fca5a5" stroke="#3a2c26" stroke-width="2" />
        </svg>
      );
    case 'keepsakes':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="18" cy="20" r="7" fill="#93c5fd" stroke="#3a2c26" stroke-width="2" />
          <circle cx="31" cy="22" r="6" fill="#f9a8d4" stroke="#3a2c26" stroke-width="2" />
          <circle cx="23" cy="31" r="6.5" fill="#fde047" stroke="#3a2c26" stroke-width="2" />
        </svg>
      );
  }
}
