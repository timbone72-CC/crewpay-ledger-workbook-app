const STORAGE_KEY = "crewpay-ledger-mvp-v1";
const BRIDGE_CONFIG_KEY = "crewpay-admin-bridge-config-v1";
const CLIENT_ID = "crewpay-admin-app";

const sampleData = {
  workers: [
    {
      worker_id: "W-1001",
      worker_name: "Maya Ellis",
      worker_email: "maya.ellis@example.local",
      role: "Crew Lead",
      access_status: "Active",
      created_at: "2026-06-01",
      inactive_at: "",
    },
    {
      worker_id: "W-1002",
      worker_name: "Leo Grant",
      worker_email: "leo.grant@example.local",
      role: "Installer",
      access_status: "Active",
      created_at: "2026-06-01",
      inactive_at: "",
    },
    {
      worker_id: "W-1003",
      worker_name: "Priya Shah",
      worker_email: "priya.shah@example.local",
      role: "Helper",
      access_status: "Inactive",
      created_at: "2026-05-15",
      inactive_at: "2026-06-09",
    },
  ],
  jobs: [
    {
      job_id: "J-2001",
      job_name: "Oak Ridge Units",
      client_or_site: "Oak Ridge Apartments",
      status: "Active",
      created_at: "2026-06-01",
    },
    {
      job_id: "J-2002",
      job_name: "Bluebird Cafe Refresh",
      client_or_site: "Bluebird Cafe",
      status: "Active",
      created_at: "2026-06-03",
    },
    {
      job_id: "J-2003",
      job_name: "Cedar Lane Repairs",
      client_or_site: "Cedar Lane Rentals",
      status: "Closed",
      created_at: "2026-05-20",
    },
  ],
  timeEntries: [
    {
      entry_id: "T-3001",
      worker_id: "W-1001",
      job_id: "J-2001",
      job_name: "Oak Ridge Units",
      work_date: "2026-06-02",
      start_time: "08:00",
      end_time: "16:30",
      break_minutes: 30,
      hours: 8,
      rate: 32,
      notes: "Unit prep and fixture checks.",
      submitted_at: "2026-06-02T16:45:00",
      approval_status: "Approved",
      approved_at: "2026-06-03T09:10:00",
      correction_note: "",
    },
    {
      entry_id: "T-3002",
      worker_id: "W-1002",
      job_id: "J-2001",
      job_name: "Oak Ridge Units",
      work_date: "2026-06-02",
      start_time: "08:00",
      end_time: "15:00",
      break_minutes: 30,
      hours: 6.5,
      rate: 28,
      notes: "Drywall patch support.",
      submitted_at: "2026-06-02T15:20:00",
      approval_status: "Submitted",
      approved_at: "",
      correction_note: "",
    },
    {
      entry_id: "T-3003",
      worker_id: "W-1003",
      job_id: "J-2003",
      job_name: "Cedar Lane Repairs",
      work_date: "2026-06-03",
      start_time: "09:00",
      end_time: "14:00",
      break_minutes: 0,
      hours: 5,
      rate: 24,
      notes: "Historical approved work before inactive status.",
      submitted_at: "2026-06-03T14:10:00",
      approval_status: "Approved",
      approved_at: "2026-06-04T08:30:00",
      correction_note: "",
    },
    {
      entry_id: "T-3004",
      worker_id: "W-1001",
      job_id: "J-2002",
      job_name: "Bluebird Cafe Refresh",
      work_date: "2026-06-06",
      start_time: "07:30",
      end_time: "13:30",
      break_minutes: 0,
      hours: 6,
      rate: 32,
      notes: "Final punch list.",
      submitted_at: "2026-06-06T13:40:00",
      approval_status: "Paid",
      approved_at: "2026-06-07T10:00:00",
      correction_note: "Paid period proof generated after final punch list.",
    },
  ],
  payPeriods: [
    {
      pay_period_id: "P-4001",
      worker_id: "W-1001",
      period_start: "2026-06-01",
      period_end: "2026-06-07",
      status: "Paid",
      payment_status: "Paid",
      reimbursement_total: 35,
      deduction_total: 0,
      paid_at: "2026-06-08T12:00:00",
    },
    {
      pay_period_id: "P-4002",
      worker_id: "W-1002",
      period_start: "2026-06-01",
      period_end: "2026-06-07",
      status: "Open",
      payment_status: "Unpaid",
      reimbursement_total: 0,
      deduction_total: 0,
      paid_at: "",
    },
    {
      pay_period_id: "P-4003",
      worker_id: "W-1003",
      period_start: "2026-06-01",
      period_end: "2026-06-07",
      status: "Finalized",
      payment_status: "Unpaid",
      reimbursement_total: 0,
      deduction_total: 0,
      paid_at: "",
    },
  ],
  proofExports: [],
};

