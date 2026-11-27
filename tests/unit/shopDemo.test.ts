import { describe, expect, it } from 'vitest';
import {
  BLIND_BOX_CONFIG,
  isShopDemoEnabled,
  SHOP_DEMO_CONFIG,
  SHOP_DEMO_ITEMS,
  SHOP_NAV_TABS,
  TOPUP_PACKS,
} from '../../src/config/shopDemo';

describe('shopDemo config & catalog', () => {
  it('tắt ở production kể cả khi có ?shopdemo=1', () => {
    expect(SHOP_DEMO_CONFIG.enabled_in_production).toBe(false);
    expect(isShopDemoEnabled('production')).toBe(false);
    expect(isShopDemoEnabled('production', '?shopdemo=1')).toBe(false);
  });

  it('bật mặc định ở test và hỗ trợ ?shopdemo=0 / ?shopdemo=1', () => {
    expect(isShopDemoEnabled('test')).toBe(SHOP_DEMO_CONFIG.enabled_in_test);
    expect(isShopDemoEnabled('test', '?shopdemo=0')).toBe(false);
    expect(isShopDemoEnabled('test', '?shopdemo=1')).toBe(true);
  });

  it('đầy đủ mục cửa hàng, gói nạp và không chứa chữ demo hay [PLACEHOLDER]', () => {
    expect(SHOP_NAV_TABS.length).toBeGreaterThanOrEqual(5);
    expect(SHOP_DEMO_ITEMS.length).toBeGreaterThanOrEqual(12);
    expect(TOPUP_PACKS.length).toBeGreaterThanOrEqual(4);
    expect(BLIND_BOX_CONFIG.singleRoll.price).toBe(100);
    for (const item of SHOP_DEMO_ITEMS) {
      expect(item.id.length).toBeGreaterThan(0);
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.actionLabel.length).toBeGreaterThan(0);
    }
    const serialized = JSON.stringify({ SHOP_DEMO_CONFIG, SHOP_DEMO_ITEMS, TOPUP_PACKS, BLIND_BOX_CONFIG });
    expect(serialized).not.toContain('[PLACEHOLDER]');
    expect(serialized.toLowerCase()).not.toContain('demo minh họa');
  });
});
