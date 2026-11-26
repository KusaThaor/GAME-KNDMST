import type { MinigameHost } from '../../game/minigames/host';
/** Trạng thái giao diện của game. UI (Preact) chỉ ĐỌC trạng thái này và gọi `UiActions`; không tự đổi tiến trình. */
import type { Gender } from '../../content/types';
import { DEFAULT_CAMERA_MODE, type CameraModeId } from '../../config/camera';

export interface BoxView {
  compartments: { title: string; open: boolean; artifacts: { id: string; name: string; hook: string; state: string; action: 'first' | 'replay' | null }[] }[];
}
export interface AlbumEntryView {
  id: string; slot_type: string; owned: boolean; text: string | null; url: string | null; isPhoto: boolean;
  variants: number; selected: number;
}
export interface AlbumView {
  progress: string;
  coverUrl: string | null;
  pages: { page_id: string; title: string; state: string; entries: AlbumEntryView[]; back: { entry_id: string; text: string } | null; flipped: boolean }[];
}
export interface PhoneView {
  app: string;
  threads: { id: string; title: string }[];
  thread: {
    id: string; title: string;
    /** Dòng trạng thái thay cho lịch sử chat (B8: "tin cuối cùng đã từ rất lâu"); null = không hiện. */
    status: string | null;
    messages: { who: string; text: string; mine: boolean }[];
    compose: { openers: { id: string; text: string; tone: string | null }[]; draft: string | null } | null;
  } | null;
}
export interface PhotoView {
  phase: 'ready' | 'countdown' | 'preview' | 'pick';
  mode: string; seconds: number; posed: boolean;
  url: string | null; marks: { label: string; ok: boolean }[]; score: number; display: 'marks' | 'score';
  /** Chụp nhiều lần (N-14): lần đang chụp (đếm từ 1) / tổng số lần. */
  shot?: { index: number; total: number };
  /** Màn chọn 1 tấm (phase 'pick'): các tấm vừa chụp và tấm đang chọn. */
  picks?: { url: string; marks: { label: string; ok: boolean }[]; score: number }[];
  picked?: number;
}

export interface UiState {
  ready: boolean;
  consentAsk: boolean;
  fade: { on: boolean; label: string };
  mode: 'hub' | 'day' | null;
  objective: string | null;
  collectProgress?: { done: number; total: number } | null;
  quests: { title: string; type: string; state: string }[];
  prompt: { key: string; text: string } | null;
  toast: string | null;
  /** Kiểu điều khiển camera đang dùng trong Ngày ký ức (Chuẩn: kéo · A: giữ chuột phải · B: khóa con trỏ). */
  cameraMode: CameraModeId;
  /** Người chơi đang dùng gì: 'keyboard' = chuột/bàn phím/touchpad, 'touch' = cảm ứng. Chỉ để đổi giao diện; không vào analytics. */
  device: 'keyboard' | 'touch';
  /** Tùy chọn "Nhìn tự do" đang bật; con trỏ đang bị khóa. Chỉ để hiện chữ hướng dẫn. */
  freeLook: boolean;
  /** Có cho người chơi đổi kiểu camera / bật Nhìn tự do không (CAMERA_OPTIONS; mặc định tắt). */
  camOptions: { modeSwitch: boolean; freeLook: boolean };
  pointerLocked: boolean;
  dialogue: { who: string; color: string; text: string } | null;
  choice: { who: string; prompt: string | null; options: { id: string; text: string; tone: string | null }[] } | null;
  profile: boolean;
  endPrompt: { open: number } | null;
  dayEnd: { title: string; replay: boolean } | null;
  photo: PhotoView | null;
  minigame: MinigameHost | null;
  free: { text: string } | null;
  notice: { title: string; text: string; effect: string } | null;
  /** 'box3d' = đang nhìn cận cảnh vào Hộp Kỷ Vật ở phòng 2026; 'box' = bảng kỷ vật trên kệ (xem lại ký ức). */
  panel: 'box' | 'box3d' | 'album' | 'phone' | 'menu' | 'journal' | null;
  box: BoxView | null;
  /** Lớp chữ khi đang nhìn vào Hộp Kỷ Vật: dòng hướng dẫn + tên món dưới con trỏ. */
  boxView: { hint: string; hover: string | null; first: boolean } | null;
  album: AlbumView | null;
  phone: PhoneView | null;
  /** Form phản hồi đang mở: 'demo_end' = sau màn kết bản thử; 'exit' = người chơi bấm Thoát (xong form thì rời game). */
  feedback: false | 'demo_end' | 'exit';
  canEndDay: boolean;
  inReplay: boolean;
  wipeArmed: boolean;
  placeholderBanner: boolean;
}

