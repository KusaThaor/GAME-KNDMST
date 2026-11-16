import '@fontsource/nunito/400.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';
import './styles.css';
import { Tracker } from './analytics/tracker';

/**
 * Điểm vào. Ở môi trường test có thêm các trang thử (?lab=sheet, ?lab=yard) và nút kiểm tra đường ống dữ liệu.
 * Ở production các công cụ này bị loại khỏi bản build (__DEV_TOOLS__ = false).
 */
const app = document.getElementById('app')!;
const params = new URLSearchParams(location.search);

async function boot() {
  await Promise.all([document.fonts.load('800 32px Nunito'), document.fonts.load('400 16px Nunito')]).catch(() => undefined);
  const lab = __DEV_TOOLS__ ? params.get('lab') : null;
  if (lab === 'sheet') {
    document.body.classList.add('lab');
    const { runCharacterSheet } = await import('./lab/characterSheet');
    runCharacterSheet(app, params);
    return;
  }
  if (lab === 'yard') {
    document.body.classList.add('lab');
    const { runYardScene } = await import('./lab/yardScene');
    runYardScene(app, params);
    return;
  }
  if (lab === 'assets') {
    document.body.classList.add('lab');
    const { runAssetsPreviewScene } = await import('./lab/assetsPreviewScene');
    runAssetsPreviewScene(app, params);
    return;
  }
  renderHome();
}

function renderHome() {
  app.innerHTML = `
    <main class="home">
      <h1>Hành Trình Thanh Xuân</h1>
      <p class="sub">Những ngày mình còn nhỏ — game 3D trên trình duyệt. Bản đang xây dựng.</p>
      <p class="build">build ${__BUILD_VERSION__} · môi trường ${__APP_ENV__}</p>
      ${__DEV_TOOLS__ ? `
      <section class="dev">
        <h2>Trang thử (chỉ có ở bản test)</h2>
        <ul>
          <li><a href="?lab=sheet&grade=6">Bảng nhân vật lớp 6</a> · <a href="?lab=sheet&grade=9">lớp 9</a> · <a href="?lab=sheet&grade=6&motion=mix">các dáng</a> · <a href="?lab=sheet&grade=6&motion=walk">đi bộ</a></li>
          <li><a href="?lab=yard">Góc sân trường — camera thứ ba</a> · <a href="?lab=yard&view=wide">toàn cảnh</a></li>
          <li><a href="?lab=assets">Triển lãm Asset mới (Bảng phấn & Cây xanh)</a> · <a href="?lab=assets&view=chalkboard">Bảng lớp học</a> · <a href="?lab=assets&view=trees">Cây sân trường</a></li>
        </ul>
        <h2>Kiểm tra đường ống dữ liệu</h2>
        <button id="pipe">Gửi 1 event thử</button>
        <pre id="pipe-out">Chưa gửi.</pre>
      </section>` : ''}
    </main>`;
  if (__DEV_TOOLS__) {
    const out = document.getElementById('pipe-out')!;
    document.getElementById('pipe')!.addEventListener('click', async () => {
      const tracker = new Tracker({ releaseStage: 'prototype', autoFlush: false });
      tracker.setConsent('granted');
      tracker.track('pipeline_test', { source: 'home_button' });
      out.textContent = 'Đang gửi…';
      const r = await tracker.flush();
      out.textContent = JSON.stringify(r, null, 2);
    });
  }
}

void boot();
