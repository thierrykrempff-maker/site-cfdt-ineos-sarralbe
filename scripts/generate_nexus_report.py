from __future__ import annotations

import datetime as dt
import json
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parents[1]
ROOT_RESOLVED = ROOT.resolve()
REPORTS_DIR = ROOT / "reports"

STATUS_OK = "OK"
STATUS_FIX = "A corriger"
STATUS_BLOCKING = "Bloquant"

SECTION_ROUTER = "Etat du routeur"
SECTION_INTERFACE = "Etat de l'interface locale"
SECTION_EXPERTS = "Etat des experts"
SECTION_SCENARIOS = "Resultats des scenarios de test"
SECTION_SECURITY = "Controles securite locale"


@dataclass
class CheckResult:
    section: str
    name: str
    status: str
    detail: str
    evidence: list[str] = field(default_factory=list)
    error: str = ""


class LocalReferenceParser(HTMLParser):
    attributes_by_tag = {
        "a": ("href",),
        "link": ("href",),
        "script": ("src",),
        "img": ("src",),
        "source": ("src",),
        "video": ("src",),
    }

    def __init__(self) -> None:
        super().__init__()
        self.references: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        wanted = self.attributes_by_tag.get(tag.lower(), ())
        if not wanted:
            return
        for key, value in attrs:
            if key.lower() in wanted and value:
                self.references.append(value)


def rel(path: Path) -> str:
    try:
        return str(path.resolve().relative_to(ROOT_RESOLVED)).replace("\\", "/")
    except ValueError:
        return str(path)


def read_text(relative_path: str) -> str:
    path = ROOT / relative_path
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.read_text(encoding="cp1252")


def add(
    results: list[CheckResult],
    section: str,
    name: str,
    status: str,
    detail: str,
    evidence: list[str] | None = None,
    error: str = "",
) -> None:
    results.append(CheckResult(section, name, status, detail, evidence or [], error))


def highest_status(results: list[CheckResult]) -> str:
    if any(item.status == STATUS_BLOCKING for item in results):
        return STATUS_BLOCKING
    if any(item.status == STATUS_FIX for item in results):
        return STATUS_FIX
    return STATUS_OK


def status_exit_code(status: str) -> int:
    if status == STATUS_OK:
        return 0
    if status == STATUS_FIX:
        return 1
    return 2


def exists_all(paths: list[str]) -> tuple[bool, list[str], list[str]]:
    present: list[str] = []
    missing: list[str] = []
    for item in paths:
        path = ROOT / item
        if path.is_file():
            present.append(item)
        else:
            missing.append(item)
    return not missing, present, missing


def check_router(results: list[CheckResult]) -> None:
    router_sources = {
        "docs/ARCHITECTURE_GLOBALE_V1.md": "Routeur Intelligent",
        "cockpit/README.md": "Routeur Intelligent",
        "cockpit/app.js": "Routeur Intelligent",
        "private/cfdt-nexus-bibliotheque/app.js": "Routeur intelligent",
    }
    missing = []
    for source, needle in router_sources.items():
        try:
            if needle not in read_text(source):
                missing.append(f"{source}: mention absente")
        except OSError as exc:
            missing.append(f"{source}: {exc}")

    module_json_path = ROOT / "private/cfdt-nexus-bibliotheque/module.json"
    intelligent_router = False
    try:
        module_data = json.loads(module_json_path.read_text(encoding="utf-8"))
        intelligent_router = bool(module_data.get("futureIntegrations", {}).get("intelligentRouter"))
    except (OSError, json.JSONDecodeError):
        intelligent_router = False

    if missing or not intelligent_router:
        evidence = missing[:]
        if not intelligent_router:
            evidence.append("module.json: futureIntegrations.intelligentRouter absent ou false")
        add(
            results,
            SECTION_ROUTER,
            "Contrat routeur V1",
            STATUS_FIX,
            "Le routeur est partiellement documente, mais tous les points d'ancrage ne sont pas declares.",
            evidence,
        )
    else:
        add(
            results,
            SECTION_ROUTER,
            "Contrat routeur V1",
            STATUS_OK,
            "Routeur documente comme integration future, avec ancrages cockpit et bibliotheque.",
            list(router_sources.keys()) + ["private/cfdt-nexus-bibliotheque/module.json"],
        )

    executable_candidates = [
        "router.py",
        "nexus-router.py",
        "automation/router.py",
        "scripts/router.py",
    ]
    existing = [item for item in executable_candidates if (ROOT / item).exists()]
    detail = (
        "Moteur routeur executable detecte : " + ", ".join(existing)
        if existing
        else "Aucun moteur routeur executable local detecte ; etat conforme au V1 prepare/futur."
    )
    add(results, SECTION_ROUTER, "Etat moteur routeur", STATUS_OK, detail)


