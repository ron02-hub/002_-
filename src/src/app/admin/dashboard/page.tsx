'use client';

import { useState, useEffect } from 'react';
import { SDRadarChart } from '@/components/analysis/SDRadarChart';
import { PurchaseIntentHistogram } from '@/components/analysis/PurchaseIntentHistogram';
import { CrossTabulation } from '@/components/analysis/CrossTabulation';
import { ValueTree } from '@/components/analysis/ValueTree';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import type { SDScores } from '@/types/survey';
import type { ValueNode } from '@/components/analysis/ValueTree';

export default function AdminDashboard() {
  const [sdData, setSdData] = useState<Array<{ name: string; scores: SDScores }>>([]);
  const [purchaseData, setPurchaseData] = useState<Array<{ audioName: string; distribution: number[] }>>([]);
  const [crossTabData, setCrossTabData] = useState<Array<{ row: string; columns: Record<string, number | string> }>>([]);
  const [valueTreeData, setValueTreeData] = useState<ValueNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalysisData();
  }, []);

  const fetchAnalysisData = async () => {
    setLoading(true);
    try {
      // SD法データ取得
      const sdResponse = await fetch('/api/analysis/sd-scores');
      const sdResult = await sdResponse.json();
      setSdData(sdResult.data || []);

      // 購買意欲データ取得
      const purchaseResponse = await fetch('/api/analysis/purchase-intent');
      const purchaseResult = await purchaseResponse.json();
      setPurchaseData(purchaseResult.data || []);

      // クロス集計データ取得
      const crossTabResponse = await fetch('/api/analysis/cross-tabulation');
      const crossTabResult = await crossTabResponse.json();
      setCrossTabData(crossTabResult.data || []);

      // 価値ツリーデータ取得
      const treeResponse = await fetch('/api/analysis/value-tree');
      const treeResult = await treeResponse.json();
      setValueTreeData(treeResult.data || []);
    } catch (error) {
      console.error('分析データの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `survey-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('エクスポートに失敗しました:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">分析データを読み込んでいます...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">分析ダッシュボード</h1>
            <p className="text-slate-600 mt-1">アンケート結果の統計分析</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={fetchAnalysisData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              更新
            </Button>
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              エクスポート
            </Button>
          </div>
        </div>

        {/* 統計サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">総回答者数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">完了率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">平均回答時間</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">コンストラクト数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        </div>

        {/* SD法レーダーチャート */}
        {sdData.length > 0 && (
          <SDRadarChart data={sdData} title="SD法評価結果（平均値）" />
        )}

        {/* 購買意欲分布 */}
        {purchaseData.length > 0 && (
          <PurchaseIntentHistogram data={purchaseData} />
        )}

        {/* クロス集計表 */}
        {crossTabData.length > 0 && (
          <CrossTabulation data={crossTabData} />
        )}

        {/* 価値ツリー */}
        {valueTreeData.length > 0 && (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>価値構造ツリー</CardTitle>
            </CardHeader>
            <CardContent>
              <ValueTree data={valueTreeData} width={1000} height={600} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

