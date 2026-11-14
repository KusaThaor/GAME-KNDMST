/** Trạng thái giao diện của game. UI (Preact) chỉ ĐỌC trạng thái này và gọi `UiActions`; không tự đổi tiến trình. */
import type { Gender } from '../../content/types';

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
    messages: { who: string; text: string; mine: boolean }[];
    compose: { openers: { id: string; text: string; tone: string | null }[]; draft: string | null } | null;
  } | null;
}
export interface PhotoView {
  phase: 'ready' | 'countdown' | 'preview';
  mode: string; seconds: number; posed: boolean;
  url: string | null; marks: { label: string; ok: boolean }[]; score: number; display: 'marks' | 'score';
}

export interface UiState {
  ready: boolean;
  consentAsk: boolean;
  fade: { on: boolean; label: string };
  mode: 'hub' | 'day' | null;
  objective: string | null;
  quests: { title: string; type: string; state: string }[];
  prompt: { key: string; text: string } | null;
  toast: string | null;
  dialogue: { who: string; color: string; text: string } | null;
  choice: { who: string; prompt: string | null; options: { id: string; text: string; tone: string | null }[] } | null;
  profile: boolean;
  endPrompt: { open: number } | null;
  dayEnd: { title: string; replay: boolean } | null;
  photo: PhotoView | null;
  minigame: { game: string } | null;
  free: { text: string } | null;
  notice: { title: string; text: string; effect: string } | null;
  panel: 'box' | 'album' | 'phone' | 'menu' | 'journal' | null;
  box: BoxView | null;
  album: AlbumView | null;
  phone: PhoneView | null;
  feedback: boolean;
  canEndDay: boolean;
  inReplay: boolean;
  wipeArmed: boolean;
  placeholderBanner: boolean;
}

export const initialUi: UiState = {
  ready: false, consentAsk: false, fade: { on: true, label: '' }, mode: null, objective: null, quests: [], prompt: null, toast: null,
  dialogue: null, choice: null, profile: false, endPrompt: null, dayEnd: null, photo: null, minigame: null, free: null, notice: null,
  panel: null, box: null, album: null, phone: null, feedback: false, canEndDay: false, inReplay: false, wipeArmed: false, placeholderBanner: false,
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
  minigameDone(): void;
  freeContinue(): void;
  hubClick(id: string): void;
  openPanel(p: NonNullable<UiState['panel']>): void;
  closePanel(): void;
  openArtifact(id: string): void;
  albumFlip(pageId: string): void;
  albumSelect(entryId: string, index: number): void;
  phoneOpenThread(id: string | null): void;
  phonePick(id: string): void; phoneErase(): void; phoneSend(): void;
  menuRestartDay(): void; menuLeaveDay(): void; menuSafeSpot(): void; menuWipe(): void;
  feedbackSkip(): void;
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
