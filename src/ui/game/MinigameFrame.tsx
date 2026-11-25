import { useLayoutEffect, useRef } from 'preact/hooks';
import type { MinigameHost } from '../../game/minigames/host';

const labels = { win: 'Thắng', lose: 'Thua', draw: 'Hòa', complete: 'Hoàn thành', quit: 'Thua' };

export function MinigameFrame({ host, onExit }: { host: MinigameHost; onExit?: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const play = () => { if (root.current) host.play(root.current); };
  useLayoutEffect(() => {
    if (host.seen) play();
  }, [host]);
  const rules = host.overlay === 'help' || (!host.overlay && host.phase === 'rules');
  return <div style={{ position: 'absolute', inset: 0, background: 'rgba(35,30,25,.45)', pointerEvents: 'auto' }}>
    <section class="g-card" role="dialog" aria-modal="true" aria-label={host.game.title} data-testid="minigame">
      <h2>{host.game.title}</h2>
      {rules && <div>
        {host.game.rules.image && <img src={host.game.rules.image} alt="" style={{ maxWidth: '100%' }} />}
        {host.game.rules.lines.map(line => <p key={line}>{line}</p>)}
      </div>}
      <div ref={root} hidden={host.phase !== 'playing' || !!host.overlay} />
      {host.overlay ? <>
        <h3>{host.overlay === 'menu' ? 'Tạm dừng' : 'Luật chơi'}</h3>
        <button onClick={() => host.toggleOverlay(host.overlay!)}>Quay lại</button>
        {host.phase !== 'result' && <button onClick={() => host.quit()}>{host.overlay === 'menu' ? 'Bỏ ván' : 'Bỏ qua'}</button>}
        {host.overlay === 'menu' && onExit && <button data-act="menu-exit" onClick={onExit}>Thoát game</button>}
      </> : <>
        {host.phase === 'rules' && <button class="primary" data-act="minigame-done" onClick={play}>Bắt đầu</button>}
        {host.phase === 'playing' && <div class="g-row">
          <button aria-label="Luật chơi" onClick={() => host.toggleOverlay('help')}>?</button>
          <button onClick={() => host.toggleOverlay('menu')}>Menu <kbd>Esc</kbd></button>
        </div>}
        {host.phase === 'result' && host.result && <>
          <h3>{labels[host.result.result]}</h3>
          {host.result.score !== undefined && <p>Điểm: {host.result.score}</p>}
          {host.result.stars !== undefined && <p>Sao: {host.result.stars}</p>}
          <button onClick={play}>Chơi lại</button>
          <button class="primary" data-act="minigame-done" onClick={() => host.next()}>Đi tiếp</button>
        </>}
        {host.phase !== 'result' && <button onClick={() => host.quit()}>Bỏ qua</button>}
      </>}
    </section>
  </div>;
}
