import { test, expect } from '@playwright/test';

/**
 * ランディングページのE2Eテスト
 */
test.describe('ランディングページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('ページが正しく表示される', async ({ page }) => {
    // タイトルを確認
    await expect(page).toHaveTitle(/EV走行音/);
    
    // 主要な要素が表示されているか確認
    await expect(page.getByRole('heading', { name: /EV走行音/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /アンケートを開始する/ })).toBeVisible();
  });

  test('「アンケートを開始する」ボタンをクリックすると同意ページに遷移する', async ({ page }) => {
    // ボタンをクリック
    await page.getByRole('button', { name: /アンケートを開始する/ }).click();
    
    // 同意ページに遷移したことを確認
    await expect(page).toHaveURL(/\/survey\/consent/);
    await expect(page.getByText(/調査への参加同意/)).toBeVisible();
  });

  test('特徴カードが表示されている', async ({ page }) => {
    // 特徴カードの要素を確認
    await expect(page.getByText(/所要時間/)).toBeVisible();
    await expect(page.getByText(/ヘッドホン推奨/)).toBeVisible();
    await expect(page.getByText(/個人情報保護/)).toBeVisible();
  });
});

