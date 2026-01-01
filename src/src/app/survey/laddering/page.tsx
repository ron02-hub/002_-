'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SurveyLayout } from '@/components/layout/SurveyLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { NavigationButtons } from '@/components/layout/NavigationButtons';
import { useSurveyStore } from '@/stores/surveyStore';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, HelpCircle } from 'lucide-react';

export default function LadderingPage() {
  const router = useRouter();
  const { constructs, triads, addConstruct, getProgress } = useSurveyStore();

  // トライアドから抽出されたコンストラクトを取得
  const extractedConstructs = triads.map((triad) => ({
    similarity: triad.similarityReason,
    difference: triad.differenceReason,
  }));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [ladderUp, setLadderUp] = useState<string[]>([]);
  const [ladderDown, setLadderDown] = useState<string[]>([]);
  const [currentUpInput, setCurrentUpInput] = useState('');
  const [currentDownInput, setCurrentDownInput] = useState('');

  const currentConstruct = extractedConstructs[currentIndex];
  const isLast = currentIndex >= extractedConstructs.length - 1;

  const handleAddUp = () => {
    if (currentUpInput.trim()) {
      setLadderUp([...ladderUp, currentUpInput.trim()]);
      setCurrentUpInput('');
    }
  };

  const handleAddDown = () => {
    if (currentDownInput.trim()) {
      setLadderDown([...ladderDown, currentDownInput.trim()]);
      setCurrentDownInput('');
    }
  };

  const handleNext = () => {
    if (currentConstruct) {
      // コンストラクトを保存
      const triad = triads[currentIndex];
      if (triad) {
        addConstruct({
          triadId: '', // TODO: 実際のtriad IDを設定
          constructText: `${currentConstruct.similarity} / ${currentConstruct.difference}`,
          ladderUp: ladderUp.length > 0 ? ladderUp : undefined,
          ladderDown: ladderDown.length > 0 ? ladderDown : undefined,
          level: 'functional',
        });
      }
    }

    if (isLast) {
      router.push('/survey/interview');
    } else {
      setCurrentIndex(currentIndex + 1);
      setLadderUp([]);
      setLadderDown([]);
    }
  };

  if (extractedConstructs.length === 0) {
    return (
      <SurveyLayout progress={getProgress()} showBack>
        <div className="text-center py-12">
          <p className="text-slate-600">コンストラクトが見つかりませんでした。</p>
          <Button onClick={() => router.push('/survey/interview')} className="mt-4">
            次へ進む
          </Button>
        </div>
      </SurveyLayout>
    );
  }

  return (
    <SurveyLayout
      progress={getProgress()}
      showBack
      title={`ラダリング ${currentIndex + 1} / ${extractedConstructs.length}`}
      subtitle="コンストラクトを深掘りします"
    >
      <div className="space-y-6">
        {/* 現在のコンストラクト表示 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-slate-600">似ている点</Label>
                  <p className="font-medium text-slate-800 mt-1">
                    {currentConstruct.similarity}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-slate-600">違う点</Label>
                  <p className="font-medium text-slate-800 mt-1">
                    {currentConstruct.difference}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 上位概念探索 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowUp className="w-5 h-5 text-emerald-600" />
                上位概念探索
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  「なぜそれが重要ですか？」「それが得られるとどんな気持ちになりますか？」
                  という質問に答える形で、より抽象的な価値を探求してください。
                </p>
              </div>

              <div className="space-y-2">
                <Label>より上位の概念を入力（複数可）</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentUpInput}
                    onChange={(e) => setCurrentUpInput(e.target.value)}
                    placeholder="例：安心感、満足感、ステータス"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddUp();
                      }
                    }}
                  />
                  <Button onClick={handleAddUp} variant="outline">
                    追加
                  </Button>
                </div>
              </div>

              {ladderUp.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">入力済みの上位概念</Label>
                  <div className="flex flex-wrap gap-2">
                    {ladderUp.map((item, index) => (
                      <div
                        key={index}
                        className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm flex items-center gap-2"
                      >
                        {item}
                        <button
                          onClick={() => setLadderUp(ladderUp.filter((_, i) => i !== index))}
                          className="text-emerald-600 hover:text-emerald-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 下位概念探索 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowDown className="w-5 h-5 text-cyan-600" />
                下位概念探索
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  「具体的にはどういう音ですか？」「他に似た音の例はありますか？」
                  という質問に答える形で、より具体的な特徴を探求してください。
                </p>
              </div>

              <div className="space-y-2">
                <Label>より具体的な特徴を入力（複数可）</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentDownInput}
                    onChange={(e) => setCurrentDownInput(e.target.value)}
                    placeholder="例：低音が響く、モーター音が聞こえる"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDown();
                      }
                    }}
                  />
                  <Button onClick={handleAddDown} variant="outline">
                    追加
                  </Button>
                </div>
              </div>

              {ladderDown.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">入力済みの下位概念</Label>
                  <div className="flex flex-wrap gap-2">
                    {ladderDown.map((item, index) => (
                      <div
                        key={index}
                        className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm flex items-center gap-2"
                      >
                        {item}
                        <button
                          onClick={() => setLadderDown(ladderDown.filter((_, i) => i !== index))}
                          className="text-cyan-600 hover:text-cyan-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ナビゲーション */}
        <NavigationButtons
          onNext={handleNext}
          nextLabel={isLast ? 'ラダリングを完了する' : '次のコンストラクトへ'}
          showBack={false}
        />
      </div>
    </SurveyLayout>
  );
}

