import * as THREE from 'three';
import { Pane } from 'tweakpane';
import type { Stage } from '../render/stage';

/**
 * Bảng chỉnh thông số trực tiếp (Tweakpane) — CHỈ ở bản test, mở bằng ?tweak=1.
 * Được nạp động (dynamic import) nên không lọt vào bản production.
 * Dùng để tìm số đẹp cho ánh sáng/sương/hiệu ứng, rồi chép số đó vào code.
 */
export interface TweakTargets {
  stage: Stage;
  hemi: THREE.HemisphereLight;
  sun: THREE.DirectionalLight;
  motes?: { setRate(n: number): void };
}

export function mountTweaks(t: TweakTargets) {
  const { stage, hemi, sun } = t;
  const fog = stage.scene.fog instanceof THREE.Fog ? stage.scene.fog : null;
  const pane = new Pane({ title: 'Chỉnh cảnh (test)', expanded: true });
  pane.element.parentElement!.style.zIndex = '50';

  const light = pane.addFolder({ title: 'Ánh sáng' });
  light.addBinding(stage.renderer, 'toneMappingExposure', { label: 'phơi sáng', min: 0.5, max: 1.8, step: 0.01 });
  light.addBinding(hemi, 'intensity', { label: 'trời', min: 0, max: 3, step: 0.01 });
  light.addBinding(sun, 'intensity', { label: 'mặt trời', min: 0, max: 4, step: 0.01 });
  const sunColor = { màu: '#' + sun.color.getHexString() };
  light.addBinding(sunColor, 'màu', { label: 'màu nắng' }).on('change', (e) => sun.color.set(e.value));

  if (fog) {
    const f = pane.addFolder({ title: 'Sương', expanded: false });
    f.addBinding(fog, 'near', { label: 'gần', min: 0, max: 120, step: 1 });
    f.addBinding(fog, 'far', { label: 'xa', min: 20, max: 300, step: 1 });
  }

  if (t.motes) {
    const m = { rate: 14 };
    pane.addFolder({ title: 'Hiệu ứng' })
      .addBinding(m, 'rate', { label: 'bụi nắng/giây', min: 0, max: 60, step: 1 })
      .on('change', (e) => t.motes!.setRate(e.value));
  }

  const perf = pane.addFolder({ title: 'Hiệu năng' });
  perf.addBinding(stage.stats, 'fps', { readonly: true, view: 'graph', min: 0, max: 120 });
  perf.addBinding(stage.stats, 'drawCalls', { label: 'lượt vẽ', readonly: true, format: (v: number) => v.toFixed(0) });

  pane.addButton({ title: 'Chép số hiện tại' }).on('click', () => {
    const snap = {
      exposure: stage.renderer.toneMappingExposure, hemi: hemi.intensity, sun: sun.intensity,
      sunColor: '#' + sun.color.getHexString(), fog: fog ? [fog.near, fog.far] : null,
    };
    void navigator.clipboard?.writeText(JSON.stringify(snap, null, 2));
    console.info('[tweaks]', snap);
  });
  return pane;
}
