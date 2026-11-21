# WORKSPACE — Hành Trình Thanh Xuân

Cập nhật 21/11/2026. Hạn bản playtest: 04/12/2026.

## Nguồn chân lý (Single Source of Truth)
Thiết kế game chỉ lấy từ bộ **GDD v1.0 APPROVED** (duyệt 20/11/2026) trong `docs/gdd/`:

| File | Nội dung |
|---|---|
| `docs/gdd/00_MASTER_GDD.md` | Tầm nhìn, vòng chơi, cấu trúc Mốc/Trang, art direction, bản đồ |
| `docs/gdd/01_NARRATIVE_AND_SCENES.md` | Nhân vật, kịch bản từng cảnh, vật phẩm cốt truyện |
| `docs/gdd/02_GAMEPLAY_AND_MECHANICS.md` | Minigame, Khu Vui Chơi Căn cứ, lưu trữ, số liệu đo |
| `docs/gdd/03_ASSETS_AND_AUDIO.md` | Kiểm kê asset 3D, giao diện 2D, âm thanh |
| `docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md` | Thoại nguyên văn (kịch bản v1.4). Khi thoại khác file 01, file này thắng |
| `docs/gdd/00_README_2.md`, `SESSION_HANDOFF_2.md` | Ngữ cảnh Project và bàn giao phiên (20/11) |

`GDD.md` v0.3 và `GDD_MASTER_v1_DRAFT` đã **SUPERSEDED**; chúng chỉ nằm trong Claude Project, không dùng để dựng game.
Khi code và GDD lệch nhau: GDD v1.0 thắng, trừ khi chủ dự án đổi GDD.

## Bản đồ nhánh Git (ảnh chụp 21/11/2026)
Tất cả nhánh đều tách từ `main` = `4adf991`; chưa nhánh nào được gộp về `main`.

| Nhánh | Vai trò | Ghi chú |
|---|---|---|
| `main` | Nhánh chính, Vercel Production | Chỉ có scaffold + README |
| `dev` | Vercel Preview; khung F0–F10 (save v2, quest, album, analytics, bot test) | `origin/dev` hơn `main` 13 commit; nằm trọn trong nhánh s2 |
| `feature/s2-world-camera-blender` | Nhánh code chính: dev + bản đồ, camera, điều khiển, actors, quy trình Blender | Hơn `main` 41 commit; nền cho playtest 04/12 |
| `feature/asset-workshop` | Xưởng asset: nhà máy nhân vật, đồng phục, khăn quàng, bàn ghế, props (GLB/BLEND/PNG) | Hơn `main` 8 commit trên remote; chưa gộp với dev/s2 |
| `docs/sync-approved-gdd-v1` | Đồng bộ GDD v1.0, WORKSPACE.md, báo cáo kiểm toán | Nhánh tài liệu |

Ghi chú: ở máy Windows, checkout `GAME/GAME-KNDMST` đang ở `feature/asset-workshop` với nhiều thay đổi chưa commit; không checkout/ghi đè khi chưa kiểm tra. Làm việc nhánh khác bằng `git worktree`.

## Quy tắc
- Không `push --force`; không ghi đè nhánh chính.
- Mọi tài liệu thiết kế mới đặt trong `docs/gdd/`; bản cũ chuyển vào `docs/archive/`.
- Việc đang chạy và kế hoạch sprint: `docs/AUDIT_AND_ROADMAP.md`.