export const initialUi: UiState = {
  ready: false, consentAsk: false, fade: { on: true, label: '' }, mode: null, objective: null, collectProgress: null, quests: [], prompt: null, toast: null, cameraMode: DEFAULT_CAMERA_MODE, device: 'keyboard', freeLook: false, pointerLocked: false, camOptions: { modeSwitch: false, freeLook: false },
  dialogue: null, choice: null, profile: false, endPrompt: null, dayEnd: null, photo: null, minigame: null, free: null, notice: null,
  panel: null, box: null, boxView: null, album: null, phone: null, feedback: false, canEndDay: false, inReplay: false, wipeArmed: false, placeholderBanner: false,
};

export interface UiActions {
  consent(granted: boolean): void;
  next(): void;
  choose(id: string): void;
  submitProfile(name: string, gender: Gender): void;
  endPrompt(answer: 'leave' | 'stay'): void;
  continueDayEnd(): void;
  endDayNow(): void;
  photoStart(): void; photoPose(): void; photoKeep(): void; photoRetry(): void;
  /** Màn chọn 1 tấm: đánh dấu tấm thứ `index` (đếm từ 0); "Giữ ảnh này" mới lưu. */
  photoPick(index: number): void;
  freeContinue(): void;
  hubClick(id: string): void;
  openPanel(p: NonNullable<UiState['panel']>): void;
  closePanel(): void;
  openArtifact(id: string): void;
  /** Bấm một món trong Hộp Kỷ Vật (cận cảnh): đồ linh tinh nói một câu; kỷ vật đang sáng đưa về quá khứ. */
  boxPick(id: string): void;
  albumFlip(pageId: string): void;
  albumSelect(entryId: string, index: number): void;
  phoneOpenThread(id: string | null): void;
  phonePick(id: string): void; phoneErase(): void; phoneSend(): void;
  menuRestartDay(): void; menuLeaveDay(): void; menuSafeSpot(): void; menuWipe(): void;
  /** Nút Thoát (Menu tạm dừng, cả phòng 2026, Ngày ký ức lẫn lúc đang chơi minigame): hiện Form phản hồi rồi rời game. */
  menuExit(): void;
  /** Đóng Form phản hồi mở từ nút Thoát, quay lại chơi tiếp (không gửi, không rời game). */
  feedbackCancel(): void;
  feedbackSkip(): void;
  feedbackSubmitted(): void;
  toggleCameraMode(): void;
  /** Bật/tắt "Nhìn tự do" (phím L hoặc nút trong Menu). */
  toggleFreeLook(): void;
  /** Nút E ảo (cảm ứng) / bấm gợi ý: tương tác với thứ đang ở gần. */
  interact(): void;
  /** Nút tròn ảo: ý định di chuyển, null = thả tay. */
  stick(v: { forward: number; strafe: number; run: boolean } | null): void;
}

export interface UiStore {
  get(): UiState;
  set(patch: Partial<UiState>): void;
  subscribe(fn: (s: UiState) => void): () => void;
}

export function createUiStore(): UiStore {
  let state = initialUi;
  const subs = new Set<(s: UiState) => void>();
  return {
    get: () => state,
    set(patch) { state = { ...state, ...patch }; subs.forEach((f) => f(state)); },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
  };
}
