/**
 * ユーザビリティテスト結果生成スクリプト
 * 仮想ペルソナ200名のテスト結果を生成
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// ペルソナの定義
interface Persona {
  id: number;
  ageGroup: string;
  gender: string;
  prefecture: string;
  drivingExperience: number;
  evOwnership: boolean;
  audioSensitivity: number;
  techLiteracy: 'low' | 'medium' | 'high'; // 技術リテラシー
}

// タスク結果
interface TaskResult {
  taskId: string;
  taskName: string;
  completed: boolean;
  completionTime: number; // 秒
  errorCount: number;
  clickCount: number;
  satisfaction: number; // 1-5
  comments?: string;
}

// テスト結果
interface TestResult {
  personaId: number;
  persona: Persona;
  tasks: TaskResult[];
  overallSatisfaction: number; // 1-5
  susScore: number; // 0-100
  completionRate: number; // 0-1
  totalTime: number; // 秒
  totalErrors: number;
  totalClicks: number;
  abandonment: boolean; // 途中離脱
  abandonmentPoint?: string; // 離脱ポイント
}

// 年齢グループ
const AGE_GROUPS = ['20-29', '30-39', '40-49', '50-59', '60-69'];
const GENDERS = ['male', 'female', 'other'];
const PREFECTURES = [
  '東京都', '神奈川県', '大阪府', '愛知県', '埼玉県', '千葉県', '兵庫県', '福岡県',
  '北海道', '宮城県', '新潟県', '静岡県', '京都府', '広島県', '岡山県', '長崎県'
];

// タスク定義
const TASKS = [
  { id: 'task1', name: 'ランディングページからアンケート開始', baseTime: 30, baseErrors: 0.1 },
  { id: 'task2', name: '同意ページで内容確認・同意', baseTime: 60, baseErrors: 0.2 },
  { id: 'task3', name: '属性情報の入力', baseTime: 120, baseErrors: 0.3 },
  { id: 'task4', name: '音声チェックの完了', baseTime: 90, baseErrors: 0.4 },
  { id: 'task5', name: '最初の音声評価の完了', baseTime: 180, baseErrors: 0.5 },
  { id: 'task6', name: '次の音声評価に進む', baseTime: 150, baseErrors: 0.3 },
];

// ランダムな値を生成する関数
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomBoolean(probability: number = 0.5): boolean {
  return Math.random() < probability;
}

// ペルソナを生成
function generatePersona(id: number): Persona {
  const ageGroup = randomChoice(AGE_GROUPS);
  const gender = randomChoice(GENDERS);
  const prefecture = randomChoice(PREFECTURES);
  const drivingExperience = randomInt(0, 50);
  const evOwnership = randomBoolean(0.2); // 20%がEV所有
  const audioSensitivity = randomInt(1, 5);
  
  // 技術リテラシーは年齢と相関
  let techLiteracy: 'low' | 'medium' | 'high';
  if (ageGroup === '20-29' || ageGroup === '30-39') {
    techLiteracy = randomChoice(['medium', 'high', 'high']);
  } else if (ageGroup === '40-49') {
    techLiteracy = randomChoice(['low', 'medium', 'medium', 'high']);
  } else {
    techLiteracy = randomChoice(['low', 'low', 'medium']);
  }

  return {
    id,
    ageGroup,
    gender,
    prefecture,
    drivingExperience,
    evOwnership,
    audioSensitivity,
    techLiteracy,
  };
}

// タスク結果を生成
function generateTaskResult(
  task: typeof TASKS[0],
  persona: Persona,
  previousCompleted: boolean
): TaskResult {
  if (!previousCompleted) {
    return {
      taskId: task.id,
      taskName: task.name,
      completed: false,
      completionTime: 0,
      errorCount: 0,
      clickCount: 0,
      satisfaction: 0,
    };
  }

  // 技術リテラシーによる影響
  const techMultiplier = persona.techLiteracy === 'low' ? 1.5 : persona.techLiteracy === 'medium' ? 1.2 : 1.0;
  const errorMultiplier = persona.techLiteracy === 'low' ? 2.0 : persona.techLiteracy === 'medium' ? 1.5 : 1.0;

  // 完了率（技術リテラシーとタスク難易度に依存）
  const baseCompletionRate = 0.95 - (task.baseErrors * 0.1);
  const completionRate = Math.max(0.7, baseCompletionRate - (persona.techLiteracy === 'low' ? 0.1 : 0));

  const completed = randomBoolean(completionRate);

  if (!completed) {
    return {
      taskId: task.id,
      taskName: task.name,
      completed: false,
      completionTime: randomInt(10, task.baseTime * techMultiplier),
      errorCount: randomInt(1, 3),
      clickCount: randomInt(5, 20),
      satisfaction: randomInt(1, 3),
      comments: 'タスクを完了できませんでした',
    };
  }

  const completionTime = randomInt(
    task.baseTime * techMultiplier * 0.8,
    task.baseTime * techMultiplier * 1.5
  );
  const errorCount = randomInt(0, Math.ceil(task.baseErrors * errorMultiplier));
  const clickCount = randomInt(
    Math.ceil(completionTime / 10),
    Math.ceil(completionTime / 5)
  );
  const satisfaction = errorCount === 0 
    ? randomInt(4, 5)
    : errorCount <= 1
    ? randomInt(3, 4)
    : randomInt(2, 3);

  return {
    taskId: task.id,
    taskName: task.name,
    completed: true,
    completionTime,
    errorCount,
    clickCount,
    satisfaction,
  };
}

// SUSスコアを計算
function calculateSUSScore(persona: Persona, tasks: TaskResult[]): number {
  // SUS質問への回答をシミュレート
  const responses: number[] = [];
  
  for (let i = 0; i < 10; i++) {
    // タスク完了率と満足度に基づいて回答を生成
    const completionRate = tasks.filter(t => t.completed).length / tasks.length;
    const avgSatisfaction = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.satisfaction, 0) / tasks.filter(t => t.completed).length || 3;
    
    let baseScore: number;
    if (i % 2 === 0) {
      // 肯定的な質問（1, 3, 5, 7, 9）
      baseScore = 3 + (completionRate * 1.5) + ((avgSatisfaction - 3) * 0.3);
    } else {
      // 否定的な質問（2, 4, 6, 8, 10）
      baseScore = 3 - (completionRate * 1.5) - ((avgSatisfaction - 3) * 0.3);
    }
    
    // 技術リテラシーの影響
    if (persona.techLiteracy === 'low') {
      baseScore -= 0.5;
    } else if (persona.techLiteracy === 'high') {
      baseScore += 0.3;
    }
    
    responses.push(Math.max(1, Math.min(5, Math.round(baseScore + randomFloat(-0.5, 0.5)))));
  }

  // SUSスコアを計算
  let susScore = 0;
  for (let i = 0; i < 10; i++) {
    if (i % 2 === 0) {
      // 奇数番号（1, 3, 5, 7, 9）: スコア - 1
      susScore += responses[i] - 1;
    } else {
      // 偶数番号（2, 4, 6, 8, 10）: 5 - スコア
      susScore += 5 - responses[i];
    }
  }
  susScore = susScore * 2.5;

  return Math.max(0, Math.min(100, Math.round(susScore)));
}

// テスト結果を生成
function generateTestResult(persona: Persona): TestResult {
  const tasks: TaskResult[] = [];
  let previousCompleted = true;
  let abandonmentPoint: string | undefined;

  for (const task of TASKS) {
    const taskResult = generateTaskResult(task, persona, previousCompleted);
    tasks.push(taskResult);

    if (!taskResult.completed && previousCompleted) {
      previousCompleted = false;
      abandonmentPoint = task.taskName;
    }
  }

  const completedTasks = tasks.filter(t => t.completed);
  const completionRate = completedTasks.length / TASKS.length;
  const totalTime = tasks.reduce((sum, t) => sum + t.completionTime, 0);
  const totalErrors = tasks.reduce((sum, t) => sum + t.errorCount, 0);
  const totalClicks = tasks.reduce((sum, t) => sum + t.clickCount, 0);
  const avgSatisfaction = completedTasks.length > 0
    ? completedTasks.reduce((sum, t) => sum + t.satisfaction, 0) / completedTasks.length
    : 0;
  const overallSatisfaction = Math.round(avgSatisfaction);
  const susScore = calculateSUSScore(persona, tasks);
  const abandonment = !previousCompleted;

  return {
    personaId: persona.id,
    persona,
    tasks,
    overallSatisfaction,
    susScore,
    completionRate,
    totalTime,
    totalErrors,
    totalClicks,
    abandonment,
    abandonmentPoint,
  };
}

// メイン処理
function main() {
  console.log('ユーザビリティテスト結果を生成中...');

  const personas: Persona[] = [];
  const testResults: TestResult[] = [];

  // 200名のペルソナを生成
  for (let i = 1; i <= 200; i++) {
    const persona = generatePersona(i);
    personas.push(persona);
    const result = generateTestResult(persona);
    testResults.push(result);
  }

  // 統計を計算
  const stats = {
    totalParticipants: testResults.length,
    averageCompletionRate: testResults.reduce((sum, r) => sum + r.completionRate, 0) / testResults.length,
    averageSUSScore: testResults.reduce((sum, r) => sum + r.susScore, 0) / testResults.length,
    averageSatisfaction: testResults.reduce((sum, r) => sum + r.overallSatisfaction, 0) / testResults.length,
    averageTotalTime: testResults.reduce((sum, r) => sum + r.totalTime, 0) / testResults.length,
    averageTotalErrors: testResults.reduce((sum, r) => sum + r.totalErrors, 0) / testResults.length,
    averageTotalClicks: testResults.reduce((sum, r) => sum + r.totalClicks, 0) / testResults.length,
    abandonmentRate: testResults.filter(r => r.abandonment).length / testResults.length,
    taskCompletionRates: TASKS.map(task => ({
      taskId: task.id,
      taskName: task.name,
      completionRate: testResults.filter(r => {
        const taskResult = r.tasks.find(t => t.taskId === task.id);
        return taskResult?.completed || false;
      }).length / testResults.length,
    })),
  };

  // JSON形式で保存
  const outputDir = join(process.cwd(), 'scripts', 'usability-test-results');
  const outputPath = join(outputDir, 'test-results.json');
  const statsPath = join(outputDir, 'statistics.json');
  
  // ディレクトリが存在しない場合は作成
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  writeFileSync(outputPath, JSON.stringify(testResults, null, 2), 'utf-8');
  writeFileSync(statsPath, JSON.stringify(stats, null, 2), 'utf-8');

  console.log(`✅ テスト結果を生成しました:`);
  console.log(`   - 参加者数: ${stats.totalParticipants}名`);
  console.log(`   - 平均完了率: ${(stats.averageCompletionRate * 100).toFixed(1)}%`);
  console.log(`   - 平均SUSスコア: ${stats.averageSUSScore.toFixed(1)}点`);
  console.log(`   - 平均満足度: ${stats.averageSatisfaction.toFixed(1)}/5`);
  console.log(`   - 平均所要時間: ${Math.round(stats.averageTotalTime)}秒`);
  console.log(`   - 平均エラー数: ${stats.averageTotalErrors.toFixed(1)}`);
  console.log(`   - 離脱率: ${(stats.abandonmentRate * 100).toFixed(1)}%`);
  console.log(`\n📁 出力ファイル:`);
  console.log(`   - ${outputPath}`);
  console.log(`   - ${statsPath}`);
}

main();

