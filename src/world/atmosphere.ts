import { gsap } from 'gsap';
import * as THREE from 'three';
import type { MemoryDay } from '../content/types';
import type { EventBus } from '../core/eventBus';
import type { Fx, RainFx, WeatherFx } from '../render/fx';
import { rainbowArc, starField } from './sky';
import { LIGHTING_PRESETS } from './variants';

export interface AtmosphereDeps {
  sun: THREE.DirectionalLight;
  hemi: THREE.HemisphereLight;
  fx: Fx | null;
  sky?: THREE.Mesh | null;
  sunOffset?: THREE.Vector3;
  day?: MemoryDay | null;
  camera?: THREE.Camera;
  bus?: EventBus;
  stepId?: string | null;
}

export interface Atmosphere {
  readonly preset: string;
  set(presetName: string, tweenSec?: number): boolean;
  update(dt: number): void;
  dispose(): void;
}

export function createAtmosphere(scene: THREE.Scene, deps: AtmosphereDeps, initial?: string | null): Atmosphere {
  const { hemi, sun, sky, fx } = deps;
  const skyRoot = sky?.parent ?? scene;
  const clouds = skyRoot.getObjectByName('clouds');
  let arc: ReturnType<typeof rainbowArc> | undefined;
  let stars: ReturnType<typeof starField> | undefined;
  let rain: RainFx | undefined;
  let fire: WeatherFx | undefined;
  let tween: gsap.core.Timeline | undefined;
  let elapsed = 0, name = '';

  function set(presetName: string, tweenSec = 0) {
    if (!Object.hasOwn(LIGHTING_PRESETS, presetName)) return false;
    const p = LIGHTING_PRESETS[presetName];
    name = presetName;
    tween?.kill();
    tween = gsap.timeline({ paused: true, defaults: { duration: tweenSec, ease: 'sine.inOut' } });
    elapsed = 0;
    const color = (target: THREE.Color, hex: string) => {
      const c = new THREE.Color(hex);
      tween!.to(target, { r: c.r, g: c.g, b: c.b }, 0);
    };
    if (scene.fog) color(scene.fog.color, p.fog);
    if (sky?.material instanceof THREE.ShaderMaterial) {
      for (const [i, band] of ['zenith', 'middle', 'horizon'].entries()) {
        color(sky.material.uniforms[band].value, p.sky[i]);
      }
    }
    color(hemi.color, p.hemiSky);
    color(hemi.groundColor, p.hemiGround);
    color(sun.color, p.sunColor);
    tween.to(hemi, { intensity: p.hemiIntensity }, 0).to(sun, { intensity: p.sunIntensity }, 0);
    const [x, y, z] = p.sunPos;
    tween.to(deps.sunOffset ?? sun.position, { x, y, z }, 0);
    if (tweenSec <= 0) tween.progress(1);

    const rate = presetName === 'rain_shower' ? 1000 : presetName === 'rain_overcast' ? 320 : 0;
    if (rate && fx) {
      rain ??= fx.addRain({ rate, area: 17 });
      if (deps.camera) deps.camera.getWorldPosition(rain.root.position);
      rain.setRate(rate);
    }
    rain?.setActive(rate > 0);
    if (presetName === 'after_rain_rainbow' && !arc) { arc = rainbowArc(); skyRoot.add(arc); }
    if (arc) arc.visible = presetName === 'after_rain_rainbow';
    if (presetName === 'night_campfire') {
      if (!stars) { stars = starField(); skyRoot.add(stars); }
      if (fx && !fire) fire = fx.addCampfire(new THREE.Vector3(0, 0, 0));
    }
    if (clouds) clouds.visible = presetName !== 'night_campfire';
    if (stars) stars.visible = presetName === 'night_campfire';
    fire?.setActive(presetName === 'night_campfire');
    return true;
  }

  if (initial) set(initial);
  const weather = deps.day?.weather_by_step;
  if (deps.stepId && weather?.[deps.stepId]) set(weather[deps.stepId]);
  const unsubscribe = deps.bus?.on('step_activated', ({ step_id }) => {
    const preset = weather?.[step_id];
    if (preset && preset !== name) set(preset, 1.4);
  });

  return {
    get preset() { return name; },
    set,
    update(dt) {
      if (tween && elapsed < tween.duration()) {
        elapsed = Math.min(tween.duration(), elapsed + dt);
        tween.time(elapsed);
      }
      if (rain?.root.visible) {
        if (deps.camera) deps.camera.getWorldPosition(rain.root.position);
        else if (sky) sky.getWorldPosition(rain.root.position);
      }
    },
    dispose() {
      unsubscribe?.();
      tween?.kill();
      for (const object of [arc, stars]) {
        if (!object) continue;
        object.removeFromParent(); object.geometry.dispose(); object.material.dispose();
      }
      rain?.setActive(false);
      fire?.setActive(false);
    },
  };
}
