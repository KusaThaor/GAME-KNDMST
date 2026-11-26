import type { UiState } from '../store';

export function KeyHintCard({ keyHint }: { keyHint: NonNullable<UiState['keyHint']> }) {
  return (
    <div class="g-key-hint" data-testid="key-hint">
      <span class="g-key-hint-badge">Gợi ý</span>
      <span>{keyHint.text}</span>
    </div>
  );
}
