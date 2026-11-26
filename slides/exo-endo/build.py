#!/usr/bin/env python3
"""Слайд-сабақты бір HTML файлға жинайды (интернетсіз ашылады).

    python3 build.py

Нәтиже: exo-endo-sabaq.html
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "src"
OUT = ROOT / "exo-endo-sabaq.html"
LANGS = ("kk", "ru", "en")


def tri(parts, tag):
    return "".join(f'<{tag} data-l="{l}">{p}</{tag}>' for l, p in zip(LANGS, parts))


def expand(text):
    def inline(m):
        parts = m.group(1).split("|")
        if len(parts) != 3:
            sys.exit(f"[[...]] үш бөлікке бөлінбеді: {m.group(0)[:120]}")
        return tri(parts, "span")

    def block(m):
        parts = m.group(1).split("|")
        if len(parts) != 3:
            sys.exit(f"{{{{...}}}} үш бөлікке бөлінбеді: {m.group(0)[:120]}")
        return tri(parts, "div")

    text = re.sub(r"\[\[(.+?)\]\]", inline, text, flags=re.S)
    text = re.sub(r"\{\{(.+?)\}\}", block, text, flags=re.S)
    units = {
        "%kJ%": ("кДж", "кДж", "kJ"),
        "%mol%": ("моль", "моль", "mol"),
        "%g%": ("г", "г", "g"),
    }
    for key, parts in units.items():
        text = text.replace(key, tri(parts, "span"))
    for bad in ("[[", "]]", "{{", "}}", "%kJ", "%mol", "%g%"):
        if bad in text:
            i = text.index(bad)
            sys.exit(f"Өңделмеген белгі {bad!r}: …{text[max(0, i - 80):i + 80]}…")
    return text


def main():
    template = (SRC / "template.html").read_text(encoding="utf-8")
    css = (SRC / "style.css").read_text(encoding="utf-8")
    js = (SRC / "app.js").read_text(encoding="utf-8")
    slides = expand((SRC / "slides.html").read_text(encoding="utf-8"))
    for ph in ("/*__CSS__*/", "<!--__SLIDES__-->", "/*__JS__*/"):
        if template.count(ph) != 1:
            sys.exit(f"Үлгіде {ph} табылмады")
    out = (template.replace("/*__CSS__*/", css)
                   .replace("<!--__SLIDES__-->", slides)
                   .replace("/*__JS__*/", js))
    OUT.write_text(out, encoding="utf-8")
    print(f"OK → {OUT.name} ({len(out.encode('utf-8')) / 1024:.0f} KB)")
    if len(sys.argv) > 2 and sys.argv[1] == "--artifact":
        # claude.ai artifact: the host adds doctype/head/body, so ship title + style + body only
        title = re.search(r"<title>.*?</title>", out, re.S).group(0)
        style = re.search(r"<style>.*?</style>", out, re.S).group(0)
        body = out[out.index("<body>") + len("<body>"):out.rindex("</body>")]
        early = ('<script>document.documentElement.lang="kk";'
                 'document.documentElement.setAttribute("data-theme","dark")</script>')
        art = pathlib.Path(sys.argv[2])
        art.write_text(title + "\n" + style + "\n" + early + "\n" + body, encoding="utf-8")
        print(f"OK → {art} (artifact)")


if __name__ == "__main__":
    main()
