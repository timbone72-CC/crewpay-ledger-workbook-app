/**
 * CrewPay Ledger Admin App Bridge
 *
 * Bound Google Apps Script Web App endpoint for the static CrewPay Admin App.
 * The workbook remains the source of truth. This bridge writes only to pending
 * intake tabs and the App Submission Log.
 */

var CP_BRIDGE = {
  NAME: 'CrewPay Ledger Admin App Bridge',
  VERSION: 'bridge-2026-06-10-1',
  CLIENT_ID: 'crewpay-admin-app',
  TOKEN_PROPERTY: 'CP_BRIDGE_TOKEN',
  WRITE_TABS: {
    APP_LOG: 'App Submission Log',
    WORKER: 'Pending Worker Intake',
    PAY_PERIOD: 'Pending Pay Period Intake',
    TIME_ENTRY: 'Pending Time Entries'
  },
  READ_TABS: {
    SCHEMA: 'Bridge Schema'
  },
  ALLOWED_WRITE_TABS: [
    'App Submission Log',
    'Pending Worker Intake',
    'Pending Pay Period Intake',
    'Pending Time Entries'
  ],
  SUPPORTED_ACTIONS: [
    'healthCheck',
    'testWriteAccess',
    'getPendingSummary',
    'getWorkbookSchema',
    'submitWorkerIntake',
    'submitPayPeriod',
    'submitTimeEntry'
  ]
};


var CP_BRIDGE_REQUIRED_TABS = [
  {
    name: 'App Submission Log',
    headers: ['Log ID', 'Submitted At', 'Action', 'Submission Source', 'Status', 'Related Intake ID', 'Related Worker ID', 'Related Pay Period ID', 'Message', 'Raw Payload Summary', 'Handled By Script Version']
  },
  {
    name: 'Pending Worker Intake',
    headers: ['Intake ID', 'Submitted At', 'Submission Source', 'Submission Status', 'Worker ID', 'Worker Name', 'Access Status', 'Role / Trade', 'Contact', 'Notes', 'Reviewed At', 'Reviewed By', 'Review Notes']
  },
  {
    name: 'Pending Pay Period Intake',
    headers: ['Intake ID', 'Submitted At', 'Submission Source', 'Submission Status', 'Pay Period ID', 'Worker ID', 'Worker Name', 'Period Start', 'Period End', 'Pay Date', 'Notes', 'Reviewed At', 'Reviewed By', 'Review Notes']
  },
  {
    name: 'Pending Time Entries',
    headers: ['Intake ID', 'Submitted At', 'Submission Source', 'Submission Status', 'Entry ID', 'Worker ID', 'Worker Name', 'Pay Period ID', 'Work Date', 'Job / Work Type', 'Hours', 'Rate', 'Amount', 'Notes', 'Reviewed At', 'Reviewed By', 'Review Notes']
  },
  {
    name: 'Bridge Schema',
    headers: ['Action', 'Target Tab', 'Required Fields', 'Optional Fields', 'Success Response', 'Error Conditions', 'Notes']
  }
];

var CP_BRIDGE_SCHEMA_SEED_ROWS = [
  ['healthCheck', 'App Submission Log', 'action', 'clientId, payload', 'status success with bridge metadata', 'Bridge unavailable', 'GET does not write; POST may log health telemetry.'],
  ['testWriteAccess', 'App Submission Log', 'token, action', 'clientId, payload', 'status success after log row append', 'Missing token or missing log tab', 'Writes a permanent audit row.'],
  ['getPendingSummary', 'counts only', 'token, action', 'clientId', 'status success with pending counts', 'Missing token or missing pending tabs', 'Returns counts only, not row data.'],
  ['getWorkbookSchema', 'Bridge Schema', 'token, action', 'clientId', 'status success with safe schema', 'Missing token or missing schema tab', 'Cannot redirect writes into unsafe tabs.'],
  ['submitWorkerIntake', 'Pending Worker Intake', 'workerName, accessStatus, roleTrade, contact', 'workerId, notes', 'status success with submission ID', 'Validation failure or missing pending tab', 'Writes pending worker intake only.'],
  ['submitPayPeriod', 'Pending Pay Period Intake', 'payPeriodId, workerId, periodStart, periodEnd', 'workerName, payDate, notes', 'status success with submission ID', 'Validation failure or missing pending tab', 'Writes pending pay period only.'],
  ['submitTimeEntry', 'Pending Time Entries', 'workerId, payPeriodId, workDate, jobWorkType, hoursWorked, rate', 'entryId, workerName, notes', 'status success with submission ID', 'Validation failure or missing pending tab', 'Writes pending time entry only.']
];

