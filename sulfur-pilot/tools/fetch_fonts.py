"""Download Google Fonts as local woff2 files + a fonts.css for offline, deterministic rendering.

usage:
  python3 -I fetch_fonts.py <out_dir> "Cormorant:wght@500=Corm" "Cormorant:ital,wght@1,500=CormI" \
      "Cormorant SC:wght@600=CormSC" "Shippori Mincho B1:wght@800=JP:text=雪女"

Each spec is  <Google family>:<axis spec>=<local family name>[:text=<only these glyphs>]
Subsets cyrillic + latin are kept (others dropped) unless text= is given (then Google returns a tiny subset —
use it for CJK titles). Writes <out_dir>/*.woff2 and <out_dir>/fonts.css; link fonts.css from the page.
Check the printed glyph coverage: a missing subset silently falls back to a system font in the render.
"""
import re, sys, os, urllib.parse, urllib.request

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
KEEP = {"cyrillic", "cyrillic-ext", "latin", "latin-ext"}


def get(url, binary=False):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = r.read()
    return data if binary else data.decode()


def main():
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    css_out = []
    for spec in sys.argv[2:]:
        text = None
        if ":text=" in spec:
            spec, text = spec.split(":text=", 1)
        gspec, local = spec.rsplit("=", 1)
        fam, axes = gspec.split(":", 1)
        q = f"family={urllib.parse.quote(fam)}:{axes}&display=block"
        if text:
            q += "&text=" + urllib.parse.quote(text)
        css = get("https://fonts.googleapis.com/css2?" + q)
        blocks = re.findall(r"(?:/\* (\S+) \*/\s*)?@font-face \{(.*?)\}", css, re.S)
        n = 0
        for sub, body in blocks:
            if not text and sub and sub not in KEEP:
                continue
            url = re.search(r"url\((\S+?)\)", body).group(1)
            style = re.search(r"font-style:\s*(\w+)", body).group(1)
            weight = re.search(r"font-weight:\s*([\d ]+)", body).group(1).strip()
            rng = re.search(r"unicode-range:\s*([^;]+);", body)
            fn = f"{local}-{sub or 'subset'}-{n}.woff2"
            with open(os.path.join(out, fn), "wb") as f:
                f.write(get(url, True))
            css_out.append("@font-face{font-family:%s;src:url(%s) format('woff2');font-style:%s;font-weight:%s;%s}" % (
                local, fn, style, weight, f"unicode-range:{rng.group(1)};" if rng else ""))
            n += 1
        print(f"{local:10s} <- {fam} {axes}: {n} file(s) {'(text subset)' if text else ''}")
    with open(os.path.join(out, "fonts.css"), "w") as f:
        f.write("\n".join(css_out) + "\n")
    print("wrote", os.path.join(out, "fonts.css"))


if __name__ == "__main__":
    main()