def check_interface(results: list[CheckResult]) -> None:
    required = [
        "index.html",
        "styles.css",
        "cockpit/index.html",
        "cockpit/app.js",
        "cockpit/analysis-grids.js",
        "cockpit/settings.html",
        "cockpit/settings.js",
        "private/cfdt-nexus-bibliotheque/index.html",
        "private/cfdt-nexus-bibliotheque/app.js",
        "private/cfdt-nexus-bibliotheque/styles.css",
        "private/cfdt-nexus-bibliotheque/module.json",
        "private/cfdt-nexus-dossiers/index.html",
        "private/cfdt-nexus-dossiers/app.js",
        "private/cfdt-nexus-dossiers/styles.css",
    ]
    ok, present, missing = exists_all(required)
    add(
        results,
        SECTION_INTERFACE,
        "Fichiers interface Nexus",
        STATUS_OK if ok else STATUS_BLOCKING,
        "Tous les fichiers locaux attendus sont presents." if ok else "Des fichiers interface manquent.",
        present if ok else missing,
    )

    html_files = [
        ROOT / "index.html",
        ROOT / "mentions-legales.html",
        ROOT / "cockpit/index.html",
        ROOT / "cockpit/settings.html",
        ROOT / "private/cfdt-nexus-bibliotheque/index.html",
        ROOT / "private/cfdt-nexus-dossiers/index.html",
    ]
    missing_refs = find_missing_local_references(html_files)
    add(
        results,
        SECTION_INTERFACE,
        "Liens et assets locaux",
        STATUS_OK if not missing_refs else STATUS_BLOCKING,
        "References locales HTML resolues." if not missing_refs else "References locales introuvables dans l'interface.",
        ["Aucune reference manquante."] if not missing_refs else missing_refs[:30],
    )

    js_files = [
        ROOT / "cockpit/app.js",
        ROOT / "cockpit/analysis-grids.js",
        ROOT / "cockpit/settings.js",
        ROOT / "private/cfdt-nexus-bibliotheque/app.js",
        ROOT / "private/cfdt-nexus-dossiers/app.js",
    ]
    check_js_syntax(results, js_files)

    check_no_external_services(results, js_files)


def should_skip_reference(reference: str) -> bool:
    value = reference.strip()
    if not value or value.startswith("#"):
        return True
    parsed = urlparse(value)
    if parsed.scheme in {"http", "https", "mailto", "tel", "sms", "javascript", "data"}:
        return True
    return False


def normalize_reference(reference: str) -> str:
    value = reference.split("#", 1)[0].split("?", 1)[0].strip()
    return unquote(value)


def find_missing_local_references(html_files: list[Path]) -> list[str]:
    missing: list[str] = []
    for html_file in html_files:
        if not html_file.is_file():
            missing.append(f"{rel(html_file)}: fichier HTML absent")
            continue
        parser = LocalReferenceParser()
        parser.feed(html_file.read_text(encoding="utf-8", errors="replace"))
        for reference in parser.references:
            if should_skip_reference(reference):
                continue
            normalized = normalize_reference(reference)
            if not normalized:
                continue
            target = (html_file.parent / normalized).resolve()
            try:
                target.relative_to(ROOT_RESOLVED)
            except ValueError:
                missing.append(f"{rel(html_file)} -> {reference}: sort du dossier projet")
                continue
            if not target.exists():
                missing.append(f"{rel(html_file)} -> {reference}")
    return missing


