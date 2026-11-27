import { useEffect, useRef } from 'preact/hooks';
import { regionCorners, type MapZoneRegion, type MinimapView } from '../../../game/runtime/navigationHud';
import type { UiActions, UiState } from '../store';

const MINIMAP_SIZE = 138;
const RADAR_RADIUS_M = 34;

function zoneFill(zone: string, open: boolean): string {
  if (!open) return '#cfc8b8';
  if (zone.includes('classroom')) return '#faefd7';
  if (zone.includes('corridor')) return '#f2e2c2';
  if (zone.includes('base')) return '#d5e4b8';
  if (zone.includes('field')) return '#e2ecc8';
  if (zone.includes('gate')) return '#efe0c8';
  return '#ede5cf';
}

function drawGrid(ctx: CanvasRenderingContext2D, toScreen: (x: number, z: number) => [number, number], minX: number, maxX: number, minZ: number, maxZ: number) {
  ctx.save();
  ctx.strokeStyle = 'rgba(58, 44, 38, 0.08)';
  ctx.lineWidth = 1;
  const x0 = Math.floor(minX / 10) * 10;
  const z0 = Math.floor(minZ / 10) * 10;
  for (let x = x0; x <= maxX; x += 10) {
    const [sx0, sy0] = toScreen(x, minZ);
    const [sx1, sy1] = toScreen(x, maxZ);
    ctx.beginPath(); ctx.moveTo(sx0, sy0); ctx.lineTo(sx1, sy1); ctx.stroke();
  }
  for (let z = z0; z <= maxZ; z += 10) {
    const [sx0, sy0] = toScreen(minX, z);
    const [sx1, sy1] = toScreen(maxX, z);
    ctx.beginPath(); ctx.moveTo(sx0, sy0); ctx.lineTo(sx1, sy1); ctx.stroke();
  }
  ctx.restore();
}

function drawZones(ctx: CanvasRenderingContext2D, zones: readonly MapZoneRegion[], toScreen: (x: number, z: number) => [number, number]) {
  for (const r of zones) {
    const corners = regionCorners(r).map(([x, z]) => toScreen(x, z));
    if (!corners.length) continue;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(corners[0][0], corners[0][1]);
    for (let i = 1; i < corners.length; i++) ctx.lineTo(corners[i][0], corners[i][1]);
    ctx.closePath();
    ctx.fillStyle = zoneFill(r.zone, r.open);
    ctx.fill();
    ctx.strokeStyle = r.open ? 'rgba(58, 44, 38, 0.45)' : 'rgba(58, 44, 38, 0.35)';
    ctx.lineWidth = r.open ? 1.5 : 1;
    if (!r.open) ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.restore();
  }
}

function drawViewCone(ctx: CanvasRenderingContext2D, px: number, py: number, cameraYaw: number, radiusPx: number) {
  // cameraYaw: hướng nhìn thẳng của camera là (-sin(yaw), -cos(yaw))
  const angle = Math.atan2(-Math.cos(cameraYaw), -Math.sin(cameraYaw));
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.arc(px, py, radiusPx, angle - 0.42, angle + 0.42);
  ctx.closePath();
  const grad = ctx.createRadialGradient(px, py, 2, px, py, radiusPx);
  grad.addColorStop(0, 'rgba(242, 181, 58, 0.38)');
  grad.addColorStop(1, 'rgba(242, 181, 58, 0)');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();
}

function drawPlayerArrow(ctx: CanvasRenderingContext2D, x: number, y: number, facing: number, scale = 1) {
  // facing = 0 → nhìn về +z (xuống dưới trên màn hình 2D: (0, +1))
  const ang = Math.atan2(Math.cos(facing), Math.sin(facing));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(8, 0);
  ctx.lineTo(-6, 5.5);
  ctx.lineTo(-3, 0);
  ctx.lineTo(-6, -5.5);
  ctx.closePath();
  ctx.fillStyle = '#d8332a';
  ctx.fill();
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = '#fffdf6';
  ctx.stroke();
  ctx.restore();
}

