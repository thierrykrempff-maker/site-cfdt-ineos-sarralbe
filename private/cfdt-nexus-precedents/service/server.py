#!/usr/bin/env python
"""Service local du module CFDT Nexus « Précédents ».

Il répond aux recherches dans l'index PRIVÉ des PV (hors dépôt) et publie les pages des modules Nexus.

Garanties de sécurité (voir knowledge/SECURITY_POLICY.md) :
- écoute UNIQUEMENT sur 127.0.0.1, jamais sur le réseau ;
- ne renvoie aux NAVIGATEURS que des RÉFÉRENCES (date, PV, page, pertinence) : jamais d'extrait de PV ;
- les extraits (POST /api/passages) ne sont servis qu'au serveur Nexus local : toute requête portant un en-tête
  de navigateur (Origin, Sec-Fetch-*) est refusée, et l'en-tête X-Nexus-Server est exigé ;
- ne publie QUE les fichiers .html/.js/.css/.json de ce module (liste blanche) : ni le site, ni le cockpit,
  ni les autres modules ; l'index, le dossier service/ et les README ne sont jamais servis ;
- refuse les hôtes falsifiés (anti DNS-rebinding), les origines non déclarées et les appels sans en-tête X-Nexus ;
- aucun journal des requêtes (une question peut révéler un sujet sensible).

Configuration (variables d'environnement, toutes facultatives) :
  NEXUS_PV_INDEX          dossier de l'index privé        (défaut : ~/.claude/nexus-private/pv_index)
  NEXUS_PORT              port du service                 (défaut : 8791)
  NEXUS_ALLOWED_ORIGINS   origines autorisées à appeler l'API depuis une autre page,
                          séparées par des virgules       (défaut : http://localhost:8796,http://127.0.0.1:8796)

Lancement : python -I server.py [--port 8791] [--open]
"""
import os, re, sys, json, threading, datetime, argparse, webbrowser
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import precedents as P  # noqa: E402

