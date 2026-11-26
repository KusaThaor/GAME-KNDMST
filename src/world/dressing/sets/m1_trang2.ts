import * as THREE from 'three';
import type { EventBus } from '../../../core/eventBus';
import type { DressingCtx, DressingSet } from '../index';
import { placeAtMarker } from '../place';
import { makePaperBoats, makeStrandedPaperBoat } from '../../props/m1/paperBoats';
import { makeGutterFlow } from '../../props/m1/gutterFlow';

export type Trang2BoatPhase = 'before_race' | 'after_race';

export interface M1Trang2Controller {
  setPhase(phase: Trang2BoatPhase): void;
  getPhase(): Trang2BoatPhase;
  onEvent(name: string, payload: Record<string, unknown>): void;
  dispose(): void;
}

const m1Trang2Set: DressingSet = {
  id: 'm1_trang2',
  appliesTo(ctx: DressingCtx): boolean {
    return ctx.dayId === 'd.g07.01';
  },
  build(ctx: DressingCtx): THREE.Object3D {
    const root = new THREE.Group();
    root.name = 'dressing:m1_trang2';

    // 1. Dòng nước chảy trong rãnh mái hiên (có cập nhật UV mỗi khung hình)
    const gutter = placeAtMarker(makeGutterFlow({ length: 48, width: 0.35 }), ctx.world, 'interact', 'itr.thcs.gutter', {
      offset: [10, 0, 0],
      fallback: [-14, 0, -18.1],
    });
    root.add(gutter);

    if (gutter.flowControl) {
      ctx.addUpdate((dt) => {
        gutter.flowControl?.update(dt);
      });
    }

    // 2. 5 chiếc thuyền giấy đua rãnh nước (P2-4, hiện ban đầu trước khi đua)
    const boats = placeAtMarker(makePaperBoats(), ctx.world, 'interact', 'itr.thcs.gutter', {
      fallback: [-14, 0, -18.1],
    });
    boats.name = 'm1_trang2:boats';
    root.add(boats);

    // 3. 1 chiếc thuyền hồng của Hạ mắc cạn ở cuối rãnh (P2-6, chỉ hiện sau cuộc đua)
    const strandedBoat = placeAtMarker(makeStrandedPaperBoat(), ctx.world, 'interact', 'itr.thcs.gutter_end', {
      fallback: [-6.0, 0, -17.6],
    });
    strandedBoat.name = 'm1_trang2:strandedBoat';
    strandedBoat.visible = false;
    root.add(strandedBoat);

    let phase: Trang2BoatPhase = 'before_race';
    let disposed = false;
    let wasAttached = false;
    const offs: (() => void)[] = [];

    const setPhase = (next: Trang2BoatPhase) => {
      if (disposed || phase === next) return;
      phase = next;
      boats.visible = next === 'before_race';
      strandedBoat.visible = next === 'after_race';
    };

    const onEvent = (name: string, payload: Record<string, unknown>) => {
      if (disposed) return;
      if (name === 'day_started') {
        if (payload.day_id === 'd.g07.01' && !payload.resumed) setPhase('before_race');
      } else if (name === 'minigame_finished') {
        if (payload.game_id === 'mg_boat') setPhase('after_race');
      } else if (name === 'step_completed') {
        const sid = payload.step_id;
        if ((sid === 'q_m1_main_02.s04' || sid === 'q_m1_main_02.s05') && (payload.kind === 'minigame' || payload.kind === undefined)) {
          setPhase('after_race');
        }
      } else if (name === 'step_activated') {
        const sid = payload.step_id;
        if (sid === 'q_m1_main_02.s01' || sid === 'q_m1_main_02.s02' || sid === 'q_m1_main_02.s06') { // R-D5: bỏ s03 (lựa chọn trùng), s06 là trò gấp thuyền
          setPhase('before_race');
        } else if (sid === 'q_m1_main_02.s04' && payload.kind === 'minigame') {
          setPhase('before_race');
        } else if (sid === 'q_m1_main_02.s05' && payload.kind !== 'minigame' && payload.resumed) {
          setPhase('after_race');
        }
      }
    };

    const dispose = () => {
      if (disposed) return;
      disposed = true;
      for (const off of offs.splice(0)) off();
    };

    const controller: M1Trang2Controller = {
      setPhase,
      getPhase: () => phase,
      onEvent,
      dispose,
    };
    root.userData.m1Trang2 = controller;
    root.userData.dispose = dispose;

    const bus = (ctx as DressingCtx & { bus?: EventBus }).bus;
    if (bus) {
      const guarded = <K extends 'day_started' | 'minigame_finished' | 'step_activated' | 'step_completed'>(ev: K) =>
        bus.on(ev, (payload) => {
          if (root.parent) wasAttached = true;
          else if (wasAttached) { dispose(); return; }
          onEvent(ev, payload as unknown as Record<string, unknown>);
        });
      offs.push(guarded('day_started'), guarded('minigame_finished'), guarded('step_activated'), guarded('step_completed'));
    }

    return root;
  },
};

export default m1Trang2Set;
