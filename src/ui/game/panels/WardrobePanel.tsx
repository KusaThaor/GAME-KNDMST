import { useEffect, useRef, useState } from 'preact/hooks';
import * as THREE from 'three';
import { buildCharacter } from '../../../actors/character/build';
import { CharacterAnimator } from '../../../actors/character/animate';
import {
  DEFAULT_OUTFIT,
  isCosmeticUnlocked,
  OUTFIT_ACCESSORIES,
  OUTFIT_HAIR_COLORS,
  OUTFIT_SETS,
  type CosmeticUnlockRule,
  type OutfitStyle,
} from '../../../config/cosmetics';
import { playSfx } from '../../../game/sfx';
import { toon } from '../../../render/materials';
import { Pop } from '../overlays/NoticeModal';
import type { UiActions, UiState } from '../store';
import { CoinSvg, StampSvg } from './shopIcons';

type LockMeta = { id: string; title: string; rule: CosmeticUnlockRule };

function CharacterPreviewCanvas({ gender, outfit }: { gender: 'male' | 'female'; outfit: OutfitStyle }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const yawRef = useRef(0.35);
  const outfitRef = useRef(outfit);
  outfitRef.current = outfit;

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const width = Math.max(220, el.clientWidth || 260);
    const height = Math.max(260, el.clientHeight || 300);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f7efe0');

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 20);
    camera.position.set(0, 0.92, 2.55);
    camera.lookAt(0, 0.68, 0);

    const hemi = new THREE.HemisphereLight('#ffffff', '#c5b89e', 1.15);
    const dir = new THREE.DirectionalLight('#fff7e8', 1.2);
    dir.position.set(1.5, 3, 2.5);
    scene.add(hemi, dir);

    const ped = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.6, 0.06, 28),
      toon('#e6d5b8'),
    );
    ped.position.y = -0.03;
    scene.add(ped);

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      el.innerHTML = '';
      el.appendChild(renderer.domElement);
    } catch {
      return;
    }

    const rigId = gender === 'female' ? 'player2' : 'player1';
    const rig = buildCharacter(rigId, 6, { outfit });
    const anim = new CharacterAnimator(rig);
    rig.root.rotation.y = yawRef.current;
    scene.add(rig.root);

    let raf = 0;
    let lastT = performance.now();
    const renderLoop = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      rig.root.rotation.y = yawRef.current;
      anim.update(dt);
      renderer?.render(scene, camera);
      raf = requestAnimationFrame(renderLoop);
    };
    raf = requestAnimationFrame(renderLoop);

    let dragging = false;
    let lastX = 0;
    const onDown = (e: PointerEvent) => { dragging = true; lastX = e.clientX; };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      yawRef.current += (e.clientX - lastX) * 0.015;
      lastX = e.clientX;
    };
    const onUp = () => { dragging = false; };
    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    return () => {
      cancelAnimationFrame(raf);
      dom.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      renderer?.dispose();
    };
  }, [gender, outfit]);

  return (
    <div class="g-wardrobe-stage-wrap">
      <div class="g-wardrobe-stage" ref={hostRef} />
      <span class="g-wardrobe-spin-hint">↔ Kéo nhân vật để xoay 360°</span>
    </div>
  );
}