function installCrewPayBridgeTabs() {
  var workbook = SpreadsheetApp.getActiveSpreadsheet();
  if (!workbook) {
    throw new Error('No active workbook is available. Run this bridge as a bound workbook script.');
  }

  var result = {
    workbookName: workbook.getName(),
    workbookUrl: workbook.getUrl(),
    createdTabs: [],
    verifiedTabs: [],
    missingFailedTabs: []
  };

  CP_BRIDGE_REQUIRED_TABS.forEach(function (definition) {
    try {
      var sheet = workbook.getSheetByName(definition.name);
      var created = false;
      if (!sheet) {
        sheet = workbook.insertSheet(definition.name);
        created = true;
        result.createdTabs.push(definition.name);
      }

      ensureBridgeHeaders_(sheet, definition.headers, created);
      formatBridgeSetupSheet_(sheet, definition.headers.length);
      if (definition.name === CP_BRIDGE.READ_TABS.SCHEMA) {
        seedBridgeSchemaIfEmpty_(sheet);
      }

      var missingHeaders = missingHeaders_(sheet, definition.headers);
      if (missingHeaders.length) {
        result.missingFailedTabs.push({ tab: definition.name, missingHeaders: missingHeaders });
      } else {
        result.verifiedTabs.push(definition.name);
      }
    } catch (err) {
      result.missingFailedTabs.push({ tab: definition.name, error: String(err && err.message ? err.message : err) });
    }
  });

  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

function debugCrewPayBridgeWorkbook() {
  var workbook = SpreadsheetApp.getActiveSpreadsheet();
  if (!workbook) {
    throw new Error('No active workbook is available. Run this bridge as a bound workbook script.');
  }

  var tabNames = workbook.getSheets().map(function (sheet) { return sheet.getName(); });
  var requiredStatus = CP_BRIDGE_REQUIRED_TABS.map(function (definition) {
    return {
      tab: definition.name,
      status: workbook.getSheetByName(definition.name) ? 'FOUND' : 'MISSING'
    };
  });
  var result = {
    workbookName: workbook.getName(),
    workbookUrl: workbook.getUrl(),
    tabNames: tabNames,
    requiredBridgeTabs: requiredStatus
  };

  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

function ensureBridgeHeaders_(sheet, requiredHeaders, wasCreated) {
  var existingLastColumn = sheet.getLastColumn();
  var existingHeaders = [];
  if (existingLastColumn > 0) {
    existingHeaders = sheet.getRange(1, 1, 1, existingLastColumn).getValues()[0]
      .map(function (value) { return String(value || '').trim(); });
  }
  var rowIsBlank = existingHeaders.join('').trim() === '';

  if (wasCreated || rowIsBlank) {
    sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
    return;
  }

  var present = {};
  existingHeaders.forEach(function (header) {
    if (header) present[header] = true;
  });
  var missing = requiredHeaders.filter(function (header) { return !present[header]; });
  if (missing.length) {
    sheet.getRange(1, existingLastColumn + 1, 1, missing.length).setValues([missing]);
  }
}

function formatBridgeSetupSheet_(sheet, headerCount) {
  sheet.setFrozenRows(1);
  if (headerCount > 0) {
    var range = sheet.getRange(1, 1, 1, headerCount);
    range.setFontWeight('bold');
    range.setBackground('#eaf1fb');
    range.setWrap(true);
  }
  try {
    sheet.autoResizeColumns(1, Math.max(headerCount, 1));
  } catch (ignored) {
    // Auto-resize is cosmetic only.
  }
}

function seedBridgeSchemaIfEmpty_(sheet) {
  if (sheet.getLastRow() > 1) return;
  sheet.getRange(2, 1, CP_BRIDGE_SCHEMA_SEED_ROWS.length, CP_BRIDGE_SCHEMA_SEED_ROWS[0].length)
    .setValues(CP_BRIDGE_SCHEMA_SEED_ROWS);
}

function missingHeaders_(sheet, requiredHeaders) {
  var existing = {};
  if (sheet.getLastColumn() > 0) {
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].forEach(function (value) {
      var header = String(value || '').trim();
      if (header) existing[header] = true;
    });
  }
  return requiredHeaders.filter(function (header) { return !existing[header]; });
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'healthCheck';
  if (action !== 'healthCheck') {
    return jsonResponse_(errorPayload_('GET supports healthCheck only. Use POST for bridge actions.'));
  }
  return jsonResponse_(successPayload_({
    action: 'healthCheck',
    message: 'Bridge is reachable.',
    bridgeStatus: 'OK',
    appName: CP_BRIDGE.NAME,
    scriptVersion: CP_BRIDGE.VERSION,
    timestamp: new Date().toISOString()
  }));
}

function doPost(e) {
  var request = null;
  var action = '';
  try {
    request = parseRequest_(e);
    action = trimString_(request.action || '');
    if (!action) {
      throw new BridgeUserError_('Missing action.');
    }
    if (CP_BRIDGE.SUPPORTED_ACTIONS.indexOf(action) === -1) {
      throw new BridgeUserError_('Unsupported action: ' + action);
    }
    return jsonResponse_(routeAction_(action, request, true));
  } catch (err) {
    logFailedRequestIfAuthorized_(request, action, safeErrorMessage_(err));
    return jsonResponse_(errorPayload_(safeErrorMessage_(err)));
  }
}

function routeAction_(action, request, isPost) {
  if (action === 'healthCheck') {
    if (isPost) {
      withScriptLock_(function () {
        appendLog_({
          action: 'healthCheck',
          status: 'OK',
          message: 'Health check received.',
          rawPayloadSummary: summarizePayload_(request.payload || {}),
          source: request.clientId || CP_BRIDGE.CLIENT_ID
        });
      });
    }
    return successPayload_({
      action: 'healthCheck',
      message: 'Bridge is reachable.',
      bridgeStatus: 'OK',
      appName: CP_BRIDGE.NAME,
      scriptVersion: CP_BRIDGE.VERSION,
      timestamp: new Date().toISOString()
    });
  }

  var tokenCheck = validateToken_(request.token);
  if (!tokenCheck.ok) {
    logUnauthorizedAttempt_(action, request, tokenCheck.message);
    throw new BridgeUserError_(tokenCheck.message);
  }

  if (action === 'getWorkbookSchema') {
    return successPayload_({
      action: action,
      message: 'Workbook bridge schema loaded.',
      supportedActions: getWorkbookSchema_(),
      writeRestrictions: {
        allowedWriteTabs: CP_BRIDGE.ALLOWED_WRITE_TABS.slice(),
        blockedAreas: ['Worker Proof', 'Dashboard', 'formula/report tabs', 'final ledger tabs']
      }
    });
  }

  if (action === 'getPendingSummary') {
    return successPayload_({
      action: action,
      message: 'Pending summary loaded.',
      summary: getPendingSummary_()
    });
  }

  return withScriptLock_(function () {
    if (action === 'testWriteAccess') {
      appendLog_({
        action: 'testWriteAccess',
        status: 'OK',
        message: 'Write access confirmed.',
        rawPayloadSummary: summarizePayload_(request.payload || {}),
        source: request.clientId || CP_BRIDGE.CLIENT_ID
      });
      return successPayload_({
        action: action,
        message: 'Write access confirmed.',
        targetTab: CP_BRIDGE.WRITE_TABS.APP_LOG
      });
    }

    if (action === 'submitWorkerIntake') {
      return submitWorkerIntake_(request);
    }
    if (action === 'submitPayPeriod') {
      return submitPayPeriod_(request);
    }
    if (action === 'submitTimeEntry') {
      return submitTimeEntry_(request);
    }

    throw new BridgeUserError_('Unsupported action: ' + action);
  });
}

function submitWorkerIntake_(request) {
  var payload = requirePayload_(request);
  var normalized = {
    workerId: optionalText_(payload.workerId || payload.worker_id),
    workerName: requiredText_(payload.workerName || payload.worker_name, 'workerName'),
    accessStatus: requiredAllowedText_(payload.accessStatus || payload.access_status, 'accessStatus', ['Active', 'Inactive']),
    roleTrade: requiredText_(payload.roleTrade || payload.role || payload.role_trade, 'roleTrade'),
    contact: requiredText_(payload.contact || payload.workerEmail || payload.worker_email, 'contact'),
    notes: optionalText_(payload.notes)
  };

  var intakeId = makeId_('PW');
  appendByHeaders_(CP_BRIDGE.WRITE_TABS.WORKER, {
    'Intake ID': intakeId,
    'Submitted At': new Date(),
    'Submission Source': request.clientId || CP_BRIDGE.CLIENT_ID,
    'Submission Status': 'Pending',
    'Worker ID': normalized.workerId,
    'Worker Name': normalized.workerName,
    'Access Status': normalized.accessStatus,
    'Role / Trade': normalized.roleTrade,
    'Contact': normalized.contact,
    'Notes': normalized.notes
  });
  appendLog_({
    action: 'submitWorkerIntake',
    status: 'Success',
    relatedIntakeId: intakeId,
    relatedWorkerId: normalized.workerId,
    message: 'Worker intake submitted to pending review.',
    rawPayloadSummary: summarizePayload_(payload),
    source: request.clientId || CP_BRIDGE.CLIENT_ID
  });
  return successPayload_({
    action: 'submitWorkerIntake',
    message: 'Worker intake submitted to Pending Worker Intake.',
    submissionId: intakeId,
    targetTab: CP_BRIDGE.WRITE_TABS.WORKER
  });
}

function submitPayPeriod_(request) {
  var payload = requirePayload_(request);
  var periodStart = requiredDate_(payload.periodStart || payload.startDate || payload.period_start, 'periodStart');
  var periodEnd = requiredDate_(payload.periodEnd || payload.endDate || payload.period_end, 'periodEnd');
  if (periodStart.value.getTime() > periodEnd.value.getTime()) {
    throw new BridgeUserError_('periodStart must be on or before periodEnd.');
  }
  var payDate = optionalDate_(payload.payDate || payload.pay_date, 'payDate');
  var normalized = {
    payPeriodId: requiredText_(payload.payPeriodId || payload.pay_period_id, 'payPeriodId'),
    workerId: requiredText_(payload.workerId || payload.worker_id, 'workerId'),
    workerName: optionalText_(payload.workerName || payload.worker_name),
    notes: optionalText_(payload.notes)
  };

  var intakeId = makeId_('PP');
  appendByHeaders_(CP_BRIDGE.WRITE_TABS.PAY_PERIOD, {
    'Intake ID': intakeId,
    'Submitted At': new Date(),
    'Submission Source': request.clientId || CP_BRIDGE.CLIENT_ID,
    'Submission Status': 'Pending',
    'Pay Period ID': normalized.payPeriodId,
    'Worker ID': normalized.workerId,
    'Worker Name': normalized.workerName,
    'Period Start': periodStart.text,
    'Period End': periodEnd.text,
    'Pay Date': payDate ? payDate.text : '',
    'Notes': normalized.notes
  });
  appendLog_({
    action: 'submitPayPeriod',
    status: 'Success',
    relatedIntakeId: intakeId,
    relatedWorkerId: normalized.workerId,
    relatedPayPeriodId: normalized.payPeriodId,
    message: 'Pay period intake submitted to pending review.',
    rawPayloadSummary: summarizePayload_(payload),
    source: request.clientId || CP_BRIDGE.CLIENT_ID
  });
  return successPayload_({
    action: 'submitPayPeriod',
    message: 'Pay period submitted to Pending Pay Period Intake.',
    submissionId: intakeId,
    targetTab: CP_BRIDGE.WRITE_TABS.PAY_PERIOD
  });
}

function submitTimeEntry_(request) {
  var payload = requirePayload_(request);
  var hours = requiredDecimal_(payload.hoursWorked || payload.hours || payload.hours_worked, 'hoursWorked');
  if (hours <= 0 || hours > 24) {
    throw new BridgeUserError_('hoursWorked must be greater than 0 and no more than 24.');
  }
  var rate = requiredDecimal_(payload.rate, 'rate');
  var workDate = requiredDate_(payload.workDate || payload.work_date, 'workDate');
  var normalized = {
    entryId: optionalText_(payload.entryId || payload.entry_id),
    workerId: requiredText_(payload.workerId || payload.worker_id, 'workerId'),
    workerName: optionalText_(payload.workerName || payload.worker_name),
    payPeriodId: requiredText_(payload.payPeriodId || payload.pay_period_id, 'payPeriodId'),
    jobWorkType: requiredText_(payload.jobWorkType || payload.job_work_type, 'jobWorkType'),
    notes: optionalText_(payload.notes)
  };

  var intakeId = makeId_('PT');
  appendByHeaders_(CP_BRIDGE.WRITE_TABS.TIME_ENTRY, {
    'Intake ID': intakeId,
    'Submitted At': new Date(),
    'Submission Source': request.clientId || CP_BRIDGE.CLIENT_ID,
    'Submission Status': 'Pending',
    'Entry ID': normalized.entryId,
    'Worker ID': normalized.workerId,
    'Worker Name': normalized.workerName,
    'Pay Period ID': normalized.payPeriodId,
    'Work Date': workDate.text,
    'Job / Work Type': normalized.jobWorkType,
    'Hours': hours,
    'Rate': rate,
    'Amount': hours * rate,
    'Notes': normalized.notes
  });
  appendLog_({
    action: 'submitTimeEntry',
    status: 'Success',
    relatedIntakeId: intakeId,
    relatedWorkerId: normalized.workerId,
    relatedPayPeriodId: normalized.payPeriodId,
    message: 'Time entry submitted to pending review.',
    rawPayloadSummary: summarizePayload_(payload),
    source: request.clientId || CP_BRIDGE.CLIENT_ID
  });
  return successPayload_({
    action: 'submitTimeEntry',
    message: 'Time entry submitted to Pending Time Entries.',
    submissionId: intakeId,
    targetTab: CP_BRIDGE.WRITE_TABS.TIME_ENTRY
  });
}

function getPendingSummary_() {
  return {
    workerIntakePending: countPending_(CP_BRIDGE.WRITE_TABS.WORKER),
    payPeriodIntakePending: countPending_(CP_BRIDGE.WRITE_TABS.PAY_PERIOD),
    timeEntriesPending: countPending_(CP_BRIDGE.WRITE_TABS.TIME_ENTRY)
  };
}

function countPending_(sheetName) {
  var sheet = getSheet_(sheetName);
  var headers = getHeaders_(sheet);
  var statusCol = headers.indexOf('Submission Status') + 1;
  if (!statusCol || sheet.getLastRow() < 2) return 0;
  var values = sheet.getRange(2, statusCol, sheet.getLastRow() - 1, 1).getValues();
  var count = 0;
  values.forEach(function (row) {
    if (String(row[0] || '').trim() === 'Pending') count += 1;
  });
  return count;
}

function getWorkbookSchema_() {
  var sheet = getSheet_(CP_BRIDGE.READ_TABS.SCHEMA);
  var rows = valuesByHeader_(sheet);
  var allowedTargets = CP_BRIDGE.ALLOWED_WRITE_TABS.concat([CP_BRIDGE.READ_TABS.SCHEMA, 'Bridge Schema / Dropdown Lists']);
  var schema = rows
    .filter(function (row) {
      return row.Action && CP_BRIDGE.SUPPORTED_ACTIONS.indexOf(String(row.Action)) !== -1;
    })
    .map(function (row) {
      var target = String(row['Target Tab'] || '');
      var safeTarget = allowedTargets.indexOf(target) !== -1 ? target : 'blocked by bridge routing';
      return {
        action: row.Action,
        targetTab: safeTarget,
        requiredFields: splitCsvText_(row['Required Fields']),
        optionalFields: splitCsvText_(row['Optional Fields']),
        notes: safeTextForOutput_(row.Notes || '')
      };
    });

  var found = {};
  schema.forEach(function (item) { found[item.action] = true; });
  safeServerSchema_().forEach(function (item) {
    if (!found[item.action]) schema.push(item);
  });
  return schema;
}

function safeServerSchema_() {
  return [
    {
      action: 'healthCheck',
      targetTab: CP_BRIDGE.WRITE_TABS.APP_LOG,
      requiredFields: ['action'],
      optionalFields: ['clientId', 'payload'],
      notes: 'Reachability check. GET does not write; POST may log health telemetry.'
    },
    {
      action: 'testWriteAccess',
      targetTab: CP_BRIDGE.WRITE_TABS.APP_LOG,
      requiredFields: ['token', 'action'],
      optionalFields: ['clientId', 'payload'],
      notes: 'Writes a permanent audit row to App Submission Log.'
    },
    {
      action: 'getPendingSummary',
      targetTab: 'counts only',
      requiredFields: ['token', 'action'],
      optionalFields: ['clientId'],
      notes: 'Returns unresolved pending counts only, not workbook row data.'
    },
    {
      action: 'getWorkbookSchema',
      targetTab: CP_BRIDGE.READ_TABS.SCHEMA,
      requiredFields: ['token', 'action'],
      optionalFields: ['clientId'],
      notes: 'Returns the safe bridge contract and hardcoded write restrictions.'
    },
    {
      action: 'submitWorkerIntake',
      targetTab: CP_BRIDGE.WRITE_TABS.WORKER,
      requiredFields: ['token', 'workerName', 'accessStatus', 'roleTrade', 'contact'],
      optionalFields: ['workerId', 'notes'],
      notes: 'Writes a Pending Worker Intake row and an App Submission Log row.'
    },
    {
      action: 'submitPayPeriod',
      targetTab: CP_BRIDGE.WRITE_TABS.PAY_PERIOD,
      requiredFields: ['token', 'payPeriodId', 'workerId', 'periodStart', 'periodEnd'],
      optionalFields: ['workerName', 'payDate', 'notes'],
      notes: 'Writes a Pending Pay Period Intake row and an App Submission Log row.'
    },
    {
      action: 'submitTimeEntry',
      targetTab: CP_BRIDGE.WRITE_TABS.TIME_ENTRY,
      requiredFields: ['token', 'workerId', 'payPeriodId', 'workDate', 'jobWorkType', 'hoursWorked', 'rate'],
      optionalFields: ['entryId', 'workerName', 'notes'],
      notes: 'Writes a Pending Time Entries row and an App Submission Log row.'
    }
  ];
}

function appendLog_(options) {
  appendByHeaders_(CP_BRIDGE.WRITE_TABS.APP_LOG, {
    'Log ID': makeId_('AL'),
    'Submitted At': new Date(),
    'Action': options.action || '',
    'Submission Source': options.source || CP_BRIDGE.CLIENT_ID,
    'Status': options.status || '',
    'Related Intake ID': options.relatedIntakeId || '',
    'Related Worker ID': options.relatedWorkerId || '',
    'Related Pay Period ID': options.relatedPayPeriodId || '',
    'Message': options.message || '',
    'Raw Payload Summary': options.rawPayloadSummary || '',
    'Handled By Script Version': CP_BRIDGE.VERSION
  });
}

function appendByHeaders_(sheetName, valuesByHeader) {
  assertAllowedWriteTab_(sheetName);
  var sheet = getSheet_(sheetName);
  var headers = getHeaders_(sheet);
  if (!headers.length) {
    throw new BridgeUserError_('Missing headers on sheet: ' + sheetName);
  }
  var row = headers.map(function (header) {
    return Object.prototype.hasOwnProperty.call(valuesByHeader, header) ? valuesByHeader[header] : '';
  });
  sheet.appendRow(row);
}

function valuesByHeader_(sheet) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return [];
  var headers = getHeaders_(sheet);
  var values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  return values.map(function (row) {
    var object = {};
    headers.forEach(function (header, index) {
      if (header) object[header] = row[index];
    });
    return object;
  });
}

