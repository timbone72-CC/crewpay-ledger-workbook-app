(function initLedgerCore(root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.LedgerCore = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function ledgerFactory() {
  const APPROVED_STATUSES = new Set(["Approved", "Paid"]);

  function toDate(value) {
    return new Date(`${value}T00:00:00`);
  }

  function money(value) {
    return Math.round(Number(value || 0) * 100) / 100;
  }

  function calculateHours(startTime, endTime, breakMinutes = 0) {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;
    return Math.max(0, (end - start - Number(breakMinutes || 0)) / 60);
  }

  function activeWorkers(workers) {
    return workers.filter((worker) => worker.access_status === "Active");
  }

  function findPayPeriodForDate(payPeriods, workerId, workDate) {
    const target = toDate(workDate).getTime();
    return payPeriods.find((period) => {
      if (period.worker_id !== workerId) return false;
      return toDate(period.period_start).getTime() <= target && target <= toDate(period.period_end).getTime();
    });
  }

  function entriesForPayPeriod(timeEntries, payPeriod) {
    const start = toDate(payPeriod.period_start).getTime();
    const end = toDate(payPeriod.period_end).getTime();
    return timeEntries.filter((entry) => {
      if (entry.worker_id !== payPeriod.worker_id) return false;
      const workDate = toDate(entry.work_date).getTime();
      return start <= workDate && workDate <= end;
    });
  }

  function summarizePayPeriod(timeEntries, payPeriod) {
    const entries = entriesForPayPeriod(timeEntries, payPeriod);
    const approvedEntries = entries.filter((entry) => APPROVED_STATUSES.has(entry.approval_status));
    const totalHours = approvedEntries.reduce((sum, entry) => sum + Number(entry.hours || 0), 0);
    const grossPay = approvedEntries.reduce(
      (sum, entry) => sum + Number(entry.hours || 0) * Number(entry.rate || 0),
      0,
    );
    const reimbursementTotal = money(payPeriod.reimbursement_total || 0);
    const deductionTotal = money(payPeriod.deduction_total || 0);
    const netPay = money(grossPay + reimbursementTotal - deductionTotal);

    return {
      entries,
      approvedEntries,
      total_hours: money(totalHours),
      gross_pay: money(grossPay),
      reimbursement_total: reimbursementTotal,
      deduction_total: deductionTotal,
      net_pay: netPay,
      payment_status: payPeriod.payment_status,
      period_status: payPeriod.status,
    };
  }

  function workerProof(data, workerId, payPeriodId, generatedAt = new Date()) {
    const worker = data.workers.find((item) => item.worker_id === workerId);
    const payPeriod = data.payPeriods.find((item) => item.pay_period_id === payPeriodId);
    if (!worker || !payPeriod || payPeriod.worker_id !== workerId) {
      throw new Error("Worker proof requires a matching worker and pay period.");
    }

    const summary = summarizePayPeriod(data.timeEntries, payPeriod);
    return {
      worker,
      payPeriod,
      generated_at: generatedAt.toISOString(),
      entries: summary.entries,
      totals: summary,
    };
  }

  function proofToCsv(proof) {
    const rows = [
      ["CrewPay Ledger Worker Proof"],
      ["Worker", proof.worker.worker_name],
      ["Date Range", `${proof.payPeriod.period_start} to ${proof.payPeriod.period_end}`],
      ["Payment Status", proof.payPeriod.payment_status],
      ["Period Status", proof.payPeriod.status],
      ["Generated At", proof.generated_at],
      [],
      ["Entry ID", "Work Date", "Job", "Hours", "Rate", "Gross", "Approval Status", "Notes"],
    ];

    proof.entries.forEach((entry) => {
      rows.push([
        entry.entry_id,
        entry.work_date,
        entry.job_name || entry.job_id,
        Number(entry.hours || 0).toFixed(2),
        Number(entry.rate || 0).toFixed(2),
        (Number(entry.hours || 0) * Number(entry.rate || 0)).toFixed(2),
        entry.approval_status,
        entry.notes || "",
      ]);
    });

    rows.push([]);
    rows.push(["Total Hours", proof.totals.total_hours.toFixed(2)]);
    rows.push(["Gross Pay", proof.totals.gross_pay.toFixed(2)]);
    rows.push(["Reimbursements", proof.totals.reimbursement_total.toFixed(2)]);
    rows.push(["Deductions", proof.totals.deduction_total.toFixed(2)]);
    rows.push(["Net Pay", proof.totals.net_pay.toFixed(2)]);

    return rows
      .map((row) =>
        row
          .map((cell) => {
            const text = String(cell ?? "");
            return `"${text.replace(/"/g, '""')}"`;
          })
          .join(","),
      )
      .join("\n");
  }

  function canCreateEntryForWorker(workers, workerId) {
    const worker = workers.find((item) => item.worker_id === workerId);
    return Boolean(worker && worker.access_status === "Active");
  }

  function dashboardSummary(data) {
    const pendingApprovals = data.timeEntries.filter((entry) => entry.approval_status === "Submitted").length;
    const currentPay = data.payPeriods.reduce((sum, period) => {
      if (period.status === "Paid") return sum;
      return sum + summarizePayPeriod(data.timeEntries, period).net_pay;
    }, 0);

    return {
      active_workers: activeWorkers(data.workers).length,
      pending_approvals: pendingApprovals,
      current_pay_total: money(currentPay),
      inactive_workers: data.workers.filter((worker) => worker.access_status === "Inactive").length,
    };
  }

  return {
    activeWorkers,
    calculateHours,
    canCreateEntryForWorker,
    dashboardSummary,
    entriesForPayPeriod,
    findPayPeriodForDate,
    proofToCsv,
    summarizePayPeriod,
    workerProof,
  };
});
