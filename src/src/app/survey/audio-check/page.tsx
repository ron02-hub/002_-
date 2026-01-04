'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SurveyLayout } from '@/components/layout/SurveyLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MediaPlayer } from '@/components/media/MediaPlayer';
import { useSurveyStore } from '@/stores/surveyStore';
import { motion } from 'framer-motion';
import { 
  ChevronRight, 
  Headphones, 
  Volume2, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AudioCheckPage() {
  const router = useRouter();
  const { setHeadphoneChecked } = useSurveyStore();
  const [hasPlayed, setHasPlayed] = useState(false);
  const [canHear, setCanHear] = useState<boolean | null>(null);

  const handlePlayComplete = () => {
    setHasPlayed(true);
  };

  const handleConfirmHearing = (heard: boolean) => {
    setCanHear(heard);
  };

  const handleContinue = () => {
    if (canHear) {
      setHeadphoneChecked(true);
      router.push('/survey/evaluation');
    }
  };

  // テスト用の音声URL
  const testAudioUrl = '/audio/samples/sample-a.mp3';

  return (
    <SurveyLayout
      progress={12}
      showBack
      title="動画・音声の確認"
      subtitle="アンケートを始める前に、動画・音声が正しく再生されることを確認します"
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
                    走行音の細かなニュアンスを正確にお聴きいただくため、
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
                  Step 1: テスト動画を再生
                </h2>
              </div>

              <p className="text-slate-600">
                下の再生ボタンを押して、テスト動画を再生してください。
                動画と音声が正しく再生されることを確認し、適切な音量に調整してください。
              </p>

              <MediaPlayer
                src={testMediaUrl}
                title="テスト動画"
                onPlayComplete={handlePlayComplete}
                mediaType="video"
                showVideo={true}
              />

              {!hasPlayed && (
                <p className="text-sm text-amber-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  動画を最後まで再生してください
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
                  Step 2: 動画・音声は正常に再生されましたか？
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={canHear === true ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => handleConfirmHearing(true)}
                  className={`h-auto py-6 ${
                    canHear === true 
                      ? 'bg-emerald-500 hover:bg-emerald-600' 
                      : 'hover:bg-emerald-50 hover:border-emerald-300'
                  }`}
                  disabled={!hasPlayed}
                >
                  <div className="text-center">
                    <CheckCircle2 className={`w-8 h-8 mx-auto mb-2 ${canHear === true ? 'text-white' : 'text-emerald-500'}`} />
                    <span className="block font-medium">
                      はい、聞こえました
                    </span>
                  </div>
                </Button>

                <Button
                  variant={canHear === false ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => handleConfirmHearing(false)}
                  className={`h-auto py-6 ${
                    canHear === false 
                      ? 'bg-amber-500 hover:bg-amber-600' 
                      : 'hover:bg-amber-50 hover:border-amber-300'
                  }`}
                  disabled={!hasPlayed}
                >
                  <div className="text-center">
                    <AlertCircle className={`w-8 h-8 mx-auto mb-2 ${canHear === false ? 'text-white' : 'text-amber-500'}`} />
                    <span className="block font-medium">
                      いいえ、聞こえません
                    </span>
                  </div>
                </Button>
              </div>

              {canHear === false && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-amber-50 border border-amber-200 rounded-lg"
                >
                  <h4 className="font-medium text-amber-800 mb-2">
                    動画・音声が再生されない場合
                  </h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• デバイスの音量が適切か確認してください</li>
                    <li>• ヘッドホン/イヤホンが正しく接続されているか確認してください</li>
                    <li>• ブラウザの音声設定がミュートになっていないか確認してください</li>
                    <li>• 動画コーデック（H.264など）がサポートされているか確認してください</li>
                    <li>• 別のブラウザでお試しください</li>
                  </ul>
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
            disabled={canHear !== true}
            size="lg"
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium disabled:opacity-50"
          >
            動画評価を開始する
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </SurveyLayout>
  );
}

