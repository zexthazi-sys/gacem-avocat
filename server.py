"""Dev server with clean URL support (mimics Vercel cleanUrls).

Sert aussi les pages HTML comme le ferait build.js : injection des partials
(<!-- @partial NAME -->) et résolution des versions d'assets (__V_*__) à la
volée. Les fichiers source gardent donc leurs marqueurs — pas besoin de lancer
build.js en local (Node n'est pas requis) et rien à committer par accident.
"""

import http.server
import os
import re
import urllib.parse

ROOT = os.path.dirname(os.path.abspath(__file__))
PARTIALS_DIR = os.path.join(ROOT, "partials")

PARTIAL_RE = re.compile(r"<!-- @partial ([\w-]+) -->.*?<!-- /@partial -->", re.S)
VERSION_RE = re.compile(r"__V_([A-Z_]+)__")


def _load_partials():
    partials = {}
    if os.path.isdir(PARTIALS_DIR):
        for name in os.listdir(PARTIALS_DIR):
            if name.endswith(".html"):
                with open(os.path.join(PARTIALS_DIR, name), encoding="utf-8") as f:
                    partials[name[:-5]] = f.read().strip()
    return partials


def _load_versions():
    """Parse le bloc `const VERSIONS = { ... };` de build.js (source unique)."""
    versions = {}
    build_path = os.path.join(ROOT, "build.js")
    try:
        with open(build_path, encoding="utf-8") as f:
            src = f.read()
    except OSError:
        return versions
    m = re.search(r"const VERSIONS\s*=\s*\{(.*?)\}", src, re.S)
    if m:
        for key, val in re.findall(r"([A-Z_]+):\s*(\d+)", m.group(1)):
            versions[key] = val
    return versions


PARTIALS = _load_partials()
VERSIONS = _load_versions()


def inject_partials(html):
    def repl(match):
        name = match.group(1)
        content = PARTIALS.get(name)
        if content is None:
            return match.group(0)
        return f"<!-- @partial {name} -->\n{content}\n<!-- /@partial -->"

    return PARTIAL_RE.sub(repl, html)


def apply_versions(html):
    def repl(match):
        key = match.group(1)
        return VERSIONS.get(key, match.group(0))

    return VERSION_RE.sub(repl, html)


class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def _rewrite_clean_url(self):
        """Rewrite extensionless paths to .html if the file exists."""
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if not os.path.splitext(path)[1]:
            html_file = os.path.join(ROOT, path.strip("/")) + ".html"
            if os.path.isfile(html_file):
                self.path = path.rstrip("/") + ".html"
                if parsed.query:
                    self.path += "?" + parsed.query

    def _serve_html(self):
        """Sert un .html avec partials + versions injectés. Renvoie True si géré."""
        fs_path = self.translate_path(self.path)
        if os.path.isdir(fs_path):
            fs_path = os.path.join(fs_path, "index.html")
        if not (fs_path.endswith(".html") and os.path.isfile(fs_path)):
            return False
        try:
            with open(fs_path, encoding="utf-8") as f:
                html = f.read()
        except OSError:
            return False
        body = apply_versions(inject_partials(html)).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
        return True

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_GET(self):
        self._rewrite_clean_url()
        if self._serve_html():
            return
        super().do_GET()

    def do_HEAD(self):
        self._rewrite_clean_url()
        super().do_HEAD()


if __name__ == "__main__":
    s = http.server.HTTPServer(("", 3000), CleanURLHandler)
    print("Serving on http://localhost:3000 (clean URLs enabled)")
    s.serve_forever()
