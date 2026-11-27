import { useState } from 'preact/hooks';
import {
  BLIND_BOX_CONFIG,
  COIN_EXCHANGE_PACKS,
  REWARDED_AD_OFFER,
  SHOP_DEMO_CONFIG,
  SHOP_DEMO_ITEMS,
  SHOP_NAV_TABS,
  SHOP_SECTION_HEADERS,
  TOPUP_PACKS,
  type ShopCurrencyType,
  type ShopNavId,
  type ShopStoreItem,
} from '../../../config/shopDemo';
import { playSfx } from '../../../game/sfx';
import { Pop } from '../overlays/NoticeModal';
import type { UiActions, UiState } from '../store';
import { CoinSvg, ItemArtSvg, ShopBagSvg, StampSvg, type ShopItemArtKind } from './shopIcons';

type NoticeModalState =
  | { kind: 'coming_soon'; art: ShopItemArtKind; title: string; subtitle: string }
  | { kind: 'topup_done'; art: ShopItemArtKind; title: string; subtitle: string }
  | { kind: 'shortage'; art: ShopItemArtKind; title: string; currency: 'coin' | 'stamp'; required: number; current: number };

function CurrencyBadge({ currency, price }: { currency: ShopCurrencyType; price: number }) {
  if (currency === 'free') return <span class="g-shop-price-pill is-free">Miễn phí</span>;
  return (
    <span class={`g-shop-price-pill is-${currency}`}>
      {currency === 'coin' ? <CoinSvg size={14} /> : <StampSvg size={14} />}
      <span>{price}</span>
    </span>
  );
}

