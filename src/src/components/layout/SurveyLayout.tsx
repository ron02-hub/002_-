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
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {showBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              )}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-slate-800 hidden sm:inline">
                  EV走行音アンケート
                </span>
              </div>
            </div>
            <div className="text-sm text-slate-500 tabular-nums">
              {progress > 0 && `${progress}% 完了`}
            </div>
          </div>
          <ProgressBar value={progress} size="md" showLabel={false} />
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className={cn('max-w-3xl mx-auto px-4 py-8', className)}>
        {(title || subtitle) && (
          <div className="mb-8 text-center">
            {title && (
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-slate-600">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

