'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  } = useSurveyStore();

  const [hasPlayed, setHasPlayed] = useState(false);
  const [startTime] = useState(Date.now());

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

  const { setAudioSamples, setAudioOrder } = useSurveyStore();

  useEffect(() => {
    // 音声サンプルが設定されていない場合は取得
    if (audioSamples.length === 0) {
      fetch('/api/audio/samples')
        .then((res) => res.json())
        .then((data) => {
          // ストアに設定
          setAudioSamples(data);
          // ランダム順序を設定
          const order = data.map((s: { id: string }) => s.id).sort(() => Math.random() - 0.5);
          setAudioOrder(order);
        })
        .catch((error) => {
          console.error('Failed to load audio samples:', error);
        });
    }
  }, [audioSamples.length, setAudioSamples, setAudioOrder]);

  const onSubmit = (data: EvaluationFormData) => {
    if (!currentAudioId) return;

    const responseTime = Date.now() - startTime;

    addEvaluation(currentAudioId, {
      audioSampleId: currentAudioId,
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
      // フォームをリセット
      window.location.reload(); // 簡易的なリセット
    }
  };

  if (!currentAudio) {
    return (
      <SurveyLayout progress={getProgress()} showBack>
        <div className="text-center py-12">
          <p className="text-slate-600">音声サンプルを読み込んでいます...</p>
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

