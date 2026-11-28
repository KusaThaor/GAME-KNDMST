import { useState, useEffect } from 'preact/hooks';
import { Pop } from '../overlays/NoticeModal';
import type { UiActions, UiState } from '../store';

export interface FinancialSpread {
  left: {
    dept: string;
    docNo: string;
    title: string;
    subtitle: string;
    tables: {
      headers: string[];
      rows: (string | number)[][];
    }[];
    notes: string[];
    stamp?: string;
  };
  right: {
    dept: string;
    docNo: string;
    title: string;
    subtitle: string;
    tables?: {
      headers: string[];
      rows: (string | number)[][];
    }[];
    paragraphs?: string[];
    stickNote?: string;
    hasPoemSlip?: boolean;
    signOff?: {
      role: string;
      signer: string;
      status: string;
    };
  };
}

export const FINANCIAL_SPREADS: FinancialSpread[] = [
  {
    left: {
      dept: 'PHÒNG KẾ TOÁN & TÀI CHÍNH',
      docNo: 'REF: TC-2026/Q3-FINAL',
      title: 'BÁO CÁO KẾT QUẢ KINH DOANH Q3/2026',
      subtitle: 'Đơn vị tính: VNĐ (Đã kiểm toán nội bộ)',
      tables: [
        {
          headers: ['Chỉ tiêu tài chính', 'Kế hoạch', 'Thực tế', 'Tỷ lệ'],
          rows: [
            ['Doanh thu thuần', '1.500.000.000', '1.240.000.000', '82.6% ⚠️'],
            ['Giá vốn bán hàng (COGS)', '720.000.000', '810.000.000', '112.5%'],
            ['Chi phí vận hành (OPEX)', '450.000.000', '520.000.000', '115.5%'],
            ['Chi phí nhân sự & OT đêm', '180.000.000', '245.000.000', '136.1% 📈'],
            ['Lợi nhuận gộp sau thuế', '150.000.000', '65.000.000', '43.3% ❌'],
          ],
        },
      ],
      notes: [
        '⚠️ Lời phê bút đỏ: "Lợi nhuận gộp giảm sút nghiêm trọng. Yêu cầu toàn bộ các bộ phận rà soát và cắt giảm ngay 20% chi phí không thiết yếu!"',
        '📌 Đã họp khẩn với Ban Giám Đốc sáng thứ Hai tuần trước.',
      ],
      stamp: 'CÔNG TY CP GIẢI PHÁP SỐ\n[ĐÃ DUYỆT BỘ SỐ]',
    },
    right: {
      dept: 'KHỐI VẬN HÀNH & KỸ THUẬT',
      docNo: 'REF: OP-2026/Q4-BUDGET',
      title: 'DỰ TOÁN NGÂN SÁCH HOẠT ĐỘNG Q4/2026',
      subtitle: 'Áp dụng từ 01/10/2026 đến 31/12/2026',
      tables: [
        {
          headers: ['Khoản mục chi phí', 'Định mức tháng', 'Quý 4 (Dự toán)', 'Ghi chú'],
          rows: [
            ['Thuê hạ tầng máy chủ & Cloud AI', '45.000.000', '135.000.000', 'Cố định'],
            ['Thuê văn phòng & điện nước', '62.000.000', '186.000.000', 'Hợp đồng 2 năm'],
            ['Trà cà phê & văn phòng phẩm', '8.500.000', '15.000.000', 'Đề xuất cắt 30%'],
            ['Quỹ dự phòng rủi ro biến động', '25.000.000', '75.000.000', 'Giữ nguyên'],
          ],
        },
      ],
      stickNote: '📝 Memo sếp dán: "Dự toán này vẫn cao quá! Ai phụ trách phần server thì đàm phán lại với bên cung cấp, hạn chót trước thứ Sáu này!"',
      signOff: {
        role: 'Trưởng phòng Tài chính - Kế toán',
        signer: 'Nguyễn Thanh Tùng',
        status: 'Đã ký điện tử 18:42 24/10/2026',
      },
    },
  },
  {
    left: {
      dept: 'BAN NHÂN SỰ & QUẢN TRỊ HIỆU SUẤT',
      docNo: 'REF: HR-KPI/2026-OCT',
      title: 'BẢNG THEO DÕI HIỆU SUẤT KPI THÁNG 10',
      subtitle: 'Đánh giá tiến độ hoàn thành mục tiêu quý',
      tables: [
        {
          headers: ['Mục tiêu (OKR)', 'Trọng số', 'Tiến độ', 'Tình trạng'],
          rows: [
            ['Tối ưu hóa hệ thống backend', '30%', '88%', 'Đạt'],
            ['Hoàn thiện báo cáo quý cho cổ đông', '25%', '65%', 'Chậm trễ ⏳'],
            ['Kiểm soát chi phí thuê ngoài', '25%', '90%', 'Tốt'],
            ['Chỉ số hài lòng khách hàng (CSAT)', '20%', '81%', 'Đạt'],
          ],
        },
      ],
      notes: [
        '💡 Ghi chú cá nhân: "Tháng này OT liên tục 18 buổi tối. Tiền phòng trọ năm 2026 lại tăng thêm 500k. Nhớ cái thời đi học vô lo vô nghĩ ghê..."',
      ],
    },
    right: {
      dept: 'HỒ SƠ LƯU TRỮ NỘI BỘ',
      docNo: 'TẬP KẸP GIẤY TỜ LINH TINH',
      title: 'PHỤ LỤC & GIẢI TRÌNH CÔNG NỢ',
      subtitle: 'Kẹp giữa tập tài liệu dày cộp...',
      paragraphs: [
        'Khoản công nợ khách hàng đối tác tồn đọng từ tháng 8 vẫn chưa thể tất toán do thủ tục đối soát hóa đơn điện tử.',
        'Kế toán trưởng yêu cầu liên hệ lại khách hàng để chốt biên bản nghiệm thu trước ngày 15 hàng tháng.',
      ],
      hasPoemSlip: true,
      stickNote: '📎 Ủa, trong kẹp hồ sơ tài chính này sao lại có một mảnh giấy học sinh màu ố vàng kẹp lọt thỏm ở giữa thế này?!',
    },
  },
  {
    left: {
      dept: 'BỘ PHẬN THU HỒI CÔNG NỢ',
      docNo: 'REF: CN-2026/EXP-LIST',
      title: 'DANH SÁCH CÔNG NỢ PHẢI THU ĐẾN HẠN',
      subtitle: 'Cập nhật thời gian thực ngày 28/11/2026',
      tables: [
        {
          headers: ['Khách hàng / Đối tác', 'Số tiền (VNĐ)', 'Hạn thanh toán', 'Trạng thái'],
          rows: [
            ['Công ty TNHH Truyền Thông M.', '125.000.000', '15/11/2026', 'Quá hạn 13 ngày'],
            ['Tập đoàn Công nghệ Alpha', '88.000.000', '30/11/2026', 'Chờ duyệt'],
            ['Studio Sáng Tạo Ánh Dương', '34.500.000', '25/11/2026', 'Đã hứa chuyển'],
            ['Tổng cộng', '247.500.000', '—', 'Đang đốc thúc'],
          ],
        },
      ],
      notes: [
        '📞 Đã gọi điện nhắc nợ lần 3. Đối tác hứa sẽ giải ngân sau khi chốt đợt nghiệm thu tuần tới.',
      ],
    },
    right: {
      dept: 'LỊCH LÀM VIỆC & DEADLINE CÁ NHÂN',
      docNo: 'SỔ TAY CÔNG TÁC 2026',
      title: 'KẾ HOẠCH NƯỚC RÚT CUỐI NĂM',
      subtitle: 'Người lớn đi làm: Không có nghỉ hè, chỉ có deadline...',
      paragraphs: [
        '• 08:30: Họp giao ban đầu ngày, giải trình số liệu chi phí tăng vọt.',
        '• 12:00: Ăn vội hộp cơm văn phòng 45k dưới sảnh tòa nhà.',
        '• 14:00: Rà soát lại từng hóa đơn chứng từ GTGT quý 3.',
        '• 18:30: Pha ly cà phê thứ 3 trong ngày, tiếp tục cày deadline báo cáo.',
        '• 21:00: Dắt xe ra khỏi hầm gửi xe, nhìn dòng người tấp nập giữa thành phố.',
      ],
      stickNote: '☕ Tự nhủ: "Cố lên, còn 1 tháng nữa là được nhận thưởng Tết rồi!"',
      signOff: {
        role: 'Nhân viên mẫn cán',
        signer: 'Tôi (năm 2026)',
        status: 'Trạng thái: Cần ngủ 8 tiếng...',
      },
    },
  },
];

