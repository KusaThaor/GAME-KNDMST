import { useState } from 'preact/hooks';
import {
  DEFAULT_ROOM_DECOR,
  isCosmeticUnlocked,
  ROOM_ACCENTS,
  ROOM_CURTAIN_COLORS,
  ROOM_THEMES,
  ROOM_WALL_COLORS,
  type CosmeticUnlockRule,
  type RoomDecorStyle,
} from '../../../config/cosmetics';
import { playSfx } from '../../../game/sfx';
import type { UiActions, UiState } from '../store';
import { CoinSvg, StampSvg } from './shopIcons';

type LockMeta = { id: string; title: string; rule: CosmeticUnlockRule };

export function RoomDecorPanel({ s, a }: { s: UiState; a: UiActions }) {
  const cos = s.cosmetics;
  const saved = cos?.roomDecor ?? DEFAULT_ROOM_DECOR;
  const unlockedIds = cos?.unlockedIds ?? [];
  const pagesRestored = cos?.pagesRestored ?? 0;
  const wallet = cos?.wallet ?? { coin: 450, stamp: 50 };

  const [tab, setTab] = useState<'themes' | 'custom'>('themes');
  const [draft, setDraft] = useState<RoomDecorStyle>(saved);
  const [previewLock, setPreviewLock] = useState<LockMeta | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const applyDraft = (next: RoomDecorStyle, lockMeta: LockMeta | null) => {
    setDraft(next);
    setNotice(null);
    if (lockMeta) {
      setPreviewLock(lockMeta);
      a.roomSetDecor(next, false);
    } else {
      setPreviewLock(null);
      a.roomSetDecor(next, true);
    }
  };

  const handleUnlock = (meta: LockMeta) => {
    if (meta.rule.type !== 'shop') return;
    const { currency, price } = meta.rule;
    if (wallet[currency] < price) {
      setNotice(`Chưa đủ ${currency === 'coin' ? 'Xu Kỷ Niệm' : 'Tem Thanh Xuân'} (cần ${price}, hiện có ${wallet[currency]}). Hãy ghé Tiệm Ký Ức để nạp thêm!`);
      return;
    }
    if (a.unlockCosmetic(meta.id, currency, price)) {
      playSfx('sfx_tick');
      setPreviewLock(null);
      a.roomSetDecor(draft, true);
      setNotice(`✨ Đã mở khóa & lưu "${meta.title}" vào Phòng 2026!`);
    }
  };

  const resetPreview = () => {
    setDraft(saved);
    setPreviewLock(null);
    setNotice(null);
    a.roomSetDecor(saved, false);
  };

  return (
    <aside class="g-decor-drawer" data-testid="panel-room-decor">
      <header class="g-decor-head">
        <div>
          <h3>🛋️ Trang Trí Phòng 2026</h3>
          <p>Chạm vật phẩm để xem trực tiếp trong phòng 3D</p>
        </div>
        <button type="button" class="g-decor-close" data-act="close" onClick={a.closePanel}>✕</button>
      </header>

      <div class="g-decor-wallet-bar">
        <div class="g-decor-wallet-pills">
          <span class="g-wallet-mini coin"><CoinSvg size={14} /> <b>{wallet.coin}</b></span>
          <span class="g-wallet-mini stamp"><StampSvg size={14} /> <b>{wallet.stamp}</b></span>
        </div>
        <button type="button" class="g-decor-shop-link" onClick={() => a.openPanel('shop')}>+ Nạp ở Tiệm</button>
      </div>

      <div class="g-decor-tabs">
        <button type="button" class={`g-decor-tab ${tab === 'themes' ? 'on' : ''}`} onClick={() => setTab('themes')}>Chủ đề phòng</button>
        <button type="button" class={`g-decor-tab ${tab === 'custom' ? 'on' : ''}`} onClick={() => setTab('custom')}>Màu &amp; Đồ 3D</button>
      </div>

      {notice && <div class="g-decor-notice">{notice}</div>}

      <div class="g-decor-body">
        {tab === 'themes' ? (
          <div class="g-decor-theme-list">
            {ROOM_THEMES.map((t) => {
              const unlocked = isCosmeticUnlocked(t.id, t.unlock, pagesRestored, unlockedIds);
              const active = draft.wallColor === (t.style.wallColor ?? draft.wallColor)
                && draft.curtainColor === (t.style.curtainColor ?? draft.curtainColor);
              return (
                <button
                  key={t.id}
                  type="button"
                  class={`g-decor-theme-card ${active ? 'active' : ''} ${!unlocked ? 'locked' : ''}`}
                  onClick={() => {
                    playSfx('sfx_tick');
                    const next: RoomDecorStyle = {
                      ...DEFAULT_ROOM_DECOR,
                      ...t.style,
                      rugColors: (t.style.rugColors ? [...t.style.rugColors] : [...DEFAULT_ROOM_DECOR.rugColors]) as [string, string, string],
                    };
                    applyDraft(next, unlocked ? null : { id: t.id, title: t.title, rule: t.unlock });
                  }}
                >
                  <span class="g-decor-swatch-lg" style={{ background: t.swatch }} />
                  <div class="g-decor-card-info">
                    <strong>{t.title}</strong>
                    <small>{t.subtitle}</small>
                  </div>
                  {!unlocked ? (
                    <span class={`g-decor-badge ${t.unlock.type === 'shop' ? t.unlock.currency : 'milestone'}`}>
                      {t.unlock.type === 'milestone' ? `🔒 ${t.unlock.pagesRequired}T` : t.unlock.type === 'shop' ? (
                        <>{t.unlock.currency === 'coin' ? <CoinSvg size={12} /> : <StampSvg size={12} />} {t.unlock.price}</>
                      ) : null}
                    </span>
                  ) : active ? (
                    <span class="g-decor-badge owned">✓ Đang dùng</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : (
          <div class="g-decor-custom-groups">
            <div class="g-decor-sec">
              <span class="g-decor-sec-label">Màu tường</span>
              <div class="g-decor-chips">
                {ROOM_WALL_COLORS.map((w) => {
                  const unlocked = isCosmeticUnlocked(w.id, w.unlock, pagesRestored, unlockedIds);
                  const active = draft.wallColor === w.color;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      class={`g-style-chip ${active ? 'active' : ''} ${!unlocked ? 'locked' : ''}`}
                      onClick={() => {
                        playSfx('sfx_tick');
                        applyDraft({ ...draft, wallColor: w.color }, unlocked ? null : { id: w.id, title: `Tường ${w.label}`, rule: w.unlock });
                      }}
                    >
                      <span class="g-style-swatch" style={{ background: w.color }} />
                      <span>{w.label}</span>
                      {!unlocked && (
                        <span class="g-lock-tag">
                          {w.unlock.type === 'milestone' ? `🔒${w.unlock.pagesRequired}T` : w.unlock.type === 'shop' ? `${w.unlock.price}${w.unlock.currency === 'coin' ? ' Xu' : ' Tem'}` : ''}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div class="g-decor-sec">
              <span class="g-decor-sec-label">Rèm cửa sổ</span>
              <div class="g-decor-chips">
                {ROOM_CURTAIN_COLORS.map((c) => {
                  const unlocked = isCosmeticUnlocked(c.id, c.unlock, pagesRestored, unlockedIds);
                  const active = draft.curtainColor === c.color;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      class={`g-style-chip ${active ? 'active' : ''} ${!unlocked ? 'locked' : ''}`}
                      onClick={() => {
                        playSfx('sfx_tick');
                        applyDraft({ ...draft, curtainColor: c.color }, unlocked ? null : { id: c.id, title: `Rèm ${c.label}`, rule: c.unlock });
                      }}
                    >
                      <span class="g-style-swatch" style={{ background: c.color }} />
                      <span>{c.label}</span>
                      {!unlocked && (
                        <span class="g-lock-tag">
                          {c.unlock.type === 'milestone' ? `🔒${c.unlock.pagesRequired}T` : c.unlock.type === 'shop' ? `${c.unlock.price}${c.unlock.currency === 'coin' ? ' Xu' : ' Tem'}` : ''}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div class="g-decor-sec">
              <span class="g-decor-sec-label">Đồ trang trí 3D nổi bật</span>
              <div class="g-decor-chips">
                {ROOM_ACCENTS.map((acc) => {
                  const unlocked = isCosmeticUnlocked(acc.id, acc.unlock, pagesRestored, unlockedIds);
                  const on = draft[acc.id];
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      class={`g-style-chip ${on ? 'active' : ''} ${!unlocked ? 'locked' : ''}`}
                      onClick={() => {
                        playSfx('sfx_tick');
                        const next = { ...draft, [acc.id]: !on };
                        applyDraft(next, !unlocked && !on ? { id: acc.id, title: acc.title, rule: acc.unlock } : null);
                      }}
                    >
                      <span class="g-style-swatch" style={{ background: acc.swatch }} />
                      <span>{acc.title}</span>
                      {!unlocked && (
                        <span class="g-lock-tag">
                          {acc.unlock.type === 'milestone' ? `🔒${acc.unlock.pagesRequired}T` : acc.unlock.type === 'shop' ? `${acc.unlock.price}${acc.unlock.currency === 'coin' ? ' Xu' : ' Tem'}` : ''}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {previewLock ? (
        <div class="g-decor-preview-bar">
          <div class="g-decor-preview-info">
            <span>👁️ Xem thử: <b>{previewLock.title}</b></span>
            {previewLock.rule.type === 'milestone' && (
              <small>Cần hoàn thành {previewLock.rule.pagesRequired} trang kỷ niệm ({pagesRestored}/{previewLock.rule.pagesRequired})</small>
            )}
          </div>
          <div class="g-decor-preview-btns">
            <button type="button" class="g-decor-btn-ghost" onClick={resetPreview}>Hoàn tác</button>
            {previewLock.rule.type === 'shop' && (
              <button type="button" class="g-decor-btn-buy" onClick={() => handleUnlock(previewLock)}>
                Mở khóa ({previewLock.rule.price} {previewLock.rule.currency === 'coin' ? 'Xu' : 'Tem'})
              </button>
            )}
          </div>
        </div>
      ) : (
        <div class="g-decor-foot">
          <button type="button" class="g-decor-reset-link" onClick={() => { a.resetCosmeticsDemo(); setDraft(DEFAULT_ROOM_DECOR); setNotice('Đã đặt lại trang trí & ví.'); }}>
            Đặt lại mặc định
          </button>
          <button type="button" class="g-decor-btn-done" onClick={a.closePanel}>Xong</button>
        </div>
      )}
    </aside>
  );
}
