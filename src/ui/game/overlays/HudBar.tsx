import { CAMERA_MODES } from '../../../config/camera';
import type { UiActions, UiState } from '../store';
import { TouchInteract, TouchStick } from '../TouchControls';

/** Dòng hướng dẫn xoay camera trên máy tính: theo kiểu camera, hoặc theo "Nhìn tự do" nếu đang bật. */
function lookHint(s: UiState): string {
  if (s.freeLook && s.cameraMode !== 'B') return s.pointerLocked ? 'Rê touchpad/chuột để nhìn · Esc để thả' : 'Bấm vào màn hình để nhìn tự do (L để tắt)';
  return CAMERA_MODES[s.cameraMode].hint;
}

export function HudBar({ s, a, blocking }: { s: UiState; a: UiActions; blocking: boolean }) {
  const touch = s.device === 'touch';
  return (
    <>
      {s.mode && !s.fade.on && (
        <div class="g-top">
          {s.objective && <div class="hud-objective" data-testid="objective"><span class="dot" />{s.objective}</div>}
          <div class="g-buttons">
            {s.mode === 'day' && s.device !== 'touch' && s.camOptions.modeSwitch && (
              <button data-act="camera-mode" data-mode={s.cameraMode} title={CAMERA_MODES[s.cameraMode].hint} onClick={a.toggleCameraMode}>
                Camera {CAMERA_MODES[s.cameraMode].label.replace('Kiểu ', '')} <kbd>V</kbd>
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
