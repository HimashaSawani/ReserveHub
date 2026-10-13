import socket
import select
import sys

LISTEN_HOST = '0.0.0.0'
LISTEN_PORT = 33060
TARGET_HOST = '127.0.0.1'
TARGET_PORT = 5432

def forward(src, dst):
    try:
        while True:
            r, _, _ = select.select([src, dst], [], [])
            if src in r:
                data = src.recv(4096)
                if not data:
                    break
                dst.sendall(data)
            if dst in r:
                data = dst.recv(4096)
                if not data:
                    break
                src.sendall(data)
    except Exception:
        pass
    finally:
        try:
            src.close()
        except Exception:
            pass
        try:
            dst.close()
        except Exception:
            pass

def main():
    import threading
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((LISTEN_HOST, LISTEN_PORT))
    server.listen(100)
    print(f"WSL Forwarder running: {LISTEN_HOST}:{LISTEN_PORT} -> {TARGET_HOST}:{TARGET_PORT}", flush=True)

    while True:
        try:
            client_sock, client_addr = server.accept()
            target_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            target_sock.connect((TARGET_HOST, TARGET_PORT))
            t = threading.Thread(target=forward, args=(client_sock, target_sock), daemon=True)
            t.start()
        except KeyboardInterrupt:
            break
        except Exception as e:
            print("Accept error:", e, flush=True)

if __name__ == '__main__':
    main()
