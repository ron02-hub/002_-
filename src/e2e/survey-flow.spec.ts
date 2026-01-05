import { test, expect } from '@playwright/test';

/**
 * アンケートフロー全体のE2Eテスト
 */
test.describe('アンケートフロー', () => {
  test('同意ページから音声評価ページまで進める', async ({ page }) => {
    // ランディングページから開始（テストモードを有効にする）
    await page.goto('/?test=true');
    await page.getByRole('button', { name: /アンケートを開始する/ }).click();

    // 同意ページ
    await expect(page).toHaveURL(/\/survey\/consent\?test=true/);
    
    // すべてのチェックボックスにチェック
    // Card全体がクリック可能なので、Cardをクリックするか、Labelをクリックする
    // または、Checkboxのbutton要素を直接クリック
    const checkboxIds = ['agreeTerms', 'agreeDataUsage', 'agreeAudioPlayback'];
    for (const id of checkboxIds) {
      // Labelをクリック（より確実）
      await page.locator(`label[for="${id}"]`).click();
      // 状態が更新されるまで少し待機
      await page.waitForTimeout(200);
    }
    
    // すべてのチェックボックスがチェックされるまで待機
    // ボタンが有効になるまで待つ
    const nextButton = page.getByRole('button', { name: /同意して次へ進む/ });
    await expect(nextButton).toBeEnabled({ timeout: 5000 });
    
    // 次へボタンをクリック（「同意して次へ進む」ボタン）
    await page.getByRole('button', { name: /同意して次へ進む/ }).click();

    // 属性入力ページ
    await expect(page).toHaveURL(/\/survey\/demographics\?test=true/);
    
    // 属性を入力
    // 年齢グループを選択（RadioGroupのLabelをクリック）
    // RadioGroupItemはsr-onlyなので、Labelを直接クリック
    // ラベルは「30代」なので、それで検索
    // htmlFor属性で検索する方が確実
    await page.locator('label[for="30-39"]').click();
    
    // 性別を選択（RadioGroupのLabelをクリック）
    await page.locator('label[for="male"]').click();
    
    // 都道府県を選択（Selectコンポーネント）
    // SelectTriggerをクリック
    await page.locator('button').filter({ hasText: /都道府県を選択/ }).or(page.locator('button').filter({ hasText: /お住まいの地域/ })).first().click();
    await page.waitForTimeout(300);
    // SelectContent内の「東京都」をクリック
    await page.getByRole('option', { name: /東京都/ }).click();
    
    // フォームが有効になるまで待機
    await page.waitForTimeout(500);
    
    // 次へボタンをクリック
    await page.getByRole('button', { name: /次へ/ }).click();

    // 音声チェックページ
    await expect(page).toHaveURL(/\/survey\/audio-check\?test=true/);
    
    // テストモードでは音声再生なしでRadioGroupが有効になっているはず
    // 猫の鳴き声を選択（正解）
    // RadioGroupItemをクリック（button要素）
    await page.locator('button[data-slot="radio-group-item"][id="cat"]').click();
    
    // 次へボタンをクリック
    await page.getByRole('button', { name: /音声評価を開始する/ }).click();

    // 音声評価ページに遷移したことを確認
    await expect(page).toHaveURL(/\/survey\/evaluation\?test=true/);
    await expect(page.getByText(/音声評価/)).toBeVisible();
  });

  test('音声チェックで間違った答えを選ぶと進めない', async ({ page }) => {
    // 音声チェックページに直接遷移（テストモードを有効にする）
    await page.goto('/survey/audio-check?test=true');
    
    // テストモードでは音声再生なしでRadioGroupが有効になっているはず
    // 間違った答え（犬の鳴き声）を選択
    await page.locator('button[data-slot="radio-group-item"][id="dog"]').click();
    
    // 次へボタンが無効になっていることを確認
    const nextButton = page.getByRole('button', { name: /音声評価を開始する/ });
    await expect(nextButton).toBeDisabled();
    
    // 正解（猫の鳴き声）を選択
    await page.locator('button[data-slot="radio-group-item"][id="cat"]').click();
    
    // 次へボタンが有効になったことを確認
    await expect(nextButton).toBeEnabled();
  });
});

