import { Pop } from '../overlays/NoticeModal';
import type { UiActions, UiState } from '../store';

const ART_LABEL: Record<string, string> = { hidden: '', dim: 'Chưa nhớ ra', glowing: 'Đang sáng', visited: 'Đã ghé lại', on_shelf: 'Trên kệ' };

export function Box3dBar({ boxView, touch, a }: { boxView: NonNullable<UiState['boxView']>; touch: boolean; a: UiActions }) {
  return (
    <div class="g-box3d" data-testid="panel-box3d" data-first={String(boxView.first)}>
      <b>Hộp Kỷ Vật</b>
      <span class="g-box3d-hint" data-testid="box-hint">{boxView.hint}</span>
      <span class="g-box3d-hover" data-testid="box-hover">{boxView.hover ?? ''}</span>
      <button data-act="close" onClick={a.closePanel}>Đóng hộp{!touch && <> <kbd>Esc</kbd></>}</button>
    </div>
  );
}

export function BoxPanel({ s, a }: { s: UiState; a: UiActions }) {
  return (
    <Pop class="g-panel" testid="panel-box">
      <header><h2>Hộp Kỷ Vật</h2><button data-act="close" onClick={a.closePanel}>Đóng</button></header>
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
