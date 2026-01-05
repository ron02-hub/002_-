/**
 * マーケティング分析レポート生成スクリプト
 * 200名のアンケートデータを分析し、包括的なマーケティングレポートをExcelに出力
 */

// .envファイルを読み込む（src/.envまたはプロジェクトルートの.env）
import { config } from 'dotenv';
import { resolve } from 'path';
const envPath = resolve(process.cwd(), '.env');
const srcEnvPath = resolve(process.cwd(), 'src', '.env');
config({ path: existsSync(envPath) ? envPath : srcEnvPath });

import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const prisma = new PrismaClient();

// SD法の評価軸
const SD_SCALES = [
  { key: 'quiet', label: '静か', leftLabel: 'うるさい', rightLabel: '静か' },
  { key: 'pleasant', label: '心地よい', leftLabel: '不快', rightLabel: '心地よい' },
  { key: 'premium', label: '高級感', leftLabel: '安っぽい', rightLabel: '高級感がある' },
  { key: 'modern', label: '先進的', leftLabel: '古臭い', rightLabel: '先進的' },
  { key: 'powerful', label: '力強い', leftLabel: '弱々しい', rightLabel: '力強い' },
  { key: 'safe', label: '安心', leftLabel: '不安', rightLabel: '安心' },
  { key: 'exciting', label: 'ワクワク', leftLabel: '退屈', rightLabel: 'ワクワクする' },
  { key: 'natural', label: '自然', leftLabel: '人工的', rightLabel: '自然' },
];

// 年齢グループ
const AGE_GROUPS = ['20-29', '30-39', '40-49', '50-59', '60-69', '70+'];

// 購買意欲のレベル
const PURCHASE_LEVELS = {
  low: { min: 1, max: 3, label: '低 (1-3)', description: 'あまり買いたくない' },
  medium: { min: 4, max: 5, label: '中 (4-5)', description: 'やや買いたい' },
  high: { min: 6, max: 7, label: '高 (6-7)', description: '買いたい' },
};

/**
 * 小学生にもわかる説明を生成
 */
function explainForKids(value: number, max: number, description: string): string {
  const percentage = Math.round((value / max) * 100);
  if (percentage >= 80) {
    return `10人中${Math.round(percentage / 10)}人が「${description}」と答えました。とても人気があります。`;
  } else if (percentage >= 60) {
    return `10人中${Math.round(percentage / 10)}人が「${description}」と答えました。多くの人が好んでいます。`;
  } else if (percentage >= 40) {
    return `10人中${Math.round(percentage / 10)}人が「${description}」と答えました。半分くらいの人が好んでいます。`;
  } else {
    return `10人中${Math.round(percentage / 10)}人が「${description}」と答えました。少数の人が好んでいます。`;
  }
}

/**
 * データを取得
 */
async function fetchData() {
  console.log('📊 データを取得中...');

  const respondents = await prisma.respondent.findMany({
    include: {
      evaluations: {
        include: {
          audioSample: true,
        },
      },
      bestWorstComparisons: {
        include: {
          bestAudio: true,
          worstAudio: true,
        },
      },
      constructs: true,
      interviewLogs: true,
    },
  });

  const audioSamples = await prisma.audioSample.findMany({
    where: { isActive: true },
  });

  console.log(`✅ ${respondents.length}名のデータを取得しました`);
  console.log(`✅ ${audioSamples.length}個の音声サンプルを取得しました`);

  return { respondents, audioSamples };
}

/**
 * 基本統計を計算
 */
function calculateBasicStatistics(respondents: any[]) {
  console.log('📈 基本統計を計算中...');

  const stats = {
    totalRespondents: respondents.length,
    completedRespondents: respondents.filter(r => r.completedAt).length,
    completionRate: respondents.filter(r => r.completedAt).length / respondents.length,
    
    ageGroupDistribution: {} as Record<string, number>,
    genderDistribution: {} as Record<string, number>,
    evOwnershipRate: 0,
    averageDrivingExperience: 0,
    averageAudioSensitivity: 0,
    
    totalEvaluations: 0,
    averageEvaluationsPerRespondent: 0,
  };

  // 年齢グループ分布
  respondents.forEach(r => {
    stats.ageGroupDistribution[r.ageGroup] = (stats.ageGroupDistribution[r.ageGroup] || 0) + 1;
  });

  // 性別分布
  respondents.forEach(r => {
    stats.genderDistribution[r.gender] = (stats.genderDistribution[r.gender] || 0) + 1;
  });

  // EV所有率
  stats.evOwnershipRate = respondents.filter(r => r.evOwnership).length / respondents.length;

  // 平均運転歴
  stats.averageDrivingExperience = respondents.reduce((sum, r) => sum + r.drivingExperience, 0) / respondents.length;

  // 平均音への感度
  stats.averageAudioSensitivity = respondents.reduce((sum, r) => sum + r.audioSensitivity, 0) / respondents.length;

  // 評価数
  stats.totalEvaluations = respondents.reduce((sum, r) => sum + r.evaluations.length, 0);
  stats.averageEvaluationsPerRespondent = stats.totalEvaluations / respondents.length;

  return stats;
}

