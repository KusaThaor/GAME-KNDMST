# Phiếu sửa 24/11/2026 (Integrator)

Nền: `feat/sprint-0412` sau khi gộp N-05 (#5, `8257863`). Chỉ có **một** phiếu: N-01 (#8). Sau khi N-01 báo "Đã sửa", Integrator mới chạy quy trình 4 bước đầy đủ, rồi xem tiếp #9 (N-06), #11 (N-08), #17 (K2).

## Phiếu N-01 — PR #8
```
Bạn là agent đã làm N-01 (PR #8, nhánh task/N-01-sua-moc1) cho repo KusaThaor/GAME-KNDMST. Integrator YÊU CẦU SỬA — đọc bình luận MỚI NHẤT của Integrator trên PR #8 (ngày 24/11, "Phiếu gửi lại N-01") và làm đúng 3 việc:

1. Cập nhật nhánh: git fetch origin && git merge origin/feat/sprint-0412 (KHÔNG rebase, KHÔNG push --force). Chỉ xung đột ở src/content/types.ts (2 dòng photo/minigame của kiểu Step) → giữ đủ cả hai bên: photo giữ `shots?: number`; minigame = { kind:'minigame'; game:string; level?:'min'; opponent?:string; lines?:DialogueLine[] }.
2. src/content/days/d_g07_03.ts: weather_by_step đổi thành { 'q_m1_main_05.s06': 'rain_shower', 'q_m1_main_05.s07': 'after_rain_rainbow' }, giữ map_variant 'g07_end'. Kiểm at_step_id của ảnh nhóm (s05) và ảnh cầu vồng (s07) trong Album cho khớp.
3. tests/e2e/world.spec.ts ca 8 + bot e2e Trang 1–4: sửa theo bước mới (ảnh hẹn giờ là s05, cầu vồng s07). Chạy npx playwright test --workers=1 đầy đủ (mốc nền hiện tại: 38 đạt / 1 bỏ qua).

Lưu ý: "mục 5.0, mục 6.3, bảng 8 ca e2e đỏ" KHÔNG tồn tại ở nhánh nào — đừng chờ chúng. Không tự thêm thoại; thoại Trang 2 giữ như b829023 (nguyên văn kịch bản dòng 182–211).
Chỉ sửa file đã có trong PR + tests/e2e (phần Trang 1–4). Chạy 4 lệnh: npx tsc --noEmit · npm test (mốc nền 412 đạt / 2 bỏ qua) · npm run validate:world · VERCEL_ENV=production npm run build, cộng e2e đủ. Dán kết quả THẬT vào PR (lệnh nào chưa chạy ghi "chưa chạy"), commit kết bằng [N-01], rồi bình luận "Đã sửa".
```

## Phiếu N-01 lần 3 — PR #8 (chủ dự án chốt 24/11 chiều)
```
Bạn là agent đã làm N-01 (PR #8, nhánh task/N-01-sua-moc1). Đọc bình luận MỚI NHẤT của Integrator trên PR #8 (24/11, "thoại bước minigame hiện SAU khi chơi xong") và làm đúng:
1. src/game/game.ts, nhánh minigame trong presentStep — CHỈ chỗ này: mở trò → chơi xong (thắng/thua/Bỏ qua) → phát s.lines → complete bước. Đổi dòng "phát thoại trước trò" của lần 2 thành "sau trò".
2. tests/e2e/game.spec.ts: ca thoại minigame kiểm thứ tự (Bỏ qua trước, thoại sau).
3. Liệt kê vào PR những câu vốn là lời TRƯỚC khi chơi mà giờ nằm sau trò nghe sai mạch — không tự sửa chữ.
4. Merge origin/feat/sprint-0412 (không rebase/force), chạy 4 lệnh + npx playwright test --workers=1 (mục tiêu 45 đạt / 0 đỏ / 1 bỏ qua), dán kết quả thật; KHÔNG commit index.html, src/main.ts. Bình luận "Đã sửa lần 3".
```
