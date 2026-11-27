/**
 * Hàm thuần dựng dữ liệu hiển thị cho các bảng UI ở Hub (Hộp Kỷ Vật, Album, Điện thoại).
 * Không phụ thuộc Three.js hay DOM để có thể unit test trực tiếp.
 */
import { GAME_CONFIG } from '../../config/game';
import { HUB_CONFIG, fillCaroScore } from '../../config/hub';
import type { ContentIndex } from '../../content/indexContent';
import type { SaveState } from '../../core/save';
import type { AlbumModel } from '../../systems/album';
import { formatText, speakerName, type PlayerProfile } from '../../systems/dialogue';
import type { HubModel } from '../../systems/hub';
import type { QuestEngine } from '../../systems/questEngine';
import type { AlbumView, BoxView, PhoneView } from '../../ui/game/store';

/** Định dạng chuỗi thoại/nhãn: thay `{player_name}`, `{g:...|...}` và tỉ số caro `{quan}–{duc}`. */
export function formatGameText(text: string, save: Pick<SaveState, 'player_name' | 'appearance' | 'caro'>): string {
  return fillCaroScore(
    formatText(text, { player_name: save.player_name, gender: save.appearance.gender }),
    HUB_CONFIG,
    save.caro.series,
  );
}

/** Dựng dữ liệu bảng Kỷ vật trên kệ (xem lại ký ức). */
export function boxView(deps: { hub: HubModel; fmt: (text: string) => string }): BoxView {
  const { hub, fmt } = deps;
  return {
    compartments: hub.compartments().map((c) => ({
      title: fmt(c.milestone.title),
      open: c.open,
      artifacts: c.artifacts.map((x) => ({
        id: x.artifact.id,
        name: fmt(x.artifact.name),
        hook: fmt(x.artifact.hook_2026),
        state: x.state,
        action: hub.canOpen(x.artifact.id),
      })),
    })),
  };
}

/** Dựng dữ liệu bảng Album từ `AlbumModel` và cache URL ảnh đã nạp. */
export function albumView(deps: {
  idx: ContentIndex;
  album: AlbumModel;
  photoUrls: ReadonlyMap<string, string>;
  flipped: ReadonlySet<string>;
  placedStickers?: SaveState['album_stickers'];
  fmt: (text: string) => string;
}): AlbumView {
  const { idx, album, photoUrls, flipped, placedStickers, fmt } = deps;
  const prog = album.progress();
  const frag = (id: string) => idx.pack.fragments.find((f) => f.id === id);
  const coverId = album.coverEntryId();                  // Trang 4: ảnh cầu vồng (alb.d.g07.03.cover)
  const cover = coverId ? photoUrls.get(coverId) ?? null : null;
  return {
    progress: prog.display === 'pages' ? `${prog.pages_restored}/${prog.pages_total} trang` : `${prog.percent}%`,
    coverUrl: cover,
    placedStickers: placedStickers ?? {},
    pages: album.pages().map((p) => {
      const back = p.entries.find((e) => e.entry.slot_type === 'back_note' && e.owned);
      return {
        page_id: p.page_id,
        title: fmt(p.day.title),
        state: p.state,
        flipped: flipped.has(p.page_id),
        back: back ? { entry_id: back.entry.id, text: fmt(frag(back.entry.fragment_id)?.text ?? '') } : null,
        entries: p.entries.map(({ entry, owned, record }) => {
          const isPhoto = entry.slot_type === 'main_photo' || entry.slot_type === 'free_photo';
          const text = frag(entry.fragment_id)?.text;
          return {
            id: entry.id,
            slot_type: entry.slot_type,
            owned,
            isPhoto,
            text: text ? fmt(text) : null,
            url: photoUrls.get(entry.id) ?? null,
            variants: record?.variants.length ?? 0,
            selected: record?.selected ?? 0,
          };
        }),
      };
    }),
  };
}

/** Dựng dữ liệu bảng Điện thoại (danh sách nhóm chat hoặc nội dung một nhóm + khung soạn tin). */
export function phoneView(deps: {
  idx: ContentIndex;
  hub: HubModel;
  engine: QuestEngine;
  phoneThread: string | null;
  phoneDraft: string | null;
  profile: PlayerProfile;
  fmt: (text: string) => string;
}): PhoneView {
  const { idx, hub, engine, phoneThread, phoneDraft, profile, fmt } = deps;
  const threads = idx.pack.hub.threads.map((t) => ({ id: t.id, title: fmt(t.title) }));
  const th = idx.pack.hub.threads.find((t) => t.id === phoneThread);
  if (!th) return { app: HUB_CONFIG.app_chat_name, threads, thread: null };
  const step = engine.activeSteps().map((r) => r.step).find((s) => s.kind === 'compose_message' && s.thread_id === th.id);
  return {
    app: HUB_CONFIG.app_chat_name,
    threads,
    thread: {
      id: th.id,
      title: fmt(th.title),
      // B8: nhóm chat cũ không có dòng chat nào → chỉ một dòng trạng thái (config/hub.ts)
      status: th.history.length === 0 ? HUB_CONFIG.old_chat_last_label : null,
      messages: hub.threadMessages(th.id).map((m) => ({
        who: speakerName(m.speaker, idx, profile),
        text: fmt(m.text),
        mine: m.speaker === 'player',
      })),
      compose: step && step.kind === 'compose_message'
        ? {
          draft: phoneDraft,
          openers: step.openers.map((o) => ({
            id: o.id,
            text: fmt(o.text),
            tone: o.tone ? GAME_CONFIG.tone_labels[o.tone] : null,
          })),
        }
        : null,
    },
  };
}
