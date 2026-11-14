import bpy
import os
import socket
import threading
import json
import traceback

HOST = '127.0.0.1'
PORT = 9876
BRIDGE_DIR = os.path.dirname(os.path.abspath(__file__))
LIVE_SCRIPT = os.path.join(BRIDGE_DIR, 'live_asset.py')

_last_mtime = 0
_command_queue = []
_server_running = False

def execute_code(code_str):
    """Thực thi mã Python trong Main Thread của Blender."""
    global_scope = {'bpy': bpy}
    exec(compile(code_str, '<ai_remote>', 'exec'), global_scope)

def process_queue_and_watch():
    """Timer chạy định kỳ trên Main Thread của Blender."""
    global _last_mtime, _command_queue

    # 1. Xử lý lệnh từ Socket
    while _command_queue:
        item = _command_queue.pop(0)
        code = item['code']
        callback = item['callback']
        try:
            execute_code(code)
            callback({'status': 'ok', 'message': 'Thực thi thành công trên Blender!'})
        except Exception as e:
            err = traceback.format_exc()
            print(f"[Blender-Bridge ERROR] {err}")
            callback({'status': 'error', 'error': str(e), 'traceback': err})

    # 2. Theo dõi file live_asset.py (Live File Watcher)
    if os.path.exists(LIVE_SCRIPT):
        try:
            mtime = os.path.getmtime(LIVE_SCRIPT)
            if _last_mtime != 0 and mtime != _last_mtime:
                _last_mtime = mtime
                print(f"[Blender-Bridge] Phát hiện thay đổi trong {LIVE_SCRIPT}. Đang nạp lại...")
                with open(LIVE_SCRIPT, 'r', encoding='utf-8') as f:
                    code = f.read()
                execute_code(code)
                print("[Blender-Bridge] Cập nhật mô hình thành công!")
            elif _last_mtime == 0:
                _last_mtime = mtime
        except Exception as e:
            print(f"[Blender-Bridge] Lỗi khi reload live_asset.py: {e}")

    return 0.3  # Kiểm tra mỗi 300ms

def socket_worker():
    """Luồng nền lắng nghe kết nối từ Antigravity AI."""
    global _server_running
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    
    try:
        server.bind((HOST, PORT))
        server.listen(5)
        _server_running = True
        print("=" * 60)
        print(f" [AI-Blender Bridge] ĐÃ KHỞI ĐỘNG THÀNH CÔNG!")
        print(f" Cổng kết nối (Port): {PORT}")
        print(f" Đang theo dõi file: {LIVE_SCRIPT}")
        print("=" * 60)
    except Exception as e:
        print(f"[AI-Blender Bridge] Không thể mở port {PORT}: {e}")
        return

    while _server_running:
        try:
            client, addr = server.accept()
            raw_data = b""
            while True:
                chunk = client.recv(4096)
                if not chunk:
                    break
                raw_data += chunk
                if raw_data.endswith(b"\n__END__\n"):
                    raw_data = raw_data[:-9]
                    break

            code_text = raw_data.decode('utf-8')
            if not code_text.strip():
                client.close()
                continue

            event = threading.Event()
            result_holder = {}

            def on_done(res):
                result_holder.update(res)
                event.set()

            _command_queue.append({'code': code_text, 'callback': on_done})

            # Đợi main thread thực thi xong tối đa 10s
            if event.wait(timeout=10.0):
                resp = json.dumps(result_holder).encode('utf-8')
            else:
                resp = json.dumps({'status': 'timeout', 'error': 'Quá thời gian thực thi trong Blender'}).encode('utf-8')

            client.sendall(resp)
            client.close()
        except Exception as e:
            print(f"[AI-Blender Bridge Worker] Lỗi kết nối: {e}")

def start_bridge():
    # Đăng ký timer main thread
    if not bpy.app.timers.is_registered(process_queue_and_watch):
        bpy.app.timers.register(process_queue_and_watch, persistent=True)

    # Chạy socket server
    t = threading.Thread(target=socket_worker, daemon=True)
    t.start()

start_bridge()
