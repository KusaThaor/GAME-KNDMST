/**
 * Giao diện game (Preact): HUD, thoại, lựa chọn, ảnh, Hộp Kỷ Vật, Album, điện thoại, menu.
 * Chỉ đọc UiState và gọi UiActions. Mọi nút có `data-act` để bot kiểm thử bấm được.
 */
import { FeedbackForm } from './FeedbackForm';
import { render } from 'preact';
import { CAMERA_MODES } from '../../config/camera';
import { useEffect, useRef, useState } from 'preact/hooks';
import { PLAYER_NAME_MAX } from '../../core/save';
import type { Gender } from '../../content/types';
import { fadeIn } from '../motion';
import type { UiActions, UiState, UiStore } from './store';
import { MinigameFrame } from './MinigameFrame';
import { TouchInteract, TouchStick } from './TouchControls';

const SLOT_LABEL: Record<string, string> = {
  main_photo: 'Ảnh chính', free_photo: 'Ảnh tự chọn', sticker: 'Sticker', note: 'Ghi chú', artifact: 'Kỷ vật',
  quest_record: 'Dấu "đã làm"', personal_memory: 'Ký ức riêng', back_note: 'Mặt sau ảnh',
};
const PAGE_LABEL: Record<string, string> = { locked: 'Trang trắng', faded: 'Còn mờ', restored: 'Đã phục hồi', enriched: 'Thêm kỷ niệm', complete: 'Trọn vẹn' };
const ART_LABEL: Record<string, string> = { hidden: '', dim: 'Chưa nhớ ra', glowing: 'Đang sáng', visited: 'Đã ghé lại', on_shelf: 'Trên kệ' };
const QUEST_LABEL: Record<string, string> = { locked: 'Chưa mở', available: 'Có thể làm', active: 'Đang làm', completed: 'Đã xong', missed: 'Đã lỡ' };

function Pop(props: { class: string; children: preact.ComponentChildren; testid?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (ref.current) fadeIn(ref.current); }, []);
  return <div ref={ref} class={props.class} data-testid={props.testid}>{props.children}</div>;
}

function Profile({ a }: { a: UiActions }) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const ok = name.trim().length > 0;
  return (
    <Pop class="g-card g-profile" testid="profile">
      <h2>Bạn tên là gì?</h2>
      <input data-act="name" value={name} maxLength={PLAYER_NAME_MAX} placeholder={`Tối đa ${PLAYER_NAME_MAX} ký tự`} autoFocus
        onInput={(e) => setName((e.target as HTMLInputElement).value)} />
      <p class="g-hint">Tên chỉ lưu trên máy của bạn.</p>
      <div class="g-row">
        <button class={gender === 'male' ? 'on' : ''} data-act="gender-male" onClick={() => setGender('male')}>Nam</button>
        <button class={gender === 'female' ? 'on' : ''} data-act="gender-female" onClick={() => setGender('female')}>Nữ</button>
      </div>
      <button class="primary" data-act="profile-ok" disabled={!ok} onClick={() => a.submitProfile(name, gender)}>Bắt đầu</button>
    </Pop>
  );
}

function Box({ s, a }: { s: UiState; a: UiActions }) {
  return (
    <Pop class="g-panel" testid="panel-box">
      <header><h2>Hộp Kỷ Vật</h2><button data-act="close" onClick={a.closePanel}>Đóng</button></header>
      {s.box?.compartments.map((c) => (
        <section class={`g-compartment ${c.open ? '' : 'closed'}`}>
          <h3>{c.title}{c.open ? '' : ' — chưa mở'}</h3>
          {c.open && c.artifacts.length === 0 && <p class="g-hint">Ngăn này chưa có kỷ vật trong bản này.</p>}
          {c.open && c.artifacts.map((x) => x.state !== 'hidden' && (
            <div class={`g-artifact st-${x.state}`} data-artifact={x.id} data-state={x.state}>
              <div><b>{x.name}</b><span class="tag">{ART_LABEL[x.state]}</span>{x.action && <p>{x.hook}</p>}</div>
              {x.action === 'first' && <button class="primary" data-act={`open-${x.id}`} onClick={() => a.openArtifact(x.id)}>Nhớ lại</button>}
              {x.action === 'replay' && <button data-act={`open-${x.id}`} onClick={() => a.openArtifact(x.id)}>Xem lại ký ức</button>}
            </div>
          ))}
        </section>
      ))}
    </Pop>
  );
}

