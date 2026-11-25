import type { UiActions, UiState } from '../store';

export function ChoiceBox({ choice, a }: { choice: NonNullable<UiState['choice']>; a: UiActions }) {
  return (
    <div class="hud-dialogue" data-testid="choice">
      {choice.who && <div class="who">{choice.who}</div>}
      {choice.prompt && <div class="text">{choice.prompt}</div>}
      <div class="choices">
        {choice.options.map((o, i) => (
          <button class="choice" data-act={`choice-${o.id}`} onClick={() => a.choose(o.id)}>
            <kbd>{i + 1}</kbd>{o.text}{o.tone && <span class="tag">{o.tone}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
