"""Dev server with clean URL support (mimics Vercel cleanUrls)."""

import http.server
import os
import urllib.parse

ROOT = os.path.dirname(os.path.abspath(__file__))


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

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_GET(self):
        self._rewrite_clean_url()
        super().do_GET()

    def do_HEAD(self):
        self._rewrite_clean_url()
        super().do_HEAD()


if __name__ == "__main__":
    s = http.server.HTTPServer(("", 3000), CleanURLHandler)
    print("Serving on http://localhost:3000 (clean URLs enabled)")
    s.serve_forever()
