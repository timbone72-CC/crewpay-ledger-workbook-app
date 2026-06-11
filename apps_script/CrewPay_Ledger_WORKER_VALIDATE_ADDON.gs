/**
 * CrewPay Worker Time Entry Validation Add-on
 *
 * Adds a no-write worker-app validation action for the existing CrewPay bridge.
 * This file does not replace CrewPay_Ledger_BRIDGE.gs.
 *
 * Manual Apps Script setup:
 * 1. Add this file to the same bound Apps Script project as CrewPay_Ledger_BRIDGE.gs.
 * 2. Keep this file after CrewPay_Ledger_BRIDGE.gs in the Apps Script file list.
 * 3. Deploy a new Web App version.
 */

var CREWPAY_WORKER_VALIDATE_ACTION = 'validateTimeEntry';
var CREWPAY_ORIGINAL_ROUTE_ACTION_ = typeof routeAction_ === 'function' ? routeAction_ : null;

if (typeof CP_BRIDGE !== 'undefined' && CP_BRIDGE.SUPPORTED_ACTIONS.indexOf(CREWPAY_WORKER_VALIDATE_ACTION) === -1) {
  CP_BRIDGE.SUPPORTED_ACTIONS.push(CREWPAY_WORKER_VALIDATE_ACTION);
}

if (CREWPAY_ORIGINAL_ROUTE_ACTION_) {
  routeAction_ = function (action, request, isPost) {
    if (action === CREWPAY_WORKER_VALIDATE_ACTION) {
      return routeWorkerValidationAddon_(request);
    }
    return CREWPAY_ORIGINAL_ROUTE_ACTION_(action, request, isPost);
  };
}

function routeWorkerValidationAddon_(request) {
  var tokenCheck = validateToken_(request.token);
  if (!tokenCheck.ok) {
    logUnauthorizedAttempt_(CREWPAY_WORKER_VALIDATE_ACTION, request, tokenCheck.message);
    throw new BridgeUserError_(tokenCheck.message);
  }

  return validateTimeEntry_(request);
}

function installCrewPayWorkerValidationAddon() {
  if (typeof CP_BRIDGE === 'undefined') {
    throw new Error('CP_BRIDGE is not loaded. Add this file to the same Apps Script project as CrewPay_Ledger_BRIDGE.gs.');
  }

  if (CP_BRIDGE.SUPPORTED_ACTIONS.indexOf(CREWPAY_WORKER_VALIDATE_ACTION) === -1) {
    CP_BRIDGE.SUPPORTED_ACTIONS.push(CREWPAY_WORKER_VALIDATE_ACTION);
  }

  return {
    status: 'ready',
    action: CREWPAY_WORKER_VALIDATE_ACTION,
    message: 'Worker time entry validation action is available after deploying a new Web App version.'
  };
}

function validateTimeEntry_(request) {
  var payload = requirePayload_(request);
  var normalized = normalizeWorkerTimeEntryPayload_(payload);

  return successPayload_({
    action: CREWPAY_WORKER_VALIDATE_ACTION,
    message: 'Time entry payload is valid for Pending Time Entries.',
    previewOnly: true,
    targetTab: CP_BRIDGE.WRITE_TABS.TIME_ENTRY,
    normalized: normalized
  });
}

function normalizeWorkerTimeEntryPayload_(payload) {
  var hours = requiredDecimal_(payload.hoursWorked || payload.hours || payload.hours_worked, 'hoursWorked');
  if (hours <= 0 || hours > 24) {
    throw new BridgeUserError_('hoursWorked must be greater than 0 and no more than 24.');
  }

  var rate = requiredDecimal_(payload.rate, 'rate');
  var workDate = requiredDate_(payload.workDate || payload.work_date, 'workDate');

  return {
    entryId: optionalText_(payload.entryId || payload.entry_id),
    workerId: requiredText_(payload.workerId || payload.worker_id, 'workerId'),
    workerName: optionalText_(payload.workerName || payload.worker_name),
    payPeriodId: requiredText_(payload.payPeriodId || payload.pay_period_id, 'payPeriodId'),
    workDate: workDate.text,
    jobWorkType: requiredText_(payload.jobWorkType || payload.job_work_type, 'jobWorkType'),
    hoursWorked: hours,
    rate: rate,
    amount: Math.round(hours * rate * 100) / 100,
    notes: optionalText_(payload.notes)
  };
}