let data = loadData();
let bridgeConfig = loadBridgeConfig();
let bridgeResult = null;
let pendingSummary = null;
let currentSection = "dashboard";
let lastProof = null;

function loadData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return structuredClone(sampleData);
  try {
    return JSON.parse(stored);
  } catch {
    return structuredClone(sampleData);
  }
}


function loadBridgeConfig() {
  const stored = localStorage.getItem(BRIDGE_CONFIG_KEY);
  if (!stored) return { url: "", token: "" };
  try {
    const parsed = JSON.parse(stored);
    return { url: parsed.url || "", token: parsed.token || "" };
  } catch {
    return { url: "", token: "" };
  }
}

function saveBridgeConfig(config) {
  bridgeConfig = {
    url: (config.url || "").trim(),
    token: (config.token || "").trim(),
  };
  localStorage.setItem(BRIDGE_CONFIG_KEY, JSON.stringify(bridgeConfig));
}

function clearBridgeConfig() {
  bridgeConfig = { url: "", token: "" };
  bridgeResult = { status: "info", message: "Bridge configuration cleared from this browser." };
  pendingSummary = null;
  localStorage.removeItem(BRIDGE_CONFIG_KEY);
  render();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function bridgeConfigured() {
  return Boolean(bridgeConfig.url);
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function resetSampleData() {
  data = structuredClone(sampleData);
  saveData();
  render();
}

function byId(id) {
  return document.getElementById(id);
}

function money(value) {
  return Number(value || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

function getWorker(workerId) {
  return data.workers.find((worker) => worker.worker_id === workerId);
}

function getJob(jobId) {
  return data.jobs.find((job) => job.job_id === jobId);
}

function workerName(workerId) {
  return getWorker(workerId)?.worker_name || workerId;
}

function entryRows(entries) {
  if (!entries.length) {
    return `<tr><td colspan="10" class="muted">No records yet.</td></tr>`;
  }

  return entries
    .map(
      (entry) => `
        <tr>
          <td>${entry.entry_id}</td>
          <td>${workerName(entry.worker_id)}</td>
          <td>${entry.job_name || getJob(entry.job_id)?.job_name || entry.job_id}</td>
          <td>${entry.work_date}</td>
          <td>${entry.hours.toFixed(2)}</td>
          <td>${money(entry.rate)}</td>
          <td><span class="pill">${entry.approval_status}</span></td>
          <td>${entry.notes || ""}</td>
          <td>${entry.correction_note || ""}</td>
          <td>
            <button class="secondary" data-action="approve-entry" data-entry="${entry.entry_id}" ${entry.approval_status !== "Submitted" ? "disabled" : ""}>
              Approve
            </button>
          </td>
        </tr>
      `,
    )
    .join("");
}

function render() {
  renderNav();
  const views = {
    dashboard: renderDashboard,
    workers: renderWorkers,
    jobs: renderJobs,
    time: renderTimeEntries,
    periods: renderPayPeriods,
    proof: renderWorkerProof,
    bridge: renderBridge,
    access: renderAccessModel,
  };
  byId("app").innerHTML = views[currentSection]();
  attachHandlers();
}

function renderNav() {
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.section === currentSection);
  });
}

function renderDashboard() {
  const summary = LedgerCore.dashboardSummary(data);
  const paidProofs = data.proofExports.length;
  return `
    <section class="panel">
      <div class="section-title">
        <div>
          <p class="eyebrow">Admin workbook companion</p>
          <h2>CrewPay Admin Dashboard</h2>
        </div>
        <button class="secondary" data-action="reset">Reset sample data</button>
      </div>
      <div class="flow-strip" aria-label="System flow">
        <span>Admin App</span><strong>→</strong><span>Apps Script Bridge</span><strong>→</strong><span>Pending Intake Tabs</span><strong>→</strong><span>Workbook Review</span>
      </div>
      <div class="cards">
        <article class="metric"><span>Active Workers</span><strong>${summary.active_workers}</strong></article>
        <article class="metric"><span>Pending Approvals</span><strong>${summary.pending_approvals}</strong></article>
        <article class="metric"><span>Current Pay Period Totals</span><strong>${money(summary.current_pay_total)}</strong></article>
        <article class="metric"><span>Inactive Workers</span><strong>${summary.inactive_workers}</strong></article>
        <article class="metric"><span>Proof Exports Logged</span><strong>${paidProofs}</strong></article>
      </div>
      <div class="notice">
        CrewPay is the admin-side control panel. The workbook remains the source of truth and final record authority.
        Bridge submissions land in pending intake tabs for workbook review; this app has no separate backend or database.
      </div>
    </section>
  `;
}

function renderWorkers() {
  return `
    <section class="panel">
      <div class="section-title">
        <div>
          <p class="eyebrow">Access status</p>
          <h2>Workers</h2>
        </div>
      </div>
      <form class="form-grid" data-form="worker">
        <label>Name<input name="worker_name" required /></label>
        <label>Email<input name="worker_email" type="email" required /></label>
        <label>Role<input name="role" required /></label>
        <button type="submit">Add Worker</button>
      </form>
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Inactive At</th><th>Action</th></tr></thead>
          <tbody>
            ${data.workers
              .map(
                (worker) => `
                  <tr>
                    <td>${worker.worker_id}</td>
                    <td>${worker.worker_name}</td>
                    <td>${worker.worker_email}</td>
                    <td>${worker.role}</td>
                    <td><span class="pill ${worker.access_status === "Inactive" ? "danger" : "success"}">${worker.access_status}</span></td>
                    <td>${worker.inactive_at || ""}</td>
                    <td>
                      <button class="secondary" data-action="toggle-worker" data-worker="${worker.worker_id}">
                        Mark ${worker.access_status === "Active" ? "Inactive" : "Active"}
                      </button>
                    </td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderJobs() {
  return `
    <section class="panel">
      <div class="section-title">
        <div>
          <p class="eyebrow">Work sites</p>
          <h2>Jobs</h2>
        </div>
      </div>
      <form class="form-grid" data-form="job">
        <label>Job Name<input name="job_name" required /></label>
        <label>Client or Site<input name="client_or_site" required /></label>
        <label>Status<select name="status"><option>Active</option><option>Closed</option></select></label>
        <button type="submit">Add Job</button>
      </form>
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Job</th><th>Client/Site</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>
            ${data.jobs
              .map(
                (job) => `
                  <tr>
                    <td>${job.job_id}</td>
                    <td>${job.job_name}</td>
                    <td>${job.client_or_site}</td>
                    <td><span class="pill">${job.status}</span></td>
                    <td>${job.created_at}</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderTimeEntries() {
  const activeWorkerOptions = LedgerCore.activeWorkers(data.workers)
    .map((worker) => `<option value="${worker.worker_id}">${worker.worker_name}</option>`)
    .join("");
  const jobOptions = data.jobs
    .filter((job) => job.status === "Active")
    .map((job) => `<option value="${job.job_id}">${job.job_name}</option>`)
    .join("");

  return `
    <section class="panel">
      <div class="section-title">
        <div>
          <p class="eyebrow">New entries only use active workers</p>
          <h2>Time Entries</h2>
        </div>
      </div>
      <form class="form-grid wide" data-form="entry">
        <label>Worker<select name="worker_id" required>${activeWorkerOptions}</select></label>
        <label>Job<select name="job_id" required>${jobOptions}</select></label>
        <label>Date<input name="work_date" type="date" required /></label>
        <label>Start<input name="start_time" type="time" required /></label>
        <label>End<input name="end_time" type="time" required /></label>
        <label>Break Minutes<input name="break_minutes" type="number" min="0" value="30" /></label>
        <label>Rate<input name="rate" type="number" min="0" step="0.01" required /></label>
        <label>Notes<input name="notes" /></label>
        <button type="submit">Add Time Entry</button>
      </form>
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Worker</th><th>Job</th><th>Date</th><th>Hours</th><th>Rate</th><th>Status</th><th>Notes</th><th>Visible Correction Note</th><th>Action</th></tr></thead>
          <tbody>${entryRows(data.timeEntries)}</tbody>
        </table>
      </div>
    </section>
  `;
}

function renderPayPeriods() {
  return `
    <section class="panel">
      <div class="section-title">
        <div>
          <p class="eyebrow">Open / Finalized / Paid</p>
          <h2>Pay Periods</h2>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Worker</th><th>Date Range</th><th>Status</th><th>Payment</th><th>Hours</th><th>Gross</th><th>Reimbursements</th><th>Deductions</th><th>Net Pay</th><th>Actions</th></tr></thead>
          <tbody>
            ${data.payPeriods
              .map((period) => {
                const summary = LedgerCore.summarizePayPeriod(data.timeEntries, period);
                return `
                  <tr>
                    <td>${period.pay_period_id}</td>
                    <td>${workerName(period.worker_id)}</td>
                    <td>${period.period_start} to ${period.period_end}</td>
                    <td><span class="pill">${period.status}</span></td>
                    <td><span class="pill ${period.payment_status === "Paid" ? "success" : ""}">${period.payment_status}</span></td>
                    <td>${summary.total_hours.toFixed(2)}</td>
                    <td>${money(summary.gross_pay)}</td>
                    <td>${money(summary.reimbursement_total)}</td>
                    <td>${money(summary.deduction_total)}</td>
                    <td>${money(summary.net_pay)}</td>
                    <td class="actions">
                      <button class="secondary" data-action="finalize-period" data-period="${period.pay_period_id}" ${period.status !== "Open" ? "disabled" : ""}>Finalize</button>
                      <button class="secondary" data-action="mark-paid" data-period="${period.pay_period_id}" ${period.status === "Paid" ? "disabled" : ""}>Mark Paid</button>
                    </td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
      <div class="notice">
        Finalized and paid periods are treated as historical proof. If a later correction is needed,
        add a visible correction note on the affected entry instead of silently changing proof.
      </div>
    </section>
  `;
}

function renderWorkerProof() {
  const workerOptions = data.workers
    .map((worker) => `<option value="${worker.worker_id}">${worker.worker_name} (${worker.access_status})</option>`)
    .join("");
  const selectedWorkerId = data.workers[0]?.worker_id;
  const periodOptions = data.payPeriods
    .filter((period) => period.worker_id === selectedWorkerId)
    .map((period) => `<option value="${period.pay_period_id}">${period.period_start} to ${period.period_end}</option>`)
    .join("");

  return `
    <section class="panel">
      <div class="section-title">
        <div>
          <p class="eyebrow">Worker-only proof</p>
          <h2>Worker Proof</h2>
        </div>
      </div>
      <form class="form-grid" data-form="proof">
        <label>Worker<select name="worker_id" data-role="proof-worker" required>${workerOptions}</select></label>
        <label>Pay Period<select name="pay_period_id" data-role="proof-period" required>${periodOptions}</select></label>
        <button type="submit">Generate Proof</button>
      </form>
      <div id="proof-output" class="proof-output">
        ${lastProof ? proofHtml(lastProof) : `<p class="muted">Select a worker and pay period to generate printable proof.</p>`}
      </div>
    </section>
  `;
}

function proofHtml(proof) {
  return `
    <section class="proof-card">
      <div class="section-title">
        <div>
          <p class="eyebrow">Generated ${new Date(proof.generated_at).toLocaleString()}</p>
          <h2>${proof.worker.worker_name} proof</h2>
        </div>
        <div class="actions no-print">
          <button data-action="print-proof">Print Proof</button>
          <button class="secondary" data-action="export-proof">Export CSV</button>
        </div>
      </div>
      <dl class="proof-meta">
        <div><dt>Worker</dt><dd>${proof.worker.worker_name}</dd></div>
        <div><dt>Worker Status</dt><dd>${proof.worker.access_status}</dd></div>
        <div><dt>Date Range</dt><dd>${proof.payPeriod.period_start} to ${proof.payPeriod.period_end}</dd></div>
        <div><dt>Period Status</dt><dd>${proof.payPeriod.status}</dd></div>
        <div><dt>Payment Status</dt><dd>${proof.payPeriod.payment_status}</dd></div>
        <div><dt>Generated Timestamp</dt><dd>${proof.generated_at}</dd></div>
      </dl>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Entry</th><th>Date</th><th>Job</th><th>Hours</th><th>Rate</th><th>Gross</th><th>Status</th><th>Notes</th></tr></thead>
          <tbody>
            ${proof.entries
              .map(
                (entry) => `
                  <tr>
                    <td>${entry.entry_id}</td>
                    <td>${entry.work_date}</td>
                    <td>${entry.job_name || entry.job_id}</td>
                    <td>${entry.hours.toFixed(2)}</td>
                    <td>${money(entry.rate)}</td>
                    <td>${money(entry.hours * entry.rate)}</td>
                    <td>${entry.approval_status}</td>
                    <td>${entry.notes || ""}</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <div class="totals">
        <strong>Total Hours: ${proof.totals.total_hours.toFixed(2)}</strong>
        <strong>Gross Pay: ${money(proof.totals.gross_pay)}</strong>
        <strong>Net Pay: ${money(proof.totals.net_pay)}</strong>
      </div>
    </section>
  `;
}


function renderBridge() {
  const configStatus = bridgeConfigured() ? "Configured in this browser" : "Bridge not configured";
  const resultHtml = bridgeResult
    ? `<pre class="bridge-result ${bridgeResult.status === "error" ? "danger" : "success"}">${escapeHtml(JSON.stringify(bridgeResult, null, 2))}</pre>`
    : `<p class="muted">Run a bridge test or submit a sample intake record to see the response.</p>`;
  const summaryHtml = pendingSummary
    ? `
      <div class="cards compact">
        <article class="metric"><span>Worker Intake Pending</span><strong>${pendingSummary.workerIntakePending ?? 0}</strong></article>
        <article class="metric"><span>Pay Period Intake Pending</span><strong>${pendingSummary.payPeriodIntakePending ?? 0}</strong></article>
        <article class="metric"><span>Time Entries Pending</span><strong>${pendingSummary.timeEntriesPending ?? 0}</strong></article>
      </div>`
    : `<p class="muted">Pending summary returns counts only and does not expose workbook row data.</p>`;

  return `
    <section class="panel">
      <div class="section-title">
        <div>
          <p class="eyebrow">No-backend workbook bridge</p>
          <h2>Workbook Bridge</h2>
        </div>
        <span class="pill ${bridgeConfigured() ? "success" : ""}">${configStatus}</span>
      </div>

      <div class="notice">
        This admin app can submit controlled records through a deployed Apps Script Web App. Records land in workbook pending intake tabs first. Review and promotion stay workbook-controlled.
      </div>

      <div class="bridge-grid">
        <article class="info-card bridge-card">
          <h3>Bridge configuration</h3>
          <p class="muted">Saved locally in this browser only. The URL and token are not workbook data. The token is a basic private/demo gate, not full authentication.</p>
          <form class="form-grid stack" data-form="bridge-config">
            <label>Apps Script Web App URL<input name="url" type="url" value="${escapeHtml(bridgeConfig.url)}" placeholder="https://script.google.com/macros/s/DEPLOYMENT_ID/exec" /></label>
            <label>Optional demo/private token<input name="token" type="password" value="${escapeHtml(bridgeConfig.token)}" autocomplete="off" /></label>
            <button type="submit">Save Bridge Config</button>
            <button type="button" class="secondary" data-action="clear-bridge-config">Clear Config</button>
          </form>
        </article>

        <article class="info-card bridge-card">
          <h3>Bridge diagnostics</h3>
          <p class="muted">Use these checks after deploying <code>apps_script/CrewPay_Ledger_BRIDGE.gs</code> as a Web App.</p>
          <div class="actions block-actions">
            <button data-action="bridge-health">Test Workbook Bridge</button>
            <button class="secondary" data-action="bridge-test-write">Test Write Access</button>
            <button class="secondary" data-action="bridge-pending-summary">Load Pending Summary</button>
          </div>
          ${summaryHtml}
        </article>
      </div>

      <div class="bridge-grid three">
        <article class="info-card bridge-card">
          <h3>Worker intake</h3>
          <p class="muted">Submits to <code>Pending Worker Intake</code> for workbook review.</p>
          <form class="form-grid stack" data-form="bridge-worker">
            <label>Worker ID<input name="workerId" value="W-010" /></label>
            <label>Worker Name<input name="workerName" required value="Sample Admin Worker" /></label>
            <label>Access Status<select name="accessStatus"><option>Active</option><option>Inactive</option></select></label>
            <label>Role / Trade<input name="roleTrade" required value="Crew" /></label>
            <label>Contact<input name="contact" required value="sample.worker@example.local" /></label>
            <label>Notes<input name="notes" value="Submitted from CrewPay Admin App" /></label>
            <button type="submit">Submit Worker Intake</button>
          </form>
        </article>

        <article class="info-card bridge-card">
          <h3>Pay period intake</h3>
          <p class="muted">Submits to <code>Pending Pay Period Intake</code> for workbook review.</p>
          <form class="form-grid stack" data-form="bridge-period">
            <label>Pay Period ID<input name="payPeriodId" required value="PP-010" /></label>
            <label>Worker ID<input name="workerId" required value="W-010" /></label>
            <label>Worker Name<input name="workerName" value="Sample Admin Worker" /></label>
            <label>Period Start<input name="periodStart" type="date" required value="2026-06-08" /></label>
            <label>Period End<input name="periodEnd" type="date" required value="2026-06-14" /></label>
            <label>Pay Date<input name="payDate" type="date" value="2026-06-21" /></label>
            <label>Notes<input name="notes" value="Submitted from CrewPay Admin App" /></label>
            <button type="submit">Submit Pay Period</button>
          </form>
        </article>

        <article class="info-card bridge-card">
          <h3>Time entry intake</h3>
          <p class="muted">Submits to <code>Pending Time Entries</code> for workbook review.</p>
          <form class="form-grid stack" data-form="bridge-time">
            <label>Entry ID<input name="entryId" value="E-010" /></label>
            <label>Worker ID<input name="workerId" required value="W-010" /></label>
            <label>Worker Name<input name="workerName" value="Sample Admin Worker" /></label>
            <label>Pay Period ID<input name="payPeriodId" required value="PP-010" /></label>
            <label>Work Date<input name="workDate" type="date" required value="2026-06-10" /></label>
            <label>Job / Work Type<input name="jobWorkType" required value="Sample Work" /></label>
            <label>Hours<input name="hoursWorked" type="number" min="0.25" max="24" step="0.01" required value="8" /></label>
            <label>Rate<input name="rate" type="number" min="0" step="0.01" required value="25" /></label>
            <label>Notes<input name="notes" value="Submitted from CrewPay Admin App" /></label>
            <button type="submit">Submit Time Entry</button>
          </form>
        </article>
      </div>

      <div class="notice">
        Every successful bridge write should append <code>App Submission Log</code>. Future FieldOps-style input tools can use the same pending intake structure later, but this repo is the admin-side CrewPay app.
      </div>
      ${resultHtml}
    </section>
  `;
}

function renderAccessModel() {
  return `
    <section class="panel">
      <div class="section-title">
        <div>
          <p class="eyebrow">MVP boundary</p>
          <h2>Access Control Model</h2>
        </div>
      </div>
      <div class="info-grid">
        <article class="info-card">
          <h3>Active workers</h3>
          <p>Can be selected for new time entries and remain visible in reports and proof.</p>
        </article>
        <article class="info-card">
          <h3>Inactive workers</h3>
          <p>Cannot be selected for new time entries. Their historical records and proof remain visible.</p>
        </article>
        <article class="info-card">
          <h3>Worker proof</h3>
          <p>Proof view and CSV export are generated for one selected worker and one selected pay period.</p>
        </article>
        <article class="info-card">
          <h3>Migration path</h3>
          <p>Data is stored as workers, jobs, time entries, pay periods, and proof exports for a later database-backed version.</p>
        </article>
      </div>
    </section>
  `;
}

function attachHandlers() {
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.addEventListener("click", () => {
      currentSection = button.dataset.section;
      render();
    });
  });

  document.querySelectorAll("[data-action='reset']").forEach((button) => {
    button.addEventListener("click", resetSampleData);
  });

  document.querySelectorAll("[data-action='toggle-worker']").forEach((button) => {
    button.addEventListener("click", () => toggleWorker(button.dataset.worker));
  });

  document.querySelectorAll("[data-action='finalize-period']").forEach((button) => {
    button.addEventListener("click", () => updatePayPeriod(button.dataset.period, "Finalized"));
  });

  document.querySelectorAll("[data-action='mark-paid']").forEach((button) => {
    button.addEventListener("click", () => updatePayPeriod(button.dataset.period, "Paid"));
  });

  document.querySelectorAll("[data-action='approve-entry']").forEach((button) => {
    button.addEventListener("click", () => approveEntry(button.dataset.entry));
  });

  document.querySelectorAll("[data-action='print-proof']").forEach((button) => {
    button.addEventListener("click", () => window.print());
  });

  document.querySelectorAll("[data-action='export-proof']").forEach((button) => {
    button.addEventListener("click", exportCurrentProof);
  });

  document.querySelectorAll("[data-action='clear-bridge-config']").forEach((button) => {
    button.addEventListener("click", clearBridgeConfig);
  });

  document.querySelectorAll("[data-action='bridge-health']").forEach((button) => {
    button.addEventListener("click", () => runBridgeAction("healthCheck", {}, { includeToken: false }));
  });

  document.querySelectorAll("[data-action='bridge-test-write']").forEach((button) => {
    button.addEventListener("click", () => runBridgeAction("testWriteAccess", { source: "admin-ui" }));
  });

  document.querySelectorAll("[data-action='bridge-pending-summary']").forEach((button) => {
    button.addEventListener("click", async () => {
      const response = await runBridgeAction("getPendingSummary", {}, { silentRender: true });
      if (response?.status === "success") pendingSummary = response.data.summary;
      bridgeResult = response;
      render();
    });
  });

  const workerSelect = document.querySelector("[data-role='proof-worker']");
  if (workerSelect) {
    workerSelect.addEventListener("change", updateProofPeriodOptions);
  }

  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", handleFormSubmit);
  });
}

function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = Object.fromEntries(new FormData(form).entries());

  if (form.dataset.form === "worker") addWorker(formData);
  if (form.dataset.form === "job") addJob(formData);
  if (form.dataset.form === "entry") addEntry(formData);
  if (form.dataset.form === "proof") generateProof(formData);
  if (form.dataset.form === "bridge-config") saveBridgeConfigFromForm(formData);
  if (form.dataset.form === "bridge-worker") submitBridgeWorker(formData);
  if (form.dataset.form === "bridge-period") submitBridgePayPeriod(formData);
  if (form.dataset.form === "bridge-time") submitBridgeTimeEntry(formData);
}

