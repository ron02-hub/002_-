'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SurveyLayout } from '@/components/layout/SurveyLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSurveyStore } from '@/stores/surveyStore';
import { useSurveyPersistence } from '@/hooks/useSurveyPersistence';
import { Clock, Play, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function ResumePage() {
  const router = useRouter();
  const { sessionId, setPhase } = useSurveyStore();
  const { restoreFromLocalStorage, clearSavedData } = useSurveyPersistence();
  const [savedSessions, setSavedSessions] = useState<Array<{
    sessionId: string;
    currentPhase: string;
    savedAt: string;
  }>>([]);

  useEffect(() => {
    // 保存済みセッションを検索
    const sessions: Array<{
      sessionId: string;
      currentPhase: string;
      savedAt: string;
    }> = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('survey-')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.sessionId && data.savedAt) {
            sessions.push({
              sessionId: data.sessionId,
              currentPhase: data.currentPhase || 'welcome',
              savedAt: data.savedAt,
            });
          }
        } catch {
          // 無効なデータはスキップ
        }
      }
    }

    setSavedSessions(sessions.sort((a, b) => 
      new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    ));
  }, []);

  const handleResume = (targetSessionId: string) => {
    const data = restoreFromLocalStorage(targetSessionId);
    if (data) {
      // ストアに復元（簡易版）
      setPhase(data.currentPhase as any);
      router.push(`/survey/${data.currentPhase}`);
    }
  };

  const handleDelete = (targetSessionId: string) => {
    clearSavedData(targetSessionId);
    setSavedSessions(savedSessions.filter(s => s.sessionId !== targetSessionId));
  };

  const getPhaseName = (phase: string) => {
    const names: Record<string, string> = {
      welcome: '開始前',
      consent: '同意',
      demographics: '属性入力',
      'audio-check': '音声チェック',
      evaluation: '音声評価',
      triad: 'トライアド比較',
      laddering: 'ラダリング',
      interview: 'インタビュー',
      complete: '完了',
    };
    return names[phase] || '不明'];
  };

  if (savedSessions.length === 0) {
    return (
      <SurveyLayout progress={0} showBack={false} title="中断したアンケート">
        <Card className="bg-white shadow-sm">
          <CardContent className="pt-6 text-center py-12">
            <p className="text-slate-600 mb-4">保存されたアンケートはありません</p>
            <Button onClick={() => router.push('/')}>
              新しいアンケートを開始
            </Button>
          </CardContent>
        </Card>
      </SurveyLayout>
    );
  }

  return (
    <SurveyLayout progress={0} showBack={false} title="中断したアンケートを再開">
      <div className="space-y-4">
        {savedSessions.map((session) => (
          <Card key={session.sessionId} className="bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-500">
                      {formatDistanceToNow(new Date(session.savedAt), {
                        addSuffix: true,
                        locale: ja,
                      })}
                    </span>
                  </div>
                  <p className="font-medium text-slate-800">
                    進捗: {getPhaseName(session.currentPhase)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleResume(session.sessionId)}
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    再開
                  </Button>
                  <Button
                    onClick={() => handleDelete(session.sessionId)}
                    variant="outline"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SurveyLayout>
  );
}

