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
        '走行音は、あなたの車選びにおいて、どのくらい「自分らしさ」を表現する要素だと思いますか？',
        '先ほど選んでいただいた「最も良い音/悪い音」は、普段の運転シーンでどのような影響を与えそうですか？',
      ],
      why: [
        'その音が、毎日の通勤や週末のドライブで鳴っているところを想像してみてください。どんな気分になりますか？',
        '逆に、今の音のままだと、購入を躊躇してしまう決定的な理由はありますか？',
      ],
      deeper: [
        'その{feeling}は、EVを選ぶときに重要だと思いますか？',
        'なぜ{importance_reason}だと思いますか？',
      ],
    },
    purchase: {
      importance: [
        '走行音は、あなたの車選びにおいて、どのくらい「自分らしさ」を表現する要素だと思いますか？',
        'EV購入時に、走行音はどの程度考慮しますか？',
      ],
      scale: [
        'その音が、毎日の通勤や週末のドライブで鳴っているところを想像してみてください。どんな気分になりますか？',
        '逆に、今の音のままだと、購入を躊躇してしまう決定的な理由はありますか？',
      ],
      comparison: [
        '他の要素（価格、航続距離など）と比べるとどうですか？',
        '走行音と他の要素を比較すると？',
      ],
    },
    ideal: {
      question: [
        '将来のEVには、どんな「音の役割」を期待しますか？（例：単なる静粛性、運転の楽しさ、安心の合図など）',
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

  // 深度レベルに応じて質問を選択（短縮版：最大2問まで）
  if (depthLevel === 0) {
    return templates.opening?.[0] || '走行音について、どのように感じましたか？';
  } else if (depthLevel === 1) {
    return templates.why?.[0] || 'なぜそう思いましたか？';
  } else {
    // 深度レベル2以上は、より深い質問を1つだけ
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

