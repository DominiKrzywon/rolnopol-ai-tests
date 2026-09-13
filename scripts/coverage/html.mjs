import { tableCells } from './model.mjs';

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
  const match = /^(?:\.\/)?(README|TEST_PLAN)\.md(?:#([\w-]+))?$/.exec(href);
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
export function renderMarkdown(markdown, document) {
  const lines = markdown
    .replace(/<!-- coverage-[\s\S]*?-->/g, '')
    .split(/\r?\n/);
  const result = [];
  const headingIds = new Map();
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
  return result.join('\n');
}

export function renderReport(report, readme, plan) {
  const { metrics } = report;
  const ratio = (count, percent) =>
    count === null
      ? 'No current evidence'
      : `${count} / ${metrics.denominator}${percent === null ? ' (no denominator)' : ` (${percent.toFixed(1)}%)`}`;
  const choices = (key) =>
    [...new Set(report.cases.map((item) => item[key]))]
      .sort()
      .map((value) => `<option>${escapeHtml(value)}</option>`)
      .join('');
  const rows = report.cases
    .map(
      (
        item,
      ) => `<tr data-area="${escapeHtml(item.area)}" data-priority="${item.priority}" data-status="${item.status}">
    <td><strong>${item.id}</strong></td><td>${escapeHtml(item.area)}</td><td>${escapeHtml(item.scenario)}${item.notes && item.notes !== '-' ? `<small>${escapeHtml(item.notes)}</small>` : ''}</td>
    <td>${item.layer}</td><td>${item.priority}</td><td><span class="status ${item.status}">${item.status}</span></td>
    <td>${item.tests.map((test) => `<small>${escapeHtml(test.project)}<br>${escapeHtml('tests/' + test.file)}:${escapeHtml(test.line)}</small>`).join('') || '—'}</td>
    <td>${item.observations.map((observation) => `<small>${escapeHtml(observation.project)}: ${observation.status}<br>${observation.attempts.map((attempt) => `${escapeHtml(attempt.status)} / retry ${escapeHtml(attempt.retry)} / ${escapeHtml(attempt.durationMs)} ms`).join('<br>')}</small>`).join('') || '—'}</td></tr>`,
    )
    .join('\n');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'none'; img-src 'none'; base-uri 'none'; form-action 'none'">
<title>Rolnopol scenario coverage</title><style>
:root{color-scheme:light;--ink:#17362d;--muted:#56685f;--line:#d7e0d7;--paper:#f5f7f2;--green:#216346}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.6 system-ui,sans-serif}header{padding:36px max(24px,calc((100vw - 1440px)/2));background:#163d2e;color:#fff}header p{max-width:850px;color:#d8e6db}h1{font-size:clamp(26px,4vw,42px);line-height:1.15;margin:12px 0}h2{font-size:24px}nav{display:flex;gap:20px;flex-wrap:wrap}header a{color:#e0f3ce}main{max-width:1488px;padding:28px 24px;margin:auto}section{margin-bottom:28px}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}.card,article{background:white;border:1px solid var(--line);border-radius:12px;padding:22px}.card strong{display:block;font-size:25px}.card span,small{color:var(--muted)}small{display:block;font-size:12px;margin:4px 0}.notice{background:#fff4d5;border-left:4px solid #b27717;padding:14px 18px}.filters{display:flex;gap:14px;flex-wrap:wrap;margin:20px 0}label{display:grid;gap:4px}input,select{font:inherit;padding:8px 12px;border:1px solid #84998c;border-radius:6px;background:white;max-width:100%}input{min-width:240px}.table-scroll{overflow:auto;border:1px solid var(--line);border-radius:8px}table{border-collapse:collapse;width:100%;background:white;font-size:13px}th,td{padding:12px;text-align:left;border-bottom:1px solid var(--line);vertical-align:top}th{background:#e8efe5;white-space:nowrap}td:nth-child(3){min-width:240px}.status{white-space:nowrap;font-weight:600}.passed{color:#216346}.failed,.interrupted{color:#a52f2b}.flaky,.partial,.expected-failure{color:#8b5908}.planned,.not-run,.skipped,.excluded{color:#59666a}details{margin:18px 0}summary{cursor:pointer;font-size:21px;font-weight:650}article{margin-top:14px;overflow-wrap:anywhere}article h1{font-size:30px}pre{white-space:pre-wrap;background:#edf2ec;padding:16px;border-radius:6px}code{font-size:.9em}a{color:#216346}blockquote{border-left:3px solid #a5b7a5;padding-left:14px;margin-left:0}footer{padding:20px 0;color:var(--muted)}[hidden]{display:none!important}@media print{.filters,nav{display:none}details{display:block}header{background:white;color:black}main{padding:0}}
</style></head><body><header><nav><a href="#coverage">Coverage</a><a href="#readme">README</a><a href="#test_plan">Test plan</a></nav>
<h1>Rolnopol scenario coverage</h1><p>Which planned scenarios have tests, and what did the selected run demonstrate? The catalog defines the denominator. Test mappings and passing results do not assess assertion quality.</p></header>
<main><section id="coverage"><div class="cards"><div class="card"><span>Implemented scenarios</span><strong>${ratio(metrics.implemented, metrics.automationPercent)}</strong></div><div class="card"><span>Confirmed across collected projects</span><strong>${ratio(metrics.confirmed, metrics.confirmedPercent)}</strong></div><div class="card"><span>Result freshness</span><strong>${report.freshness}</strong><span>${escapeHtml(report.run?.startTime || 'No test run supplied')}</span></div></div>
<p class="notice">This measures the explicit scenario catalog, not application code coverage. Excluded cases and setup are outside the denominator. ${report.freshness !== 'current' ? 'Observed results below are not current execution confirmation.' : 'Unselected or blocked tests remain unconfirmed.'} ${report.run?.globalErrorCount ? `${report.run.globalErrorCount} global run errors: confirmation is unavailable.` : ''}</p>
<p>Generated ${escapeHtml(report.generatedAt)} · Revision ${escapeHtml(report.snapshot.revision || 'unknown')} · Source fingerprint <code>${escapeHtml(report.snapshot.fingerprint.slice(0, 16))}</code></p>
<p>Scenario outcomes: ${escapeHtml(
    Object.entries(report.counts)
      .map(([key, value]) => `${key}: ${value}`)
      .join(' · '),
  )}</p>
<details><summary>Run and setup evidence</summary><pre>${escapeHtml(JSON.stringify({ run: report.run, infrastructure: report.infrastructure }, null, 2))}</pre></details>
<div class="filters"><label>Search<input id="search" type="search" placeholder="ID, scenario or file"></label><label>Area<select id="area"><option value="">All areas</option>${choices('area')}</select></label><label>Priority<select id="priority"><option value="">All priorities</option>${choices('priority')}</select></label><label>Status<select id="status"><option value="">All statuses</option>${choices('status')}</select></label></div><p id="visible" aria-live="polite"></p>
<div class="table-scroll"><table id="cases"><thead><tr><th>ID</th><th>Area</th><th>Scenario</th><th>Layer</th><th>Priority</th><th>Observed status</th><th>Implementation</th><th>Attempts</th></tr></thead><tbody>${rows}</tbody></table></div></section>
<details id="readme" open><summary>README · parsed project documentation</summary><article>${renderMarkdown(readme, 'readme')}</article></details>
<details id="test_plan"><summary>TEST_PLAN · parsed strategy and catalog</summary><article>${renderMarkdown(plan, 'test_plan')}</article></details>
<footer>Standalone report · No AI, external fonts, scripts, or network requests required. Raw logs, credentials and attachments are not embedded.</footer></main>
<script>
const filters = ['search','area','priority','status'].map(id => document.getElementById(id));
function filterRows(){let count=0;for(const row of document.querySelectorAll('#cases tbody tr')){const visible=row.textContent.toLowerCase().includes(filters[0].value.toLowerCase())&&filters.slice(1).every(input=>!input.value||row.dataset[input.id]===input.value);row.hidden=!visible;if(visible)count++;}document.getElementById('visible').textContent=count+' scenarios shown';}
filters.forEach(input=>input.addEventListener('input',filterRows));filterRows();
function revealAnchor(){const target=document.getElementById(location.hash.slice(1));if(target){const details=target.closest('details');if(details)details.open=true;target.scrollIntoView();}}
window.addEventListener('hashchange',revealAnchor);revealAnchor();
</script></body></html>`;
}
