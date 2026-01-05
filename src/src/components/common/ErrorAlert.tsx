'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorAlert({
  title = 'エラー',
  message,
  onDismiss,
  className,
}: ErrorAlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <Alert 
      variant="destructive" 
      className={className}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex items-start justify-between gap-2">
        <span>{message}</span>
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-4 w-4 flex-shrink-0"
            aria-label="エラーメッセージを閉じる"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

