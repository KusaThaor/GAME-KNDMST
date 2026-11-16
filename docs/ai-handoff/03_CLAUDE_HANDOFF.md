# 03_CLAUDE_HANDOFF — bàn giao cho Claude

Lập 16/11/2026, audit cuối của Fable trên `feature/s2-world-camera-blender` @ `b69058e`.
Đọc theo thứ tự: file này → `04_NEXT_TASK_FOR_CLAUDE.md` → `02_QUEST_SYSTEM.md` → (khi cần) `01_PROJECT_AUDIT.md`, `00_REPO_MAP.md`.
ID phát hiện `A-xx` dùng thống nhất trong cả 4 file.

## 1. Kiến trúc hiện tại (một đoạn)
Web game Vite + TypeScript + Three.js + Preact. Nội dung là dữ liệu (`src/content/`), engine thuần logic (`src/systems/`), cảnh 3D và input tách riêng (`src/game/`, `src/world/`, `src/actors/`), nối với nhau bằng **event bus** (`src/core/eventBus.ts`). Một file điều phối duy nhất: `src/game/game.ts`.

```
content/*.ts ──indexContent──► ContentIndex ──► QuestEngine ◄─ trigger/complete ─ game.ts ◄─ input.ts
                                   │                │ emit                          │
                                   ▼                ▼                               ▼
                              HubModel, AlbumModel, ReleaseTracker ◄── EventBus ──► analytics/bridge, autosave
game.ts ─► hubScene (phòng 2026, góc cố định) | dayScene (World + PlayerController + CameraManager + ZoneTracker)
```
Luồng cảnh (`src/systems/gameFlow.ts`): `boot → hub_intro → hub_idle → to_day → memory_day → day_end → to_hub → hub_idle`.

## 2. Đường dẫn và phụ thuộc quan trọng
| Việc | File |
|---|---|
| Điều phối, trình diễn bước, tương tác, chuyển cảnh | `src/game/game.ts` (`runGame`, `presentStep`, `drain`, `proximity`, `interact`, `goHub`, `goDay`) |
| Quest engine | `src/systems/questEngine.ts` (`QuestEngine.trigger/complete/startDay/resume/endDay`) |
| Kiểu dữ liệu nội dung | `src/content/types.ts` (`Quest`, `Step`, `MemoryDay`, `Artifact`, `AlbumEntry`, `PresentDayEvent`) |
| Gói nội dung, bản phát hành, chương, bảng vai | `src/content/pack.ts`, `release.ts`, `chapters.ts`, `cast.ts`, `base.ts`, `hub.ts`, `days/*.ts` |
| Kiểm nội dung | `src/content/validate.ts` (chạy trong `npm test` và lúc mở game) |
| Lưu/nạp | `src/core/save.ts` (`SaveStore`, `reconcileSave`, `attachAutosave`), ảnh: `src/core/photoStoreIdb.ts` |
| Hub, PDE, Album | `src/systems/hub.ts`, `src/systems/album.ts` |
| Nối nội dung ↔ bản đồ | `src/world/dayBindings.ts` (ID → marker), `src/world/maps/map_thcs.world.json` |
| Cảnh Ngày | `src/game/scenes/dayScene.ts` |
| Nhân vật | `src/actors/character/build.ts` (dựng bằng code), `src/actors/player/avatar.ts` (`rigAvatar`) |
| Input/camera | `src/game/input.ts`, `src/game/gestures.ts`, `src/actors/camera/cameraManager.ts`, `src/config/camera.ts` |
| Công cụ test | `src/lab/gameTools.ts` (`window.__game`, `?day=&step=`, `?bot=release`) |

Phụ thuộc: three 0.187, preact 11, gsap, three.quarks, tweakpane (chỉ bản test), firebase-admin (chỉ `api/`), vitest 5, Playwright 1.63, Node 22. Không có physics engine, không có state library.

## 3. Hệ thống đang chạy
Mốc Fable tự chạy 16/11 (Linux, không GPU): `tsc` đạt · vitest **253 đạt, 1 bỏ qua** · `validate:world` 0 lỗi. **Không chạy lại** Playwright và build production (số của phiên trước: 28 đạt, 1 bỏ qua; build sạch — xem `docs/S2_TEST_REPORT.md`).

