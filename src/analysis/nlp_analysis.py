"""
NLP分析パイプライン
日本語の自由記述テキストを分析
"""

import json
import sys
from typing import List, Dict, Any
import re

# 簡易版の形態素解析（実際の実装ではMeCabを使用）
def simple_tokenize(text: str) -> List[str]:
    """簡易的な形態素解析（スペース・句読点で分割）"""
    # 日本語の句読点で分割
    text = re.sub(r'[。、！？]', ' ', text)
    # スペースで分割
    tokens = text.split()
    return [t for t in tokens if len(t) > 1]

def extract_keywords(text: str, top_n: int = 10) -> List[str]:
    """キーワード抽出（簡易版）"""
    tokens = simple_tokenize(text)
    
    # ストップワード
    stopwords = {'の', 'に', 'は', 'を', 'が', 'で', 'と', 'も', 'など', 'こと', 'ため'}
    
    # 頻度カウント
    word_freq: Dict[str, int] = {}
    for token in tokens:
        if token not in stopwords:
            word_freq[token] = word_freq.get(token, 0) + 1
    
    # 頻度順にソート
    sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
    
    return [word for word, freq in sorted_words[:top_n]]

def analyze_sentiment(text: str) -> float:
    """感情分析（簡易版：-1 to 1）"""
    positive_words = ['良い', 'いい', '好き', '気に入った', '満足', '快適', '心地よい', '素晴らしい']
    negative_words = ['悪い', '嫌い', '不快', '気に入らない', '不満', 'うるさい', 'うっとうしい']
    
    text_lower = text.lower()
    score = 0.0
    
    for word in positive_words:
        if word in text:
            score += 0.2
    
    for word in negative_words:
        if word in text:
            score -= 0.2
    
    return max(-1.0, min(1.0, score))

def analyze_free_texts(free_texts: List[str]) -> Dict[str, Any]:
    """自由記述テキストの一括分析"""
    all_keywords: Dict[str, int] = {}
    sentiments: List[float] = []
    
    for text in free_texts:
        if not text or len(text.strip()) == 0:
            continue
        
        # キーワード抽出
        keywords = extract_keywords(text)
        for keyword in keywords:
            all_keywords[keyword] = all_keywords.get(keyword, 0) + 1
        
        # 感情分析
        sentiment = analyze_sentiment(text)
        sentiments.append(sentiment)
    
    # 平均感情スコア
    avg_sentiment = sum(sentiments) / len(sentiments) if sentiments else 0.0
    
    # トップキーワード
    top_keywords = sorted(all_keywords.items(), key=lambda x: x[1], reverse=True)[:20]
    
    return {
        'keywords': [{'word': word, 'frequency': freq} for word, freq in top_keywords],
        'average_sentiment': avg_sentiment,
        'total_texts': len(free_texts),
        'analyzed_texts': len(sentiments),
    }

def main():
    """メイン処理"""
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No input data'}))
        sys.exit(1)
    
    try:
        input_data = json.loads(sys.argv[1])
        free_texts = input_data.get('free_texts', [])
        
        result = analyze_free_texts(free_texts)
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()

