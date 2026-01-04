import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Phase,
  AudioSample,
  Evaluation,
  Triad,
  Construct,
  InterviewMessage,
  SDScores,
  ConsentFormData,
  DemographicsFormData,
} from '@/types/survey';

interface SurveyState {
  // セッション情報
  sessionId: string | null;
  respondentId: string | null;
  experimentGroup: string | null;

  // 進捗管理
  currentPhase: Phase;
  currentStep: number;
  startTime: Date | null;

  // 同意・属性情報
  consent: ConsentFormData | null;
  demographics: DemographicsFormData | null;
  headphoneChecked: boolean;

  // 音声サンプル
  audioSamples: AudioSample[];
  audioOrder: string[];
  currentAudioIndex: number;

  // 評価データ
  evaluations: Map<string, Evaluation>;

  // トライアド・コンストラクト
  triads: Triad[];
  currentTriadIndex: number;
  constructs: Construct[];

  // インタビュー
  interviewHistory: InterviewMessage[];
  currentTopic: string;

  // アクション
  initSession: () => void;
  setPhase: (phase: Phase) => void;
  nextStep: () => void;
  previousStep: () => void;
  
  setConsent: (data: ConsentFormData) => void;
  setDemographics: (data: DemographicsFormData) => void;
  setHeadphoneChecked: (checked: boolean) => void;
  
  setAudioSamples: (samples: AudioSample[]) => void;
  setAudioOrder: (order: string[]) => void;
  nextAudio: () => void;
  
  addEvaluation: (audioId: string, data: Omit<Evaluation, 'id' | 'respondentId' | 'audioSampleId' | 'createdAt'>) => void;
  
  addTriad: (data: Omit<Triad, 'id' | 'respondentId' | 'createdAt'>) => void;
  addConstruct: (data: Omit<Construct, 'id' | 'respondentId' | 'createdAt'>) => void;
  nextTriad: () => void;
  
  addInterviewMessage: (message: Omit<InterviewMessage, 'id' | 'timestamp'>) => void;
  setCurrentTopic: (topic: string) => void;
  
  getProgress: () => number;
  reset: () => void;
}

// フェーズごとの重み（進捗計算用）
const PHASE_WEIGHTS: Record<Phase, number> = {
  welcome: 0,
  consent: 5,
  demographics: 10,
  'audio-check': 12,
  evaluation: 45,
  triad: 65,
  laddering: 80,
  interview: 95,
  complete: 100,
};

const generateId = () => crypto.randomUUID();

const initialState = {
  sessionId: null,
  respondentId: null,
  experimentGroup: null,
  currentPhase: 'welcome' as Phase,
  currentStep: 0,
  startTime: null,
  consent: null,
  demographics: null,
  headphoneChecked: false,
  audioSamples: [],
  audioOrder: [],
  currentAudioIndex: 0,
  evaluations: new Map<string, Evaluation>(),
  triads: [],
  currentTriadIndex: 0,
  constructs: [],
  interviewHistory: [],
  currentTopic: '',
};

