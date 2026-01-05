// .envファイルを読み込む
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';
const envPath = resolve(process.cwd(), '.env');
const srcEnvPath = resolve(process.cwd(), 'src', '.env');
config({ path: existsSync(envPath) ? envPath : srcEnvPath });

import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// 年齢グループ
const AGE_GROUPS = ['20-29', '30-39', '40-49', '50-59', '60-70'];
// 性別
const GENDERS = ['male', 'female', 'other', 'prefer_not_to_say'];
// 都道府県
const PREFECTURES = [
  '東京都', '神奈川県', '埼玉県', '千葉県', '大阪府', '愛知県', '福岡県',
  '北海道', '宮城県', '新潟県', '静岡県', '京都府', '兵庫県', '広島県',
];

// SD法スコア生成（現実的な分布）
function generateSDScores(): Record<string, number> {
  return {
    quiet: Math.floor(Math.random() * 7) - 3, // -3 to 3
    pleasant: Math.floor(Math.random() * 7) - 3,
    premium: Math.floor(Math.random() * 7) - 3,
    modern: Math.floor(Math.random() * 7) - 3,
    powerful: Math.floor(Math.random() * 7) - 3,
    safe: Math.floor(Math.random() * 7) - 3,
    exciting: Math.floor(Math.random() * 7) - 3,
    natural: Math.floor(Math.random() * 7) - 3,
  };
}

// 購買意欲生成（正規分布に近い分布）
function generatePurchaseIntent(): number {
  // 1-7の範囲で、中央値（4）に近い値を生成しやすくする
  const rand = Math.random();
  if (rand < 0.15) return 1; // 15%: 全く購入したくない
  if (rand < 0.30) return 2; // 15%: あまり購入したくない
  if (rand < 0.45) return 3; // 15%: どちらでもない
  if (rand < 0.60) return 4; // 15%: やや購入したい
  if (rand < 0.75) return 5; // 15%: 購入したい
  if (rand < 0.90) return 6; // 15%: かなり購入したい
  return 7; // 10%: 非常に購入したい
}

// 追加支払可能額 (WTP) 生成
function generateWillingnessToPay(purchaseIntent: number): number {
  // 購買意欲に連動させる（意欲が高いほど金額も上がりやすくする）
  const base = purchaseIntent * 5000; // 5,000円〜35,000円
  const noise = Math.random() * 20000;
  const wtp = base + noise;

  const wtpOptions = [0, 10000, 30000, 50000, 100000, 200000, 300000];
  // 最も近い選択肢に丸める
  return wtpOptions.reduce((prev, curr) => 
    Math.abs(curr - wtp) < Math.abs(prev - wtp) ? curr : prev
  );
}

// 自由記述のサンプル
const FREE_TEXT_SAMPLES = [
  '低音が響いていて重厚感があった',
  'モーター音が心地よく、高級感を感じた',
  '静かで快適な印象',
  '高音が目立って耳障りだった',
  '人工的な音で違和感があった',
  '自然な音で馴染みやすい',
  '力強さを感じる音',
  '先進的な印象を受けた',
  null, // 30%は記述なし
  null,
  null,
];

// 最良・最悪理由のサンプル
const BEST_REASON_SAMPLES = [
  '低音が響いていて重厚感があり、高級感を感じた',
  'モーター音が心地よく、自然な印象だった',
  '静かで快適で、運転していて安心感がある',
  '力強さを感じる音で、パワー感がある',
  '先進的な印象で、未来を感じさせる',
  '音の質感が滑らかで、心地よい',
];

const WORST_REASON_SAMPLES = [
  '高音が目立って耳障りだった',
  '人工的な音で違和感があった',
  '音がうるさく、不快感がある',
  '弱々しい印象で、パワー感がない',
  '古臭い印象で、先進性を感じない',
  '音の質感がざらざらしていて不快',
];

// インタビュー回答のサンプル
const INTERVIEW_RESPONSES = [
  '走行音は車選びにおいて重要な要素だと思います。毎日使うものなので、音の質感は大切です',
  '自分らしさを表現する要素として、走行音は重要です',
  '通勤時に聞く音なので、心地よい音だと気分が良くなります',
  '逆に不快な音だと、購入を躊躇してしまいます',
  '将来のEVには、静粛性だけでなく、運転の楽しさを感じられる音を期待します',
  '既存の高級車のような重厚感のある音が理想です',
];