function getHeaders_(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .map(function (value) { return String(value || '').trim(); })
    .filter(function (value) { return value !== ''; });
}

function getSheet_(sheetName) {
  var workbook = SpreadsheetApp.getActiveSpreadsheet();
  if (!workbook) {
    throw new BridgeUserError_('No active workbook is available. Install this bridge as a bound script.');
  }
  var sheet = workbook.getSheetByName(sheetName);
  if (!sheet) {
    throw new BridgeUserError_('Bridge setup incomplete. Missing required sheet: ' + sheetName + '. Run installCrewPayBridgeTabs from Apps Script, then deploy a new Web App version.');
  }
  return sheet;
}

function assertAllowedWriteTab_(sheetName) {
  if (CP_BRIDGE.ALLOWED_WRITE_TABS.indexOf(sheetName) === -1) {
    throw new BridgeUserError_('Bridge write blocked for sheet: ' + sheetName);
  }
}

function withScriptLock_(callback) {
  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    locked = lock.tryLock(5000);
    if (!locked) {
      throw new BridgeUserError_('Workbook is busy. Try again in a moment.');
    }
    return callback();
  } finally {
    if (locked) lock.releaseLock();
  }
}

function validateToken_(submittedToken) {
  var expected = PropertiesService.getScriptProperties().getProperty(CP_BRIDGE.TOKEN_PROPERTY);
  if (!expected) {
    return { ok: false, message: 'Bridge token is not configured. Set CP_BRIDGE_TOKEN in Script Properties.' };
  }
  if (!submittedToken || String(submittedToken) !== String(expected)) {
    return { ok: false, message: 'Unauthorized bridge request.' };
  }
  return { ok: true };
}

