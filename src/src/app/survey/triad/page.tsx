'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { generateTriads, shuffleTriadOrder } from '@/lib/triad';
import { motion } from 'framer-motion';
import { Music, CheckCircle2, XCircle } from 'lucide-react';
import type { AudioSample } from '@/types/survey';

export default function TriadPage() {
  const router = useRouter();
  const {
    audioSamples,
    currentTriadIndex,
    addTriad,
    nextTriad,
    getProgress,
  } = useSurveyStore();

  const [triads, setTriads] = useState<Array<[AudioSample, AudioSample, AudioSample]>>([]);
  const [currentTriad, setCurrentTriad] = useState<[AudioSample, AudioSample, AudioSample] | null>(null);
  const [selectedPair, setSelectedPair] = useState<[string, string] | null>(null);
  const [differentOne, setDifferentOne] = useState<string | null>(null);
  const [similarityReason, setSimilarityReason] = useState('');
  const [differenceReason, setDifferenceReason] = useState('');
  const [hasPlayedAll, setHasPlayedAll] = useState(false);

  // トライアドを生成
  useEffect(() => {
    if (audioSamples.length >= 3 && triads.length === 0) {
      const generated = generateTriads(audioSamples, 3);
      setTriads(generated);
    }
  }, [audioSamples, triads.length]);

  // 現在のトライアドを設定
  useEffect(() => {
    if (triads.length > 0 && currentTriadIndex < triads.length) {
      const shuffled = shuffleTriadOrder(triads[currentTriadIndex]);
      setCurrentTriad(shuffled);
      setSelectedPair(null);
      setDifferentOne(null);
      setSimilarityReason('');
      setDifferenceReason('');
      setHasPlayedAll(false);
    }
  }, [triads, currentTriadIndex]);

  const handlePairSelect = (pair: [string, string]) => {
    setSelectedPair(pair);
    // 残りの1つを自動的に選択
    if (currentTriad) {
      const allIds = currentTriad.map((a) => a.id);
      const different = allIds.find((id) => !pair.includes(id));
      if (different) {
        setDifferentOne(different);
      }
    }
  };

  const canSubmit = selectedPair !== null && 
                   differentOne !== null && 
                   similarityReason.trim().length > 0 && 
                   differenceReason.trim().length > 0 &&
                   hasPlayedAll;

  const handleSubmit = () => {
    if (!currentTriad || !selectedPair || !differentOne) return;

    addTriad({
      audio1Id: currentTriad[0].id,
      audio2Id: currentTriad[1].id,
      audio3Id: currentTriad[2].id,
      similarPair: selectedPair,
      differentOne,
      similarityReason,
      differenceReason,
      triadOrder: currentTriadIndex + 1,
    });

    if (currentTriadIndex < 2) {
      nextTriad();
    } else {
      router.push('/survey/laddering');
    }
  };

  if (!currentTriad) {
    return (
      <SurveyLayout progress={getProgress()} showBack>
        <div className="text-center py-12">
          <p className="text-slate-600">トライアドを準備しています...</p>
        </div>
      </SurveyLayout>
    );
  }

  const [audio1, audio2, audio3] = currentTriad;
  const isLastTriad = currentTriadIndex >= 2;

  return (
    <SurveyLayout
      progress={getProgress()}
      showBack
      title={`トライアド比較 ${currentTriadIndex + 1} / 3`}
      subtitle="3つの走行音を比較してください"
    >
      <div className="space-y-6">
        {/* 説明 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Music className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    比較の手順
                  </h3>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>3つの音声をすべて聴いてください</li>
                    <li>2つが似ていて、1つが違うという組み合わせを見つけてください</li>
                    <li>似ている理由と違う理由を記入してください</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 音声プレーヤー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MediaPlayer
              src={getMediaUrl(audio1.fileUrl)}
              title={audio1.name}
              onPlayComplete={() => {
                setHasPlayedAll(true);
              }}
              compact={false}
              mediaType={getMediaType(audio1.fileUrl)}
              showVideo={true}
            />
            <MediaPlayer
              src={getMediaUrl(audio2.fileUrl)}
              title={audio2.name}
              onPlayComplete={() => {
                setHasPlayedAll(true);
              }}
              compact={false}
              mediaType={getMediaType(audio2.fileUrl)}
              showVideo={true}
            />
            <MediaPlayer
              src={getMediaUrl(audio3.fileUrl)}
              title={audio3.name}
              onPlayComplete={() => {
                setHasPlayedAll(true);
              }}
              compact={false}
              mediaType={getMediaType(audio3.fileUrl)}
              showVideo={true}
            />
          </div>
        </motion.div>

        {/* 類似ペア選択 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Step 1: 似ている2つを選択</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedPair ? selectedPair.join(',') : ''}
                onValueChange={(value) => {
                  const [id1, id2] = value.split(',');
                  handlePairSelect([id1, id2]);
                }}
                disabled={!hasPlayedAll}
                className="space-y-3"
              >
                {[
                  [audio1.id, audio2.id],
                  [audio1.id, audio3.id],
                  [audio2.id, audio3.id],
                ].map((pair) => {
                  const [id1, id2] = pair;
                  const sample1 = currentTriad.find((a) => a.id === id1);
                  const sample2 = currentTriad.find((a) => a.id === id2);
                  const pairKey = pair.join(',');

                  return (
                    <div key={pairKey}>
                      <RadioGroupItem
                        value={pairKey}
                        id={pairKey}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={pairKey}
                        className="flex items-center gap-3 px-4 py-3 border rounded-lg cursor-pointer transition-colors peer-data-[state=checked]:bg-emerald-50 peer-data-[state=checked]:border-emerald-500 hover:bg-slate-50"
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="font-medium">
                          {sample1?.name} と {sample2?.name}
                        </span>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>
        </motion.div>

        {/* 理由入力 */}
        {selectedPair && differentOne && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Step 2: 似ている理由</CardTitle>
                </CardHeader>
                <CardContent>
                  <Label className="text-sm text-slate-700 mb-2 block">
                    選択した2つが似ている点は何ですか？
                  </Label>
                  <Textarea
                    value={similarityReason}
                    onChange={(e) => setSimilarityReason(e.target.value)}
                    placeholder="例：両方とも低音が響いていて重厚感がある"
                    className="min-h-24"
                    disabled={!hasPlayedAll}
                  />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Step 3: 違う理由</CardTitle>
                </CardHeader>
                <CardContent>
                  <Label className="text-sm text-slate-700 mb-2 block">
                    {currentTriad.find((a) => a.id === differentOne)?.name}が違う点は何ですか？
                  </Label>
                  <Textarea
                    value={differenceReason}
                    onChange={(e) => setDifferenceReason(e.target.value)}
                    placeholder="例：高音が目立って軽快な印象"
                    className="min-h-24"
                    disabled={!hasPlayedAll}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}

        {/* ナビゲーション */}
        <NavigationButtons
          onNext={handleSubmit}
          nextLabel={isLastTriad ? '比較を完了する' : '次の比較へ'}
          nextDisabled={!canSubmit}
          showBack={false}
        />
      </div>
    </SurveyLayout>
  );
}

