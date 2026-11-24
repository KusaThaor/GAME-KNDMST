# 04_NEXT_TASK_FOR_CLAUDE — một việc ưu tiên cao nhất

Lập 16/11/2026 (audit cuối của Fable). ID phát hiện (A-xx) định nghĩa ở `01_PROJECT_AUDIT.md`.

## T-01 — Lưới an toàn cho việc viết quest (sửa A-01, chặn A-02)

**Vì sao làm trước:** hai lỗi này không lộ ra với nội dung giả hiện tại, nhưng sẽ lộ ngay khi nhóm viết quest thật: người chơi đứng sẵn ở đích mà bước `goto` không xong (A-01), và quest Side/Daily "biến mất" không báo lỗi (A-02). Sửa nhỏ, không đổi kiến trúc.

### Nhánh
Làm tiếp trên `feature/s2-world-camera-blender` (HEAD lúc audit: `b69058e`). Không đụng `dev`, `main`, `feature/asset-workshop`.

### File liên quan
| File | Việc |
|---|---|
| `src/game/game.ts` — chỉ hàm `proximity()` (dòng ~457–468) và biến `inside` (dòng 111, 128) | Sửa A-01 |
| `src/content/validate.ts` — khối kiểm quest (dòng ~129–167) | Thêm luật cho A-02 |
| `tests/unit/validate.test.ts` | Test đỏ trước cho luật mới |
| `tests/e2e/game.spec.ts` (hoặc `world.spec.ts`) | 1 ca tái hiện A-01 |
| `README.md` mục "Thêm một Ngày ký ức mới", `docs/ai-handoff/02_QUEST_SYSTEM.md` §6 | Ghi luật mới, bỏ dòng cảnh báo đã hết hiệu lực |

Không sửa: `src/systems/questEngine.ts` (engine đúng theo thiết kế), `src/world/*`, `src/actors/*`, nội dung trong `src/content/days/`.

### Phụ thuộc
- `engine.peek('arrive', id)` và `engine.trigger('arrive', id)` đã có (`questEngine.ts` dòng 188–212).
- Công cụ test `window.__game` (`state()`, `teleport()`, `toSpawn()`): xem đầu file `src/lab/gameTools.ts` để lấy đúng tên hàm trước khi viết ca e2e.
- Hàm dựng gói nội dung cho test: xem `tests/unit/fixtures/` và cách `tests/unit/validate.test.ts` đang làm.

### Hành vi mong muốn
**Phần 1 (A-01).** Một bước `goto` đang chờ (hoặc bước đầu `goto` của Side/Daily đang `available`) phải hoàn thành khi người chơi **đang đứng trong bán kính đích và giao diện không khóa**, kể cả khi:
- người chơi đã đứng trong bán kính từ trước lúc bước được kích hoạt;
- người chơi vào bán kính lúc giao diện đang khóa (thoại, bảng, thông báo), rồi giao diện mở lại.

Không được phải đi ra rồi quay vào. Gợi ý cách làm (tự quyết sau khi đọc code): trong `proximity()`, với mỗi đích đang ở gần, khi `!locked()` thì hỏi `engine.peek('arrive', t.id)` rồi mới `trigger`; khi đó có thể bỏ hẳn tập `inside`.

**Phần 2 (A-02).** `validateContent` báo **lỗi** (mã đề nghị: `optional_quest_unstartable`) khi quest `side` hoặc `daily` có bước đầu không thuộc `talk | interact | goto | collect | place`. Lý do: engine chỉ bắt đầu Side/Daily qua `trigger()` ở bước đầu.

### Tiêu chí nghiệm thu
1. Có test đỏ **trước khi sửa** cho cả hai phần (ghi lại kết quả đỏ trong mô tả commit hoặc báo cáo).
2. Ca e2e A-01 đạt. Cách tái hiện đề nghị: vào `d.g07.03` → mở Menu (Esc) → `__game.teleport` tới `itr.thcs.gutter` → đóng Menu → Side `q_m1_side_02` chuyển sang bước `.s02` mà không cần di chuyển.
3. Test đơn vị A-02 đạt: gói nội dung có Side mở đầu bằng `cutscene` → có lỗi mới; gói nội dung hiện tại → 0 lỗi.
4. Không lùi: `tsc` đạt; vitest không giảm số test đạt so với mốc chạy đầu phiên; `validate:world` 0 lỗi; Playwright không giảm; build production sạch công cụ test.
5. Một bước `goto` không bị hoàn thành hai lần; đứng yên trong bán kính không phát lặp event `step_completed`.
6. Cập nhật `README.md` và `02_QUEST_SYSTEM.md` §6; cập nhật mục "S2 — tiến độ" trong `docs/DEV_SESSION_HANDOFF.md`.

### Lệnh kiểm
```
npx tsc --noEmit
npm test
npm run validate:world
npm run test:e2e                         # lâu (~17 phút theo phiên trước); có thể chạy riêng file đang sửa trước
VERCEL_ENV=production npm run build      # rồi tìm botStep|__game|gameTools trong dist/assets/*.js — phải không có
```

### Giới hạn
- Không viết thoại/cốt truyện thật; nội dung thử ghi `[PLACEHOLDER]`.
- Không đổi schema `Quest`/`Step`, không thêm thư viện, không thêm event analytics.
- Không refactor ngoài `proximity()`. Không sửa test cũ để hợp thức hóa hành vi.
- Commit nhỏ sau mỗi phần có test đạt. Không gộp vào `dev`/`main`. Không force push.
- Không báo "đạt" cho thứ chưa chạy.

### Sau T-01 (không làm trong việc này)
Xem thứ tự ở `03_CLAUDE_HANDOFF.md` §5: T-02 = phiên 2c của S2 (A-04), rồi xin chủ dự án duyệt gộp `dev`.
