const assert = require("node:assert/strict");
const LedgerCore = require("../src/ledger-core");

const data = {
  workers: [
    { worker_id: "W-1", worker_name: "Active Worker", access_status: "Active" },
    { worker_id: "W-2", worker_name: "Inactive Worker", access_status: "Inactive" },
  ],
  jobs: [{ job_id: "J-1", job_name: "Sample Site" }],
  timeEntries: [
    {
      entry_id: "T-1",
      worker_id: "W-1",
      job_id: "J-1",
      job_name: "Sample Site",
      work_date: "2026-06-01",
      start_time: "08:00",
      end_time: "16:30",
      break_minutes: 30,
      hours: 8,
      rate: 30,
      approval_status: "Approved",
      notes: "Approved active worker entry.",
    },
    {
      entry_id: "T-2",
      worker_id: "W-2",
      job_id: "J-1",
      job_name: "Sample Site",
      work_date: "2026-06-01",
      start_time: "09:00",
      end_time: "13:00",
      break_minutes: 0,
      hours: 4,
      rate: 25,
      approval_status: "Approved",
      notes: "Historical inactive worker entry.",
    },
  ],
  payPeriods: [
    {
      pay_period_id: "P-1",
      worker_id: "W-1",
      period_start: "2026-06-01",
      period_end: "2026-06-07",
      status: "Finalized",
      payment_status: "Unpaid",
      reimbursement_total: 10,
      deduction_total: 5,
    },
    {
      pay_period_id: "P-2",
      worker_id: "W-2",
      period_start: "2026-06-01",
      period_end: "2026-06-07",
      status: "Paid",
      payment_status: "Paid",
      reimbursement_total: 0,
      deduction_total: 0,
    },
  ],
};

assert.equal(LedgerCore.calculateHours("08:00", "16:30", 30), 8);
assert.equal(LedgerCore.canCreateEntryForWorker(data.workers, "W-1"), true);
assert.equal(LedgerCore.canCreateEntryForWorker(data.workers, "W-2"), false);

const summary = LedgerCore.summarizePayPeriod(data.timeEntries, data.payPeriods[0]);
assert.equal(summary.total_hours, 8);
assert.equal(summary.gross_pay, 240);
assert.equal(summary.net_pay, 245);

const activeProof = LedgerCore.workerProof(data, "W-1", "P-1", new Date("2026-06-10T12:00:00Z"));
assert.equal(activeProof.worker.worker_name, "Active Worker");
assert.equal(activeProof.entries.length, 1);
assert.equal(activeProof.entries[0].worker_id, "W-1");
assert.equal(activeProof.payPeriod.status, "Finalized");
assert.equal(activeProof.generated_at, "2026-06-10T12:00:00.000Z");

const inactiveProof = LedgerCore.workerProof(data, "W-2", "P-2", new Date("2026-06-10T12:05:00Z"));
assert.equal(inactiveProof.worker.access_status, "Inactive");
assert.equal(inactiveProof.entries.length, 1);
assert.equal(inactiveProof.entries[0].worker_id, "W-2");

const csv = LedgerCore.proofToCsv(activeProof);
assert.match(csv, /Active Worker/);
assert.match(csv, /Generated At/);
assert.doesNotMatch(csv, /Inactive Worker/);
assert.doesNotMatch(csv, /T-2/);

const dashboard = LedgerCore.dashboardSummary(data);
assert.equal(dashboard.active_workers, 1);
assert.equal(dashboard.inactive_workers, 1);
assert.equal(dashboard.pending_approvals, 0);

console.log("Acceptance tests passed");
