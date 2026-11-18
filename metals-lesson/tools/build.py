#!/usr/bin/env python3
"""Сайтты бір HTML файлға жинау: шрифттер, CSS және JS ішіне салынады.
   dist/metaldar-sait.html  — толық құжат (флешкаға салып, интернетсіз ашуға болады)
   dist/artifact.html       — Claude Artifact үшін фрагмент (doctype/head/body жоқ)"""
import re, base64, os, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rd = lambda p: open(os.path.join(root, p), encoding='utf-8').read()
html = rd('index.html')
css = rd('css/style.css')
def font(m):
    f = os.path.join(root, 'css', m.group(1))
    return 'url(data:font/woff2;base64,' + base64.b64encode(open(f, 'rb').read()).decode() + ')'
css = re.sub(r'url\((\.\./fonts/[^)]+\.woff2)\)', lambda m: font(re.match(r'(.*)', m.group(1))), css)
scripts = re.findall(r'<script src="([^"]+)"></script>', html)
js = '\n'.join('/* ' + s + ' */\n' + rd(s) for s in scripts)
assert '</script' not in js.lower(), 'JS ішінде </script бар'
body = re.search(r'<body>(.*?)<script src', html, re.S).group(1).strip()
title = re.search(r'<title>(.*?)</title>', html).group(1)
os.makedirs(os.path.join(root, 'dist'), exist_ok=True)
full = f'''<!doctype html>
<html lang="kk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{title}</title>
<style>{css}</style>
</head>
<body>
{body}
<script>{js}</script>
</body>
</html>
'''
open(os.path.join(root, 'dist', 'metaldar-sait.html'), 'w', encoding='utf-8').write(full)
frag = f'''<title>{title}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>{css}</style>
{body}
<script>{js}</script>
'''
open(os.path.join(root, 'dist', 'artifact.html'), 'w', encoding='utf-8').write(frag)
print('ok', len(full) // 1024, 'KB')
