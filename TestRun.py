#!/usr/bin/env python3
"""
アンケート画面確認用テストスクリプト

このスクリプトを実行すると、Next.js開発サーバーを起動し、
ブラウザでアンケートのランディングページを自動的に開きます。

通常のフローでアンケートを最初から実施できます。
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
BASE_URL = f"http://localhost:{PORT}"
START_URL = BASE_URL  # ランディングページから開始
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


def check_port_in_use(port: int) -> bool:
    """ポートが使用中か確認"""
    try:
        import socket
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(1)
            result = s.connect_ex(('localhost', port))
            return result == 0
    except Exception:
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
    
    # ポートが使用中か確認
    if check_port_in_use(PORT):
        print(f"⚠️  ポート {PORT} は既に使用されています")
        print(f"   既存のサーバーが起動している可能性があります")
        print(f"   既存のサーバーを使用するか、停止してから再実行してください")
        response = input("\n既存のサーバーを使用しますか？ (y/n): ").strip().lower()
        if response != 'y':
            print("❌ サーバーを停止してから再実行してください")
            sys.exit(1)
        # 既存のサーバーを使用する場合は、Noneを返す
        return None
    
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
    
    # macOSの場合、openコマンドを使用
    if sys.platform == "darwin":
        try:
            subprocess.run(["open", url], check=True, timeout=5)
            print(f"✅ ブラウザを開きました: {url}")
            return
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired, FileNotFoundError):
            print("⚠️  openコマンドで開けませんでした。webbrowserモジュールを試します...")
    
    # フォールバック: webbrowserモジュールを使用
    try:
        browser = webbrowser.get()
        if browser:
            browser.open(url)
            print(f"✅ ブラウザを開きました: {url}")
        else:
            print(f"⚠️  ブラウザを自動的に開けませんでした。手動で以下のURLを開いてください:")
            print(f"   {url}")
    except Exception as e:
        print(f"⚠️  ブラウザを開く際にエラーが発生しました: {e}")
        print(f"   手動で以下のURLを開いてください:")
        print(f"   {url}")


def cleanup(process):
    """
    プロセスをクリーンアップ
    
    Args:
        process: 終了させるプロセス（Noneの場合は何もしない）
    """
    if process is None:
        return
    
    if process.poll() is None:
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
    print("📌 アンケートを最初から開始します")
    print("   - ランディングページから開始")
    print("   - 通常のフローで進めてください")
    print()
    
    # シグナルハンドラを設定（Ctrl+C対応）
    signal.signal(signal.SIGINT, signal_handler)
    if sys.platform != "win32":
        signal.signal(signal.SIGTERM, signal_handler)
    
    # 開発サーバーを起動
    try:
        dev_server_process = start_dev_server()
        
        # 既存のサーバーを使用する場合
        if dev_server_process is None:
            print(f"\n⏳ 既存のサーバーが起動しているか確認中...")
            if not check_server_ready(BASE_URL, 5):
                print(f"\n❌ エラー: 既存のサーバーに接続できませんでした")
                sys.exit(1)
        else:
            # サーバーが起動するまで待機（ベースURLで確認）
            print(f"\n⏳ サーバーが起動するまで待機中... (最大{MAX_WAIT_TIME}秒)")
            print("   (サーバーのログを確認してください)")
            
            # サーバーのログを表示するスレッドを開始
            import threading
            log_lines = []
            
            def read_server_logs():
                if dev_server_process and dev_server_process.stdout:
                    try:
                        for line in iter(dev_server_process.stdout.readline, ''):
                            if not line:
                                break
                            line = line.strip()
                            if line:
                                log_lines.append(line)
                                # 重要なメッセージとMediaAPIのログを表示
                                if any(keyword in line.lower() for keyword in ['ready', 'error', 'warning', 'compiled', 'started', '[mediaapi]']):
                                    print(f"   [Server] {line}")
                    except (BrokenPipeError, ValueError):
                        pass
            
            log_thread = threading.Thread(target=read_server_logs, daemon=True)
            log_thread.start()
            
            if not check_server_ready(BASE_URL, MAX_WAIT_TIME):
                print(f"\n❌ エラー: {MAX_WAIT_TIME}秒以内にサーバーが起動しませんでした")
                if log_lines:
                    print("\nサーバーログ（最後の10行）:")
                    for line in log_lines[-10:]:
                        print(f"   {line}")
                cleanup(dev_server_process)
                sys.exit(1)
        
        # サーバーの準備を待機
        print("\n⏳ サーバーの準備を待機中...")
        time.sleep(2)
        
        # ブラウザでランディングページを開く
        open_browser(START_URL)
        
        print("\n" + "=" * 60)
        print("✅ アンケート画面が開かれました")
        print("=" * 60)
        print(f"\n📍 URL: {START_URL}")
        print("\n💡 ヒント:")
        print("   - ランディングページから「アンケートを開始する」をクリックしてください")
        print("   - 通常のフローで進めてください")
        print("   - ブラウザの開発者ツール（F12）でコンソールエラーを確認できます")
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

