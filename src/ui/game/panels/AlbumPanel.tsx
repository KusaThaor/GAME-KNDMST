import { useEffect, useRef, useState } from 'preact/hooks';
import { Pop } from '../overlays/NoticeModal';
import type { AlbumEntryView, AlbumView, PlacedStickerView, UiActions, UiState } from '../store';
import { ALL_STICKERS, AlbumSticker, pageDecoStickers, pickStickerKind, type StickerKind } from './albumStickers';

const SLOT_LABEL: Record<string, string> = {
  main_photo: 'Ảnh kỷ niệm', free_photo: 'Ảnh tự chọn', sticker: 'Sticker', note: 'Ghi chú', artifact: 'Kỷ vật',
  quest_record: 'Dấu đã làm', personal_memory: 'Ký ức riêng', back_note: 'Mặt sau ảnh',
};
const PAGE_LABEL: Record<string, string> = { locked: 'Trang trắng', faded: 'Còn mờ', restored: 'Đã phục hồi', enriched: 'Thêm kỷ niệm', complete: 'Trọn vẹn' };
const PHOTO_TILTS = [-2.2, 2.4, -1.5, 1.8];
const NOTE_TILTS = [1.8, -2.1, 2.6, -1.4];
const STICKER_TILTS = [-9, 8, -6, 11, -12];

type PageData = AlbumView['pages'][number];

function ScrapPage({
  p,
  placed,
  dragging,
  onStartMoveSticker,
  a,
}: {
  p: PageData;
  placed: PlacedStickerView[];
  dragging: boolean;
  onStartMoveSticker: (pageId: string, sticker: PlacedStickerView, e: PointerEvent) => void;
  a: UiActions;
}) {
  const items = p.entries.filter((e) => e.slot_type !== 'back_note');
  const photos = items.filter((e) => e.isPhoto);
  const notes = items.filter((e) => !e.isPhoto && (e.slot_type === 'note' || e.slot_type === 'personal_memory'));
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
        <span class="tag">{PAGE_LABEL[p.state]}</span>
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
      {p.state === 'locked' ? (
        <div class="g-page-blank">
          <AlbumSticker kind="note_pin" rotate={-8} />
          <p>Trang ký ức này vẫn còn trắng…</p>
        </div>
      ) : (
        <div class="g-scrapbook">
          {photos.map((e, i) => (
            <div
              key={e.id}
              class={`g-scrap-photo ${e.owned ? 'owned' : ''}`}
              style={{ transform: `rotate(${PHOTO_TILTS[i % PHOTO_TILTS.length]}deg)` }}
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
                <div class="g-photo-blank">Khung ảnh mờ</div>
              )}
              <div class="g-scrap-caption">
                <small>{SLOT_LABEL[e.slot_type] ?? e.slot_type}</small>
                {e.owned && p.back && (
                  <button data-act={`flip-${p.page_id}`} onClick={() => a.albumFlip(p.page_id)}>
                    {p.flipped ? 'Xem mặt trước' : 'Lật mặt sau'}
                  </button>
                )}
              </div>
              {e.owned && e.variants > 1 && (
                <div class="g-row">
                  {Array.from({ length: e.variants }, (_, k) => (
                    <button class={k === e.selected ? 'on' : ''} data-act={`variant-${e.id}-${k}`} onClick={() => a.albumSelect(e.id, k)}>Ảnh {k + 1}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div class="g-scrap-extras">
            {notes.map((e, i) => (
              <div
                key={e.id}
                class={`g-scrap-note ${e.owned ? 'owned' : ''}`}
                style={{ transform: `rotate(${NOTE_TILTS[i % NOTE_TILTS.length]}deg)` }}
                data-entry={e.id}
                data-owned={String(e.owned)}
              >
                <small>{SLOT_LABEL[e.slot_type] ?? e.slot_type}</small>
                {e.owned ? <p>{e.text ?? '✓'}</p> : <p class="g-hint">…</p>}
              </div>
            ))}
            {stickers.map((e: AlbumEntryView, i: number) => (
              <div
                key={e.id}
                class={`g-scrap-badge ${e.owned ? 'owned' : ''}`}
                style={{ transform: `rotate(${STICKER_TILTS[i % STICKER_TILTS.length]}deg)` }}
                data-entry={e.id}
                data-owned={String(e.owned)}
              >
                <AlbumSticker kind={pickStickerKind(e.id, e.slot_type, i)} label={e.owned ? (e.text ?? SLOT_LABEL[e.slot_type]) : undefined} />
                <div class="g-scrap-badge-text">
                  <small>{SLOT_LABEL[e.slot_type] ?? e.slot_type}</small>
                  <span>{e.owned ? (e.text ?? '✓') : 'Chưa mở'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
      <p class="g-cover-title">Những Ngày Mình Còn Nhỏ</p>
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
  const dragRef = useRef<DragState | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const timerRef = useRef<number>(0);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

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
  const renderLeaf = (leaf: Leaf | undefined) => {
    if (!leaf) return null;
    if (leaf.kind === 'cover') {
      return <CoverPage al={al} placed={placedMap['cover'] ?? []} dragging={!!drag} onStartMoveSticker={startMoveStickerDrag} a={a} />;
    }
    if (leaf.kind === 'end') return <BackEndPage al={al} />;
    return (
      <ScrapPage
        p={leaf.page}
        placed={placedMap[leaf.page.page_id] ?? []}
        dragging={!!drag}
        onStartMoveSticker={startMoveStickerDrag}
        a={a}
      />
    );
  };

  return (
    <Pop class="g-panel g-album g-album-book" testid="panel-album">
      <header>
        <h2>Album Kỷ Niệm</h2>
        <span class="g-progress" data-testid="album-progress">{al.progress}</span>
        <button data-act="close" onClick={a.closePanel}>Đóng</button>
      </header>
      <div class="g-sticker-bar" data-testid="sticker-tray">
        <span class="g-sticker-bar-label">Kho sticker (kéo thả lên trang):</span>
        <div class="g-sticker-bar-list">
          {ALL_STICKERS.map((st) => (
            <button
              key={st.kind}
              type="button"
              class="g-sticker-chip"
              title={`Kéo ${st.label} thả vào trang`}
              onPointerDown={(e) => startNewStickerDrag(st.kind, e)}
            >
              <AlbumSticker kind={st.kind} />
            </button>
          ))}
        </div>
      </div>
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
          {renderLeaf(left)}
          {canPrev && <span class="g-page-corner prev" data-act="album-prev" aria-label="Lật lại trang trước" />}
        </div>
        <div class="g-album-spine" aria-hidden="true" />
        <div
          class={`g-album-leaf right ${canNext ? 'can-flip' : ''}`}
          onClick={(e) => onLeafClick('right', e)}
          title={canNext ? 'Bấm hoặc kéo sang trái để lật tiếp' : undefined}
        >
          {renderLeaf(right)}
          {canNext && <span class="g-page-corner next" data-act="album-next" aria-label="Lật sang trang sau" />}
        </div>
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
  );
}
