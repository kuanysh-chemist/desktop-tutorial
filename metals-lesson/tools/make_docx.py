#!/usr/bin/env python3
"""Слайдтардың мәтінін (қазақша + орысша) бір Word құжатына жинау.
   1) node tools/export-text.js index.html 1 17 slides.json
   2) python3 tools/make_docx.py slides.json шығыс.docx 1 17
"""
import json, re, sys, datetime
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_ORIENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

src, out = sys.argv[1], sys.argv[2]
n_from, n_to = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (1, 17)
slides = json.load(open(src, encoding='utf-8'))

CHC = {'Кіріспе': '9333ea', 'Құрылым': '2563eb', 'Физикалық қасиеттер': 'ea580c', 'Химиялық қасиеттер': '16a34a', 'Қорытпалар': '7c3aed', 'Металл алу': 'dc2626', 'Қазақстан': '0891b2', 'Қорытынды': 'ca8a04'}
FONT = 'Calibri'

# ---------- кіші құралдар ----------
def shade(cell, hex_):
    tcPr = cell._tc.get_or_add_tcPr(); shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear'); shd.set(qn('w:color'), 'auto'); shd.set(qn('w:fill'), hex_); tcPr.append(shd)

def borders(table, color='C9D3E3'):
    tblPr = table._tbl.tblPr; b = OxmlElement('w:tblBorders')
    for e in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        el = OxmlElement('w:' + e); el.set(qn('w:val'), 'single'); el.set(qn('w:sz'), '4'); el.set(qn('w:space'), '0'); el.set(qn('w:color'), color); b.append(el)
    tblPr.append(b)

def cell_margins(table, top=50, bottom=50, left=90, right=90):
    tblPr = table._tbl.tblPr; m = OxmlElement('w:tblCellMar')
    for k, v in (('top', top), ('left', left), ('bottom', bottom), ('right', right)):
        el = OxmlElement('w:' + k); el.set(qn('w:w'), str(v)); el.set(qn('w:type'), 'dxa'); m.append(el)
    tblPr.append(m)

def no_split(row):
    trPr = row._tr.get_or_add_trPr(); el = OxmlElement('w:cantSplit'); trPr.append(el)

def repeat_header(row):
    trPr = row._tr.get_or_add_trPr(); el = OxmlElement('w:tblHeader'); trPr.append(el)

SUP = str.maketrans('0123456789+-', '⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻'); SUBS = str.maketrans('0123456789', '₀₁₂₃₄₅₆₇₈₉')

def paras(html):
    """HTML жолын абзацтар тізіміне бөлу: [(мәтін, курсив)]"""
    if html is None: return []
    parts = re.split(r'(?i)</p>', html); res = []
    for p in parts:
        if not p.strip(): continue
        ital = 'class="src"' in p[:40]
        p = re.sub(r'(?i)^\s*<p[^>]*>', '', p)
        res.append((p.strip(), ital))
    return res or [(html.strip(), False)]

TOK = re.compile(r'(?is)(<br\s*/?>|</?(?:b|strong|i|em|sub|sup)\b[^>]*>|<[^>]+>)')
def rich(par, html, size=10.5, color=None, italic=False, bold=False):
    st = {'b': bold, 'i': italic, 'sub': False, 'sup': False}
    for tok in TOK.split(html):
        if not tok: continue
        if tok.startswith('<'):
            t = tok.lower().strip('<>/ ').split()[0] if tok.strip('<>/ ') else ''
            closing = tok.startswith('</')
            if t == 'br': par.add_run().add_break(); continue
            if t in ('b', 'strong'): st['b'] = (not closing) or bold
            elif t in ('i', 'em'): st['i'] = (not closing) or italic
            elif t in ('sub', 'sup'): st[t] = not closing
            continue
        tok = tok.replace('&nbsp;', ' ').replace('&lt;', '<').replace('&gt;', '>').replace('&amp;', '&')
        r = par.add_run(tok); f = r.font; f.name = FONT; f.size = Pt(size); r._element.rPr.rFonts.set(qn('w:eastAsia'), FONT)
        f.bold = st['b']; f.italic = st['i']; f.subscript = st['sub']; f.superscript = st['sup']
        if color: f.color.rgb = RGBColor.from_string(color)

