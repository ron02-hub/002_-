'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Headphones, 
  Clock, 
  Shield, 
  Zap,
  ChevronRight,
  Volume2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: Clock,
      title: '所要時間 約45分',
      description: '音声を聴きながらゆっくりお答えください',
    },
    {
      icon: Headphones,
      title: 'ヘッドホン推奨',
      description: '高品質な音声をお楽しみいただくために',
    },
    {
      icon: Shield,
      title: '個人情報保護',
      description: '回答は統計処理され個人は特定されません',
    },
  ];

  const handleStart = () => {
    const params = new URLSearchParams(window.location.search);
    const queryString = params.toString();
    const targetUrl = `/survey/consent${queryString ? `?${queryString}` : ''}`;
    router.push(targetUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* 背景アニメーション */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* サウンドウェーブパターン */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="soundwave" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M0 50 Q25 30 50 50 T100 50" stroke="currentColor" strokeWidth="1" fill="none" />
              <path d="M0 60 Q25 40 50 60 T100 60" stroke="currentColor" strokeWidth="0.5" fill="none" />
              <path d="M0 40 Q25 20 50 40 T100 40" stroke="currentColor" strokeWidth="0.5" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#soundwave)" />
        </svg>
      </div>

      <div className="relative z-10">
        {/* ヘッダー */}
        <header className="pt-8 px-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                <Zap className="w-5 h-5 text-slate-900" />
              </div>
              <span className="font-semibold text-lg">EV Sound Survey</span>
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            {/* ヒーローセクション */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8"
              >
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-300">あなたの声が未来のEVを創る</span>
              </motion.div>

              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-emerald-200 to-cyan-200 bg-clip-text text-transparent">
                  EV走行音
                </span>
                <br />
                <span className="text-white/90">アンケート調査</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
                電気自動車の走行音に対するあなたの印象をお聞かせください。
                <br className="hidden md:block" />
                いくつかの音声を聴いていただき、感じたことを自由にお答えいただきます。
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  onClick={handleStart}
                  size="lg"
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-900 font-semibold px-8 py-6 text-lg rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:scale-105"
                >
                  アンケートを開始する
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </motion.div>

            {/* 特徴カード */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="grid md:grid-cols-3 gap-6"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
                        <feature.icon className="w-6 h-6 text-emerald-400" />
                      </div>
                      <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                      <p className="text-sm text-slate-400">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* 調査概要 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-16 text-center"
            >
              <div className="inline-block px-6 py-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                <p className="text-sm text-slate-400 mb-2">本調査について</p>
                <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
                  この調査は、電気自動車の走行音デザインに関する研究の一環として実施しています。
                  ご回答いただいた内容は、より良いEV体験の創出に活用させていただきます。
                </p>
              </div>
            </motion.div>
          </div>
        </main>

        {/* フッター */}
        <footer className="absolute bottom-0 left-0 right-0 py-6 px-6">
          <div className="max-w-4xl mx-auto text-center text-sm text-slate-500">
            © 2026 EV Sound Survey Project
          </div>
        </footer>
      </div>
    </div>
  );
}
