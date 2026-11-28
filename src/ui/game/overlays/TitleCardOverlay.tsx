import type { UiState } from '../store';

export function TitleCardOverlay({ titleCard }: { titleCard: NonNullable<UiState['titleCard']> }) {
  const ms = Math.max(1000, titleCard.durationMs ?? 3000);
  return (
    <div
      key={`${titleCard.title}|${titleCard.subtitle ?? ''}`}
      class={`g-title-card${titleCard.backdrop ? ' has-backdrop' : ''}`}
      data-testid="title-card"
      style={{ '--tc-duration': `${ms}ms` } as Record<string, string>}
    >
      {titleCard.backdrop && (
        <img class="g-title-card-bg" src={titleCard.backdrop} alt="" aria-hidden="true" data-testid="title-card-backdrop" />
      )}
      <div class="g-title-card-box">
        <div class="g-title-card-title">{titleCard.title}</div>
        {titleCard.subtitle && <div class="g-title-card-sub">{titleCard.subtitle}</div>}
      </div>
    </div>
  );
}