def plain(s):
    if s is None: return ''
    s = re.sub(r'(?i)<br\s*/?>', ' ', s)
    s = re.sub(r'(?is)<sup>(.*?)</sup>', lambda m: m.group(1).translate(SUP), s)
    s = re.sub(r'(?is)<sub>(.*?)</sub>', lambda m: m.group(1).translate(SUBS), s)
    s = re.sub(r'<[^>]+>', '', s)
    return re.sub(r'\s+', ' ', s).strip()

# ---------- құжат ----------
doc = Document()
sec = doc.sections[0]; sec.page_width, sec.page_height = Cm(21), Cm(29.7)
sec.left_margin = sec.right_margin = Cm(1.7); sec.top_margin = Cm(1.6); sec.bottom_margin = Cm(1.6)
st = doc.styles['Normal']; st.font.name = FONT; st.font.size = Pt(10.5); st.element.rPr.rFonts.set(qn('w:eastAsia'), FONT)
st.paragraph_format.space_after = Pt(0)
W = 17.6  # пайдалы ені, см

def para(text='', size=10.5, bold=False, color=None, align=None, after=4, before=0, italic=False):
    p = doc.add_paragraph(); p.paragraph_format.space_after = Pt(after); p.paragraph_format.space_before = Pt(before)
    if align: p.alignment = align
    if text: rich(p, text, size=size, color=color, bold=bold, italic=italic)
    return p

# колонтитул: бет нөмірі
fp = sec.footer.paragraphs[0]; fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
def fld(par, code):
    r = par.add_run(); r.font.size = Pt(9); r.font.name = FONT; r.font.color.rgb = RGBColor(0x64, 0x74, 0x8b)
    for t, txt in (('begin', None), (None, code), ('end', None)):
        if t: el = OxmlElement('w:fldChar'); el.set(qn('w:fldCharType'), t); r._r.append(el)
        else: it = OxmlElement('w:instrText'); it.set(qn('xml:space'), 'preserve'); it.text = txt; r._r.append(it)
rr = fp.add_run('Металдар және қорытпалар · Металлы и сплавы · '); rr.font.size = Pt(9); rr.font.name = FONT; rr.font.color.rgb = RGBColor(0x64, 0x74, 0x8b)
fld(fp, 'PAGE')

# ---------- титул ----------
para('Металдар және қорытпалар', size=28, bold=True, color='1d4ed8', after=0)
para('Металлы и сплавы', size=18, color='64748b', after=6)
para(f'{n_from}–{n_to} слайдтың барлық материалы · Все материалы слайдов {n_from}–{n_to}', size=14, bold=True, after=10)
para('Бұл құжатта сайттың алғашқы 17 экранындағы барлық мәтін қазақша (сол жақта) және орысша (оң жақта) қатар жиналған: экрандағы жазулар, «Сен білесің бе?» фактілері, келесі экранға өтетін сөйлемдер, мұғалімге жазбалар және тапсырма жауаптары. Қазақша аударманы тексеріп, түзетуге ыңғайлы.', size=11, after=4)
para('В документе собраны все тексты первых 17 экранов сайта на казахском (слева) и русском (справа): надписи на экране, факты «А вы знали?», фразы-переходы, заметки учителю и ответы к заданиям. Удобно для проверки и правки перевода.', size=11, color='475569', after=10)
para(f'Дереккөз: слайд-сайт «Металдар және қорытпалар», экрандар {n_from}–{n_to}. Жасалған күні: {datetime.date.today().strftime("%d.%m.%Y")}.', size=9.5, color='64748b', after=10)

# ---------- мазмұны ----------
para('Мазмұны · Содержание', size=15, bold=True, color='0f172a', before=4, after=4)
t = doc.add_table(rows=1, cols=4); borders(t); cell_margins(t)
for i, h in enumerate(('№', 'Қазақша тақырыбы', 'Русское название', 'Бөлім')):
    c = t.rows[0].cells[i]; shade(c, 'E8EEF9'); c.paragraphs[0].text = ''; rich(c.paragraphs[0], h, bold=True, size=10)
