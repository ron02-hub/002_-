'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SurveyLayout } from '@/components/layout/SurveyLayout';
import { ChatInterface } from '@/components/interview/ChatInterface';
import { NavigationButtons } from '@/components/layout/NavigationButtons';
import { useSurveyStore } from '@/stores/surveyStore';
import { generateNextQuestion, estimateSentiment, extractKeywords } from '@/lib/interview';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import type { InterviewMessage } from '@/types/survey';

const INTERVIEW_TOPICS = ['favorite', 'purchase', 'ideal'] as const;
type InterviewTopic = typeof INTERVIEW_TOPICS[number];

export default function InterviewPage() {
  const router = useRouter();
  const {
    interviewHistory,
    addInterviewMessage,
    setCurrentTopic,
    getProgress,
    evaluations,
  } = useSurveyStore();

  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [depthLevel, setDepthLevel] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [previousAnswers, setPreviousAnswers] = useState<string[]>([]);

  const currentTopic = INTERVIEW_TOPICS[currentTopicIndex];
  const isLastTopic = currentTopicIndex >= INTERVIEW_TOPICS.length - 1;

  // 最初の質問を表示
  useEffect(() => {
    if (interviewHistory.length === 0) {
      const firstQuestion = generateNextQuestion({
        previousAnswers: [],
        currentTopic,
        depthLevel: 0,
      });
      addInterviewMessage({
        type: 'system',
        content: `ここまでの評価、お疲れ様でした。最後に、もう少し詳しくお話を聞かせてください。\n\n${firstQuestion}`,
        topic: currentTopic,
        depthLevel: 0,
      });
      setCurrentTopic(currentTopic);
    }
  }, []);

  const handleSendMessage = async (message: string) => {
    // ユーザーメッセージを追加
    addInterviewMessage({
      type: 'user',
      content: message,
      topic: currentTopic,
      depthLevel,
    });

    setPreviousAnswers([...previousAnswers, message]);
    setIsLoading(true);

    // 少し待ってから次の質問を生成（タイピングアニメーション効果）
    setTimeout(() => {
      const nextQuestion = generateNextQuestion({
        previousAnswers: [...previousAnswers, message],
        currentTopic,
        depthLevel: depthLevel + 1,
      });

      // 深度レベルを更新
      if (depthLevel >= 2) {
        // このトピックが完了
        if (isLastTopic) {
          // すべてのトピックが完了
          addInterviewMessage({
            type: 'system',
            content: '貴重なご意見をありがとうございました。最後に、全体を通して追加で伝えたいことはありますか？',
            topic: 'closing',
            depthLevel: 0,
          });
        } else {
          // 次のトピックへ
          setCurrentTopicIndex(currentTopicIndex + 1);
          setDepthLevel(0);
          setPreviousAnswers([]);
          const nextTopic = INTERVIEW_TOPICS[currentTopicIndex + 1];
          const topicQuestion = generateNextQuestion({
            previousAnswers: [],
            currentTopic: nextTopic,
            depthLevel: 0,
          });
          addInterviewMessage({
            type: 'system',
            content: topicQuestion,
            topic: nextTopic,
            depthLevel: 0,
          });
          setCurrentTopic(nextTopic);
        }
      } else {
        // 同じトピックで深掘り
        addInterviewMessage({
          type: 'system',
          content: nextQuestion,
          topic: currentTopic,
          depthLevel: depthLevel + 1,
        });
        setDepthLevel(depthLevel + 1);
      }

      setIsLoading(false);
    }, 1000);
  };

  const handleComplete = () => {
    router.push('/survey/complete');
  };

  const canComplete = interviewHistory.length > 0 && 
                     interviewHistory[interviewHistory.length - 1].type === 'system' &&
                     interviewHistory[interviewHistory.length - 1].topic === 'closing';

  return (
    <SurveyLayout
      progress={getProgress()}
      showBack
      title="デプスインタビュー"
      subtitle="対話形式で詳しくお聞かせください"
    >
      <div className="space-y-6">
        {/* 説明 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                対話形式のインタビュー
              </h3>
              <p className="text-sm text-blue-800">
                チャット形式で、走行音について詳しくお聞かせください。
                具体的なエピソードや例を交えて答えると、より深い洞察につながります。
              </p>
            </div>
          </div>
        </motion.div>

        {/* チャットインターフェース */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="h-[500px]"
        >
          <ChatInterface
            messages={interviewHistory}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            disabled={canComplete}
          />
        </motion.div>

        {/* 完了ボタン */}
        {canComplete && (
          <NavigationButtons
            onNext={handleComplete}
            nextLabel="アンケートを完了する"
            showBack={false}
          />
        )}
      </div>
    </SurveyLayout>
  );
}

