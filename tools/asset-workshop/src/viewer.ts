import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import type { BuildOptions, MaterialMode, ModelStats } from '../generators/types';

export type ViewPreset = 'perspective' | 'front' | 'top' | 'side' | 'isometric';

export interface ViewerOptions {
  container: HTMLElement;
  onStatsUpdate?: (stats: ModelStats) => void;
}

export class AssetViewer {
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public controls: OrbitControls;

  private container: HTMLElement;
  private currentModel: THREE.Group | null = null;
  private currentBuildFn: ((options: BuildOptions) => THREE.Group) | null = null;
  private currentOptions: BuildOptions = { materialMode: 'toon', outline: true };

  // Helpers & Environment
  private gridHelper: THREE.GridHelper;
  private shadowPlane: THREE.Mesh;
  private axesHelper: THREE.AxesHelper;
  private bboxHelper: THREE.Box3Helper | null = null;
  private onStatsUpdate?: (stats: ModelStats) => void;

  private rafId: number = 0;

  constructor(options: ViewerOptions) {
    this.container = options.container;
    this.onStatsUpdate = options.onStatsUpdate;

    // 1. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 2. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#16181d');

    // 3. Camera
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.05, 50);
    this.camera.position.set(1.6, 1.2, 1.8);

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.target.set(0, 0.45, 0);
    this.controls.maxPolarAngle = Math.PI / 2 + 0.05;
    this.controls.minDistance = 0.3;
    this.controls.maxDistance = 10;
    this.controls.update();

    // 5. Lights
    this.setupLighting();

    // 6. Grid & Floor
    this.gridHelper = new THREE.GridHelper(3.0, 30, 0x4f6479, 0x272c35);
    this.gridHelper.position.y = 0.001;
    this.scene.add(this.gridHelper);

    const shadowPlaneGeo = new THREE.PlaneGeometry(8, 8);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    this.shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    this.shadowPlane.rotation.x = -Math.PI / 2;
    this.shadowPlane.receiveShadow = true;
    this.scene.add(this.shadowPlane);

    this.axesHelper = new THREE.AxesHelper(0.4);
    this.axesHelper.visible = false;
    this.scene.add(this.axesHelper);

    // Event listener resize
    window.addEventListener('resize', this.onResize);

