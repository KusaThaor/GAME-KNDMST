import { useRef, useState } from 'preact/hooks';
import { cleanComment, COMMENT_LIMIT } from '../../../api/feedback';
import { RELEASES } from '../../content/release';

export function FeedbackForm({ skip, submitted }: { skip(): void; submitted(): void }) {
  const [attemptId] = useState(() => crypto.randomUUID());
  const [busy, setBusy] = useState(false);
  const posting = useRef(false);
  const [error, setError] = useState('');
  const pages = RELEASES[__APP_ENV__].memory_day_ids;

  async function send(form: HTMLFormElement) {
    if (posting.current) return;
    const values = new FormData(form);
    posting.current = true;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST', signal: AbortSignal.timeout(20000), credentials: 'omit', referrerPolicy: 'no-referrer',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          attempt_id: attemptId, nostalgia: Number(values.get('nostalgia')), play_again: Number(values.get('play_again')),
          favorite_page: values.get('favorite_page'), recommend: values.get('recommend') === 'yes',
          comment: cleanComment(String(values.get('comment') ?? '')),
        }),
      });
      if (response.ok && (await response.json()).ok === true) { submitted(); return; }
      setError(response.status === 429 ? 'Đã hết hạn mức. Bạn có thể gửi lại sau.' : 'Chưa gửi được. Bạn có thể thử lại.');
    } catch { setError('Chưa gửi được. Hãy kiểm tra kết nối rồi thử lại.'); }
    finally { posting.current = false; setBusy(false); }
  }

  return <form onSubmit={e => { e.preventDefault(); void send(e.currentTarget); }}>
    <h2>Phản hồi sau khi chơi</h2>
    <fieldset disabled={busy} style={{ display: 'grid', gap: '0.75rem', border: 0, margin: 0, padding: 0 }}>
      {([['nostalgia', 'Bạn thấy hoài niệm thế nào?'], ['play_again', 'Bạn muốn chơi tiếp phần sau đến mức nào?']] as const)
        .map(([name, label]) => <label key={name}>{label}{' '}
          <select required name={name} defaultValue="">
            <option value="" disabled>Chọn mức 1–5</option>
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>)}
      <label>Bạn thích Trang nào nhất?{' '}
        <select required name="favorite_page" defaultValue="">
          <option value="" disabled>Chọn Trang</option>
          {pages.map((id, i) => <option key={id} value={id}>Trang {i + 1}</option>)}
        </select>
      </label>
      <label>Bạn sẽ giới thiệu game cho bạn bè chứ?{' '}
        <select required name="recommend" defaultValue=""><option value="" disabled>Chọn câu trả lời</option>
          <option value="yes">Có</option><option value="no">Không</option>
        </select>
      </label>
      <label>Ý kiến khác (không bắt buộc, tối đa 300 ký tự)
        <textarea name="comment" maxLength={COMMENT_LIMIT} placeholder="Vui lòng bỏ tên và thông tin liên hệ." />
      </label>
      {error && <p role="alert">{error}</p>}
      <div class="g-row"><button class="primary" type="submit">{busy ? 'Đang gửi…' : 'Gửi phản hồi'}</button>
        <button type="button" data-act="feedback-skip" onClick={skip}>Bỏ qua</button></div>
    </fieldset>
  </form>;
}
