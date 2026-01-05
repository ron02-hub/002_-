'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SurveyLayout } from '@/components/layout/SurveyLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useSurveyStore } from '@/stores/surveyStore';
import { motion } from 'framer-motion';
import { Shield, FileText, Headphones, ChevronRight } from 'lucide-react';

export default function ConsentPage() {
  const router = useRouter();
  const { initSession, setConsent } = useSurveyStore();

  const [agreements, setAgreements] = useState({
    agreeTerms: false,
    agreeDataUsage: false,
    agreeAudioPlayback: false,
  });

  const allAgreed = Object.values(agreements).every(Boolean);

  useEffect(() => {
    initSession();
  }, [initSession]);

  const handleSubmit = () => {
    if (allAgreed) {
      setConsent(agreements);
      const params = new URLSearchParams(window.location.search);
      const queryString = params.toString();
      const targetUrl = `/survey/demographics${queryString ? `?${queryString}` : ''}`;
      router.push(targetUrl);
    }
  };

  const consentItems = [
    {
      key: 'agreeTerms' as const,
      icon: FileText,
      title: '調査への参加同意',
      description: '本調査の目的を理解し、自発的に参加することに同意します。途中で回答を中止することも可能です。',
    },
    {
      key: 'agreeDataUsage' as const,
      icon: Shield,
      title: 'データの取り扱いについて',
      description: '回答データは統計処理され、研究・製品開発に活用されます。個人を特定できる情報は収集しません。',
    },
    {
      key: 'agreeAudioPlayback' as const,
      icon: Headphones,
      title: '音声の再生について',
      description: 'アンケート中に複数の走行音が再生されます。適切な音量でお聴きいただくため、ヘッドホンの使用を推奨します。',
    },
  ];

  return (
    <SurveyLayout
      progress={5}
      title="アンケート参加への同意"
      subtitle="本調査にご参加いただく前に、以下の内容をご確認ください"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              調査概要
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-600 space-y-4">
            <p>
              本調査は、電気自動車（EV）の走行音に対するユーザーの印象を調査することを目的としています。
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>所要時間は約45分です</li>
              <li>複数のEV走行音を聴いていただき、印象を評価します</li>
              <li>回答は匿名で処理され、個人は特定されません</li>
              <li>途中で回答を中止することができます</li>
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {consentItems.map((item, index) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
            >
              <Card 
                className={`transition-colors cursor-pointer ${
                  agreements[item.key] 
                    ? 'bg-emerald-50 border-emerald-200' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => setAgreements(prev => ({
                  ...prev,
                  [item.key]: !prev[item.key]
                }))}
              >
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      agreements[item.key]
                        ? 'bg-emerald-100'
                        : 'bg-slate-100'
                    }`}>
                      <item.icon className={`w-5 h-5 ${
                        agreements[item.key]
                          ? 'text-emerald-600'
                          : 'text-slate-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={item.key}
                          checked={agreements[item.key]}
                          onCheckedChange={(checked) =>
                            setAgreements(prev => ({
                              ...prev,
                              [item.key]: checked === true
                            }))
                          }
                          className="mt-1"
                        />
                        <div>
                          <Label
                            htmlFor={item.key}
                            className="text-base font-medium text-slate-800 cursor-pointer"
                          >
                            {item.title}
                          </Label>
                          <p className="text-sm text-slate-500 mt-1">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-4"
        >
          <Button
            onClick={handleSubmit}
            disabled={!allAgreed}
            size="lg"
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            同意して次へ進む
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-center text-sm text-slate-500 mt-4">
            すべての項目に同意いただくと次へ進めます
          </p>
        </motion.div>
      </motion.div>
    </SurveyLayout>
  );
}

