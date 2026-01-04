'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SurveyLayout } from '@/components/layout/SurveyLayout';
import { MediaPlayer } from '@/components/media/MediaPlayer';
import { getMediaUrl, getMediaType } from '@/lib/mediaFiles';
import { SDScaleForm } from '@/components/survey/SDScaleForm';
import { PurchaseIntentScale } from '@/components/survey/PurchaseIntentScale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { NavigationButtons } from '@/components/layout/NavigationButtons';
import { useSurveyStore } from '@/stores/surveyStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ChevronRight, MessageSquare } from 'lucide-react';
import type { SDScores } from '@/types/survey';

const evaluationSchema = z.object({
  sdScores: z.object({
    quiet: z.number().min(-3).max(3),
    pleasant: z.number().min(-3).max(3),
    premium: z.number().min(-3).max(3),
    modern: z.number().min(-3).max(3),
    powerful: z.number().min(-3).max(3),
    safe: z.number().min(-3).max(3),
    exciting: z.number().min(-3).max(3),
    natural: z.number().min(-3).max(3),
  }),
  purchaseIntent: z.number().min(1).max(7),
  freeText: z.string().optional(),
});

type EvaluationFormData = z.infer<typeof evaluationSchema>;

const defaultSDScores: SDScores = {
  quiet: 0,
  pleasant: 0,
  premium: 0,
  modern: 0,
  powerful: 0,
  safe: 0,
  exciting: 0,
  natural: 0,
};

