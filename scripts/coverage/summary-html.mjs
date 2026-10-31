const escape = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

export function renderSummaryHtml(summary) {
  const latest = summary.runs.at(-1);
  const rows = summary.runs
    .map((run) => {
      const {
        passed = 0,
        failed = 0,
        flaky = 0,
        skipped = 0,
        ...other
      } = run.counts;
      const changes = run.changes
        ? Object.keys(run.changes)
            .filter((key) => run.changes[key])
            .join(', ') || 'None'
        : 'First run';
      const projects = [
        ...new Set(run.scope.map((item) => item.split('@')[1])),
      ];
      const scopeItems = run.scope
        .map((item) => {
          const labels = (run.caseOutcomes?.[item] || [])
            .map((status) => {
              const label =
                { failed: 'fail', skipped: 'skip' }[status] || status;
              return ` <span class="status ${status === 'failed' ? 'fail' : ''}">-${escape(label)}</span>`;
            })
            .join('');
          return `<li><code>${escape(item)}</code>${labels}</li>`;
        })
        .join('');
      return `<tr>
      <th scope="row"><time>${escape(run.date)}</time><details><summary>Run ID</summary><code>${escape(run.runId)}</code></details></th>
      <td><details><summary><code>${escape(run.source.slice(0, 10))}</code></summary><code>${escape(run.source)}</code></details></td>
      <td><details><summary>${escape(projects.join(', ') || 'No observations')} · ${run.scope.length} cases</summary><ul>${scopeItems}</ul></details></td>
      <td class="number pass">${passed}</td><td class="number ${failed ? 'fail' : ''}">${failed}</td>
      <td class="number">${flaky}</td><td class="number">${skipped}</td>
      <td class="number"><details><summary>${Object.values(other).reduce((sum, count) => sum + count, 0)}</summary>${
        Object.entries(other)
          .map(
            ([status, count]) =>
              `<div>${escape(status)}: ${escape(count)}</div>`,
          )
          .join('') || 'None'
      }</details></td>
      <td class="number">${run.durationMs === null ? 'Unknown' : (run.durationMs / 1000).toFixed(2)}</td>
      <td class="number ${run.globalErrors ? 'fail' : ''}">${run.globalErrors}</td><td>${escape(changes)}</td>
    </tr>`;
    })
    .join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rolnopol · Test run history</title>
<style>
  :root { color-scheme: light; font-family: system-ui, sans-serif; color: #172b3a; background: #f3f6f8; }
  * { box-sizing: border-box; }
  body { margin: 0; }
  main { max-width: 1600px; margin: auto; padding: 40px 24px; }
  header { display: flex; justify-content: space-between; align-items: start; gap: 24px; }
  .eyebrow { color: #527265; font-size: .8rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
  h1 { font-size: clamp(1.8rem, 4vw, 2.8rem); letter-spacing: -.04em; margin: 8px 0; }
  p { line-height: 1.6; color: #526474; }
  a { color: #17634d; text-underline-offset: 3px; }
  .download { white-space: nowrap; border: 1px solid #b7cdc4; border-radius: 8px; padding: 10px 16px; margin-top: 14px; }
  .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 24px 0; }
  .card { background: white; border: 1px solid #dce4e9; padding: 20px; border-radius: 12px; }
  .card span { display: block; color: #526474; font-size: .85rem; }
  .card strong { display: block; margin-top: 6px; font-size: 2rem; font-variant-numeric: tabular-nums; }
  .panel { background: white; border: 1px solid #dce4e9; border-radius: 12px; overflow: hidden; }
  .scroll { overflow-x: auto; }
  table { border-collapse: collapse; width: 100%; min-width: 1100px; font-size: .85rem; }
  caption { text-align: left; padding: 20px; font-weight: 700; font-size: 1rem; }
  th, td { padding: 14px 12px; border-top: 1px solid #e4eaee; vertical-align: top; text-align: left; }
  thead th { background: #eef3f5; font-weight: 600; white-space: nowrap; }
  tbody th { font-weight: 500; min-width: 205px; }
  tbody td:nth-child(2) { min-width: 125px; }
  tbody td:nth-child(3) { min-width: 260px; }
  tbody tr:hover { background: #f8fbfa; }
  .number { text-align: right; font-variant-numeric: tabular-nums; }
  .pass { color: #17634d; } .fail { color: #a62b32; font-weight: 700; }
  summary { cursor: pointer; } summary:focus-visible, a:focus-visible { outline: 3px solid #307cba; outline-offset: 4px; }
  details[open] summary { margin-bottom: 8px; }
  code { font-size: .8rem; overflow-wrap: anywhere; }
  ul { padding-left: 18px; max-height: 260px; overflow-y: auto; min-width: 230px; }
  li { margin: 6px 0; }
  .status { display: inline-block; font-size: .8rem; font-weight: 600; background: #eef3f5; border-radius: 4px; padding: 1px 4px; }
  .notes { font-size: .85rem; margin-top: 20px; }
  .empty { padding: 24px; }
  @media (max-width: 650px) { main { padding: 24px 12px; } header { flex-direction: column; gap: 0; } .cards { grid-template-columns: repeat(2, 1fr); } }
  @page { size: landscape; margin: 12mm; }
  @media print { :root { background: white; } main { max-width: none; padding: 0; } .download { display: none; } .scroll { overflow: visible; } table { min-width: 0; font-size: 8pt; } th, td { padding: 6px; } tr { break-inside: avoid; } .cards { gap: 8px; } .card { padding: 10px; } }
</style>
</head>
<body><main>
<header><div><div class="eyebrow">Rolnopol / Learning workspace</div><h1>Test run history</h1><p>Archived executions in chronological order. Expand a source or scope for details.</p><a href="../../coverage-report/index.html">Latest scenario coverage</a></div><a class="download" href="summary.json" download>Download JSON</a></header>
<section class="cards" aria-label="History and latest run">
<div class="card"><span>Archived runs</span><strong>${summary.runs.length}</strong></div>
<div class="card"><span>Latest run · passed observations</span><strong class="pass">${latest ? latest.counts.passed || 0 : '—'}</strong></div>
<div class="card"><span>Latest run · failed observations</span><strong class="${latest?.counts.failed ? 'fail' : ''}">${latest ? latest.counts.failed || 0 : '—'}</strong></div>
<div class="card"><span>Latest run · global errors</span><strong class="${latest?.globalErrors ? 'fail' : ''}">${latest ? latest.globalErrors : '—'}</strong></div>
</section>
<div class="panel">${summary.runs.length ? `<div class="scroll" tabindex="0" role="region" aria-label="Archived run results"><table><caption>All archived runs · dates in UTC</caption><thead><tr><th scope="col">Date</th><th scope="col">Test source</th><th scope="col">Observed scope</th><th scope="col">Pass</th><th scope="col">Fail</th><th scope="col">Flaky</th><th scope="col">Skip</th><th scope="col">Other</th><th scope="col">Run (s)</th><th scope="col">Errors</th><th scope="col">Changed</th></tr></thead><tbody>${rows}</tbody></table></div>` : '<p class="empty">No archived runs. Run <code>npm run coverage:archive</code> after <code>npm run coverage:run</code>, then regenerate this summary.</p>'}</div>
<div class="notes"><p>Counts include repetitions. Scope counts unique case/project pairs. Health cases are included; setup and excluded cases are omitted. Other outcomes expand to their original categories. Run duration is wall-clock time, including setup.</p><p>Changed compares observed scope and test source with the previous row. Historical outcomes do not establish current coverage, a regression cause, or test stability. Application version is omitted.</p><p>Refresh with <code>npm run coverage:summary</code>. Source data: <a href="summary.json">summary.json</a> · <a href="history.md">Detailed history</a>.</p></div>
</main></body></html>`;
}
