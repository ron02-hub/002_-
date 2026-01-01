# Phase 3 改善実装ガイド

## 概要
Phase 3で実装した分析機能の改善を実施しました。

## 実装済み改善

### 1. 改善版NLP分析
- **ファイル**: `analysis/improved_nlp.py`
- **機能**:
  - MeCab統合準備（フォールバック付き）
  - BERT感情分析準備（フォールバック付き）
  - 共起ネットワーク分析機能追加
- **使用方法**:
  ```bash
  python3 analysis/improved_nlp.py '{"free_texts": ["テキスト1", "テキスト2"]}'
  ```

### 2. 因子分析機能
- **ファイル**: `analysis/factor_analysis.py`
- **機能**:
  - scikit-learnを使用した因子分析
  - 因子負荷量の計算
  - 説明分散の算出
- **API**: `/api/analysis/factor-analysis`
- **使用方法**:
  ```bash
  python3 analysis/factor_analysis.py '{"sd_scores": [[...], [...]]}'
  ```

## セットアップ手順

### Python環境のセットアップ

```bash
# 仮想環境の作成
cd src/analysis
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係のインストール
pip install -r requirements.txt
```

### MeCabのインストール（オプション）

```bash
# macOS
brew install mecab mecab-ipadic

# Pythonバインディング
pip install mecab-python3
```

### BERTモデルのダウンロード（オプション）

初回実行時に自動的にダウンロードされますが、事前にダウンロードすることも可能です：

```python
from transformers import AutoTokenizer, AutoModelForSequenceClassification

model_name = "cl-tohoku/bert-base-japanese-v3"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)
```

## 改善の優先度

### 高優先度（実装済み）
- ✅ 因子分析機能
- ✅ 改善版NLP分析（フォールバック付き）

### 中優先度（準備済み）
- 🔄 MeCab統合（ライブラリインストールが必要）
- 🔄 BERT感情分析（モデルダウンロードが必要）

### 低優先度（将来実装）
- ⏳ 共起ネットワーク可視化
- ⏳ クラスター分析
- ⏳ 時系列分析

## トラブルシューティング

### MeCabがインストールされていない場合
- 簡易版の形態素解析が自動的に使用されます
- エラーメッセージは表示されますが、処理は継続します

### BERTモデルがダウンロードできない場合
- 簡易版の感情分析が自動的に使用されます
- 初回実行時に時間がかかる場合があります

### scikit-learnがインストールされていない場合
- 因子分析APIはエラーを返します
- `pip install scikit-learn` でインストールしてください

## 更新履歴

| 日付 | バージョン | 更新内容 |
|------|-----------|----------|
| 2026-01-01 | 1.0.0 | Phase 3改善実装完了 |

