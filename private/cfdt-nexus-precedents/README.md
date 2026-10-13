# CFDT Nexus - Précédents dans les PV

Module « Précédents » : à chaque question ou sujet CSE, retrouver si cela a déjà été traité dans les PV du CE/CSE
(2000-2024), classé **par pertinence** avec une **frise chronologique**.

## Principe

- Un **index texte privé** des PV (OCR français pour les scans) reste **hors dépôt**.
- Un **service local** (`service/server.py`, `127.0.0.1` uniquement) interroge cet index.
- Cette page affiche des **références** : date, PV, page, pertinence. **Jamais d'extrait de PV.**
- L'assistant (skill `precedents-pv`) utilise le même moteur pour lire un passage et le replacer dans son contexte.
- Le **Nexus local** (analyse d'ordre du jour CSE) interroge ce service pour afficher des extraits d'anciens PV :
  voir « Utilisation par le Nexus local » ci-dessous.

```
PV (hors dépôt)  --build_index.py-->  index privé  <--  service/precedents.py (moteur)
                                                         ^
                       page Nexus  --fetch (loopback)--> service/server.py
```

## Utilisation

1. Lancer le service : `service/lancer_nexus.cmd` (ouvre la page ; `service/arreter_nexus.cmd` pour l'arrêter).
2. Saisir des **groupes de formulations** (une ligne par groupe, variantes séparées par `|`).
   Le **premier groupe est le sujet** (obligatoire) ; les suivants précisent le contexte et renforcent le classement.
   Exemple :
   ```
   suivi des connaissances|test de connaissances|contrôle de connaissance|QCM
   installations|conducteurs|opérateurs
   ```
3. « Rechercher les précédents ». La frise est cliquable (filtre par année) ; tri par pertinence ou chronologique.

La page fonctionne depuis le service (`http://127.0.0.1:8791/`) **ou** ouverte via le serveur de prévisualisation
du site (`http://localhost:8796`, origine autorisée par défaut). Si le service est absent, un **mode manuel** (commande + import
d'un `.json`) reste disponible.

## Utilisation par le Nexus local (extraits)

`POST /api/passages` renvoie des **extraits** (700 caractères) pour une liste de points d'ordre du jour. Il est réservé au
serveur Nexus local : toute requête de navigateur (en-tête `Origin` ou `Sec-Fetch-*`) est refusée, et les en-têtes
`X-Nexus` et `X-Nexus-Server` sont exigés. Les pages du module, elles, ne reçoivent que des références.

Corps : `{"points": [{"id": "0", "concepts": ["connaissances", "installations"], "min_matches": 2}], "since": 2014}`.
Réponse : `{"ok": true, "points": {"0": [{"date", "precision_date", "fichier", "page", "notions", "extrait"}]}}`
(3 PV au plus par point, classés par notions couvertes et proximité des notions).

## Construire / mettre à jour l'index

```
python -I private/cfdt-nexus-precedents/service/build_index.py 6
python -I private/cfdt-nexus-precedents/service/precedents.py --rebuild --q "test"
```

Reprenable (un fichier déjà indexé est ignoré). Formats : PDF (natif + OCR), DOCX, PPTX, DOC. Les `.ppt` ne sont pas lus.
Prérequis : poppler, Tesseract (pack `fra`), python-docx, antiword.

## Configuration (variables d'environnement)

| Variable | Rôle | Défaut |
|---|---|---|
| `NEXUS_PV_SOURCE` | dossier des PV | `D:\pv cse\Réunions de CE` |
| `NEXUS_PV_INDEX` | index privé (hors dépôt) | `~/.claude/nexus-private/pv_index` |
| `NEXUS_PORT` | port du service | `8791` |
| `NEXUS_ALLOWED_ORIGINS` | autres origines autorisées à appeler l'API | `http://localhost:8796,http://127.0.0.1:8796` |

## Intégration à Nexus

- Le module est **suivi par git** (règle dans le `.gitignore` racine) ; l'index, ses caches et les `.txt` en sont exclus.
- Lien « Précédents » dans la navigation des modules **Dossiers** et **Bibliothèque** (modules non publiés).
- Le **cockpit n'est volontairement pas modifié** : il est publié sur le site public.
- Contrôles dans `run-nexus-tests.bat` : section « Module Precedents » (sécurité du module + tests du service).
- Le dossier `private/` est exclu du déploiement Hostinger : le module n'est jamais publié.
- Le service ne publie que les pages de ce module (pas le cockpit, pas les autres modules).

## Sécurité (cohérent avec `knowledge/SECURITY_POLICY.md`)

- Le dossier ne contient **que du code**. Son propre `.gitignore` interdit l'index, ses caches et les `.txt`.
- Le service n'écoute que sur `127.0.0.1`, ne renvoie aux navigateurs que des références (les extraits vont au seul serveur Nexus local), ne sert que les pages de ce module
  (liste blanche) et refuse hôtes falsifiés, origines non déclarées et appels sans en-tête `X-Nexus`. Aucun journal.
- Côté navigateur : `localStorage` (`cfdt-nexus-precedents-v1`), références uniquement ; tout champ non prévu
  (dont `extrait`) est supprimé à l'import.
- Les PV contiennent des données nominatives : un passage ne se lit que localement, avec l'assistant.

## Limites

- PV du CE/CSE uniquement : pas de PV de CHSCT/CSSCT.
- `.ppt` anciens non lus ; OCR imparfait sur les vieux scans ; dates déduites des noms de fichiers (précision indiquée).
- Une absence de résultat ne prouve pas qu'un sujet n'a jamais été traité.

## Tests

```
python -I -m unittest discover -s private/cfdt-nexus-precedents/service/tests -v
```

Corpus **fictif** uniquement (aucun vrai PV). Ces tests sont aussi exécutés par `run-nexus-tests.bat`.