function nextId(prefix, list, key) {
  return `${prefix}-${String(list.length + 1).padStart(4, "0")}`;
}


function saveBridgeConfigFromForm(formData) {
  saveBridgeConfig(formData);
  bridgeResult = { status: "success", data: { action: "saveBridgeConfig", message: "Bridge settings saved locally in this browser." } };
  render();
}

async function submitBridgeWorker(formData) {
  await runBridgeAction("submitWorkerIntake", {
    workerId: formData.workerId,
    workerName: formData.workerName,
    accessStatus: formData.accessStatus,
    roleTrade: formData.roleTrade,
    contact: formData.contact,
    notes: formData.notes,
  });
}

async function submitBridgePayPeriod(formData) {
  await runBridgeAction("submitPayPeriod", {
    payPeriodId: formData.payPeriodId,
    workerId: formData.workerId,
    workerName: formData.workerName,
    periodStart: formData.periodStart,
    periodEnd: formData.periodEnd,
    payDate: formData.payDate,
    notes: formData.notes,
  });
}

async function submitBridgeTimeEntry(formData) {
  await runBridgeAction("submitTimeEntry", {
    entryId: formData.entryId,
    workerId: formData.workerId,
    workerName: formData.workerName,
    payPeriodId: formData.payPeriodId,
    workDate: formData.workDate,
    jobWorkType: formData.jobWorkType,
    hoursWorked: Number(formData.hoursWorked),
    rate: Number(formData.rate),
    notes: formData.notes,
  });
}

