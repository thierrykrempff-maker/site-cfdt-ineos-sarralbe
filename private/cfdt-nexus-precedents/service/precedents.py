#!/usr/bin/env python
"""Recherche de précédents dans les PV CE/CSE (index local privé).

Usage:
  python -I precedents.py --q "suivi des connaissances" --q "test de connaissances|QCM|contrôle des connaissances"
  Chaque --q est un GROUPE de formulations équivalentes (séparées par |).
  Le PREMIER groupe est le sujet (obligatoire) ; les suivants renforcent le classement. Un seul groupe = recherche simple.

Options:
  --since 2014 --until 2019   borne les années
  --top 12                    nombre de PV affichés (défaut 12)
  --json [--out f.json]       sortie JSON (références uniquement, sans extrait) pour Nexus
  --extract 520               taille des extraits (défaut 520 car.)
  --rebuild                   reconstruit le cache

Données: variable NEXUS_PV_INDEX, sinon ~/.claude/nexus-private/pv_index (hors dépôt, jamais publié).
"""
import os, re, sys, json, pickle, argparse, unicodedata, datetime, collections

if sys.stdout:  # absent sous pythonw (lancement sans console)
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
ROOT = os.environ.get("NEXUS_PV_INDEX") or os.path.join(os.path.expanduser("~"), ".claude", "nexus-private", "pv_index")
CACHE = os.path.join(ROOT, "cache.pkl")
WIN, STEP = 900, 450


def _c(ch):
    d = unicodedata.normalize("NFKD", ch).encode("ascii", "ignore").decode().lower()
    return d[0] if d else " "


def norm(s):
    return "".join(_c(c) for c in s)


# ---------- dates ----------
def parse_date(path):
    """Retourne (date_iso, précision) depuis le chemin; précision: jour|mois|année|?"""
    parts = path.replace("/", "\\").split("\\")
    name = os.path.splitext(parts[-1])[0]
    hay = [name] + [p for p in reversed(parts[:-1])]
    ym = re.search(r"PV du C(?:E|SE) (\d{4})", path)
    year0 = int(ym.group(1)) if ym else None

    def mk(y, m, d):
        try:
            return datetime.date(y, m, d)
        except ValueError:
            return None

    for h in hay:
        m = re.search(r"(?<!\d)(20\d{2}|19\d{2})[.\-_ ](\d{1,2})[.\-_ ](\d{1,2})(?!\d)", h)
        if m:
            d = mk(int(m[1]), int(m[2]), int(m[3]))
            if d: return d.isoformat(), "jour"
        m = re.search(r"(?<!\d)(\d{1,2})[.\-_ ](\d{1,2})[.\-_ ](20\d{2})(?!\d)", h)
        if m:
            d = mk(int(m[3]), int(m[2]), int(m[1]))
            if d: return d.isoformat(), "jour"
        m = re.search(r"(?<!\d)(\d{1,2})[.\-_ ](\d{1,2})[.\-_ ](\d{2})(?!\d)", h)
        if m and year0:
            y = 2000 + int(m[3])
            if abs(y - year0) <= 1:
                d = mk(y, int(m[2]), int(m[1]))
                if d: return d.isoformat(), "jour"
    for h in hay:
        m = re.search(r"(?<!\d)(\d{2})[-.](20\d{2})(?!\d)", h)
        if m and 1 <= int(m[1]) <= 12:
            return f"{m[2]}-{m[1]}-01", "mois"
        m = re.search(r"(?<!\d)(\d{2})[-.](\d{2})(?!\d)", h)
        if m and year0 and 1 <= int(m[1]) <= 12 and abs(2000 + int(m[2]) - year0) <= 1:
            return f"{2000+int(m[2])}-{m[1]}-01", "mois"
    mois = {"janvier": 1, "fevrier": 2, "mars": 3, "avril": 4, "mai": 5, "juin": 6, "juillet": 7,
            "aout": 8, "septembre": 9, "octobre": 10, "novembre": 11, "decembre": 12}
    for h in hay:
        n = norm(h)
        for k, v in mois.items():
            if k in n and year0:
                return f"{year0}-{v:02d}-01", "mois"
    for h in hay[1:]:
        m = re.fullmatch(r"\s*(\d{2})\s*", h)
        if m and year0 and 1 <= int(m[1]) <= 12:
            return f"{year0}-{m[1]}-01", "mois"
    if year0:
        return f"{year0}-01-01", "année"
    return "0000-00-00", "?"