repeat_header(t.rows[0])
for s in slides:
    r = t.add_row(); no_split(r); col = CHC.get(s['chapter'][0], '334155')
    vals = (str(s['n']), s['title'][0], s['title'][1], s['chapter'][0])
    for i, v in enumerate(vals):
        c = r.cells[i]; c.paragraphs[0].text = ''; rich(c.paragraphs[0], v, size=9.5, bold=(i == 0), color=(col if i in (0, 3) else None))
for row in t.rows:
    for i, w in enumerate((1.0, 7.0, 6.2, 3.4)): row.cells[i].width = Cm(w)

# ---------- қосымша деректер (сандық кестелер) ----------
DATA = {
    'cells': (('Тор түрі · Тип решётки', 'Атауы · Название', 'Көрші атом · Соседей', 'Толу · Заполнение', 'Металдар (оқулық) · Металлы (учебник)'),
              [('а) Көлемді куб · ОЦК', 'кубтық көлемді орталықтанған · объёмно-центрированная кубическая', '8', '68 %', 'Li, Na, K, V, Cr, Fe, Rb, Mo, W'),
               ('б) Бүйірлі куб · ГЦК', 'кубтық бүйірлі орталықтанған · гранецентрированная кубическая', '12', '74 %', 'Al, Ca, Ni, Cu, Pb, Ag, Pt, Au, Pd'),
               ('в) Гексагоналды · ГПУ', 'гексагоналды тығыз қапталған · гексагональная плотноупакованная', '12', '74 %', 'Be, Ni, Cd, Ti, Co, Zn')]),
    'conduct': (('Металл · Металл', 'Электр өткізгіштік (Ag = 100) · Электропроводность (Ag = 100)'),
                [('Ag — күміс · серебро', '100'), ('Cu — мыс · медь', '95'), ('Au — алтын · золото', '65'), ('Al — алюминий', '60'), ('Fe — темір · железо', '16')]),
    'density': (('Металл · Металл', 'Тығыздық, г/см³ · Плотность, г/см³', 'Атом массасы, u · Масса атома, u', '10 см-лік текше массасы, кг · Масса кубика 10 см, кг'),
                [('Li', '0,53', '6,94', '0,53'), ('Na', '0,97', '22,99', '0,97'), ('Mg', '1,74', '24,31', '1,74'), ('Al', '2,70', '26,98', '2,70'), ('Ti', '4,51', '47,87', '4,51'),
                 ('Fe', '7,87', '55,85', '7,87'), ('Cu', '8,96', '63,55', '8,96'), ('Pb', '11,34', '207,2', '11,34'), ('Au', '19,32', '196,97', '19,32'), ('Os', '22,59', '190,23', '22,59')]),
    'melting': (('Металл · Металл', 'Балқу температурасы, °C · Температура плавления, °C', 'Топ · Группа'),
                [('Hg — сынап · ртуть', '−39', 'оңай балқитын · легкоплавкий'), ('Ga — галлий', '30', 'оңай балқитын · легкоплавкий'), ('Na — натрий', '98', 'оңай балқитын · легкоплавкий'), ('Sn — қалайы · олово', '232', 'оңай балқитын · легкоплавкий'),
                 ('Pb — қорғасын · свинец', '327', 'оңай балқитын · легкоплавкий'), ('Al — алюминий', '660', 'оңай балқитын · легкоплавкий'), ('Cu — мыс · медь', '1085', 'қиын балқитын · тугоплавкий'),
                 ('Fe — темір · железо', '1538', 'қиын балқитын · тугоплавкий'), ('Cr — хром', '1907', 'қиын балқитын · тугоплавкий'), ('W — вольфрам', '3422', 'қиын балқитын · тугоплавкий')]),
    'hardness': (('Зат · Вещество', 'Қаттылық (Мохс) · Твёрдость (Моос)', 'Рөлі · Роль'),
                 [('K — калий', '0,4', 'сынама · образец'), ('Na — натрий', '0,5', 'сынама · образец'), ('Pb — қорғасын · свинец', '1,5', 'сынама · образец'), ('Al — алюминий', '2,8', 'сынама · образец'), ('Cu — мыс · медь', '3', 'сынама · образец'),
                  ('Fe — темір · железо', '4', 'сынама · образец'), ('W — вольфрам', '7,5', 'сынама · образец'), ('Cr — хром', '8,5', 'сынама · образец'), ('Тырнақ · Ноготь', '2,5', 'құрал · инструмент'),
                  ('Мыс тиын · Медная монета', '3', 'құрал · инструмент'), ('Шыны · Стекло', '5,5', 'құрал · инструмент'), ('Хром · Хром', '8,5', 'құрал · инструмент')]),
    'position': (('Атом · Атом', 'Ядро заряды · Заряд ядра', 'Электрондар қабаттар бойынша · Электроны по уровням'),
                 [('Na — натрий', '+11', '2 · 8 · 1'), ('Mg — магний', '+12', '2 · 8 · 2'), ('Al — алюминий', '+13', '2 · 8 · 3')]),
}