export function BookModal({ s, a }: { s: UiState; a: UiActions }) {
  const pageIdx = s.bookPage ?? 0;
  const totalSpreads = FINANCIAL_SPREADS.length;
  const spread = FINANCIAL_SPREADS[pageIdx] ?? FINANCIAL_SPREADS[0];
  const [poemOpen, setPoemOpen] = useState(false);
  const [paperFallen, setPaperFallen] = useState(false);

  // Khi lật đến trang có kẹp thơ (Spread 1: Trang 3-4), kích hoạt hiệu ứng rớt giấy
  useEffect(() => {
    if (pageIdx === 1) {
      setPaperFallen(true);
    }
  }, [pageIdx]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (poemOpen) {
        if (e.key === 'Escape') setPoemOpen(false);
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'KeyA') a.turnBookPage(-1);
      else if (e.key === 'ArrowRight' || e.key === 'KeyD') a.turnBookPage(1);
      else if (e.key === 'Escape') a.closePanel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pageIdx, poemOpen, a]);

  return (
    <Pop class="g-panel g-book-modal g-corp-modal" testid="panel-book">
      {/* Header tập hồ sơ tài chính */}
      <header class="g-corp-header">
        <div class="g-corp-title-box">
          <span class="g-corp-folder-icon" aria-hidden="true">📁</span>
          <div>
            <h2>TẬP BÁO CÁO TÀI CHÍNH & KẾ HOẠCH NGÂN SÁCH Q4/2026</h2>
            <p class="g-corp-subtitle">Hồ sơ nội bộ lưu hành mật · Ban Điều Hành & Phòng Kế Toán</p>
          </div>
          <span class="g-corp-page-pill">
            Trang {pageIdx * 2 + 1} – {pageIdx * 2 + 2} / {totalSpreads * 2}
          </span>
        </div>
        <div class="g-row g-book-header-actions">
          <button data-act="close" class="g-corp-close-btn" onClick={a.closePanel}>
            Gấp hồ sơ lại <kbd>Esc</kbd>
          </button>
        </div>
      </header>

      {/* Thân tập hồ sơ 2 trang A4 */}
      <div class="g-corp-binder">
        <div class="g-corp-binder-rings" aria-hidden="true">
          <span class="ring" />
          <span class="ring" />
          <span class="ring" />
        </div>

        <div class="g-corp-spread">
          {/* Trang trái */}
          <article class="g-corp-page g-corp-page-left">
            <div class="g-corp-page-meta">
              <span class="dept">{spread.left.dept}</span>
              <span class="doc-no">{spread.left.docNo}</span>
            </div>
            <h3 class="g-corp-doc-title">{spread.left.title}</h3>
            <p class="g-corp-doc-sub">{spread.left.subtitle}</p>

            {spread.left.tables.map((t, idx) => (
              <table key={idx} class="g-corp-table">
                <thead>
                  <tr>
                    {t.headers.map((h, hi) => (
                      <th key={hi}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {t.rows.map((row, ri) => (
                    <tr key={ri} class={ri === t.rows.length - 1 ? 'total-row' : ''}>
                      {row.map((cell, ci) => (
                        <td key={ci} class={ci > 0 ? 'text-right' : ''}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}

            <div class="g-corp-notes">
              {spread.left.notes.map((note, ni) => (
                <p key={ni}>{note}</p>
              ))}
            </div>

            {spread.left.stamp && (
              <div class="g-corp-red-stamp" aria-hidden="true">
                {spread.left.stamp}
              </div>
            )}

            <div class="g-corp-page-footer-num">{pageIdx * 2 + 1}</div>
          </article>

          {/* Trang phải */}
          <article class="g-corp-page g-corp-page-right">
            <div class="g-corp-page-meta">
              <span class="dept">{spread.right.dept}</span>
              <span class="doc-no">{spread.right.docNo}</span>
            </div>
            <h3 class="g-corp-doc-title">{spread.right.title}</h3>
            <p class="g-corp-doc-sub">{spread.right.subtitle}</p>

            {spread.right.tables &&
              spread.right.tables.map((t, idx) => (
                <table key={idx} class="g-corp-table">
                  <thead>
                    <tr>
                      {t.headers.map((h, hi) => (
                        <th key={hi}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {t.rows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td key={ci} class={ci > 0 ? 'text-right' : ''}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ))}

            {spread.right.paragraphs && (
              <div class="g-corp-paragraphs">
                {spread.right.paragraphs.map((p, pi) => (
                  <p key={pi}>{p}</p>
                ))}
              </div>
            )}

            {spread.right.stickNote && (
              <div class="g-corp-stick-note">
                <span class="pin" aria-hidden="true">📌</span>
                <p>{spread.right.stickNote}</p>
              </div>
            )}

            {spread.right.signOff && (
              <div class="g-corp-signoff">
                <div class="role">{spread.right.signOff.role}</div>
                <div class="signer">{spread.right.signOff.signer}</div>
                <div class="status">{spread.right.signOff.status}</div>
              </div>
            )}

            {/* TỜ GIẤY THƠ CON CÓC RỚT RA TẠI TRANG NÀY */}
            {spread.right.hasPoemSlip && paperFallen && (
              <div
                class="g-dropped-poem-slip"
                onClick={() => setPoemOpen(true)}
                title="Bấm vào để mở tờ giấy thơ con cóc hồi tiểu học"
              >
                <div class="g-dropped-pin">📎</div>
                <div class="g-dropped-tag">MẢNH GIẤY CŨ RỚT RA</div>
                <div class="g-dropped-title">BÀI THƠ: CON CÓC TRONG MƯA 🐸</div>
                <div class="g-dropped-snippet">
                  "Con cóc ngồi bờ ao, trời mưa rơi rào rào..."
                </div>
                <div class="g-dropped-cta">👉 Bấm để cầm lên xem bài thơ học trò</div>
              </div>
            )}

            <div class="g-corp-page-footer-num">{pageIdx * 2 + 2}</div>
          </article>
        </div>
      </div>

      {/* Footer điều hướng lật trang */}
      <footer class="g-corp-footer">
        <button
          class="g-corp-btn"
          data-act="prev-page"
          disabled={pageIdx === 0}
          onClick={() => a.turnBookPage(-1)}
          title="Trang trước (← hoặc A)"
        >
          ◄ Lật trang trước <kbd>A</kbd>
        </button>

        <span class="g-corp-footer-hint">
          {pageIdx === 1 ? '👀 Ủa? Có một mảnh giấy học sinh cũ kẹp rơi ra kìa!' : 'Dùng phím ← / → hoặc A / D để lật các trang báo cáo'}
        </span>

        <button
          class="g-corp-btn"
          data-act="next-page"
          disabled={pageIdx >= totalSpreads - 1}
          onClick={() => a.turnBookPage(1)}
          title="Trang sau (→ hoặc D)"
        >
          Lật trang sau ► <kbd>D</kbd>
        </button>
      </footer>

      {/* POPUP XEM CẬN CẢNH: TỜ GIẤY THƠ CON CÓC HỒI TIỂU HỌC */}
      {poemOpen && (
        <div class="g-poem-overlay" onClick={() => setPoemOpen(false)}>
          <div
            class="g-poem-paper"
            onClick={(e) => e.stopPropagation()}
            data-testid="childhood-poem-modal"
          >
            <button
              type="button"
              class="g-poem-close"
              aria-label="Cất lại mảnh giấy"
              onClick={() => setPoemOpen(false)}
            >
              ✕ Nhét lại vào hồ sơ <kbd>Esc</kbd>
            </button>

            <header class="g-poem-header">
              <div class="g-poem-meta-left">
                <span class="school">Trường Tiểu Học Kim Đồng</span>
                <span class="class">Lớp 4A — Tổ 2</span>
                <span class="subject">Môn: Tập Làm Văn (Làm thơ tự do)</span>
              </div>
              <div class="g-poem-score-box">
                <span class="score-label">Điểm</span>
                <span class="score-num">4/10</span>
                <span class="score-note">Lời cô phê mực đỏ: "Thơ ngang như cua bò, không vần điệu gì hết! Về chép phạt 3 lần."</span>
              </div>
            </header>

            <div class="g-poem-lines-grid">
              <h3 class="g-poem-title">BÀI THƠ: CON CÓC TRONG MƯA</h3>

              <div class="g-poem-stanzas">
                <p>
                  Con cóc ngồi bờ ao,<br />
                  Trời mưa rơi rào rào.<br />
                  Cóc ta nhảy tũm xuống,<br />
                  Ướt cái đầu trọc lóc!
                </p>

                <p>
                  Chuồn chuồn bay thấp thì mưa,<br />
                  Bay cao thì nắng, bay vừa thì râm.<br />
                  Hôm nay kiểm tra một tiết,<br />
                  Toán được có ba phân!
                </p>

                <p>
                  Bị mẹ đánh ba roi,<br />
                  Con cóc cười ha ha!<br />
                  Thầy giáo bảo: "Thơ gì kì cục kẹo!"<br />
                  Cho bốn điểm về chỗ!
                </p>
              </div>

              <div class="g-poem-doodle">
                <pre class="ascii-frog">
{`   (o _ o)   <- Con cóc đội lá sen
  (   =   )
  (") _ (")  quang quác...`}
                </pre>
                <div class="g-poem-sign">
                  <b>Tác giả:</b> Tui (năm 2014)<br />
                  <i>"Lớn lên nhất định sẽ làm nhà thơ nổi tiếng!"</i>
                </div>
              </div>
            </div>

            <footer class="g-poem-footer">
              <span>💭 Cảm xúc 2026: "Đi làm tối mặt tối mũi, đọc lại bài thơ con cóc hồi lớp 4 tự nhiên bật cười một mình..."</span>
            </footer>
          </div>
        </div>
      )}
    </Pop>
  );
}