async function generateMockData(count: number = 200) {
  console.log(`🚀 ${count}名分の擬似データ生成を開始します...`);

  // 音声サンプルを取得
  const audioSamples = await prisma.audioSample.findMany({
    where: { isActive: true },
  });

  if (audioSamples.length < 2) {
    throw new Error('音声サンプルが不足しています。先にシードデータを投入してください。');
  }

  const audioSampleIds = audioSamples.map((s) => s.id);

  console.log(`📊 ${audioSamples.length}個の音声サンプルを使用します`);

  // バッチ処理でデータを生成
  const batchSize = 20;
  let createdCount = 0;

  for (let batch = 0; batch < Math.ceil(count / batchSize); batch++) {
    const batchData = [];
    const startIdx = batch * batchSize;
    const endIdx = Math.min(startIdx + batchSize, count);

    for (let i = startIdx; i < endIdx; i++) {
      const respondentId = uuidv4();
      const sessionId = uuidv4();
      const experimentGroup = Math.random() < 0.5 ? 'A' : 'B';
      const ageGroup = AGE_GROUPS[Math.floor(Math.random() * AGE_GROUPS.length)];
      const gender = GENDERS[Math.floor(Math.random() * GENDERS.length)];
      const prefecture = Math.random() < 0.8 
        ? PREFECTURES[Math.floor(Math.random() * PREFECTURES.length)]
        : null;
      const drivingExperience = Math.floor(Math.random() * 50); // 0-50年
      const evOwnership = Math.random() < 0.2; // 20%がEV所有
      const audioSensitivity = Math.floor(Math.random() * 5) + 1; // 1-5

      // 回答者データ
      const respondent = {
        id: respondentId,
        sessionId,
        experimentGroup,
        ageGroup,
        gender,
        prefecture,
        drivingExperience,
        evOwnership,
        audioSensitivity,
        consentGiven: true,
        headphoneCheck: true,
        completedAt: new Date(),
      };

      // 評価データ（各音声サンプルに対して）
      const evaluations = audioSampleIds.map((audioId, idx) => {
        const purchaseIntent = generatePurchaseIntent();
        return {
          respondentId,
          audioSampleId: audioId,
          presentationOrder: idx + 1,
          sdScores: generateSDScores(),
          purchaseIntent,
          willingnessToPay: generateWillingnessToPay(purchaseIntent),
          purchaseIntentConditions: {
            vehicleModel: 'Honda N-Box',
            price: '200万円',
            fuelEconomy: '20.0km/L',
            otherFactors: [
              '維持費（税金・保険料）の安さ',
              '先進安全装備（Honda SENSING）の充実',
              '室内空間の広さと使い勝手',
              'リセールバリュー（下取り価格）の高さ',
            ],
          },
          freeText: FREE_TEXT_SAMPLES[Math.floor(Math.random() * FREE_TEXT_SAMPLES.length)],
          responseTimeMs: Math.floor(Math.random() * 30000) + 10000, // 10-40秒
        };
      });

      // 最良・最悪音の選択（評価済みの音声から選択）
      const bestAudioId = audioSampleIds[Math.floor(Math.random() * audioSampleIds.length)];
      let worstAudioId = audioSampleIds[Math.floor(Math.random() * audioSampleIds.length)];
      // 最良と最悪が同じにならないように
      while (worstAudioId === bestAudioId && audioSampleIds.length > 1) {
        worstAudioId = audioSampleIds[Math.floor(Math.random() * audioSampleIds.length)];
      }

      const bestWorstComparison = {
        respondentId,
        bestAudioId,
        worstAudioId,
        bestReason: BEST_REASON_SAMPLES[Math.floor(Math.random() * BEST_REASON_SAMPLES.length)],
        worstReason: WORST_REASON_SAMPLES[Math.floor(Math.random() * WORST_REASON_SAMPLES.length)],
      };

      // コンストラクト（最良・最悪比較から）
      const construct = {
        respondentId,
        bestWorstComparisonId: null as string | null, // 後で設定
        constructText: `${bestWorstComparison.bestReason} / ${bestWorstComparison.worstReason}`,
        poleLeft: bestWorstComparison.worstReason,
        poleRight: bestWorstComparison.bestReason,
        ladderUp: [
          '高級感',
          '満足感',
          '自己実現',
        ],
        ladderDown: [
          '低音が響く',
          'モーター音が聞こえる',
        ],
        level: 'functional' as const,
      };

      // インタビューログ（各回答者あたり3-5件）
      const interviewCount = Math.floor(Math.random() * 3) + 3; // 3-5件
      const interviewLogs = Array.from({ length: interviewCount }, (_, idx) => ({
        respondentId,
        questionId: `q-${idx + 1}`,
        questionText: `質問${idx + 1}`,
        responseText: INTERVIEW_RESPONSES[Math.floor(Math.random() * INTERVIEW_RESPONSES.length)],
        sentimentScore: (Math.random() * 2) - 1, // -1 to 1
        keywords: ['走行音', 'EV', '購入'],
        depthLevel: idx,
        topic: idx === 0 ? 'favorite' : idx === 1 ? 'purchase' : 'ideal',
        responseTimeMs: Math.floor(Math.random() * 20000) + 5000, // 5-25秒
      }));

      batchData.push({
        respondent,
        evaluations,
        bestWorstComparison,
        construct,
        interviewLogs,
      });
    }

    // バッチでデータを投入
    for (const data of batchData) {
      // 回答者を作成
      const createdRespondent = await prisma.respondent.create({
        data: data.respondent,
      });

      // 評価データを作成
      await Promise.all(
        data.evaluations.map((evaluation) =>
          prisma.evaluation.create({ data: evaluation })
        )
      );

      // 最良・最悪比較を作成
      const createdComparison = await prisma.bestWorstComparison.create({
        data: data.bestWorstComparison,
      });

      // コンストラクトを作成（bestWorstComparisonIdを設定）
      await prisma.construct.create({
        data: {
          ...data.construct,
          bestWorstComparisonId: createdComparison.id,
        },
      });

      // インタビューログを作成
      await Promise.all(
        data.interviewLogs.map((log) =>
          prisma.interviewLog.create({ data: log })
        )
      );

      createdCount++;
      if (createdCount % 10 === 0) {
        console.log(`  ✅ ${createdCount}/${count}名のデータを生成しました...`);
      }
    }
  }

  console.log(`\n🎉 ${createdCount}名分の擬似データ生成が完了しました！`);
  console.log(`\n📊 生成されたデータ:`);
  console.log(`  - 回答者: ${createdCount}名`);
  console.log(`  - 評価データ: ${createdCount * audioSamples.length}件`);
  console.log(`  - 最良・最悪比較: ${createdCount}件`);
  console.log(`  - コンストラクト: ${createdCount}件`);
  console.log(`  - インタビューログ: 約${createdCount * 4}件`);
}

async function main() {
  const count = process.argv[2] ? parseInt(process.argv[2], 10) : 200;
  
  if (isNaN(count) || count <= 0) {
    console.error('❌ エラー: 有効な数値を指定してください');
    process.exit(1);
  }

  try {
    await generateMockData(count);
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