function logUnauthorizedAttempt_(action, request, message) {
  try {
    withScriptLock_(function () {
      appendLog_({
        action: action || 'unknown',
        status: 'Unauthorized',
        message: message,
        rawPayloadSummary: summarizePayload_(request && request.payload ? request.payload : {}),
        source: request && request.clientId ? request.clientId : 'unknown'
      });
    });
  } catch (ignored) {
    // Logging unauthorized attempts is best-effort only.
  }
}

function logFailedRequestIfAuthorized_(request, action, message) {
  if (!request || action === 'healthCheck') return;
  var tokenCheck = validateToken_(request.token);
  if (!tokenCheck.ok) return;
  try {
    withScriptLock_(function () {
      appendLog_({
        action: action || 'unknown',
        status: 'Error',
        message: message,
        rawPayloadSummary: summarizePayload_(request.payload || {}),
        source: request.clientId || CP_BRIDGE.CLIENT_ID
      });
    });
  } catch (ignored) {
    // Validation telemetry is best-effort only.
  }
}

function parseRequest_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new BridgeUserError_('Missing POST body.');
  }
  try {
    var parsed = JSON.parse(e.postData.contents);
    return {
      token: parsed.token || '',
      action: parsed.action || '',
      clientId: sanitizeText_(parsed.clientId || CP_BRIDGE.CLIENT_ID),
      payload: parsed.payload || {}
    };
  } catch (err) {
    throw new BridgeUserError_('Request body must be valid JSON.');
  }
}