SITE_ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))  # sert de base de chemin ; seul le module est publié
HOME_PAGE = "/private/cfdt-nexus-precedents/index.html"
# uniquement /private/cfdt-nexus-precedents/<fichier> ; aucun sous-dossier, aucune autre extension
STATIC_RE = re.compile(r"^/private/cfdt-nexus-precedents/[A-Za-z0-9._-]+\.(?:html|js|css|json)$")
TYPES = {".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
         ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8"}
LOCK = threading.Lock()
STATE = {"data": None, "mtime": 0.0}
PORT = int(os.environ.get("NEXUS_PORT", "8791"))
ALLOWED = [o.strip().rstrip("/") for o in os.environ.get(
    "NEXUS_ALLOWED_ORIGINS", "http://localhost:8796,http://127.0.0.1:8796").split(",") if o.strip()]


def own_origins():
    return {f"http://127.0.0.1:{PORT}", f"http://localhost:{PORT}"}


def origin_ok(origin):
    return origin in own_origins() or origin in ALLOWED


def get_data():
    idx = os.path.join(P.ROOT, "index.jsonl")
    m = os.path.getmtime(idx)
    if STATE["data"] is None or m > STATE["mtime"]:
        STATE["data"] = P.load(rebuild=STATE["data"] is not None)
        STATE["mtime"] = m
    return STATE["data"]


class Handler(BaseHTTPRequestHandler):
    server_version = "NexusLocal"

    def log_message(self, *args):
        pass

    def _headers(self, code, length, ctype, origin=None):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(length))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        if origin and origin_ok(origin):
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.end_headers()

    def _send(self, code, body, ctype="application/json; charset=utf-8"):
        raw = body if isinstance(body, bytes) else body.encode("utf-8")
        self._headers(code, len(raw), ctype, self.headers.get("Origin"))
        self.wfile.write(raw)

    def _host_ok(self):
        return (self.headers.get("Host") or "").lower() in (f"127.0.0.1:{PORT}", f"localhost:{PORT}")

    def do_OPTIONS(self):  # préflight CORS (l'en-tête X-Nexus l'impose)
        origin = self.headers.get("Origin")
        if not self._host_ok() or not origin or not origin_ok(origin):
            return self._send(403, '{"erreur":"origine refusée"}')
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Access-Control-Allow-Headers", "X-Nexus")
        self.send_header("Access-Control-Allow-Methods", "GET")
        self.send_header("Access-Control-Max-Age", "600")
        self.send_header("Vary", "Origin")
        self.end_headers()

    def do_GET(self):
        if not self._host_ok():  # anti DNS-rebinding
            return self._send(403, '{"erreur":"hôte refusé"}')
        url = urlparse(self.path)
        if url.path.startswith("/api/"):
            return self._api(url)
        if url.path == "/":
            self.send_response(302)
            self.send_header("Location", HOME_PAGE)
            self.end_headers()
            return
        if not STATIC_RE.match(url.path):
            return self._send(404, "Introuvable", "text/plain; charset=utf-8")
        fp = os.path.abspath(os.path.join(SITE_ROOT, url.path.lstrip("/")))
        if not fp.startswith(SITE_ROOT + os.sep) or not os.path.isfile(fp):
            return self._send(404, "Introuvable", "text/plain; charset=utf-8")
        with open(fp, "rb") as fh:
            self._send(200, fh.read(), TYPES[os.path.splitext(fp)[1]])

    def do_POST(self):
        """POST /api/passages : extraits pour le serveur Nexus local (clients NON navigateur uniquement)."""
        # Toujours consommer le corps avant de répondre : fermer sans l'avoir lu coupe la connexion côté client.
        try:
            size = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            size = -1
        if 0 < size <= 65536:
            raw_body = self.rfile.read(size)
        else:
            raw_body = b""
            self.close_connection = True
        if not self._host_ok():
            return self._send(403, '{"erreur":"hôte refusé"}')
        if urlparse(self.path).path != "/api/passages":
            return self._send(404, '{"erreur":"inconnu"}')
        # un navigateur envoie toujours Origin et/ou Sec-Fetch-* (en-têtes qu'une page ne peut pas retirer)
        if any(k.lower().startswith("sec-fetch-") for k in self.headers.keys()) or self.headers.get("Origin") is not None:
            return self._send(403, '{"erreur":"extraits réservés au serveur Nexus local"}')
        if self.headers.get("X-Nexus") != "1" or self.headers.get("X-Nexus-Server") != "1":
            return self._send(403, '{"erreur":"en-têtes Nexus manquants"}')
        if not 0 < size <= 65536:
            return self._send(400, '{"erreur":"corps invalide"}')
        try:
            body = json.loads(raw_body.decode("utf-8"))
            raw_points = body.get("points")
            if not isinstance(raw_points, list):
                return self._send(400, '{"erreur":"points manquants"}')
        except (ValueError, UnicodeDecodeError, AttributeError):
            return self._send(400, '{"erreur":"JSON invalide"}')
        points = []
        for item in raw_points[:60]:
            if not isinstance(item, dict):
                continue
            concepts = [str(c)[:60] for c in (item.get("concepts") or []) if str(c).strip()][:12]
            if not concepts:
                continue
            try:
                need = max(1, min(int(item.get("min_matches", 1)), 12))
            except (TypeError, ValueError):
                need = 1
            points.append({"id": str(item.get("id", ""))[:80], "concepts": concepts, "min_matches": need})

        def year(key, default):
            try:
                v = int(body.get(key))
                return v if 1990 <= v <= 2100 else default
            except (TypeError, ValueError):
                return default

        try:
            limit = max(1, min(int(body.get("limit", 3)), 15))
        except (TypeError, ValueError):
            limit = 3
        with LOCK:
            data = get_data()
            result = P.search_points(data, points, year("since", 0), year("until", 9999), limit=limit, extract=700)
        self._send(200, json.dumps({"ok": True, "pv_indexes": len(data["docs"]), "points": result}, ensure_ascii=False))

    def _api(self, url):
        if self.headers.get("X-Nexus") != "1":
            return self._send(403, '{"erreur":"en-tête X-Nexus manquant"}')
        origin = self.headers.get("Origin")
        if origin and not origin_ok(origin):
            return self._send(403, '{"erreur":"origine refusée"}')
        if url.path == "/api/health":
            return self._send(200, json.dumps({"ok": True, "pv_indexes": len(get_data()["docs"])}))
        if url.path != "/api/precedents":
            return self._send(404, '{"erreur":"inconnu"}')
        qs = parse_qs(url.query)
        groups = [g.strip()[:300] for g in qs.get("q", []) if g.strip()][:6]
        if not groups:
            return self._send(400, '{"erreur":"aucun groupe de formulations"}')

        def year(key, default):
            try:
                v = int((qs.get(key) or [""])[0])
                return v if 1990 <= v <= 2100 else default
            except ValueError:
                return default

        with LOCK:
            out, docs, _, _ = P.search(get_data(), groups, year("since", 0), year("until", 9999), extract=0)
        refs = [{k: v for k, v in o.items() if k != "extrait"} for o in out]
        self._send(200, json.dumps({"requete": groups, "genere": datetime.date.today().isoformat(),
                                    "pv_indexes": len(docs), "resultats": refs}, ensure_ascii=False))


def main():
    global PORT
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--port", type=int, default=PORT)
    ap.add_argument("--open", action="store_true", help="ouvre la page dans le navigateur")
    a = ap.parse_args()
    PORT = a.port
    get_data()
    srv = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"Nexus local prêt : http://127.0.0.1:{PORT}/  (Ctrl+C pour arrêter)", flush=True)
    if a.open:
        webbrowser.open(f"http://127.0.0.1:{PORT}/")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
