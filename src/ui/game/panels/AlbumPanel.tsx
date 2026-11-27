import { useState } from 'preact/hooks';
import { Pop } from '../overlays/NoticeModal';
import type { AlbumEntryView, AlbumView, UiActions, UiState } from '../store';
import { AlbumSticker, pageDecoStickers, pickStickerKind } from './albumStickers';

const SLOT_LABEL: Record<string, string> = {
  main_photo: 'Ảnh kỷ niệm', free_photo: 'Ảnh tự chọn', sticker: 'Sticker', note: 'Ghi chú', artifact: 'Kỷ vật',
  quest_record: 'Dấu đã làm', personal_memory: 'Ký ức riêng', back_note: 'Mặt sau ảnh',
};
const PAGE_LABEL: Record<string, string> = { locked: 'Trang trắng', faded: 'Còn mờ', restored: 'Đã phục hồi', enriched: 'Thêm kỷ niệm', complete: 'Trọn vẹn' };
const PHOTO_TILTS = [-2.2, 2.4, -1.5, 1.8];
const NOTE_TILTS = [1.8, -2.1, 2.6, -1.4];
const STICKER_TILTS = [-9, 8, -6, 11, -12];

type PageData = AlbumView['pages'][number];

function ScrapPage({ p, a }: { p: PageData; a: UiActions }) {
  const items = p.entries.filter((e) => e.slot_type !== 'back_note');
  const photos = items.filter((e) => e.isPhoto);
  const notes = items.filter((e) => !e.isPhoto && (e.slot_type === 'note' || e.slot_type === 'personal_memory'));
  const stickers = items.filter((e) => !e.isPhoto && e.slot_type !== 'note' && e.slot_type !== 'personal_memory');
  const decos = p.state !== 'locked' && p.state !== 'faded' ? pageDecoStickers(p.page_id) : [];

  return (
    <section class={`g-album-page g-page st-${p.state}`} data-page={p.page_id} data-state={p.state}>
      <div class="g-page-head">
        <h3>{p.title}</h3>
        <span class="tag">{PAGE_LABEL[p.state]}</span>
      </div>
      {decos.length > 0 && (
        <div class="g-page-decos" aria-hidden="true">
          {decos.map((d, i) => <AlbumSticker key={i} kind={d.kind} rotate={d.rotate} />)}
        </div>
      )}
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

function CoverPage({ al }: { al: AlbumView }) {
  return (
    <section class="g-album-page g-album-cover-page">
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

export function AlbumPanel({ s, a }: { s: UiState; a: UiActions }) {
  const al = s.album;
  const [spread, setSpread] = useState(0);
  const [turnDir, setTurnDir] = useState<'next' | 'prev' | ''>('');
  if (!al) return null;

  type Leaf = { kind: 'cover' } | { kind: 'page'; page: PageData } | { kind: 'end' };
  const leaves: Leaf[] = [{ kind: 'cover' }, ...al.pages.map((page): Leaf => ({ kind: 'page', page }))];
  if (leaves.length % 2 === 1) leaves.push({ kind: 'end' });
  const totalSpreads = Math.max(1, Math.ceil(leaves.length / 2));
  const cur = Math.min(spread, totalSpreads - 1);
  const left = leaves[cur * 2];
  const right = leaves[cur * 2 + 1];

  const go = (nextIdx: number) => {
    const clamped = Math.max(0, Math.min(totalSpreads - 1, nextIdx));
    if (clamped === cur) return;
    setTurnDir(clamped > cur ? 'next' : 'prev');
    setSpread(clamped);
  };

  const renderLeaf = (leaf: Leaf | undefined) => {
    if (!leaf) return null;
    if (leaf.kind === 'cover') return <CoverPage al={al} />;
    if (leaf.kind === 'end') return <BackEndPage al={al} />;
    return <ScrapPage p={leaf.page} a={a} />;
  };

  return (
    <Pop class="g-panel g-album g-album-book" testid="panel-album">
      <header>
        <h2>Album Kỷ Niệm</h2>
        <span class="g-progress" data-testid="album-progress">{al.progress}</span>
        <button data-act="close" onClick={a.closePanel}>Đóng</button>
      </header>
      <div key={cur} class={`g-album-spread ${turnDir ? `turn-${turnDir}` : ''}`}>
        <div class="g-album-leaf left">{renderLeaf(left)}</div>
        <div class="g-album-spine" aria-hidden="true" />
        <div class="g-album-leaf right">{renderLeaf(right)}</div>
      </div>
      <footer class="g-album-nav">
        <button data-act="album-prev" disabled={cur === 0} onClick={() => go(cur - 1)}>‹ Lật lại</button>
        <div class="g-album-dots">
          {Array.from({ length: totalSpreads }, (_, i) => (
            <button
              key={i}
              class={i === cur ? 'on' : ''}
              data-act={`album-spread-${i}`}
              onClick={() => go(i)}
            >
              {i === 0 ? 'Bìa & Tr.1' : `Tr.${i * 2}–${i * 2 + 1}`}
            </button>
          ))}
        </div>
        <button class="primary" data-act="album-next" disabled={cur >= totalSpreads - 1} onClick={() => go(cur + 1)}>Lật tiếp ›</button>
      </footer>
    </Pop>
  );
}