async function runBridgeAction(action, payload = {}, options = {}) {
  if (!bridgeConfigured()) {
    bridgeResult = { status: "error", message: "Bridge not configured. Add the Apps Script Web App URL first." };
    if (!options.silentRender) render();
    return bridgeResult;
  }

  const body = {
    action,
    clientId: CLIENT_ID,
    payload,
  };
  if (options.includeToken !== false && bridgeConfig.token) {
    body.token = bridgeConfig.token;
  }

  try {
    const response = await fetch(bridgeConfig.url, {
      method: "POST",
      body: JSON.stringify(body),
      redirect: "follow",
    });
    const text = await response.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { status: "error", message: "Bridge returned a non-JSON response.", raw: text.slice(0, 500) };
    }
    bridgeResult = parsed;
  } catch (error) {
    bridgeResult = { status: "error", message: error.message || "Bridge request failed." };
  }

  if (!options.silentRender) render();
  return bridgeResult;
}

function addWorker(formData) {
  data.workers.push({
    worker_id: nextId("W", data.workers, "worker_id"),
    worker_name: formData.worker_name,
    worker_email: formData.worker_email,
    role: formData.role,
    access_status: "Active",
    created_at: new Date().toISOString().slice(0, 10),
    inactive_at: "",
  });
  saveData();
  render();
}