WID = {'cells': (3.4, 5.6, 1.9, 1.9, 4.8), 'conduct': (7.0, 10.6), 'density': (3.0, 4.6, 4.8, 5.2), 'melting': (5.6, 5.6, 6.4), 'hardness': (6.0, 5.6, 6.0), 'position': (5.4, 5.4, 6.8)}
def data_table(key):
    head, rows = DATA[key]
    t = doc.add_table(rows=1, cols=len(head)); borders(t); cell_margins(t, 40, 40, 80, 80)
    for i, h in enumerate(head):
        c = t.rows[0].cells[i]; shade(c, 'F1F5F9'); c.paragraphs[0].text = ''; rich(c.paragraphs[0], h, bold=True, size=9.5)
    repeat_header(t.rows[0])
    for r in rows:
        row = t.add_row(); no_split(row)
        for i, v in enumerate(r):
            c = row.cells[i]; c.paragraphs[0].text = ''; rich(c.paragraphs[0], v, size=10, bold=(i == 0))
    t.autofit = False
    for row in t.rows:
        for i, w in enumerate(WID[key]): row.cells[i].width = Cm(w)
    return t

STOP = {'Бұл экранға жазба жоқ.', 'Бұл экранда тапсырма жауабы жоқ.', 'Сен білесің бе?', 'Термин іздеу…'}

def clean_pairs(s):
    ex = set()
    for k in ('title', 'bridge', 'note', 'ans', 'fact'):
        v = s.get(k)
        if v: ex.add(v[0])
    ex |= set(s['chapter'])
    res, seen = [], set()
    for kk, ru in s['texts']:
        if kk in ex or kk in STOP or kk in seen: continue
        seen.add(kk)
        pk = plain(kk)
        if not pk or not re.search(r'[A-Za-zА-Яа-яӘәҒғҚқҢңӨөҮүҰұҺһІі]', pk): continue
        if kk == ru and len(pk) < 14: continue          # таза таңбалар (Fe, Cu...)
        res.append((kk, ru))
    return res

def label_row(tbl, text, color):
    r = tbl.add_row(); no_split(r); m = r.cells[0].merge(r.cells[1]); shade(m, color); m.paragraphs[0].text = ''
    rich(m.paragraphs[0], text, bold=True, size=9.5, color='334155')
    m.paragraphs[0].paragraph_format.keep_with_next = True

def pair_row(tbl, kk, ru, size=10.5, italic=False, split=False):
    r = tbl.add_row()
    if not split: no_split(r)
    for c, v in zip(r.cells, (kk, ru)):
        c.paragraphs[0].text = ''; rich(c.paragraphs[0], v or '', size=size, italic=italic)