    // Start loop
    this.animate();
  }

  private setupLighting(): void {
    // Ánh sáng bán cầu dịu nhẹ
    const hemiLight = new THREE.HemisphereLight('#f1f5f9', '#242a33', 1.1);
    this.scene.add(hemiLight);

    // Key Light (Ánh sáng chính có đổ bóng)
    const keyLight = new THREE.DirectionalLight('#fff8ee', 1.8);
    keyLight.position.set(-2.4, 4.0, 3.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 12;
    const d = 1.6;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.radius = 2.5;
    this.scene.add(keyLight);

    // Fill Light (Ánh sáng phụ làm sáng các mảng tối)
    const fillLight = new THREE.DirectionalLight('#b0c8e8', 0.85);
    fillLight.position.set(3.0, 2.0, -1.5);
    this.scene.add(fillLight);

    // Rim Light (Ánh sáng viền làm nổi khối vật thể)
    const rimLight = new THREE.DirectionalLight('#ffffff', 0.65);
    rimLight.position.set(0, 3.0, -3.5);
    this.scene.add(rimLight);
  }

  /** Đặt mô hình mới vào scene */
  public setModel(buildFn: (options: BuildOptions) => THREE.Group): void {
    this.currentBuildFn = buildFn;
    this.rebuildCurrentModel();
  }

  /** Cập nhật chế độ vật liệu */
  public setMaterialMode(mode: MaterialMode): void {
    this.currentOptions.materialMode = mode;
    this.rebuildCurrentModel();
  }

  /** Bật/tắt viền nét vẽ outline */
  public setOutline(outline: boolean): void {
    this.currentOptions.outline = outline;
    this.rebuildCurrentModel();
  }

  /** Tái tạo mô hình khi tham số hoặc tùy chọn hiển thị thay đổi */
  public rebuildCurrentModel(): void {
    if (!this.currentBuildFn) return;

    if (this.currentModel) {
      this.scene.remove(this.currentModel);
      this.disposeObject(this.currentModel);
      this.currentModel = null;
    }

    if (this.bboxHelper) {
      this.scene.remove(this.bboxHelper);
      this.bboxHelper = null;
    }

    this.currentModel = this.currentBuildFn(this.currentOptions);
    this.scene.add(this.currentModel);

    // Cập nhật Bounding Box
    const box = new THREE.Box3().setFromObject(this.currentModel);
    this.bboxHelper = new THREE.Box3Helper(box, new THREE.Color('#38bdf8'));
    this.bboxHelper.visible = false;
    this.scene.add(this.bboxHelper);

    // Tính toán thống kê mô hình
    this.calculateStats(box);
  }

  /** Tính toán số đỉnh, tam giác, mesh và kích thước */
  private calculateStats(box: THREE.Box3): void {
    if (!this.currentModel) return;

    let vertices = 0;
    let triangles = 0;
    let meshes = 0;

    this.currentModel.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        meshes++;
        const geo = mesh.geometry;
        if (geo) {
          const pos = geo.getAttribute('position');
          if (pos) vertices += pos.count;
          if (geo.index) {
            triangles += geo.index.count / 3;
          } else if (pos) {
            triangles += pos.count / 3;
          }
        }
      }
    });

    const size = new THREE.Vector3();
    box.getSize(size);

    const stats: ModelStats = {
      vertices,
      triangles: Math.round(triangles),
      meshes,
      boundingBox: {
        width: Number(size.x.toFixed(3)),
        height: Number(size.y.toFixed(3)),
        depth: Number(size.z.toFixed(3)),
      },
    };

    if (this.onStatsUpdate) {
      this.onStatsUpdate(stats);
    }
  }

  /** Đặt góc nhìn Camera theo preset */
  public setViewPreset(preset: ViewPreset): void {
    const targetY = 0.42;
    this.controls.target.set(0, targetY, 0);

    switch (preset) {
      case 'perspective':
        this.camera.position.set(1.5, 1.2, 1.8);
        break;
      case 'front':
        this.camera.position.set(0, targetY + 0.1, 2.2);
        break;
      case 'top':
        this.camera.position.set(0, 2.6, 0.001);
        break;
      case 'side':
        this.camera.position.set(2.2, targetY + 0.1, 0);
        break;
      case 'isometric':
        this.camera.position.set(1.8, 1.8, 1.8);
        break;
    }
    this.controls.update();
  }

  /** Reset camera về trạng thái xem thuận mắt nhất */
  public resetCamera(): void {
    this.setViewPreset('perspective');
  }

  // Tùy chọn hiển thị
  public toggleGrid(visible: boolean): void {
    this.gridHelper.visible = visible;
  }

  public toggleShadow(visible: boolean): void {
    this.shadowPlane.visible = visible;
  }

  public toggleBoundingBox(visible: boolean): void {
    if (this.bboxHelper) {
      this.bboxHelper.visible = visible;
    }
  }

  public toggleAxes(visible: boolean): void {
    this.axesHelper.visible = visible;
  }

  /** Xuất mô hình hiện tại ra file GLB binary */
  public exportGLB(filename = 'asset.glb'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.currentModel) {
        reject(new Error('Chưa có mô hình để xuất'));
        return;
      }

      const exporter = new GLTFExporter();
      exporter.parse(
        this.currentModel,
        (gltf) => {
          if (gltf instanceof ArrayBuffer) {
            const blob = new Blob([gltf], { type: 'model/gltf-binary' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename.endsWith('.glb') ? filename : `${filename}.glb`;
            link.click();
            URL.revokeObjectURL(link.href);
            resolve();
          } else {
            reject(new Error('Xuất file thất bại: Định dạng trả về không phải nhị phân GLB.'));
          }
        },
        (error) => {
          reject(error);
        },
        { binary: true }
      );
    });
  }

  private onResize = (): void => {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private animate = (): void => {
    this.rafId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  private disposeObject(obj: THREE.Object3D): void {
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      }
    });
  }

  public destroy(): void {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