def check_js_syntax(results: list[CheckResult], js_files: list[Path]) -> None:
    node = find_node()
    if not node:
        add(
            results,
            SECTION_INTERFACE,
            "Syntaxe JavaScript",
            STATUS_OK,
            "Controle avance ignore car Node n'est pas disponible ; les controles statiques Python restent executes.",
            ["Node absent du PATH."],
        )
        return

    failures: list[str] = []
    for js_file in js_files:
        completed = subprocess.run(
            [node, "--check", str(js_file)],
            cwd=ROOT,
            text=True,
            capture_output=True,
            encoding="utf-8",
            errors="replace",
        )
        if completed.returncode != 0:
            failures.append(f"{rel(js_file)}: {completed.stderr.strip() or completed.stdout.strip()}")

    add(
        results,
        SECTION_INTERFACE,
        "Syntaxe JavaScript",
        STATUS_OK if not failures else STATUS_BLOCKING,
        "Controle node --check reussi." if not failures else "Erreur de syntaxe JavaScript detectee.",
        [rel(item) for item in js_files] if not failures else failures,
    )


def find_node() -> str | None:
    node = shutil.which("node")
    if node:
        return node
    bundled = Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe"
    if bundled.is_file():
        return str(bundled)
    return None


def check_no_external_services(results: list[CheckResult], files: list[Path]) -> None:
    patterns = {
        "fetch(": "appel fetch",
        "XMLHttpRequest": "appel XMLHttpRequest",
        "https://": "URL https",
        "http://": "URL http",
    }
    findings: list[str] = []
    for file_path in files:
        content = file_path.read_text(encoding="utf-8", errors="replace")
        for pattern, label in patterns.items():
            if pattern in content:
                findings.append(f"{rel(file_path)}: {label}")
    add(
        results,
        SECTION_INTERFACE,
        "Services externes",
        STATUS_OK if not findings else STATUS_FIX,
        "Aucun appel reseau externe detecte dans les modules Nexus locaux."
        if not findings
        else "Des references reseau doivent etre verifiees.",
        ["Modules JS Nexus locaux controles."] if not findings else findings,
    )


def check_experts(results: list[CheckResult]) -> None:
    agents_root = ROOT / "agents"
    expert_files = sorted(agents_root.glob("*/*.md"))
    if not expert_files:
        add(results, SECTION_EXPERTS, "Experts locaux", STATUS_BLOCKING, "Aucun expert Markdown detecte.")
        return

    invalid: list[str] = []
    for expert in expert_files:
        content = expert.read_text(encoding="utf-8", errors="replace")
        has_title = bool(re.search(r"^#\s+.+", content, re.MULTILINE))
        has_mission = "## Mission" in content
        has_guardrails = bool(re.search(r"Ne jamais|Regles|R.gles|Checklist|prudence", content, re.IGNORECASE))
        if not (has_title and has_mission and has_guardrails):
            invalid.append(rel(expert))

    add(
        results,
        SECTION_EXPERTS,
        "Fiches experts",
        STATUS_OK if not invalid else STATUS_FIX,
        "Experts Markdown presents avec mission et garde-fous." if not invalid else "Certaines fiches experts sont incompletes.",
        [rel(item) for item in expert_files] if not invalid else invalid,
    )

    try:
        module_data = json.loads((ROOT / "private/cfdt-nexus-bibliotheque/module.json").read_text(encoding="utf-8"))
        allowed = set(module_data.get("allowedAgents", []))
    except (OSError, json.JSONDecodeError):
        allowed = set()
    expected = {"conseiller-salarie", "redacteur-cfdt"}
    missing_allowed = sorted(expected - allowed)
    add(
        results,
        SECTION_EXPERTS,
        "Experts declares dans la bibliotheque",
        STATUS_OK if not missing_allowed else STATUS_FIX,
        "Experts locaux declares dans allowedAgents." if not missing_allowed else "Des experts locaux ne sont pas declares.",
        sorted(allowed) if not missing_allowed else missing_allowed,
    )