# ---------- слайдтар ----------
for s in slides:
    if not (n_from <= s['n'] <= n_to): continue
    col = CHC.get(s['chapter'][0], '334155')
    if s['n'] == n_from: doc.add_page_break()
    h = para(f"{s['n']}. {s['title'][0]}", size=17, bold=True, color=col, before=(0 if s['n'] == n_from else 16), after=0); h.paragraph_format.keep_with_next = True
    h2 = para(s['title'][1], size=12.5, color='64748b', after=2); h2.paragraph_format.keep_with_next = True
    h3 = para(f"Бөлім · Раздел: {s['chapter'][0]} · {s['chapter'][1]}   |   id: {s['id']}", size=9, color='94a3b8', after=4); h3.paragraph_format.keep_with_next = True
    t = doc.add_table(rows=1, cols=2); borders(t); cell_margins(t); t.autofit = False
    for i, hd in enumerate(('Қазақша', 'Русский')):
        c = t.rows[0].cells[i]; shade(c, col); c.paragraphs[0].text = ''; rich(c.paragraphs[0], hd, bold=True, size=10.5, color='FFFFFF')
    repeat_header(t.rows[0])
    pairs = clean_pairs(s)
    long_ = [p for p in pairs if len(plain(p[0])) >= 40]; short = [p for p in pairs if len(plain(p[0])) < 40]
    if long_:
        label_row(t, 'Экрандағы сөйлемдер · Предложения на экране', 'EEF2F9')
        for kk, ru in long_: pair_row(t, kk, ru)
    if short:
        label_row(t, 'Қысқа жазулар, белгілер, батырмалар · Короткие надписи, метки, кнопки', 'EEF2F9')
        for kk, ru in short: pair_row(t, kk, ru, size=10)
    if s.get('fact'):
        label_row(t, '«Сен білесің бе?» · «А вы знали?»', 'E1F3FC')
        kp, rp = paras(s['fact'][0]), paras(s['fact'][1])
        for i in range(max(len(kp), len(rp))):
            a = kp[i] if i < len(kp) else ('', False); b = rp[i] if i < len(rp) else ('', False)
            pair_row(t, a[0], b[0], italic=a[1] or b[1], split=True)
    if s.get('bridge'):
        label_row(t, 'Келесі экранға өту сөйлемі · Фраза-переход к следующему экрану', 'EEF2F9')
        pair_row(t, s['bridge'][0], s['bridge'][1])
    if s.get('ans'):
        label_row(t, 'Тапсырма жауаптары (мұғалімге) · Ответы к заданиям (учителю)', 'E6F4EA')
        pair_row(t, s['ans'][0], s['ans'][1], size=9.5, split=True)
    if s.get('note'):
        label_row(t, 'Мұғалімге жазба (Ұста) · Заметка учителю (Ұста)', 'FFF1E0')
        pair_row(t, s['note'][0], s['note'][1], size=9.5, split=True)
    for row in t.rows:
        for i in range(len(row.cells)):
            try: row.cells[i].width = Cm(W / 2)
            except Exception: pass
    if s['id'] in DATA:
        para('Деректер · Данные', size=11, bold=True, color='334155', before=8, after=3).paragraph_format.keep_with_next = True
        data_table(s['id'])
    para('', after=6)

para('Оқиға желісі: экрандар арасындағы өту сөйлемдері', size=15, bold=True, color='0f172a', before=14, after=2).paragraph_format.keep_with_next = True
para('Сюжетная линия: фразы-переходы между экранами (по ним видно, связны ли предложения)', size=10.5, color='64748b', after=4).paragraph_format.keep_with_next = True
t = doc.add_table(rows=1, cols=3); borders(t); cell_margins(t)
for i, hd in enumerate(('№', 'Қазақша', 'Русский')):
    c = t.rows[0].cells[i]; shade(c, 'E8EEF9'); c.paragraphs[0].text = ''; rich(c.paragraphs[0], hd, bold=True, size=10)
repeat_header(t.rows[0])
for s in slides:
    if not (n_from <= s['n'] <= n_to) or not s.get('bridge'): continue
    r = t.add_row(); no_split(r)
    for c, v in zip(r.cells, (str(s['n']) + ' →', s['bridge'][0], s['bridge'][1])):
        c.paragraphs[0].text = ''; rich(c.paragraphs[0], v, size=10, bold=(v.endswith('→')))
for row in t.rows:
    for i, w in enumerate((1.4, 8.1, 8.1)): row.cells[i].width = Cm(w)
doc.save(out); print('saved', out)