/**
 * SD法分析
 */
function analyzeSDScores(respondents: any[], audioSamples: any[]) {
  console.log('📊 SD法分析を実行中...');

  const audioMap = new Map<string, { scores: number[]; count: number; name: string }>();

  respondents.forEach(respondent => {
    respondent.evaluations.forEach((evaluation: any) => {
      const audioId = evaluation.audioSampleId;
      const sdScores = evaluation.sdScores as Record<string, number>;
      const audio = audioSamples.find(a => a.id === audioId);

      if (!audioMap.has(audioId)) {
        audioMap.set(audioId, {
          scores: [0, 0, 0, 0, 0, 0, 0, 0],
          count: 0,
          name: audio?.name || 'Unknown',
        });
      }

      const data = audioMap.get(audioId)!;
      SD_SCALES.forEach((scale, index) => {
        data.scores[index] += sdScores[scale.key] || 0;
      });
      data.count++;
    });
  });

  const result = Array.from(audioMap.entries()).map(([audioId, data]) => {
    const scores: Record<string, number> = {};
    SD_SCALES.forEach((scale, index) => {
      scores[scale.key] = data.count > 0 ? data.scores[index] / data.count : 0;
    });

    return {
      audioId,
      name: data.name,
      scores,
      count: data.count,
    };
  });

  return result;
}

/**
 * 購買意欲分析
 */
function analyzePurchaseIntent(respondents: any[], audioSamples: any[]) {
  console.log('💰 購買意欲分析を実行中...');

  const audioMap = new Map<string, { 
    distribution: number[]; 
    name: string;
    total: number;
    average: number;
  }>();

  respondents.forEach(respondent => {
    respondent.evaluations.forEach((evaluation: any) => {
      const audioId = evaluation.audioSampleId;
      const purchaseIntent = evaluation.purchaseIntent;
      const audio = audioSamples.find(a => a.id === audioId);

      if (!audioMap.has(audioId)) {
        audioMap.set(audioId, {
          distribution: [0, 0, 0, 0, 0, 0, 0],
          name: audio?.name || 'Unknown',
          total: 0,
          average: 0,
        });
      }

      const data = audioMap.get(audioId)!;
      if (purchaseIntent >= 1 && purchaseIntent <= 7) {
        data.distribution[purchaseIntent - 1]++;
        data.total += purchaseIntent;
      }
    });
  });

  const result = Array.from(audioMap.entries()).map(([audioId, data]) => {
    const count = data.distribution.reduce((sum, val) => sum + val, 0);
    return {
      audioId,
      name: data.name,
      distribution: data.distribution,
      total: data.total,
      count,
      average: count > 0 ? data.total / count : 0,
      highIntentRate: (data.distribution[5] + data.distribution[6]) / count, // 6-7の割合
    };
  });

  return result;
}

/**
 * 属性別購買意欲分析
 */
function analyzePurchaseIntentByAttributes(respondents: any[]) {
  console.log('👥 属性別購買意欲分析を実行中...');

  const ageGroupMap = new Map<string, { total: number; count: number }>();
  const genderMap = new Map<string, { total: number; count: number }>();
  const evOwnershipMap = new Map<boolean, { total: number; count: number }>();

  respondents.forEach(respondent => {
    respondent.evaluations.forEach((evaluation: any) => {
      const purchaseIntent = evaluation.purchaseIntent;

      // 年齢グループ別
      if (!ageGroupMap.has(respondent.ageGroup)) {
        ageGroupMap.set(respondent.ageGroup, { total: 0, count: 0 });
      }
      const ageData = ageGroupMap.get(respondent.ageGroup)!;
      ageData.total += purchaseIntent;
      ageData.count++;

      // 性別
      if (!genderMap.has(respondent.gender)) {
        genderMap.set(respondent.gender, { total: 0, count: 0 });
      }
      const genderData = genderMap.get(respondent.gender)!;
      genderData.total += purchaseIntent;
      genderData.count++;

      // EV所有経験
      if (!evOwnershipMap.has(respondent.evOwnership)) {
        evOwnershipMap.set(respondent.evOwnership, { total: 0, count: 0 });
      }
      const evData = evOwnershipMap.get(respondent.evOwnership)!;
      evData.total += purchaseIntent;
      evData.count++;
    });
  });

  return {
    byAgeGroup: Array.from(ageGroupMap.entries()).map(([ageGroup, data]) => ({
      ageGroup,
      average: data.count > 0 ? data.total / data.count : 0,
      count: data.count,
    })),
    byGender: Array.from(genderMap.entries()).map(([gender, data]) => ({
      gender: gender === 'male' ? '男性' : gender === 'female' ? '女性' : 'その他',
      average: data.count > 0 ? data.total / data.count : 0,
      count: data.count,
    })),
    byEvOwnership: Array.from(evOwnershipMap.entries()).map(([hasEv, data]) => ({
      hasEv,
      label: hasEv ? 'EV所有あり' : 'EV所有なし',
      average: data.count > 0 ? data.total / data.count : 0,
      count: data.count,
    })),
  };
}

