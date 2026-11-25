import { useEffect, useRef } from 'preact/hooks';
import { fadeIn } from '../../motion';
import { FeedbackForm } from '../FeedbackForm';
import type { UiActions, UiState } from '../store';

export function Pop(props: { class: string; children: preact.ComponentChildren; testid?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (ref.current) fadeIn(ref.current); }, []);
  return <div ref={ref} class={props.class} data-testid={props.testid}>{props.children}</div>;
}

export function NoticeModal({ notice, a }: { notice: NonNullable<UiState['notice']>; a: UiActions }) {
  return (
    <Pop class={`g-card g-notice fx-${notice.effect}`} testid="notice">
      <h2>{notice.title}</h2>
      <p>{notice.text}</p>
      <button class="primary" data-act="next" onClick={a.next}>Tiếp</button>
    </Pop>
  );
}

export function EndPromptModal({ endPrompt, a }: { endPrompt: NonNullable<UiState['endPrompt']>; a: UiActions }) {
  return (
    <Pop class="g-card" testid="end-prompt">
      <h2>Kết thúc ngày hôm nay?</h2>
      <p>Còn {endPrompt.open} việc chưa làm với các bạn. Không làm cũng không sao.</p>
      <div class="g-row">
        <button data-act="stay" onClick={() => a.endPrompt('stay')}>Ở lại</button>
        <button class="primary" data-act="leave" onClick={() => a.endPrompt('leave')}>Đi tiếp</button>
      </div>
    </Pop>
  );
}

export function DayEndModal({ dayEnd, a }: { dayEnd: NonNullable<UiState['dayEnd']>; a: UiActions }) {
  return (
    <Pop class="g-card" testid="day-end">
      <h2>{dayEnd.title}</h2>
      <p>{dayEnd.replay ? 'Bạn vừa ghé lại ký ức này.' : 'Một ngày đã khép lại.'}</p>
      <button class="primary" data-act="day-end-continue" onClick={a.continueDayEnd}>Về phòng</button>
    </Pop>
  );
}

export function FeedbackModal({ a }: { a: UiActions }) {
  return (
    <Pop class="g-card" testid="feedback">
      <FeedbackForm skip={a.feedbackSkip} submitted={a.feedbackSubmitted} />
    </Pop>
  );
}

export function ConsentModal({ a }: { a: UiActions }) {
  return (
    <Pop class="g-card g-consent" testid="consent">
      <h2>Cho phép ghi số liệu ẩn danh?</h2>
      <p>Game ghi lại bạn chơi tới đâu để nhóm cải thiện. Không ghi tên, email hay nội dung bạn nhập. Từ chối vẫn chơi bình thường.</p>
      <div class="g-row">
        <button data-act="consent-no" onClick={() => a.consent(false)}>Không</button>
        <button class="primary" data-act="consent-yes" onClick={() => a.consent(true)}>Đồng ý</button>
      </div>
    </Pop>
  );
}