export const useSurveyStore = create<SurveyState>()(
  persist(
    (set, get) => ({
      ...initialState,

      initSession: () => {
        const sessionId = generateId();
        const respondentId = generateId();
        // ランダムにグループ割り当て（A/B）
        const experimentGroup = Math.random() < 0.5 ? 'A' : 'B';
        
        set({
          sessionId,
          respondentId,
          experimentGroup,
          startTime: new Date(),
          currentPhase: 'consent',
        });
      },

      setPhase: (phase) => set({ currentPhase: phase, currentStep: 0 }),

      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),

      previousStep: () => set((state) => ({ 
        currentStep: Math.max(0, state.currentStep - 1) 
      })),

      setConsent: (data) => {
        set({ consent: data, currentPhase: 'demographics' });
      },

      setDemographics: (data) => {
        set({ demographics: data, currentPhase: 'audio-check' });
      },

      setHeadphoneChecked: (checked) => {
        set({ headphoneChecked: checked });
        if (checked) {
          set({ currentPhase: 'evaluation', currentAudioIndex: 0 });
        }
      },

      setAudioSamples: (samples) => set({ audioSamples: samples }),

      setAudioOrder: (order) => set({ audioOrder: order }),

      nextAudio: () => {
        const { currentAudioIndex, audioOrder, triads } = get();
        if (currentAudioIndex < audioOrder.length - 1) {
          set({ currentAudioIndex: currentAudioIndex + 1 });
        } else {
          // すべての音声評価が完了 → トライアドフェーズへ
          set({ currentPhase: 'triad', currentAudioIndex: 0 });
        }
      },

      addEvaluation: (audioId, data) => {
        const { respondentId, evaluations } = get();
        if (!respondentId) return;

        const evaluation: Evaluation = {
          id: generateId(),
          respondentId,
          audioSampleId: audioId,
          ...data,
          createdAt: new Date(),
        };

        const newEvaluations = new Map(evaluations);
        newEvaluations.set(audioId, evaluation);
        set({ evaluations: newEvaluations });
      },

      addTriad: (data) => {
        const { respondentId, triads } = get();
        if (!respondentId) return;

        const triad: Triad = {
          id: generateId(),
          respondentId,
          ...data,
          createdAt: new Date(),
        };

        set({ triads: [...triads, triad] });
      },

      addConstruct: (data) => {
        const { respondentId, constructs } = get();
        if (!respondentId) return;

        const construct: Construct = {
          id: generateId(),
          respondentId,
          ...data,
          createdAt: new Date(),
        };

        set({ constructs: [...constructs, construct] });
      },

      nextTriad: () => {
        const { currentTriadIndex } = get();
        if (currentTriadIndex < 2) { // 3回のトライアド
          set({ currentTriadIndex: currentTriadIndex + 1 });
        } else {
          // トライアド完了 → ラダリングフェーズへ
          set({ currentPhase: 'laddering', currentTriadIndex: 0 });
        }
      },

      addInterviewMessage: (message) => {
        const { interviewHistory } = get();
        const newMessage: InterviewMessage = {
          id: generateId(),
          timestamp: new Date(),
          ...message,
        };
        set({ interviewHistory: [...interviewHistory, newMessage] });
      },

      setCurrentTopic: (topic) => set({ currentTopic: topic }),

      getProgress: () => {
        const { currentPhase, currentAudioIndex, audioOrder, currentTriadIndex } = get();
        
        let baseProgress = PHASE_WEIGHTS[currentPhase];
        
        // フェーズ内の細かい進捗
        if (currentPhase === 'evaluation' && audioOrder.length > 0) {
          const audioProgress = (currentAudioIndex / audioOrder.length) * 
            (PHASE_WEIGHTS.triad - PHASE_WEIGHTS.evaluation);
          baseProgress = PHASE_WEIGHTS.evaluation + audioProgress;
        }
        
        if (currentPhase === 'triad') {
          const triadProgress = (currentTriadIndex / 3) * 
            (PHASE_WEIGHTS.laddering - PHASE_WEIGHTS.triad);
          baseProgress = PHASE_WEIGHTS.triad + triadProgress;
        }
        
        return Math.round(baseProgress);
      },

      reset: () => set(initialState),
    }),
    {
      name: 'ev-survey-storage',
      partialize: (state) => ({
        sessionId: state.sessionId,
        respondentId: state.respondentId,
        experimentGroup: state.experimentGroup,
        currentPhase: state.currentPhase,
        currentStep: state.currentStep,
        startTime: state.startTime,
        consent: state.consent,
        demographics: state.demographics,
        headphoneChecked: state.headphoneChecked,
        audioOrder: state.audioOrder,
        currentAudioIndex: state.currentAudioIndex,
        currentTriadIndex: state.currentTriadIndex,
        currentTopic: state.currentTopic,
        // Map は直接永続化できないため、配列に変換
        // evaluationsとinterviewHistoryは別途処理が必要
      }),
    }
  )
);

