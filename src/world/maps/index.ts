/**
 * Sổ bản đồ. Thêm bản đồ mới = thêm 2 file JSON vào thư mục này, KHÔNG cần sửa code:
 *   <map_id>.world.json  — manifest viết tay (Tầng A)
 *   <map_id>.index.json  — bảng tóm tắt sinh tự động bằng `npm run world:index`
 */
import type { WorldIndex, WorldManifest } from '../types';

const manifests = import.meta.glob<WorldManifest>('./*.world.json', { eager: true, import: 'default' });
const indexes = import.meta.glob<WorldIndex>('./*.index.json', { eager: true, import: 'default' });

export const WORLD_MANIFESTS: Record<string, WorldManifest> = Object.fromEntries(Object.values(manifests).map((m) => [m.map_id, m]));
export const WORLD_INDEXES: Record<string, WorldIndex> = Object.fromEntries(Object.values(indexes).map((m) => [m.map_id, m]));