function addJob(formData) {
  data.jobs.push({
    job_id: nextId("J", data.jobs, "job_id"),
    job_name: formData.job_name,
    client_or_site: formData.client_or_site,
    status: formData.status,
    created_at: new Date().toISOString().slice(0, 10),
  });
  saveData();
  render();
}

function addEntry(formData) {
  if (!LedgerCore.canCreateEntryForWorker(data.workers, formData.worker_id)) {
    alert("Inactive workers cannot be used for new time entries.");
    return;
  }

  const job = getJob(formData.job_id);
  const hours = LedgerCore.calculateHours(formData.start_time, formData.end_time, formData.break_minutes);
  const matchingPeriod = LedgerCore.findPayPeriodForDate(data.payPeriods, formData.worker_id, formData.work_date);
  const finalizedNote =
    matchingPeriod && matchingPeriod.status !== "Open"
      ? `Correction/new entry added after ${matchingPeriod.status} period on ${new Date().toLocaleString()}.`
      : "";

  data.timeEntries.push({
    entry_id: nextId("T", data.timeEntries, "entry_id"),
    worker_id: formData.worker_id,
    job_id: formData.job_id,
    job_name: job?.job_name || formData.job_id,
    work_date: formData.work_date,
    start_time: formData.start_time,
    end_time: formData.end_time,
    break_minutes: Number(formData.break_minutes || 0),
    hours,
    rate: Number(formData.rate || 0),
    notes: formData.notes || "",
    submitted_at: new Date().toISOString(),
    approval_status: "Submitted",
    approved_at: "",
    correction_note: finalizedNote,
  });
  saveData();
  render();
}

