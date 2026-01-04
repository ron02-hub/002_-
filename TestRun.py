#!/usr/bin/env python3
"""
アンケート画面確認用テストスクリプト

このスクリプトを実行すると、Next.js開発サーバーを起動し、
ブラウザでアンケート画面を自動的に開きます。
"""

import os
import sys
import time
import subprocess
import signal
import webbrowser
import urllib.request
import urllib.error
from pathlib import Path

# 設定
PORT = 3000
URL = f"http://localhost:{PORT}"
MAX_WAIT_TIME = 60  # 最大待機時間（秒）
CHECK_INTERVAL = 1  # チェック間隔（秒）

# スクリプトの場所を取得（絶対パスに変換）
SCRIPT_DIR = Path(__file__).resolve().parent
SRC_DIR = SCRIPT_DIR / "src"

# グローバル変数（プロセス管理用）
dev_server_process = None


def check_server_ready(url: str, max_wait: int = MAX_WAIT_TIME) -> bool:
    """
    サーバーが起動しているか確認
    
    Args:
        url: 確認するURL
        max_wait: 最大待機時間（秒）
    
    Returns:
        bool: サーバーが起動していればTrue
    """
    start_time = time.time()
    
    while time.time() - start_time < max_wait:
        try:
            response = urllib.request.urlopen(url, timeout=2)
            if response.getcode() == 200:
                return True
        except (urllib.error.URLError, OSError):
            pass
        
        time.sleep(CHECK_INTERVAL)
        elapsed = int(time.time() - start_time)
        print(f"サーバー起動を待機中... ({elapsed}秒)", end="\r")
    
    return False


def start_dev_server() -> subprocess.Popen:
    """
    Next.js開発サーバーを起動
    
    Returns:
        subprocess.Popen: 起動したプロセス
    """
    # 絶対パスに変換
    src_dir_abs = SRC_DIR.resolve()
    
    if not src_dir_abs.exists():
        print(f"❌ エラー: {src_dir_abs} が見つかりません")
        print(f"   現在の作業ディレクトリ: {os.getcwd()}")
        print(f"   スクリプトの場所: {SCRIPT_DIR}")
        sys.exit(1)
    
    # package.jsonの存在確認
    package_json = src_dir_abs / "package.json"
    if not package_json.exists():
        print(f"❌ エラー: {package_json} が見つかりません")
        print(f"   現在の作業ディレクトリ: {os.getcwd()}")
        print(f"   スクリプトの場所: {SCRIPT_DIR}")
        sys.exit(1)
    
    print("🚀 Next.js開発サーバーを起動しています...")
    print(f"   作業ディレクトリ: {src_dir_abs}")
    
    # npm run devを実行
    # macOS/Linuxでプロセスグループを管理するためにstart_new_session=Trueを使用
    kwargs = {
        "cwd": str(src_dir_abs),
        "stdout": subprocess.PIPE,
        "stderr": subprocess.STDOUT,
        "text": True,
        "bufsize": 1,
        "universal_newlines": True,
    }
    
    if sys.platform != "win32":
        kwargs["start_new_session"] = True
    
    process = subprocess.Popen(
        ["npm", "run", "dev"],
        **kwargs
    )
    
    return process


def open_browser(url: str):
    """
    ブラウザでURLを開く
    
    Args:
        url: 開くURL
    """
    print(f"\n🌐 ブラウザで {url} を開いています...")
    webbrowser.open(url)


def cleanup(process: subprocess.Popen):
    """
    プロセスをクリーンアップ
    
    Args:
        process: 終了させるプロセス
    """
    if process and process.poll() is None:
        print("\n\n🛑 開発サーバーを停止しています...")
        try:
            # プロセスグループ全体を終了（子プロセスも含む）
            if sys.platform == "win32":
                process.terminate()
            else:
                try:
                    # プロセスグループIDを取得して終了
                    pgid = os.getpgid(process.pid)
                    os.killpg(pgid, signal.SIGTERM)
                except (ProcessLookupError, OSError):
                    # プロセスが既に終了している場合
                    process.terminate()
            
            process.wait(timeout=5)
        except (subprocess.TimeoutExpired, ProcessLookupError):
            try:
                if sys.platform == "win32":
                    process.kill()
                else:
                    try:
                        pgid = os.getpgid(process.pid)
                        os.killpg(pgid, signal.SIGKILL)
                    except (ProcessLookupError, OSError):
                        process.kill()
            except ProcessLookupError:
                pass
        print("✅ 開発サーバーを停止しました")


def signal_handler(sig, frame):
    """シグナルハンドラ（Ctrl+C対応）"""
    cleanup(dev_server_process)
    sys.exit(0)


def main():
    """メイン処理"""
    global dev_server_process
    
    print("=" * 60)
    print("📋 アンケート画面確認スクリプト")
    print("=" * 60)
    print()
    
    # シグナルハンドラを設定（Ctrl+C対応）
    signal.signal(signal.SIGINT, signal_handler)
    if sys.platform != "win32":
        signal.signal(signal.SIGTERM, signal_handler)
    
    # 開発サーバーを起動
    try:
        dev_server_process = start_dev_server()
        
        # サーバーが起動するまで待機
        print(f"\n⏳ サーバーが起動するまで待機中... (最大{MAX_WAIT_TIME}秒)")
        if not check_server_ready(URL, MAX_WAIT_TIME):
            print(f"\n❌ エラー: {MAX_WAIT_TIME}秒以内にサーバーが起動しませんでした")
            cleanup(dev_server_process)
            sys.exit(1)
        
        # ブラウザで開く
        open_browser(URL)
        
        print("\n" + "=" * 60)
        print("✅ アンケート画面が開かれました")
        print("=" * 60)
        print(f"\n📍 URL: {URL}")
        print("\n💡 ヒント:")
        print("   - アンケート画面を確認してください")
        print("   - 終了する場合は Ctrl+C を押してください")
        print()
        
        # プロセスが終了するまで待機
        # （サーバーは通常、Ctrl+Cで終了するまで実行し続けます）
        try:
            dev_server_process.wait()
        except KeyboardInterrupt:
            pass
        
    except KeyboardInterrupt:
        print("\n\n⚠️  中断されました")
        cleanup(dev_server_process)
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ エラーが発生しました: {e}")
        cleanup(dev_server_process)
        sys.exit(1)


if __name__ == "__main__":
    main()

