'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SurveyLayout } from '@/components/layout/SurveyLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MediaPlayer } from '@/components/media/MediaPlayer';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useSurveyStore } from '@/stores/surveyStore';
import { motion } from 'framer-motion';
import { 
  ChevronRight, 
  Headphones, 
  Volume2, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// 音声テストの選択肢
const AUDIO_OPTIONS = [
  { id: 'cat', label: '猫の鳴き声', isCorrect: true },
  { id: 'dog', label: '犬の鳴き声', isCorrect: false },
  { id: 'bird', label: '鳥のさえずり', isCorrect: false },
  { id: 'car', label: '車のエンジン音', isCorrect: false },
  { id: 'rain', label: '雨の音', isCorrect: false },
] as const;

export default function AudioCheckPage() {
  const router = useRouter();
  const { setHeadphoneChecked } = useSurveyStore();
  const [hasPlayed, setHasPlayed] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // テストモードの確認
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('test') === 'true') {
        console.log('[TestMode] Audio check bypassed');
        setHasPlayed(true);
      }
    }
  }, []);

  const handlePlayComplete = () => {
    setHasPlayed(true);
  };

  const handleContinue = () => {
    // 猫の鳴き声（正解）を選んだ場合のみ先に進める
    if (selectedAnswer === 'cat') {
      setHeadphoneChecked(true);
      const params = new URLSearchParams(window.location.search);
      const queryString = params.toString();
      const targetUrl = `/survey/evaluation${queryString ? `?${queryString}` : ''}`;
      router.push(targetUrl);
    }
  };

  // テスト用の音声URL（音声テストディレクトリのファイルを使用）
  const testMediaUrl = '/api/media/files/猫の鳴き声2.mp3?type=audio-test';
  const isCorrectAnswer = selectedAnswer === 'cat';

  return (
    <SurveyLayout
      progress={12}
      showBack
      title="音声の確認"
      subtitle="アンケートを始める前に、音声が正しく再生されることを確認します"
    >
      <div className="space-y-6">
        {/* ヘッドホン推奨 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-r from-emerald-50 to-cyan-50 border-emerald-200">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Headphones className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">
                    ヘッドホン・イヤホンの使用をお勧めします
                  </h3>
                  <p className="text-sm text-slate-600">
                    音声の細かなニュアンスを正確にお聴きいただくため、
                    静かな環境でヘッドホンまたはイヤホンをご使用ください。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 音声テスト */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white shadow-sm">
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-emerald-600" />
                <h2 className="font-semibold text-slate-800">
                  Step 1: テスト音声を再生
                </h2>
              </div>

              <p className="text-slate-600">
                下の再生ボタンを押して、テスト音声を再生してください。
                音声が正しく再生されることを確認し、適切な音量に調整してください。
              </p>

              <MediaPlayer
                src={testMediaUrl}
                title="テスト音声"
                onPlayComplete={handlePlayComplete}
                mediaType="audio"
                showVideo={false}
              />

              {!hasPlayed && (
                <p className="text-sm text-amber-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  音声を最後まで再生してください
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 確認質問 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: hasPlayed ? 1 : 0.5, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className={`bg-white shadow-sm ${!hasPlayed ? 'opacity-50 pointer-events-none' : ''}`}>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h2 className="font-semibold text-slate-800">
                  Step 2: 聞こえた音声は何でしたか？
                </h2>
              </div>

              <p id="audio-check-help" className="text-slate-600 text-sm">
                再生した音声が何の音だったか、以下の選択肢から選んでください。
                {!hasPlayed && (
                  <span className="sr-only">音声を再生してから選択できます。</span>
                )}
              </p>

              <RadioGroup
                value={selectedAnswer || ''}
                onValueChange={setSelectedAnswer}
                disabled={!hasPlayed}
                className="space-y-3"
                aria-label="音声の種類を選択"
                aria-required="true"
                aria-describedby={!hasPlayed ? 'audio-check-help' : undefined}
              >
                {AUDIO_OPTIONS.map((option) => (
                  <div
                    key={option.id}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                      selectedAnswer === option.id
                        ? option.isCorrect
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label
                      htmlFor={option.id}
                      className="flex-1 cursor-pointer font-medium text-slate-800 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2 rounded"
                    >
                      {option.label}
                    </Label>
                    {selectedAnswer === option.id && (
                      <div className="flex-shrink-0" aria-hidden="true">
                        {option.isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </RadioGroup>

              {selectedAnswer && !isCorrectAnswer && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-red-50 border border-red-200 rounded-lg"
                  role="alert"
                  aria-live="assertive"
                  aria-atomic="true"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <h4 className="font-medium text-red-800 mb-1">
                        正しくありません
                      </h4>
                      <p className="text-sm text-red-700">
                        もう一度音声を再生して、正しい答えを選んでください。
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {selectedAnswer && isCorrectAnswer && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <h4 className="font-medium text-emerald-800 mb-1">
                        正解です！
                      </h4>
                      <p className="text-sm text-emerald-700">
                        音声が正しく聞こえていることが確認できました。次へ進むことができます。
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 次へボタン */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="pt-4"
        >
          <Button
            onClick={handleContinue}
            disabled={!isCorrectAnswer}
            size="lg"
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium disabled:opacity-50"
            aria-describedby="continue-help-text"
          >
            音声評価を開始する
            <ChevronRight className="w-5 h-5 ml-2" aria-hidden="true" />
          </Button>
          <p id="continue-help-text" className="sr-only">
            {!isCorrectAnswer ? '正しい答えを選択すると次へ進めます。' : '次へ進む準備ができました。'}
          </p>
        </motion.div>
      </div>
    </SurveyLayout>
  );
}