function Album({ s, a }: { s: UiState; a: UiActions }) {
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

function Phone({ s, a }: { s: UiState; a: UiActions }) {
  const ph = s.phone;
  if (!ph) return null;
  const th = ph.thread;
  return (
    <Pop class="g-phone" testid="panel-phone">
      <header><b>{ph.app}</b><button data-act="close" onClick={a.closePanel}>Đóng</button></header>
      {!th && <div class="g-threads">{ph.threads.map((t) => <button data-act={`thread-${t.id}`} onClick={() => a.phoneOpenThread(t.id)}>{t.title}</button>)}</div>}
      {th && (
        <div class="g-thread" data-thread={th.id}>
          <div class="g-thread-head"><button data-act="thread-back" onClick={() => a.phoneOpenThread(null)}>‹</button><b>{th.title}</b></div>
          <div class="g-msgs">{th.messages.map((m) => <div class={`g-msg ${m.mine ? 'mine' : ''}`}>{!m.mine && <small>{m.who}</small>}<span>{m.text}</span></div>)}</div>
          {th.compose && (
            <div class="g-compose" data-testid="compose">
              {th.compose.draft === null
                ? th.compose.openers.map((o) => <button data-act={`opener-${o.id}`} onClick={() => a.phonePick(o.id)}>{o.text}{o.tone && <span class="tag">{o.tone}</span>}</button>)
                : (<>
                  <div class="g-draft" data-testid="draft">{th.compose.openers.find((o) => o.id === th.compose!.draft)?.text}</div>
                  <div class="g-row"><button data-act="erase" onClick={a.phoneErase}>Xóa, viết lại</button><button class="primary" data-act="send" onClick={a.phoneSend}>Gửi</button></div>
                </>)}
            </div>
          )}
        </div>
      )}
    </Pop>
  );
}

function Ui({ store, a }: { store: UiStore; a: UiActions }) {
  const [s, setS] = useState(store.get());
  // đăng ký xong thì đọc lại ngay: trạng thái có thể đã đổi giữa lần vẽ đầu và lúc effect chạy (vd. câu hỏi đồng ý lúc mở game)
  useEffect(() => { const off = store.subscribe(setS); setS(store.get()); return off; }, []);
  const touch = s.device === 'touch';
  const blocking = s.dialogue || s.choice || s.profile || s.endPrompt || s.dayEnd || s.photo?.phase === 'preview' || s.minigame || s.notice || s.feedback || s.consentAsk || s.panel;
  return (
    <div class="g-ui" data-ready={String(s.ready)} data-mode={s.mode ?? ''} data-device={s.device}>
      {s.placeholderBanner && <div class="g-banner">Bản khung — nội dung [PLACEHOLDER], không phải cốt truyện</div>}
      {s.mode && !s.fade.on && (
        <div class="g-top">
          {s.objective && <div class="hud-objective" data-testid="objective"><span class="dot" />{s.objective}</div>}
          <div class="g-buttons">
            {s.mode === 'day' && s.device !== 'touch' && s.camOptions.modeSwitch && <button data-act="camera-mode" data-mode={s.cameraMode} title={CAMERA_MODES[s.cameraMode].hint} onClick={a.toggleCameraMode}>Camera {CAMERA_MODES[s.cameraMode].label.replace('Kiểu ', '')} <kbd>V</kbd></button>}
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
      {s.prompt && !blocking && !(touch && (s.mode === 'day' || s.mode === 'hub')) && <div class="hud-prompt" data-testid="prompt"><kbd>{s.prompt.key}</kbd>{s.prompt.text}</div>}
      {touch && (s.mode === 'day' || s.mode === 'hub') && !s.fade.on && !blocking && (!s.photo || (s.photo.phase === 'countdown' && !s.photo.posed)) && <TouchStick a={a} />}
      {touch && (s.mode === 'day' || s.mode === 'hub') && s.prompt && !blocking && !s.photo && <TouchInteract a={a} text={s.prompt.text} />}
      {s.panel === 'box3d' && s.boxView && (
        <div class="g-box3d" data-testid="panel-box3d" data-first={String(s.boxView.first)}>
          <b>Hộp Kỷ Vật</b>
          <span class="g-box3d-hint" data-testid="box-hint">{s.boxView.hint}</span>
          <span class="g-box3d-hover" data-testid="box-hover">{s.boxView.hover ?? ''}</span>
          <button data-act="close" onClick={a.closePanel}>Đóng hộp{!touch && <> <kbd>Esc</kbd></>}</button>
        </div>
      )}

      {s.dialogue && (
        <div class="hud-dialogue g-click" data-testid="dialogue" data-act="next" onClick={a.next}>
          {s.dialogue.who && <div class="who" style={{ color: s.dialogue.color }}>{s.dialogue.who}</div>}
          <div class="text">{s.dialogue.text}</div>
          <div class="next">{touch ? 'Chạm ▸' : 'Space ▸'}</div>
        </div>
      )}
      {s.choice && (
        <div class="hud-dialogue" data-testid="choice">
          {s.choice.who && <div class="who">{s.choice.who}</div>}
          {s.choice.prompt && <div class="text">{s.choice.prompt}</div>}
          <div class="choices">{s.choice.options.map((o, i) => (
            <button class="choice" data-act={`choice-${o.id}`} onClick={() => a.choose(o.id)}><kbd>{i + 1}</kbd>{o.text}{o.tone && <span class="tag">{o.tone}</span>}</button>
          ))}</div>
        </div>
      )}
      {s.profile && <Profile a={a} />}
      {s.endPrompt && (
        <Pop class="g-card" testid="end-prompt">
          <h2>Kết thúc ngày hôm nay?</h2>
          <p>Còn {s.endPrompt.open} việc chưa làm với các bạn. Không làm cũng không sao.</p>
          <div class="g-row"><button data-act="stay" onClick={() => a.endPrompt('stay')}>Ở lại</button><button class="primary" data-act="leave" onClick={() => a.endPrompt('leave')}>Đi tiếp</button></div>
        </Pop>
      )}
      {s.dayEnd && (
        <Pop class="g-card" testid="day-end">
          <h2>{s.dayEnd.title}</h2>
          <p>{s.dayEnd.replay ? 'Bạn vừa ghé lại ký ức này.' : 'Một ngày đã khép lại.'}</p>
          <button class="primary" data-act="day-end-continue" onClick={a.continueDayEnd}>Về phòng</button>
        </Pop>
      )}
      {s.photo && s.photo.phase === 'ready' && (
        <Pop class="g-card g-photo-ready" testid="photo-ready">
          <h2>Máy ảnh đã đặt</h2>
          <p>{s.photo.mode === 'timer' ? `Bấm hẹn giờ, chạy vào vòng sáng rồi bấm ${touch ? 'nút Tạo dáng' : 'Space'} để tạo dáng (${s.photo.seconds} giây).` : 'Bấm để chụp.'}</p>
          <button class="primary" data-act="photo-start" onClick={a.photoStart}>{s.photo.mode === 'timer' ? 'Hẹn giờ' : 'Chụp'}</button>
        </Pop>
      )}
      {s.photo && s.photo.phase === 'countdown' && (
        <div class="g-countdown" data-testid="photo-countdown"><b>{Math.max(0, Math.ceil(s.photo.seconds))}</b>{s.photo.posed ? <span>Giữ nguyên nha!</span> : <button class="primary" data-act="photo-pose" onClick={a.photoPose}>Tạo dáng{!touch && <> <kbd>Space</kbd></>}</button>}</div>
      )}
      {s.photo && s.photo.phase === 'preview' && (
        <Pop class="g-card g-photo" testid="photo-preview">
          {s.photo.url && <img src={s.photo.url} alt="Ảnh vừa chụp" />}
          {s.photo.display === 'marks'
            ? <div class="g-marks">{s.photo.marks.map((m) => <span class={m.ok ? 'ok' : ''} data-mark={String(m.ok)}>{m.ok ? '●' : '○'} {m.label}</span>)}</div>
            : <div class="g-marks"><span class="ok">Điểm ảnh: {s.photo.score}</span></div>}
          <div class="g-row"><button data-act="photo-retry" onClick={a.photoRetry}>Chụp lại</button><button class="primary" data-act="photo-keep" onClick={a.photoKeep}>Giữ ảnh này</button></div>
        </Pop>
      )}
      {s.minigame && <MinigameFrame host={s.minigame} />}
      {s.free && !blocking && (
        <div class="g-free" data-testid="free"><span>{s.free.text}</span><button class="primary" data-act="free-continue" onClick={a.freeContinue}>Đi tiếp</button></div>
      )}
      {s.notice && (
        <Pop class={`g-card g-notice fx-${s.notice.effect}`} testid="notice">
          <h2>{s.notice.title}</h2><p>{s.notice.text}</p>
          <button class="primary" data-act="next" onClick={a.next}>Tiếp</button>
        </Pop>
      )}

      {s.panel === 'box' && <Box s={s} a={a} />}
      {s.panel === 'album' && <Album s={s} a={a} />}
      {s.panel === 'phone' && <Phone s={s} a={a} />}
      {s.panel === 'journal' && (
        <Pop class="g-panel" testid="panel-journal">
          <header><h2>Sổ tay</h2><button data-act="close" onClick={a.closePanel}>Đóng</button></header>
          <p><b>Mục tiêu:</b> {s.objective ?? '—'}</p>
          {s.quests.map((q) => <div class="g-quest"><span class="tag">{q.type}</span>{q.title}<span class="tag">{QUEST_LABEL[q.state] ?? q.state}</span></div>)}
          <p class="g-hint">Việc phụ không bắt buộc; bỏ qua cũng không sao.</p>
        </Pop>
      )}
      {s.panel === 'menu' && (
        <Pop class="g-card g-menu" testid="panel-menu">
          <h2>Tạm dừng</h2>
          <button class="primary" data-act="resume" onClick={a.closePanel}>Chơi tiếp</button>
          {s.mode === 'day' && <button data-act="restart-day" onClick={a.menuRestartDay}>Chơi lại Ngày từ đầu</button>}
          {s.mode === 'day' && <button data-act="safe-spot" onClick={a.menuSafeSpot}>Về chỗ an toàn</button>}
          {s.mode === 'day' && s.device !== 'touch' && s.camOptions.freeLook && <button data-act="menu-free-look" data-on={String(s.freeLook)} onClick={a.toggleFreeLook}>Nhìn tự do bằng touchpad: {s.freeLook ? 'BẬT' : 'TẮT'} <kbd>L</kbd></button>}
          {s.mode === 'day' && s.camOptions.modeSwitch && <button data-act="menu-camera-mode" data-mode={s.cameraMode} onClick={a.toggleCameraMode}>Kiểu camera: {CAMERA_MODES[s.cameraMode].label}{s.device === 'touch' ? '' : ` — ${CAMERA_MODES[s.cameraMode].hint}`}</button>}
          {s.mode === 'day' && s.inReplay && <button data-act="leave-day" onClick={a.menuLeaveDay}>Về phòng (thôi xem lại)</button>}
          <button class="danger" data-act="wipe" onClick={a.menuWipe}>{s.wipeArmed ? 'Bấm lần nữa để xóa hết' : 'Xóa tiến trình'}</button>
          <p class="g-hint">Tiến trình và ảnh lưu trong trình duyệt này. Xóa dữ liệu trình duyệt sẽ mất cả hai.</p>
        </Pop>
      )}
      {s.feedback && (
        <Pop class="g-card" testid="feedback">
          <FeedbackForm skip={a.feedbackSkip} submitted={a.feedbackSubmitted} />
        </Pop>
      )}
      {s.consentAsk && (
        <Pop class="g-card g-consent" testid="consent">
          <h2>Cho phép ghi số liệu ẩn danh?</h2>
          <p>Game ghi lại bạn chơi tới đâu để nhóm cải thiện. Không ghi tên, email hay nội dung bạn nhập. Từ chối vẫn chơi bình thường.</p>
          <div class="g-row"><button data-act="consent-no" onClick={() => a.consent(false)}>Không</button><button class="primary" data-act="consent-yes" onClick={() => a.consent(true)}>Đồng ý</button></div>
        </Pop>
      )}
      <div class={`g-fade ${s.fade.on ? 'on' : ''}`} data-testid="fade" data-on={String(s.fade.on)}><span>{s.fade.label}</span></div>
    </div>
  );
}

export function mountGameUi(el: HTMLElement, store: UiStore, actions: UiActions) {
  render(<Ui store={store} a={actions} />, el);
  return () => render(null, el);
}

/** Dòng hướng dẫn xoay camera trên máy tính: theo kiểu camera, hoặc theo "Nhìn tự do" nếu đang bật. */
function lookHint(s: UiState): string {
  if (s.freeLook && s.cameraMode !== 'B') return s.pointerLocked ? 'Rê touchpad/chuột để nhìn · Esc để thả' : 'Bấm vào màn hình để nhìn tự do (L để tắt)';
  return CAMERA_MODES[s.cameraMode].hint;
}
