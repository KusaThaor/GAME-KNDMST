import * as THREE from 'three';

/** Chế độ hiển thị vật liệu của asset */
export type MaterialMode = 'toon' | 'pbr' | 'wireframe' | 'normal';

export interface BuildOptions {
  materialMode?: MaterialMode;
  outline?: boolean;
}

/** Thống kê chi tiết mô hình 3D */
export interface ModelStats {
  vertices: number;
  triangles: number;
  meshes: number;
  boundingBox: {
    width: number;
    height: number;
    depth: number;
  };
}

/** Định nghĩa tham số để UI render controls linh hoạt */
export type ParamType = 'number' | 'boolean' | 'color' | 'select';

export interface ParamDefinition<T = any> {
  key: string;
  label: string;
  type: ParamType;
  group: 'dimensions' | 'features' | 'materials' | 'style';
  default: T;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: { value: string; label: string }[];
}

/** Cấu hình Preset mẫu */
export interface AssetPreset<TParams> {
  id: string;
  name: string;
  description: string;
  params: Partial<TParams>;
}

/** Giao diện chuẩn cho tất cả các Asset Generator trong Workshop */
export interface AssetGenerator<TParams extends Record<string, any>> {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultParams: TParams;
  paramDefinitions: ParamDefinition[];
  presets: AssetPreset<TParams>[];
  build(params: TParams, options?: BuildOptions): THREE.Group;
}