def check_scenarios(results: list[CheckResult]) -> None:
    cockpit_app = read_text("cockpit/app.js")
    analysis_grid = read_text("cockpit/analysis-grids.js")
    dossiers_app = read_text("private/cfdt-nexus-dossiers/app.js")
    library_app = read_text("private/cfdt-nexus-bibliotheque/app.js")

    expected_profiles = [
        "summary",
        "agreement",
        "cse",
        "defender",
        "cssct",
        "pay",
        "communication",
        "blindspots",
    ]
    missing_profiles = [profile for profile in expected_profiles if f'id: "{profile}"' not in cockpit_app]
    add(
        results,
        SECTION_SCENARIOS,
        "Profils DIC",
        STATUS_OK if not missing_profiles else STATUS_FIX,
        "Les profils d'analyse DIC attendus sont disponibles." if not missing_profiles else "Profils DIC manquants.",
        expected_profiles if not missing_profiles else missing_profiles,
    )

    step_count = len(re.findall(r"\n\s*number:\s*\d+", analysis_grid))
    grid_checks = [
        'defaultGridId: "enterprise-agreement-cse-cssct-v1"' in analysis_grid,
        step_count >= 8,
        "questionOutputs" in analysis_grid,
        "finalSynthesis" in analysis_grid,
        "demoScenario" in analysis_grid,
        "sans document INEOS reel" in analysis_grid,
        "sans donnee personnelle" in analysis_grid,
    ]
    add(
        results,
        SECTION_SCENARIOS,
        "Scenario DIC projet d'accord",
        STATUS_OK if all(grid_checks) else STATUS_BLOCKING,
        "Scenario fictif DIC complet : grille, 8 etapes, questions, synthese et donnees non confidentielles."
        if all(grid_checks)
        else "Le scenario DIC projet d'accord est incomplet.",
        [f"Etapes detectees: {step_count}"],
    )

    question_count = analysis_grid.count("sourceHint")
    add(
        results,
        SECTION_SCENARIOS,
        "Questions CSE/CSSCT",
        STATUS_OK if question_count >= 12 else STATUS_FIX,
        "Questions CSE/CSSCT generees dans la grille de scenario." if question_count >= 12 else "Questions CSE/CSSCT insuffisantes.",
        [f"Questions avec sourceHint detectees: {question_count}"],
    )

    expected_templates = [
        "sanction",
        "convocation",
        "pay",
        "schedule",
        "leave",
        "health",
        "harassment",
        "discrimination",
        "rupture",
        "mutual",
    ]
    missing_templates = [template for template in expected_templates if re.search(rf"^\s{{2}}{template}:\s*{{", dossiers_app, re.MULTILINE) is None]
    add(
        results,
        SECTION_SCENARIOS,
        "Scenarios dossiers d'accompagnement",
        STATUS_OK if not missing_templates else STATUS_FIX,
        "Templates de dossiers disponibles pour les principaux cas salaries." if not missing_templates else "Templates de dossiers manquants.",
        expected_templates if not missing_templates else missing_templates,
    )

    library_checks = [
        "const CATEGORIES" in library_app,
        "const CONFIDENTIALITY" in library_app,
        "const FUTURE_CONNECTORS" in library_app,
        "localStorage" in library_app,
        "exportLibrary" in library_app,
    ]
    add(
        results,
        SECTION_SCENARIOS,
        "Scenario bibliotheque locale",
        STATUS_OK if all(library_checks) else STATUS_FIX,
        "Bibliotheque locale controlee : categories, confidentialite, connecteurs futurs et export."
        if all(library_checks)
        else "La bibliotheque locale ne couvre pas tous les controles attendus.",
        ["Categories", "Confidentialite", "Connecteurs futurs", "localStorage", "Export JSON"],
    )


def check_security(results: list[CheckResult]) -> None:
    security_files = [
        "knowledge/SECURITY_POLICY.md",
        "confidential/README.md",
        ".gitignore",
    ]
    ok, present, missing = exists_all(security_files)
    add(
        results,
        SECTION_SECURITY,
        "Rappels securite documentaire",
        STATUS_OK if ok else STATUS_BLOCKING,
        "Fichiers de securite documentaire presents." if ok else "Fichiers de securite manquants.",
        present if ok else missing,
    )

    confidential_files = [
        item for item in (ROOT / "confidential").glob("*")
        if item.name != "README.md"
    ]
    add(
        results,
        SECTION_SECURITY,
        "Dossier confidential",
        STATUS_OK if not confidential_files else STATUS_BLOCKING,
        "Aucun document confidentiel stocke dans le depot." if not confidential_files else "Documents presents dans confidential/.",
        ["confidential/ ne contient que README.md"] if not confidential_files else [rel(item) for item in confidential_files],
    )