| Hệ thống | Trạng thái | Ghi chú |
|---|---|---|
| Quest engine Main/Side/Daily/Event/PD | WORKING | 27 test đơn vị; bẫy A-02, A-05 |
| Thoại, lựa chọn 3 sắc thái, callback theo flag | WORKING | `{player_name}`, `{g:nam\|nữ}` |
| Lưu/nạp, tự lưu ở ranh giới bước, chơi lại Ngày | WORKING | A-09 |
| Hub 2026: Hộp Kỷ Vật, kệ, điện thoại, PDE | WORKING | tuyến tính theo `release.ts` (A-11) |
| Album, ảnh hẹn giờ, ảnh tự chụp | WORKING | |
| Bản đồ 6 khu, va chạm, đổi khu | WORKING | thiếu ca e2e 1–3, 6–10 (A-04) |
| Camera "Chuẩn", chuột/touchpad/cảm ứng | PARTIAL | mới kiểm bằng mô phỏng (A-14) |
| Tương tác E / đi tới đích | PARTIAL | A-01 |
| Chuyển cảnh ký ức | PARTIAL | chỉ mờ dần + âm thanh (A-13) |
| Minigame, cuộn phim (C), gợi ý `hint`, đếm `collect` | MISSING | A-07 |
| Mốc 2–3 (biến thể, tuổi, bản đồ THPT) | MISSING | A-08 |
| Nhân vật GLB của Antigravity | MISSING | A-10 |
| Nội dung thật, bản production | MISSING | A-03 (chờ nhóm) |

## 4. Vấn đề chưa xử lý (tóm tắt; chi tiết ở `01_PROJECT_AUDIT.md`)
- **P1:** A-01 `goto` không xong khi đứng sẵn trong đích · A-02 Side/Daily mở đầu bằng bước "tự hiện" không bao giờ bắt đầu · A-03 chưa có nội dung thật, production trống · A-04 S2 chưa gộp `dev`, thiếu ca e2e.
- **P2:** A-05, A-06, A-07, A-08, A-09, A-10, A-11, A-13, A-15.
- **P3:** A-12 tài liệu lệch code.
- **Chưa xác minh:** A-14.

## 5. Thứ tự phát triển
1. **T-01** (xem file 04): sửa A-01, chặn A-02. ← làm ngay
2. **T-02** phiên 2c của S2 theo `docs/PROMPT_CHANG_2.md`: ca e2e 1–3, 6–10; `docs/S2_WORLD_ARCHITECTURE.md`, `docs/DECISIONS_AND_OPEN_QUESTIONS.md` (A-04, A-12).
3. Xin chủ dự án duyệt gộp `feature/s2-world-camera-blender` → `dev` (mở Pull Request, **không tự gộp**).
4. **T-03** sửa A-05 (điều kiện theo Daily) + hiện `hint` và số đếm `collect` (A-07, phần nhỏ).
5. Khi nhóm giao nội dung đã duyệt: viết Ngày/quest theo `02_QUEST_SYSTEM.md` §5. Trước đó chỉ dùng `[PLACEHOLDER]`.
6. Theo nhu cầu nội dung: A-06 (NPC theo bước), A-08 (lớp 8–9: thêm biến thể; lớp 10–12: bản đồ mới), A-10 (nối nhân vật GLB qua `rigAvatar`), A-13 (hiệu ứng chuyển cảnh qua `registerTransitionFx`).
7. Trước kỳ đo 05–15/12: A-03 (D-03 + nội dung `HUMAN_CANON`), A-09 (chuyển đổi bản lưu nếu tăng `SAVE_VERSION`), A-14 (thử máy thật).

## 6. Cách kiểm
```
npm ci
npx tsc --noEmit
npm test                                  # vitest; mốc 16/11: 253 đạt, 1 bỏ qua (test Firestore cần Emulator)
npm run validate:world                    # nội dung ↔ marker bản đồ
npm run test:e2e                          # Playwright, Chrome; ~17 phút
VERCEL_ENV=production npm run build       # rồi tìm botStep|__game|gameTools trong dist/assets/*.js — phải không có
npm run dev                               # /?play=1 · /?play=1&day=<id>&step=<step id> · /?play=1&bot=release
```
Firestore Emulator: `docs/DEV_SESSION_HANDOFF.md` mục "Lưu ý". Pipeline Blender: `docs/BLENDER_PIPELINE.md`.
Chrome headless vẽ bằng CPU: không dùng để đo FPS.

## 7. Luật không được phá
- Không viết cốt truyện/thoại thật; nội dung giả ghi `[PLACEHOLDER]` + `ownership_label: 'AI_PROPOSED'`.
- Không tự chốt quyết định D-xx; giá trị tạm nằm trong `src/config/` và `src/content/`.
- Nội dung chỉ tham chiếu ID ổn định (`zone.*`, `itr.*`, `spot.*`, `cam.*`, `spawn.*`), không tọa độ, không tên mesh.
- Không đụng `main`; không tự gộp `dev`; không force push; không sửa `tools/asset-workshop/`, 6 file `.blend`, `gen_map_thcs.py`.
- Analytics: không gửi tên Player, nội dung tin nhắn, kiểu camera; `public_demo_completed` phải đứng trước form.
- Sửa lỗi thì viết test tái hiện trước. Không báo "đạt" cho thứ chưa chạy.
- Cuối phiên: cập nhật `docs/DEV_SESSION_HANDOFF.md`.

## 8. Trạng thái Git lúc bàn giao
`docs/ai-handoff/` (5 file) **chưa commit, chưa push** — chờ chủ dự án cho phép. Bản clone trong phiên audit là clone nông; phiên mới nên `git fetch` lại.
