/**
 * ユーザビリティテスト結果をExcelにエクスポートするスクリプト
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import ExcelJS from 'exceljs';

interface TestResult {
  personaId: number;
  persona: {
    id: number;
    ageGroup: string;
    gender: string;
    prefecture: string;
    drivingExperience: number;
    evOwnership: boolean;
    audioSensitivity: number;
    techLiteracy: string;
  };
  tasks: Array<{
    taskId: string;
    taskName: string;
    completed: boolean;
    completionTime: number;
    errorCount: number;
    clickCount: number;
    satisfaction: number;
    comments?: string;
  }>;
  overallSatisfaction: number;
  susScore: number;
  completionRate: number;
  totalTime: number;
  totalErrors: number;
  totalClicks: number;
  abandonment: boolean;
  abandonmentPoint?: string;
}

interface Statistics {
  totalParticipants: number;
  averageCompletionRate: number;
  averageSUSScore: number;
  averageSatisfaction: number;
  averageTotalTime: number;
  averageTotalErrors: number;
  averageTotalClicks: number;
  abandonmentRate: number;
  taskCompletionRates: Array<{
    taskId: string;
    taskName: string;
    completionRate: number;
  }>;
}

async function exportToExcel() {
  console.log('Excelファイルを生成中...');

  const resultsDir = join(process.cwd(), 'scripts', 'usability-test-results');
  const resultsPath = join(resultsDir, 'test-results.json');
  const statsPath = join(resultsDir, 'statistics.json');

  if (!existsSync(resultsPath)) {
    console.error('❌ テスト結果ファイルが見つかりません。先に generate-usability-test-results.ts を実行してください。');
    process.exit(1);
  }

  const testResults: TestResult[] = JSON.parse(readFileSync(resultsPath, 'utf-8'));
  const statistics: Statistics = JSON.parse(readFileSync(statsPath, 'utf-8'));

  const workbook = new ExcelJS.Workbook();

  // 1. サマリーシート
  const summarySheet = workbook.addWorksheet('サマリー');
  summarySheet.columns = [
    { header: '指標', key: 'metric', width: 30 },
    { header: '値', key: 'value', width: 20 },
  ];

  summarySheet.addRow({ metric: '総参加者数', value: statistics.totalParticipants });
  summarySheet.addRow({ metric: '平均完了率', value: `${(statistics.averageCompletionRate * 100).toFixed(1)}%` });
  summarySheet.addRow({ metric: '平均SUSスコア', value: statistics.averageSUSScore.toFixed(1) });
  summarySheet.addRow({ metric: '平均満足度', value: `${statistics.averageSatisfaction.toFixed(1)}/5` });
  summarySheet.addRow({ metric: '平均所要時間', value: `${Math.round(statistics.averageTotalTime)}秒` });
  summarySheet.addRow({ metric: '平均エラー数', value: statistics.averageTotalErrors.toFixed(1) });
  summarySheet.addRow({ metric: '平均クリック数', value: Math.round(statistics.averageTotalClicks) });
  summarySheet.addRow({ metric: '離脱率', value: `${(statistics.abandonmentRate * 100).toFixed(1)}%` });

  // スタイル設定
  summarySheet.getRow(1).font = { bold: true };
  summarySheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // 2. タスク完了率シート
  const taskSheet = workbook.addWorksheet('タスク完了率');
  taskSheet.columns = [
    { header: 'タスクID', key: 'taskId', width: 15 },
    { header: 'タスク名', key: 'taskName', width: 40 },
    { header: '完了率', key: 'completionRate', width: 15 },
  ];

  statistics.taskCompletionRates.forEach(task => {
    taskSheet.addRow({
      taskId: task.taskId,
      taskName: task.taskName,
      completionRate: `${(task.completionRate * 100).toFixed(1)}%`,
    });
  });

  taskSheet.getRow(1).font = { bold: true };
  taskSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // 3. 詳細結果シート
  const detailsSheet = workbook.addWorksheet('詳細結果');
  detailsSheet.columns = [
    { header: 'ID', key: 'personaId', width: 8 },
    { header: '年齢', key: 'ageGroup', width: 12 },
    { header: '性別', key: 'gender', width: 10 },
    { header: '都道府県', key: 'prefecture', width: 15 },
    { header: '運転歴', key: 'drivingExperience', width: 10 },
    { header: 'EV所有', key: 'evOwnership', width: 10 },
    { header: '音への感度', key: 'audioSensitivity', width: 12 },
    { header: '技術リテラシー', key: 'techLiteracy', width: 15 },
    { header: '完了率', key: 'completionRate', width: 12 },
    { header: 'SUSスコア', key: 'susScore', width: 12 },
    { header: '満足度', key: 'satisfaction', width: 10 },
    { header: '所要時間(秒)', key: 'totalTime', width: 15 },
    { header: 'エラー数', key: 'totalErrors', width: 10 },
    { header: 'クリック数', key: 'totalClicks', width: 12 },
    { header: '離脱', key: 'abandonment', width: 10 },
    { header: '離脱ポイント', key: 'abandonmentPoint', width: 30 },
  ];

  testResults.forEach(result => {
    detailsSheet.addRow({
      personaId: result.personaId,
      ageGroup: result.persona.ageGroup,
      gender: result.persona.gender === 'male' ? '男性' : result.persona.gender === 'female' ? '女性' : 'その他',
      prefecture: result.persona.prefecture,
      drivingExperience: result.persona.drivingExperience,
      evOwnership: result.persona.evOwnership ? 'あり' : 'なし',
      audioSensitivity: result.persona.audioSensitivity,
      techLiteracy: result.persona.techLiteracy === 'low' ? '低' : result.persona.techLiteracy === 'medium' ? '中' : '高',
      completionRate: `${(result.completionRate * 100).toFixed(1)}%`,
      susScore: result.susScore,
      satisfaction: result.overallSatisfaction,
      totalTime: result.totalTime,
      totalErrors: result.totalErrors,
      totalClicks: result.totalClicks,
      abandonment: result.abandonment ? 'あり' : 'なし',
      abandonmentPoint: result.abandonmentPoint || '-',
    });
  });

  detailsSheet.getRow(1).font = { bold: true };
  detailsSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // 4. タスク別詳細シート
  const taskDetailsSheet = workbook.addWorksheet('タスク別詳細');
  taskDetailsSheet.columns = [
    { header: 'ID', key: 'personaId', width: 8 },
    { header: 'タスクID', key: 'taskId', width: 15 },
    { header: 'タスク名', key: 'taskName', width: 40 },
    { header: '完了', key: 'completed', width: 10 },
    { header: '所要時間(秒)', key: 'completionTime', width: 15 },
    { header: 'エラー数', key: 'errorCount', width: 10 },
    { header: 'クリック数', key: 'clickCount', width: 12 },
    { header: '満足度', key: 'satisfaction', width: 10 },
    { header: 'コメント', key: 'comments', width: 50 },
  ];

  testResults.forEach(result => {
    result.tasks.forEach(task => {
      taskDetailsSheet.addRow({
        personaId: result.personaId,
        taskId: task.taskId,
        taskName: task.taskName,
        completed: task.completed ? '完了' : '未完了',
        completionTime: task.completionTime,
        errorCount: task.errorCount,
        clickCount: task.clickCount,
        satisfaction: task.satisfaction,
        comments: task.comments || '-',
      });
    });
  });

  taskDetailsSheet.getRow(1).font = { bold: true };
  taskDetailsSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // 5. 分析シート
  const analysisSheet = workbook.addWorksheet('分析');
  
  // 年齢グループ別分析
  const ageGroupAnalysis: Record<string, { count: number; avgSUS: number; avgCompletion: number }> = {};
  testResults.forEach(result => {
    const ageGroup = result.persona.ageGroup;
    if (!ageGroupAnalysis[ageGroup]) {
      ageGroupAnalysis[ageGroup] = { count: 0, avgSUS: 0, avgCompletion: 0 };
    }
    ageGroupAnalysis[ageGroup].count++;
    ageGroupAnalysis[ageGroup].avgSUS += result.susScore;
    ageGroupAnalysis[ageGroup].avgCompletion += result.completionRate;
  });

  Object.keys(ageGroupAnalysis).forEach(ageGroup => {
    const data = ageGroupAnalysis[ageGroup];
    data.avgSUS /= data.count;
    data.avgCompletion /= data.count;
  });

  analysisSheet.addRow(['年齢グループ別分析']);
  analysisSheet.addRow(['年齢グループ', '人数', '平均SUSスコア', '平均完了率']);
  Object.entries(ageGroupAnalysis).forEach(([ageGroup, data]) => {
    analysisSheet.addRow([
      ageGroup,
      data.count,
      data.avgSUS.toFixed(1),
      `${(data.avgCompletion * 100).toFixed(1)}%`,
    ]);
  });

  analysisSheet.addRow([]);
  analysisSheet.addRow(['技術リテラシー別分析']);
  analysisSheet.addRow(['技術リテラシー', '人数', '平均SUSスコア', '平均完了率']);

  const techAnalysis: Record<string, { count: number; avgSUS: number; avgCompletion: number }> = {};
  testResults.forEach(result => {
    const tech = result.persona.techLiteracy;
    if (!techAnalysis[tech]) {
      techAnalysis[tech] = { count: 0, avgSUS: 0, avgCompletion: 0 };
    }
    techAnalysis[tech].count++;
    techAnalysis[tech].avgSUS += result.susScore;
    techAnalysis[tech].avgCompletion += result.completionRate;
  });

  Object.keys(techAnalysis).forEach(tech => {
    const data = techAnalysis[tech];
    data.avgSUS /= data.count;
    data.avgCompletion /= data.count;
    analysisSheet.addRow([
      tech === 'low' ? '低' : tech === 'medium' ? '中' : '高',
      data.count,
      data.avgSUS.toFixed(1),
      `${(data.avgCompletion * 100).toFixed(1)}%`,
    ]);
  });

  // ファイルを保存
  const outputPath = join(resultsDir, 'usability-test-results.xlsx');
  await workbook.xlsx.writeFile(outputPath);

  console.log(`✅ Excelファイルを生成しました: ${outputPath}`);
}

exportToExcel().catch(console.error);

