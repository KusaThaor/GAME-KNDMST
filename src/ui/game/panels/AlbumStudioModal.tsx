import { useEffect, useRef, useState } from 'preact/hooks';
import { SHOP_DEMO_CONFIG, TOPUP_PACKS } from '../../../config/shopDemo';
import { playSfx } from '../../../game/sfx';
import type { AlbumStyle, PlacedStickerView } from '../store';
import {
  COVER_THEMES,
  IAP_PACKS,
  isUnlocked,
  PAPER_COLORS,
  PAPER_PATTERNS,
  STICKER_CATALOG,
  WASHI_STYLES,
  type IapPackInfo,
  type StyleOption,
} from './albumCatalog';
import { AlbumSticker, type StickerKind } from './albumStickers';
import { CoinSvg, ShopBagSvg, StampSvg } from './shopIcons';

type StudioTab = 'packs' | 'stickers' | 'styles';
type StudioDrag = { kind: StickerKind; x: number; y: number; startX: number; startY: number; id?: string };

const SAMPLE_PRESET_SPOTS = [
  { x: 18, y: 24, rotate: -11 },
  { x: 82, y: 20, rotate: 10 },
  { x: 22, y: 80, rotate: -7 },
  { x: 78, y: 76, rotate: 9 },
];

export function AlbumStudioModal({
  baseStyle,
  pagesRestored,
  iapPacks,
  onClose,
  onApplyToAlbum,
}: {
  baseStyle: AlbumStyle;
  pagesRestored: number;
  iapPacks: readonly string[];
  onClose: () => void;
  onApplyToAlbum: (style: AlbumStyle, stickers: PlacedStickerView[]) => void;
}) {
  const [tab, setTab] = useState<StudioTab>('packs');
  const [studioStyle, setStudioStyle] = useState<AlbumStyle>(baseStyle);
  const [sampleStickers, setSampleStickers] = useState<PlacedStickerView[]>([
    { id: 'smp-1', kind: 'crown', x: 82, y: 18, rotate: 10 },
    { id: 'smp-2', kind: 'polaroid', x: 18, y: 78, rotate: -9 },
  ]);
  const [drag, setDrag] = useState<StudioDrag | null>(null);
  const [payPack, setPayPack] = useState<IapPackInfo | null>(null);
  const [payNotice, setPayNotice] = useState<{ title: string; subtitle: string } | null>(null);

  const dragRef = useRef<StudioDrag | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const wallet = SHOP_DEMO_CONFIG.demo_wallet;

  useEffect(() => {
    if (!drag) return;
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current) return;
      const next = { ...dragRef.current, x: e.clientX, y: e.clientY };
      dragRef.current = next;
      setDrag(next);
    };
    const onUp = (e: PointerEvent) => {
      const cur = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (!cur || !canvasRef.current) return;
      const moved = Math.hypot(e.clientX - cur.startX, e.clientY - cur.startY);
      const r = canvasRef.current.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) {
        if (moved < 8 && !cur.id) stickOnSample(cur.kind);
        return;
      }
      const px = Math.max(8, Math.min(92, ((e.clientX - r.left) / Math.max(1, r.width)) * 100));
      const py = Math.max(8, Math.min(92, ((e.clientY - r.top) / Math.max(1, r.height)) * 100));
      playSfx('sfx_tick');
      if (cur.id) {
        setSampleStickers((prev) => prev.map((s) => (s.id === cur.id ? { ...s, x: px, y: py } : s)));
      } else {
        setSampleStickers((prev) => [
          ...prev,
          {
            id: `smp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            kind: cur.kind,
            x: px,
            y: py,
            rotate: ((prev.length % 5) - 2) * 5,
          },
        ]);
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [!!drag, sampleStickers.length]);

  const stickOnSample = (kind: StickerKind) => {
    playSfx('sfx_tick');
    const spot = SAMPLE_PRESET_SPOTS[sampleStickers.length % SAMPLE_PRESET_SPOTS.length];
    const jitter = (sampleStickers.length % 3) * 4 - 4;
    setSampleStickers((prev) => [
      ...prev,
      {
        id: `smp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        kind,
        x: Math.max(10, Math.min(90, spot.x + jitter)),
        y: Math.max(12, Math.min(88, spot.y - jitter)),
        rotate: spot.rotate,
      },
    ]);
  };

  const tryPackOnSample = (pack: IapPackInfo) => {
    playSfx('sfx_tick');
    if (pack.previewStyle) {
      setStudioStyle((prev) => ({ ...prev, ...pack.previewStyle }));
    }
    if (pack.previewStickers && pack.previewStickers.length > 0) {
      const picks = pack.previewStickers.slice(0, 4);
      setSampleStickers(picks.map((kind, idx) => {
        const spot = SAMPLE_PRESET_SPOTS[idx % SAMPLE_PRESET_SPOTS.length];
        return {
          id: `smp-pack-${idx}-${Date.now()}`,
          kind,
          x: spot.x,
          y: spot.y,
          rotate: spot.rotate,
        };
      }));
    }
  };

  const detectNeededPack = (): IapPackInfo => {
    const usedPackIds = new Set<string>();
    const checkRule = (list: readonly StyleOption[], selectedId: string) => {
      const opt = list.find((o) => o.id === selectedId);
      if (opt && !isUnlocked(opt.unlock, pagesRestored, iapPacks) && opt.unlock.type === 'iap') {
        usedPackIds.add(opt.unlock.packId);
      }
    };
    checkRule(PAPER_COLORS, studioStyle.paperColor);
    checkRule(PAPER_PATTERNS, studioStyle.paperPattern);
    checkRule(COVER_THEMES, studioStyle.coverTheme);
    checkRule(WASHI_STYLES, studioStyle.washiStyle);
    for (const st of sampleStickers) {
      const cat = STICKER_CATALOG.find((c) => c.kind === st.kind);
      if (cat && !isUnlocked(cat.unlock, pagesRestored, iapPacks) && cat.unlock.type === 'iap') {
        usedPackIds.add(cat.unlock.packId);
      }
    }
    if (usedPackIds.has('pack_vip') || (usedPackIds.has('pack_stickers') && usedPackIds.has('pack_papers'))) {
      return IAP_PACKS.find((p) => p.id === 'pack_vip')!;
    }
    if (usedPackIds.has('pack_papers')) return IAP_PACKS.find((p) => p.id === 'pack_papers')!;
    if (usedPackIds.has('pack_stickers')) return IAP_PACKS.find((p) => p.id === 'pack_stickers')!;
    return IAP_PACKS[2];
  };

  const renderStyleSection = (label: string, options: readonly StyleOption[], key: keyof AlbumStyle, isPattern = false) => (
    <div class="g-studio-style-block">
      <span class="g-studio-style-label">{label}</span>
      <div class="g-studio-style-chips">
        {options.map((opt) => {
          const active = studioStyle[key] === opt.id;
          const unlocked = isUnlocked(opt.unlock, pagesRestored, iapPacks);
          return (
            <button
              key={opt.id}
              type="button"
              class={`g-style-chip ${active ? 'active' : ''} ${!unlocked ? 'locked' : ''}`}
              onClick={() => {
                playSfx('sfx_tick');
                setStudioStyle((prev) => ({ ...prev, [key]: opt.id }));
              }}
            >
              <span
                class={`g-style-swatch ${isPattern ? 'pattern' : ''}`}
                style={{ background: opt.swatch, backgroundSize: isPattern ? '10px 10px' : undefined }}
              />
              <span>{opt.label}</span>
              {!unlocked && (
                <span class="g-lock-tag">
                  {opt.unlock.type === 'iap' ? <StampSvg size={11} /> : opt.unlock.type === 'milestone' ? `${opt.unlock.pagesRequired}T` : ''}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  const canvasBookClasses = [
    'g-studio-page-frame',
    'g-album-book',
    `theme-${studioStyle.coverTheme}`,
    `paper-${studioStyle.paperColor}`,
    `pattern-${studioStyle.paperPattern}`,
    `washi-${studioStyle.washiStyle}`,
  ].join(' ');

  const isInsufficient = payPack
    ? (payPack.currency === 'coin' ? payPack.price > wallet.coin : payPack.price > wallet.stamp)
    : false;
  const shortageAmount = payPack
    ? Math.max(0, payPack.price - (payPack.currency === 'coin' ? wallet.coin : wallet.stamp))
    : 0;

  return (
    <div class="g-iap-backdrop" onClick={onClose}>
      <div class="g-alb-studio-modal" onClick={(e) => e.stopPropagation()} data-testid="iap-shop-modal">
        <header class="g-alb-studio-head">
          <div class="g-alb-studio-title">
            <span class="g-shop-logo" aria-hidden="true"><ShopBagSvg size={19} /></span>
            <div>
              <h3>Cửa Hàng Trang Trí Sổ</h3>
              <p>Phối màu giấy, băng dính và dán thử sticker trực tiếp lên trang mẫu bên trái</p>
            </div>
          </div>
          <div class="g-alb-studio-head-right">
            <div class="g-shop-wallet">
              <span class="g-wallet-pill coin" title={wallet.coin_label}>
                <CoinSvg size={16} />
                <b>{wallet.coin}</b>
              </span>
              <span class="g-wallet-pill stamp" title={wallet.stamp_label}>
                <StampSvg size={16} />
                <b>{wallet.stamp}</b>
              </span>
            </div>
            <button type="button" class="g-iap-close" aria-label="Đóng cửa hàng" onClick={onClose}>✕</button>
          </div>
        </header>

        <div class="g-alb-studio-body">
          {/* BÊN TRÁI: TRANG TRÍ MẪU TRỰC TIẾP */}
          <div class="g-alb-studio-left">
            <div class="g-alb-studio-left-bar">
              <span>Trang mẫu trực tiếp</span>
              <div class="g-alb-studio-left-btns">
                <button
                  type="button"
                  class="g-studio-mini-btn"
                  onClick={() => {
                    setStudioStyle(baseStyle);
                    setSampleStickers([]);
                  }}
                >
                  Đặt lại mẫu
                </button>
                <button
                  type="button"
                  class="g-studio-mini-btn accent"
                  onClick={() => {
                    onApplyToAlbum(studioStyle, sampleStickers);
                    onClose();
                  }}
                >
                  Đưa thử ra Album chính
                </button>
              </div>
            </div>

            <div class={canvasBookClasses}>
              <div
                ref={canvasRef}
                class={`g-album-leaf g-studio-sample-leaf ${drag ? 'drop-ready' : ''}`}
                data-studio-canvas="true"
              >
                <div class="g-page-head">
                  <h3>Trang mẫu: Ngày nắng sân trường</h3>
                  <span class="tag">Xem trước</span>
                </div>

                {sampleStickers.map((stk) => (
                  <div
                    key={stk.id}
                    class="g-placed-sticker is-preview"
                    style={{ left: `${stk.x}%`, top: `${stk.y}%` }}
                    onPointerDown={(e) => {
                      if ((e.target as HTMLElement).closest('button')) return;
                      e.preventDefault();
                      e.stopPropagation();
                      const next: StudioDrag = { kind: stk.kind as StickerKind, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, id: stk.id };
                      dragRef.current = next;
                      setDrag(next);
                    }}
                  >
                    <AlbumSticker kind={stk.kind as StickerKind} rotate={stk.rotate} />
                    <button
                      type="button"
                      class="g-placed-sticker-del"
                      aria-label="Gỡ sticker"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSampleStickers((prev) => prev.filter((item) => item.id !== stk.id));
                      }}
                    >×</button>
                  </div>
                ))}

                <div class="g-scrapbook">
                  <div class="g-scrap-photo" style={{ transform: 'rotate(-1.2deg)' }}>
                    <span class="g-washi" aria-hidden="true" />
                    <div class="g-studio-sample-photo">
                      <svg viewBox="0 0 220 110" width="100%" height="108" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                        <rect width="220" height="110" fill="#dbeafe" />
                        <circle cx="176" cy="28" r="14" fill="#fde047" />
                        <path d="M0 82 Q60 66 125 78 T220 72 V110 H0 Z" fill="#86efac" />
                        <rect x="34" y="44" width="76" height="38" rx="3" fill="#fef3c7" stroke="#78350f" stroke-width="2" />
                        <path d="M30 44l42-14 42 14z" fill="#f87171" stroke="#78350f" stroke-width="2" />
                        <circle cx="152" cy="54" r="16" fill="#ef4444" opacity=".88" />
                        <path d="M152 70v16" stroke="#78350f" stroke-width="3" />
                      </svg>
                    </div>
                  </div>
                  <div class="g-scrap-note" style={{ transform: 'rotate(1deg)' }}>
                    <p class="g-scrap-note-text">“Giờ ra chơi dưới gốc phượng năm lớp 7, nắng rọi qua tán lá...”</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="g-alb-studio-foot">
              <span>Kéo thả hoặc bấm sticker bên phải để dán lên trang mẫu</span>
              <button
                type="button"
                class="g-studio-unlock-cta"
                data-act="studio-unlock-current"
                onClick={() => {
                  playSfx('sfx_tick');
                  setPayPack(detectNeededPack());
                }}
              >
                Mở khóa bộ đang thử
              </button>
            </div>
          </div>

          {/* BÊN PHẢI: KHO VẬT PHẨM & GÓI XEM THỬ */}
          <div class="g-alb-studio-right">
            <div class="g-studio-tabs" role="tablist">
              <button
                type="button"
                class={`g-studio-tab ${tab === 'packs' ? 'on' : ''}`}
                onClick={() => setTab('packs')}
              >
                Bộ Sưu Tập
              </button>
              <button
                type="button"
                class={`g-studio-tab ${tab === 'stickers' ? 'on' : ''}`}
                onClick={() => setTab('stickers')}
              >
                Sticker Dán Thử
              </button>
              <button
                type="button"
                class={`g-studio-tab ${tab === 'styles' ? 'on' : ''}`}
                onClick={() => setTab('styles')}
              >
                Giấy, Bìa &amp; Washi
              </button>
            </div>

            <div class="g-studio-scroll">
              {tab === 'packs' && (
                <div class="g-studio-pack-list">
                  {IAP_PACKS.map((pack) => {
                    const owned = iapPacks.includes('pack_vip') || iapPacks.includes(pack.id);
                    return (
                      <article key={pack.id} class={`g-studio-pack-card ${pack.id === 'pack_vip' ? 'vip' : ''}`}>
                        {pack.badge && <span class="g-studio-pack-badge">{pack.badge}</span>}
                        <div class="g-studio-pack-head">
                          <strong>{pack.title}</strong>
                          <small>{pack.subtitle}</small>
                        </div>
                        <div class="g-iap-preview-strip">
                          {pack.previewStickers?.map((k) => (
                            <button
                              key={k}
                              type="button"
                              class="g-studio-mini-stick"
                              title="Bấm để dán thử lên trang mẫu"
                              onClick={() => stickOnSample(k)}
                            >
                              <AlbumSticker kind={k} />
                            </button>
                          ))}
                          {pack.previewSwatches?.map((sw) => (
                            <span key={sw.label} class="g-iap-mini-swatch" style={{ background: sw.bg }} title={sw.label} />
                          ))}
                        </div>
                        <ul class="g-iap-features">
                          {pack.features.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                        <div class="g-studio-pack-actions">
                          <button type="button" class="g-iap-try-btn" onClick={() => tryPackOnSample(pack)}>
                            Thử cả bộ lên mẫu
                          </button>
                          {owned ? (
                            <span class="g-iap-owned-pill">✓ Đã sở hữu</span>
                          ) : (
                            <button
                              type="button"
                              class="g-iap-buy-btn"
                              data-act={`buy-${pack.id}`}
                              onClick={() => {
                                playSfx('sfx_tick');
                                setPayPack(pack);
                              }}
                            >
                              Mở khóa
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {tab === 'stickers' && (
                <div class="g-studio-sticker-grid">
                  {STICKER_CATALOG.map((st) => {
                    const unlocked = isUnlocked(st.unlock, pagesRestored, iapPacks);
                    return (
                      <button
                        key={st.kind}
                        type="button"
                        class={`g-studio-sticker-tile ${!unlocked ? 'locked' : ''}`}
                        title={`Kéo hoặc bấm để dán "${st.label}" lên trang mẫu`}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          const next: StudioDrag = { kind: st.kind, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY };
                          dragRef.current = next;
                          setDrag(next);
                        }}
                      >
                        <AlbumSticker kind={st.kind} />
                        <span>{st.label}</span>
                        {!unlocked && (
                          <span class="g-tile-lock">
                            {st.unlock.type === 'iap' ? <StampSvg size={12} /> : st.unlock.type === 'milestone' ? `${st.unlock.pagesRequired}T` : ''}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {tab === 'styles' && (
                <div class="g-studio-styles-wrap">
                  {renderStyleSection('Màu giấy', PAPER_COLORS, 'paperColor')}
                  {renderStyleSection('Kiểu giấy', PAPER_PATTERNS, 'paperPattern', true)}
                  {renderStyleSection('Bìa sổ', COVER_THEMES, 'coverTheme')}
                  {renderStyleSection('Băng dính Washi', WASHI_STYLES, 'washiStyle')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {drag && (
        <div class="g-sticker-ghost" style={{ left: `${drag.x}px`, top: `${drag.y}px` }}>
          <AlbumSticker kind={drag.kind} rotate={-6} />
        </div>
      )}

      {/* POPUP KHUNG TIỀN (CHỈ HIỆN KHI BẤM MỞ KHÓA) */}
      {payPack && (
        <div class="g-shop-soon-backdrop" data-testid="album-pay-modal" onClick={() => setPayPack(null)}>
          <div class="g-alb-pay-modal" onClick={(e) => e.stopPropagation()}>
            <div class="g-alb-pay-head">
              <h3>Mở khóa {payPack.title}</h3>
              <button type="button" class="g-iap-close" aria-label="Đóng" onClick={() => setPayPack(null)}>✕</button>
            </div>

            <div class="g-alb-pay-summary">
              <div class="g-alb-pay-cost">
                <span>Chi phí mở khóa</span>
                <strong class={`is-${payPack.currency}`}>
                  {payPack.currency === 'coin' ? <CoinSvg size={20} /> : <StampSvg size={20} />}
                  <span>{payPack.price} {payPack.currency === 'coin' ? wallet.coin_label : wallet.stamp_label}</span>
                </strong>
              </div>
              <div class="g-alb-pay-balance">
                <span>Số dư hiện tại:</span>
                <b>{payPack.currency === 'coin' ? wallet.coin : wallet.stamp} {payPack.currency === 'coin' ? 'Xu' : 'Tem'}</b>
              </div>
            </div>

            {isInsufficient ? (
              <div class="g-alb-pay-shortage">
                <p class="g-alb-shortage-msg">
                  Bạn còn thiếu <b>{shortageAmount} {payPack.currency === 'coin' ? wallet.coin_label : wallet.stamp_label}</b>. Chọn nhanh gói nạp bên dưới:
                </p>
                <div class="g-alb-quick-topup">
                  {TOPUP_PACKS.slice(0, 3).map((tp) => (
                    <button
                      key={tp.id}
                      type="button"
                      class="g-alb-topup-row"
                      onClick={() => {
                        playSfx('sfx_tick');
                        setPayNotice({
                          title: tp.title,
                          subtitle: `+${tp.stampAmount} ${wallet.stamp_label} · ${tp.priceVnd}`,
                        });
                      }}
                    >
                      <span class="g-alb-topup-left">
                        <StampSvg size={18} />
                        <span><b>+{tp.stampAmount} Tem</b> <small>({tp.bonusLabel})</small></span>
                      </span>
                      <span class="g-alb-topup-price">{tp.priceVnd}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div class="g-alb-pay-actions">
                <button type="button" onClick={() => setPayPack(null)}>Để sau</button>
                <button
                  type="button"
                  class="primary"
                  data-act="confirm-album-pay"
                  onClick={() => {
                    playSfx('sfx_tick');
                    setPayNotice({
                      title: payPack.title,
                      subtitle: `${payPack.price} ${payPack.currency === 'coin' ? wallet.coin_label : wallet.stamp_label}`,
                    });
                  }}
                >
                  Xác nhận mở khóa
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {payNotice && (
        <div class="g-shop-soon-backdrop" data-testid="album-coming-soon" onClick={() => setPayNotice(null)}>
          <div class="g-shop-soon-modal" onClick={(e) => e.stopPropagation()}>
            <span class="g-shop-soon-badge">{SHOP_DEMO_CONFIG.coming_soon.badge}</span>
            <div class="g-shop-soon-item">
              <StampSvg size={32} />
              <div>
                <h3>{payNotice.title}</h3>
                <small>{payNotice.subtitle}</small>
              </div>
            </div>
            <h4>{SHOP_DEMO_CONFIG.coming_soon.title}</h4>
            <p>{SHOP_DEMO_CONFIG.coming_soon.body}</p>
            <button type="button" class="primary" onClick={() => setPayNotice(null)}>
              {SHOP_DEMO_CONFIG.coming_soon.confirm_label}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