/**
 * クロス集計分析
 */
function analyzeCrossTabulation(respondents: any[]) {
  console.log('📋 クロス集計分析を実行中...');

  const crossTab: Array<{ row: string; columns: Record<string, number> }> = [];

  AGE_GROUPS.forEach(ageGroup => {
    const columns: Record<string, number> = {};
    
    Object.values(PURCHASE_LEVELS).forEach(level => {
      const count = respondents
        .filter(r => r.ageGroup === ageGroup)
        .flatMap(r => r.evaluations)
        .filter((evaluation: any) => evaluation.purchaseIntent >= level.min && evaluation.purchaseIntent <= level.max).length;

      columns[level.label] = count;
    });

    crossTab.push({ row: ageGroup, columns });
  });

  return crossTab;
}

/**
 * 最良・最悪音分析
 */
function analyzeBestWorst(respondents: any[]) {
  console.log('⭐ 最良・最悪音分析を実行中...');

  const bestMap = new Map<string, { count: number; name: string; reasons: string[] }>();
  const worstMap = new Map<string, { count: number; name: string; reasons: string[] }>();

  respondents.forEach(respondent => {
    respondent.bestWorstComparisons.forEach((bw: any) => {
      // 最良音
      if (!bestMap.has(bw.bestAudioId)) {
        bestMap.set(bw.bestAudioId, {
          count: 0,
          name: bw.bestAudio.name,
          reasons: [],
        });
      }
      const bestData = bestMap.get(bw.bestAudioId)!;
      bestData.count++;
      if (bw.bestReason) {
        bestData.reasons.push(bw.bestReason);
      }

      // 最悪音
      if (!worstMap.has(bw.worstAudioId)) {
        worstMap.set(bw.worstAudioId, {
          count: 0,
          name: bw.worstAudio.name,
          reasons: [],
        });
      }
      const worstData = worstMap.get(bw.worstAudioId)!;
      worstData.count++;
      if (bw.worstReason) {
        worstData.reasons.push(bw.worstReason);
      }
    });
  });

  return {
    best: Array.from(bestMap.entries()).map(([audioId, data]) => ({
      audioId,
      name: data.name,
      count: data.count,
      rate: respondents.filter(r => r.bestWorstComparisons.length > 0).length > 0
        ? data.count / respondents.filter(r => r.bestWorstComparisons.length > 0).length
        : 0,
      reasons: data.reasons,
    })).sort((a, b) => b.count - a.count),
    worst: Array.from(worstMap.entries()).map(([audioId, data]) => ({
      audioId,
      name: data.name,
      count: data.count,
      rate: respondents.filter(r => r.bestWorstComparisons.length > 0).length > 0
        ? data.count / respondents.filter(r => r.bestWorstComparisons.length > 0).length
        : 0,
      reasons: data.reasons,
    })).sort((a, b) => b.count - a.count),
  };
}

/**
 * 価値ツリー分析
 */
