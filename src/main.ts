import '@fontsource/nunito/400.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';
import '@fontsource/patrick-hand/400.css';
import '@fontsource/caveat/600.css';
import '@fontsource/caveat/700.css';
import './styles.css';
import { Tracker } from './analytics/tracker';
import { RELEASES } from './content/release';

/**
 * Điểm vào. `?play=1` mở game (chỉ khi bản phát hành của môi trường này có Ngày ký ức — xem content/release.ts).
 * Ở môi trường test có thêm các trang thử (?lab=sheet, ?lab=yard), công cụ test của game (?day=&step=, ?bot=release, ?cast=)
 * và nút kiểm tra đường ống dữ liệu. Ở production các công cụ này bị loại khỏi bản build (__DEV_TOOLS__ = false).
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
  if (params.has('play') && HAS_GAME) { await startGame(); return; }
  renderHome();
}

/** Bản phát hành của môi trường này có nội dung để chơi không (production đang để trống cho tới khi D-03 chốt). */
const HAS_GAME = RELEASES[__APP_ENV__].memory_day_ids.length > 0;

async function startGame() {
  document.body.classList.add('game');
  const { runGame } = await import('./game/game');
  if (__DEV_TOOLS__) {
    const tools = await import('./lab/gameTools');
    const handle = await runGame(app, tools.runOptionsFromUrl(params));
    tools.attachGameTools(handle, params);
    return;
  }
  await runGame(app);
}

function renderHome() {
  app.innerHTML = `
    <main class="home">
      <h1>Vùng Ký Ức</h1>
      <p class="sub">Vùng Ký Ức — game 3D trên trình duyệt. Bản đang xây dựng.</p>
      <p class="build">build ${__BUILD_VERSION__} · môi trường ${__APP_ENV__}</p>
      ${HAS_GAME ? `<p><a class="play" href="?play=1">▶ Chơi bản khung</a></p>` : ''}
      ${__DEV_TOOLS__ ? `
      <section class="dev">
        <h2>Trang thử (chỉ có ở bản test)</h2>
        <ul>
          <li><a href="?lab=sheet&grade=6">Bảng nhân vật lớp 6</a> · <a href="?lab=sheet&grade=9">lớp 9</a> · <a href="?lab=sheet&grade=6&motion=mix">các dáng</a> · <a href="?lab=sheet&grade=6&motion=walk">đi bộ</a></li>
          <li><a href="?lab=yard">Góc sân trường — camera thứ ba</a> · <a href="?lab=yard&view=wide">toàn cảnh</a></li>
          <li>Thử nghiệm S2: <a href="?lab=yard&fx=dust&intro=1&tweak=1">bụi nắng + camera lướt + bảng chỉnh</a> · <a href="?lab=yard&asset=desk">bàn học từ Blender</a></li>
        </ul>
        <h2>Công cụ test của game</h2>
        <ul>
          <li><a href="?play=1&bot=release">Bot chơi hết bản thử</a> · <a href="?play=1&day=d.g07.03&step=q_m1_main_05.s03">nhảy tới bước đặt máy ảnh</a></li>
          <li>Thử bảng vai (D-01): <a href="?play=1&cast=A">A</a> · <a href="?play=1&cast=B">B</a> · <a href="?play=1&cast=C">C</a></li>
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