function toggleWorker(workerId) {
  const worker = getWorker(workerId);
  if (!worker) return;
  if (worker.access_status === "Active") {
    worker.access_status = "Inactive";
    worker.inactive_at = new Date().toISOString().slice(0, 10);
  } else {
    worker.access_status = "Active";
    worker.inactive_at = "";
  }
  saveData();
  render();
}

function approveEntry(entryId) {
  const entry = data.timeEntries.find((item) => item.entry_id === entryId);
  if (!entry) return;
  entry.approval_status = "Approved";
  entry.approved_at = new Date().toISOString();

  const period = LedgerCore.findPayPeriodForDate(data.payPeriods, entry.worker_id, entry.work_date);
  if (period && period.status !== "Open") {
    entry.correction_note = `Approved after ${period.status} period on ${new Date().toLocaleString()}.`;
  }

  saveData();
  render();
}

function updatePayPeriod(periodId, status) {
  const period = data.payPeriods.find((item) => item.pay_period_id === periodId);
  if (!period) return;
  period.status = status;
  if (status === "Paid") {
    period.payment_status = "Paid";
    period.paid_at = new Date().toISOString();
    data.timeEntries.forEach((entry) => {
      const entries = LedgerCore.entriesForPayPeriod([entry], period);
      if (entries.length && entry.approval_status === "Approved") {
        entry.approval_status = "Paid";
      }
    });
  }
  saveData();
  render();
}

function updateProofPeriodOptions() {
  const workerId = document.querySelector("[data-role='proof-worker']").value;
  const periodSelect = document.querySelector("[data-role='proof-period']");
  periodSelect.innerHTML = data.payPeriods
    .filter((period) => period.worker_id === workerId)
    .map((period) => `<option value="${period.pay_period_id}">${period.period_start} to ${period.period_end}</option>`)
    .join("");
}

function generateProof(formData) {
  lastProof = LedgerCore.workerProof(data, formData.worker_id, formData.pay_period_id);
  data.proofExports.push({
    export_id: nextId("X", data.proofExports, "export_id"),
    worker_id: formData.worker_id,
    pay_period_id: formData.pay_period_id,
    export_type: "proof-view",
    created_at: lastProof.generated_at,
    export_hash_or_reference: "local-proof-view",
  });
  saveData();
  render();
}

function exportCurrentProof() {
  if (!lastProof) return;
  const csv = LedgerCore.proofToCsv(lastProof);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${lastProof.worker.worker_name.replace(/\s+/g, "-").toLowerCase()}-${lastProof.payPeriod.pay_period_id}-proof.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

render();
