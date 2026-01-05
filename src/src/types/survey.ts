// アンケート関連の型定義

export type Phase =
  | 'welcome'
  | 'consent'
  | 'demographics'
  | 'audio-check'
  | 'evaluation'
  | 'best-worst'
  | 'triad' // 後方互換性のため保持
  | 'laddering'
  | 'interview'
  | 'complete';

export interface Respondent {
  id: string;
  sessionId: string;
  experimentGroup: string;
  ageGroup: string;
  gender: string;
  prefecture?: string;
  drivingExperience: number;
  evOwnership: boolean;
  audioSensitivity: number;
  consentGiven: boolean;
  headphoneCheck: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface AudioSample {
  id: string;
  name: string;
  description?: string;
  fileUrl: string;
  duration: number;
  category: string;
  metadata?: Record<string, unknown>;
  isActive: boolean;
}

export interface SDScores {
  quiet: number;      // 静か (-3 to +3)
  pleasant: number;   // 心地よい
  premium: number;    // 高級感
  modern: number;     // 先進的
  powerful: number;   // 力強い
  safe: number;       // 安心
  exciting: number;   // ワクワク
  natural: number;    // 自然
}

export interface Evaluation {
  id: string;
  respondentId: string;
  audioSampleId: string;
  presentationOrder: number;
  sdScores: SDScores;
  purchaseIntent: number; // 1-7
  willingnessToPay?: number; // 追加支払可能額 (WTP)
  purchaseIntentConditions?: {
    vehicleModel: string; // "Honda N-Box"
    price: string; // "200万円"
    fuelEconomy: string; // "20.0km/L"
    otherFactors?: string[]; // その他の考慮事項
  };
  freeText?: string;
  responseTimeMs?: number;
  createdAt: Date;
}

// 最良・最悪音比較（評価グリッド法の新手法）
export interface BestWorstComparison {
  id: string;
  respondentId: string;
  bestAudioId: string; // 最も印象が良かった音
  worstAudioId: string; // 最も印象が悪かった音
  bestReason: string; // 良かった理由
  worstReason: string; // 悪かった理由
  createdAt: Date;
}

// 後方互換性のためTriad型も保持（段階的移行用）
export interface Triad {
  id: string;
  respondentId: string;
  audio1Id: string;
  audio2Id: string;
  audio3Id: string;
  similarPair: [string, string];
  differentOne: string;
  similarityReason: string;
  differenceReason: string;
  triadOrder: number;
  createdAt: Date;
}

export interface Construct {
  id: string;
  bestWorstComparisonId?: string; // 最良・最悪比較ID（新方式）
  triadId?: string; // トライアドID（後方互換性のため保持）
  respondentId: string;
  constructText: string;
  poleLeft?: string;
  poleRight?: string;
  ladderUp?: string[];
  ladderDown?: string[];
  level: 'terminal' | 'instrumental' | 'functional' | 'physical';
  parentId?: string;
  createdAt: Date;
}

export interface InterviewMessage {
  id: string;
  type: 'system' | 'user';
  content: string;
  timestamp: Date;
  topic?: string;
  depthLevel?: number;
}

export interface InterviewLog {
  id: string;
  respondentId: string;
  questionId: string;
  questionText: string;
  responseText: string;
  sentimentScore?: number;
  keywords?: string[];
  depthLevel: number;
  topic: string;
  responseTimeMs?: number;
  createdAt: Date;
}

// フォーム用の型
export interface ConsentFormData {
  agreeTerms: boolean;
  agreeDataUsage: boolean;
  agreeAudioPlayback: boolean;
}

export interface DemographicsFormData {
  ageGroup: string;
  gender: string;
  prefecture: string;
  drivingExperience: number;
  evOwnership: boolean;
  audioSensitivity: number;
}

export interface EvaluationFormData {
  sdScores: SDScores;
  purchaseIntent: number;
  freeText?: string;
}

export interface TriadFormData {
  similarPair: [string, string];
  differentOne: string;
  similarityReason: string;
  differenceReason: string;
}

export interface BestWorstFormData {
  bestAudioId: string;
  worstAudioId: string;
  bestReason: string;
  worstReason: string;
}

// SD法の評価軸定義
export const SD_SCALES = [
  { key: 'quiet', leftLabel: 'うるさい', rightLabel: '静か' },
  { key: 'pleasant', leftLabel: '不快', rightLabel: '心地よい' },
  { key: 'premium', leftLabel: '安っぽい', rightLabel: '高級感がある' },
  { key: 'modern', leftLabel: '古臭い', rightLabel: '先進的' },
  { key: 'powerful', leftLabel: '弱々しい', rightLabel: '力強い' },
  { key: 'safe', leftLabel: '不安', rightLabel: '安心' },
  { key: 'exciting', leftLabel: '退屈', rightLabel: 'ワクワクする' },
  { key: 'natural', leftLabel: '人工的', rightLabel: '自然' },
] as const;

// 年齢グループ
export const AGE_GROUPS = [
  { value: '20-29', label: '20代' },
  { value: '30-39', label: '30代' },
  { value: '40-49', label: '40代' },
  { value: '50-59', label: '50代' },
  { value: '60-70', label: '60〜70歳' },
] as const;

// 性別
export const GENDERS = [
  { value: 'male', label: '男性' },
  { value: 'female', label: '女性' },
  { value: 'other', label: 'その他' },
  { value: 'prefer_not_to_say', label: '回答しない' },
] as const;

// 都道府県
export const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
] as const;

