import { useEffect, useRef, useState } from 'preact/hooks';
import type { UiActions, UiState } from '../store';

export function NarratorBanner({
  narrator,
  touch,
  a,
}: {
  narrator: NonNullable<UiState['narrator']>;
  touch: boolean;
  a: UiActions;
}) {
  const fullText = narrator.text || '';
  const [displayedLength, setDisplayedLength] = useState(0);
  const isTyping = displayedLength < fullText.length;
  const isTypingRef = useRef(isTyping);
  isTypingRef.current = isTyping;

  useEffect(() => {
    setDisplayedLength(0);
    if (!fullText) return;

    let idx = 0;
    // Tốc độ gõ phím mượt mà, cozy (~24ms mỗi ký tự)
    const interval = setInterval(() => {
      idx += 1;
      setDisplayedLength(idx);
      if (idx >= fullText.length) {
        clearInterval(interval);
      }
    }, 24);

    return () => clearInterval(interval);
  }, [fullText]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ' || e.code === 'Enter') {
        if (isTypingRef.current) {
          e.preventDefault();
          e.stopPropagation();
          setDisplayedLength(fullText.length);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true });
  }, [fullText]);

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (isTyping) {
      // Khi đang gõ: click hoàn thành toàn bộ đoạn chữ
      setDisplayedLength(fullText.length);
    } else {
      // Khi đã gõ xong: click chuyển sang câu kế tiếp
      a.next();
    }
  };

  const visibleText = fullText.slice(0, displayedLength);

  return (
    <>
      {narrator.backdrop && (
        <div class="g-narrator-backdrop" aria-hidden="true" data-testid="narrator-backdrop">
          <img src={narrator.backdrop} alt="" />
        </div>
      )}
      <div
        class="g-narrator-screen-wrap"
        data-act="next"
        onClick={handleClick}
      >
        <div
          class={`g-narrator g-click${narrator.channel === 'world_event' ? ' is-world-event' : ''}`}
          data-testid="narrator-banner"
          data-channel={narrator.channel}
        >
          <div class="text" data-full-text={fullText}>
            <span>{visibleText}</span>
            {isTyping && <span class="g-narrator-cursor" aria-hidden="true">|</span>}
          </div>
          {!isTyping && (
            <div class="next">
              {touch ? 'Chạm bất kỳ để tiếp tục ▸' : 'Nhấn Space để tiếp tục ▸'}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