export default function EvaluationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    audioSamples,
    audioOrder,
    currentAudioIndex,
    evaluations,
    addEvaluation,
    nextAudio,
    getProgress,
    setAudioSamples,
    setAudioOrder,
    initSession,
    setConsent,
    setDemographics,
    setHeadphoneChecked,
  } = useSurveyStore();

  // 音声評価ページに入ったときに、currentAudioIndexを0にリセット
  useEffect(() => {
    if (audioOrder.length > 0) {
      // currentAudioIndexが範囲外の場合は0にリセット
      if (currentAudioIndex >= audioOrder.length) {
        useSurveyStore.setState({ currentAudioIndex: 0 });
      }
    }
  }, [audioOrder.length, currentAudioIndex]);

  const [hasPlayed, setHasPlayed] = useState(false);
  const [startTime] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const currentAudioId = audioOrder[currentAudioIndex];
  const currentAudio = audioSamples.find((s) => s.id === currentAudioId);
  const isLastAudio = currentAudioIndex >= audioOrder.length - 1;

  const { control, handleSubmit, watch, setValue, formState: { isValid } } = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      sdScores: defaultSDScores,
      purchaseIntent: 4,
      freeText: '',
    },
    mode: 'onChange',
  });

  const sdScores = watch('sdScores');
  const purchaseIntent = watch('purchaseIntent');
  const freeText = watch('freeText');

  // テストモード: クエリパラメータからテストデータを読み込む
  useEffect(() => {
    const isTestMode = searchParams.get('test') === 'true';
    if (isTestMode) {
      try {
        const consentParam = searchParams.get('consent');
        const demographicsParam = searchParams.get('demographics');
        
        if (consentParam && demographicsParam) {
          const consent = JSON.parse(consentParam);
          const demographics = JSON.parse(demographicsParam);
          
          // セッションを初期化
          initSession();
          // 同意と属性入力を設定
          setConsent(consent);
          setDemographics(demographics);
          // ヘッドホンチェックをスキップ
          setHeadphoneChecked(true);
        }
      } catch (error) {
        console.error('Failed to parse test data:', error);
      }
    }
  }, [searchParams, initSession, setConsent, setDemographics, setHeadphoneChecked]);

  useEffect(() => {
    // 音声サンプルが設定されていない場合は取得
    if (audioSamples.length === 0 && !isLoading && !loadError) {
      setIsLoading(true);
      setLoadError(null);
      
      fetch('/api/audio/samples')
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            // ストアに設定
            setAudioSamples(data);
            // ランダム順序を設定
            const order = data.map((s: { id: string }) => s.id).sort(() => Math.random() - 0.5);
            setAudioOrder(order);
            // 音声サンプルが読み込まれたら、currentAudioIndexを0にリセット
            useSurveyStore.setState({ currentAudioIndex: 0 });
            setIsLoading(false);
          } else {
            throw new Error('音声サンプルが取得できませんでした。データが空です。');
          }
        })
        .catch((error) => {
          console.error('Failed to load audio samples:', error);
          setLoadError(error instanceof Error ? error.message : '音声サンプルの読み込みに失敗しました');
          setIsLoading(false);
        });
    }
  }, [audioSamples.length, isLoading, loadError, setAudioSamples, setAudioOrder]);

  const onSubmit = (data: EvaluationFormData) => {
    if (!currentAudioId) return;

    const responseTime = Date.now() - startTime;

    addEvaluation(currentAudioId, {
      presentationOrder: currentAudioIndex + 1,
      sdScores: data.sdScores,
      purchaseIntent: data.purchaseIntent,
      freeText: data.freeText,
      responseTimeMs: responseTime,
    });

    if (isLastAudio) {
      router.push('/survey/triad');
    } else {
      nextAudio();
      setHasPlayed(false);
      // フォームをリセット (reloadの代わりに状態リセット)
      setValue('sdScores', defaultSDScores);
      setValue('purchaseIntent', 4);
      setValue('freeText', '');
    }
  };

  // 音声サンプルが読み込まれていない、または現在の音声が存在しない場合はローディング表示
  if (audioSamples.length === 0 || !currentAudio || !currentAudioId) {
    return (
      <SurveyLayout 
        progress={getProgress()} 
        showBack
        title="音声評価"
        subtitle={loadError ? "エラーが発生しました" : "音声サンプルを読み込んでいます..."}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            {loadError ? (
              <>
                <div className="text-red-600 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-600 font-semibold mb-2">読み込みエラー</p>
                <p className="text-muted-foreground mb-4">{loadError}</p>
                <Button
                  onClick={() => {
                    setLoadError(null);
                    setIsLoading(false);
                    // 再試行
                    if (audioSamples.length === 0) {
                      setAudioSamples([]);
                    }
                  }}
                  variant="outline"
                >
                  再試行
                </Button>
              </>
            ) : (
              <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">読み込み中...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  サーバーから音声サンプルを取得しています
                </p>
              </>
            )}
          </div>
        </div>
      </SurveyLayout>
    );
  }

  return (
    <SurveyLayout
      progress={getProgress()}
      showBack
      title={`音声評価 ${currentAudioIndex + 1} / ${audioOrder.length}`}
      subtitle={currentAudio.name}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 音声プレーヤー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-r from-emerald-50 to-cyan-50 border-emerald-200">
            <CardContent className="pt-6">
              <div className="mb-4">
                <h3 className="font-semibold text-slate-800 mb-2">
                  {currentAudio.name}
                </h3>
                {currentAudio.description && (
                  <p className="text-sm text-slate-600">{currentAudio.description}</p>
                )}
              </div>
              <MediaPlayer
                src={getMediaUrl(currentAudio.fileUrl)}
                title=""
                onPlayComplete={() => setHasPlayed(true)}
                compact={false}
                mediaType={getMediaType(currentAudio.fileUrl)}
                showVideo={true}
              />
              {!hasPlayed && (
                <p className="text-sm text-amber-600 mt-4 text-center">
                  ⚠️ 音声を最後まで再生してから評価してください
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* SD法評価 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SDScaleForm
            scores={sdScores}
            onChange={(scores) => setValue('sdScores', scores)}
            disabled={!hasPlayed}
          />
        </motion.div>

        {/* 購買意欲評価 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PurchaseIntentScale
            value={purchaseIntent}
            onChange={(value) => setValue('purchaseIntent', value)}
            disabled={!hasPlayed}
          />
        </motion.div>

        {/* 自由記述 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <Label className="text-base font-semibold text-slate-800">
                  自由記述（任意）
                </Label>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                この走行音について、感じたことや気づいたことを自由にお書きください。
              </p>
              <Textarea
                {...control.register('freeText')}
                placeholder="例：低音が響いていて重厚感があった。モーター音が心地よかった。"
                className="min-h-24"
                disabled={!hasPlayed}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* ナビゲーションボタン */}
        <NavigationButtons
          onNext={handleSubmit(onSubmit)}
          nextLabel={isLastAudio ? '評価を完了する' : '次の音声へ'}
          nextDisabled={!hasPlayed || !isValid}
          showBack={false}
        />
      </form>
    </SurveyLayout>
  );
}

