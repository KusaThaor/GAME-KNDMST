import type { UiActions, UiState } from '../store';

export function NarratorBanner({ narrator, touch, a }: { narrator: NonNullable<UiState['narrator']>; touch: boolean; a: UiActions }) {
  return (
    <div
      class={`g-narrator g-click${narrator.channel === 'world_event' ? ' is-world-event' : ''}`}
      data-testid="narrator-banner"
      data-channel={narrator.channel}
      data-act="next"
      onClick={a.next}
    >
      <div class="text">{narrator.text}</div>
      <div class="next">{touch ? 'Chạm ▸' : 'Space ▸'}</div>
    </div>
  );
}
