import { Pop } from '../overlays/NoticeModal';
import type { UiActions, UiState } from '../store';

const QUEST_LABEL: Record<string, string> = { locked: 'Chưa mở', available: 'Có thể làm', active: 'Đang làm', completed: 'Đã xong', missed: 'Đã lỡ' };

export function JournalPanel({ s, a }: { s: UiState; a: UiActions }) {
  return (
    <Pop class="g-panel" testid="panel-journal">
      <header><h2>Sổ tay</h2><button data-act="close" onClick={a.closePanel}>Đóng</button></header>
      <p><b>Mục tiêu:</b> {s.objective ?? '—'}</p>
      {s.quests.map((q) => <div class="g-quest"><span class="tag">{q.type}</span>{q.title}<span class="tag">{QUEST_LABEL[q.state] ?? q.state}</span></div>)}
      <p class="g-hint">Việc phụ không bắt buộc; bỏ qua cũng không sao.</p>
    </Pop>
  );
}
