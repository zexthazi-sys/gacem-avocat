"""Dev server with clean URL support (mimics Vercel cleanUrls)."""

import http.server
import os

ROOT = os.path.dirname(os.path.abspath(__file__))


class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        path = self.path.split("?")[0].split("#")[0]
        # If path has no extension and isn't a file, try .html
        full = os.path.join(ROOT, path.lstrip("/"))
        if not os.path.exists(full) and not os.path.splitext(path)[1]:
            html_path = full + ".html"
            if os.path.exists(html_path):
                self.path = path + ".html"
        super().do_GET()


if __name__ == "__main__":
    s = http.server.HTTPServer(("", 3000), CleanURLHandler)
    print("Serving on http://localhost:3000 (clean URLs enabled)")
    s.serve_forever()
