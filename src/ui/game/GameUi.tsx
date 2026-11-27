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
import { KeyHintCard } from './overlays/KeyHintCard';
import { MinimapOverlay } from './overlays/MinimapOverlay';
import { NarratorBanner } from './overlays/NarratorBanner';
import { ConsentModal, DayEndModal, EndPromptModal, FeedbackModal, NoticeModal } from './overlays/NoticeModal';
import { PhotoOverlay } from './overlays/PhotoOverlay';
import { TitleCardOverlay } from './overlays/TitleCardOverlay';
import { AlbumPanel } from './panels/AlbumPanel';
import { Box3dBar, BoxPanel } from './panels/BoxPanel';
import { JournalPanel } from './panels/JournalPanel';
import { MenuModal } from './panels/MenuModal';
import { PhonePanel } from './panels/PhonePanel';
import { ProfileCard } from './panels/ProfileCard';
import { RoomDecorPanel } from './panels/RoomDecorPanel';
import { ShopDemoPanel } from './panels/ShopDemoPanel';
import { WardrobePanel } from './panels/WardrobePanel';
import type { UiActions, UiStore } from './store';

function Ui({ store, a }: { store: UiStore; a: UiActions }) {
  const [s, setS] = useState(store.get());
  // đăng ký xong thì đọc lại ngay: trạng thái có thể đã đổi giữa lần vẽ đầu và lúc effect chạy (vd. câu hỏi đồng ý lúc mở game)
  useEffect(() => { const off = store.subscribe(setS); setS(store.get()); return off; }, []);
  const touch = s.device === 'touch';
  const blocking = !!(s.dialogue || s.choice || s.profile || s.endPrompt || s.dayEnd || s.photo?.phase === 'preview' || s.photo?.phase === 'pick' || s.minigame || s.notice || s.feedback || s.consentAsk || s.panel || s.mapOpen);
  const canClickAdvance = !!(s.dialogue || s.narrator) && !s.panel && !s.mapOpen && !s.choice && !s.profile && !s.endPrompt && !s.dayEnd && !s.minigame && !s.notice && !s.feedback && !s.consentAsk && !s.fade.on;
  return (
    <div class="g-ui" data-ready={String(s.ready)} data-mode={s.mode ?? ''} data-device={s.device}>
      {canClickAdvance && <div class="g-next-backdrop" data-act="next-backdrop" onClick={a.next} />}
      {s.placeholderBanner && <div class="g-banner">Bản khung — nội dung [PLACEHOLDER], không phải cốt truyện</div>}
      <HudBar s={s} a={a} blocking={blocking} />
      <MinimapOverlay s={s} a={a} blocking={blocking} />
      {s.shutterFlash && <div class="g-shutter-flash" data-testid="shutter-flash" />}
      {s.keyHint && !s.titleCard && !blocking && <KeyHintCard keyHint={s.keyHint} />}
      {s.panel === 'box3d' && s.boxView && <Box3dBar boxView={s.boxView} touch={touch} a={a} />}
      {s.dialogue && <DialogueBox dialogue={s.dialogue} touch={touch} a={a} />}
      {s.narrator && <NarratorBanner narrator={s.narrator} touch={touch} a={a} />}
      {s.titleCard && <TitleCardOverlay titleCard={s.titleCard} />}
      {s.choice && <ChoiceBox choice={s.choice} a={a} />}
      {s.profile && <ProfileCard a={a} />}
      {s.endPrompt && <EndPromptModal endPrompt={s.endPrompt} a={a} />}
      {s.dayEnd && <DayEndModal dayEnd={s.dayEnd} a={a} />}
      {s.photo && <PhotoOverlay photo={s.photo} touch={touch} a={a} />}
      {s.minigame && <MinigameFrame host={s.minigame} onExit={a.menuExit} />}
      {s.free && !blocking && (
        <div class="g-free" data-testid="free"><span>{s.free.text}</span><button class="primary" data-act="free-continue" onClick={a.freeContinue}>Đi tiếp</button></div>
      )}
      {s.notice && <NoticeModal notice={s.notice} a={a} />}
      {s.panel === 'box' && <BoxPanel s={s} a={a} />}
      {s.panel === 'album' && <AlbumPanel s={s} a={a} />}
      {s.panel === 'phone' && <PhonePanel s={s} a={a} />}
      {s.panel === 'journal' && <JournalPanel s={s} a={a} />}
      {s.panel === 'room_decor' && <RoomDecorPanel s={s} a={a} />}
      {s.panel === 'wardrobe' && <WardrobePanel s={s} a={a} />}
      {s.shopDemo && s.panel === 'shop' && <ShopDemoPanel s={s} a={a} />}
      {s.panel === 'menu' && <MenuModal s={s} a={a} />}
      {s.feedback && <FeedbackModal a={a} placement={s.feedback} />}
      {s.consentAsk && <ConsentModal a={a} />}
      <div class={`g-fade ${s.fade.on ? 'on' : ''}`} data-testid="fade" data-on={String(s.fade.on)}><span>{s.fade.label}</span></div>
    </div>
  );
}

export function mountGameUi(el: HTMLElement, store: UiStore, actions: UiActions) {
  render(<Ui store={store} a={actions} />, el);
  return () => render(null, el);
}