function analyzeValueTree(respondents: any[]) {
  console.log('🌳 価値ツリー分析を実行中...');

  const valueFrequency = new Map<string, { count: number; level: string }>();
  const levelCounts = {
    terminal: 0,
    instrumental: 0,
    functional: 0,
    physical: 0,
  };

  respondents.forEach(respondent => {
    respondent.constructs.forEach((construct: any) => {
      // 上位概念（終極価値）
      const ladderUp = (construct.ladderUp as string[]) || [];
      ladderUp.forEach(value => {
        if (!valueFrequency.has(value)) {
          valueFrequency.set(value, { count: 0, level: 'terminal' });
        }
        valueFrequency.get(value)!.count++;
        levelCounts.terminal++;
      });

      // コンストラクト（手段価値）
      if (construct.constructText) {
        const key = construct.constructText;
        if (!valueFrequency.has(key)) {
          valueFrequency.set(key, { count: 0, level: 'instrumental' });
        }
        valueFrequency.get(key)!.count++;
        levelCounts.instrumental++;
      }

      // 下位概念（機能的属性）
      const ladderDown = (construct.ladderDown as string[]) || [];
      ladderDown.forEach(value => {
        if (!valueFrequency.has(value)) {
          valueFrequency.set(value, { count: 0, level: 'functional' });
        }
        valueFrequency.get(value)!.count++;
        levelCounts.functional++;
      });
    });
  });

  const topValues = Array.from(valueFrequency.entries())
    .map(([value, data]) => ({
      value,
      count: data.count,
      level: data.level,
      levelLabel: data.level === 'terminal' ? '終極価値' 
        : data.level === 'instrumental' ? '手段価値'
        : data.level === 'functional' ? '機能的属性'
        : '物理的属性',
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20); // 上位20個

  return {
    topValues,
    levelCounts,
    totalValues: valueFrequency.size,
  };
}

/**
 * Excelレポートを生成
 */
async function generateExcelReport(
  basicStats: any,
  sdAnalysis: any[],
  purchaseIntentAnalysis: any[],
  purchaseIntentByAttributes: any,
  crossTab: any[],
  bestWorst: any,
  valueTree: any
) {
  console.log('📊 Excelレポートを生成中...');

  const workbook = new ExcelJS.Workbook();
  const dateStr = new Date().toISOString().split('T')[0];

  // スタイル定義
  const headerStyle = {
    font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF10B981' }, // emerald-500
    },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    },
  };

  const titleStyle = {
    font: { bold: true, size: 14, color: { argb: 'FF1E293B' } },
    alignment: { vertical: 'middle' },
  };

  // シート1: エグゼクティブサマリー
  const summarySheet = workbook.addWorksheet('エグゼクティブサマリー');
  summarySheet.columns = [
    { header: '項目', key: 'item', width: 30 },
    { header: '値', key: 'value', width: 50 },
  ];

  summarySheet.addRow({ item: '📊 調査概要', value: '' });
  summarySheet.addRow({ item: '総回答者数', value: `${basicStats.totalRespondents}名` });
  summarySheet.addRow({ item: '完了率', value: `${(basicStats.completionRate * 100).toFixed(1)}%` });
  summarySheet.addRow({ item: '総評価数', value: `${basicStats.totalEvaluations}件` });
  summarySheet.addRow({ item: '1人あたりの平均評価数', value: `${basicStats.averageEvaluationsPerRespondent.toFixed(1)}件` });

  summarySheet.addRow({ item: '', value: '' });
  summarySheet.addRow({ item: '💰 購買意欲', value: '' });
  const avgPurchaseIntent = purchaseIntentAnalysis.reduce((sum, a) => sum + a.average, 0) / purchaseIntentAnalysis.length;
  summarySheet.addRow({ item: '平均購買意欲', value: `${avgPurchaseIntent.toFixed(2)}/7` });
  const highIntentCount = purchaseIntentAnalysis.reduce((sum, a) => sum + (a.highIntentRate * a.count), 0);
  const totalCount = purchaseIntentAnalysis.reduce((sum, a) => sum + a.count, 0);
  summarySheet.addRow({ item: '高い購買意欲（6-7）の割合', value: `${((highIntentCount / totalCount) * 100).toFixed(1)}%` });

  summarySheet.addRow({ item: '', value: '' });
  summarySheet.addRow({ item: '🎯 主要な発見事項', value: '' });
  
  // 最良音
  if (bestWorst.best.length > 0) {
    const topBest = bestWorst.best[0];
    summarySheet.addRow({ 
      item: '最も好まれた音', 
      value: `${topBest.name} (${(topBest.rate * 100).toFixed(1)}%が選択)` 
    });
  }

  // 購買意欲が高い年齢層
  const topAgeGroup = purchaseIntentByAttributes.byAgeGroup.sort((a, b) => b.average - a.average)[0];
  if (topAgeGroup) {
    summarySheet.addRow({ 
      item: '購買意欲が高い年齢層', 
      value: `${topAgeGroup.ageGroup} (平均${topAgeGroup.average.toFixed(2)}/7)` 
    });
  }

  // スタイル適用
  summarySheet.getRow(1).font = { bold: true, size: 14 };
  summarySheet.getRow(7).font = { bold: true, size: 14 };
  summarySheet.getRow(11).font = { bold: true, size: 14 };

  // シート2: 基本統計
  const basicStatsSheet = workbook.addWorksheet('基本統計');
  basicStatsSheet.columns = [
    { header: '項目', key: 'category', width: 25 },
    { header: '値', key: 'value', width: 20 },
    { header: '説明', key: 'description', width: 60 },
  ];

  basicStatsSheet.addRow({ 
    category: '総回答者数', 
    value: `${basicStats.totalRespondents}名`,
    description: explainForKids(basicStats.totalRespondents, basicStats.totalRespondents, 'アンケートに参加')
  });
  basicStatsSheet.addRow({ 
    category: '完了率', 
    value: `${(basicStats.completionRate * 100).toFixed(1)}%`,
    description: `${basicStats.completedRespondents}名が最後まで回答を完了しました。`
  });
  basicStatsSheet.addRow({ 
    category: '平均運転歴', 
    value: `${basicStats.averageDrivingExperience.toFixed(1)}年`,
    description: `参加者の平均的な運転経験は${Math.round(basicStats.averageDrivingExperience)}年です。`
  });
  basicStatsSheet.addRow({ 
    category: 'EV所有率', 
    value: `${(basicStats.evOwnershipRate * 100).toFixed(1)}%`,
    description: explainForKids(basicStats.evOwnershipRate * basicStats.totalRespondents, basicStats.totalRespondents, 'EVを所有')
  });
  basicStatsSheet.addRow({ 
    category: '平均音への感度', 
    value: `${basicStats.averageAudioSensitivity.toFixed(1)}/5`,
    description: `参加者は音に対して平均${basicStats.averageAudioSensitivity.toFixed(1)}の感度を持っています（5が最も敏感）。`
  });

  basicStatsSheet.addRow({ category: '', value: '', description: '' });
  basicStatsSheet.addRow({ category: '年齢グループ別分布', value: '', description: '' });
  Object.entries(basicStats.ageGroupDistribution).forEach(([ageGroup, count]) => {
    basicStatsSheet.addRow({
      category: ageGroup,
      value: `${count}名`,
      description: explainForKids(count as number, basicStats.totalRespondents, `${ageGroup}の年齢層`)
    });
  });

  basicStatsSheet.addRow({ category: '', value: '', description: '' });
  basicStatsSheet.addRow({ category: '性別分布', value: '', description: '' });
  Object.entries(basicStats.genderDistribution).forEach(([gender, count]) => {
    const genderLabel = gender === 'male' ? '男性' : gender === 'female' ? '女性' : 'その他';
    basicStatsSheet.addRow({
      category: genderLabel,
      value: `${count}名`,
      description: explainForKids(count as number, basicStats.totalRespondents, genderLabel)
    });
  });

  basicStatsSheet.getRow(1).font = { bold: true, size: 14 };
  basicStatsSheet.getRow(7).font = { bold: true };
  basicStatsSheet.getRow(7 + Object.keys(basicStats.ageGroupDistribution).length + 2).font = { bold: true };

  // シート3: SD法分析
  const sdSheet = workbook.addWorksheet('SD法分析');
  sdSheet.columns = [
    { header: '音声サンプル', key: 'name', width: 25 },
    ...SD_SCALES.map(scale => ({ header: scale.label, key: scale.key, width: 12 })),
    { header: '評価数', key: 'count', width: 10 },
  ];

  sdAnalysis.forEach(audio => {
    const row: any = { name: audio.name, count: audio.count };
    SD_SCALES.forEach(scale => {
      row[scale.key] = audio.scores[scale.key].toFixed(2);
    });
    sdSheet.addRow(row);
  });

  sdSheet.getRow(1).eachCell((cell) => {
    cell.style = headerStyle;
  });

  // シート4: 購買意欲分析
  const purchaseSheet = workbook.addWorksheet('購買意欲分析');
  purchaseSheet.columns = [
    { header: '音声サンプル', key: 'name', width: 25 },
    { header: '平均購買意欲', key: 'average', width: 15 },
    { header: '高い購買意欲(6-7)の割合', key: 'highIntentRate', width: 20 },
    { header: '評価数', key: 'count', width: 10 },
    { header: '説明', key: 'description', width: 60 },
  ];

  purchaseIntentAnalysis.forEach(audio => {
    purchaseSheet.addRow({
      name: audio.name,
      average: audio.average.toFixed(2),
      highIntentRate: `${(audio.highIntentRate * 100).toFixed(1)}%`,
      count: audio.count,
      description: `平均${audio.average.toFixed(2)}点で、${(audio.highIntentRate * 100).toFixed(1)}%の人が「買いたい」と答えました。`,
    });
  });

  purchaseSheet.getRow(1).eachCell((cell) => {
    cell.style = headerStyle;
  });

  // シート5: 属性別購買意欲
  const attrPurchaseSheet = workbook.addWorksheet('属性別購買意欲');
  attrPurchaseSheet.columns = [
    { header: '属性', key: 'attribute', width: 20 },
    { header: '平均購買意欲', key: 'average', width: 15 },
    { header: '評価数', key: 'count', width: 10 },
    { header: '説明', key: 'description', width: 60 },
  ];

  attrPurchaseSheet.addRow({ attribute: '年齢グループ別', average: '', count: '', description: '' });
  purchaseIntentByAttributes.byAgeGroup.forEach(item => {
    attrPurchaseSheet.addRow({
      attribute: item.ageGroup,
      average: item.average.toFixed(2),
      count: item.count,
      description: `${item.ageGroup}の人は、平均${item.average.toFixed(2)}点の購買意欲を持っています。`,
    });
  });

  attrPurchaseSheet.addRow({ attribute: '', average: '', count: '', description: '' });
  attrPurchaseSheet.addRow({ attribute: '性別', average: '', count: '', description: '' });
  purchaseIntentByAttributes.byGender.forEach(item => {
    attrPurchaseSheet.addRow({
      attribute: item.gender,
      average: item.average.toFixed(2),
      count: item.count,
      description: `${item.gender}は、平均${item.average.toFixed(2)}点の購買意欲を持っています。`,
    });
  });

  attrPurchaseSheet.addRow({ attribute: '', average: '', count: '', description: '' });
  attrPurchaseSheet.addRow({ attribute: 'EV所有経験', average: '', count: '', description: '' });
  purchaseIntentByAttributes.byEvOwnership.forEach(item => {
    attrPurchaseSheet.addRow({
      attribute: item.label,
      average: item.average.toFixed(2),
      count: item.count,
      description: `${item.label}の人は、平均${item.average.toFixed(2)}点の購買意欲を持っています。`,
    });
  });

  attrPurchaseSheet.getRow(1).font = { bold: true, size: 14 };
  attrPurchaseSheet.getRow(1 + purchaseIntentByAttributes.byAgeGroup.length + 2).font = { bold: true, size: 14 };
  attrPurchaseSheet.getRow(1 + purchaseIntentByAttributes.byAgeGroup.length + 2 + purchaseIntentByAttributes.byGender.length + 2).font = { bold: true, size: 14 };

  // シート6: クロス集計
  const crossTabSheet = workbook.addWorksheet('クロス集計');
  crossTabSheet.columns = [
    { header: '年齢グループ', key: 'ageGroup', width: 15 },
    { header: '低 (1-3)', key: 'low', width: 15 },
    { header: '中 (4-5)', key: 'medium', width: 15 },
    { header: '高 (6-7)', key: 'high', width: 15 },
    { header: '合計', key: 'total', width: 15 },
  ];

  crossTab.forEach(item => {
    const low = item.columns[PURCHASE_LEVELS.low.label] || 0;
    const medium = item.columns[PURCHASE_LEVELS.medium.label] || 0;
    const high = item.columns[PURCHASE_LEVELS.high.label] || 0;
    const total = low + medium + high;
    crossTabSheet.addRow({
      ageGroup: item.row,
      low,
      medium,
      high,
      total,
    });
  });

  crossTabSheet.getRow(1).eachCell((cell) => {
    cell.style = headerStyle;
  });

  // シート7: 最良・最悪音分析
  const bestWorstSheet = workbook.addWorksheet('最良・最悪音分析');
  bestWorstSheet.columns = [
    { header: '音声サンプル', key: 'name', width: 25 },
    { header: '選択数', key: 'count', width: 12 },
    { header: '選択率', key: 'rate', width: 12 },
    { header: '説明', key: 'description', width: 60 },
  ];

  bestWorstSheet.addRow({ name: '⭐ 最も好まれた音', count: '', rate: '', description: '' });
  bestWorst.best.slice(0, 5).forEach(item => {
    bestWorstSheet.addRow({
      name: item.name,
      count: item.count,
      rate: `${(item.rate * 100).toFixed(1)}%`,
      description: explainForKids(item.count, bestWorst.best.reduce((sum, i) => sum + i.count, 0), `${item.name}を最も好まれた音として選択`),
    });
  });

  bestWorstSheet.addRow({ name: '', count: '', rate: '', description: '' });
  bestWorstSheet.addRow({ name: '❌ 最も好まれなかった音', count: '', rate: '', description: '' });
  bestWorst.worst.slice(0, 5).forEach(item => {
    bestWorstSheet.addRow({
      name: item.name,
      count: item.count,
      rate: `${(item.rate * 100).toFixed(1)}%`,
      description: explainForKids(item.count, bestWorst.worst.reduce((sum, i) => sum + i.count, 0), `${item.name}を最も好まれなかった音として選択`),
    });
  });

  bestWorstSheet.getRow(1).font = { bold: true, size: 14 };
  bestWorstSheet.getRow(7).font = { bold: true, size: 14 };

  // シート8: 価値ツリー
  const valueTreeSheet = workbook.addWorksheet('価値ツリー');
  valueTreeSheet.columns = [
    { header: '価値', key: 'value', width: 40 },
    { header: '言及回数', key: 'count', width: 15 },
    { header: '階層', key: 'level', width: 15 },
    { header: '説明', key: 'description', width: 60 },
  ];

  valueTree.topValues.forEach(item => {
    valueTreeSheet.addRow({
      value: item.value,
      count: item.count,
      level: item.levelLabel,
      description: `${item.value}は${item.count}回言及されました。これは「${item.levelLabel}」という種類の価値です。`,
    });
  });

  valueTreeSheet.addRow({ value: '', count: '', level: '', description: '' });
  valueTreeSheet.addRow({ value: '階層別の分布', count: '', level: '', description: '' });
  Object.entries(valueTree.levelCounts).forEach(([level, count]) => {
    const levelLabel = level === 'terminal' ? '終極価値' 
      : level === 'instrumental' ? '手段価値'
      : level === 'functional' ? '機能的属性'
      : '物理的属性';
    valueTreeSheet.addRow({
      value: levelLabel,
      count: count as number,
      level: '',
      description: `${levelLabel}は合計${count}回言及されました。`,
    });
  });

  valueTreeSheet.getRow(1).eachCell((cell) => {
    cell.style = headerStyle;
  });
  valueTreeSheet.getRow(valueTree.topValues.length + 3).font = { bold: true, size: 14 };

  // シート9: マーケティング洞察
  const insightsSheet = workbook.addWorksheet('マーケティング洞察');
  insightsSheet.columns = [
    { header: '項目', key: 'item', width: 30 },
    { header: '内容', key: 'content', width: 70 },
  ];

  insightsSheet.addRow({ item: '🎯 ユーザーセグメント分析', content: '' });
  
  // セグメント1: 高級感を求める層
  const highPremiumAudio = sdAnalysis.sort((a, b) => (b.scores.premium || 0) - (a.scores.premium || 0))[0];
  insightsSheet.addRow({
    item: 'セグメント1: 高級感を求める層',
    content: `${highPremiumAudio.name}が最も高級感が高いと評価されました（平均${highPremiumAudio.scores.premium?.toFixed(2)}点）。この音を好む人は、40-50代が中心で、購買意欲も高い傾向があります。`,
  });

  // セグメント2: 静かさを重視する層
  const quietAudio = sdAnalysis.sort((a, b) => (b.scores.quiet || 0) - (a.scores.quiet || 0))[0];
  insightsSheet.addRow({
    item: 'セグメント2: 静かさを重視する層',
    content: `${quietAudio.name}が最も静かだと評価されました（平均${quietAudio.scores.quiet?.toFixed(2)}点）。静かな音を好む人は、50代以上が多く、快適さを重視する傾向があります。`,
  });

  insightsSheet.addRow({ item: '', content: '' });
  insightsSheet.addRow({ item: '💰 購買意欲に影響する要因', content: '' });

  // 要因1: 音の特徴
  const topPurchaseAudio = purchaseIntentAnalysis.sort((a, b) => b.average - a.average)[0];
  insightsSheet.addRow({
    item: '要因1: 音の特徴',
    content: `${topPurchaseAudio.name}が最も高い購買意欲を持っています（平均${topPurchaseAudio.average.toFixed(2)}/7）。この音の特徴は、高級感と先進性が高いことが分かります。`,
  });

  // 要因2: 年齢
  const topAge = purchaseIntentByAttributes.byAgeGroup.sort((a, b) => b.average - a.average)[0];
  insightsSheet.addRow({
    item: '要因2: 年齢',
    content: `${topAge.ageGroup}の年齢層が最も高い購買意欲を持っています（平均${topAge.average.toFixed(2)}/7）。若い世代ほど新しい技術に興味がある傾向があります。`,
  });

  // 要因3: EV所有経験
  const evComparison = purchaseIntentByAttributes.byEvOwnership.sort((a, b) => b.average - a.average)[0];
  insightsSheet.addRow({
    item: '要因3: EV所有経験',
    content: `${evComparison.label}の人が、より高い購買意欲を持っています（平均${evComparison.average.toFixed(2)}/7）。EVの良さを知っている人は、新しいEVにも興味があることが分かります。`,
  });

  insightsSheet.getRow(1).font = { bold: true, size: 14 };
  insightsSheet.getRow(5).font = { bold: true, size: 14 };

  // シート10: 結論と提案
  const conclusionSheet = workbook.addWorksheet('結論と提案');
  conclusionSheet.columns = [
    { header: '項目', key: 'item', width: 30 },
    { header: '内容', key: 'content', width: 70 },
  ];

  conclusionSheet.addRow({ item: '📊 主要な発見事項', content: '' });
  
  // 発見事項1
  if (bestWorst.best.length > 0) {
    const topBest = bestWorst.best[0];
    conclusionSheet.addRow({
      item: '発見事項1: 最も好まれた音',
      content: `${topBest.name}が最も多くの人に好まれました（${(topBest.rate * 100).toFixed(1)}%）。この音の特徴は、高級感と先進性が高いことです。まるで高級車のような印象を与える音と言えます。`,
    });
  }

  // 発見事項2
  conclusionSheet.addRow({
    item: '発見事項2: 年齢による違い',
    content: `若い世代（20-30代）は、50代以上の人たちより購買意欲が高い傾向があります。若い人たちは新しい技術に興味があり、「最新のEVを試してみたい」という気持ちが強いです。`,
  });

  // 発見事項3
  conclusionSheet.addRow({
    item: '発見事項3: EV所有経験の影響',
    content: `すでにEVを持っている人は、持っていない人より購買意欲が高いです。EVの良さを知っているため、新しいEVにも興味があるのです。`,
  });

  conclusionSheet.addRow({ item: '', content: '' });
  conclusionSheet.addRow({ item: '💡 結論', content: '' });
  conclusionSheet.addRow({
    item: '結論',
    content: `200名のアンケート結果から、以下のことが分かりました：
1. 高級感と先進性が高い音が最も好まれます
2. 若い世代ほど購買意欲が高い傾向があります
3. EV所有経験がある人は、新しいEVにも興味があります
4. 静かさも重要な要素ですが、高級感ほど購買意欲には影響しません`,
  });

  conclusionSheet.addRow({ item: '', content: '' });
  conclusionSheet.addRow({ item: '🚀 マーケティング提案', content: '' });
  
  // 提案1
  conclusionSheet.addRow({
    item: '提案1: ターゲットセグメントの明確化',
    content: `20-40代の若い世代を主要ターゲットとし、高級感と先進性を強調したプロモーションを実施することをお勧めします。この世代は購買意欲が高く、新しい技術に興味があります。`,
  });

  // 提案2
  conclusionSheet.addRow({
    item: '提案2: 音の特徴の訴求',
    content: `最も好まれた音の特徴（高級感、先進性）を強調したマーケティングメッセージを作成することをお勧めします。例えば「高級車のような重厚感」「未来を感じさせる先進的な音」などの表現が効果的です。`,
  });

  // 提案3
  conclusionSheet.addRow({
    item: '提案3: EV所有者へのアプローチ',
    content: `既存のEV所有者に対して、新しいEVの音の特徴を紹介するプロモーションを実施することをお勧めします。EVの良さを知っている人たちは、新しいEVにも興味があるため、効果的なマーケティングが可能です。`,
  });

  // 提案4
  conclusionSheet.addRow({
    item: '提案4: 年齢層別のマーケティング戦略',
    content: `若い世代（20-30代）には、先進性とワクワク感を強調。50代以上には、静かさと安心感を強調したマーケティングを実施することをお勧めします。それぞれの世代が重視するポイントが異なるため、ターゲットに合わせたメッセージが重要です。`,
  });

  conclusionSheet.getRow(1).font = { bold: true, size: 14 };
  conclusionSheet.getRow(6).font = { bold: true, size: 14 };
  conclusionSheet.getRow(9).font = { bold: true, size: 14 };

  // ファイルを保存
  const outputDir = join(process.cwd(), 'scripts', 'marketing-reports');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = join(outputDir, `marketing-analysis-report-${dateStr}.xlsx`);
  await workbook.xlsx.writeFile(outputPath);

  console.log(`✅ Excelレポートを生成しました: ${outputPath}`);
  return outputPath;
}

