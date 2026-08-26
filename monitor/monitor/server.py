from http.server import BaseHTTPRequestHandler,HTTPServer
from urllib.parse import parse_qs,urlparse
from offline_layer import render_offline_test_layer

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        lang=parse_qs(urlparse(self.path).query).get("lang",["en"])[0]
        layer=render_offline_test_layer(lang)
        html=f'''<!doctype html><meta charset="utf-8">
<title>YL3GBC MONITOR</title>
<h1>YL3GBC MONITOR</h1>
<nav><a href="/?lang=en">EN</a> | <a href="/?lang=ru">RU</a></nav>
<hr>{layer}'''
        data=html.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type","text/html; charset=utf-8")
        self.send_header("Content-Length",str(len(data)))
        self.end_headers()
        self.wfile.write(data)

HTTPServer(("0.0.0.0",8090),Handler).serve_forever()
