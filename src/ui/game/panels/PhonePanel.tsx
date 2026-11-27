import { useState } from 'preact/hooks';
import { Pop } from '../overlays/NoticeModal';
import type { UiActions, UiState } from '../store';

export function PhonePanel({ s, a }: { s: UiState; a: UiActions }) {
  const [custom, setCustom] = useState('');
  const ph = s.phone;
  if (!ph) return null;
  const th = ph.thread;
  const sendCustom = () => {
    const clean = custom.trim();
    if (!clean) return;
    setCustom('');
    a.phoneSendCustom(clean);
  };
  return (
    <Pop class="g-phone" testid="panel-phone">
      <div class="g-phone-notch" aria-hidden="true"><span /></div>
      <header>
        <div class="g-phone-brand">
          <span class="g-phone-dot" />
          <b>{ph.app}</b>
        </div>
        <button data-act="close" onClick={a.closePanel}>Đóng</button>
      </header>
      <div class="g-phone-screen">
        {!th && (
          <div class="g-threads">
            {ph.threads.map((t) => (
              <button class="g-thread-item" data-act={`thread-${t.id}`} onClick={() => a.phoneOpenThread(t.id)}>
                <span class="g-thread-avatar">{t.title.slice(0, 1)}</span>
                <span class="g-thread-meta">
                  <b>{t.title}</b>
                  <small>Nhấn để mở cuộc trò chuyện</small>
                </span>
              </button>
            ))}
          </div>
        )}
        {th && (
          <div class="g-thread" data-thread={th.id}>
            <div class="g-thread-head">
              <button data-act="thread-back" onClick={() => a.phoneOpenThread(null)}>‹</button>
              <b>{th.title}</b>
            </div>
            <div class="g-msgs">
              {th.status && <div class="g-msg-status" data-testid="thread-status">{th.status}</div>}
              {th.messages.map((m) => (
                <div class={`g-msg ${m.mine ? 'mine' : ''}`}>
                  {!m.mine && <small>{m.who}</small>}
                  <span>{m.text}</span>
                </div>
              ))}
            </div>
            {th.compose && (
              <div class="g-compose" data-testid="compose">
                {th.compose.draft === null ? (
                  <>
                    <div class="g-openers">
                      {th.compose.openers.map((o) => (
                        <button data-act={`opener-${o.id}`} onClick={() => a.phonePick(o.id)}>{o.text}</button>
                      ))}
                    </div>
                    <form class="g-phone-input-row" onSubmit={(e) => { e.preventDefault(); sendCustom(); }}>
                      <input
                        type="text"
                        data-act="phone-custom-input"
                        value={custom}
                        maxLength={180}
                        placeholder="Hoặc tự nhập tin nhắn..."
                        onInput={(e) => setCustom((e.target as HTMLInputElement).value)}
                      />
                      <button type="submit" class="primary" data-act="send-custom" disabled={!custom.trim()}>Gửi</button>
                    </form>
                  </>
                ) : (
                  <>
                    <div class="g-draft" data-testid="draft">{th.compose.openers.find((o) => o.id === th.compose!.draft)?.text}</div>
                    <div class="g-row">
                      <button data-act="erase" onClick={a.phoneErase}>Xóa, viết lại</button>
                      <button class="primary" data-act="send" onClick={a.phoneSend}>Gửi</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Pop>
  );
}