function requirePayload_(request) {
  if (!request.payload || typeof request.payload !== 'object') {
    throw new BridgeUserError_('Missing payload object.');
  }
  return request.payload;
}

function requiredText_(value, fieldName) {
  var text = optionalText_(value);
  if (!text) throw new BridgeUserError_('Missing required field: ' + fieldName);
  return text;
}

function optionalText_(value) {
  if (value === null || value === undefined) return '';
  return sanitizeText_(String(value));
}

function requiredAllowedText_(value, fieldName, allowed) {
  var text = requiredText_(value, fieldName);
  if (allowed.indexOf(text) === -1) {
    throw new BridgeUserError_(fieldName + ' must be one of: ' + allowed.join(', '));
  }
  return text;
}

function sanitizeText_(value) {
  var text = trimString_(value);
  if (!text) return '';
  if (/^[=+\-@]/.test(text)) {
    return "'" + text;
  }
  return text;
}

function trimString_(value) {
  return String(value === null || value === undefined ? '' : value).trim();
}

function requiredDate_(value, fieldName) {
  var text = trimString_(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new BridgeUserError_(fieldName + ' must use YYYY-MM-DD format.');
  }
  var parts = text.split('-').map(Number);
  var date = new Date(parts[0], parts[1] - 1, parts[2]);
  if (date.getFullYear() !== parts[0] || date.getMonth() !== parts[1] - 1 || date.getDate() !== parts[2]) {
    throw new BridgeUserError_(fieldName + ' is not a valid date.');
  }
  return { text: text, value: date };
}

