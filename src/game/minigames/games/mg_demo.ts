import type { MinigameModule } from '../types';

export default {
  id: 'mg_demo', title: 'Ba lần chạm', kind: 'special',
  rules: { lines: ['Bấm nút ba lần để thắng.'] },
  mount(el, ctx) {
    let count = 0;
    const button = document.createElement('button');
    button.textContent = 'Chạm (0/3)';
    button.dataset.act = 'minigame-done';
    button.onclick = () => {
      count++;
      button.textContent = `Chạm (${count}/3)`;
      if (count === 3) ctx.onFinish({ result: 'win', score: count });
    };
    el.append(button);
    return {
      pause() { button.disabled = true; },
      resume() { button.disabled = false; },
      dispose() { button.remove(); },
    };
  },
} satisfies MinigameModule;
