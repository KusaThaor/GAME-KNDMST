# Mở Antigravity để số hóa kịch bản Trang 1–4 (làm theo thứ tự)

Dành cho chủ dự án. Mỗi bước ngắn, không cần hiểu code.

## Bước 1 · Lấy bản mới nhất từ git
Mở terminal trong Antigravity, chạy từng dòng. Dùng **thư mục riêng**, không đụng thư mục Asset Workshop đang làm dở:
```bash
git clone https://github.com/KusaThaor/GAME-KNDMST.git GAME-KNDMST-noidung
cd GAME-KNDMST-noidung
git checkout feat/sprint-0412
git pull
git checkout -b content/m1-so-hoa
npm install
```
(Nếu đã có thư mục `GAME-KNDMST-noidung` thì chỉ cần `cd` vào, `git checkout feat/sprint-0412`, `git pull`, rồi tạo nhánh mới như trên.)

## Bước 2 · Mở thư mục đó trong Antigravity
Mở đúng thư mục `GAME-KNDMST-noidung` làm workspace.

## Bước 3 · Dán lời nhắc này vào khung chat của Gemini
```
Đọc docs/handoff/gemini/GEMINI_RULES.md rồi làm đúng docs/handoff/gemini/PROMPT_T06_SO_HOA.md.
Làm lần lượt Trang 1, 2, 3, 4. Chỗ nào kịch bản chưa rõ thì dừng lại hỏi tôi, đừng tự bịa.
```

## Bước 4 · Trả lời câu hỏi của Gemini
- Gemini sẽ hỏi bạn từng cụm câu hỏi (mỗi cụm tối đa 5 câu). Trả lời ngắn: "A", "B", hoặc tự viết.
- Câu nào bạn chưa chắc, trả lời **"để sau"**. Gemini sẽ để chỗ đó là `[PLACEHOLDER]` và không cho lên bản chính thức.
- Mọi câu hỏi và câu trả lời được ghi vào `docs/handoff/gemini/QUESTIONS_LOG.md` để phiên sau không hỏi lại.

## Bước 5 · Duyệt cuối (bạn là người chốt)
Gemini sẽ nộp một **bảng đối chiếu** (câu nào trong kịch bản → bước nào trong game) và danh sách chỗ nó tự viết thêm. Bạn đọc danh sách đó:
- Đồng ý → nói "duyệt Trang X". Gemini bỏ nhãn nháp cho Trang đó.
- Không đồng ý → nói sửa gì, Gemini sửa.

## Bước 6 · Lưu lên git
Khi xong mỗi Trang, bảo Gemini: "commit và push nhánh `content/m1-so-hoa`". **Không** gộp vào `main`, không gộp vào nhánh khác. Báo lại phiên Claude Code để kiểm bằng máy (`tsc`, `npm test`) trước khi gộp.

## Lưu ý
- Hạn: hết 28/11. Làm Trang 1 và Trang 4 trước vì game đã có khung cho hai Trang này.
- Nếu Gemini làm xong mà bộ kiểm tra báo lỗi, đó là việc của phiên Claude Code sửa, bạn không cần xử lý.
