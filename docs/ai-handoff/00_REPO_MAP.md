# 00_REPO_MAP — bản đồ repo cho đợt audit cuối (Fable)

Lập 16/11/2026 từ bản clone nông (không có lịch sử). Chỉ là bản đồ, **không phải kết quả audit**. Mọi thứ chưa tự chạy/đọc kỹ đều ghi ở mục "Chưa xác minh".

## 1. Nhánh và commit (remote `origin`)
| Nhánh | Commit | Vai trò | Số file |
|---|---|---|---|
| `feature/s2-world-camera-blender` | `b69058e` | **Nhánh đang phát triển** (S2) | 163 |
| `dev` | `4f681cb` | Bản test (F0–F10, trước S2) | 101 |
| `main` | `4adf991` | Production, chỉ là khung ban đầu ("Scaffold") | 42 |
| `feature/asset-workshop` | `51baf28` | Antigravity: asset, nhân vật, Asset Workshop | 511 |

- S2 so với `dev`: 83 file đổi, +8460 / −238 dòng.
- Chưa gộp S2 vào `dev`; chưa đụng `main`. Chưa có Pull Request (theo handoff).
- Vercel: `dev` = preview test, `main` = production. Link preview cần đăng nhập Vercel.
- Stack (`package.json`): Vite 8, TypeScript 5.9, three 0.187, preact 11, gsap, three.quarks, tweakpane (chỉ bản test), firebase-admin (phía `api/`), vitest 5, Playwright 1.63. Node 22.x.

## 2. Cấu trúc nhánh S2 (tóm tắt)
```
api/            /api/collect, /api/health (Vercel) + _lib/{collect,firestore}.ts
shared/events.ts  danh sách event analytics dùng chung client/server
src/core/       save, eventBus, conditions, photoStoreIdb
src/content/    dữ liệu nội dung (Ngày, cast, hub, release) + validate  [nội dung giả]
src/systems/    questEngine, dialogue, gameFlow, album, hub, release
src/game/       game.ts (điều phối), input.ts, gestures.ts, scenes/{dayScene,hubScene}
src/world/      types, parse, world, collision, travel, dayBindings, validate, maps/
src/actors/     player/{controller,avatar}, camera/cameraManager, character/*
src/render/     stage, style, materials, assets, fx...
src/ui/         Hud.tsx, game/{GameUi,TouchControls,store}
src/analytics/  bridge, tracker, heartbeat
src/config/     camera, game, hub, photo, album
src/lab/        công cụ chỉ cho bản test (gameTools, inputDiagnostics, tweaks...)
tools/blender/  world/ (pipeline 6 khu), props/, common.py, assets.json
public/assets/world/map_thcs/  6 file zone_*.glb
tests/unit (+ world/), tests/e2e {game,smoke,world}.spec.ts
```