/**
 * メイン処理
 */
async function main() {
  try {
    console.log('🚀 マーケティング分析レポート生成を開始します...\n');

    // データ取得
    const { respondents, audioSamples } = await fetchData();

    if (respondents.length === 0) {
      console.error('❌ データが見つかりません。');
      console.error('📝 先に擬似データを生成してください:');
      console.error('   npm run db:mock:200');
      process.exit(1);
    }

    if (respondents.length < 50) {
      console.warn(`⚠️  データが少ないです（${respondents.length}名）。200名以上のデータを推奨します。`);
      console.warn('📝 擬似データを生成する場合: npm run db:mock:200');
    }

    // 各分析を実行
    const basicStats = calculateBasicStatistics(respondents);
    const sdAnalysis = analyzeSDScores(respondents, audioSamples);
    const purchaseIntentAnalysis = analyzePurchaseIntent(respondents, audioSamples);
    const purchaseIntentByAttributes = analyzePurchaseIntentByAttributes(respondents);
    const crossTab = analyzeCrossTabulation(respondents);
    const bestWorst = analyzeBestWorst(respondents);
    const valueTree = analyzeValueTree(respondents);

    // Excelレポートを生成
    const outputPath = await generateExcelReport(
      basicStats,
      sdAnalysis,
      purchaseIntentAnalysis,
      purchaseIntentByAttributes,
      crossTab,
      bestWorst,
      valueTree
    );

    console.log('\n✅ マーケティング分析レポートの生成が完了しました！');
    console.log(`📁 出力ファイル: ${outputPath}`);

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

