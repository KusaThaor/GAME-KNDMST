import type { AssetGenerator } from './types';
import { vietnameseSchoolDeskGenerator } from './vietnameseSchoolDesk';

export * from './types';
export * from './vietnameseSchoolDesk';

/** Danh sách tất cả các generator có sẵn trong Workshop */
export const assetGenerators: AssetGenerator<any>[] = [
  vietnameseSchoolDeskGenerator,
];

/** Lấy generator theo ID */
export function getGeneratorById(id: string): AssetGenerator<any> | undefined {
  return assetGenerators.find((g) => g.id === id);
}
