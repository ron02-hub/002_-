"""
因子分析スクリプト
SD法データから因子を抽出
"""

import json
import sys
import numpy as np
from typing import List, Dict, Any

try:
    from sklearn.decomposition import FactorAnalysis
    from sklearn.preprocessing import StandardScaler
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("Warning: scikit-learn is not available.", file=sys.stderr)

def perform_factor_analysis(sd_scores: List[List[float]], n_factors: int = 3) -> Dict[str, Any]:
    """因子分析を実行"""
    if not SKLEARN_AVAILABLE:
        return {
            'factors': [],
            'loadings': [],
            'explained_variance': [],
            'error': 'scikit-learn is not available',
        }
    
    try:
        # データをnumpy配列に変換
        X = np.array(sd_scores)
        
        # 標準化
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # 因子分析
        fa = FactorAnalysis(n_components=n_factors, random_state=42)
        fa.fit(X_scaled)
        
        # 因子負荷量
        loadings = fa.components_.T.tolist()
        
        # 因子スコア
        factor_scores = fa.transform(X_scaled).tolist()
        
        # 説明分散（簡易版）
        explained_variance = np.var(factor_scores, axis=0).tolist()
        
        # 因子名（簡易版）
        scale_names = ['静か', '心地よい', '高級感', '先進的', '力強い', '安心', 'ワクワク', '自然']
        
        return {
            'factors': [
                {
                    'name': f'因子{i+1}',
                    'loadings': [
                        {
                            'scale': scale_names[j],
                            'loading': loadings[j][i],
                        }
                        for j in range(len(scale_names))
                    ],
                }
                for i in range(n_factors)
            ],
            'explained_variance': explained_variance,
            'factor_scores': factor_scores[:10],  # 最初の10件のみ
        }
    except Exception as e:
        return {
            'factors': [],
            'loadings': [],
            'explained_variance': [],
            'error': str(e),
        }

def main():
    """メイン処理"""
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No input data'}))
        sys.exit(1)
    
    try:
        input_data = json.loads(sys.argv[1])
        sd_scores = input_data.get('sd_scores', [])
        
        if len(sd_scores) == 0:
            print(json.dumps({
                'factors': [],
                'loadings': [],
                'explained_variance': [],
            }))
            sys.exit(0)
        
        result = perform_factor_analysis(sd_scores, n_factors=3)
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()

