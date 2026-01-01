import { useEffect, useCallback } from 'react';
import { useSurveyStore } from '@/stores/surveyStore';

/**
 * アンケートの中断・再開機能を提供するフック
 */
export function useSurveyPersistence() {
  const {
    sessionId,
    currentPhase,
    evaluations,
    triads,
    constructs,
    interviewHistory,
  } = useSurveyStore();

  // 自動保存
  useEffect(() => {
    if (!sessionId) return;

    const saveToLocalStorage = () => {
      const data = {
        sessionId,
        currentPhase,
        evaluations: Array.from(evaluations.entries()),
        triads,
        constructs,
        interviewHistory,
        savedAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem(`survey-${sessionId}`, JSON.stringify(data));
      } catch (error) {
        console.error('Failed to save survey progress:', error);
      }
    };

    // 定期的に保存（30秒ごと）
    const interval = setInterval(saveToLocalStorage, 30000);

    // ページ離脱時にも保存
    window.addEventListener('beforeunload', saveToLocalStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', saveToLocalStorage);
    };
  }, [sessionId, currentPhase, evaluations, triads, constructs, interviewHistory]);

  // 保存済みデータの復元
  const restoreFromLocalStorage = useCallback((sessionId: string) => {
    try {
      const saved = localStorage.getItem(`survey-${sessionId}`);
      if (!saved) return null;

      const data = JSON.parse(saved);
      return data;
    } catch (error) {
      console.error('Failed to restore survey progress:', error);
      return null;
    }
  }, []);

  // 保存済みデータの削除
  const clearSavedData = useCallback((sessionId: string) => {
    try {
      localStorage.removeItem(`survey-${sessionId}`);
    } catch (error) {
      console.error('Failed to clear saved data:', error);
    }
  }, []);

  return {
    restoreFromLocalStorage,
    clearSavedData,
  };
}

