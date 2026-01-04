import { NextResponse } from 'next/server';

/**
 * テスト用クイックスタートAPI
 * 
 * このエンドポイントは、テスト用にセッションを初期化し、
 * 同意と属性入力を自動的に設定します。
 * 
 * 使用方法:
 * ブラウザで /api/test/quick-start にアクセスすると、
 * 音声評価ページにリダイレクトされます。
 */
export async function GET(request: Request) {
  try {
    // テスト用のデータ
    const testConsent = {
      agreeTerms: true,
      agreeDataUsage: true,
      agreeAudioPlayback: true,
    };

    const testDemographics = {
      ageGroup: '30-39',
      gender: 'male',
      prefecture: '東京都',
      drivingExperience: 10,
      evOwnership: false,
      audioSensitivity: 3,
    };

    // リクエストのURLからベースURLを取得
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    // クエリパラメータとしてデータを渡す
    const params = new URLSearchParams({
      consent: JSON.stringify(testConsent),
      demographics: JSON.stringify(testDemographics),
    });

    // 音声評価ページにリダイレクト（クエリパラメータ付き）
    const redirectUrl = `${baseUrl}/survey/evaluation?test=true&${params.toString()}`;
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Quick start error:', error);
    return NextResponse.json(
      { error: 'クイックスタートの初期化に失敗しました' },
      { status: 500 }
    );
  }
}

