/**
 * Theo dõi nhân vật đi qua các khu và các portal — logic thuần, không phụ thuộc Three.js hay giao diện.
 *
 *  - Bản đồ liền: bước qua ranh khu → sự kiện `zone` (để hiện tên khu, đổi preset camera, ghi `zone_entered`).
 *  - Portal kiểu `enter`: bước vào vùng portal → sự kiện `portal` kèm điểm xuất hiện đích; nơi gọi dời nhân vật rồi gọi `arrive()`.
 *  - Portal kiểu `interact`: `interactPortal()` trả portal đang đứng trong; nơi gọi hiện gợi ý và gọi `use()` khi người chơi bấm.
 *  - Không bật lại portal ngay sau khi vừa được đưa tới (đứng trong portal đích) cho tới khi bước ra.
 *  - Portal dẫn tới khu KHÔNG mở trong Ngày này thì bị bỏ qua.
 */
import type { Marker, MarkerKind, Portal } from './types';

export interface TravelWorld {
  zoneAt(x: number, z: number): string | null;
  portalsAt(x: number, z: number): Portal[];
  marker(kind: MarkerKind, id: string): Marker | null;
  isOpen(zone: string): boolean;
}

export type TravelEvent =
  | { type: 'zone'; from: string | null; to: string }
  | { type: 'portal'; portal: Portal; to: Marker };

export class ZoneTracker {
  /** Khu đang đứng (giữ khu cũ khi đứng ở khe giữa hai khối ranh). */
  zone: string | null = null;
  /** Các portal đang đứng trong — không kích hoạt lại cho tới khi bước ra. */
  private inside = new Set<string>();

  constructor(private world: TravelWorld) {}

  private target(p: Portal): Marker | null {
    const to = this.world.marker('spawn', p.targetSpawn);
    return to && this.world.isOpen(to.zone) ? to : null;
  }

  /** Gọi khi nhân vật vừa được ĐẶT tới một chỗ (xuất hiện, dịch chuyển). Trả sự kiện đổi khu nếu có. */
  arrive(x: number, z: number): TravelEvent[] {
    this.inside = new Set(this.world.portalsAt(x, z).map((p) => p.id));
    return this.zoneEvent(x, z);
  }

  /** Gọi sau mỗi lần nhân vật tự đi. */
  update(x: number, z: number): TravelEvent[] {
    const here = this.world.portalsAt(x, z);
    const ids = new Set(here.map((p) => p.id));
    for (const p of here) {
      if (this.inside.has(p.id) || p.activate !== 'enter') continue;
      const to = this.target(p);
      if (to) { this.inside = ids; return [{ type: 'portal', portal: p, to }]; }
    }
    this.inside = ids;
    return this.zoneEvent(x, z);
  }

  /** Portal kiểu `interact` có thể dùng tại chỗ đang đứng. */
  interactPortal(x: number, z: number): Portal | null {
    return this.world.portalsAt(x, z).find((p) => p.activate === 'interact' && this.target(p)) ?? null;
  }

  /** Người chơi bấm dùng portal: trả điểm xuất hiện đích (null = không dùng được). */
  use(p: Portal): Marker | null { return this.target(p); }

  private zoneEvent(x: number, z: number): TravelEvent[] {
    const z2 = this.world.zoneAt(x, z);
    if (!z2 || z2 === this.zone) return [];
    const from = this.zone;
    this.zone = z2;
    return [{ type: 'zone', from, to: z2 }];
  }
}
