import { CAMERA_MODES } from '../../../config/camera';
import { SHOP_DEMO_CONFIG } from '../../../config/shopDemo';
import { CoinSvg, ShopBagSvg, StampSvg } from '../panels/shopIcons';
import type { UiActions, UiState } from '../store';
import { TouchInteract, TouchStick } from '../TouchControls';

/** Dòng hướng dẫn xoay camera trên máy tính: theo kiểu camera, hoặc theo "Nhìn tự do" nếu đang bật. */
function lookHint(s: UiState): string {
  if (s.freeLook && s.cameraMode !== 'B') return s.pointerLocked ? 'Rê touchpad/chuột để nhìn · Esc để thả' : 'Bấm vào màn hình để nhìn tự do (L để tắt)';
  return CAMERA_MODES[s.cameraMode].hint;
}

function CameraIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

export function HudBar({ s, a, blocking }: { s: UiState; a: UiActions; blocking: boolean }) {
  const touch = s.device === 'touch';
  const canSelfie = !!(s.mode && !s.fade.on && !s.minigame && !s.consentAsk && !s.profile);
  const wallet = s.cosmetics?.wallet ?? SHOP_DEMO_CONFIG.demo_wallet;
  return (
    <>
      {s.mode && !s.fade.on && (
        <div class="g-top">
          <div class="g-top-left">
            {s.objective && (
              <div class="hud-objective" data-testid="objective">
                <span class="dot" />
                <span>{s.objective}</span>
                {s.collectProgress && (
                  <span class="tag" data-testid="collect-counter">
                    {s.collectProgress.done}/{s.collectProgress.total}
                  </span>
                )}
              </div>
            )}
          </div>
          <div class="g-buttons">
            {canSelfie && (
              <button
                class="g-btn-icon"
                data-act="selfie"
                title="Chụp ảnh tự sướng lưu về máy (C)"
                aria-label="Chụp ảnh tự sướng"
                onClick={a.takeSelfie}
              >
                <CameraIcon />
                <kbd>C</kbd>
              </button>
            )}
            {s.mode === 'day' && s.device !== 'touch' && s.camOptions.modeSwitch && (
              <button data-act="camera-mode" data-mode={s.cameraMode} title={CAMERA_MODES[s.cameraMode].hint} onClick={a.toggleCameraMode}>
                Camera {CAMERA_MODES[s.cameraMode].label.replace('Kiểu ', '')} <kbd>V</kbd>
              </button>
            )}
            {s.shopDemo && (
              <button
                class="g-shop-hud-btn"
                data-act="shop-demo"
                title={SHOP_DEMO_CONFIG.ui.panel_title}
                onClick={() => a.openPanel('shop')}
              >
                <span class="g-hud-cur"><CoinSvg size={15} /> {wallet.coin}</span>
                <span class="g-hud-cur"><StampSvg size={15} /> {wallet.stamp}</span>
                <span class="g-shop-hud-label"><ShopBagSvg size={14} /> {SHOP_DEMO_CONFIG.ui.hud_button_label}</span>
              </button>
            )}
            {s.mode === 'hub' && (
              <button data-act="room-decor" title="Trang trí phòng 2026" onClick={() => a.openPanel('room_decor')}>
                🛋️ Trang trí phòng
              </button>
            )}
            {s.mode && (
              <button data-act="wardrobe" title="Tủ đồ & trang phục 3D" onClick={() => a.openPanel('wardrobe')}>
                👕 Tủ đồ
              </button>
            )}
            {s.mode === 'day' && <button data-act="journal" onClick={() => a.openPanel('journal')}>Sổ tay <kbd>J</kbd></button>}
            {s.canEndDay && <button class="primary" data-act="end-day" onClick={a.endDayNow}>Kết thúc Ngày</button>}
            <button data-act="menu" onClick={() => a.openPanel('menu')}>Menu <kbd>Esc</kbd></button>
          </div>
        </div>
      )}
      {s.toast && <div class="hud-zone" data-testid="toast">{s.toast}</div>}
      {s.mode === 'day' && !s.fade.on && !blocking && !s.photo && (
        s.device === 'touch'
          ? <div class="hud-keys" data-testid="keys" data-device="touch">Kéo nút tròn để đi · Kéo màn hình để xoay · Chụm 2 ngón để phóng</div>
          : <div class="hud-keys" data-testid="keys" data-device="keyboard"><kbd>WASD</kbd> đi · <kbd>Shift</kbd> chạy · <kbd>E</kbd> tương tác · {lookHint(s)} · lăn chuột để phóng · touchpad: vuốt 2 ngón ngang để xoay, dọc để phóng</div>
      )}
      {s.mode === 'hub' && !s.fade.on && !blocking && (
        touch
          ? <div class="hud-keys" data-testid="keys" data-device="touch">Kéo nút tròn để đi · Kéo màn hình để nhìn quanh</div>
          : <div class="hud-keys" data-testid="keys" data-device="keyboard"><kbd>WASD</kbd> đi · <kbd>Shift</kbd> chạy · rê chuột để nhìn quanh · <kbd>E</kbd> hoặc bấm chuột để tương tác</div>
      )}
      {s.prompt && !blocking && !(touch && (s.mode === 'day' || s.mode === 'hub')) && (
        <div class="hud-prompt" data-testid="prompt"><kbd>{s.prompt.key}</kbd>{s.prompt.text}</div>
      )}
      {touch && (s.mode === 'day' || s.mode === 'hub') && !s.fade.on && !blocking && (!s.photo || (s.photo.phase === 'countdown' && !s.photo.posed)) && <TouchStick a={a} />}
      {touch && (s.mode === 'day' || s.mode === 'hub') && s.prompt && !blocking && !s.photo && <TouchInteract a={a} text={s.prompt.text} />}
    </>
  );
}
