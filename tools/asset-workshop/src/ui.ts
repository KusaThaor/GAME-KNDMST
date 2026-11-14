import type { AssetGenerator, AssetPreset, MaterialMode, ModelStats } from '../generators/types';
import type { AssetViewer, ViewPreset } from './viewer';

export interface UIControllerOptions {
  generator: AssetGenerator<any>;
  viewer: AssetViewer;
  sidebarContainer: HTMLElement;
  statsContainer: HTMLElement;
  toolbarContainer: HTMLElement;
  onParamsChange: (newParams: any) => void;
  onExport: () => void;
}

export class UIController {
  private generator: AssetGenerator<any>;
  private viewer: AssetViewer;
  private params: Record<string, any>;
  private sidebarContainer: HTMLElement;
  private statsContainer: HTMLElement;
  private toolbarContainer: HTMLElement;
  private onParamsChange: (newParams: any) => void;
  private onExport: () => void;

  private currentMaterialMode: MaterialMode = 'toon';
  private currentOutline = true;

  constructor(options: UIControllerOptions) {
    this.generator = options.generator;
    this.viewer = options.viewer;
    this.params = { ...this.generator.defaultParams };
    this.sidebarContainer = options.sidebarContainer;
    this.statsContainer = options.statsContainer;
    this.toolbarContainer = options.toolbarContainer;
    this.onParamsChange = options.onParamsChange;
    this.onExport = options.onExport;

    this.renderToolbar();
    this.renderSidebar();
    this.renderStatsPlaceholder();
  }

  public getParams(): Record<string, any> {
    return this.params;
  }

