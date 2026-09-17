
#!/usr/bin/env python3
# build.py - Gera marilandapp.html single-file para produção (Hostinger)
import os

base = '.'
css = open(f'{base}/css/login.css').read() + open(f'{base}/css/dashboard.css').read() + open(f'{base}/css/components.css').read()
js = ""
for f in ['js/supabase.js','js/auth.js','js/clientes.js','js/agenda.js','js/financeiro.js','js/graficos.js','js/ficha.js']:
    js += "\n\n/* --- "+f+" --- */\n" + open(f'{base}/{f}').read()

index = open(f'{base}/index.html').read()
# Replace css links with <style>
import re
index = re.sub(r'<link rel="stylesheet" href="css/[^"]+">\n?', '', index)
index = index.replace('</head>', f'<style>\n{css}\n</style>\n</head>')

# Replace js imports with single script
for f in ['js/supabase.js','js/auth.js','js/clientes.js','js/agenda.js','js/financeiro.js','js/graficos.js','js/ficha.js']:
    index = index.replace(f'<script src="{f}"></script>\n', '')

index = index.replace('</body>', f'<script>\n{js}\n</script>\n</body>')

# Fix img path for single file - keep as img/mariland.png (user uploads)
open('../marilandapp.html','w',encoding='utf-8').write(index)
open('../../marilandapp.html','w',encoding='utf-8').write(index)
print(f"Build OK: single file {len(index)} bytes -> marilandapp.html")
