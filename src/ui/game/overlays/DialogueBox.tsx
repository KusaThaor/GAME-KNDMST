import type { UiActions, UiState } from '../store';

export function DialogueBox({ dialogue, touch, a }: { dialogue: NonNullable<UiState['dialogue']>; touch: boolean; a: UiActions }) {
  return (
    <div class="hud-dialogue g-click" data-testid="dialogue" data-act="next" onClick={a.next}>
      {dialogue.who && <div class="who" style={{ color: dialogue.color }}>{dialogue.who}</div>}
      <div class="text">{dialogue.text}</div>
      <div class="next">{touch ? 'Chạm ▸' : 'Space ▸'}</div>
    </div>
  );
}
