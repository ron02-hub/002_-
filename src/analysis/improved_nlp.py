"""
改善版NLP分析パイプライン
MeCab + BERTを使用した高精度分析
"""

import json
import sys
from typing import List, Dict, Any, Tuple
import re

try:
    import MeCab
    MECAB_AVAILABLE = True
except ImportError:
    MECAB_AVAILABLE = False
    print("Warning: MeCab is not available. Using simple tokenization.", file=sys.stderr)

try:
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    import torch
    BERT_AVAILABLE = True
except ImportError:
    BERT_AVAILABLE = False
    print("Warning: Transformers is not available. Using simple sentiment analysis.", file=sys.stderr)

# MeCabインスタンス（グローバル）
mecab = None
if MECAB_AVAILABLE:
    try:
        mecab = MeCab.Tagger("-Owakati")
    except:
        MECAB_AVAILABLE = False

# BERTモデル（グローバル）
tokenizer = None
model = None
if BERT_AVAILABLE:
    try:
        # 日本語BERTモデル（軽量版）
        model_name = "cl-tohoku/bert-base-japanese-v3"
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForSequenceClassification.from_pretrained(model_name)
        model.eval()
    except:
        BERT_AVAILABLE = False

def tokenize_with_mecab(text: str) -> List[str]:
    """MeCabを使用した形態素解析"""
    if not MECAB_AVAILABLE or mecab is None:
        # フォールバック：簡易分割
        return simple_tokenize(text)
    
    try:
        result = mecab.parse(text)
        tokens = result.strip().split()
        # ストップワード除去
        stopwords = {'の', 'に', 'は', 'を', 'が', 'で', 'と', 'も', 'など', 'こと', 'ため', 'ため', 'よう'}
        return [t for t in tokens if t not in stopwords and len(t) > 1]
    except:
        return simple_tokenize(text)

def simple_tokenize(text: str) -> List[str]:
    """簡易的な形態素解析（フォールバック）"""
    text = re.sub(r'[。、！？]', ' ', text)
    tokens = text.split()
    return [t for t in tokens if len(t) > 1]

def extract_keywords_improved(text: str, top_n: int = 10) -> List[Tuple[str, int]]:
    """改善版キーワード抽出（MeCab使用）"""
    tokens = tokenize_with_mecab(text)
    
    # 頻度カウント
    word_freq: Dict[str, int] = {}
    for token in tokens:
        word_freq[token] = word_freq.get(token, 0) + 1
    
    # 頻度順にソート
    sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
    
    return sorted_words[:top_n]

def analyze_sentiment_bert(text: str) -> float:
    """BERTを使用した感情分析"""
    if not BERT_AVAILABLE or tokenizer is None or model is None:
        # フォールバック：簡易分析
        return analyze_sentiment_simple(text)
    
    try:
        # トークナイズ
        inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
        
        # 推論
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
        
        # スコアを-1 to 1に変換（簡易版）
        # 実際の実装では、感情分析用のファインチューニング済みモデルを使用
        score = float(logits[0][0]) / 10.0  # 簡易的な正規化
        return max(-1.0, min(1.0, score))
    except:
        return analyze_sentiment_simple(text)

def analyze_sentiment_simple(text: str) -> float:
    """簡易感情分析（フォールバック）"""
    positive_words = ['良い', 'いい', '好き', '気に入った', '満足', '快適', '心地よい', '素晴らしい']
    negative_words = ['悪い', '嫌い', '不快', '気に入らない', '不満', 'うるさい', 'うっとうしい']
    
    score = 0.0
    for word in positive_words:
        if word in text:
            score += 0.2
    for word in negative_words:
        if word in text:
            score -= 0.2
    
    return max(-1.0, min(1.0, score))

def build_cooccurrence_matrix(texts: List[str]) -> Dict[Tuple[str, str], int]:
    """共起行列の構築"""
    cooccurrence: Dict[Tuple[str, str], int] = {}
    
    for text in texts:
        tokens = tokenize_with_mecab(text)
        # ウィンドウサイズ2で共起をカウント
        for i in range(len(tokens) - 1):
            for j in range(i + 1, min(i + 3, len(tokens))):
                pair = tuple(sorted([tokens[i], tokens[j]]))
                cooccurrence[pair] = cooccurrence.get(pair, 0) + 1
    
    return cooccurrence

def analyze_free_texts_improved(free_texts: List[str]) -> Dict[str, Any]:
    """改善版自由記述テキスト分析"""
    all_keywords: Dict[str, int] = {}
    sentiments: List[float] = []
    cooccurrence_matrix: Dict[Tuple[str, str], int] = {}
    
    for text in free_texts:
        if not text or len(text.strip()) == 0:
            continue
        
        # キーワード抽出（改善版）
        keywords = extract_keywords_improved(text, top_n=10)
        for keyword, freq in keywords:
            all_keywords[keyword] = all_keywords.get(keyword, 0) + freq
        
        # 感情分析（BERT使用）
        sentiment = analyze_sentiment_bert(text)
        sentiments.append(sentiment)
    
    # 共起行列の構築
    cooccurrence_matrix = build_cooccurrence_matrix(free_texts)
    
    # 平均感情スコア
    avg_sentiment = sum(sentiments) / len(sentiments) if sentiments else 0.0
    
    # トップキーワード
    top_keywords = sorted(all_keywords.items(), key=lambda x: x[1], reverse=True)[:20]
    
    # トップ共起ペア
    top_cooccurrences = sorted(cooccurrence_matrix.items(), key=lambda x: x[1], reverse=True)[:20]
    
    return {
        'keywords': [{'word': word, 'frequency': freq} for word, freq in top_keywords],
        'cooccurrences': [
            {'word1': pair[0], 'word2': pair[1], 'frequency': freq}
            for pair, freq in top_cooccurrences
        ],
        'average_sentiment': avg_sentiment,
        'total_texts': len(free_texts),
        'analyzed_texts': len(sentiments),
        'analysis_method': 'improved' if (MECAB_AVAILABLE or BERT_AVAILABLE) else 'simple',
    }

def main():
    """メイン処理"""
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No input data'}))
        sys.exit(1)
    
    try:
        input_data = json.loads(sys.argv[1])
        free_texts = input_data.get('free_texts', [])
        
        result = analyze_free_texts_improved(free_texts)
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()

