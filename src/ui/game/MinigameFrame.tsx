import { useLayoutEffect, useRef } from 'preact/hooks';
import type { MinigameHost } from '../../game/minigames/host';

const labels = { win: 'THẮNG!', lose: 'THUA RỒI', draw: 'HÒA', complete: 'HOÀN THÀNH!', quit: 'ĐÃ BỎ QUA' };
const subLabels = {
  win: 'Làm tốt lắm!',
  lose: 'Thử lại lần nữa hoặc đi tiếp nhé.',
  draw: 'Bất phân thắng bại!',
  complete: 'Nhiệm vụ đã hoàn tất.',
  quit: 'Bạn có thể chơi lại bất cứ lúc nào.',
};

export function MinigameFrame({ host, onExit }: { host: MinigameHost; onExit?: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const play = () => { if (root.current) host.play(root.current); };
  useLayoutEffect(() => {
    if (host.seen) play();
  }, [host]);
  const rules = host.overlay === 'help' || (!host.overlay && host.phase === 'rules');
  const res = host.phase === 'result' ? host.result : undefined;
  return <div class="g-mg-backdrop">
    <section class={`g-card g-mg-card ${res ? `phase-result res-${res.result}` : ''}`} role="dialog" aria-modal="true" aria-label={host.game.title} data-testid="minigame">
      <div class="g-mg-head">
        <h2>{host.game.title}</h2>
        {host.game.kind && <span class="tag">{host.game.kind}</span>}
      </div>
      {rules && <div class="g-mg-rules">
        {host.game.rules.image && <img src={host.game.rules.image} alt="" style={{ maxWidth: '100%' }} />}
        {host.game.rules.lines.map(line => <p key={line}>{line}</p>)}
      </div>}
      <div ref={root} hidden={host.phase !== 'playing' || !!host.overlay} />
      {host.overlay ? <>
        <h3>{host.overlay === 'menu' ? 'Tạm dừng' : 'Luật chơi'}</h3>
        <div class="g-row">
          <button onClick={() => host.toggleOverlay(host.overlay!)}>Quay lại</button>
          {host.phase !== 'result' && <button onClick={() => host.quit()}>{host.overlay === 'menu' ? 'Bỏ ván' : 'Bỏ qua'}</button>}
          {host.overlay === 'menu' && onExit && <button data-act="menu-exit" onClick={onExit}>Thoát game</button>}
        </div>
      </> : <>
        {host.phase === 'rules' && <div class="g-row">
          <button onClick={() => host.quit()}>Bỏ qua</button>
          <button class="primary" data-act="minigame-done" onClick={play}>Bắt đầu</button>
        </div>}
        {host.phase === 'playing' && <div class="g-row">
          <button aria-label="Luật chơi" onClick={() => host.toggleOverlay('help')}>?</button>
          <button onClick={() => host.quit()}>Bỏ qua</button>
          <button onClick={() => host.toggleOverlay('menu')}>Menu <kbd>Esc</kbd></button>
        </div>}
        {res && <div class="g-mg-result" data-result={res.result}>
          <div class="g-mg-stamp-wrap">
            <h3 class={`g-mg-stamp st-${res.result}`}>{labels[res.result]}</h3>
          </div>
          <p class="g-mg-sub">{subLabels[res.result]}</p>
          {(res.stars !== undefined || res.score !== undefined) && (
            <div class="g-mg-stats">
              {res.stars !== undefined && (
                <div class="g-mg-stat" aria-label={`Sao: ${res.stars}`}>
                  <span class="g-mg-stars">{'★'.repeat(Math.max(0, Math.min(3, res.stars)))}{'☆'.repeat(Math.max(0, 3 - Math.min(3, res.stars)))}</span>
                </div>
              )}
              {res.score !== undefined && (
                <div class="g-mg-stat">
                  <small>Điểm</small>
                  <b>{res.score}</b>
                </div>
              )}
            </div>
          )}
          <div class="g-mg-actions">
            <button onClick={play}>Chơi lại</button>
            <button class="primary" data-act="minigame-done" onClick={() => host.next()}>Đi tiếp</button>
          </div>
        </div>}
      </>}
    </section>
  </div>;
}
