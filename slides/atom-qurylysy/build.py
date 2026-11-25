#!/usr/bin/env python3
"""Assemble the slide site from src/ into two outputs:
   index.html            — standalone page (open in any browser, works offline except web fonts)
   dist/artifact.html    — fragment without <html>/<head>/<body> for publishing as a claude.ai Artifact
"""
import pathlib
root = pathlib.Path(__file__).resolve().parent
src = root / 'src'
head = (src / '00-head.html').read_text(encoding='utf-8')
body = (src / '10-body-a.html').read_text(encoding='utf-8') + (src / '11-body-b.html').read_text(encoding='utf-8')
js = (src / '20-core.js').read_text(encoding='utf-8') + '\n' + (src / '30-app.js').read_text(encoding='utf-8')
script = '<script>\n(() => {\n' + js + '\n})();\n</script>\n'
(root / 'dist').mkdir(exist_ok=True)
(root / 'dist' / 'artifact.html').write_text(head + '\n' + body + '\n' + script, encoding='utf-8')
standalone = ('<!doctype html>\n<html lang="kk">\n<head>\n<meta charset="utf-8">\n'
              '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
              + head + '\n</head>\n<body>\n' + body + '\n' + script + '</body>\n</html>\n')
(root / 'index.html').write_text(standalone, encoding='utf-8')
print('built', len(standalone) // 1024, 'KB')