## 3. Hệ thống ↔ file
| Hệ thống | File chính | Ghi chú |
|---|---|---|
| Quest (engine) | `src/systems/questEngine.ts` (403 dòng) | `QuestEngine`, trigger `interact`/`arrive`, phase `idle→playing→end_prompt→free_after_main→ended`. Test: `tests/unit/questEngine.test.ts` |
| Dữ liệu quest/Ngày | `src/content/days/d_g06_01.ts`, `d_g07_03.ts`, `types.ts`, `pack.ts`, `indexContent.ts`, `validate.ts` | Chỉ 2 Ngày, nội dung `[PLACEHOLDER]` |
| Hội thoại | `src/systems/dialogue.ts` (37 dòng) + lời thoại trong `src/content/` + UI `src/ui/game/GameUi.tsx` | `resolveLines`, `formatText`, `speakerName`; điều kiện ở `src/core/conditions.ts` |
| Tương tác | `src/game/game.ts` (hàm `interact()`, ~dòng 472–490), `dayScene.ts` (`DayTarget`, bán kính), phím E ở `src/config/camera.ts` `CONTROLS`, nút E ảo `TouchControls.tsx` | Vị trí điểm tương tác lấy từ marker `itr.*` qua `src/world/dayBindings.ts` |
| Timeline / cuộn phim (phím C) | **Chưa có.** Chỉ còn chỗ giữ phím C ở `src/config/camera.ts` và tham chiếu trong `game.ts` | Handoff ghi "chưa làm". Không có hệ thống timeline riêng |
| Save/Load | `src/core/save.ts` (`SAVE_VERSION=2`, khóa `htx.save`, localStorage), `src/core/photoStoreIdb.ts` (IndexedDB cho ảnh) | Tên Player chỉ lưu cục bộ. Test: `tests/unit/save.test.ts` |
| Scene | `src/game/scenes/hubScene.ts` (phòng 2026, góc cố định), `dayScene.ts` (Ngày ký ức: World + controller + camera + tracker) | Luồng cảnh: `src/systems/gameFlow.ts` (máy trạng thái `boot→hub_intro→hub_idle→to_day→memory_day→day_end→to_hub`) |
| Điều phối | `src/game/game.ts` (768 dòng) | Điểm tập trung lớn nhất, nên đọc sớm |
| Album / Hộp Kỷ Vật | `src/systems/album.ts`, `src/systems/hub.ts`, `src/config/album.ts`, `src/config/hub.ts`, `src/content/hub.ts` | |
| Ảnh hẹn giờ | `src/config/photo.ts`, `game.ts`, `cameraManager.ts` (khóa/trả camera) | |
| Thế giới / bản đồ | `src/world/{types,parse,world,collision,travel,validate}.ts`, `maps/map_thcs.world.json`, `maps/map_thcs.index.json` (sinh tự động) | 6 khu, 1 bản đồ liền |
| Player / camera / input | `src/actors/player/controller.ts`, `src/actors/camera/cameraManager.ts`, `src/game/input.ts`, `src/game/gestures.ts`, `src/config/camera.ts` | Camera chỉ "Chuẩn"; A/B và Nhìn tự do còn code nhưng tắt (`CAMERA_OPTIONS`, `?camtest=1`) |
| Analytics | `src/analytics/{bridge,tracker,heartbeat}.ts`, `shared/events.ts`, `api/collect.ts`, `api/_lib/*`, `firestore.rules` | Bản production để trống danh sách (`src/content/release.ts`) |
| Phong cách hình ảnh | `src/render/style.ts` (`toon_outline`, `soft_pbr`) | D-S2-04 chưa khóa |
| Pipeline Blender | `tools/blender/world/{pipeline_config,htx_world,export_world,gen_map_thcs,new_zone}.py`, `tests/test_pipeline.py` | Quy ước hai phía Python ↔ `src/world/types.ts`, có test `conventions.test.ts` |
| Công cụ test trong game | `src/lab/gameTools.ts` (`window.__game`, `?play=1`, `?day=&step=`, `?bot=release`, `?cast=`), `inputDiagnostics.ts` (`?inputdebug=1`) | Không được lọt vào bản production |

## 4. Ranh giới với `feature/asset-workshop`
- Antigravity sở hữu: `tools/asset-workshop/`, `blender/` (398 file `character_prototype`, scenes, previews), `assets/` (`characters/*.glb`, `props/*.glb`, `asset_manifest.json`), `public/assets/{characters,props}/`, `tools/reference/`. **S2 không có các thư mục này.**
- Hai nhánh cùng sửa/có các file: `src/actors/character/{animate,build,presets}.ts`, `src/render/{canvasTex,materials,merge,stage}.ts`, `src/lab/{characterSheet,labHooks,yardScene}.ts`, `src/world/school/{classBlock,props,yardCorner}.ts`, `src/ui/Hud.tsx`, `src/analytics/tracker.ts`, `src/main.ts`, `src/env.d.ts`, `src/styles.css`. Khả năng xung đột khi gộp: **chưa kiểm**.
- Chỉ có ở asset-workshop: `src/actors/character/CharacterRuntimeController.ts`, `src/lab/assetsPreviewScene.ts`, `src/world/school/propsGlb.ts`.
- Điểm nối dự kiến: `rigAvatar(rig, seed)` trong `src/actors/player/avatar.ts` (lớp bọc nhân vật; thay model không đụng controller). Nhân vật `vietnamese_student.glb` của Antigravity **chưa nối** vào S2 (ghi ở blueprint là việc riêng).
- Tài sản GLB: S2 dùng `public/assets/world/map_thcs/zone_*.glb`; asset-workshop dùng `public/assets/{characters,props}/`. Quy ước ID asset/đăng ký asset chung (`src/render/assets.ts`) cần đối chiếu — chưa đọc.
- Luật dự án: không sửa `tools/asset-workshop/`; không tạo lại Asset Workshop.
- Máy chủ dự án (Windows) đang đứng ở `feature/asset-workshop`, chưa có code F1–F10/S2 (theo handoff 14/11).

## 5. So sánh cấu trúc 3 nhánh còn lại
- `main`: khung đầu tiên (42 file): `src/{render,world,lab,actors,ui}`, `api/_lib`, 1 test e2e. Không có content/systems/core/game.
- `dev`: thêm toàn bộ F1–F10 (content, systems, core, game, analytics, config, 13 test unit, 2 e2e, `tools/blender/` 4 file). Chưa có hệ world nhiều khu (`src/world` chỉ 4 file).
- `feature/asset-workshop`: cùng gốc khung ban đầu, đi hướng khác: asset/nhân vật/Blender prototype; **không** chứa content/systems/core/game của `dev`.
- S2 = `dev` + hệ world (parse/collision/travel/maps), camera, input, pipeline Blender, 6 GLB, test world, tài liệu.

