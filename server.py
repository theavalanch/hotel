#!/usr/bin/env python3
"""
DoubleTree by Hilton Hotel Los Angeles Downtown - Local Web Server
Zero-dependency, multi-threaded HTTP server for previewing the complete hotel web application.

Usage:
    python server.py [port]
"""

import sys
import os
import socket
from http.server import HTTPServer, SimpleHTTPRequestHandler
try:
    from http.server import ThreadingHTTPServer
except ImportError:
    ThreadingHTTPServer = HTTPServer

DEFAULT_PORT = 8000

class HotelHTTPRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and disable aggressive caching during development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        # Simple health check endpoint
        if self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status": "healthy", "hotel": "DoubleTree by Hilton Hotel Los Angeles Downtown", "location": "Los Angeles, CA, USA"}')
            return
        
        return super().do_GET()

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def run_server(port=DEFAULT_PORT):
    # Change working directory to script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    while is_port_in_use(port):
        print(f"Port {port} is in use, trying port {port + 1}...")
        port += 1

    server_address = ('', port)
    httpd = ThreadingHTTPServer(server_address, HotelHTTPRequestHandler)

    print("======================================================================")
    print("  DOUBLETREE BY HILTON HOTEL LOS ANGELES DOWNTOWN - DEV SERVER")
    print("======================================================================")
    print(f"  Serving directory: {script_dir}")
    print(f"  URL: http://localhost:{port}/")
    print(f"  Admin Portal: http://localhost:{port}/#admin")
    print("----------------------------------------------------------------------")
    print("  Press Ctrl+C to terminate the server.")
    print("======================================================================")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer gracefully shutting down...")
        httpd.server_close()
        print("Server stopped.")

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PORT
    run_server(port)
