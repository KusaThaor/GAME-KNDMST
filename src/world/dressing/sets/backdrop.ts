import type { DressingSet } from '../index';
import { makeTownRing } from '../../backdrop/townRing';

/**
 * N-07 · Bộ vành nền phố thị trấn miền Nam và mặt đất mở rộng (PX-02, PX-03).
 * Gắn vào mọi Ngày ký ức để che kín khoảng trống ngoài tường rào.
 */
const backdropSet: DressingSet = {
  id: 'backdrop',
  appliesTo: () => true,
  build: () => makeTownRing(),
};

export default backdropSet;
