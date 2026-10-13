"""Tests du service « Précédents » sur un corpus FICTIF (aucun vrai PV).

Lancement : python -I -m unittest discover -s private/cfdt-nexus-precedents/service/tests -v
"""
import json, os, sys, tempfile, threading, unittest, urllib.request, urllib.error, hashlib, http.client

HERE = os.path.dirname(os.path.abspath(__file__))
SERVICE = os.path.dirname(HERE)
sys.path.insert(0, SERVICE)

# corpus fictif : (chemin relatif, texte)
CORPUS = [
    ("PV du CE 2014\\06\\2014.06.26 CR CE.doc",
     "CFDT : arrêter les évaluations des connaissances du suivi des installations. "
     "Direction : le suivi des connaissances est obligatoire pour les conducteurs. " + "Bla. " * 200),
    ("PV du CE 2016\\03\\2016.03.31 CR CE.doc",
     "CFTC : tests de connaissances, la direction a-t-elle consulté le CHSCT ? Direction : le CE a été consulté. "
     "Les opérateurs passent un QCM sur les installations. " + "Bla. " * 200),
    ("PV du CSE 2021\\PV du 25.03.21\\PV CSE 25.03.2021.pdf",
     "Question sur les primes de poste et le calendrier des congés. " + "Bla. " * 300),
    ("PV du CSE 2022\\CSE du 29.09.2022\\PV du CSE du 29.09.2022.pdf",
     "Évaluation annuelle : le suivi des connaissances reste un sujet. " + "Bla. " * 300),
]
PORT = 18765


def build_fake_index(root):
    os.makedirs(os.path.join(root, "txt"))
    with open(os.path.join(root, "index.jsonl"), "w", encoding="utf-8") as idx:
        for path, text in CORPUS:
            full = "D:\\fictif\\Réunions de CE\\" + path
            h = hashlib.md5(full.encode("utf-8")).hexdigest()
            with open(os.path.join(root, "txt", h + ".txt"), "w", encoding="utf-8") as fh:
                fh.write(text)
            idx.write(json.dumps({"path": full, "hash": h, "method": "native", "chars": len(text), "err": ""}) + "\n")


class EngineTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        os.environ["NEXUS_PV_INDEX"] = cls.tmp.name
        build_fake_index(cls.tmp.name)
        import importlib, precedents
        cls.P = importlib.reload(precedents)
        cls.data = cls.P.load(rebuild=True)

    @classmethod
    def tearDownClass(cls):
        os.environ.pop("NEXUS_PV_INDEX", None)
        cls.tmp.cleanup()

    def test_search_points_par_notions(self):
        r = self.P.search_points(self.data, [{"id": "x", "concepts": ["connaissances", "installations"], "min_matches": 2},
                                              {"id": "y", "concepts": ["connaissances"], "min_matches": 1},
                                              {"id": "z", "concepts": ["inexistant"], "min_matches": 1}])
        self.assertEqual({row["date"][:4] for row in r["x"]}, {"2014", "2016"})  # 2 notions requises
        self.assertEqual(len(r["y"]), 3)                                          # 1 notion : 3 PV
        self.assertEqual(r["z"], [])
        self.assertTrue(all("extrait" in row and row["page"] >= 1 for row in r["y"]))

    def test_search_points_borne_les_annees(self):
        r = self.P.search_points(self.data, [{"id": "y", "concepts": ["connaissances"]}], since=2020)
        self.assertEqual([row["date"][:4] for row in r["y"]], ["2022"])

    def test_filtre_rapide_ne_change_pas_les_resultats(self):
        t = self.P.term_regex("évaluations des connaissances")
        self.assertTrue(t.count("les evaluations des connaissances sont requises") >= 1)
        self.assertEqual(t.count("rien a voir ici"), 0)

    def test_dates_depuis_noms_de_fichiers(self):
        self.assertEqual(self.P.parse_date("PV du CE 2016\\03\\2016.03.31 CR CE.doc"), ("2016-03-31", "jour"))
        self.assertEqual(self.P.parse_date("PV du CSE 2021\\PV du 25.03.21\\PV CSE 25.03.2021.pdf"), ("2021-03-25", "jour"))
        self.assertEqual(self.P.parse_date("PV du CE 2017\\Présentation.pdf")[1], "année")

    def test_le_sujet_est_obligatoire_et_classe_par_pertinence(self):
        out, docs, groups, subj = self.P.search(
            self.data, ["suivi des connaissances|tests de connaissances|QCM", "installations|opérateurs|conducteurs"])
        dates = [o["date"] for o in out]
        self.assertNotIn("2021-03-25", dates)           # ne parle pas du sujet
        self.assertEqual(len(out), 3)
        self.assertEqual(out[0]["rang"], 1)
        self.assertGreaterEqual(out[0]["pertinence"], out[-1]["pertinence"])
        self.assertEqual(out[0]["pertinence"], 100)
        self.assertTrue(out[0]["groupes_couverts"].startswith("2/"))

    def test_bornes_d_annees(self):
        out, *_ = self.P.search(self.data, ["suivi des connaissances"], since=2020)
        self.assertEqual([o["date"][:4] for o in out], ["2022"])

    def test_aucun_resultat(self):
        out, *_ = self.P.search(self.data, ["mot qui nexiste nulle part"])
        self.assertEqual(out, [])

    def test_accents_et_pluriels_indifferents(self):
        a, *_ = self.P.search(self.data, ["evaluation des connaissance"])
        b, *_ = self.P.search(self.data, ["évaluations des connaissances"])
        self.assertEqual([o["date"] for o in a], [o["date"] for o in b])
        self.assertTrue(a)


class ServerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        os.environ["NEXUS_PV_INDEX"] = cls.tmp.name
        os.environ["NEXUS_PORT"] = str(PORT)
        os.environ["NEXUS_ALLOWED_ORIGINS"] = "http://localhost:8796"
        build_fake_index(cls.tmp.name)
        import importlib, precedents, server
        importlib.reload(precedents)
        cls.S = importlib.reload(server)
        cls.S.PORT = PORT
        cls.httpd = cls.S.ThreadingHTTPServer(("127.0.0.1", PORT), cls.S.Handler)
        threading.Thread(target=cls.httpd.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()
        for k in ("NEXUS_PV_INDEX", "NEXUS_PORT", "NEXUS_ALLOWED_ORIGINS"):
            os.environ.pop(k, None)
        cls.tmp.cleanup()

    def get(self, path, headers=None, host=None, method="GET"):
        c = http.client.HTTPConnection("127.0.0.1", PORT, timeout=10)
        h = dict(headers or {})
        if host:
            h["Host"] = host
        c.request(method, path, headers=h)
        r = c.getresponse()
        body = r.read()
        return r.status, dict(r.getheaders()), body

    API = "/api/precedents?q=suivi%20des%20connaissances&q=installations"

    def test_api_exige_l_entete_nexus(self):
        self.assertEqual(self.get(self.API)[0], 403)
        self.assertEqual(self.get(self.API, {"X-Nexus": "1"})[0], 200)

    def test_references_seulement_jamais_d_extrait(self):
        status, _, body = self.get(self.API, {"X-Nexus": "1"})
        data = json.loads(body)
        self.assertTrue(data["resultats"])
        for r in data["resultats"]:
            self.assertNotIn("extrait", r)
        self.assertNotIn("Bla.", body.decode("utf-8"))

    def test_origine_etrangere_refusee_origine_declaree_acceptee(self):
        self.assertEqual(self.get(self.API, {"X-Nexus": "1", "Origin": "https://evil.example"})[0], 403)
        status, hdr, _ = self.get(self.API, {"X-Nexus": "1", "Origin": "http://localhost:8796"})
        self.assertEqual(status, 200)
        self.assertEqual(hdr.get("Access-Control-Allow-Origin"), "http://localhost:8796")
        # origine étrangère : pas d'en-tête CORS
        _, hdr2, _ = self.get("/private/cfdt-nexus-precedents/index.html", {"Origin": "https://evil.example"})
        self.assertNotIn("Access-Control-Allow-Origin", hdr2)

    def test_preflight(self):
        ok = self.get(self.API, {"Origin": "http://localhost:8796", "Access-Control-Request-Method": "GET",
                                 "Access-Control-Request-Headers": "x-nexus"}, method="OPTIONS")
        self.assertEqual(ok[0], 204)
        bad = self.get(self.API, {"Origin": "https://evil.example"}, method="OPTIONS")
        self.assertEqual(bad[0], 403)

    def test_hote_falsifie_refuse(self):
        self.assertEqual(self.get("/api/health", {"X-Nexus": "1"}, host="evil.example:%d" % PORT)[0], 403)

    def test_seules_les_pages_en_liste_blanche_sont_servies(self):
        for path in ("/private/cfdt-nexus-precedents/README.md",
                     "/private/cfdt-nexus-precedents/service/server.py",
                     "/private/cfdt-nexus-precedents/service/tests/test_service.py",
                     "/private/README.md", "/pv_index/index.jsonl", "/../etc/passwd",
                     "/cockpit/index.html", "/index.html", "/private/cfdt-nexus-bibliotheque/index.html",
                     "/private/cfdt-nexus-dossiers/app.js", "/historique.html",
                     "/private/cfdt-nexus-precedents/../../.git/config", "/confidential/README.md"):
            self.assertEqual(self.get(path)[0], 404, path)

    def test_le_module_est_servi_avec_ses_ressources(self):
        for name in ("index.html", "app.js", "styles.css", "module.json"):
            status, _, body = self.get("/private/cfdt-nexus-precedents/" + name)
            self.assertEqual(status, 200, name)
            self.assertTrue(body, name)

    def post(self, path, payload, headers=None):
        c = http.client.HTTPConnection("127.0.0.1", PORT, timeout=10)
        h = {"Content-Type": "application/json"}
        h.update(headers or {})
        c.request("POST", path, body=json.dumps(payload), headers=h)
        r = c.getresponse()
        return r.status, r.read()

    POINTS = {"points": [{"id": "a", "concepts": ["connaissances", "installations"], "min_matches": 2},
                         {"id": "b", "concepts": ["primes"], "min_matches": 1}]}
    SERVER_HEADERS = {"X-Nexus": "1", "X-Nexus-Server": "1"}

    def test_passages_servis_au_serveur_nexus_local(self):
        status, body = self.post("/api/passages", self.POINTS, self.SERVER_HEADERS)
        self.assertEqual(status, 200)
        data = json.loads(body)
        self.assertIn("a", data["points"])
        rows = data["points"]["a"]
        self.assertTrue(rows)
        self.assertLessEqual(len(rows), 3)
        self.assertIn("connaissances", rows[0]["extrait"].lower())
        self.assertTrue(data["points"]["b"])  # "primes" figure dans le PV 2021

    def test_passages_refuses_aux_navigateurs(self):
        for extra in ({"Origin": "http://localhost:8796"}, {"Origin": "http://127.0.0.1:%d" % PORT},
                      {"Sec-Fetch-Site": "same-origin"}, {"Sec-Fetch-Mode": "cors"}):
            status, _ = self.post("/api/passages", self.POINTS, {**self.SERVER_HEADERS, **extra})
            self.assertEqual(status, 403, extra)

    def test_passages_exigent_les_en_tetes_nexus(self):
        self.assertEqual(self.post("/api/passages", self.POINTS)[0], 403)
        self.assertEqual(self.post("/api/passages", self.POINTS, {"X-Nexus": "1"})[0], 403)

    def test_passages_hote_falsifie_et_corps_invalides(self):
        c = http.client.HTTPConnection("127.0.0.1", PORT, timeout=10)
        c.request("POST", "/api/passages", body="{}", headers={**self.SERVER_HEADERS, "Host": "evil.example:%d" % PORT})
        self.assertEqual(c.getresponse().status, 403)
        self.assertEqual(self.post("/api/passages", {"points": "pas une liste"}, self.SERVER_HEADERS)[0], 400)
        self.assertEqual(self.post("/api/inconnu", self.POINTS, self.SERVER_HEADERS)[0], 404)

    def test_passages_limites_de_taille(self):
        many = {"points": [{"id": str(i), "concepts": ["connaissances"]} for i in range(200)]}
        status, body = self.post("/api/passages", many, self.SERVER_HEADERS)
        self.assertEqual(status, 200)
        self.assertLessEqual(len(json.loads(body)["points"]), 60)

    def test_ecoute_loopback_uniquement(self):
        self.assertEqual(self.httpd.server_address[0], "127.0.0.1")

    def test_racine_redirige_vers_le_module(self):
        status, hdr, _ = self.get("/")
        self.assertEqual(status, 302)
        self.assertTrue(hdr["Location"].endswith("/cfdt-nexus-precedents/index.html"))


if __name__ == "__main__":
    unittest.main()
