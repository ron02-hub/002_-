'use client';

import { ReactNode } from 'react';
import { ProgressBar } from './ProgressBar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SurveyLayoutProps {
  children: ReactNode;
  progress?: number;
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function SurveyLayout({
  children,
  progress = 0,
  showBack = false,
  onBack,
  title,
  subtitle,
  className,
}: SurveyLayoutProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* スキップリンク */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-500 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      >
        メインコンテンツへスキップ
      </a>

      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200" role="banner">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {showBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="h-8 w-8"
                  aria-label="前のページに戻る"
                >
                  <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                </Button>
              )}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center" aria-hidden="true">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-slate-800 hidden sm:inline">
                  EV走行音アンケート
                </span>
              </div>
            </div>
            <div className="text-sm text-slate-500 tabular-nums" aria-live="polite" aria-atomic="true">
              {progress > 0 && (
                <span>
                  <span className="sr-only">進捗状況: </span>
                  {progress}% 完了
                </span>
              )}
            </div>
          </div>
          <ProgressBar 
            value={progress} 
            size="md" 
            showLabel={false}
            aria-label={`進捗: ${progress}%`}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </header>

      {/* メインコンテンツ */}
      <main 
        id="main-content"
        className={cn('max-w-3xl mx-auto px-4 py-8', className)}
        role="main"
      >
        {(title || subtitle) && (
          <div className="mb-8 text-center">
            {title && (
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-slate-600" role="doc-subtitle">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

