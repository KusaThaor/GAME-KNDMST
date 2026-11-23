import * as THREE from 'three';
import { canvasTexture } from '../../render/canvasTex';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export interface TownSignDef {
  title: string;
  subtitle: string;
  bg: string;
  fg: string;
  subFg: string;
}

export const TOWN_SIGNS: readonly TownSignDef[] = [
  { title: 'UỐN TÓC THÚY NGA', subtitle: 'Cắt • Uốn • Gội • Sấy Nam Nữ', bg: '#c9184a', fg: '#ffffff', subFg: '#ffccd5' },
  { title: 'TẠP HÓA ÚT NHỎ', subtitle: 'Bánh kẹo • Nước giải khát • Thẻ cào', bg: '#1d3557', fg: '#ffb703', subFg: '#f1faee' },
  { title: 'VÉ SỐ BA TRI', subtitle: 'Đại Lý Cấp 1 • Chiều Xổ 16h30', bg: '#d90429', fg: '#ffea00', subFg: '#ffffff' },
  { title: 'SỬA XE ANH BẢY', subtitle: 'Vá vỏ • Thay nhớt • Rửa xe máy', bg: '#fb8500', fg: '#14213d', subFg: '#023047' },
  { title: 'CƠM TẤM 1989', subtitle: 'Sườn Bì Chả • Trứng Ốp La', bg: '#f8edeb', fg: '#b7094c', subFg: '#2b2d42' },
  { title: 'CÀ PHÊ VÕNG', subtitle: 'Điểm Hẹn Bình Dân • Trà Đá Miễn Phí', bg: '#2d6a4f', fg: '#ffffff', subFg: '#d8f3dc' },
  { title: 'NHÀ THUỐC Á CHÂU', subtitle: 'Đạt Chuẩn GPP • Dược Sĩ Tư Vấn', bg: '#ffffff', fg: '#007f5f', subFg: '#2b2d42' },
  { title: 'TIỆM MAY THANH LAN', subtitle: 'Áo Dài • Đồng Phục Học Sinh', bg: '#fefae0', fg: '#6b2d5c', subFg: '#3d405b' },
];

let cachedAtlasTexture: THREE.Texture | null = null;

/** Tạo Texture Atlas 1024x512 chứa 8 bảng hiệu (2 hàng x 4 cột). */
export function getTownSignAtlasTexture(): THREE.Texture {
  if (cachedAtlasTexture) return cachedAtlasTexture;

  if (typeof document === 'undefined') {
    const t = new THREE.DataTexture(new Uint8Array([200, 200, 200, 255]), 1, 1);
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    cachedAtlasTexture = t;
    return cachedAtlasTexture;
  }

  const atlasW = 1024;
  const atlasH = 512;
  const cellW = 256;
  const cellH = 256;

  cachedAtlasTexture = canvasTexture(atlasW, atlasH, (g) => {
    // Nền mặc định xám nhạt
    g.fillStyle = '#cccccc';
    g.fillRect(0, 0, atlasW, atlasH);

    for (let i = 0; i < TOWN_SIGNS.length; i++) {
      const sign = TOWN_SIGNS[i];
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = col * cellW;
      const y = row * cellH;

      // Nền biển hiệu có bo viền
      g.fillStyle = sign.bg;
      g.fillRect(x + 6, y + 20, cellW - 12, cellH - 40);

      // Viền kim loại/khung biển
      g.strokeStyle = '#ffffff';
      g.lineWidth = 4;
      g.strokeRect(x + 10, y + 24, cellW - 20, cellH - 48);

      // Dải trang trí nhỏ trên/dưới
      g.fillStyle = sign.fg;
      g.fillRect(x + 14, y + 28, cellW - 28, 6);

      // Tên hiệu chính
      g.fillStyle = sign.fg;
      g.font = 'bold 22px Nunito, "Arial Black", sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(sign.title, x + cellW / 2, y + 95);

      // Dòng phụ chú
      g.fillStyle = sign.subFg;
      g.font = 'bold 12px Nunito, Arial, sans-serif';
      g.fillText(sign.subtitle, x + cellW / 2, y + 145);

      // Số điện thoại / địa chỉ giả định kiểu miền Nam
      g.font = 'italic 10px Nunito, Arial, sans-serif';
      g.fillText('ĐT: 0918.xxx.xxx • Khu Phố 2', x + cellW / 2, y + 185);
    }
  });

  return cachedAtlasTexture;
}

export interface SignPlacement {
  signIndex: number;
  pos: [number, number, number];
  rotY?: number;
  width?: number;
  height?: number;
}

/**
 * Gom toàn bộ các biển hiệu thành ĐÚNG 1 MESH duy nhất (1 draw call).
 */
export function makeTownSignsMesh(placements: SignPlacement[]): THREE.Mesh | null {
  if (placements.length === 0) return null;

  const atlas = getTownSignAtlasTexture();
  const mat = new THREE.MeshToonMaterial({
    map: atlas,
    side: THREE.DoubleSide,
  });
  mat.userData.outlineParameters = { visible: false };

  const geos: THREE.BufferGeometry[] = [];

  for (const p of placements) {
    const idx = Math.abs(p.signIndex) % 8;
    const col = idx % 4;
    const row = Math.floor(idx / 4);

    const u0 = col * 0.25;
    const u1 = (col + 1) * 0.25;
    const v0 = 1 - (row + 1) * 0.5;
    const v1 = 1 - row * 0.5;

    const w = p.width ?? 3.2;
    const h = p.height ?? 1.1;

    const geo = new THREE.PlaneGeometry(w, h);
    // Gán lại UV mapping cho đúng ô atlas
    const uvs = geo.attributes.uv;
    // PlaneGeometry UV vertices: 0: (0, 1), 1: (1, 1), 2: (0, 0), 3: (1, 0)
    uvs.setXY(0, u0, v1);
    uvs.setXY(1, u1, v1);
    uvs.setXY(2, u0, v0);
    uvs.setXY(3, u1, v0);
    uvs.needsUpdate = true;

    // Áp dụng transform cho geometry
    const matrix = new THREE.Matrix4();
    const rot = new THREE.Euler(0, p.rotY ?? 0, 0);
    const quat = new THREE.Quaternion().setFromEuler(rot);
    matrix.compose(new THREE.Vector3(...p.pos), quat, new THREE.Vector3(1, 1, 1));
    geo.applyMatrix4(matrix);

    geos.push(geo);
  }

  const merged = mergeGeometries(geos, false);
  if (!merged) return null;

  const mesh = new THREE.Mesh(merged, mat);
  mesh.name = 'backdrop_town_signs';
  mesh.castShadow = false;
  mesh.receiveShadow = false;

  return mesh;
}
