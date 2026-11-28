import { useEffect, useState } from 'preact/hooks';
import { RULEBOOK_CONFIG } from '../../../config/rulebook';
import { Pop } from '../overlays/NoticeModal';
import type { UiActions, UiState } from '../store';

const ART_LABEL: Record<string, string> = { hidden: '', dim: 'Chưa nhớ ra', glowing: 'Đang sáng', visited: 'Đã ghé lại', on_shelf: 'Trên kệ' };

export function Box3dBar({ boxView, touch, a }: { boxView: NonNullable<UiState['boxView']>; touch: boolean; a: UiActions }) {
  return (
    <div class="g-box3d" data-testid="panel-box3d" data-first={String(boxView.first)}>
      <b>Hộp Kỷ Vật</b>
      <span class="g-box3d-hint" data-testid="box-hint">{boxView.hint}</span>
      <span class="g-box3d-hover" data-testid="box-hover">{boxView.hover ?? ''}</span>
      {boxView.hasRulebook && (
        <button data-act="open-rulebook" onClick={a.openRulebook}>Sổ Căn cứ</button>
      )}
      <button data-act="close" onClick={a.closePanel}>Đóng hộp{!touch && <> <kbd>Esc</kbd></>}</button>
    </div>
  );
}

export function BoxPanel({ s, a }: { s: UiState; a: UiActions }) {
  const rb = s.box?.rulebook;
  const [showRulebook, setShowRulebook] = useState(!!s.box?.rulebookOpen);
  useEffect(() => {
    if (s.box?.rulebookOpen) setShowRulebook(true);
  }, [s.box?.rulebookOpen]);

  if (showRulebook && rb) {
    return (
      <Pop class="g-panel g-rulebook-modal" testid="panel-rulebook">
        <header>
          <div>
            <h2>{RULEBOOK_CONFIG.title}</h2>
            <p class="g-hint">{RULEBOOK_CONFIG.subtitle}</p>
          </div>
          <div class="g-row">
            <button data-act="rulebook-back" onClick={() => setShowRulebook(false)}>Về Hộp Kỷ Vật</button>
            <button data-act="close" onClick={a.closePanel}>Đóng</button>
          </div>
        </header>
        <div class="g-rulebook-book">
          <div class="g-rulebook-spine" aria-hidden="true">LUẬT</div>
          <div class="g-rulebook-sheet">
            <section class="g-rulebook-sec">
              <h4>1. {rb.cipher.title}</h4>
              {rb.cipherUnlocked ? (
                <>
                  <div class="g-rulebook-cipher">
                    <span class="g-rulebook-syms">{rb.cipher.symbols.join(' ')}</span>
                    <span class="g-rulebook-arrow">→</span>
                    <b>{rb.cipher.solution}</b>
                  </div>
                  <p class="g-hint">{rb.cipher.note}</p>
                </>
              ) : (
                <p class="g-hint">Chưa nhớ lại Trang 1 (Lớp 6).</p>
              )}
            </section>

            <section class="g-rulebook-sec">
              <h4>2. Năm điều luật Căn cứ (Trang 3 · Lớp 7, 2016)</h4>
              {rb.rulesUnlocked ? (
                <ol class="g-rulebook-list">
                  {rb.rules.map((r) => (
                    <li>
                      <b>Điều {r.index}:</b> {r.text} <span class="tag">{r.by}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p class="g-hint">Chưa nhớ lại Trang 3 (Lớp 7).</p>
              )}
            </section>

            <section class="g-rulebook-sec">
              <h4>3. Ghi chép &amp; Lựa chọn đã lưu</h4>
              {rb.notes.length > 0 ? (
                <ul class="g-rulebook-notes">
                  {rb.notes.map((n) => (
                    <li><b>{n.label}:</b> {n.value}</li>
                  ))}
                </ul>
              ) : (
                <p class="g-hint">{RULEBOOK_CONFIG.locked_hint}</p>
              )}
            </section>
          </div>
        </div>
      </Pop>
    );
  }

  return (
    <Pop class="g-panel" testid="panel-box">
      <header><h2>Hộp Kỷ Vật</h2><button data-act="close" onClick={a.closePanel}>Đóng</button></header>
      {rb && (
        <section class="g-compartment g-rulebook-card">
          <div class="g-artifact" data-testid="rulebook-entry">
            <div>
              <b>{RULEBOOK_CONFIG.title}</b>
              <span class="tag">{rb.unlocked ? 'Đã mở' : 'Chưa ghi'}</span>
              <p>{rb.unlocked ? 'Xem lại mật lệnh, 5 điều luật Căn cứ và các lựa chọn đã lưu.' : RULEBOOK_CONFIG.locked_hint}</p>
            </div>
            <button class={rb.unlocked ? 'primary' : ''} data-act="open-rulebook-modal" onClick={() => setShowRulebook(true)}>
              Mở sổ đọc lại
            </button>
          </div>
        </section>
      )}
      {s.box?.compartments.map((c) => (
        <section class={`g-compartment ${c.open ? '' : 'closed'}`}>
          <h3>{c.title}{c.open ? '' : ' — chưa mở'}</h3>
          {c.open && c.artifacts.length === 0 && <p class="g-hint">Ngăn này chưa có kỷ vật trong bản này.</p>}
          {c.open && c.artifacts.map((x) => x.state !== 'hidden' && (
            <div class={`g-artifact st-${x.state}`} data-artifact={x.id} data-state={x.state}>
              <div><b>{x.name}</b><span class="tag">{ART_LABEL[x.state]}</span>{x.action && <p>{x.hook}</p>}</div>
              {x.action === 'first' && <button class="primary" data-act={`open-${x.id}`} onClick={() => a.openArtifact(x.id)}>Nhớ lại</button>}
              {x.action === 'replay' && <button data-act={`open-${x.id}`} onClick={() => a.openArtifact(x.id)}>Xem lại ký ức</button>}
            </div>
          ))}
        </section>
      ))}
    </Pop>
  );
}
