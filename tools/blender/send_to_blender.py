import socket
import sys
import json

HOST = '127.0.0.1'
PORT = 9876

def send_code(code_string):
    """Gửi đoạn mã Python tới Blender qua socket."""
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(5.0)
    try:
        s.connect((HOST, PORT))
        payload = code_string.encode('utf-8') + b"\n__END__\n"
        s.sendall(payload)
        
        response = b""
        while True:
            chunk = s.recv(4096)
            if not chunk:
                break
            response += chunk
            
        s.close()
        return json.loads(response.decode('utf-8'))
    except ConnectionRefusedError:
        return {'status': 'disconnected', 'error': 'Không thể kết nối! Blender Bridge chưa chạy trên cổng 9876.'}
    except Exception as e:
        return {'status': 'error', 'error': str(e)}

if __name__ == '__main__':
    test_code = "print('[Antigravity-AI] Xin chào Blender! Kết nối thành công 100%!')"
    if len(sys.argv) > 1:
        test_code = sys.argv[1]
    
    print(f"Đang kiểm tra kết nối tới Blender tại {HOST}:{PORT}...")
    res = send_code(test_code)
    print("Kết quả:", json.dumps(res, indent=2, ensure_ascii=False))
