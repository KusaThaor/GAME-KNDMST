import { render } from 'preact';

/**
 * HUD tối giản (GDD 3): dòng mục tiêu, tên khu vực, gợi ý tương tác, ô thoại.
 * Bản S1 chỉ để xem bố cục và chữ; hệ thống thật nối với quest engine ở M1.
 */
export interface HudState {
  objective?: string;
  zone?: string;
  prompt?: { key: string; text: string };
  dialogue?: { who: string; color: string; text: string; choices?: string[] };
  debug?: string;
}

function Hud(s: HudState) {
  return (
    <div class="hud">
      {s.objective && <div class="hud-objective"><span class="dot" />{s.objective}</div>}
      {s.zone && <div class="hud-zone">{s.zone}</div>}
      {s.prompt && <div class="hud-prompt"><kbd>{s.prompt.key}</kbd>{s.prompt.text}</div>}
      {s.dialogue && (
        <div class="hud-dialogue">
          <div class="who" style={{ color: s.dialogue.color }}>{s.dialogue.who}</div>
          <div class="text">{s.dialogue.text}</div>
          {s.dialogue.choices && (
            <div class="choices">{s.dialogue.choices.map((c, i) => <div class="choice"><kbd>{i + 1}</kbd>{c}</div>)}</div>
          )}
          {!s.dialogue.choices && <div class="next">Space ▸</div>}
        </div>
      )}
      {s.debug && <div class="hud-debug">{s.debug}</div>}
    </div>
  );
}

export function mountHud(el: HTMLElement) {
  return { set: (s: HudState) => render(<Hud {...s} />, el) };
}