## 6. Tài liệu có sẵn (`docs/`)
| File | Dòng | Nội dung |
|---|---|---|
| `S2_EXECUTION_BLUEPRINT.md` | 309 | Kiến trúc 5 tầng, hợp đồng, 6 khu, bảng nghiệm thu §7 (**tài liệu chính**) |
| `DEV_SESSION_HANDOFF.md` | 61 | Trạng thái, mục "S2 — tiến độ" đọc trước |
| `S2_TEST_REPORT.md` | 203 | Số test thật theo chặng, HOTFIX touchpad |
| `PROMPT_FOR_OPUS.md`, `PROMPT_CHANG_2.md` | 125 / 109 | Lời nhắc từng chặng (2a/2b/2c) |
| `BLENDER_PIPELINE.md` | 240 | Quy trình .blend → .glb |
| `HOW_TO_EXPAND_WORLD.md` | 194 | Thêm khu thứ 7 |
| `CONTROLS_AND_TUTORIAL_NOTES.md` | 66 | Nút và câu hướng dẫn (chưa làm màn hướng dẫn) |
| `TOUCHPAD_CHECK_GUIDE.md` | 52 | Cách chủ dự án thử touchpad thật |
| `images/` | — | `s2_color_compare.jpg`... |
| `README.md` (gốc) | — | Lệnh chạy, công cụ test |
- **Không có** `00_DEV_README.md` trong repo (project instructions nhắc tới file này). Chưa có: `S2_WORLD_ARCHITECTURE.md`, `DECISIONS_AND_OPEN_QUESTIONS.md`, `ART_STYLE_CHANGE_GUIDE.md`, `AI_HANDOFF_START_HERE.md` (thuộc 2c/Chặng 3). `OPEN_DECISIONS_REGISTER_v1` không nằm trong repo.

## 7. Fable nên xem trước (theo thứ tự)
1. `docs/DEV_SESSION_HANDOFF.md` (mục "S2 — tiến độ"), `docs/S2_EXECUTION_BLUEPRINT.md` §2–§4, §7.
2. `src/game/game.ts` — điều phối, interact, save, analytics hook.
3. `src/systems/questEngine.ts`, `src/systems/gameFlow.ts`, `src/core/save.ts`.
4. `src/game/scenes/dayScene.ts`, `src/world/world.ts`, `src/world/dayBindings.ts`, `src/world/collision.ts`.
5. `src/game/input.ts`, `src/game/gestures.ts`, `src/actors/camera/cameraManager.ts`, `src/config/camera.ts`.
6. `src/analytics/bridge.ts`, `shared/events.ts`, `api/_lib/collect.ts`, `firestore.rules` (quyền riêng tư: không tên/email/IP, không tên Player).
7. `src/content/types.ts`, `src/content/release.ts`, `src/content/validate.ts` (cấu hình chưa chốt, placeholder).
8. `tools/blender/world/pipeline_config.py` ↔ `src/world/types.ts`; `tests/e2e/world.spec.ts`.
9. Kiểm lọt công cụ test vào production: `src/lab/*`, `src/main.ts`, `vite.config.ts`.

## 8. Chưa xác minh (trong phiên lập bản đồ này)
- Chưa chạy bất kỳ lệnh nào: `tsc`, vitest, Playwright, build, `validate:world`, test Blender. Mọi số test trong tài liệu repo là của phiên trước, không do phiên này kiểm lại.
- Chưa đọc nội dung chi tiết của hầu hết file nguồn; mapping ở §3 dựa trên tên file, `export` và grep.
- Chưa xác nhận có hệ "timeline" nào ngoài chỗ giữ phím C.
- Chưa thử touchpad thật, điện thoại thật, trình duyệt Edge/Cốc Cốc; chưa đo FPS trên GPU thật.
- Chưa chạy `blender.exe` trên Windows (mới chạy bằng gói `bpy` trên Linux).
- Chưa kiểm event mới trên Firestore thật (chỉ Emulator); chưa kiểm Vercel preview (cần đăng nhập).
- Chưa đối chiếu xung đột gộp với `feature/asset-workshop` ở các file chung (§4).
- Chưa kiểm hai nhánh `dev`/`main`/asset-workshop ngoài danh sách file (clone nông, depth 1).
- Giá trị D-S2-02/03/04, D-01, D-03, D-04, D-12, D-13, D-19, D-20 còn mở; đang là giá trị tạm trong `src/config/` và `src/content/`.
- Test `world.spec.ts` có thể còn ca `fixme`/thiếu (ca 1–3, 6–10 theo handoff): chưa đếm.
