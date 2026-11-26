import * as THREE from 'three';
import type { EventBus } from '../../../core/eventBus';
import { disposeObject, type DressingCtx, type DressingSet } from '../index';
import { placeAtMarker } from '../place';
import { makeBaseSign } from '../../props/m1/baseSign';
import { makeRuleBook } from '../../props/m1/ruleBook';
import { makeBaseDecor, type BaseDecorStyle } from '../../props/m1/baseDecor';
import { makeSurveyRoof, makeSurveyStump, makeSurveyBoxes } from '../../props/m1/surveySpots';

export interface M1BaseController {
  setDecor(style: BaseDecorStyle, animate?: boolean): void;
  getDecor(): BaseDecorStyle | null;
  setFurnished(visible: boolean, animate?: boolean): void;
  setSignVisible(visible: boolean, animate?: boolean): void;
  onEvent(name: string, payload: Record<string, unknown>, readFlag?: (name: string) => unknown): void;
  dispose(): void;
}

function parseBaseDecorStyle(v: unknown): BaseDecorStyle | null {
  return v === 'paper' || v === 'flowers' || v === 'photos' ? v : null;
}

const m1BaseSet: DressingSet = {
  id: 'm1_base',
  appliesTo(ctx: DressingCtx): boolean {
    return ctx.dayId === 'd.g07.02' || ctx.dayId === 'd.g07.03';
  },
  build(ctx: DressingCtx): THREE.Object3D {
    const root = new THREE.Group();
    root.name = 'dressing:m1_base';

    // 1. Biển tên "CĂN CỨ BÍ MẬT" treo trên vách chòi
    const sign = placeAtMarker(makeBaseSign(), ctx.world, 'target', 'cam.thcs.base_sign.target', {
      offset: [0, -0.15, 0],
      fallback: [45, 1.6, -30.5],
    });
    root.add(sign);

    // 2. Cuốn sổ bìa xanh "LUẬT" đặt trên bàn gỗ cũ (mặt bàn cao 0.72m)
    const book = placeAtMarker(makeRuleBook(), ctx.world, 'interact', 'itr.thcs.old_table', {
      offset: [0, 0.72, 0],
      rotationY: 0.25,
      fallback: [43.4, 0, -27.2],
    });
    root.add(book);

    // 3. 3 điểm khảo sát Căn cứ (chỉ dựng ở Trang 3 - d.g07.02)
    if (ctx.dayId === 'd.g07.02') {
      root.add(
        placeAtMarker(makeSurveyRoof(), ctx.world, 'interact', 'itr.thcs.base_survey_roof', {
          fallback: [45.3, 0, -32.2],
        }),
        placeAtMarker(makeSurveyStump(), ctx.world, 'interact', 'itr.thcs.base_survey_stump', {
          fallback: [41, 0, -25],
        }),
        placeAtMarker(makeSurveyBoxes(), ctx.world, 'interact', 'itr.thcs.base_survey_boxes', {
          fallback: [49.5, 0, -26],
        }),
      );
    }

    // 4. Bộ trang trí Căn cứ theo lựa chọn của người chơi (m1.base_decor: 'paper' | 'flowers' | 'photos')
    const decorHolder = placeAtMarker(new THREE.Group(), ctx.world, 'interact', 'itr.thcs.old_table', {
      offset: [0, 0.72, 0],
      fallback: [43.4, 0, -27.2],
    });
    decorHolder.name = 'm1_base:decor';
    root.add(decorHolder);

    const anims = new Map<THREE.Object3D, number>();
    ctx.addUpdate((dt) => {
      for (const [obj, t] of anims) {
        const next = Math.min(1, t + dt * 4);
        const s = 0.2 + 0.8 * (1 - Math.pow(1 - next, 3));
        obj.scale.setScalar(s);
        if (next >= 1) anims.delete(obj);
      }
    });

    const reveal = (obj: THREE.Object3D, visible: boolean, animate = false) => {
      if (!visible) {
        anims.delete(obj);
        obj.visible = false;
        obj.scale.setScalar(1);
        return;
      }
      const wasHidden = !obj.visible;
      obj.visible = true;
      if (animate && wasHidden) {
        obj.scale.setScalar(0.2);
        anims.set(obj, 0);
      } else if (!anims.has(obj)) {
        obj.scale.setScalar(1);
      }
    };

    let activeDecor: BaseDecorStyle | null = null;
    let disposed = false;
    let wasAttached = false;
    const offs: (() => void)[] = [];

    const clearDecor = () => {
      anims.delete(decorHolder);
      for (const child of [...decorHolder.children]) {
        decorHolder.remove(child);
        disposeObject(child);
      }
      decorHolder.visible = false;
      decorHolder.scale.setScalar(1);
      activeDecor = null;
    };

    const setDecor = (style: BaseDecorStyle, animate = false) => {
      if (disposed) return;
      if (activeDecor === style && decorHolder.visible && decorHolder.children.length > 0) return;
      clearDecor();
      decorHolder.add(makeBaseDecor(style));
      activeDecor = style;
      decorHolder.visible = true;
      if (animate) {
        decorHolder.scale.setScalar(0.2);
        anims.set(decorHolder, 0);
      }
    };

    const initialStyle = parseBaseDecorStyle(ctx.flag('m1.base_decor'));
    if (ctx.dayId === 'd.g07.03') {
      setDecor(initialStyle ?? 'paper', false);
    } else if (initialStyle) {
      setDecor(initialStyle, false);
    } else {
      decorHolder.visible = false;
      book.visible = false;
      sign.visible = false;
    }

    const setFurnished = (visible: boolean, animate = false) => {
      if (disposed || ctx.dayId !== 'd.g07.02') return;
      reveal(book, visible, animate);
    };

    const setSignVisible = (visible: boolean, animate = false) => {
      if (disposed || ctx.dayId !== 'd.g07.02') return;
      reveal(sign, visible, animate);
    };

    const onEvent = (name: string, payload: Record<string, unknown>, readFlag?: (f: string) => unknown) => {
      if (disposed || ctx.dayId !== 'd.g07.02') return;
      const flagStyle = parseBaseDecorStyle((readFlag ?? ctx.flag)('m1.base_decor'));
      if (name === 'day_started') {
        if (payload.day_id === 'd.g07.02' && !payload.resumed) {
          reveal(book, false);
          reveal(sign, false);
          clearDecor();
        }
      } else if (name === 'choice_made') {
        if (payload.choice_id === 'c_m1_03_decor') {
          const picked = parseBaseDecorStyle(payload.option_id) ?? flagStyle;
          if (picked) setDecor(picked, true);
        }
      } else if (name === 'minigame_finished') {
        if (payload.game_id === 'mg_base_build') setFurnished(true, true);
        else if (payload.game_id === 'mg_rules') { setFurnished(true, true); setSignVisible(true, true); }
      } else if (name === 'step_activated') {
        const sid = payload.step_id;
        if (sid === 'q_m1_main_03.s01' || sid === 'q_m1_main_03.s02') {
          reveal(book, false);
          reveal(sign, false);
          if (!flagStyle) clearDecor();
        } else if (sid === 'q_m1_main_03.s05' && payload.resumed) {
          setFurnished(true, false);
        } else if (sid === 'q_m1_main_03.s06') {
          setFurnished(true, false);
          setSignVisible(true, true);
        }
      } else if (name === 'step_completed') {
        const sid = payload.step_id;
        if (sid === 'q_m1_main_03.s04' && payload.kind === 'minigame') setFurnished(true, true);
        else if (sid === 'q_m1_main_03.s05') { setFurnished(true, true); setSignVisible(true, true); }
        if (flagStyle && flagStyle !== activeDecor) setDecor(flagStyle, true);
      }
    };

    const dispose = () => {
      if (disposed) return;
      disposed = true;
      anims.clear();
      for (const off of offs.splice(0)) off();
    };

    const controller: M1BaseController = {
      setDecor,
      getDecor: () => activeDecor,
      setFurnished,
      setSignVisible,
      onEvent,
      dispose,
    };
    root.userData.m1Base = controller;
    root.userData.dispose = dispose;

    const bus = (ctx as DressingCtx & { bus?: EventBus }).bus;
    if (bus) {
      const guarded = <K extends 'day_started' | 'choice_made' | 'minigame_finished' | 'step_activated' | 'step_completed'>(ev: K) =>
        bus.on(ev, (payload) => {
          if (root.parent) wasAttached = true;
          else if (wasAttached) { dispose(); return; }
          onEvent(ev, payload as unknown as Record<string, unknown>);
        });
      offs.push(
        guarded('day_started'),
        guarded('choice_made'),
        guarded('minigame_finished'),
        guarded('step_activated'),
        guarded('step_completed'),
      );
    }

    return root;
  },
};

export default m1BaseSet;