export function WardrobePanel({ s, a }: { s: UiState; a: UiActions }) {
  const cos = s.cosmetics;
  const saved = cos?.outfit ?? DEFAULT_OUTFIT;
  const unlockedIds = cos?.unlockedIds ?? [];
  const pagesRestored = cos?.pagesRestored ?? 0;
  const wallet = cos?.wallet ?? { coin: 450, stamp: 50 };
  const gender = cos?.gender ?? 'male';

  const [tab, setTab] = useState<'sets' | 'accessory' | 'hair'>('sets');
  const [draft, setDraft] = useState<OutfitStyle>(saved);
  const [lockedItems, setLockedItems] = useState<Map<string, LockMeta>>(() => new Map());
  const [notice, setNotice] = useState<string | null>(null);

  const selectSlot = (
    slotKey: 'set' | 'accessory' | 'hair',
    patch: Partial<OutfitStyle>,
    meta: LockMeta,
    unlocked: boolean,
  ) => {
    playSfx('sfx_tick');
    setNotice(null);
    const nextOutfit: OutfitStyle = { ...draft, ...patch };
    setDraft(nextOutfit);

    const nextLocks = new Map(lockedItems);
    if (unlocked) {
      nextLocks.delete(slotKey);
    } else {
      nextLocks.set(slotKey, meta);
    }
    setLockedItems(nextLocks);

    if (nextLocks.size === 0) {
      a.outfitSet(nextOutfit, true);
    }
  };

  const firstLocked = [...lockedItems.values()][0] ?? null;

  const handleUnlockLocked = () => {
    if (!firstLocked || firstLocked.rule.type !== 'shop') return;
    const { currency, price } = firstLocked.rule;
    if (wallet[currency] < price) {
      setNotice(`Chưa đủ ${currency === 'coin' ? 'Xu Kỷ Niệm' : 'Tem Thanh Xuân'} (cần ${price}, hiện có ${wallet[currency]}). Hãy ghé Tiệm Ký Ức để nạp thêm!`);
      return;
    }
    if (a.unlockCosmetic(firstLocked.id, currency, price)) {
      playSfx('sfx_tick');
      const nextLocks = new Map(lockedItems);
      for (const [k, v] of nextLocks) {
        if (v.id === firstLocked.id) nextLocks.delete(k);
      }
      setLockedItems(nextLocks);
      if (nextLocks.size === 0) a.outfitSet(draft, true);
      setNotice(`✨ Đã mở khóa "${firstLocked.title}"!`);
    }
  };

  const resetPreview = () => {
    setDraft(saved);
    setLockedItems(new Map());
    setNotice(null);
  };

  return (
    <Pop class="g-panel g-wardrobe-modal" testid="panel-wardrobe">
      <header class="g-wardrobe-head">
        <div class="g-wardrobe-title-wrap">
          <h2>👕 Tủ Đồ Thanh Xuân</h2>
          <span class="g-wardrobe-sub">Xem thử 3D &amp; thay trang phục ngay cho nhân vật</span>
        </div>
        <div class="g-wardrobe-head-right">
          <div class="g-decor-wallet-pills">
            <span class="g-wallet-mini coin"><CoinSvg size={14} /> <b>{wallet.coin}</b></span>
            <span class="g-wallet-mini stamp"><StampSvg size={14} /> <b>{wallet.stamp}</b></span>
          </div>
          <button type="button" class="g-decor-shop-link" onClick={() => a.openPanel('shop')}>+ Nạp ở Tiệm</button>
          <button type="button" class="g-album-close-btn" data-act="close" onClick={a.closePanel}>Đóng</button>
        </div>
      </header>

      <div class="g-wardrobe-grid">
        <div class="g-wardrobe-left">
          <CharacterPreviewCanvas gender={gender} outfit={draft} />
          {firstLocked && (
            <div class="g-wardrobe-preview-pill">
              👁️ Đang xem thử đồ chưa sở hữu
            </div>
          )}
        </div>

        <div class="g-wardrobe-right">
          <div class="g-wardrobe-tabs">
            <button type="button" class={`g-decor-tab ${tab === 'sets' ? 'on' : ''}`} onClick={() => setTab('sets')}>Trang phục</button>
            <button type="button" class={`g-decor-tab ${tab === 'accessory' ? 'on' : ''}`} onClick={() => setTab('accessory')}>Phụ kiện</button>
            <button type="button" class={`g-decor-tab ${tab === 'hair' ? 'on' : ''}`} onClick={() => setTab('hair')}>Màu tóc</button>
          </div>

          {notice && <div class="g-decor-notice">{notice}</div>}

          <div class="g-wardrobe-list">
            {tab === 'sets' && OUTFIT_SETS.map((o) => {
              const unlocked = isCosmeticUnlocked(o.id, o.unlock, pagesRestored, unlockedIds);
              const active = draft.topKind === (o.outfit.topKind ?? draft.topKind) && draft.shirtColor === (o.outfit.shirtColor ?? draft.shirtColor);
              return (
                <button
                  key={o.id}
                  type="button"
                  class={`g-decor-theme-card ${active ? 'active' : ''} ${!unlocked ? 'locked' : ''}`}
                  onClick={() => selectSlot('set', o.outfit, { id: o.id, title: o.title, rule: o.unlock }, unlocked)}
                >
                  <span class="g-decor-swatch-lg" style={{ background: o.swatch }} />
                  <div class="g-decor-card-info">
                    <strong>{o.title}</strong>
                    <small>{o.subtitle}</small>
                  </div>
                  {!unlocked ? (
                    <span class={`g-decor-badge ${o.unlock.type === 'shop' ? o.unlock.currency : 'milestone'}`}>
                      {o.unlock.type === 'milestone' ? `🔒 ${o.unlock.pagesRequired}T` : o.unlock.type === 'shop' ? (
                        <>{o.unlock.currency === 'coin' ? <CoinSvg size={12} /> : <StampSvg size={12} />} {o.unlock.price}</>
                      ) : null}
                    </span>
                  ) : active ? (
                    <span class="g-decor-badge owned">✓ Đang mặc</span>
                  ) : null}
                </button>
              );
            })}

            {tab === 'accessory' && OUTFIT_ACCESSORIES.map((acc) => {
              const accId = `acc_${acc.id}`;
              const unlocked = isCosmeticUnlocked(accId, acc.unlock, pagesRestored, unlockedIds);
              const active = draft.accessory === acc.id;
              return (
                <button
                  key={acc.id}
                  type="button"
                  class={`g-decor-theme-card ${active ? 'active' : ''} ${!unlocked ? 'locked' : ''}`}
                  onClick={() => selectSlot('accessory', { accessory: acc.id }, { id: accId, title: acc.title, rule: acc.unlock }, unlocked)}
                >
                  <span class="g-decor-swatch-lg" style={{ background: acc.swatch }} />
                  <div class="g-decor-card-info">
                    <strong>{acc.title}</strong>
                    <small>Phụ kiện đội đầu / đeo mặt</small>
                  </div>
                  {!unlocked ? (
                    <span class={`g-decor-badge ${acc.unlock.type === 'shop' ? acc.unlock.currency : 'milestone'}`}>
                      {acc.unlock.type === 'milestone' ? `🔒 ${acc.unlock.pagesRequired}T` : acc.unlock.type === 'shop' ? (
                        <>{acc.unlock.currency === 'coin' ? <CoinSvg size={12} /> : <StampSvg size={12} />} {acc.unlock.price}</>
                      ) : null}
                    </span>
                  ) : active ? (
                    <span class="g-decor-badge owned">✓ Đang đeo</span>
                  ) : null}
                </button>
              );
            })}

            {tab === 'hair' && OUTFIT_HAIR_COLORS.map((h) => {
              const unlocked = isCosmeticUnlocked(h.id, h.unlock, pagesRestored, unlockedIds);
              const active = draft.hairColor === h.color;
              return (
                <button
                  key={h.id}
                  type="button"
                  class={`g-decor-theme-card ${active ? 'active' : ''} ${!unlocked ? 'locked' : ''}`}
                  onClick={() => selectSlot('hair', { hairColor: h.color }, { id: h.id, title: h.title, rule: h.unlock }, unlocked)}
                >
                  <span class="g-decor-swatch-lg" style={{ background: h.swatch }} />
                  <div class="g-decor-card-info">
                    <strong>{h.title}</strong>
                    <small>Đổi màu tóc nhân vật 3D</small>
                  </div>
                  {!unlocked ? (
                    <span class={`g-decor-badge ${h.unlock.type === 'shop' ? h.unlock.currency : 'milestone'}`}>
                      {h.unlock.type === 'milestone' ? `🔒 ${h.unlock.pagesRequired}T` : h.unlock.type === 'shop' ? (
                        <>{h.unlock.currency === 'coin' ? <CoinSvg size={12} /> : <StampSvg size={12} />} {h.unlock.price}</>
                      ) : null}
                    </span>
                  ) : active ? (
                    <span class="g-decor-badge owned">✓ Đang chọn</span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {firstLocked ? (
            <div class="g-decor-preview-bar">
              <div class="g-decor-preview-info">
                <span>👁️ Đang xem thử: <b>{firstLocked.title}</b></span>
                {firstLocked.rule.type === 'milestone' && (
                  <small>Hoàn thành {firstLocked.rule.pagesRequired} trang để mở ({pagesRestored}/{firstLocked.rule.pagesRequired})</small>
                )}
              </div>
              <div class="g-decor-preview-btns">
                <button type="button" class="g-decor-btn-ghost" onClick={resetPreview}>Hoàn tác</button>
                {firstLocked.rule.type === 'shop' && (
                  <button type="button" class="g-decor-btn-buy" onClick={handleUnlockLocked}>
                    Mở khóa ({firstLocked.rule.price} {firstLocked.rule.currency === 'coin' ? 'Xu' : 'Tem'})
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div class="g-decor-foot">
              <button type="button" class="g-decor-reset-link" onClick={() => { a.resetCosmeticsDemo(); setDraft(DEFAULT_OUTFIT); setLockedItems(new Map()); }}>
                Đặt lại mặc định
              </button>
              <button type="button" class="g-decor-btn-done" onClick={a.closePanel}>Lưu &amp; Xong</button>
            </div>
          )}
        </div>
      </div>
    </Pop>
  );
}
