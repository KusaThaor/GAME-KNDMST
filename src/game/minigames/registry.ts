import type { MinigameModule } from './types';

const fallback: MinigameModule = {
  id: 'mg_fallback', title: 'Minigame', kind: 'special',
  rules: { lines: ['Bấm Xong để hoàn thành.'] },
  mount(el, ctx) {
    const button = document.createElement('button');
    button.textContent = 'Xong';
    button.dataset.act = 'minigame-done';
    button.onclick = () => ctx.onFinish({ result: 'complete' });
    el.append(button);
    return {
      pause() { button.disabled = true; },
      resume() { button.disabled = false; },
      dispose() { button.remove(); },
    };
  },
};

const modules = import.meta.glob<{ default: MinigameModule }>('./games/*.ts', { eager: true });
const games = new Map([[fallback.id, fallback]]);
for (const { default: game } of Object.values(modules)) {
  if (game.rules.lines.length > 3) throw new Error(`${game.id}: luật vượt quá 3 dòng`);
  if (games.has(game.id)) throw new Error(`Trùng id minigame: ${game.id}`);
  games.set(game.id, game);
}
export const getMinigame = (id: string) => games.get(id) ?? fallback;
