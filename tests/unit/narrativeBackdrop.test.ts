import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CONTENT } from '../../src/content/pack';
import type { Step } from '../../src/content/types';
import { createNarrativeRunner } from '../../src/game/runtime/narrativeRunner';
import { createUiStore } from '../../src/ui/game/store';

describe('Ảnh nền tĩnh cho TitleCard & NarratorBanner', () => {
  it('narrativeRunner truyền backdrop vào TitleCard và NarratorBanner (có/không đều hợp lệ)', async () => {
    const ui = createUiStore();
    const seen: { tcBackdrop?: string | null; narrBackdrop?: string | null }[] = [];
    const runner = createNarrativeRunner({
      ui,
      fmt: (s) => s,
      conditions: { flag: () => undefined, questCompleted: () => false, dayCompleted: () => false },
      waitMs: async (slot) => {
        const st = ui.get();
        if (slot === 'title_card') seen.push({ tcBackdrop: st.titleCard?.backdrop ?? null });
        if (slot === 'next') seen.push({ narrBackdrop: st.narrator?.backdrop ?? null });
        return true;
      },
    });

    const stepWithBackdrop: Step = {
      id: 'q_m1_main_01.s01',
      kind: 'talk',
      with: 'NPC_A',
      title_card: { title: 'Ngày đầu lớp 6', subtitle: '2014', backdrop: 'assets/backdrops/yard_morning.jpg' },
      narrative: {
        before: [{ channel: 'narrator', text: 'Tiếng trống trường.', backdrop: 'assets/backdrops/yard_morning.jpg' }],
        after: [{ channel: 'world_event', text: 'Hoàng hôn.' }],
      },
      lines: [],
    };

    expect(await runner.before!(stepWithBackdrop, () => true)).toBe(true);
    expect(await runner.after!(stepWithBackdrop, () => true)).toBe(true);
    expect(seen).toEqual([
      { tcBackdrop: '/assets/backdrops/yard_morning.jpg' },
      { narrBackdrop: '/assets/backdrops/yard_morning.jpg' },
      { narrBackdrop: null },
    ]);
  });

  it('mọi đường dẫn backdrop khai trong Mốc 1 đều tồn tại trong public/', () => {
    const paths = new Set<string>();
    for (const q of CONTENT.quests) {
      for (const s of q.steps) {
        if (s.title_card?.backdrop) paths.add(s.title_card.backdrop);
        for (const n of [...(s.narrative?.before ?? []), ...(s.narrative?.after ?? [])]) {
          if (n.backdrop) paths.add(n.backdrop);
        }
      }
    }
    expect(paths.size).toBeGreaterThanOrEqual(6);
    for (const rel of paths) {
      const full = resolve(process.cwd(), 'public', rel);
      expect(existsSync(full), `Thiếu file backdrop: public/${rel}`).toBe(true);
    }
  });
});
