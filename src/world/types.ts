/**
 * Kiểu dữ liệu của hệ thống thế giới (S2). Xem docs/S2_WORLD_ARCHITECTURE.md.
 *
 * Tầng A — World Definition: `WorldManifest` (file JSON trong src/world/maps/).
 * Tầng B — Blender: file .blend → .glb, gắn nhãn bằng custom property `htx_*`.
 * Tầng C — Runtime: `World` (world.ts) đọc manifest + GLB, dựng va chạm, sổ marker.
 *
 * Quest và nội dung CHỈ tham chiếu ID ổn định (zone.*, itr.*, spot.*, cam.*, spawn.*) — không tham chiếu tên mesh, tên file.
 */

/** Loại vật có ý nghĩa gameplay trong file Blender. Mọi thứ không gắn nhãn là "visual" (chỉ để nhìn). */
export type MarkerKind = 'spawn' | 'interact' | 'spot' | 'camera' | 'target' | 'portal' | 'zone' | 'trigger';
export type NodeKind = MarkerKind | 'collider' | 'floor' | 'visual';

/** Tiền tố tên object trong Blender → loại (dùng khi object CHƯA có custom property `htx_kind`). Bản đối ứng phía Blender: tools/blender/world/pipeline_config.py — sửa một bên thì sửa cả bên kia. */
export const NAME_PREFIX_KIND: [string, NodeKind][] = [
  ['COLLIDER_', 'collider'], ['FLOOR_', 'floor'], ['SPAWN_', 'spawn'], ['ITR_', 'interact'], ['INTERACT_', 'interact'], ['SPOT_', 'spot'],
  ['CAM_', 'camera'], ['TARGET_', 'target'], ['PORTAL_', 'portal'], ['ZONE_', 'zone'], ['TRIGGER_', 'trigger'],
];
export const MARKER_KINDS: MarkerKind[] = ['spawn', 'interact', 'spot', 'camera', 'target', 'portal', 'zone', 'trigger'];
/** Loại marker bắt buộc có `htx_id`. */
export const KINDS_NEED_ID: NodeKind[] = ['spawn', 'interact', 'spot', 'camera', 'target', 'portal', 'zone', 'trigger'];

// ---------------------------------------------------------------- Tầng A: manifest

export interface ZoneDef {
  /** ID ổn định, trùng `zone_id` trong content (vd. zone.thcs.yard). */
  id: string;
  /** File GLB, tính từ `asset_root` của manifest. */
  asset: string;
  /** File .blend nguồn (đường dẫn trong repo) — để công cụ export và người sửa biết mở file nào. */
  source: string;
  /** Các khu đi tới được trực tiếp từ khu này (đi bộ hoặc qua portal). Phải khai hai chiều. */
  connections: string[];
  /** Preset camera riêng cho khu (nếu khác mặc định của bản đồ). */
  camera_preset?: string;
  /** Dời cả khu (mét, hệ trục game). Mặc định [0,0,0]: file Blender đặt sẵn đúng vị trí trong bản đồ. */
  offset?: [number, number, number];
}

export interface WorldManifest {
  schema: 1;
  /** Trùng `MapDef.id` trong content (vd. map_thcs). */
  map_id: string;
  title: string;
  /** Thư mục chứa GLB khi chạy game (bắt đầu và kết thúc bằng "/"). */
  asset_root: string;
  default_spawn: string;
  /** Khóa trong CAMERA_PRESETS (src/config/camera.ts). */
  camera_preset: string;
  zones: ZoneDef[];
}

// ---------------------------------------------------------------- Tầng C: dữ liệu đã đọc từ GLB

export interface Marker {
  id: string;
  kind: MarkerKind;
  zone: string;
  /** Hệ trục game (Three.js): x sang phải, y lên, z về phía người xem. */
  position: [number, number, number];
  /** Hướng nhìn quanh trục đứng (radian; 0 = nhìn về +z). Lấy từ trục Y (xanh lá) của Empty trong Blender. */
  facing: number;
  /** Bán kính (m) nếu marker có `htx_radius`. */
  radius?: number;
  /** Các thuộc tính `htx_*` còn lại (đã bỏ tiền tố), vd. target_spawn, activate. */
  props: Record<string, string | number | boolean>;
}

/** Vùng trên mặt bằng: hộp xoay quanh trục đứng. Dùng cho ranh khu (`zone`), portal, trigger. */
export interface Region { cx: number; cz: number; hx: number; hz: number; rot: number; y0: number; y1: number }

export type ColliderType = 'box' | 'circle';
export interface ColliderShape extends Region {
  id: string;
  zone: string;
  type: ColliderType;
  /** Bán kính (chỉ dùng khi type = circle). */
  r: number;
  /** Có chắn tầm nhìn camera không (hàng rào thấp, vật nhỏ nên đặt false). */
  blocksCamera: boolean;
}

export interface ZoneRegion extends Region { zone: string }
export interface Portal { id: string; zone: string; region: Region; targetSpawn: string; activate: 'enter' | 'interact'; label: string | null }

/** Lỗi/nhắc khi đọc bản đồ. Game vẫn chạy nếu chỉ có `warn`. */
export interface WorldProblem { level: 'error' | 'warn'; code: string; zone?: string; ref?: string; message: string }

/** Bảng tóm tắt một bản đồ, sinh từ các file GLB (src/world/maps/<map>.index.json). */
export interface WorldIndex {
  map_id: string;
  zones: Record<string, ZoneIndex>;
}
export interface ZoneIndex {
  asset: string;
  markers: { id: string; kind: MarkerKind; position: [number, number, number]; facing: number }[];
  colliders: number;
  floors: number;
  visuals: number;
  triangles: number;
  materials: string[];
  /** Các khu có vật chắn (`htx_gate_zone`) đặt trong file của khu này. */
  gates: string[];
  portals: { id: string; target_spawn: string }[];
  /** [minX, minZ, maxX, maxZ] của phần sàn. */
  floor_bounds: [number, number, number, number] | null;
}
