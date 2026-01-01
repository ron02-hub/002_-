import type { InterviewMessage } from '@/types/survey';

export interface InterviewContext {
  previousAnswers: string[];
  currentTopic: string;
  depthLevel: number;
}

/**
 * 動的に次の質問を生成する
 */
export function generateNextQuestion(context: InterviewContext): string {
  const { previousAnswers, currentTopic, depthLevel } = context;

  const questionTemplates = {
    favorite: {
      opening: [
        '先ほど聴いていただいた走行音の中で、最も印象に残った音はどれでしたか？',
        'どの走行音が一番印象的でしたか？',
      ],
      why: [
        'その音のどこが印象に残りましたか？',
        'なぜその音が印象的だったのですか？',
        '具体的にどのような点が印象的でしたか？',
      ],
      feeling: [
        'その印象は、ポジティブでしたか、ネガティブでしたか？',
        'その印象について、どのように感じましたか？',
      ],
      importance: [
        'その{feeling}は、EVを選ぶときに重要だと思いますか？',
        '走行音の{feeling}は、購入決定に影響しますか？',
      ],
      deeper: [
        'なぜ{importance_reason}だと思いますか？',
        'その理由をもう少し詳しく教えていただけますか？',
      ],
    },
    purchase: {
      importance: [
        'もし新しいEVを購入するとしたら、走行音はどのくらい重要ですか？',
        'EV購入時に、走行音はどの程度考慮しますか？',
      ],
      scale: [
        '1から10で表すと、どのくらいの重要度ですか？',
        '重要度を10段階で評価すると？',
      ],
      comparison: [
        '他の要素（価格、航続距離など）と比べるとどうですか？',
        '走行音と他の要素を比較すると？',
      ],
    },
    ideal: {
      question: [
        'あなたにとって理想的なEV走行音とは、どんな音だと思いますか？',
        '理想の走行音を教えてください。',
      ],
      example: [
        '既存の車やその他の音で、イメージに近いものはありますか？',
        '似た音の例はありますか？',
      ],
    },
  };

  // トピックに応じた質問を選択
  const templates = questionTemplates[currentTopic as keyof typeof questionTemplates];
  if (!templates) {
    return '他に伝えたいことはありますか？';
  }

  // 深度レベルに応じて質問を選択
  if (depthLevel === 0) {
    return templates.opening?.[0] || 'どの走行音が印象的でしたか？';
  } else if (depthLevel === 1) {
    return templates.why?.[0] || 'なぜそう思いましたか？';
  } else if (depthLevel === 2) {
    return templates.importance?.[0] || 'それは重要だと思いますか？';
  } else {
    return templates.deeper?.[0] || 'もう少し詳しく教えてください。';
  }
}

/**
 * 回答から感情スコアを推定（簡易版）
 */
export function estimateSentiment(text: string): number {
  const positiveWords = ['良い', 'いい', '好き', '気に入った', '満足', '快適', '心地よい'];
  const negativeWords = ['悪い', '嫌い', '不快', '気に入らない', '不満', 'うるさい'];

  const lowerText = text.toLowerCase();
  let score = 0;

  positiveWords.forEach((word) => {
    if (lowerText.includes(word)) score += 0.2;
  });

  negativeWords.forEach((word) => {
    if (lowerText.includes(word)) score -= 0.2;
  });

  return Math.max(-1, Math.min(1, score));
}

/**
 * キーワードを抽出（簡易版）
 */
export function extractKeywords(text: string): string[] {
  // 実際の実装では形態素解析を使用
  const keywords: string[] = [];
  const commonWords = ['低音', '高音', '静か', 'うるさい', '重厚', '軽快', 'モーター', '音'];

  commonWords.forEach((word) => {
    if (text.includes(word)) {
      keywords.push(word);
    }
  });

  return keywords;
}