function drawTargetDot(ctx: CanvasRenderingContext2D, x: number, y: number, primary: boolean, size = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);
  if (primary) {
    ctx.beginPath();
    ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(242, 181, 58, 0.36)';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -6.5);
    ctx.lineTo(5.5, 0);
    ctx.lineTo(0, 6.5);
    ctx.lineTo(-5.5, 0);
    ctx.closePath();
    ctx.fillStyle = '#f2b53a';
    ctx.fill();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#3a2c26';
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, 4.2, 0, Math.PI * 2);
    ctx.fillStyle = '#2d9d92';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#fffdf6';
    ctx.stroke();
  }
  ctx.restore();
}

function drawMiniRadar(canvas: HTMLCanvasElement, data: MinimapView) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const size = MINIMAP_SIZE;
  if (canvas.width !== size * dpr || canvas.height !== size * dpr) {
    canvas.width = size * dpr;
    canvas.height = size * dpr;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, size, size);
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#dce6cf';
  ctx.fillRect(0, 0, size, size);

  const half = size / 2;
  const pxPerMeter = (half - 4) / RADAR_RADIUS_M;
  const toScreen = (x: number, z: number): [number, number] => [
    half + (x - data.player.x) * pxPerMeter,
    half + (z - data.player.z) * pxPerMeter,
  ];

  drawGrid(ctx, toScreen, data.player.x - RADAR_RADIUS_M, data.player.x + RADAR_RADIUS_M, data.player.z - RADAR_RADIUS_M, data.player.z + RADAR_RADIUS_M);
  drawZones(ctx, data.zones, toScreen);
  drawViewCone(ctx, half, half, data.player.cameraYaw, 28);

  const edgePad = 10;
  for (const t of data.targets) {
    const [sx, sy] = toScreen(t.x, t.z);
    const dx = sx - half, dy = sy - half;
    const maxR = half - edgePad;
    const distPx = Math.hypot(dx, dy);
    if (distPx <= maxR) {
      drawTargetDot(ctx, sx, sy, t.primary, 1);
    } else if (t.primary) {
      const k = maxR / distPx;
      const ex = half + dx * k, ey = half + dy * k;
      const ang = Math.atan2(dy, dx);
      ctx.save();
      ctx.translate(ex, ey);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.moveTo(6, 0);
      ctx.lineTo(-5, 4.5);
      ctx.lineTo(-3, 0);
      ctx.lineTo(-5, -4.5);
      ctx.closePath();
      ctx.fillStyle = '#f2b53a';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#3a2c26';
      ctx.stroke();
      ctx.restore();
    }
  }

  drawPlayerArrow(ctx, half, half, data.player.facing, 1);
  ctx.restore();
}

