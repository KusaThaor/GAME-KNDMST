import { assetGenerators, getGeneratorById } from '../generators';
import { UIController } from './ui';
import { AssetViewer } from './viewer';

function initWorkshop(): void {
  const viewportEl = document.getElementById('viewport');
  const toolbarEl = document.getElementById('toolbar');
  const sidebarEl = document.getElementById('sidebar-content');
  const statsEl = document.getElementById('stats-panel');
  const toastEl = document.getElementById('toast');

  if (!viewportEl || !toolbarEl || !sidebarEl || !statsEl) {
    console.error('Không tìm thấy các phần tử DOM cần thiết cho Workshop');
    return;
  }

  // Khởi tạo Generator đầu tiên: Bộ bàn ghế học sinh THCS Việt Nam
  const defaultGenerator = assetGenerators[0];
  let currentParams = { ...defaultGenerator.defaultParams };

  // Khởi tạo 3D Viewer
  let uiController: UIController;
  const viewer = new AssetViewer({
    container: viewportEl,
    onStatsUpdate: (stats) => {
      if (uiController) {
        uiController.updateStats(stats);
      }
    },
  });

  // Đưa mô hình vào viewer
  const updateModel = () => {
    viewer.setModel((options) => defaultGenerator.build(currentParams, options));
  };

  // Hiển thị thông báo Toast
  const showToast = (message: string, duration = 3000) => {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('visible');
    setTimeout(() => {
      toastEl.classList.remove('visible');
    }, duration);
  };

  // Khởi tạo UI Controller
  uiController = new UIController({
    generator: defaultGenerator,
    viewer,
    sidebarContainer: sidebarEl,
    statsContainer: statsEl,
    toolbarContainer: toolbarEl,
    onParamsChange: (newParams) => {
      currentParams = { ...newParams };
      updateModel();
    },
    onExport: async () => {
      try {
        showToast('Đang tạo và đóng gói file .GLB...');
        const seatStr = currentParams.seatCount === 1 ? '1-cho' : '2-cho';
        const styleStr = currentParams.style;
        const filename = `ban-ghe-thcs-${styleStr}-${seatStr}.glb`;
        await viewer.exportGLB(filename);
        showToast(`Đã xuất thành công: ${filename}`);
      } catch (err) {
        console.error('Lỗi khi xuất GLB:', err);
        showToast(`Lỗi xuất GLB: ${String(err)}`);
      }
    },
  });

  // Xây dựng mô hình ban đầu
  updateModel();
}

window.addEventListener('DOMContentLoaded', initWorkshop);