function optionalDate_(value, fieldName) {
  var text = trimString_(value);
  if (!text) return null;
  return requiredDate_(text, fieldName);
}

function requiredDecimal_(value, fieldName) {
  if (typeof value === 'string') {
    var text = value.trim();
    if (!/^-?\d+(\.\d+)?$/.test(text)) {
      throw new BridgeUserError_(fieldName + ' must be a numeric decimal without currency symbols or fractions.');
    }
    value = Number(text);
  }
  if (typeof value !== 'number' || !isFinite(value)) {
    throw new BridgeUserError_(fieldName + ' must be a numeric decimal.');
  }
  return Math.round(value * 100) / 100;
}

function summarizePayload_(payload) {
  var keys = Object.keys(payload || {}).filter(function (key) {
    return String(key).toLowerCase() !== 'token';
  });
  var summary = keys.slice(0, 12).map(function (key) {
    var value = payload[key];
    if (value === null || value === undefined) return key + ': blank';
    var text = String(value);
    if (text.length > 40) text = text.slice(0, 28) + ' [truncated]';
    return key + ': ' + sanitizeText_(text);
  }).join('; ');
  return summary || 'No payload fields.';
}

function splitCsvText_(value) {
  return String(value || '')
    .split(',')
    .map(function (item) { return item.trim(); })
    .filter(function (item) { return item; });
}

function safeTextForOutput_(value) {
  return String(value || '').replace(/[<>]/g, '');
}

function makeId_(prefix) {
  var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMddHHmmss');
  var random = Math.floor(Math.random() * 10000).toString();
  while (random.length < 4) random = '0' + random;
  return prefix + '-' + timestamp + '-' + random;
}

function successPayload_(data) {
  return { status: 'success', data: data };
}

function errorPayload_(message) {
  return { status: 'error', message: message };
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function safeErrorMessage_(err) {
  if (err && err.isBridgeUserError) return err.message;
  return 'Bridge request failed. Check setup and workbook tabs.';
}

function BridgeUserError_(message) {
  this.name = 'BridgeUserError';
  this.message = message;
  this.isBridgeUserError = true;
}
BridgeUserError_.prototype = Object.create(Error.prototype);
BridgeUserError_.prototype.constructor = BridgeUserError_;
