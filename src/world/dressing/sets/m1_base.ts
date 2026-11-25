import * as THREE from 'three';
import type { DressingCtx, DressingSet } from '../index';
import { placeAtMarker } from '../place';
import { makeBaseSign } from '../../props/m1/baseSign';
import { makeRuleBook } from '../../props/m1/ruleBook';
import { makeBaseDecor, type BaseDecorStyle } from '../../props/m1/baseDecor';
import { makeSurveyRoof, makeSurveyStump, makeSurveyBoxes } from '../../props/m1/surveySpots';

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

    // 4. Bộ trang trí Căn cứ theo lựa chọn của người chơi (Trang 4 trở đi hoặc khi đã có flag)
    // Cờ m1.base_decor: 'paper' | 'flowers' | 'photos'
    const rawDecor = ctx.flag('m1.base_decor');
    const decorStyle: BaseDecorStyle =
      rawDecor === 'flowers' || rawDecor === 'photos' || rawDecor === 'paper' ? rawDecor : 'paper';

    // Trang 4 luôn có bộ trang trí hoàn chỉnh của Căn cứ
    if (ctx.dayId === 'd.g07.03' || rawDecor !== undefined) {
      const decor = placeAtMarker(makeBaseDecor(decorStyle), ctx.world, 'interact', 'itr.thcs.old_table', {
        offset: [0, 0.72, 0],
        fallback: [43.4, 0, -27.2],
      });
      root.add(decor);
    }

    return root;
  },
};

export default m1BaseSet;
