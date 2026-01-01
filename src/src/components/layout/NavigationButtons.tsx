'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationButtonsProps {
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
  nextDisabled?: boolean;
  backDisabled?: boolean;
  isLoading?: boolean;
  className?: string;
  showBack?: boolean;
}

export function NavigationButtons({
  onNext,
  onBack,
  nextLabel = '次へ',
  backLabel = '戻る',
  nextDisabled = false,
  backDisabled = false,
  isLoading = false,
  className,
  showBack = true,
}: NavigationButtonsProps) {
  return (
    <div className={cn(
      'flex gap-4 pt-6',
      showBack ? 'justify-between' : 'justify-end',
      className
    )}>
      {showBack && onBack && (
        <Button
          variant="outline"
          onClick={onBack}
          disabled={backDisabled || isLoading}
          className="min-w-24"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          {backLabel}
        </Button>
      )}
      
      {onNext && (
        <Button
          onClick={onNext}
          disabled={nextDisabled || isLoading}
          className={cn(
            'min-w-32 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600',
            !showBack && 'w-full'
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              処理中...
            </>
          ) : (
            <>
              {nextLabel}
              <ChevronRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}

