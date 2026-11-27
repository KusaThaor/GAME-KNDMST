import { useEffect, useRef, useState } from 'preact/hooks';
import { Pop } from '../overlays/NoticeModal';
import type { AlbumEntryView, AlbumStyle, AlbumView, PlacedStickerView, UiActions, UiState } from '../store';
import { AlbumSticker, pageDecoStickers, pickStickerKind, type StickerKind } from './albumStickers';
import {
  COVER_THEMES,
  IAP_PACKS,
  isUnlocked,
  PAPER_COLORS,
  PAPER_PATTERNS,
  STICKER_CATALOG,
  WASHI_STYLES,
  type IapPackId,
  type StyleOption,
  type UnlockRule,
} from './albumCatalog';

const SLOT_LABEL: Record<string, string> = {
  main_photo: 'Ảnh kỷ niệm', free_photo: 'Ảnh tự chọn', sticker: 'Sticker', note: 'Ghi chú', artifact: 'Kỷ vật',
  quest_record: 'Dấu đã làm', personal_memory: 'Ký ức riêng', back_note: 'Mặt sau ảnh',
};
const PAGE_LABEL: Record<string, string> = { faded: 'Còn mờ', restored: 'Đã phục hồi', enriched: 'Thêm kỷ niệm', complete: 'Trọn vẹn' };
const PHOTO_TILTS = [-1.2, 1.0, -0.8, 1.2];
const NOTE_TILTS = [1.0, -1.2, 0.9, -1.0];
const STICKER_TILTS = [-9, 8, -6, 11, -12];

type PageData = AlbumView['pages'][number];

