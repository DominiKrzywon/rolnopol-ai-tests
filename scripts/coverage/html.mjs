import { tableCells } from './model.mjs';
import { playwrightTestLink } from './playwright-links.mjs';

export function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[char],
  );
}

function safeLink(href, document) {
  if (/^https?:\/\//i.test(href)) return href;
  if (/^#[\w-]+$/.test(href)) return `#${document}-${href.slice(1)}`;
  const match =
    /^(?:\.\/)?(README|TEST_PLAN|CODING_STANDARDS)\.md(?:#([\w-]+))?$/.exec(
      href,
    );
  if (match)
    return `#${match[1].toLowerCase()}${match[2] ? '-' + match[2] : ''}`;
  return null;
}

function inline(text, document) {
  const pattern = /`([^`]+)`|\[([^\]]+)\]\(([^\s)]+)\)|\*\*([^*]+)\*\*/g;
  let html = '';
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    html += escapeHtml(text.slice(cursor, match.index));
    if (match[1] !== undefined) html += `<code>${escapeHtml(match[1])}</code>`;
    else if (match[2] !== undefined) {
      const href = safeLink(match[3], document);
      html += href
        ? `<a href="${escapeHtml(href)}" rel="noopener noreferrer">${escapeHtml(match[2])}</a>`
        : escapeHtml(match[2]);
    } else html += `<strong>${escapeHtml(match[4])}</strong>`;
    cursor = match.index + match[0].length;
  }
  return html + escapeHtml(text.slice(cursor));
}

// Deliberately limited Markdown: raw HTML and unsupported constructs remain text.
export function renderMarkdown(
  markdown,
  document,
  { collapsible = false } = {},
) {
  const lines = markdown
    .replace(/<!-- coverage-[\s\S]*?-->/g, '')
    .split(/\r?\n/);
  const result = [];
  const headingIds = new Map();
  const sections = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    if (/^\s*```/.test(line)) {
      const code = [];
      while (++i < lines.length && !/^\s*```/.test(lines[i]))
        code.push(lines[i]);
      result.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
    } else if (/^#{1,6} /.test(line)) {
      const [, hashes, title] = /^(#{1,6}) (.*)$/.exec(line);
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      const count = headingIds.get(slug) || 0;
      headingIds.set(slug, count + 1);
      if (collapsible) {
        while (sections.length && sections.at(-1) >= hashes.length) {
          result.push('</details>');
          sections.pop();
        }
        if (hashes.length > 1) {
          result.push(
            `<details class="document-section" id="${document}-${slug}${count ? '-' + count : ''}"><summary>${inline(title, document)}</summary>`,
          );
          sections.push(hashes.length);
          continue;
        }
      }
      result.push(
        `<h${hashes.length} id="${document}-${slug}${count ? '-' + count : ''}">${inline(title, document)}</h${hashes.length}>`,
      );
    } else if (
      line.trim().startsWith('|') &&
      /^\s*\|?[\s:|-]+\|\s*$/.test(lines[i + 1] || '')
    ) {
      const headers = tableCells(line);
      const rows = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(
          '<tr>' +
            tableCells(lines[i])
              .map((cell) => `<td>${inline(cell, document)}</td>`)
              .join('') +
            '</tr>',
        );
        i++;
      }
      i--;
      result.push(
        `<div class="table-scroll"><table><thead><tr>${headers.map((cell) => `<th>${inline(cell, document)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`,
      );
    } else if (/^\s*(?:[-*]|\d+\.) /.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items = [];
      while (i < lines.length && /^\s*(?:[-*]|\d+\.) /.test(lines[i])) {
        let item = lines[i].replace(/^\s*(?:[-*]|\d+\.) /, '');
        while (
          i + 1 < lines.length &&
          /^\s{2,}\S/.test(lines[i + 1]) &&
          !/^\s*(?:[-*]|\d+\.) /.test(lines[i + 1])
        )
          item += ' ' + lines[++i].trim();
        items.push(`<li>${inline(item, document)}</li>`);
        i++;
      }
      i--;
      const tag = ordered ? 'ol' : 'ul';
      result.push(`<${tag}>${items.join('')}</${tag}>`);
    } else if (/^>/.test(line)) {
      result.push(
        `<blockquote>${inline(line.replace(/^>\s?/, ''), document)}</blockquote>`,
      );
    } else {
      let paragraph = line;
      while (
        i + 1 < lines.length &&
        lines[i + 1].trim() &&
        !/^(?:#|>|\s*```|\s*\||\s*[-*] |\s*\d+\. )/.test(lines[i + 1])
      )
        paragraph += ' ' + lines[++i];
      result.push(`<p>${inline(paragraph, document)}</p>`);
    }
  }
  return result.join('\n') + '</details>'.repeat(sections.length);
}

function renderDocument(markdown, document) {
  const content =
    document === 'readme'
      ? markdown.replace(
          /<!-- coverage-index:start -->[\s\S]*?<!-- coverage-index:end -->/,
          'Browse the searchable Scenarios section above for the generated index.',
        )
      : markdown;
  return renderMarkdown(content, document, { collapsible: true });
}

function duration(value) {
  return Number.isFinite(value)
    ? `${(value / 1000).toFixed(1)}s`
    : escapeHtml(value ?? 'Unknown');
}

function failureDetails(failure) {
  if (!failure) return '';
  const field = (label, value) =>
    `<div><dt>${label}</dt><dd>${escapeHtml(value ?? 'Not available for safe display')}</dd></div>`;
  return `<h4>Failure details</h4><p>${escapeHtml(failure.message)}</p><dl class="failure-fields">${field('Step', failure.step)}${field('Expected', failure.expected)}${field('Received', failure.actual)}${field('Location', failure.file && failure.line ? `${failure.file}:${failure.line}` : null)}</dl>${failure.errorCount > 1 ? `<small>${failure.errorCount} errors recorded; this summary describes the first error.</small>` : ''}`;
}

function executionDetails(item) {
  const runs = item.execution.runs
    .map((run, index) => {
      const link = playwrightTestLink(run.playwrightTestId);
      return `<div class="execution-run"><h4>${escapeHtml(run.project)} · Execution ${index + 1} · ${escapeHtml(run.status)}</h4><p>Duration: ${duration(run.durationMs)} (all attempts)</p>${run.attempts.map((attempt) => `<div class="attempt"><p>Retry ${escapeHtml(attempt.retry ?? 0)} · ${escapeHtml(attempt.status)} · Duration: ${duration(attempt.durationMs)}</p>${failureDetails(attempt.failure)}</div>`).join('')}${link ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">Open in Playwright report</a>` : '<small>Direct test link unavailable: no matching Playwright HTML test was verified.</small>'}</div>`;
    })
    .join('');
  return `<p>Layer: ${escapeHtml(item.scenario.layer)} · Total duration: ${duration(item.execution.durationMs)}</p>${item.notes && item.notes !== '-' ? `<p>${escapeHtml(item.notes)}</p>` : ''}<p>Implementation: ${item.tests.map((test) => `${escapeHtml(test.project)} — ${escapeHtml('tests/' + test.file)}:${escapeHtml(test.line)}`).join('<br>') || 'No collected test'}</p>${runs || '<p>No execution recorded.</p>'}`;
}

function freshnessExplanation(report) {
  if (!report.run)
    return 'No test results were supplied. This report shows collected scenarios only. Run npm run coverage:run to collect execution evidence.';
  if (report.freshness === 'unknown')
    return 'Saved results do not contain the information needed to confirm that they match the current code. Confirmed is N/A, not zero passed tests. Run npm run coverage:run to record results with source information; rebuilding this report alone cannot provide it.';
  if (report.freshness === 'stale')
    return 'Saved results belong to a different version of the code or report inputs. They remain available for inspection, but cannot confirm the current version. Run npm run coverage:run again; rebuilding the report alone does not rerun tests.';
  if (report.run.globalErrorCount)
    return 'The results match the current code, but the run recorded global errors. Confirmation is unavailable. Inspect the Playwright report, resolve the run errors, then run npm run coverage:run again.';
  return 'The saved results match the current code and report inputs. Confirmed counts only included scenarios passing in every required project; unselected or blocked scenarios remain unconfirmed.';
}

export function renderReport(report, readme, plan, standards = '') {
  const { metrics } = report;
  const percentText = (percent) =>
    percent === null ? 'N/A' : `${Number(percent.toFixed(1))}%`;
  const summaryMetric = (label, count, percent) =>
    count === null
      ? `<p class="summary-metric"><strong>${label}: N/A</strong><small>No current evidence</small></p>`
      : `<p class="summary-metric"><strong>${label}: ${percentText(percent)}</strong><small>${count} / ${metrics.denominator} included scenarios${percent === null ? ' (no denominator)' : ''}</small></p>`;
  const selectedMetric =
    metrics.selected === null
      ? `<p class="summary-metric"><strong>Selected to run: N/A</strong><small>No test run supplied</small></p>`
      : `<p class="summary-metric"><strong>Selected to run: ${metrics.selected}</strong><small>${metrics.selected} / ${metrics.denominator} included scenarios listed in this run</small></p>`;
  const renderBars = (groups) =>
    groups
      .map(
        ({
          label,
          implemented,
          confirmed,
          denominator,
          implementedPercent,
          confirmedPercent,
        }) =>
          `<div class="coverage-group"><div class="coverage-label"><strong>${escapeHtml(label)}</strong><span>${percentText(implementedPercent)}</span></div><div class="coverage-track" role="meter" aria-label="${escapeHtml(label)} implemented coverage" aria-valuemin="0" aria-valuemax="100" ${implementedPercent === null ? '' : `aria-valuenow="${implementedPercent.toFixed(1)}"`} aria-valuetext="${implementedPercent === null ? 'No included scenarios' : `${implemented} of ${denominator} included scenarios implemented`}"><span class="coverage-fill" style="width:${implementedPercent ?? 0}%"></span></div><small>Implemented: ${implemented} / ${denominator} &middot; Confirmed: ${confirmed === null ? 'N/A (no current evidence)' : `${confirmed} / ${denominator} (${percentText(confirmedPercent)})`}</small></div>`,
      )
      .join('');
  const priorityBars = renderBars(report.breakdowns.priority);
  const riskBars = renderBars(report.breakdowns.risk);
  const areaBars = renderBars(report.breakdowns.area);
  const choices = (key) =>
    (key === 'risk'
      ? report.breakdowns.risk.map((group) => group.label)
      : [
          ...new Set(
            report.cases.map((item) =>
              key === 'status' ? item.execution.status : item.scenario[key],
            ),
          ),
        ].sort()
    )
      .map((value) => `<option>${escapeHtml(value)}</option>`)
      .join('');
  const rows = report.cases
    .map((item) => {
      const status = item.execution.status;
      const failure = item.execution.runs.find((run) => run.failure)?.failure;
      const toggle = (label, className = '') =>
        `<button type="button" class="detail-toggle ${className}" aria-expanded="false" aria-controls="details-${item.id}">${label}</button>`;
      const statusLabel = `${status === 'failed' ? '❌ ' : ''}${escapeHtml(status.toUpperCase())}`;
      return `<tr id="case-${item.id}" data-case-row data-area="${escapeHtml(item.scenario.area)}" data-priority="${item.scenario.priority}" data-risk="${escapeHtml(item.scenario.risk)}" data-status="${status}">
<td><strong>${item.id}</strong></td><td>${escapeHtml(item.scenario.area)}</td><td>${escapeHtml(item.scenario.title)}</td><td>${item.scenario.priority}</td><td>${escapeHtml(item.scenario.risk)}</td><td>${failure ? toggle(statusLabel, `status ${status}`) : `<span class="status ${status}">${statusLabel}</span>`}</td><td class="failure-brief">${failure ? escapeHtml(failure.message) : '—'}</td><td>${toggle('Details')}</td></tr>
<tr id="details-${item.id}" class="case-details" hidden><td colspan="8">${executionDetails(item)}</td></tr>`;
    })
    .join('\n');
  const failedCases = report.cases.filter((item) =>
    ['failed', 'interrupted'].includes(item.execution.status),
  );
  const failureSummary = `<section class="failure-summary" aria-labelledby="failure-summary-title"><h2 id="failure-summary-title">${report.freshness === 'current' ? 'Current failure summary' : 'Failure summary — saved run'}</h2><p>${report.freshness === 'current' ? '' : `Result freshness: ${escapeHtml(report.freshness)}. `}${report.run ? `${failedCases.length} failed or interrupted scenarios in the selected run.` : 'No test run supplied.'}</p>${failedCases.length ? `<details id="failure-list"><summary>Show failed or interrupted scenarios (${failedCases.length})</summary><ul>${failedCases.map((item) => `<li><a href="#case-${item.id}" data-open-case="${item.id}">${item.id} · ${escapeHtml(item.scenario.title)}</a> — ${escapeHtml(item.execution.status)}</li>`).join('')}</ul></details>` : ''}<small>Only reviewed public messages are shown. Unknown values, raw errors, logs and attachments are omitted. Global run errors: ${report.run?.globalErrorCount || 0}. Playwright report: ${escapeHtml(report.playwrightReport?.status || 'unavailable')}.</small></section>`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'none'; img-src 'none'; base-uri 'none'; form-action 'none'">
<title>Rolnopol scenario coverage</title><style>
:root{color-scheme:light;--ink:#17362d;--muted:#56685f;--line:#d7e0d7;--paper:#f5f7f2;--green:#216346}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.6 system-ui,sans-serif}header{padding:36px max(24px,calc((100vw - 1440px)/2));background:#163d2e;color:#fff}header p{max-width:850px;color:#d8e6db}h1{font-size:clamp(26px,4vw,42px);line-height:1.15;margin:12px 0}h2{font-size:24px}nav{display:flex;gap:20px;flex-wrap:wrap}header a{color:#e0f3ce}main{max-width:1488px;padding:28px 24px;margin:auto}section{margin-bottom:28px}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}.card,article{background:white;border:1px solid var(--line);border-radius:12px;padding:22px}.card strong{display:block;font-size:25px}.card span,small{color:var(--muted)}small{display:block;font-size:12px;margin:4px 0}.notice{background:#fff4d5;border-left:4px solid #b27717;padding:14px 18px}.filters{display:flex;gap:14px;flex-wrap:wrap;margin:20px 0}label{display:grid;gap:4px}input,select{font:inherit;padding:8px 12px;border:1px solid #84998c;border-radius:6px;background:white;max-width:100%}input{min-width:240px}.table-scroll{overflow:auto;border:1px solid var(--line);border-radius:8px}table{border-collapse:collapse;width:100%;background:white;font-size:13px}th,td{padding:12px;text-align:left;border-bottom:1px solid var(--line);vertical-align:top}th{background:#e8efe5;white-space:nowrap}td:nth-child(3){min-width:240px}.status{white-space:nowrap;font-weight:600}.passed{color:#216346}.failed,.interrupted{color:#a52f2b}.flaky,.partial,.expected-failure{color:#8b5908}.planned,.not-run,.skipped,.excluded{color:#59666a}details{margin:18px 0}summary{cursor:pointer;font-size:21px;font-weight:650}article{margin-top:14px;overflow-wrap:anywhere}article h1{font-size:30px}pre{white-space:pre-wrap;background:#edf2ec;padding:16px;border-radius:6px}code{font-size:.9em}a{color:#216346}blockquote{border-left:3px solid #a5b7a5;padding-left:14px;margin-left:0}footer{padding:20px 0;color:var(--muted)}[hidden]{display:none!important}@media print{.filters,nav{display:none}details{display:block}header{background:white;color:black}main{padding:0}}
.coverage-overview{max-width:860px;margin:0 auto 28px}.coverage-panel{background:#e8ebe8;border:1px solid var(--line);border-radius:12px;padding:24px;margin-bottom:18px}.coverage-panel h2{margin:0 0 18px}.summary-metric{margin:12px 0}.summary-metric strong{font-size:24px}.coverage-group{margin-top:16px}.coverage-label{display:flex;justify-content:space-between;gap:16px;margin-bottom:7px}.coverage-label span{font-variant-numeric:tabular-nums;font-weight:650}.coverage-track{height:14px;background:#aeb5b0;border:1px solid #929d95;border-radius:20px;overflow:hidden;print-color-adjust:exact}.coverage-fill{display:block;height:100%;background:#fff;border-radius:20px}.freshness{font-size:13px;color:var(--muted)}@media(max-width:480px){.coverage-panel{padding:18px}.summary-metric strong{font-size:21px}}
.detail-toggle{font:inherit;background:none;border:0;padding:0;color:var(--green);cursor:pointer;text-decoration:underline;text-underline-offset:3px}.detail-toggle.failed,.detail-toggle.interrupted{color:#a52f2b}.failure-brief{max-width:260px}.case-details>td{background:#f0f4ee;padding:20px;overflow-wrap:anywhere}.case-details h4{margin:12px 0 6px}.execution-run{border-top:1px solid var(--line);margin-top:16px;padding-top:8px}.attempt{margin:12px 0}.failure-fields{display:grid;gap:12px;max-width:900px}.failure-fields dt{font-weight:650}.failure-fields dd{margin:2px 0;white-space:pre-wrap}.failure-summary{border:1px solid var(--line);background:white;border-radius:12px;padding:20px;margin:24px 0}.failure-summary h2{margin-top:0}
.pagination{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:16px 0}.pagination button{font:inherit;padding:8px 14px;border:1px solid var(--line);border-radius:6px;background:white;cursor:pointer}.pagination button:disabled{opacity:.5;cursor:default}.document-section{border-top:1px solid var(--line);padding-top:10px}.document-section summary{font-size:17px}.document-section .document-section{margin-left:16px}summary:focus-visible,button:focus-visible,a:focus-visible{outline:3px solid #b27717;outline-offset:3px}
</style></head><body><header><nav><a href="#coverage">Coverage</a><a href="#scenarios">Scenarios</a><a href="#readme">README</a><a href="#test_plan">Test plan</a><a href="#coding_standards">Coding standards</a></nav>
<h1>Rolnopol scenario coverage</h1><p>Which planned scenarios have tests, and what did the selected run demonstrate? The catalog defines the denominator. Test mappings and passing results do not assess assertion quality.</p></header>
<main><section id="coverage"><div class="coverage-overview">
<section class="coverage-panel" aria-labelledby="scenario-summary"><h2 id="scenario-summary">Scenario coverage</h2>${summaryMetric('Implemented', metrics.implemented, metrics.automationPercent)}${selectedMetric}${summaryMetric('Confirmed', metrics.confirmed, metrics.confirmedPercent)}<p class="freshness">Result freshness: ${report.freshness} · ${escapeHtml(report.run?.startTime || 'No test run supplied')}</p><p id="freshness-explanation" class="freshness">${escapeHtml(freshnessExplanation(report))}</p></section>
<details id="breakdowns"><summary>Coverage by priority, risk and area</summary>
<section class="coverage-panel" id="priorities" aria-labelledby="priority-summary"><h2 id="priority-summary">Priority coverage</h2><p>Implementation and current execution confirmation for each priority.</p>${priorityBars}</section>
<section class="coverage-panel" id="risks" aria-labelledby="risk-summary"><h2 id="risk-summary">Risk coverage</h2><p>Initial impact estimate for this learning application, separate from execution priority.</p>${riskBars}</section>
<section class="coverage-panel" id="areas" aria-labelledby="area-summary"><h2 id="area-summary">Coverage by area</h2><p>Implementation and current execution confirmation for each area.</p>${areaBars}</section>
</details>
</div>
<p class="notice">This measures the explicit scenario catalog, not application code coverage. Excluded cases and setup are outside the denominator. ${report.freshness !== 'current' ? 'Observed results below are not current execution confirmation.' : 'Unselected or blocked tests remain unconfirmed.'} ${report.run?.globalErrorCount ? `${report.run.globalErrorCount} global run errors: confirmation is unavailable.` : ''}</p>
<p>Generated ${escapeHtml(report.generatedAt)} · Revision ${escapeHtml(report.snapshot.revision || 'unknown')} · Source fingerprint <code>${escapeHtml(report.snapshot.fingerprint.slice(0, 16))}</code></p>
<p>Scenario outcomes: ${escapeHtml(
    Object.entries(report.counts)
      .map(([key, value]) => `${key}: ${value}`)
      .join(' · '),
  )}</p>
<details><summary>Run and setup evidence</summary><pre>${escapeHtml(JSON.stringify({ run: report.run, infrastructure: report.infrastructure }, null, 2))}</pre></details>
${failureSummary}
<details id="scenarios"><summary>Scenarios &middot; ${report.cases.length} catalog entries</summary><div class="filters"><label>Search<input id="search" type="search" placeholder="ID, scenario or file"></label><label>Area<select id="area"><option value="">All areas</option>${choices('area')}</select></label><label>Priority<select id="priority"><option value="">All priorities</option>${choices('priority')}</select></label><label>Risk<select id="risk"><option value="">All risks</option>${choices('risk')}</select></label><label>Status<select id="status"><option value="">All statuses</option>${choices('status')}</select></label></div><div class="pagination"><button type="button" id="previous-page">Previous</button><p id="visible" aria-live="polite"></p><button type="button" id="next-page">Next</button></div>
<div class="table-scroll"><table id="cases"><thead><tr><th>ID</th><th>Area</th><th>Scenario</th><th>Priority</th><th>Risk</th><th>Status</th><th>Failure</th><th>Details</th></tr></thead><tbody>${rows}</tbody></table></div></details></section>
<details id="readme"><summary>README · parsed project documentation</summary><article>${renderDocument(readme, 'readme')}</article></details>
<details id="test_plan"><summary>TEST_PLAN · parsed strategy and catalog</summary><article>${renderDocument(plan, 'test_plan')}</article></details>
<details id="coding_standards"><summary>CODING_STANDARDS &middot; test conventions</summary><article>${renderDocument(standards, 'coding_standards')}</article></details>
<footer>Standalone report · No AI, external fonts, scripts, or network requests required. Raw logs, credentials and attachments are not embedded.</footer></main>
<script>
const filters = ['search','area','priority','risk','status'].map(id => document.getElementById(id));
const caseRows = [...document.querySelectorAll('#cases [data-case-row]')];
const pageSize = 20;
let pageIndex = 0;
let matchingRows = [];
function renderPage(){
  const pages = Math.ceil(matchingRows.length / pageSize);
  pageIndex = Math.max(0, Math.min(pageIndex, pages - 1));
  const start = pageIndex * pageSize;
  const visibleRows = new Set(matchingRows.slice(start, start + pageSize));
  for(const row of caseRows){
    row.hidden = !visibleRows.has(row);
    row.nextElementSibling.hidden = row.hidden || row.querySelector('.detail-toggle').getAttribute('aria-expanded') !== 'true';
  }
  document.getElementById('visible').textContent = matchingRows.length
    ? (start + 1) + '-' + Math.min(start + pageSize, matchingRows.length) + ' of ' + matchingRows.length + ' matching scenarios / ' + caseRows.length + ' total'
    : 'No matching scenarios / ' + caseRows.length + ' total';
  document.getElementById('previous-page').disabled = pageIndex === 0;
  document.getElementById('next-page').disabled = pageIndex + 1 >= pages;
}
function filterRows(resetPage = true){
  const query = filters[0].value.trim().toLowerCase();
  matchingRows = caseRows.filter(row => (row.textContent + ' ' + row.nextElementSibling.textContent).toLowerCase().includes(query)
    && filters.slice(1).every(input => !input.value || row.dataset[input.id] === input.value));
  if(resetPage) pageIndex = 0;
  renderPage();
}
function toggleDetails(row,open){row.querySelectorAll('.detail-toggle').forEach(button=>button.setAttribute('aria-expanded',String(open)));row.nextElementSibling.hidden=row.hidden||!open;}
document.querySelectorAll('.detail-toggle').forEach(button=>button.addEventListener('click',()=>toggleDetails(button.closest('tr'),button.getAttribute('aria-expanded')!=='true')));
document.getElementById('previous-page').addEventListener('click',()=>{pageIndex--;renderPage();saveView(true);});
document.getElementById('next-page').addEventListener('click',()=>{pageIndex++;renderPage();saveView(true);});
function saveView(scenarioView = false){
  const url = new URL(location.href);
  for(const input of filters){
    if(input.value) url.searchParams.set(input.id,input.value);
    else url.searchParams.delete(input.id);
  }
  if(pageIndex) url.searchParams.set('page',String(pageIndex + 1));
  else url.searchParams.delete('page');
  if(scenarioView) url.hash = 'scenarios';
  history.replaceState(null,'',url);
}
function restoreView(){
  const params = new URLSearchParams(location.search);
  for(const input of filters) input.value = params.get(input.id) || '';
  const requestedPage = Number(params.get('page'));
  pageIndex = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage - 1 : 0;
  filterRows(false);
  if(filters.some(input=>input.value) || pageIndex) document.getElementById('scenarios').open = true;
  saveView();
}
filters.forEach(input=>input.addEventListener('input',()=>{filterRows();saveView(true);}));
restoreView();
function revealAnchor(){
  const target = document.getElementById(location.hash.slice(1));
  if(!target) return;
  if(target.matches('[data-case-row]')){
    filters.forEach(input=>input.value='');
    filterRows();
    pageIndex = Math.floor(matchingRows.indexOf(target) / pageSize);
    renderPage();
    toggleDetails(target,true);
    saveView();
  }
  for(let ancestor=target;ancestor;ancestor=ancestor.parentElement){
    if(ancestor.tagName==='DETAILS') ancestor.open=true;
  }
  target.scrollIntoView();
}
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',()=>{
  if(link.hash===location.hash) revealAnchor();
}));
window.addEventListener('popstate',()=>{restoreView();revealAnchor();});
window.addEventListener('hashchange',revealAnchor);revealAnchor();
</script></body></html>`;
}
