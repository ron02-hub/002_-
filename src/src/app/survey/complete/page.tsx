'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SurveyLayout } from '@/components/layout/SurveyLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSurveyStore } from '@/stores/surveyStore';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

export default function CompletePage() {
  const router = useRouter();
  const { completedAt, getProgress } = useSurveyStore();

  useEffect(() => {
    // 完了時刻を記録
    if (!completedAt) {
      // TODO: APIに完了を送信
    }
  }, [completedAt]);

  return (
    <SurveyLayout
      progress={100}
      showBack={false}
      title=""
      subtitle=""
    >
      <div className="max-w-2xl mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            アンケート完了
          </h1>
          <p className="text-lg text-slate-600">
            ご協力ありがとうございました！
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-emerald-50 to-cyan-50 border-emerald-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Sparkles className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-semibold text-slate-800 mb-2">
                    あなたの声が未来のEVを創ります
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    ご回答いただいた内容は、電気自動車の走行音デザインの改善に活用させていただきます。
                    より良いEV体験の創出に向けて、貴重なご意見をお寄せいただき、誠にありがとうございました。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 space-y-4"
        >
          <Button
            onClick={() => router.push('/')}
            size="lg"
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
          >
            トップページに戻る
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </SurveyLayout>
  );
}

