import * as THREE from 'three';
import type { DressingCtx, DressingSet } from '../index';
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
    // Target cam.thcs.base_sign: [45, 1.6, -30.5]
    const sign = makeBaseSign();
    sign.position.set(45, 1.45, -30.5);
    root.add(sign);

    // 2. Cuốn sổ bìa xanh "LUẬT" đặt trên bàn gỗ cũ
    // Marker itr.thcs.old_table: [43.4, 0, -27.2], mặt bàn cao 0.72m
    const book = makeRuleBook();
    book.position.set(43.4, 0.72, -27.2);
    book.rotation.y = 0.25;
    root.add(book);

    // 3. 3 điểm khảo sát Căn cứ (chỉ dựng ở Trang 3 - d.g07.02)
    if (ctx.dayId === 'd.g07.02') {
      // Mái che phụ tại [45.3, 0, -32.2]
      const roof = makeSurveyRoof();
      roof.position.set(45.3, 0, -32.2);
      root.add(roof);

      // Gốc cây mục tại [41, 0, -25]
      const stump = makeSurveyStump();
      stump.position.set(41, 0, -25);
      root.add(stump);

      // Đống thùng giấy tại [49.5, 0, -26]
      const boxes = makeSurveyBoxes();
      boxes.position.set(49.5, 0, -26);
      root.add(boxes);
    }

    // 4. Bộ trang trí Căn cứ theo lựa chọn của người chơi (Trang 4 trở đi hoặc khi đã có flag)
    // Cờ m1.base_decor: 'paper' | 'flowers' | 'photos'
    const rawDecor = ctx.flag('m1.base_decor');
    const decorStyle: BaseDecorStyle =
      rawDecor === 'flowers' || rawDecor === 'photos' || rawDecor === 'paper' ? rawDecor : 'paper';

    // Trang 4 luôn có bộ trang trí hoàn chỉnh của Căn cứ
    if (ctx.dayId === 'd.g07.03' || rawDecor !== undefined) {
      const decor = makeBaseDecor(decorStyle);
      decor.position.set(43.4, 0.72, -27.2);
      root.add(decor);
    }

    return root;
  },
};

export default m1BaseSet;