function drawFullMap(canvas: HTMLCanvasElement, data: MinimapView) {
  const W = 720, H = 500;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
    canvas.width = W * dpr;
    canvas.height = H * dpr;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#e2ebd6';
  ctx.fillRect(0, 0, W, H);

  const { minX, minZ, maxX, maxZ } = data.bounds;
  const spanX = Math.max(1, maxX - minX);
  const spanZ = Math.max(1, maxZ - minZ);
  const pad = 28;
  const scale = Math.min((W - pad * 2) / spanX, (H - pad * 2) / spanZ);
  const ox = (W - spanX * scale) / 2 - minX * scale;
  const oz = (H - spanZ * scale) / 2 - minZ * scale;
  const toScreen = (x: number, z: number): [number, number] => [ox + x * scale, oz + z * scale];

  drawGrid(ctx, toScreen, minX, maxX, minZ, maxZ);
  drawZones(ctx, data.zones, toScreen);

  // Tên từng khu (gom theo ID vì một khu có thể gồm nhiều hộp)
  const grouped = new Map<string, { name: string; open: boolean; sx: number; sz: number; n: number }>();
  for (const z of data.zones) {
    const cur = grouped.get(z.zone) ?? { name: z.name, open: z.open, sx: 0, sz: 0, n: 0 };
    cur.sx += z.cx; cur.sz += z.cz; cur.n += 1;
    grouped.set(z.zone, cur);
  }
  ctx.font = '800 13px Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const g of grouped.values()) {
    const [lx, ly] = toScreen(g.sx / g.n, g.sz / g.n);
    const text = g.open ? g.name : `${g.name} (Khóa)`;
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255, 250, 238, 0.92)';
    ctx.strokeText(text, lx, ly);
    ctx.fillStyle = g.open ? '#3a2c26' : 'rgba(58, 44, 38, 0.55)';
    ctx.fillText(text, lx, ly);
  }

  // Điểm mục tiêu
  const drawLabel = (text: string, x: number, y: number, primary: boolean) => {
    ctx.font = primary ? '800 13px Nunito, sans-serif' : '700 12px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255, 250, 238, 0.95)';
    ctx.strokeText(text, x, y - 10);
    ctx.fillStyle = primary ? '#a52119' : '#1b6d65';
    ctx.fillText(text, x, y - 10);
  };
  for (const t of data.targets) {
    if (t.primary) continue;
    const [sx, sy] = toScreen(t.x, t.z);
    drawTargetDot(ctx, sx, sy, false, 1.25);
    drawLabel(t.label, sx, sy, false);
  }
  const primary = data.targets.find((t) => t.primary);
  if (primary) {
    const [sx, sy] = toScreen(primary.x, primary.z);
    drawTargetDot(ctx, sx, sy, true, 1.35);
    drawLabel(primary.label, sx, sy, true);
  }

  const [px, py] = toScreen(data.player.x, data.player.z);
  drawViewCone(ctx, px, py, data.player.cameraYaw, 38);
  drawPlayerArrow(ctx, px, py, data.player.facing, 1.25);
  ctx.restore();
}

export function MinimapOverlay({ s, a, blocking }: { s: UiState; a: UiActions; blocking: boolean }) {
  const miniRef = useRef<HTMLCanvasElement>(null);
  const fullRef = useRef<HTMLCanvasElement>(null);
  const data = s.minimap ?? null;

  useEffect(() => {
    if (data && miniRef.current && !s.mapOpen) drawMiniRadar(miniRef.current, data);
  }, [data, s.mapOpen]);

  useEffect(() => {
    if (data && s.mapOpen && fullRef.current) drawFullMap(fullRef.current, data);
  }, [data, s.mapOpen]);

  if (s.mode !== 'day' || !data || s.fade.on) return null;

  return (
    <>
      {!blocking && !s.photo && (
        <button
          type="button"
          class="g-minimap"
          data-testid="minimap"
          data-act="map-toggle"
          title="Nhấp vào bản đồ để mở rộng"
          aria-label="Nhấp vào bản đồ để mở rộng"
          onClick={a.toggleMap}
        >
          <canvas ref={miniRef} />
          {data.currentZone && <span class="g-minimap-zone-badge">{data.currentZone}</span>}
        </button>
      )}
      {s.mapOpen && (
        <div class="g-map-backdrop" data-act="map-backdrop" onClick={a.toggleMap}>
          <div class="g-card g-fullmap" data-testid="full-map" onClick={(e) => e.stopPropagation()}>
            <header>
              <div class="g-fullmap-title">
                <h2>Bản đồ khu vực</h2>
                {data.currentZone && <span class="tag">{data.currentZone}</span>}
              </div>
              <button data-act="map-close" onClick={a.toggleMap}>Đóng</button>
            </header>
            <canvas ref={fullRef} class="g-fullmap-canvas" />
            <div class="g-fullmap-legend">
              <span><i class="lg-dot lg-player" />Bạn</span>
              <span><i class="lg-dot lg-primary" />Mục tiêu chính</span>
              <span><i class="lg-dot lg-side" />Mục tiêu khác</span>
              <span><i class="lg-dot lg-locked" />Khu chưa mở</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
