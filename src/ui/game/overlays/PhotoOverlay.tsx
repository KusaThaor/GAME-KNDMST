import type { UiActions, UiState } from '../store';
import { Pop } from './NoticeModal';

export function PhotoOverlay({ photo, touch, a }: { photo: NonNullable<UiState['photo']>; touch: boolean; a: UiActions }) {
  if (photo.phase === 'ready') {
    const readyPrompt = photo.prompt ?? (photo.mode === 'timer'
      ? (photo.hidePose
        ? `Bấm hẹn giờ rồi thong thả đi vào vòng sáng (${photo.seconds} giây).`
        : `Bấm hẹn giờ, chạy vào vòng sáng rồi bấm ${touch ? 'nút Tạo dáng' : 'Space'} để tạo dáng (${photo.seconds} giây).`)
      : photo.shot
        ? `Máy quay ngược, không thấy khung — cứ đoán rồi bấm. Chụp đủ ${photo.shot.total} lần rồi chọn một tấm để giữ.`
        : 'Bấm để chụp.');
    return (
      <Pop class="g-card g-photo-ready" testid="photo-ready">
        <h2>{photo.shot ? `Tự sướng — lần ${photo.shot.index}/${photo.shot.total}` : 'Máy ảnh đã đặt'}</h2>
        <p>{readyPrompt}</p>
        <button class="primary" data-act="photo-start" data-shot={photo.shot?.index} onClick={a.photoStart}>
          {photo.mode === 'timer' ? 'Hẹn giờ' : 'Chụp'}
        </button>
      </Pop>
    );
  }
  if (photo.phase === 'pick' && photo.picks) {
    const chosen = photo.picks[photo.picked ?? 0];
    return (
      <Pop class="g-card g-photo g-photo-pick" testid="photo-pick">
        <h2>Chọn một tấm để giữ</h2>
        {chosen && <img src={chosen.url} alt={`Tấm ${(photo.picked ?? 0) + 1}`} data-testid="photo-picked" data-index={photo.picked ?? 0} style={{ maxHeight: 'min(32vh, 260px)' }} />}
        <div class="g-row g-picks" style={{ justifyContent: 'center' }}>
          {photo.picks.map((p, i) => (
            <button type="button" class={i === photo.picked ? 'on' : ''} data-act={`photo-pick-${i}`} aria-pressed={i === photo.picked} onClick={() => a.photoPick(i)}>
              <img src={p.url} alt="" style={{ width: '92px', height: '68px', objectFit: 'cover', borderWidth: '3px', marginBottom: '4px', pointerEvents: 'none' }} />
              <span>{!touch && <kbd>{i + 1}</kbd>} Tấm {i + 1}</span>
            </button>
          ))}
        </div>
        {chosen && (photo.display === 'marks'
          ? <div class="g-marks">{chosen.marks.map((m) => <span class={m.ok ? 'ok' : ''} data-mark={String(m.ok)}>{m.ok ? '●' : '○'} {m.label}</span>)}</div>
          : <div class="g-marks"><span class="ok">Điểm ảnh: {chosen.score}</span></div>)}
        <div class="g-row">
          <button data-act="photo-retry" onClick={a.photoRetry}>Chụp lại cả {photo.picks.length} tấm</button>
          <button class="primary" data-act="photo-keep" onClick={a.photoKeep}>Giữ ảnh này</button>
        </div>
      </Pop>
    );
  }
  if (photo.phase === 'countdown') {
    return (
      <div class="g-countdown" data-testid="photo-countdown">
        <b>{Math.max(0, Math.ceil(photo.seconds))}</b>
        {!photo.hidePose && (photo.posed ? <span>Giữ nguyên nha!</span> : <button class="primary" data-act="photo-pose" onClick={a.photoPose}>Tạo dáng{!touch && <> <kbd>Space</kbd></>}</button>)}
        {photo.countdownLine && (
          <div class="g-countdown-line" data-testid="photo-countdown-line" style={{
            marginTop: '10px', padding: '6px 14px', borderRadius: '12px',
            background: 'rgba(255, 250, 238, 0.94)', color: '#3a2c26',
            border: '2px solid #3a2c26', textShadow: 'none', fontSize: '16px',
            maxWidth: 'min(480px, 85vw)', pointerEvents: 'none',
          }}>
            {photo.countdownLine.who && <strong style={{ color: photo.countdownLine.color }}>{photo.countdownLine.who}: </strong>}
            <span>{photo.countdownLine.text}</span>
          </div>
        )}
      </div>
    );
  }
  if (photo.phase === 'preview') {
    return (
      <Pop class="g-card g-photo" testid="photo-preview">
        {photo.url && <img src={photo.url} alt="Ảnh vừa chụp" />}
        {photo.display === 'marks'
          ? <div class="g-marks">{photo.marks.map((m) => <span class={m.ok ? 'ok' : ''} data-mark={String(m.ok)}>{m.ok ? '●' : '○'} {m.label}</span>)}</div>
          : <div class="g-marks"><span class="ok">Điểm ảnh: {photo.score}</span></div>}
        <div class="g-row">
          <button data-act="photo-retry" onClick={a.photoRetry}>Chụp lại</button>
          <button class="primary" data-act="photo-keep" onClick={a.photoKeep}>Giữ ảnh này</button>
        </div>
      </Pop>
    );
  }
  return null;
}
