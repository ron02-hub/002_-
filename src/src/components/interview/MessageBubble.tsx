'use client';

import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
  type: 'system' | 'user';
  content: string;
  timestamp?: Date;
  isTyping?: boolean;
}

export function MessageBubble({
  type,
  content,
  timestamp,
  isTyping = false,
}: MessageBubbleProps) {
  const isSystem = type === 'system';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex gap-3',
        isSystem ? 'justify-start' : 'justify-end'
      )}
    >
      {isSystem && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}

      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isSystem
            ? 'bg-white border border-slate-200 text-slate-800'
            : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
        )}
      >
        {isTyping ? (
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        )}
        {timestamp && (
          <p className={cn(
            'text-xs mt-1',
            isSystem ? 'text-slate-500' : 'text-white/80'
          )}>
            {timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      {!isSystem && (
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-slate-600" />
        </div>
      )}
    </motion.div>
  );
}

