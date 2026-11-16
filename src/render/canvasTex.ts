import * as THREE from 'three';

/** Texture vẽ bằng canvas lúc chạy (chữ tiếng Việt, cờ, nền gạch, bảng phấn) — không cần tải file ảnh. */
export function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, opts: { repeat?: [number, number] } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d')!;
  draw(g);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (opts.repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...opts.repeat); }
  return t;
}

export function signTexture(text: string, opts: { bg?: string; fg?: string; border?: string; w?: number; h?: number; font?: string } = {}) {
  const w = opts.w ?? 256, h = opts.h ?? 128;
  return canvasTexture(w, h, (g) => {
    g.fillStyle = opts.bg ?? '#f7f3e8'; g.fillRect(0, 0, w, h);
    if (opts.border) { g.strokeStyle = opts.border; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); }
    g.fillStyle = opts.fg ?? '#1f3d7a';
    g.font = opts.font ?? `800 ${Math.round(h * 0.6)}px Nunito, "DejaVu Sans", sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, w / 2, h / 2 + h * 0.04);
  });
}

/** Bảng viết phấn xanh chống lóa với chữ phấn trắng nắn nót học đường Việt Nam 2012 (GDD / in_class.png) */
export function chalkboardTexture(w = 1024, h = 512) {
  return canvasTexture(w, h, (g) => {
    // 1. Nền xanh rêu đậm chống lóa học đường
    g.fillStyle = '#1b3f24';
    g.fillRect(0, 0, w, h);

    // Vết bụi phấn nhẹ loang mờ tự nhiên
    const dust = g.createRadialGradient(w * 0.5, h * 0.5, 40, w * 0.5, h * 0.5, w * 0.6);
    dust.addColorStop(0, 'rgba(255, 255, 255, 0.06)');
    dust.addColorStop(0.6, 'rgba(255, 255, 255, 0.02)');
    dust.addColorStop(1, 'rgba(0, 0, 0, 0.08)');
    g.fillStyle = dust;
    g.fillRect(0, 0, w, h);

    // 2. Kẻ đường ô ly phấn mờ 5cm (đặc trưng bảng tiểu học & THCS Việt Nam)
    g.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    g.lineWidth = 1.5;
    const gridStep = 48;
    for (let x = 32; x < w - 32; x += gridStep) {
      g.beginPath(); g.moveTo(x, 24); g.lineTo(x, h - 24); g.stroke();
    }
    for (let y = 32; y < h - 32; y += gridStep) {
      g.beginPath(); g.moveTo(32, y); g.lineTo(w - 32, y); g.stroke();
    }

    // 3. Dòng chữ phấn trắng viết tay học đường 2012-2013 (khớp concept in_class.png)
    g.fillStyle = 'rgba(255, 255, 255, 0.92)';
    g.shadowColor = 'rgba(255, 255, 255, 0.4)';
    g.shadowBlur = 3;

    // Tiêu đề ngày tháng ở góc trên
    g.font = '700 24px Nunito, "Comic Sans MS", cursive, sans-serif';
    g.textAlign = 'center';
    g.fillText('Thứ Hai, ngày 03 tháng 9 năm 2012', w / 2, 70);

    // Môn học & bài học
    g.font = '800 32px Nunito, "Comic Sans MS", cursive, sans-serif';
    g.fillText('TẬP ĐỌC: TÔI ĐI HỌC', w / 2, 130);

    // Nội dung bài giảng nắn nót
    g.font = '600 22px Nunito, "Comic Sans MS", cursive, sans-serif';
    g.textAlign = 'left';
    g.fillText('1. Hằng năm cứ vào cuối thu, lá ngoài đường rụng nhiều...', 90, 200);
    g.fillText('2. Lòng tôi lại nao nức những kỷ niệm mơn man của buổi tựu trường.', 90, 245);
    g.fillText('3. Buổi sáng mai hôm ấy, một buổi mai đầy sương thu và gió lạnh...', 90, 290);

    // Góc phải: dặn dò trực nhật & sĩ số
    g.textAlign = 'right';
    g.font = '700 20px Nunito, "Comic Sans MS", cursive, sans-serif';
    g.fillText('Lớp: 6A1  |  Sĩ số: 38/38', w - 80, 420);
    g.fillText('Trực nhật: Tổ 1 (Đức, Quân, Châu, Hạ, Lâm)', w - 80, 455);
  });
}

/** Quốc kỳ: nền đỏ, sao vàng năm cánh. */
export function flagTexture() {
  return canvasTexture(300, 200, (g) => {
    g.fillStyle = '#da251d'; g.fillRect(0, 0, 300, 200);
    g.fillStyle = '#ffde00';
    const cx = 150, cy = 100, R = 60, r = R * 0.382;
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 === 0 ? R : r;
      g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    g.closePath(); g.fill();
  });
}

/** Nền sân xi măng chia ô, có vệt loang nhẹ. Lặp lại trên mặt đất. */
export function concreteTexture(seed = 7) {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return canvasTexture(512, 512, (g) => {
    g.fillStyle = '#d9d2c3'; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 2600; i++) {
      const v = 190 + Math.floor(rnd() * 40);
      g.fillStyle = `rgba(${v},${v - 6},${v - 18},0.35)`;
      const x = rnd() * 512, y = rnd() * 512, r = 1 + rnd() * 3;
      g.fillRect(x, y, r, r);
    }
    for (let i = 0; i < 14; i++) {
      g.fillStyle = `rgba(150,140,120,${0.04 + rnd() * 0.05})`;
      g.beginPath(); g.ellipse(rnd() * 512, rnd() * 512, 30 + rnd() * 70, 20 + rnd() * 50, rnd() * 3, 0, Math.PI * 2); g.fill();
    }
    g.strokeStyle = 'rgba(140,128,110,0.55)'; g.lineWidth = 3;
    for (let k = 0; k <= 512; k += 128) {
      g.beginPath(); g.moveTo(k, 0); g.lineTo(k, 512); g.stroke();
      g.beginPath(); g.moveTo(0, k); g.lineTo(512, k); g.stroke();
    }
  }, { repeat: [12, 12] });
}
