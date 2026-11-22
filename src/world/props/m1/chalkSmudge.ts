import * as THREE from 'three';

export interface ChalkSmudgeOpts {
  width?: number;
  height?: number;
  canvasWidth?: number;
  canvasHeight?: number;
}

export interface ChalkSmudgeControl {
  mesh: THREE.Mesh;
  group: THREE.Group;
  erase: (u: number, v: number, radius?: number) => void;
  reset: () => void;
  getRemainingRatio: () => number;
}

/**
 * PX-13 · Vệt phấn trên bảng lớp học.
 * Có texture canvas hỗ trợ hàm erase(u, v, r) cho minigame lau bảng.
 * Gốc min.y = 0, ngân sách ≤ 2 tam giác (1 Quad).
 */
export function makeChalkSmudge(opts: ChalkSmudgeOpts = {}): THREE.Group & { smudgeControl?: ChalkSmudgeControl } {
  const root = new THREE.Group() as THREE.Group & { smudgeControl?: ChalkSmudgeControl };
  root.name = 'chalkSmudge';

  const w = opts.width ?? 2.2;
  const h = opts.height ?? 1.1;
  const cw = opts.canvasWidth ?? 512;
  const ch = opts.canvasHeight ?? 256;

  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  let initialPixelCount = 0;

  function drawSmudge() {
    ctx.clearRect(0, 0, cw, ch);
    ctx.globalCompositeOperation = 'source-over';

    // Bụi phấn mờ toàn bảng
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    for (let i = 0; i < 40; i++) {
      const rx = (Math.sin(i * 12.3) * 0.5 + 0.5) * cw;
      const ry = (Math.cos(i * 7.7) * 0.5 + 0.5) * ch;
      const rad = 25 + (i % 5) * 15;
      ctx.beginPath();
      ctx.arc(rx, ry, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    // Các dòng phấn trắng viết bài toán lớp 6
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = 'bold 24px Nunito, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Bài 1: Tìm x biết:', 40, 55);
    ctx.font = '22px Nunito, sans-serif';
    ctx.fillText('a)  3x + 15 = 48  =>  x = 11', 60, 95);
    ctx.fillText('b)  (x - 5) . 4 = 36', 60, 135);

    // Hình vẽ hình học & vệt phấn lau dở
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(350, 160);
    ctx.lineTo(440, 60);
    ctx.lineTo(470, 160);
    ctx.closePath();
    ctx.stroke();

    ctx.font = 'italic 18px Nunito, sans-serif';
    ctx.fillText('Tam giác ABC', 360, 190);

    // Tính số pixel trắng ban đầu
    const imgData = ctx.getImageData(0, 0, cw, ch).data;
    initialPixelCount = 0;
    for (let i = 3; i < imgData.length; i += 4) {
      if (imgData[i] > 25) initialPixelCount++;
    }
  }

  drawSmudge();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  mat.userData.outlineParameters = { visible: false };

  const geo = new THREE.PlaneGeometry(w, h);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, h / 2, 0); // Đặt tâm sao cho min.y = 0
  root.add(mesh);

  function erase(u: number, v: number, radius = 0.08) {
    const px = Math.max(0, Math.min(cw, u * cw));
    const py = Math.max(0, Math.min(ch, (1 - v) * ch));
    const r = radius * cw;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();

    texture.needsUpdate = true;
  }

  function getRemainingRatio(): number {
    if (initialPixelCount === 0) return 0;
    const imgData = ctx.getImageData(0, 0, cw, ch).data;
    let currentCount = 0;
    for (let i = 3; i < imgData.length; i += 4) {
      if (imgData[i] > 25) currentCount++;
    }
    return currentCount / initialPixelCount;
  }

  function reset() {
    drawSmudge();
    texture.needsUpdate = true;
  }

  const control: ChalkSmudgeControl = {
    mesh,
    group: root,
    erase,
    reset,
    getRemainingRatio,
  };

  root.userData.smudgeControl = control;
  root.smudgeControl = control;

  return root;
}
