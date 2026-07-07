"use strict";

const fs = require("fs");
const path = require("path");

const engine = require("../cockpit/salary-analysis-report.js");

const REQUIRED_EXPECTATIONS = {
  classification: {
    domains: ["Classification"],
    experts: ["Juriste"],
    confidence: "Moyen",
  },
  "pay-night-sunday": {
    domains: ["Paie", "Heures de nuit", "Travail du dimanche"],
    experts: ["Paie", "Juriste"],
    confidence: "Moyen",
  },
  "on-call-rest-pay": {
    domains: ["Astreinte", "Repos", "Paie"],
    experts: ["Juriste", "Paie"],
    confidence: "Moyen",
  },
  "incomplete-bonus": {
    domains: ["Paie", "Informations manquantes"],
    experts: ["Paie"],
    confidence: "Faible",
  },
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function includesAll(values, expected) {
  return expected.every((item) => values.includes(item));
}

function assertScenario(scenario) {
  const analysis = engine.analyzeSalaryQuestion(scenario.question);
  const report = engine.renderMarkdownReport(scenario.question);
  const normalAnswer = engine.renderNormalAnswer(scenario.question);
  const expectations = REQUIRED_EXPECTATIONS[scenario.id];

  assert(analysis.question === scenario.question, `${scenario.id}: question non conservee`);
  assert(normalAnswer.includes("## Réponse courte"), `${scenario.id}: reponse normale incomplete`);
  assert(report.includes(`# ${analysis.title}`), `${scenario.id}: titre de rapport absent`);
  assert(!report.includes("undefined"), `${scenario.id}: valeur undefined dans le rapport`);
  assert(!report.includes("NaN"), `${scenario.id}: valeur NaN dans le rapport`);

  engine.reportSectionLabels.forEach((label) => {
    assert(report.includes(`## ${label}`), `${scenario.id}: rubrique manquante ${label}`);
  });

  assert(includesAll(analysis.domains, expectations.domains), `${scenario.id}: domaines inattendus`);
  assert(includesAll(analysis.experts, expectations.experts), `${scenario.id}: experts inattendus`);
  assert(analysis.confidence.startsWith(expectations.confidence), `${scenario.id}: niveau de confiance inattendu`);
  assert(analysis.checks.length >= 3, `${scenario.id}: points a verifier insuffisants`);
  assert(analysis.documents.length >= 3, `${scenario.id}: pieces a demander insuffisantes`);
  assert(analysis.sources.length >= 3, `${scenario.id}: sources insuffisantes`);

  return { analysis, report, normalAnswer };
}

function writeExamples(results) {
  const reportsDir = path.join(__dirname, "..", "reports");
  const outputPath = path.join(reportsDir, "salary-analysis-examples-v2.2.md");
  fs.mkdirSync(reportsDir, { recursive: true });

  const chunks = [
    "# Exemples rapports analyse salarié Nexus V2.2",
    "",
    `- Version moteur : ${engine.version}`,
    `- Cas testés : ${results.length}`,
    "",
  ];

  results.forEach(({ scenario, output }) => {
    chunks.push(`## Cas ${scenario.label}`);
    chunks.push("");
    chunks.push("### Question");
    chunks.push("");
    chunks.push(scenario.question);
    chunks.push("");
    chunks.push("### Réponse normale");
    chunks.push("");
    chunks.push(output.normalAnswer);
    chunks.push("");
    chunks.push("### Rapport d'analyse");
    chunks.push("");
    chunks.push(output.report);
    chunks.push("");
  });

  fs.writeFileSync(outputPath, `${chunks.join("\n")}\n`, "utf8");
  return outputPath;
}

function main() {
  assert(engine.version === "2.2", "version moteur inattendue");
  assert(engine.priorityScenarios.length === 4, "les 4 scenarios prioritaires doivent etre declares");

  const results = engine.priorityScenarios.map((scenario) => {
    const output = assertScenario(scenario);
    console.log(`OK ${scenario.id} - ${scenario.label}`);
    return { scenario, output };
  });

  if (process.argv.includes("--write-examples")) {
    const outputPath = writeExamples(results);
    console.log(`Exemples generes : ${outputPath}`);
  }
}

main();
