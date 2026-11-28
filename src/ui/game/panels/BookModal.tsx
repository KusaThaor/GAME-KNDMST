import { useEffect } from 'preact/hooks';
import { Pop } from '../overlays/NoticeModal';
import type { UiActions, UiState } from '../store';

export const BOOK_SPREADS = [
  {
    left: {
      tag: 'LƯU BÚT NIÊN KHÓA 2015 – 2019',
      title: 'Lời Mở Đầu',
      paragraphs: [
        '“Thời gian trôi qua như một cái chớp mắt... Mới ngày nào còn bỡ ngỡ bước chân vào cổng trường cấp hai, chiếc ba lô to quá khổ và chiếc khăn quàng đỏ còn chưa biết thắt cho vuông vắn.”',
        'Gửi bạn của tương lai:',
        'Dù sau này cuộc sống có bận rộn đến đâu, mong bạn đừng bao giờ quên những buổi chiều tan học cùng nhau đạp xe dưới hàng phượng vĩ râm ran tiếng ve.',
      ],
      signature: '— Tập thể lớp chúng mình —',
    },
    right: {
      tag: 'NHẬT KÝ CHIỀU MƯA',
      title: 'Trò Chơi Sau Dãy Lớp Học',
      paragraphs: [
        'Tháng 10/2015:',
        'Cơn mưa rào đầu mùa làm ngập con mương nhỏ phía sau sân bóng. Cả bọn xé mấy tờ giấy nháp ô ly để gấp thuyền.',
        'Mỗi chiếc thuyền thả xuống đều mang theo một điều ước ngây ngô: đứa ước mai kiểm tra Toán không bị gọi lên bảng, đứa ước được cô khen chữ đẹp.',
        'Chiếc thuyền trôi mãi ra xa, mang theo cả tiếng cười giòn tan của một thời niên thiếu vô âu vô lo.',
      ],
      note: '📌 Ghi chú: Thuyền của ai trôi xa nhất được cả bọn bao một que kem đá!',
    },
  },
  {
    left: {
      tag: 'BÍ MẬT DƯỚI GỐC CÂY',
      title: 'Quy Ước Căn Cứ Lớp 7',
      paragraphs: [
        'Mùa hè năm 2016:',
        'Sau nhiều ngày tìm kiếm, tụi mình đã chính thức lập "Căn Cứ Bí Mật" dưới tán xà cừ cổ thụ sau trường.',
        'Năm điều quy ước được khắc bằng bút bi lên tấm ván gỗ:',
        '1. Luôn bảo vệ bí mật căn cứ.',
        '2. Không bỏ rơi bạn bè khi bị sao đỏ rượt.',
        '3. Có kẹo mút hay ô mai phải chia đều.',
        '4. Giận nhau không quá một tiết học.',
        '5. Mỗi chiều thứ Bảy cùng nhau quét dọn căn cứ.',
      ],
      signature: 'Trưởng nhóm ký tên & đóng dấu tay mực đỏ',
    },
    right: {
      tag: 'THƠ BÚT BI BÀN CUỐI',
      title: 'Những Tiết Học Đáng Nhớ',
      paragraphs: [
        '“Mỗi năm hoa phượng nở,',
        'Lại thấy chú ve sầu.',
        'Thầy giáo vừa quay bảng,',
        'Cả bàn đã nhìn nhau...”',
        'Những mẩu giấy gấp tư chuyền tay nhau dưới hộc bàn, chữ viết vội xiêu vẹo nhưng chan chứa bao nhiêu tiếng cười khúc khích.',
        'Chiếc hộp bút sắt kêu lạch cạch mỗi khi có đứa vội vàng cất sách vở lúc chuông reo báo tan trường.',
      ],
      note: '✨ Chữ ký nguệch ngoạc của 5 đứa bạn thân.',
    },
  },
  {
    left: {
      tag: 'MÙA THI NĂM ẤY',
      title: 'Chiếc Khăn Quàng & Bài Học Đầu',
      paragraphs: [
        'Những buổi sáng mùa đông se lạnh, sương mù giăng kín lối đi.',
        'Đứa nào đến cổng trường cũng hớt hải sờ lên cổ xem đã đeo khăn quàng đỏ chưa. Nhớ có hôm để quên ở nhà, phải mượn tạm của lớp bên cạnh luồn qua khe cửa sổ.',
        'Những bài kiểm tra điểm cao được dán cẩn thận vào trang đầu, bên cạnh là lời phê "Cần chăm chỉ hơn" của cô chủ nhiệm.',
      ],
      signature: 'Kỷ niệm tuổi 12 trong sáng',
    },
    right: {
      tag: 'TRANG CUỐI CÙNG',
      title: 'Hẹn Ngày Gặp Lại',
      paragraphs: [
        '“Nếu mai này khôn lớn,',
        'Gặp lại giữa dòng đời,',
        'Xin giữ nụ cười ấy,',
        'Như ngày còn bên tôi.”',
        'Cảm ơn vì đã là một phần thanh xuân rực rỡ nhất trong cuộc đời nhau.',
        'Bụi thời gian có thể phủ mờ trang giấy, nhưng ký ức tuổi học trò sẽ mãi vẹn nguyên trong góc nhỏ tâm hồn.',
      ],
      signature: '— Hết cuốn sổ lưu bút —',
    },
  },
];

