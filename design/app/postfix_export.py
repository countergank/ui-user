#!/usr/bin/env python3
"""Post-process an OpenPencil standalone HTML export so it renders faithfully in a browser:
   1. inject design/app/fonts.css (the export omits @font-face),
   2. inject explicit width/height from the OpenPencil layout for frames with none,
   3. strip width from auto-width TEXT spans so they shrink-to-fit.
Usage: postfix_export.py <dims2.json> <html-path>
dims2.json = {nodeId: [type, width, height]} dumped from the OpenPencil doc.
"""
import json, re, sys

dims = json.loads(open(sys.argv[1]).read())
path = sys.argv[2]
html = open(path).read()

pairs = dict(re.findall(r'data-open-pencil-node-id="([^"]+)" class="(op-[\w]+)"', html))

injected = stripped = 0
for nid, cls in pairs.items():
    info = dims.get(nid)
    if not info:
        continue
    ntype, w, h = info
    m = re.search(r'\.' + re.escape(cls) + r'\{([^}]*)\}', html)
    if not m:
        continue
    body = m.group(1)
    newb = body
    is_text = ntype == 'TEXT'
    if 'width:' not in body and not is_text:
        newb = 'width: ' + str(w) + 'px; ' + newb
        injected += 1
    if 'height:' not in body:
        newb = 'height: ' + str(h) + 'px; ' + newb
        injected += 1
    if is_text and 'width:' in body:
        newb = re.sub(r'width: [\d.]+px; ', '', newb)
        stripped += 1
    if is_text:
        newb = newb.replace('white-space: pre-wrap', 'white-space: nowrap')
             
              
    if newb != body:
        html = html[:m.start()] + '.' + cls + '{' + newb + '}' + html[m.end():]

if 'fonts.css' not in html:
    html = html.replace('</head>', '<link rel="stylesheet" href="fonts.css"></head>')

open(path, 'w').write(html)
print(f"injected={injected} stripped={stripped} -> {path}")