function StoreSection({
  sectionKey,
  items,
  onSelect,
}: {
  sectionKey: keyof typeof SHOP_SECTION_HEADERS;
  items: readonly ShopStoreItem[];
  onSelect: (item: ShopStoreItem) => void;
}) {
  if (items.length === 0) return null;
  const head = SHOP_SECTION_HEADERS[sectionKey];
  return (
    <section class="g-shop-section" data-section={sectionKey}>
      <div class="g-shop-section-head">
        <div>
          <h3>{head.title}</h3>
          <p>{head.subtitle}</p>
        </div>
        <span class="g-shop-section-count">{items.length} mục</span>
      </div>
      <div class="g-shop-grid">
        {items.map((item) => (
          <article
            key={item.id}
            class={`g-shop-card ${item.featured ? 'is-featured' : ''}`}
            data-shop-item={item.id}
            onClick={() => onSelect(item)}
          >
            <div class={`g-shop-art tone-${item.section}`}>
              <ItemArtSvg kind={item.art} size={44} />
              <CurrencyBadge currency={item.currency} price={item.price} />
            </div>
            <div class="g-shop-card-body">
              <h4>{item.title}</h4>
              <span class="g-shop-target">{item.target}</span>
              <p class="g-shop-desc">{item.description}</p>
            </div>
            <button
              type="button"
              class="g-shop-action"
              data-act={`shop-item-${item.id}`}
              onClick={(e) => { e.stopPropagation(); onSelect(item); }}
            >
              {item.actionLabel}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ShopDemoPanel({ s, a }: { s: UiState; a: UiActions }) {
  const [nav, setNav] = useState<ShopNavId>('store');
  const [modal, setModal] = useState<NoticeModalState | null>(null);

  const { demo_wallet: walletLabels, ui, shortage_notice, coming_soon } = SHOP_DEMO_CONFIG;
  const wallet = {
    ...walletLabels,
    coin: s.cosmetics?.wallet.coin ?? walletLabels.coin,
    stamp: s.cosmetics?.wallet.stamp ?? walletLabels.stamp,
  };

  const tryPurchase = (
    art: ShopItemArtKind,
    title: string,
    subtitle: string,
    currency: ShopCurrencyType,
    price: number,
  ) => {
    playSfx('sfx_tick');
    if (currency === 'coin' && price > wallet.coin) {
      setModal({ kind: 'shortage', art, title, currency: 'coin', required: price, current: wallet.coin });
      return;
    }
    if (currency === 'stamp' && price > wallet.stamp) {
      setModal({ kind: 'shortage', art, title, currency: 'stamp', required: price, current: wallet.stamp });
      return;
    }
    setModal({ kind: 'coming_soon', art, title, subtitle });
  };

  const handleStoreItem = (item: ShopStoreItem) => {
    if (item.section === 'decor' && s.mode === 'hub') {
      playSfx('sfx_tick');
      a.openPanel('room_decor');
      return;
    }
    if (item.id === 'cos_01') {
      playSfx('sfx_tick');
      a.openPanel('wardrobe');
      return;
    }
    if (item.id === 'alb_01' && s.mode === 'hub') {
      playSfx('sfx_tick');
      a.openPanel('album');
      return;
    }
    const sub = item.currency === 'free'
      ? item.target
      : `${item.price} ${item.currency === 'coin' ? wallet.coin_label : wallet.stamp_label}`;
    tryPurchase(item.art, item.title, sub, item.currency, item.price);
  };

  const bySection = (sec: ShopStoreItem['section']) => SHOP_DEMO_ITEMS.filter((it) => it.section === sec);

  return (
    <>
      <Pop class="g-panel g-shop-shell" testid="panel-shop-demo">
        <header class="g-shop-head">
          <div class="g-shop-title-wrap">
            <div class="g-shop-title-row">
              <span class="g-shop-logo" aria-hidden="true"><ShopBagSvg size={20} /></span>
              <div>
                <h2>{ui.panel_title}</h2>
                <p class="g-shop-sub">{ui.panel_subtitle}</p>
              </div>
            </div>
          </div>
          <div class="g-shop-head-right">
            <div class="g-shop-wallet" aria-label="Số dư hiện có">
              <button
                type="button"
                class="g-wallet-pill coin"
                title={`${wallet.coin_label} — Bấm để đổi thêm Xu`}
                data-act="wallet-coin-topup"
                onClick={() => { playSfx('sfx_tick'); setNav('topup'); }}
              >
                <CoinSvg size={17} />
                <b>{wallet.coin}</b>
                <span class="g-wallet-plus" aria-hidden="true">+</span>
              </button>
              <button
                type="button"
                class="g-wallet-pill stamp"
                title={`${wallet.stamp_label} — Bấm để nạp thêm Tem`}
                data-act="wallet-stamp-topup"
                onClick={() => { playSfx('sfx_tick'); setNav('topup'); }}
              >
                <StampSvg size={17} />
                <b>{wallet.stamp}</b>
                <span class="g-wallet-plus" aria-hidden="true">+</span>
              </button>
            </div>
            <button type="button" class="g-shop-close" data-act="close" onClick={a.closePanel}>Đóng</button>
          </div>
        </header>

        <div class="g-shop-body">
          <nav class="g-shop-nav" aria-label="Danh mục Tiệm Ký Ức">
            {SHOP_NAV_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-current={nav === t.id ? 'page' : undefined}
                class={`g-shop-nav-btn ${nav === t.id ? 'on' : ''}`}
                data-act={`shop-tab-${t.id}`}
                onClick={() => setNav(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <div class="g-shop-content">
            {nav === 'store' && (
              <>
                <StoreSection sectionKey="decor" items={bySection('decor')} onSelect={handleStoreItem} />
                <StoreSection sectionKey="cosmetic" items={bySection('cosmetic')} onSelect={handleStoreItem} />
                <StoreSection sectionKey="utility" items={bySection('utility')} onSelect={handleStoreItem} />
                <StoreSection sectionKey="stories" items={bySection('stories')} onSelect={handleStoreItem} />
              </>
            )}

            {nav === 'blindbox' && (
              <section class="g-shop-section" data-section="blindbox">
                <div class="g-blindbox-hero">
                  <div class="g-blindbox-art">
                    <ItemArtSvg kind="blindbox" size={72} />
                  </div>
                  <div class="g-blindbox-info">
                    <span class="g-blindbox-tag">Quà Cổng Trường · 12 Thẻ Ký Ức</span>
                    <h3>{BLIND_BOX_CONFIG.title}</h3>
                    <p class="g-blindbox-sub">{BLIND_BOX_CONFIG.subtitle}</p>
                    <p class="g-blindbox-desc">{BLIND_BOX_CONFIG.description}</p>
                    <div class="g-blindbox-tags">
                      {BLIND_BOX_CONFIG.previewTags.map((tag) => (
                        <span key={tag} class="g-blindbox-chip">{tag}</span>
                      ))}
                    </div>
                    <div class="g-blindbox-actions">
                      <button
                        type="button"
                        class="g-roll-btn coin"
                        data-act="blindbox-roll-1"
                        onClick={() => tryPurchase(
                          'blindbox',
                          `${BLIND_BOX_CONFIG.title} (1 lượt)`,
                          `${BLIND_BOX_CONFIG.singleRoll.price} ${wallet.coin_label}`,
                          BLIND_BOX_CONFIG.singleRoll.currency,
                          BLIND_BOX_CONFIG.singleRoll.price,
                        )}
                      >
                        <span>{BLIND_BOX_CONFIG.singleRoll.label}</span>
                        <span class="g-roll-cost"><CoinSvg size={15} /> {BLIND_BOX_CONFIG.singleRoll.price}</span>
                      </button>
                      <button
                        type="button"
                        class="g-roll-btn stamp"
                        data-act="blindbox-roll-10"
                        onClick={() => tryPurchase(
                          'blindbox',
                          `${BLIND_BOX_CONFIG.title} (10 lượt)`,
                          `${BLIND_BOX_CONFIG.tenRoll.price} ${wallet.stamp_label}`,
                          BLIND_BOX_CONFIG.tenRoll.currency,
                          BLIND_BOX_CONFIG.tenRoll.price,
                        )}
                      >
                        <span>{BLIND_BOX_CONFIG.tenRoll.label}</span>
                        <span class="g-roll-cost"><StampSvg size={15} /> {BLIND_BOX_CONFIG.tenRoll.price}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {nav === 'utility' && (
              <StoreSection sectionKey="utility" items={bySection('utility')} onSelect={handleStoreItem} />
            )}

            {nav === 'stories' && (
              <StoreSection sectionKey="stories" items={bySection('stories')} onSelect={handleStoreItem} />
            )}

            {nav === 'upcoming' && (
              <StoreSection sectionKey="upcoming" items={bySection('upcoming')} onSelect={handleStoreItem} />
            )}

            {nav === 'topup' && (
              <>
                <section class="g-shop-section" data-section="topup-stamps">
                  <div class="g-shop-section-head">
                    <div>
                      <h3>Nạp Tem Thanh Xuân</h3>
                      <p>Nhận thưởng x2 cho gói nạp lần đầu · Dùng để mở không gian, ngoại truyện và trang phục</p>
                    </div>
                  </div>
                  <div class="g-topup-grid">
                    {TOPUP_PACKS.map((pack) => (
                      <article
                        key={pack.id}
                        class={`g-topup-card ${pack.isPass ? 'is-pass' : ''}`}
                        data-topup-pack={pack.id}
                        onClick={() => {
                          playSfx('sfx_tick');
                          a.topupWallet('stamp', pack.stampAmount);
                          setModal({
                            kind: 'topup_done',
                            art: pack.isPass ? 'pass' : 'diary_chau',
                            title: `Đã nhận +${pack.stampAmount} ${wallet.stamp_label}`,
                            subtitle: `${pack.title} · ${pack.priceVnd}`,
                          });
                        }}
                      >
                        {pack.badge && <span class="g-topup-badge">{pack.badge}</span>}
                        <div class="g-topup-amount">
                          {pack.isPass ? <ItemArtSvg kind="pass" size={34} /> : <StampSvg size={28} />}
                          <b>+{pack.stampAmount}</b>
                          <small>Tem</small>
                        </div>
                        <h4>{pack.title}</h4>
                        <p class="g-topup-bonus">{pack.bonusLabel}</p>
                        <button type="button" class="g-topup-btn" data-act={`topup-${pack.id}`}>
                          {pack.priceVnd}
                        </button>
                      </article>
                    ))}
                  </div>
                </section>

                <section class="g-shop-section" data-section="topup-coins">
                  <div class="g-shop-section-head">
                    <div>
                      <h3>Đổi Xu Kỷ Niệm & Nhận Xu Miễn Phí</h3>
                      <p>Quy đổi từ Tem Thanh Xuân hoặc xem quảng cáo ngắn tại tiệm tạp hóa</p>
                    </div>
                  </div>
                  <div class="g-exchange-grid">
                    {COIN_EXCHANGE_PACKS.map((ex) => (
                      <article
                        key={ex.id}
                        class="g-exchange-card"
                        onClick={() => {
                          if (wallet.stamp < ex.costStamp) {
                            tryPurchase('snack', ex.title, `${ex.costStamp} ${wallet.stamp_label}`, 'stamp', ex.costStamp);
                            return;
                          }
                          playSfx('sfx_tick');
                          if (a.unlockCosmetic(`ex_${Date.now()}`, 'stamp', ex.costStamp)) {
                            a.topupWallet('coin', ex.coinAmount);
                            setModal({
                              kind: 'topup_done',
                              art: 'snack',
                              title: `Đã đổi +${ex.coinAmount} ${wallet.coin_label}`,
                              subtitle: `Sử dụng ${ex.costStamp} ${wallet.stamp_label}`,
                            });
                          }
                        }}
                      >
                        <div class="g-exchange-left">
                          <CoinSvg size={28} />
                          <div>
                            <div class="g-exchange-title-row">
                              <h4>{ex.title}</h4>
                              {ex.badge && <span class="g-exchange-badge">{ex.badge}</span>}
                            </div>
                            <small>Đổi bằng {wallet.stamp_label}</small>
                          </div>
                        </div>
                        <button type="button" class="g-exchange-btn">
                          <StampSvg size={14} /> {ex.costStamp}
                        </button>
                      </article>
                    ))}

                    <article
                      class="g-exchange-card is-ad"
                      onClick={() => {
                        playSfx('sfx_tick');
                        a.topupWallet('coin', REWARDED_AD_OFFER.rewardCoin);
                        setModal({
                          kind: 'topup_done',
                          art: 'ads',
                          title: `Đã nhận +${REWARDED_AD_OFFER.rewardCoin} ${wallet.coin_label}`,
                          subtitle: REWARDED_AD_OFFER.title,
                        });
                      }}
                    >
                      <div class="g-exchange-left">
                        <ItemArtSvg kind="ads" size={32} />
                        <div>
                          <h4>{REWARDED_AD_OFFER.title}</h4>
                          <small>{REWARDED_AD_OFFER.description}</small>
                        </div>
                      </div>
                      <button type="button" class="g-exchange-btn is-ad">
                        {REWARDED_AD_OFFER.actionLabel}
                      </button>
                    </article>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </Pop>

      {modal && (
        <div
          class="g-shop-soon-backdrop"
          data-testid={modal.kind === 'shortage' ? 'shop-insufficient-modal' : 'shop-demo-coming-soon'}
          onClick={() => setModal(null)}
        >
          <div class="g-shop-soon-modal" onClick={(e) => e.stopPropagation()}>
            {modal.kind === 'shortage' ? (
              <>
                <span class="g-shop-soon-badge is-warn">
                  {modal.currency === 'stamp' ? shortage_notice.title_stamp : shortage_notice.title_coin}
                </span>
                <div class="g-shop-soon-item">
                  <ItemArtSvg kind={modal.art} size={38} />
                  <div>
                    <h3>{modal.title}</h3>
                    <small class="g-shortage-line">
                      Cần <b>{modal.required}</b> {modal.currency === 'stamp' ? wallet.stamp_label : wallet.coin_label}
                      {' · '}Còn thiếu <b>{modal.required - modal.current}</b>
                    </small>
                  </div>
                </div>
                <p>
                  {modal.currency === 'stamp'
                    ? `Số dư hiện tại của bạn là ${modal.current} ${wallet.stamp_label}. Bạn có muốn nạp thêm Tem để sở hữu vật phẩm này không?`
                    : `Số dư hiện tại của bạn là ${modal.current} ${wallet.coin_label}. Bạn có thể đổi từ Tem Thanh Xuân hoặc xem quảng cáo nhận thêm Xu.`}
                </p>
                <div class="g-row">
                  <button type="button" data-act="close-shortage" onClick={() => setModal(null)}>
                    {shortage_notice.cta_later}
                  </button>
                  <button
                    type="button"
                    class="primary"
                    data-act="go-topup"
                    onClick={() => {
                      setModal(null);
                      setNav('topup');
                    }}
                  >
                    {modal.currency === 'stamp' ? shortage_notice.cta_topup_stamp : shortage_notice.cta_topup_coin}
                  </button>
                </div>
              </>
            ) : modal.kind === 'topup_done' ? (
              <>
                <span class="g-shop-soon-badge" style={{ background: '#2b7a42', color: '#fff' }}>Giao dịch hoàn tất</span>
                <div class="g-shop-soon-item">
                  <ItemArtSvg kind={modal.art} size={38} />
                  <div>
                    <h3>{modal.title}</h3>
                    <small>{modal.subtitle}</small>
                  </div>
                </div>
                <p>Số dư mới của bạn đã được cập nhật. Bạn có thể dùng ngay để mở khóa vật phẩm trong Tủ Đồ, Trang Trí Phòng hoặc Album!</p>
                <button
                  type="button"
                  class="primary"
                  data-act="close-topup-done"
                  onClick={() => setModal(null)}
                >
                  Tuyệt vời
                </button>
              </>
            ) : (
              <>
                <span class="g-shop-soon-badge">{coming_soon.badge}</span>
                <div class="g-shop-soon-item">
                  <ItemArtSvg kind={modal.art} size={38} />
                  <div>
                    <h3>{modal.title}</h3>
                    <small>{modal.subtitle}</small>
                  </div>
                </div>
                <h4>{coming_soon.title}</h4>
                <p>{coming_soon.body}</p>
                <button
                  type="button"
                  class="primary"
                  data-act="close-coming-soon"
                  onClick={() => setModal(null)}
                >
                  {coming_soon.confirm_label}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
