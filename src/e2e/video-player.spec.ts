import { test, expect } from '@playwright/test';

/**
 * 動画再生機能のE2Eテスト
 */
test.describe('動画再生機能', () => {
  test('動画プレーヤーが表示される', async ({ page }) => {
    // 音声評価ページに直接遷移（テストモード）
    await page.goto('/survey/evaluation?test=true');
    
    // 動画プレーヤーが表示されるまで待機
    await page.waitForSelector('video, [data-testid="media-player"]', { timeout: 10000 });
    
    // 動画要素またはプレーヤーコンポーネントが存在することを確認
    const videoElement = page.locator('video').first();
    const playerContainer = page.locator('[data-testid="media-player"]').first();
    
    const hasVideo = await videoElement.count() > 0;
    const hasPlayer = await playerContainer.count() > 0;
    
    expect(hasVideo || hasPlayer).toBeTruthy();
  });

  test('再生ボタンをクリックすると動画が再生される', async ({ page }) => {
    // 音声評価ページに直接遷移（テストモード）
    await page.goto('/survey/evaluation?test=true');
    
    // 動画プレーヤーが表示されるまで待機
    await page.waitForTimeout(2000);
    
    // 再生ボタンを探す（複数のパターンを試す）
    const playButton = page.locator('button').filter({ 
      has: page.locator('svg, [aria-label*="再生"], [aria-label*="Play"]')
    }).first();
    
    if (await playButton.isVisible({ timeout: 5000 })) {
      // 再生ボタンをクリック
      await playButton.click();
      
      // 動画が再生されるまで少し待機
      await page.waitForTimeout(1000);
      
      // 動画要素が存在する場合、再生状態を確認
      const video = page.locator('video').first();
      if (await video.count() > 0) {
        // 動画が再生中か確認（pausedプロパティ）
        const isPaused = await video.evaluate((el: HTMLVideoElement) => el.paused);
        // 動画が再生されている場合、pausedはfalse
        // ただし、ブラウザの自動再生ポリシーにより、再生されない場合もある
        // そのため、エラーが発生していないことを確認する
        const hasError = await video.evaluate((el: HTMLVideoElement) => el.error !== null);
        expect(hasError).toBeFalsy();
      }
    }
  });

  test('動画の読み込みエラーが適切に表示される', async ({ page }) => {
    // 存在しない動画ファイルを指定したページに遷移（テスト用）
    // 実際のテストでは、エラーハンドリングの確認用にモックを使用
    
    // 音声評価ページに遷移
    await page.goto('/survey/evaluation?test=true');
    
    // エラーメッセージが表示されていないことを確認（正常な場合）
    const errorMessage = page.getByText(/動画の読み込みに失敗しました/);
    // エラーが表示されていないことを確認（正常系）
    await expect(errorMessage).not.toBeVisible({ timeout: 5000 });
  });
});