# ---------- corpus ----------
def build():
    seen, docs, wins = set(), [], []
    with open(os.path.join(ROOT, "index.jsonl"), encoding="utf-8") as fh:
        lines = fh.read().splitlines()
    for line in lines:
        if not line.strip(): continue
        r = json.loads(line)
        if r["hash"] in seen: continue
        seen.add(r["hash"])
        tp = os.path.join(ROOT, "txt", r["hash"] + ".txt")
        if not os.path.exists(tp): continue
        with open(tp, encoding="utf-8") as th:
            t = th.read()
        if len(t.strip()) < 60: continue
        date, prec = parse_date(r["path"])
        rel = r["path"].split("Réunions de CE\\", 1)[-1]
        di = len(docs)
        docs.append({"path": rel, "date": date, "prec": prec, "method": r["method"], "chars": len(t)})
        n = norm(t)
        # pages: \f (pdftotext) ou "--- page N ---" (OCR)
        marks = [(m.start(), None) for m in re.finditer("\f", t)]
        pmarks = [(m.start(), int(m.group(1))) for m in re.finditer(r"--- page (\d+) ---", t)]
        for s in range(0, max(1, len(t) - 200), STEP):
            e = min(len(t), s + WIN)
            if pmarks:
                pg = max([p for pos, p in pmarks if pos <= s], default=1)
            else:
                pg = 1 + sum(1 for pos, _ in marks if pos <= s)
            wins.append((di, pg, t[s:e], n[s:e]))
            if e == len(t): break
    return {"docs": docs, "wins": wins}


def load(rebuild=False):
    idx = os.path.join(ROOT, "index.jsonl")
    if not rebuild and os.path.exists(CACHE) and os.path.getmtime(CACHE) >= os.path.getmtime(idx):
        with open(CACHE, "rb") as ch:
            return pickle.load(ch)
    data = build()
    with open(CACHE, "wb") as ch:
        pickle.dump(data, ch)
    return data


# ---------- requête ----------
class Term:
    """Terme de recherche : regex de mots (préfixes) + sous-chaîne obligatoire pour filtrer très vite."""
    __slots__ = ("rx", "needle")

    def __init__(self, rx, needle):
        self.rx, self.needle = rx, needle

    def count(self, text):
        return len(self.rx.findall(text)) if self.needle in text else 0

    def search(self, text):
        return self.rx.search(text) if self.needle in text else None


def _stem(w):
    stem = w[:-1] if len(w) > 5 and w.endswith(("s", "x")) else w
    return stem[: len(stem) - 2] if len(stem) > 6 else stem


def term_regex(term):
    words = [w for w in re.findall(r"[a-z0-9]+", norm(term)) if w]
    if not words: return None
    stems = [_stem(w) for w in words]
    parts = [r"\b" + re.escape(st) + r"\w*" for st in stems]
    return Term(re.compile(r"\W+(?:\w+\W+){0,2}".join(parts)), max(stems, key=len))


