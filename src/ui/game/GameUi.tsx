/**
 * Giao diện game (Preact): HUD, thoại, lựa chọn, ảnh, Hộp Kỷ Vật, Album, điện thoại, menu.
 * Chỉ đọc UiState và gọi UiActions. Mọi nút có `data-act` để bot kiểm thử bấm được.
 */
import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { MinigameFrame } from './MinigameFrame';
import { ChoiceBox } from './overlays/ChoiceBox';
import { DialogueBox } from './overlays/DialogueBox';
import { HudBar } from './overlays/HudBar';
import { ConsentModal, DayEndModal, EndPromptModal, FeedbackModal, NoticeModal } from './overlays/NoticeModal';
import { PhotoOverlay } from './overlays/PhotoOverlay';
import { AlbumPanel } from './panels/AlbumPanel';
import { Box3dBar, BoxPanel } from './panels/BoxPanel';
import { JournalPanel } from './panels/JournalPanel';
import { MenuModal } from './panels/MenuModal';
import { PhonePanel } from './panels/PhonePanel';
import { ProfileCard } from './panels/ProfileCard';
import type { UiActions, UiStore } from './store';

function Ui({ store, a }: { store: UiStore; a: UiActions }) {
  const [s, setS] = useState(store.get());
  // đăng ký xong thì đọc lại ngay: trạng thái có thể đã đổi giữa lần vẽ đầu và lúc effect chạy (vd. câu hỏi đồng ý lúc mở game)
  useEffect(() => { const off = store.subscribe(setS); setS(store.get()); return off; }, []);
  const touch = s.device === 'touch';
  const blocking = !!(s.dialogue || s.choice || s.profile || s.endPrompt || s.dayEnd || s.photo?.phase === 'preview' || s.photo?.phase === 'pick' || s.minigame || s.notice || s.feedback || s.consentAsk || s.panel);
  return (
    <div class="g-ui" data-ready={String(s.ready)} data-mode={s.mode ?? ''} data-device={s.device}>
      {s.placeholderBanner && <div class="g-banner">Bản khung — nội dung [PLACEHOLDER], không phải cốt truyện</div>}
      <HudBar s={s} a={a} blocking={blocking} />
      {s.panel === 'box3d' && s.boxView && <Box3dBar boxView={s.boxView} touch={touch} a={a} />}
      {s.dialogue && <DialogueBox dialogue={s.dialogue} touch={touch} a={a} />}
      {s.choice && <ChoiceBox choice={s.choice} a={a} />}
      {s.profile && <ProfileCard a={a} />}
      {s.endPrompt && <EndPromptModal endPrompt={s.endPrompt} a={a} />}
      {s.dayEnd && <DayEndModal dayEnd={s.dayEnd} a={a} />}
      {s.photo && <PhotoOverlay photo={s.photo} touch={touch} a={a} />}
      {s.minigame && <MinigameFrame host={s.minigame} />}
      {s.free && !blocking && (
        <div class="g-free" data-testid="free"><span>{s.free.text}</span><button class="primary" data-act="free-continue" onClick={a.freeContinue}>Đi tiếp</button></div>
      )}
      {s.notice && <NoticeModal notice={s.notice} a={a} />}
      {s.panel === 'box' && <BoxPanel s={s} a={a} />}
      {s.panel === 'album' && <AlbumPanel s={s} a={a} />}
      {s.panel === 'phone' && <PhonePanel s={s} a={a} />}
      {s.panel === 'journal' && <JournalPanel s={s} a={a} />}
      {s.panel === 'menu' && <MenuModal s={s} a={a} />}
      {s.feedback && <FeedbackModal a={a} />}
      {s.consentAsk && <ConsentModal a={a} />}
      <div class={`g-fade ${s.fade.on ? 'on' : ''}`} data-testid="fade" data-on={String(s.fade.on)}><span>{s.fade.label}</span></div>
    </div>
  );
}

export function mountGameUi(el: HTMLElement, store: UiStore, actions: UiActions) {
  render(<Ui store={store} a={actions} />, el);
  return () => render(null, el);
}
