import { Pop } from '../overlays/NoticeModal';
import type { UiActions, UiState } from '../store';

export function PhonePanel({ s, a }: { s: UiState; a: UiActions }) {
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
          <div class="g-msgs">{th.status && <div class="g-msg-status" data-testid="thread-status">{th.status}</div>}{th.messages.map((m) => <div class={`g-msg ${m.mine ? 'mine' : ''}`}>{!m.mine && <small>{m.who}</small>}<span>{m.text}</span></div>)}</div>
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