  /** Render thanh công cụ trên đỉnh viewport */
  private renderToolbar(): void {
    this.toolbarContainer.innerHTML = `
      <div class="toolbar-left">
        <div class="tool-group">
          <span class="tool-label">Góc nhìn:</span>
          <button class="tool-btn active" data-view="perspective" title="Phối cảnh 3D">Phối cảnh</button>
          <button class="tool-btn" data-view="front" title="Mặt trước">Trước</button>
          <button class="tool-btn" data-view="top" title="Nhìn từ trên xuống">Trên</button>
          <button class="tool-btn" data-view="side" title="Nhìn nghiêng hông">Hông</button>
          <button class="tool-btn" data-view="isometric" title="Trục đo Isometric">Trục đo</button>
        </div>
      </div>

      <div class="toolbar-right">
        <div class="tool-group">
          <span class="tool-label">Vật liệu:</span>
          <button class="tool-btn mode-btn active" data-mode="toon" title="Toon Shader (Chuẩn Game)">Toon</button>
          <button class="tool-btn mode-btn" data-mode="pbr" title="Standard PBR (Chuẩn GLTF)">PBR</button>
          <button class="tool-btn mode-btn" data-mode="wireframe" title="Khung dây Wireframe">Wire</button>
          <button class="tool-btn mode-btn" data-mode="normal" title="Pháp tuyến Normals">Normals</button>
        </div>

        <div class="tool-group toggle-group">
          <label class="tool-toggle" title="Khung bao Bounding Box">
            <input type="checkbox" id="chk-bbox">
            <span>Bounding Box</span>
          </label>
          <label class="tool-toggle" title="Lưới sàn">
            <input type="checkbox" id="chk-grid" checked>
            <span>Lưới</span>
          </label>
          <label class="tool-toggle" title="Bóng đổ">
            <input type="checkbox" id="chk-shadow" checked>
            <span>Bóng</span>
          </label>
        </div>

        <button class="export-btn" id="btn-export" title="Xuất file mô hình 3D (.glb)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Xuất .GLB
        </button>
      </div>
    `;

    // Gắn sự kiện View Presets
    this.toolbarContainer.querySelectorAll<HTMLButtonElement>('[data-view]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.toolbarContainer.querySelectorAll('[data-view]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const view = btn.dataset.view as ViewPreset;
        this.viewer.setViewPreset(view);
      });
    });

    // Gắn sự kiện Material Mode
    this.toolbarContainer.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.toolbarContainer.querySelectorAll('[data-mode]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode as MaterialMode;
        this.currentMaterialMode = mode;
        this.viewer.setMaterialMode(mode);
      });
    });

    // Gắn sự kiện Toggles
    const chkBbox = this.toolbarContainer.querySelector<HTMLInputElement>('#chk-bbox');
    if (chkBbox) {
      chkBbox.addEventListener('change', () => this.viewer.toggleBoundingBox(chkBbox.checked));
    }

    const chkGrid = this.toolbarContainer.querySelector<HTMLInputElement>('#chk-grid');
    if (chkGrid) {
      chkGrid.addEventListener('change', () => this.viewer.toggleGrid(chkGrid.checked));
    }

    const chkShadow = this.toolbarContainer.querySelector<HTMLInputElement>('#chk-shadow');
    if (chkShadow) {
      chkShadow.addEventListener('change', () => this.viewer.toggleShadow(chkShadow.checked));
    }

    // Gắn sự kiện Export GLB
    const btnExport = this.toolbarContainer.querySelector<HTMLButtonElement>('#btn-export');
    if (btnExport) {
      btnExport.addEventListener('click', () => this.onExport());
    }
  }

  /** Render toàn bộ Sidebar điều khiển */
  public renderSidebar(): void {
    this.sidebarContainer.innerHTML = '';

    // 1. Khối Chọn Cấu hình Mẫu (Presets)
    const presetCard = document.createElement('div');
    presetCard.className = 'panel-card';
    presetCard.innerHTML = `
      <div class="card-header">
        <h3 class="card-title">Cấu hình mẫu (Presets)</h3>
      </div>
      <div class="preset-list">
        ${this.generator.presets
          .map(
            (p) => `
          <button class="preset-btn" data-preset-id="${p.id}">
            <span class="preset-name">${p.name}</span>
            <span class="preset-desc">${p.description}</span>
          </button>
        `
          )
          .join('')}
      </div>
    `;

    presetCard.querySelectorAll<HTMLButtonElement>('.preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pId = btn.dataset.presetId;
        const target = this.generator.presets.find((p) => p.id === pId);
        if (target) {
          this.applyPreset(target);
        }
      });
    });
    this.sidebarContainer.appendChild(presetCard);

    // 2. Nhóm Kích thước (Dimensions)
    this.renderParamGroup(
      'dimensions',
      'Kích thước bàn & ghế',
      'Đơn vị tính bằng mét (m) theo tiêu chuẩn BGD Cỡ IV/V'
    );

    // 3. Nhóm Kiểu dáng (Style)
    this.renderParamGroup('style', 'Kiểu dáng & Cấu hình', 'Chọn kiểu bàn liền ghế, bàn rời hoặc bàn đơn');

    // 4. Nhóm Chi tiết đặc trưng (Features)
    this.renderParamGroup(
      'features',
      'Chi tiết trường học Việt Nam',
      'Các phụ kiện và đặc trưng lớp học THCS'
    );

    // 5. Nhóm Vật liệu & Màu sắc (Materials)
    this.renderParamGroup('materials', 'Vật liệu & Màu sắc', 'Màu sắc gỗ, sơn tĩnh điện và đệm cao su');

    // 6. Nút Đặt lại (Reset)
    const resetWrap = document.createElement('div');
    resetWrap.className = 'reset-wrap';
    resetWrap.innerHTML = `
      <button class="btn-secondary" id="btn-reset-params">
        Khôi phục thông số chuẩn BGD
      </button>
    `;
    resetWrap.querySelector('#btn-reset-params')?.addEventListener('click', () => {
      this.params = { ...this.generator.defaultParams };
      this.renderSidebar();
      this.onParamsChange(this.params);
    });
    this.sidebarContainer.appendChild(resetWrap);
  }

  /** Render từng nhóm tham số */
  private renderParamGroup(groupKey: string, title: string, subtitle?: string): void {
    const defs = this.generator.paramDefinitions.filter((d) => d.group === groupKey);
    if (defs.length === 0) return;

    const card = document.createElement('div');
    card.className = 'panel-card';

    const header = document.createElement('div');
    header.className = 'card-header';
    header.innerHTML = `
      <h3 class="card-title">${title}</h3>
      ${subtitle ? `<span class="card-subtitle">${subtitle}</span>` : ''}
    `;
    card.appendChild(header);

    const body = document.createElement('div');
    body.className = 'card-body';

    for (const def of defs) {
      const row = document.createElement('div');
      row.className = 'param-row';

      const currentVal = this.params[def.key] ?? def.default;

      if (def.type === 'number') {
        row.innerHTML = `
          <div class="param-label-wrap">
            <label for="param-${def.key}">${def.label}</label>
            <span class="param-val" id="val-${def.key}">${currentVal}${def.unit ? ' ' + def.unit : ''}</span>
          </div>
          <input type="range" id="param-${def.key}" min="${def.min ?? 0}" max="${def.max ?? 1}" step="${def.step ?? 0.01}" value="${currentVal}">
        `;

        const slider = row.querySelector<HTMLInputElement>(`#param-${def.key}`)!;
        const valSpan = row.querySelector<HTMLElement>(`#val-${def.key}`)!;

        slider.addEventListener('input', () => {
          const num = Number(slider.value);
          this.params[def.key] = num;
          valSpan.textContent = `${num}${def.unit ? ' ' + def.unit : ''}`;
          this.onParamsChange(this.params);
        });
      } else if (def.type === 'boolean') {
        row.innerHTML = `
          <label class="switch-row" for="param-${def.key}">
            <span>${def.label}</span>
            <input type="checkbox" id="param-${def.key}" ${currentVal ? 'checked' : ''}>
          </label>
        `;

        const chk = row.querySelector<HTMLInputElement>(`#param-${def.key}`)!;
        chk.addEventListener('change', () => {
          this.params[def.key] = chk.checked;
          this.onParamsChange(this.params);
        });
      } else if (def.type === 'color') {
        row.innerHTML = `
          <div class="color-row">
            <label for="param-${def.key}">${def.label}</label>
            <div class="color-picker-wrap">
              <span class="color-hex" id="hex-${def.key}">${currentVal}</span>
              <input type="color" id="param-${def.key}" value="${currentVal}">
            </div>
          </div>
        `;

        const colorInput = row.querySelector<HTMLInputElement>(`#param-${def.key}`)!;
        const hexSpan = row.querySelector<HTMLElement>(`#hex-${def.key}`)!;

        colorInput.addEventListener('input', () => {
          this.params[def.key] = colorInput.value;
          hexSpan.textContent = colorInput.value;
          this.onParamsChange(this.params);
        });
      } else if (def.type === 'select') {
        row.innerHTML = `
          <div class="select-row">
            <label for="param-${def.key}">${def.label}</label>
            <select id="param-${def.key}">
              ${(def.options ?? [])
                .map(
                  (opt) => `
                <option value="${opt.value}" ${String(currentVal) === opt.value ? 'selected' : ''}>
                  ${opt.label}
                </option>
              `
                )
                .join('')}
            </select>
          </div>
        `;

        const sel = row.querySelector<HTMLSelectElement>(`#param-${def.key}`)!;
        sel.addEventListener('change', () => {
          let val: any = sel.value;
          if (def.key === 'seatCount') val = Number(val);
          this.params[def.key] = val;
          this.onParamsChange(this.params);
        });
      }

      body.appendChild(row);
    }

    card.appendChild(body);
    this.sidebarContainer.appendChild(card);
  }

  /** Áp dụng cấu hình preset */
  private applyPreset(preset: AssetPreset<any>): void {
    this.params = {
      ...this.generator.defaultParams,
      ...preset.params,
    };
    this.renderSidebar();
    this.onParamsChange(this.params);
  }

  private renderStatsPlaceholder(): void {
    this.updateStats({
      vertices: 0,
      triangles: 0,
      meshes: 0,
      boundingBox: { width: 0, height: 0, depth: 0 },
    });
  }

  /** Cập nhật thống kê Model Inspector hiển thị ở góc màn hình */
  public updateStats(stats: ModelStats): void {
    const wCm = Math.round(stats.boundingBox.width * 100);
    const hCm = Math.round(stats.boundingBox.height * 100);
    const dCm = Math.round(stats.boundingBox.depth * 100);

    this.statsContainer.innerHTML = `
      <div class="stats-card">
        <div class="stats-title">THÔNG SỐ MÔ HÌNH (INSPECTOR)</div>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-name">Tam giác (Polys):</span>
            <span class="stat-val highlight">${stats.triangles.toLocaleString()}</span>
          </div>
          <div class="stat-item">
            <span class="stat-name">Số đỉnh (Vertices):</span>
            <span class="stat-val">${stats.vertices.toLocaleString()}</span>
          </div>
          <div class="stat-item">
            <span class="stat-name">Số Mesh:</span>
            <span class="stat-val">${stats.meshes}</span>
          </div>
          <div class="stat-item full-width">
            <span class="stat-name">Kích thước thực tế:</span>
            <span class="stat-val size-val">R: ${wCm}cm × D: ${dCm}cm × C: ${hCm}cm</span>
          </div>
        </div>
      </div>
    `;
  }
}