export function BookModal({ s, a }: { s: UiState; a: UiActions }) {
  const pageIdx = s.bookPage ?? 0;
  const totalSpreads = BOOK_SPREADS.length;
  const spread = BOOK_SPREADS[pageIdx] ?? BOOK_SPREADS[0];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'KeyA') a.turnBookPage(-1);
      else if (e.key === 'ArrowRight' || e.key === 'KeyD') a.turnBookPage(1);
      else if (e.key === 'Escape') a.closePanel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pageIdx, a]);

  return (
    <Pop class="g-panel g-book-modal" testid="panel-book">
      <header class="g-book-header">
        <div class="g-book-title-box">
          <h2>📖 Cuốn Sổ Lưu Bút Kỷ Niệm</h2>
          <span class="g-book-page-counter">
            Trang {pageIdx * 2 + 1} – {pageIdx * 2 + 2} / {totalSpreads * 2}
          </span>
        </div>
        <div class="g-row g-book-header-actions">
          <button data-act="close" onClick={a.closePanel}>
            Đóng sách <kbd>Esc</kbd>
          </button>
        </div>
      </header>

      <div class="g-book-container">
        <div class="g-book-spine" aria-hidden="true" />
        <div class="g-book-spread">
          {/* Trang trái */}
          <article class="g-book-page g-book-page-left">
            <span class="g-book-tag">{spread.left.tag}</span>
            <h3 class="g-book-chapter-title">{spread.left.title}</h3>
            <div class="g-book-body">
              {spread.left.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {spread.left.signature && <div class="g-book-signature">{spread.left.signature}</div>}
            <div class="g-book-page-number">{pageIdx * 2 + 1}</div>
          </article>

          {/* Trang phải */}
          <article class="g-book-page g-book-page-right">
            <span class="g-book-tag">{spread.right.tag}</span>
            <h3 class="g-book-chapter-title">{spread.right.title}</h3>
            <div class="g-book-body">
              {spread.right.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {spread.right.note && <div class="g-book-note">{spread.right.note}</div>}
            {spread.right.signature && <div class="g-book-signature">{spread.right.signature}</div>}
            <div class="g-book-page-number">{pageIdx * 2 + 2}</div>
          </article>
        </div>
      </div>

      <footer class="g-book-footer">
        <button
          class="g-book-btn"
          data-act="prev-page"
          disabled={pageIdx === 0}
          onClick={() => a.turnBookPage(-1)}
          title="Trang trước (← hoặc A)"
        >
          ◄ Trang trước <kbd>A</kbd>
        </button>

        <span class="g-book-hint">Dùng chuột hoặc phím ← / → để lật trang sách</span>

        <button
          class="g-book-btn"
          data-act="next-page"
          disabled={pageIdx >= totalSpreads - 1}
          onClick={() => a.turnBookPage(1)}
          title="Trang sau (→ hoặc D)"
        >
          Trang sau ► <kbd>D</kbd>
        </button>
      </footer>
    </Pop>
  );
}
