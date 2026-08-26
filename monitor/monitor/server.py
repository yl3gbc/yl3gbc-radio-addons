from http.server import BaseHTTPRequestHandler,HTTPServer
HTML="""<!doctype html><html lang="ru"><meta charset="utf-8"><title>YL3GBC Monitor</title>
<style>body{font-family:sans-serif;margin:24px}.section{display:none}.show{display:block}button{margin:4px;padding:10px}</style>
<nav>
<button onclick="showTop('overview')" data-ru="ОБЗОР" data-en="OVERVIEW">ОБЗОР</button>
<button onclick="showTop('orbit')" data-ru="ОРБИТА" data-en="ORBIT">ОРБИТА</button>
<button onclick="showTop('history')" data-ru="ИСТОРИЯ" data-en="HISTORY">ИСТОРИЯ</button>
<button onclick="showTop('offline')" data-ru="ОФЛАЙН-ТЕСТ" data-en="OFFLINE TEST">ОФЛАЙН-ТЕСТ</button>
<button onclick="showTop('manual')" data-ru="РУКОВОДСТВО" data-en="MANUAL">РУКОВОДСТВО</button>
<button onclick="showTop('faq')" data-ru="FAQ" data-en="FAQ">FAQ</button>
<button onclick="setLang('ru')">RU</button><button onclick="setLang('en')">EN</button></nav>
<section id="overview" class="section show"><h2 data-ru="ОБЗОР" data-en="OVERVIEW">ОБЗОР</h2></section>
<section id="orbit" class="section"><h2 data-ru="ОРБИТА" data-en="ORBIT">ОРБИТА</h2></section>
<section id="history" class="section"><h2 data-ru="ИСТОРИЯ" data-en="HISTORY">ИСТОРИЯ</h2></section>
<section id="offline" class="section"><h2 data-ru="ОФЛАЙН-ТЕСТ" data-en="OFFLINE TEST">ОФЛАЙН-ТЕСТ</h2><input type="file" accept=".ogg,audio/ogg"></section>
<section id="manual" class="section"><h2 data-ru="РУКОВОДСТВО" data-en="MANUAL">РУКОВОДСТВО</h2></section>
<section id="faq" class="section"><h2>FAQ</h2></section>
<script>function showTop(x){document.querySelectorAll('.section').forEach(e=>e.classList.remove('show'));document.getElementById(x).classList.add('show')}function setLang(x){document.documentElement.lang=x;document.querySelectorAll('[data-'+x+']').forEach(e=>e.textContent=e.dataset[x])}</script></html>"""
class H(BaseHTTPRequestHandler):
 def do_GET(self):
  b=HTML.encode();self.send_response(200);self.send_header("Content-Type","text/html; charset=utf-8");self.end_headers();self.wfile.write(b)
HTTPServer(("127.0.0.1",8091),H).serve_forever()
