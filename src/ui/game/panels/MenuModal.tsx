import { CAMERA_MODES } from '../../../config/camera';
import { Pop } from '../overlays/NoticeModal';
import type { UiActions, UiState } from '../store';

export function MenuModal({ s, a }: { s: UiState; a: UiActions }) {
  return (
    <Pop class="g-card g-menu" testid="panel-menu">
      <h2>Tạm dừng</h2>
      <button class="primary" data-act="resume" onClick={a.closePanel}>Chơi tiếp</button>
      {s.mode === 'day' && <button data-act="restart-day" onClick={a.menuRestartDay}>Chơi lại Ngày từ đầu</button>}
      {s.mode === 'day' && <button data-act="safe-spot" onClick={a.menuSafeSpot}>Về chỗ an toàn</button>}
      {s.mode === 'day' && s.device !== 'touch' && s.camOptions.freeLook && (
        <button data-act="menu-free-look" data-on={String(s.freeLook)} onClick={a.toggleFreeLook}>
          Nhìn tự do bằng touchpad: {s.freeLook ? 'BẬT' : 'TẮT'} <kbd>L</kbd>
        </button>
      )}
      {s.mode === 'day' && s.camOptions.modeSwitch && (
        <button data-act="menu-camera-mode" data-mode={s.cameraMode} onClick={a.toggleCameraMode}>
          Kiểu camera: {CAMERA_MODES[s.cameraMode].label}{s.device === 'touch' ? '' : ` — ${CAMERA_MODES[s.cameraMode].hint}`}
        </button>
      )}
      {s.mode === 'day' && s.inReplay && <button data-act="leave-day" onClick={a.menuLeaveDay}>Về phòng (thôi xem lại)</button>}
      <button data-act="menu-exit" onClick={a.menuExit}>Thoát</button>
      <button class="danger" data-act="wipe" onClick={a.menuWipe}>{s.wipeArmed ? 'Bấm lần nữa để xóa hết' : 'Xóa tiến trình'}</button>
      <p class="g-hint">Tiến trình và ảnh lưu trong trình duyệt này. Xóa dữ liệu trình duyệt sẽ mất cả hai.</p>
    </Pop>
  );
}