def escape_table(value: str) -> str:
    return value.replace("|", "\\|").replace("\n", " ")


def result_table(results: list[CheckResult]) -> str:
    lines = [
        "| Domaine | Controle | Etat | Detail |",
        "| --- | --- | --- | --- |",
    ]
    for item in results:
        lines.append(
            f"| {escape_table(item.section)} | {escape_table(item.name)} | {item.status} | {escape_table(item.detail)} |"
        )
    return "\n".join(lines)


def render_section(section: str, results: list[CheckResult]) -> str:
    lines = [f"## {section}", ""]
    for item in [result for result in results if result.section == section]:
        lines.append(f"### {item.name}")
        lines.append(f"- Etat : {item.status}")
        lines.append(f"- Detail : {item.detail}")
        if item.evidence:
            lines.append("- Elements controles :")
            for evidence in item.evidence:
                lines.append(f"  - {evidence}")
        if item.error:
            lines.append(f"- Erreur : {item.error}")
        lines.append("")
    return "\n".join(lines).rstrip()


def render_errors(results: list[CheckResult]) -> str:
    problems = [item for item in results if item.status != STATUS_OK or item.error]
    lines = ["## Erreurs eventuelles", ""]
    if not problems:
        lines.append("Aucune erreur bloquante ou correction obligatoire detectee.")
        return "\n".join(lines)
    for item in problems:
        lines.append(f"- {item.status} - {item.section} / {item.name} : {item.detail}")
        if item.error:
            lines.append(f"  Erreur : {item.error}")
    return "\n".join(lines)


def render_tests_executed(results: list[CheckResult]) -> str:
    lines = ["## Tests executes", ""]
    for index, item in enumerate(results, start=1):
        lines.append(f"{index}. {item.section} - {item.name} : {item.status}")
    return "\n".join(lines)


def write_report(results: list[CheckResult]) -> Path:
    REPORTS_DIR.mkdir(exist_ok=True)
    now = dt.datetime.now().astimezone()
    timestamp = now.strftime("%Y%m%d-%H%M%S")
    report_path = REPORTS_DIR / f"nexus-test-report-{timestamp}.md"
    overall = highest_status(results)

    sections = [
        "# Rapport tests CFDT Nexus",
        "",
        f"- Date : {now.strftime('%Y-%m-%d %H:%M:%S %z')}",
        f"- Depot : {ROOT}",
        f"- Synthese globale : {overall}",
        "",
        "## Synthese claire",
        "",
        result_table(results),
        "",
    ]
    for section in [
        SECTION_ROUTER,
        SECTION_INTERFACE,
        SECTION_EXPERTS,
        SECTION_SCENARIOS,
        SECTION_SECURITY,
    ]:
        sections.extend([render_section(section, results), ""])
    sections.extend([render_errors(results), "", render_tests_executed(results), ""])

    report_path.write_text("\n".join(sections), encoding="utf-8")
    (REPORTS_DIR / "latest-nexus-test-report.txt").write_text(str(report_path), encoding="utf-8")
    return report_path


def main() -> int:
    results: list[CheckResult] = []
    checks = [
        check_router,
        check_interface,
        check_experts,
        check_scenarios,
        check_security,
    ]
    for check in checks:
        try:
            check(results)
        except Exception as exc:  # noqa: BLE001 - report generation must survive individual check failures.
            add(
                results,
                "Execution du rapport",
                check.__name__,
                STATUS_BLOCKING,
                "Le controle n'a pas pu etre execute.",
                error=repr(exc),
            )

    report_path = write_report(results)
    overall = highest_status(results)
    print(f"Rapport Nexus genere : {report_path}")
    print(f"Synthese globale : {overall}")
    return status_exit_code(overall)


if __name__ == "__main__":
    sys.exit(main())
