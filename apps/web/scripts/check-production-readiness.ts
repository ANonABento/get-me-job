#!/usr/bin/env tsx

import { getProductionReadinessReport } from "@/lib/production-readiness";

const report = getProductionReadinessReport();
const errors = report.findings.filter((finding) => finding.level === "error");
const warnings = report.findings.filter(
  (finding) => finding.level === "warning",
);

if (report.findings.length === 0) {
  console.log("[production-readiness] ok");
  process.exit(0);
}

for (const finding of errors) {
  console.error(
    `[production-readiness] error ${finding.key}: ${finding.message}`,
  );
}

for (const finding of warnings) {
  console.warn(
    `[production-readiness] warning ${finding.key}: ${finding.message}`,
  );
}

process.exit(report.ok ? 0 : 1);
