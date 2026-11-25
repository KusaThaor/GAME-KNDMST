import { Pop } from '../overlays/NoticeModal';
import type { UiActions, UiState } from '../store';

const SLOT_LABEL: Record<string, string> = {
  main_photo: 'Ảnh chính', free_photo: 'Ảnh tự chọn', sticker: 'Sticker', note: 'Ghi chú', artifact: 'Kỷ vật',
  quest_record: 'Dấu "đã làm"', personal_memory: 'Ký ức riêng', back_note: 'Mặt sau ảnh',
};
const PAGE_LABEL: Record<string, string> = { locked: 'Trang trắng', faded: 'Còn mờ', restored: 'Đã phục hồi', enriched: 'Thêm kỷ niệm', complete: 'Trọn vẹn' };

export function AlbumPanel({ s, a }: { s: UiState; a: UiActions }) {
  const al = s.album;
  if (!al) return null;
  return (
    <Pop class="g-panel g-album" testid="panel-album">
      <header><h2>Album</h2><span class="g-progress" data-testid="album-progress">{al.progress}</span><button data-act="close" onClick={a.closePanel}>Đóng</button></header>
      <div class="g-cover">{al.coverUrl ? <img src={al.coverUrl} alt="Ảnh bìa" /> : <span>Bìa Album — chưa có ảnh</span>}</div>
      {al.pages.map((p) => (
        <section class={`g-page st-${p.state}`} data-page={p.page_id} data-state={p.state}>
          <h3>{p.title}<span class="tag">{PAGE_LABEL[p.state]}</span></h3>
          {p.state !== 'locked' && (
            <div class="g-slots">
              {p.entries.filter((e) => e.slot_type !== 'back_note').map((e) => (
                <div class={`g-slot ${e.owned ? 'owned' : ''} ${e.isPhoto ? 'photo' : ''}`} data-entry={e.id} data-owned={String(e.owned)}>
                  <small>{SLOT_LABEL[e.slot_type] ?? e.slot_type}</small>
                  {e.owned && e.isPhoto && (p.flipped && p.back
                    ? <div class="g-back" data-testid="photo-back">{p.back.text}</div>
                    : e.url ? <img src={e.url} alt="" data-testid="album-photo" /> : <div class="g-loading">Đang dựng lại ảnh…</div>)}
                  {e.owned && !e.isPhoto && <p>{e.text ?? '✓'}</p>}
                  {!e.owned && <p class="g-hint">{e.isPhoto ? 'Khung ảnh mờ' : '…'}</p>}
                  {e.owned && e.isPhoto && p.back && <button data-act={`flip-${p.page_id}`} onClick={() => a.albumFlip(p.page_id)}>{p.flipped ? 'Xem mặt trước' : 'Lật mặt sau'}</button>}
                  {e.owned && e.variants > 1 && (
                    <div class="g-row">{Array.from({ length: e.variants }, (_, i) => (
                      <button class={i === e.selected ? 'on' : ''} data-act={`variant-${e.id}-${i}`} onClick={() => a.albumSelect(e.id, i)}>Ảnh {i + 1}</button>
                    ))}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </Pop>
  );
}