def search(data, qlist, since=0, until=9999, extract=520):
    """Coeur de la recherche. Renvoie (résultats, docs, groupes, indice du groupe-sujet)."""
    import math
    docs, wins = data["docs"], data["wins"]
    groups = []
    for g in qlist:
        rxs = [r for r in (term_regex(x) for x in g.split("|")) if r]
        if rxs: groups.append((g.split("|")[0].strip(), rxs))
    # rareté de chaque groupe (idf sur les fenêtres)
    df = [0] * len(groups)
    hits = []
    for (di, pg, raw, nm) in wins:
        y = int(docs[di]["date"][:4])
        mg = []
        for gi, (_, rxs) in enumerate(groups):
            c = sum(r.count(nm) for r in rxs)
            mg.append(c)
            if c: df[gi] += 1
        hits.append((di, pg, raw, nm, mg, y))
    N = max(1, len(wins))
    idf = [math.log(1 + N / (1 + d)) for d in df]
    subj = 0  # le PREMIER groupe est le sujet obligatoire ; les suivants renforcent le classement
    best = {}
    for di, pg, raw, nm, mg, y in hits:
        if not (since <= y <= until): continue
        covered = sum(1 for c in mg if c)
        if not mg[subj]: continue  # le sujet doit être présent; les autres groupes renforcent
        score = sum(idf[i] * (1 + math.log(1 + c)) for i, c in enumerate(mg) if c)
        score *= 1 + 0.9 * (covered - 1) if len(groups) > 1 else 1  # bonus multi-groupes
        b = best.setdefault(di, {"score": 0, "n": 0, "w": None, "cov": 0})
        b["n"] += 1
        if score > b["score"]:
            b.update(score=score, w=(pg, raw, mg), cov=covered)
    if not best:
        return [], docs, groups, None
    ranked = sorted(best.items(), key=lambda kv: -(kv[1]["score"] + 0.15 * math.log(1 + kv[1]["n"])))
    mx = ranked[0][1]["score"]

    def excerpt(raw, mg):
        flat = re.sub(r"\s+", " ", raw).strip()
        nf = norm(flat)
        pos = min([m.start() for r in groups[subj][1] for m in [r.search(nf)] if m] or [0])
        st = max(0, pos - extract // 3)
        en = min(len(flat), st + extract)
        return ("…" if st else "") + flat[st:en] + ("…" if en < len(flat) else "")

    out = []
    for rank, (di, b) in enumerate(ranked, 1):
        d = docs[di]; pg, raw, mg = b["w"]
        out.append({"rang": rank, "pertinence": round(100 * b["score"] / mx), "date": d["date"],
                    "precision_date": d["prec"], "fichier": d["path"], "page": pg,
                    "groupes_couverts": f'{b["cov"]}/{len(groups)}', "passages": b["n"],
                    "lecture": d["method"], "extrait": excerpt(raw, mg)})
    return out, docs, groups, subj



def _concept_windows(data, concept, cache):
    """Fenêtres contenant la notion (préfixe de mot), mémorisées pour tout un lot."""
    if concept in cache:
        return cache[concept]
    t = term_regex(concept)
    found = set()
    if t:
        for i, (_, _, _, nm) in enumerate(data["wins"]):
            if t.needle in nm and t.rx.search(nm):
                found.add(i)
    cache[concept] = found
    return found


def _proximity(terms, nm):
    """Bonus (0 à 1) selon l'écart entre les notions trouvées : proches = pertinent, éparpillées = bruit."""
    pos = [m.start() for t in terms for m in [t.search(nm)] if m]
    if len(pos) < 2:
        return 0.0
    span = max(pos) - min(pos)
    return 1.0 if span <= 250 else 0.5 if span <= 500 else 0.0


def search_points(data, points, since=0, until=9999, limit=3, extract=700):
    """Cherche plusieurs points d'ordre du jour d'un coup.

    points : liste de {"id": str, "concepts": [str, ...], "min_matches": int}.
    Un passage correspond si au moins `min_matches` notions distinctes y figurent.
    Renvoie {id: [ {date, precision_date, fichier, page, notions, extrait}, ... ]} (au plus `limit` PV par point).
    """
    import math
    docs, wins = data["docs"], data["wins"]
    N = max(1, len(wins))
    cache = {}
    out = {}
    for pt in points:
        pid = str(pt.get("id", ""))
        concepts = [norm(c).strip() for c in pt.get("concepts", []) if norm(c).strip()][:8]
        need = max(1, min(int(pt.get("min_matches", 1) or 1), len(concepts) or 1))
        sets = [_concept_windows(data, c, cache) for c in concepts]
        idf = [math.log(1 + N / (1 + len(w))) for w in sets]
        counts = {}
        for ci, w in enumerate(sets):
            for wi in w:
                counts.setdefault(wi, []).append(ci)
        terms = [term_regex(c) for c in concepts]
        best = {}
        for wi, cis in counts.items():
            if len(cis) < need: continue
            di, pg, raw, nm = wins[wi]
            y = int(docs[di]["date"][:4])
            if not (since <= y <= until): continue
            score = sum(idf[ci] for ci in cis) * (1 + _proximity([terms[ci] for ci in cis], nm))
            cur = best.get(di)
            if cur is None or score > cur[0]:
                best[di] = (score, wi, cis)
        rows = []
        for di, (score, wi, cis) in sorted(best.items(), key=lambda kv: -kv[1][0])[:limit]:
            _, pg, raw, nm = wins[wi]
            flat = re.sub(r"\s+", " ", raw).strip()
            nf = norm(flat)
            first = [terms[ci].search(nf) for ci in cis]
            pos = min([m.start() for m in first if m] or [0])
            st = max(0, pos - extract // 3)
            en = min(len(flat), st + extract)
            d = docs[di]
            rows.append({"date": d["date"], "precision_date": d["prec"], "fichier": d["path"], "page": pg,
                         "notions": [concepts[ci] for ci in cis],
                         "extrait": ("…" if st else "") + flat[st:en] + ("…" if en < len(flat) else "")})
        out[pid] = rows
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--q", action="append", required=True)
    ap.add_argument("--since", type=int, default=0)
    ap.add_argument("--until", type=int, default=9999)
    ap.add_argument("--top", type=int, default=12)
    ap.add_argument("--extract", type=int, default=520)
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--out", help="écrit la sortie --json dans ce fichier (UTF-8, sans BOM)")
    ap.add_argument("--rebuild", action="store_true")
    a = ap.parse_args()

    data = load(a.rebuild)
    out, docs, groups, subj = search(data, a.q, a.since, a.until, a.extract)
    if not out:
        print("Aucun passage ne correspond. Élargissez les formulations (--q 'a|b|c').")
        return

    if a.json:
        refs = [{k: v for k, v in o.items() if k != "extrait"} for o in out]
        payload = json.dumps({"requete": a.q, "genere": datetime.date.today().isoformat(),
                              "pv_indexes": len(docs), "resultats": refs}, ensure_ascii=False, indent=1)
        if a.out:
            with open(a.out, "w", encoding="utf-8", newline=chr(10)) as fh:
                fh.write(payload)
            print(f"{len(refs)} références écrites dans {a.out} (sans extrait).")
        else:
            print(payload)
        return

    # ----- frise chronologique -----
    per_year = collections.Counter(o["date"][:4] for o in out)
    dated = sorted(out, key=lambda o: o["date"])
    print(f"RÉSULTATS pour {a.q}  —  {len(out)} PV concernés sur {len(docs)} PV indexés\n")
    print("FRISE CHRONOLOGIQUE (PV concernés par année)")
    for y in sorted(per_year):
        print(f"  {y} | {'█' * min(per_year[y], 40)} {per_year[y]}")
    f, l = dated[0], dated[-1]
    print(f"  première mention : {f['date']} ({f['precision_date']}) — {f['fichier']}")
    print(f"  dernière mention : {l['date']} ({l['precision_date']}) — {l['fichier']}\n")
    print(f"CLASSEMENT PAR PERTINENCE (top {a.top}; 100 = meilleur passage)")
    for o in out[: a.top]:
        print(f"\n#{o['rang']}  [{o['pertinence']:>3}]  {o['date']} ({o['precision_date']})  p.{o['page']}  "
              f"couvre {o['groupes_couverts']} groupe(s), {o['passages']} passage(s)")
        print(f"    {o['fichier']}")
        print(f"    « {o['extrait']} »")
    if len(out) > a.top:
        print(f"\n… {len(out) - a.top} autre(s) PV moins pertinent(s) (relancez avec --top {len(out)}).")


if __name__ == "__main__":
    main()
