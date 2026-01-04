'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SurveyLayout } from '@/components/layout/SurveyLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MediaPlayer } from '@/components/media/MediaPlayer';
import { getMediaUrl, getMediaType } from '@/lib/mediaFiles';
import { NavigationButtons } from '@/components/layout/NavigationButtons';
import { useSurveyStore } from '@/stores/surveyStore';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Music } from 'lucide-react';
import type { AudioSample } from '@/types/survey';

export default function BestWorstPage() {
  const router = useRouter();
  const {
    audioSamples,
    evaluations,
    addBestWorstComparison,
    getProgress,
  } = useSurveyStore();

  const [bestAudioId, setBestAudioId] = useState<string | null>(null);
  const [worstAudioId, setWorstAudioId] = useState<string | null>(null);
  const [bestReason, setBestReason] = useState('');
  const [worstReason, setWorstReason] = useState('');
  const [hasPlayedBest, setHasPlayedBest] = useState(false);
  const [hasPlayedWorst, setHasPlayedWorst] = useState(false);
  const [selectedBestForPlay, setSelectedBestForPlay] = useState<string | null>(null);
  const [selectedWorstForPlay, setSelectedWorstForPlay] = useState<string | null>(null);

  // 評価済みの音声サンプルのみを対象とする
  const evaluatedSamples = audioSamples.filter((sample) => {
    return evaluations.has(sample.id);
  });

  // 最良・最悪が選択されているかチェック
  const canSubmit = bestAudioId !== null && 
                   worstAudioId !== null && 
                   bestAudioId !== worstAudioId &&
                   bestReason.trim().length > 0 && 
                   worstReason.trim().length > 0 &&
                   hasPlayedBest &&
                   hasPlayedWorst;

  const handleSubmit = () => {
    if (!bestAudioId || !worstAudioId || bestAudioId === worstAudioId) return;

    addBestWorstComparison({
      bestAudioId,
      worstAudioId,
      bestReason,
      worstReason,
    });

    router.push('/survey/laddering');
  };

  if (evaluatedSamples.length < 2) {
    return (
      <SurveyLayout progress={getProgress()} showBack>
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">
            評価済みの音声サンプルが不足しています。
          </p>
          <Button onClick={() => router.push('/survey/evaluation')}>
            評価画面に戻る
          </Button>
        </div>
      </SurveyLayout>
    );
  }

  const bestAudio = audioSamples.find((a) => a.id === bestAudioId);
  const worstAudio = audioSamples.find((a) => a.id === worstAudioId);

  return (
    <SurveyLayout
      progress={getProgress()}
      showBack
      title="印象比較"
      subtitle="最も印象が良かった音と悪かった音を選択してください"
    >
      <div className="space-y-6">
        {/* 説明 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Music className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    評価グリッド法：最良・最悪音の比較
                  </h3>
                  <p className="text-sm text-blue-800 mb-2">
                    これまで評価していただいた走行音の中から、以下の2つを選択してください：
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li><strong>最も印象が良かった走行音</strong>：あなたが最も好印象を持った音</li>
                    <li><strong>最も印象が悪かった走行音</strong>：あなたが最も悪印象を持った音</li>
                  </ul>
                  <p className="text-sm text-blue-800 mt-3">
                    それぞれの音を再度聴いて、なぜその印象を持ったのか、具体的な理由を記述してください。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 最良音の選択 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white shadow-sm border-2 border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ThumbsUp className="w-5 h-5 text-emerald-600" />
                最も印象が良かった走行音
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={bestAudioId || ''}
                onValueChange={(value) => {
                  setBestAudioId(value);
                  setSelectedBestForPlay(value);
                  setHasPlayedBest(false);
                }}
              >
                {evaluatedSamples.map((sample) => (
                  <div key={sample.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={sample.id} id={`best-${sample.id}`} />
                    <Label
                      htmlFor={`best-${sample.id}`}
                      className="flex-1 cursor-pointer font-medium"
                    >
                      {sample.name}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {/* 選択された音の再生 */}
              {selectedBestForPlay && bestAudio && (
                <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <MediaPlayer
                    src={getMediaUrl(bestAudio.fileUrl)}
                    title={bestAudio.name}
                    onPlayComplete={() => setHasPlayedBest(true)}
                    compact={false}
                    mediaType={getMediaType(bestAudio.fileUrl)}
                    showVideo={true}
                  />
                  {!hasPlayedBest && (
                    <p className="text-sm text-amber-600 mt-2 text-center">
                      ⚠️ 音声を最後まで再生してください
                    </p>
                  )}
                </div>
              )}

              {/* 理由の記述 */}
              {bestAudioId && (
                <div className="mt-4">
                  <Label className="text-sm font-semibold mb-2 block">
                    なぜこの音が最も印象が良かったですか？
                  </Label>
                  <Textarea
                    value={bestReason}
                    onChange={(e) => setBestReason(e.target.value)}
                    placeholder="例：低音が響いていて重厚感があった。モーター音が心地よく、高級感を感じた。"
                    className="min-h-24"
                    disabled={!hasPlayedBest}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 最悪音の選択 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white shadow-sm border-2 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ThumbsDown className="w-5 h-5 text-red-600" />
                最も印象が悪かった走行音
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={worstAudioId || ''}
                onValueChange={(value) => {
                  setWorstAudioId(value);
                  setSelectedWorstForPlay(value);
                  setHasPlayedWorst(false);
                }}
              >
                {evaluatedSamples.map((sample) => (
                  <div key={sample.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={sample.id} id={`worst-${sample.id}`} />
                    <Label
                      htmlFor={`worst-${sample.id}`}
                      className="flex-1 cursor-pointer font-medium"
                    >
                      {sample.name}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {/* 選択された音の再生 */}
              {selectedWorstForPlay && worstAudio && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <MediaPlayer
                    src={getMediaUrl(worstAudio.fileUrl)}
                    title={worstAudio.name}
                    onPlayComplete={() => setHasPlayedWorst(true)}
                    compact={false}
                    mediaType={getMediaType(worstAudio.fileUrl)}
                    showVideo={true}
                  />
                  {!hasPlayedWorst && (
                    <p className="text-sm text-amber-600 mt-2 text-center">
                      ⚠️ 音声を最後まで再生してください
                    </p>
                  )}
                </div>
              )}

              {/* 理由の記述 */}
              {worstAudioId && (
                <div className="mt-4">
                  <Label className="text-sm font-semibold mb-2 block">
                    なぜこの音が最も印象が悪かったですか？
                  </Label>
                  <Textarea
                    value={worstReason}
                    onChange={(e) => setWorstReason(e.target.value)}
                    placeholder="例：高音が目立って耳障りだった。人工的な音で違和感があった。"
                    className="min-h-24"
                    disabled={!hasPlayedWorst}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ナビゲーション */}
        <NavigationButtons
          onNext={handleSubmit}
          nextLabel="ラダリングへ進む"
          nextDisabled={!canSubmit}
          showBack={false}
        />
      </div>
    </SurveyLayout>
  );
}