function ScrapPage({
  p,
  placed,
  dragging,
  onStartMoveSticker,
  a,
  pageIdx,
}: {
  p: PageData;
  placed: PlacedStickerView[];
  dragging: boolean;
  onStartMoveSticker: (pageId: string, sticker: PlacedStickerView, e: PointerEvent) => void;
  a: UiActions;
  pageIdx: number;
}) {
  const items = p.entries.filter((e) => e.slot_type !== 'back_note');
  const photos = items.filter((e) => e.isPhoto);
  const directNotes = items.filter((e) => !e.isPhoto && (e.slot_type === 'note' || e.slot_type === 'personal_memory'));
  const notes = directNotes.length > 0 ? directNotes : (p.back ? [{
    id: p.back.entry_id,
    slot_type: 'note',
    owned: p.state !== 'locked',
    text: p.back.text,
    url: null,
    isPhoto: false,
    variants: 0,
    selected: 0,
  }] : []);
  const stickers = items.filter((e) => !e.isPhoto && e.slot_type !== 'note' && e.slot_type !== 'personal_memory');
  const decos = p.state !== 'locked' && p.state !== 'faded' ? pageDecoStickers(p.page_id) : [];

  return (
    <section
      class={`g-album-page g-page st-${p.state} ${dragging ? 'drop-ready' : ''}`}
      data-page={p.page_id}
      data-drop-page={p.page_id}
      data-state={p.state}
    >
      <div class="g-page-head">
        <h3>{p.title}</h3>
        {PAGE_LABEL[p.state] && <span class="tag">{PAGE_LABEL[p.state]}</span>}
      </div>
      {decos.length > 0 && (
        <div class="g-page-decos" aria-hidden="true">
          {decos.map((d, i) => <AlbumSticker key={i} kind={d.kind} rotate={d.rotate} />)}
        </div>
      )}
      {placed.map((stk) => (
        <div
          key={stk.id}
          class="g-placed-sticker"
          style={{ left: `${stk.x}%`, top: `${stk.y}%` }}
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest('button')) return;
            onStartMoveSticker(p.page_id, stk, e);
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <AlbumSticker kind={stk.kind as StickerKind} rotate={stk.rotate} />
          <button
            type="button"
            class="g-placed-sticker-del"
            aria-label="Gỡ sticker"
            onClick={(e) => { e.stopPropagation(); a.albumRemoveSticker(p.page_id, stk.id); }}
          >×</button>
        </div>
      ))}
      <div class={`g-scrapbook layout-${pageIdx % 4}`}>
        {photos.map((e, i) => {
          const tilt = PHOTO_TILTS[(pageIdx * 2 + i) % PHOTO_TILTS.length];
          return (
            <div
              key={e.id}
              class={`g-scrap-photo ${e.owned ? 'owned' : 'is-faded'}`}
              style={{ transform: `rotate(${tilt}deg)` }}
              data-entry={e.id}
              data-owned={String(e.owned)}
            >
              <span class="g-washi" aria-hidden="true" />
              {e.owned ? (
                p.flipped && p.back ? (
                  <div class="g-back" data-testid="photo-back">{p.back.text}</div>
                ) : e.url ? (
                  <img src={e.url} alt="" data-testid="album-photo" />
                ) : (
                  <div class="g-loading">Đang dựng lại ảnh…</div>
                )
              ) : (
                <div class="g-photo-blank">
                  <svg class="g-photo-blank-icon" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span class="g-photo-blank-title">Khung ảnh kỷ niệm</span>
                  <small class="g-photo-blank-sub">Chơi xong để hiện rõ</small>
                </div>
              )}
              {e.owned && p.back && (
                <div class="g-scrap-caption">
                  <button data-act={`flip-${p.page_id}`} onClick={() => a.albumFlip(p.page_id)}>
                    {p.flipped ? 'Xem mặt trước' : 'Lật mặt sau'}
                  </button>
                </div>
              )}
              {e.owned && e.variants > 1 && (
                <div class="g-row">
                  {Array.from({ length: e.variants }, (_, k) => (
                    <button class={k === e.selected ? 'on' : ''} data-act={`variant-${e.id}-${k}`} onClick={() => a.albumSelect(e.id, k)}>Ảnh {k + 1}</button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {notes.length > 0 && (
          <div class="g-scrap-notes">
            {notes.map((e, i) => {
              const tilt = NOTE_TILTS[(pageIdx * 2 + i) % NOTE_TILTS.length];
              const quote = e.text ?? 'Ký ức đẹp của một thời học sinh…';
              return (
                <div
                  key={e.id}
                  class={`g-scrap-note ${e.owned ? 'owned' : 'is-faded'}`}
                  style={{ transform: `rotate(${tilt}deg)` }}
                  data-entry={e.id}
                  data-owned={String(e.owned)}
                >
                  <p class={`g-scrap-note-text ${e.owned ? 'owned' : 'is-faded'}`} title={!e.owned ? 'Chơi xong để hiện rõ quote' : undefined}>
                    “{quote}”
                  </p>
                </div>
              );
            })}
          </div>
        )}
        {stickers.length > 0 && (
          <div class="g-scrap-extras">
            {stickers.map((e: AlbumEntryView, i: number) => {
              const tilt = STICKER_TILTS[(pageIdx * 3 + i) % STICKER_TILTS.length];
              return (
                <div
                  key={e.id}
                  class={`g-scrap-badge ${e.owned ? 'owned' : 'is-faded'}`}
                  style={{ transform: `rotate(${tilt}deg)` }}
                  data-entry={e.id}
                  data-owned={String(e.owned)}
                >
                  <AlbumSticker kind={pickStickerKind(e.id, e.slot_type, i)} label={e.owned ? (e.text ?? SLOT_LABEL[e.slot_type]) : undefined} />
                  <div class="g-scrap-badge-text">
                    <small>{SLOT_LABEL[e.slot_type] ?? e.slot_type}</small>
                    <span>{e.owned ? (e.text ?? '✓') : 'Chưa mở'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function CoverPage({
  al,
  placed,
  dragging,
  onStartMoveSticker,
  a,
}: {
  al: AlbumView;
  placed: PlacedStickerView[];
  dragging: boolean;
  onStartMoveSticker: (pageId: string, sticker: PlacedStickerView, e: PointerEvent) => void;
  a: UiActions;
}) {
  return (
    <section class={`g-album-page g-album-cover-page ${dragging ? 'drop-ready' : ''}`} data-drop-page="cover">
      <div class="g-cover-badge">ALBUM KỶ NIỆM</div>
      <div class="g-cover">
        {al.coverUrl ? <img src={al.coverUrl} alt="Ảnh bìa" /> : <span>Bìa Album — chưa có ảnh</span>}
      </div>
      <p class="g-cover-title">Vùng Ký Ức</p>
      <div class="g-cover-stickers" aria-hidden="true">
        <AlbumSticker kind="star" rotate={-12} />
        <AlbumSticker kind="camera" rotate={8} />
        <AlbumSticker kind="flower" rotate={-6} />
      </div>
      {placed.map((stk) => (
        <div
          key={stk.id}
          class="g-placed-sticker"
          style={{ left: `${stk.x}%`, top: `${stk.y}%` }}
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest('button')) return;
            onStartMoveSticker('cover', stk, e);
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <AlbumSticker kind={stk.kind as StickerKind} rotate={stk.rotate} />
          <button
            type="button"
            class="g-placed-sticker-del"
            aria-label="Gỡ sticker"
            onClick={(e) => { e.stopPropagation(); a.albumRemoveSticker('cover', stk.id); }}
          >×</button>
        </div>
      ))}
    </section>
  );
}

function BackEndPage({ al }: { al: AlbumView }) {
  const ownedCount = al.pages.reduce((n, p) => n + p.entries.filter((e) => e.owned).length, 0);
  return (
    <section class="g-album-page g-album-end-page">
      <div class="g-page-head"><h3>Góc Sticker & Kỷ Vật</h3></div>
      <p class="g-hint">Đã sưu tầm {ownedCount} mảnh ký ức trong quyển Album.</p>
      <div class="g-sticker-tray">
        {(['star', 'shuttle', 'boat', 'chalk', 'flower', 'rainbow', 'camera', 'clover', 'heart'] as const).map((k, i) => (
          <AlbumSticker key={k} kind={k} rotate={STICKER_TILTS[i % STICKER_TILTS.length]} />
        ))}
      </div>
    </section>
  );
}

type DragState = { kind: StickerKind; x: number; y: number; fromPageId?: string; stickerId?: string };

export function AlbumPanel({ s, a }: { s: UiState; a: UiActions }) {
  const al = s.album;
  const [spread, setSpread] = useState(0);
  const [flip, setFlip] = useState<{ dir: 'next' | 'prev'; key: number } | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [toolTab, setToolTab] = useState<'stickers' | 'paper'>('stickers');
  const [shopOpen, setShopOpen] = useState(false);
  const [highlightPack, setHighlightPack] = useState<IapPackId | null>(null);
  const [buyingPack, setBuyingPack] = useState<IapPackId | null>(null);
  const [lockNotice, setLockNotice] = useState<string | null>(null);
  const [previewStyle, setPreviewStyle] = useState<Partial<AlbumStyle> | null>(null);
  const [previewMeta, setPreviewMeta] = useState<{ label: string; rule: UnlockRule } | null>(null);
  const [previewSticker, setPreviewSticker] = useState<{ kind: StickerKind; label: string; rule: UnlockRule } | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const timerRef = useRef<number>(0);
  const noticeTimerRef = useRef<number>(0);

  useEffect(() => () => {
    window.clearTimeout(timerRef.current);
    window.clearTimeout(noticeTimerRef.current);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(spread + 1);
      else if (e.key === 'ArrowLeft') go(spread - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    if (!drag) return;
    const onMove = (e: PointerEvent) => {
      const next = { ...dragRef.current!, x: e.clientX, y: e.clientY };
      dragRef.current = next;
      setDrag(next);
    };
    const onUp = (e: PointerEvent) => {
      const curDrag = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (!curDrag) return;
      const el = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-drop-page]');
      const pageId = el?.dataset.dropPage;
      if (!el || !pageId) return;
      const r = el.getBoundingClientRect();
      const px = ((e.clientX - r.left) / Math.max(1, r.width)) * 100;
      const py = ((e.clientY - r.top) / Math.max(1, r.height)) * 100;
      if (curDrag.stickerId && curDrag.fromPageId === pageId) {
        a.albumMoveSticker(pageId, curDrag.stickerId, px, py);
      } else {
        if (curDrag.stickerId && curDrag.fromPageId) a.albumRemoveSticker(curDrag.fromPageId, curDrag.stickerId);
        a.albumPlaceSticker(pageId, curDrag.kind, px, py);
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
  }, [!!drag]);

  if (!al) return null;

  type Leaf = { kind: 'cover' } | { kind: 'page'; page: PageData } | { kind: 'end' };
  const leaves: Leaf[] = [{ kind: 'cover' }, ...al.pages.map((page): Leaf => ({ kind: 'page', page }))];
  if (leaves.length % 2 === 1) leaves.push({ kind: 'end' });
  const totalSpreads = Math.max(1, Math.ceil(leaves.length / 2));
  const cur = Math.min(spread, totalSpreads - 1);
  const left = leaves[cur * 2];
  const right = leaves[cur * 2 + 1];
  const canPrev = cur > 0;
  const canNext = cur < totalSpreads - 1;

  function go(nextIdx: number) {
    const clamped = Math.max(0, Math.min(totalSpreads - 1, nextIdx));
    if (clamped === cur) return;
    const dir = clamped > cur ? 'next' : 'prev';
    window.clearTimeout(timerRef.current);
    setFlip({ dir, key: Date.now() });
    setSpread(clamped);
    timerRef.current = window.setTimeout(() => setFlip(null), 460);
  }

  const startNewStickerDrag = (kind: StickerKind, e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next: DragState = { kind, x: e.clientX, y: e.clientY };
    dragRef.current = next;
    setDrag(next);
  };

  const startMoveStickerDrag = (pageId: string, sticker: PlacedStickerView, e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next: DragState = {
      kind: sticker.kind as StickerKind,
      x: e.clientX,
      y: e.clientY,
      fromPageId: pageId,
      stickerId: sticker.id,
    };
    dragRef.current = next;
    setDrag(next);
  };

  const onLeafClick = (side: 'left' | 'right', e: MouseEvent) => {
    if (dragRef.current || (e.target as HTMLElement).closest('button, .g-placed-sticker')) return;
    if (side === 'right' && canNext) go(cur + 1);
    else if (side === 'left' && canPrev) go(cur - 1);
  };

  const onSpreadPointerDown = (e: PointerEvent) => {
    if (dragRef.current || (e.target as HTMLElement).closest('button, .g-placed-sticker')) return;
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const onSpreadPointerUp = (e: PointerEvent) => {
    const start = dragStart.current;
    dragStart.current = null;
    if (!start || dragRef.current) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0 && canNext) go(cur + 1);
      else if (dx > 0 && canPrev) go(cur - 1);
    }
  };

  const placedMap = al.placedStickers ?? {};
  const renderLeaf = (leaf: Leaf | undefined, side: 'left' | 'right') => {
    if (!leaf) return null;
    if (leaf.kind === 'cover') {
      return <CoverPage al={al} placed={placedMap['cover'] ?? []} dragging={!!drag} onStartMoveSticker={startMoveStickerDrag} a={a} />;
    }
    if (leaf.kind === 'end') return <BackEndPage al={al} />;
    return (
      <ScrapPage
        p={leaf.page}
        pageIdx={cur * 2 + (side === 'right' ? 1 : 0)}
        placed={placedMap[leaf.page.page_id] ?? []}
        dragging={!!drag}
        onStartMoveSticker={startMoveStickerDrag}
        a={a}
      />
    );
  };

  const pagesRestored = al.pagesRestored ?? 0;
  const iapPacks = al.iapPacks ?? [];
  const savedStyle: AlbumStyle = al.albumStyle ?? {
    paperColor: 'cream',
    paperPattern: 'dots',
    coverTheme: 'classic',
    washiStyle: 'amber',
  };
  const effectiveStyle: AlbumStyle = previewStyle ? { ...savedStyle, ...previewStyle } : savedStyle;

  const clearPreview = () => {
    setPreviewStyle(null);
    setPreviewMeta(null);
    setPreviewSticker(null);
  };

  const handleBuyPack = (packId: IapPackId) => {
    if (buyingPack) return;
    setBuyingPack(packId);
    window.setTimeout(() => {
      a.albumBuyIap(packId);
      // Nếu đang xem thử gói vừa mua thì tự động lưu thành kiểu đang dùng luôn!
      if (previewStyle) {
        a.albumSetStyle(previewStyle);
      }
      clearPreview();
      setBuyingPack(null);
      window.clearTimeout(noticeTimerRef.current);
      const packName = IAP_PACKS.find((p) => p.id === packId)?.title ?? 'Gói vật phẩm';
      setLockNotice(`✨ Thanh toán thành công! Đã mở khóa "${packName}"`);
      noticeTimerRef.current = window.setTimeout(() => setLockNotice(null), 3200);
    }, 550);
  };

  const handlePreviewPack = (packId: IapPackId) => {
    const pack = IAP_PACKS.find((p) => p.id === packId);
    if (!pack) return;
    if (pack.previewStyle) {
      setPreviewStyle(pack.previewStyle);
    }
    if (pack.previewStickers && pack.previewStickers.length > 0) {
      setPreviewSticker({
        kind: pack.previewStickers[0],
        label: pack.title,
        rule: { type: 'iap', packId, priceLabel: pack.price },
      });
    } else {
      setPreviewSticker(null);
    }
    setPreviewMeta({
      label: `Gói "${pack.title}"`,
      rule: { type: 'iap', packId, priceLabel: pack.price },
    });
    setShopOpen(false);
  };

  const renderStyleOptions = (
    title: string,
    options: readonly StyleOption[],
    activeId: string,
    key: keyof AlbumStyle,
    isPattern = false,
  ) => (
    <div class="g-style-group">
      <span class="g-style-group-label">{title}</span>
      <div class="g-style-options">
        {options.map((opt) => {
          const unlocked = isUnlocked(opt.unlock, pagesRestored, iapPacks);
          const active = activeId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              class={`g-style-chip ${active ? 'active' : ''} ${!unlocked ? 'locked' : ''} ${active && !unlocked ? 'previewing' : ''}`}
              title={unlocked ? opt.label : `${opt.label} — Bấm để xem thử`}
              onClick={() => {
                if (!unlocked) {
                  setPreviewStyle((prev) => ({ ...(prev ?? {}), [key]: opt.id }));
                  setPreviewMeta({ label: opt.label, rule: opt.unlock });
                  return;
                }
                if (previewStyle && key in previewStyle) {
                  const next = { ...previewStyle };
                  delete next[key];
                  if (Object.keys(next).length === 0) {
                    setPreviewStyle(null);
                    setPreviewMeta(null);
                  } else {
                    setPreviewStyle(next);
                  }
                }
                a.albumSetStyle({ [key]: opt.id });
              }}
            >
              <span
                class={`g-style-swatch ${isPattern ? 'pattern' : ''}`}
                style={{ background: opt.swatch, backgroundSize: isPattern ? '10px 10px' : undefined }}
              />
              <span class="g-style-name">{opt.label}</span>
              {!unlocked && (
                <span class={`g-lock-tag ${opt.unlock.type === 'iap' ? 'iap' : 'milestone'}`}>
                  {opt.unlock.type === 'iap' ? '💎' : `🔒${opt.unlock.type === 'milestone' ? `${opt.unlock.pagesRequired}T` : ''}`}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  const bookClasses = [
    'g-panel g-album g-album-book',
    `theme-${effectiveStyle.coverTheme}`,
    `paper-${effectiveStyle.paperColor}`,
    `pattern-${effectiveStyle.paperPattern}`,
    `washi-${effectiveStyle.washiStyle}`,
  ].join(' ');

  return (
    <>
      <Pop class={bookClasses} testid="panel-album">
        <header class="g-album-head">
          <div class="g-album-title-group">
            <h2>Album Kỷ Niệm</h2>
            <span class="g-progress" data-testid="album-progress">{al.progress}</span>
          </div>
          <div class="g-album-header-actions">
            <div class="g-tool-tabs" role="tablist">
              <button
                type="button"
                class={`g-tool-tab ${toolTab === 'stickers' ? 'is-active' : ''}`}
                onClick={() => setToolTab('stickers')}
              >
                Sticker
              </button>
              <button
                type="button"
                class={`g-tool-tab ${toolTab === 'paper' ? 'is-active' : ''}`}
                onClick={() => setToolTab('paper')}
              >
                Giấy &amp; Bìa
              </button>
            </div>
            <button
              type="button"
              class="g-iap-shop-btn"
              data-act="open-iap-shop"
              onClick={() => { setHighlightPack(null); setShopOpen(true); }}
            >
              ✨ Cửa hàng
            </button>
            <button type="button" class="g-album-close-btn" data-act="close" onClick={a.closePanel}>Đóng</button>
          </div>
        </header>
        {lockNotice && (
          <div class="g-album-lock-banner" role="status">
            <span>{lockNotice}</span>
          </div>
        )}
        {previewMeta && (
          <div class="g-preview-banner" role="status">
            <span class="g-preview-text">
              👁️ Đang xem thử: <strong>{previewMeta.label}</strong> (Chưa sở hữu)
            </span>
            <div class="g-preview-actions">
              {previewMeta.rule.type === 'iap' ? (
                <button
                  type="button"
                  class="g-preview-buy"
                  onClick={() => {
                    if (previewMeta.rule.type === 'iap') {
                      setHighlightPack(previewMeta.rule.packId);
                      setShopOpen(true);
                    }
                  }}
                >
                  💎 Mở khóa / Mua gói
                </button>
              ) : previewMeta.rule.type === 'milestone' ? (
                <span class="g-preview-milestone">
                  🔒 Hoàn thành {previewMeta.rule.pagesRequired} trang để dùng ({pagesRestored}/{previewMeta.rule.pagesRequired})
                </span>
              ) : null}
              <button type="button" class="g-preview-exit" onClick={clearPreview}>Thoát xem thử</button>
            </div>
          </div>
        )}
        {toolTab === 'stickers' ? (
          <div class="g-sticker-bar" data-testid="sticker-tray">
            <div class="g-sticker-bar-list">
              {STICKER_CATALOG.map((st) => {
                const unlocked = isUnlocked(st.unlock, pagesRestored, iapPacks);
                const isPreviewing = previewSticker?.kind === st.kind;
                return (
                  <button
                    key={st.kind}
                    type="button"
                    class={`g-sticker-chip ${!unlocked ? 'locked' : ''} ${isPreviewing ? 'previewing' : ''}`}
                    title={
                      unlocked
                        ? `Kéo ${st.label} thả vào trang`
                        : `${st.label} — Bấm để xem thử`
                    }
                    onPointerDown={(e) => {
                      if (!unlocked) {
                        e.preventDefault();
                        e.stopPropagation();
                        setPreviewSticker({ kind: st.kind, label: st.label, rule: st.unlock });
                        setPreviewMeta({ label: `Sticker "${st.label}"`, rule: st.unlock });
                        return;
                      }
                      startNewStickerDrag(st.kind, e);
                    }}
                  >
                    <AlbumSticker kind={st.kind} />
                    {!unlocked && (
                      <span class={`g-chip-lock ${st.unlock.type === 'iap' ? 'iap' : 'milestone'}`}>
                        {st.unlock.type === 'iap' ? '💎' : `🔒${st.unlock.type === 'milestone' ? `${st.unlock.pagesRequired}T` : ''}`}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div class="g-paper-bar" data-testid="paper-customizer">
            {renderStyleOptions('Màu giấy:', PAPER_COLORS, effectiveStyle.paperColor, 'paperColor')}
            {renderStyleOptions('Kiểu giấy:', PAPER_PATTERNS, effectiveStyle.paperPattern, 'paperPattern', true)}
            {renderStyleOptions('Bìa sổ:', COVER_THEMES, effectiveStyle.coverTheme, 'coverTheme')}
            {renderStyleOptions('Băng dính:', WASHI_STYLES, effectiveStyle.washiStyle, 'washiStyle')}
          </div>
        )}
      <div
        class="g-album-spread"
        onPointerDown={onSpreadPointerDown}
        onPointerUp={onSpreadPointerUp}
      >
        <div
          class={`g-album-leaf left ${canPrev ? 'can-flip' : ''}`}
          onClick={(e) => onLeafClick('left', e)}
          title={canPrev ? 'Bấm hoặc kéo sang phải để lật lại' : undefined}
        >
          {renderLeaf(left, 'left')}
          {canPrev && <span class="g-page-corner prev" data-act="album-prev" aria-label="Lật lại trang trước" />}
        </div>
        <div class="g-album-spine" aria-hidden="true" />
        <div
          class={`g-album-leaf right ${canNext ? 'can-flip' : ''}`}
          onClick={(e) => onLeafClick('right', e)}
          title={canNext ? 'Bấm hoặc kéo sang trái để lật tiếp' : undefined}
        >
          {renderLeaf(right, 'right')}
          {canNext && <span class="g-page-corner next" data-act="album-next" aria-label="Lật sang trang sau" />}
        </div>
        {previewSticker && (
          <div class="g-sticker-preview-float" aria-live="polite">
            <span class="g-sticker-preview-badge">Xem thử</span>
            <AlbumSticker kind={previewSticker.kind} rotate={-8} />
            <span class="g-sticker-preview-name">{previewSticker.label}</span>
          </div>
        )}
        {flip && (
          <div key={flip.key} class={`g-album-flipper ${flip.dir}`} aria-hidden="true">
            <div class="g-album-flipper-face" />
          </div>
        )}
      </div>
      <div class="g-album-hint">
        <span>Trang {cur * 2 + 1}–{cur * 2 + 2} / {leaves.length}</span>
        <span>· Chạm/kéo trang để lật · Kéo sticker để trang trí</span>
      </div>
      {drag && (
        <div class="g-sticker-ghost" style={{ left: `${drag.x}px`, top: `${drag.y}px` }}>
          <AlbumSticker kind={drag.kind} rotate={-6} />
        </div>
      )}
    </Pop>
    {shopOpen && (
      <div class="g-iap-backdrop" onClick={() => !buyingPack && setShopOpen(false)}>
        <div class="g-iap-modal" onClick={(e) => e.stopPropagation()} data-testid="iap-shop-modal">
          <div class="g-iap-head">
            <div class="g-iap-head-title">
              <span class="g-iap-store-icon" aria-hidden="true">🛍️</span>
              <div>
                <h3>Cửa Hàng Trang Trí Sổ</h3>
                <p>Xem thử trực tiếp trên sổ hoặc mở khóa gói vật phẩm kỷ niệm</p>
              </div>
            </div>
            <button type="button" class="g-iap-close" aria-label="Đóng cửa hàng" onClick={() => !buyingPack && setShopOpen(false)}>✕</button>
          </div>
          <div class="g-iap-packs">
            {IAP_PACKS.map((pack) => {
              const owned = iapPacks.includes('pack_vip') || iapPacks.includes(pack.id);
              const isHighlighted = highlightPack === pack.id;
              const isBuying = buyingPack === pack.id;
              return (
                <div key={pack.id} class={`g-iap-card ${owned ? 'owned' : ''} ${isHighlighted ? 'highlight' : ''} ${pack.id === 'pack_vip' ? 'vip' : ''}`}>
                  {pack.badge && <span class="g-iap-badge">{pack.badge}</span>}
                  <div class="g-iap-card-top">
                    <strong>{pack.title}</strong>
                    <span class="g-iap-subtitle">{pack.subtitle}</span>
                  </div>
                  <div class="g-iap-preview-strip">
                    {pack.previewStickers?.map((k) => (
                      <span key={k} class="g-iap-mini-item"><AlbumSticker kind={k} /></span>
                    ))}
                    {pack.previewSwatches?.map((sw) => (
                      <span key={sw.label} class="g-iap-mini-swatch" style={{ background: sw.bg }} title={sw.label} />
                    ))}
                  </div>
                  <ul class="g-iap-features">
                    {pack.features.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                  <div class="g-iap-card-foot">
                    <div class="g-iap-price-col">
                      {pack.originalPrice && <del class="g-iap-old-price">{pack.originalPrice}</del>}
                      <span class="g-iap-price">{pack.price}</span>
                    </div>
                    {owned ? (
                      <span class="g-iap-owned-pill">✓ Đã sở hữu</span>
                    ) : (
                      <div class="g-iap-card-btns">
                        <button
                          type="button"
                          class="g-iap-try-btn"
                          onClick={() => handlePreviewPack(pack.id)}
                        >
                          Xem thử
                        </button>
                        <button
                          type="button"
                          class="g-iap-buy-btn"
                          disabled={!!buyingPack}
                          data-act={`buy-${pack.id}`}
                          onClick={() => handleBuyPack(pack.id)}
                        >
                          {isBuying ? 'Đang xử lý...' : 'Mua ngay'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div class="g-iap-foot">
            <span class="g-iap-demo-note">Chế độ Demo IAP: Xem thử thoải mái trước khi bấm Mua ngay (không trừ tiền thật).</span>
            {iapPacks.length > 0 && (
              <button
                type="button"
                class="g-iap-reset-btn"
                onClick={() => {
                  a.albumResetIap();
                  clearPreview();
                  setLockNotice('Đã đặt lại trạng thái IAP về mặc định để demo lại.');
                }}
              >
                Đặt lại Demo IAP
              </button>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
