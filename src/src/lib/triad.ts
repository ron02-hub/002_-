import type { AudioSample } from '@/types/survey';

/**
 * トライアド（3音比較）を生成する
 * 各音声が均等に出現するよう調整
 */
export function generateTriads(
  audioSamples: AudioSample[],
  nTriads: number = 3
): Array<[AudioSample, AudioSample, AudioSample]> {
  if (audioSamples.length < 3) {
    throw new Error('音声サンプルは3つ以上必要です');
  }

  const triads: Array<[AudioSample, AudioSample, AudioSample]> = [];
  const appearanceCount = new Map<string, number>();

  // 初期化
  audioSamples.forEach((sample) => {
    appearanceCount.set(sample.id, 0);
  });

  // すべての組み合わせを生成
  const allCombinations: Array<[AudioSample, AudioSample, AudioSample]> = [];
  for (let i = 0; i < audioSamples.length; i++) {
    for (let j = i + 1; j < audioSamples.length; j++) {
      for (let k = j + 1; k < audioSamples.length; k++) {
        allCombinations.push([audioSamples[i], audioSamples[j], audioSamples[k]]);
      }
    }
  }

  // シャッフル
  const shuffled = [...allCombinations].sort(() => Math.random() - 0.5);

  // バランスを考慮して選択
  for (const triad of shuffled) {
    if (triads.length >= nTriads) break;

    // このトライアドに含まれる音声の出現回数をチェック
    const maxCount = Math.max(
      appearanceCount.get(triad[0].id) || 0,
      appearanceCount.get(triad[1].id) || 0,
      appearanceCount.get(triad[2].id) || 0
    );

    // 最大出現回数が2回未満なら選択
    if (maxCount < 2) {
      triads.push(triad);
      triad.forEach((sample) => {
        appearanceCount.set(sample.id, (appearanceCount.get(sample.id) || 0) + 1);
      });
    }
  }

  // まだ足りない場合は残りを追加
  if (triads.length < nTriads) {
    for (const triad of shuffled) {
      if (triads.length >= nTriads) break;
      if (!triads.some((t) => 
        t[0].id === triad[0].id && 
        t[1].id === triad[1].id && 
        t[2].id === triad[2].id
      )) {
        triads.push(triad);
      }
    }
  }

  return triads.slice(0, nTriads);
}

/**
 * ランダムにトライアドの順序をシャッフル
 */
export function shuffleTriadOrder<T>(triad: [T, T, T]): [T, T, T] {
  const shuffled = [...triad].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1], shuffled[2]] as [T, T, T];
}

