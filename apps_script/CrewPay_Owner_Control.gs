/**
 * CrewPay Owner Control Workbook
 *
 * Tim-only private control plane for client access, billing, bridge health,
 * feature flags, system health, calendar visibility, and support notes.
 * This workbook is control-plane only and must not store worker-private data.
 */

var OWNER_CONTROL = {
  NAME: 'CrewPay Owner Control Workbook',
  HEADER_ROW: 3,
  REQUIRED_TABS: [
    'Instructions',
    'Owner Dashboard',
    'Client Registry',
    'Client Access Control',
    'License Billing',
    'Bridge Registry',
    'Feature Flags',
    'System Health',
    'Calendar Visibility',
    'Support Notes',
    'Owner Audit Log',
    'Dropdown Lists',
    'Data Dictionary',
    'Apps Script Setup'
  ],
  LOG_TABS: {
    ACCESS: 'Client Access Control',
    BILLING: 'License Billing',
    BRIDGE: 'Bridge Registry',
    SUPPORT: 'Support Notes',
    AUDIT: 'Owner Audit Log'
  },
  FORBIDDEN_TABS: [
    'Workers',
    'Time Entries',
    'Worker Proof',
    'Pending Time Entries',
    'Pending Worker Intake',
    'Pending Pay Period Intake',
    'App Submission Log'
  ],
  WRITE_TARGETS: [
    'Client Access Control',
    'License Billing',
    'Bridge Registry',
    'System Health',
    'Support Notes',
    'Owner Audit Log'
  ]
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('CrewPay Owner Control')
    .addItem('Run Owner Control Self Check', 'runOwnerControlSelfCheck')
    .addSeparator()
    .addItem('Refresh Owner Dashboard', 'refreshOwnerDashboard')
    .addItem('Log Client Access Change', 'logClientAccessChange')
    .addItem('Log Billing Status Change', 'logBillingStatusChange')
    .addItem('Log Bridge Health Check', 'logBridgeHealthCheck')
    .addItem('Create Support Note', 'createSupportNote')
    .addSeparator()
    .addItem('About CrewPay Owner Control', 'aboutCrewPayOwnerControl')
    .addToUi();
}

function runOwnerControlSelfCheck() {
  var workbook = SpreadsheetApp.getActiveSpreadsheet();
  if (!workbook) {
    SpreadsheetApp.getUi().alert('No active spreadsheet is available.');
    return;
  }

  var validation = validateOwnerControlWorkbookStructure_(workbook, true);
  SpreadsheetApp.getUi().alert(
    validation.ok
      ? 'Owner Control Self Check passed. The active workbook appears to be the CrewPay Owner Control Workbook.'
      : 'Owner Control Self Check failed:\n\n' + validation.message
  );
}

function refreshOwnerDashboard() {
  var workbook = ensureOwnerControlWorkbook_();
  if (!workbook) return;
  SpreadsheetApp.flush();
  SpreadsheetApp.getUi().alert('Owner Dashboard refreshed. Formula cards recalculate automatically.');
}

function logClientAccessChange() {
  var workbook = ensureOwnerControlWorkbook_();
  if (!workbook) return;
  var ui = SpreadsheetApp.getUi();
  var clientId = promptRequiredText_(ui, 'Log Client Access Change', 'Client ID', 'CL-001');
  if (!clientId) return;
  var clientName = promptRequiredText_(ui, 'Log Client Access Change', 'Client Display Name', 'Demo Field Services');
  if (!clientName) return;
  var accessStatus = promptRequiredChoice_(ui, 'Log Client Access Change', 'Access Status', 'Enabled');
  if (!accessStatus) return;
  var reason = promptRequiredText_(ui, 'Log Client Access Change', 'Access Reason', 'Routine review');
  if (!reason) return;
  var actorAlias = promptRequiredText_(ui, 'Log Client Access Change', 'Actor Alias', 'Owner');
  if (!actorAlias) return;
  var notes = promptOptionalText_(ui, 'Log Client Access Change', 'Notes', 'Control-plane update');

  appendAccessRow_(workbook, {
    clientId: clientId,
    clientName: clientName,
    accessStatus: accessStatus,
    reason: reason,
    actorAlias: actorAlias,
    notes: notes
  });

  appendAuditRow_(workbook, {
    actorAlias: actorAlias,
    area: 'Client Access Control',
    clientId: clientId,
    action: 'Log Client Access Change',
    previousValue: 'Alias only',
    newValue: accessStatus,
    reason: reason,
    notes: notes
  });

  ui.alert('Client access change logged to the owner workbook.');
}

function logBillingStatusChange() {
  var workbook = ensureOwnerControlWorkbook_();
  if (!workbook) return;
  var ui = SpreadsheetApp.getUi();
  var clientId = promptRequiredText_(ui, 'Log Billing Status Change', 'Client ID', 'CL-001');
  if (!clientId) return;
  var planTier = promptRequiredChoice_(ui, 'Log Billing Status Change', 'Plan Tier', 'Standard');
  if (!planTier) return;
  var billingStatus = promptRequiredChoice_(ui, 'Log Billing Status Change', 'Billing Status', 'Current');
  if (!billingStatus) return;
  var billingPeriod = promptRequiredText_(ui, 'Log Billing Status Change', 'Billing Period', '2026-06');
  if (!billingPeriod) return;
  var actorAlias = promptRequiredText_(ui, 'Log Billing Status Change', 'Actor Alias', 'Owner');
  if (!actorAlias) return;
  var notes = promptOptionalText_(ui, 'Log Billing Status Change', 'Notes', 'Billing control-plane update');

  appendBillingRow_(workbook, {
    clientId: clientId,
    planTier: planTier,
    billingStatus: billingStatus,
    billingPeriod: billingPeriod,
    actorAlias: actorAlias,
    notes: notes
  });

  appendAuditRow_(workbook, {
    actorAlias: actorAlias,
    area: 'License Billing',
    clientId: clientId,
    action: 'Log Billing Status Change',
    previousValue: 'Current',
    newValue: billingStatus,
    reason: billingPeriod,
    notes: notes
  });

  ui.alert('Billing status change logged to the owner workbook.');
}

function logBridgeHealthCheck() {
  var workbook = ensureOwnerControlWorkbook_();
  if (!workbook) return;
  var ui = SpreadsheetApp.getUi();
  var clientId = promptRequiredText_(ui, 'Log Bridge Health Check', 'Client ID', 'CL-001');
  if (!clientId) return;
  var bridgeStatus = promptRequiredChoice_(ui, 'Log Bridge Health Check', 'Bridge Status', 'Healthy');
  if (!bridgeStatus) return;
  var endpointAlias = promptRequiredText_(ui, 'Log Bridge Health Check', 'Bridge Endpoint Alias', 'BRIDGE-ALIAS-DEMO-001');
  if (!endpointAlias) return;
  var tokenStatus = promptRequiredChoice_(ui, 'Log Bridge Health Check', 'Token Status', 'Active');
  if (!tokenStatus) return;
  var issueSeverity = promptRequiredChoice_(ui, 'Log Bridge Health Check', 'Issue Severity', 'None');
  if (!issueSeverity) return;
  var summary = promptRequiredText_(ui, 'Log Bridge Health Check', 'Issue Summary', 'Health check completed');
  if (!summary) return;
  var actorAlias = promptRequiredText_(ui, 'Log Bridge Health Check', 'Actor Alias', 'Owner');
  if (!actorAlias) return;
  var notes = promptOptionalText_(ui, 'Log Bridge Health Check', 'Notes', 'Alias only; no real token or endpoint stored');

  appendBridgeRow_(workbook, {
    clientId: clientId,
    bridgeStatus: bridgeStatus,
    endpointAlias: endpointAlias,
    tokenStatus: tokenStatus,
    issueSeverity: issueSeverity,
    summary: summary,
    actorAlias: actorAlias,
    notes: notes
  });

  appendSystemHealthRow_(workbook, {
    clientId: clientId,
    bridgeStatus: bridgeStatus,
    workerAppStatus: 'Healthy',
    calendarStatus: 'Enabled',
    backupStatus: 'Healthy',
    issueSeverity: issueSeverity,
    issueSummary: summary,
    ownerActionNeeded: issueSeverity === 'Blocker' ? 'Review bridge immediately' : 'No immediate action',
    actorAlias: actorAlias,
    notes: notes
  });

  appendAuditRow_(workbook, {
    actorAlias: actorAlias,
    area: 'Bridge Registry',
    clientId: clientId,
    action: 'Log Bridge Health Check',
    previousValue: 'Not Configured',
    newValue: bridgeStatus,
    reason: summary,
    notes: notes
  });

  ui.alert('Bridge health check logged to the owner workbook.');
}

function createSupportNote() {
  var workbook = ensureOwnerControlWorkbook_();
  if (!workbook) return;
  var ui = SpreadsheetApp.getUi();
  var clientId = promptRequiredText_(ui, 'Create Support Note', 'Client ID', 'CL-001');
  if (!clientId) return;
  var noteType = promptRequiredText_(ui, 'Create Support Note', 'Note Type', 'Bridge');
  if (!noteType) return;
  var priority = promptRequiredChoice_(ui, 'Create Support Note', 'Priority', 'Normal');
  if (!priority) return;
  var status = promptRequiredChoice_(ui, 'Create Support Note', 'Status', 'Open');
  if (!status) return;
  var summary = promptRequiredText_(ui, 'Create Support Note', 'Summary', 'Follow-up needed');
  if (!summary) return;
  var ownerAction = promptRequiredText_(ui, 'Create Support Note', 'Owner Next Action', 'Review the client record');
  if (!ownerAction) return;
  var actorAlias = promptRequiredText_(ui, 'Create Support Note', 'Actor Alias', 'Owner');
  if (!actorAlias) return;
  var notes = promptOptionalText_(ui, 'Create Support Note', 'Notes', 'Alias only support note');

  appendSupportRow_(workbook, {
    clientId: clientId,
    noteType: noteType,
    priority: priority,
    status: status,
    summary: summary,
    ownerAction: ownerAction,
    actorAlias: actorAlias,
    notes: notes
  });

  appendAuditRow_(workbook, {
    actorAlias: actorAlias,
    area: 'Support Notes',
    clientId: clientId,
    action: 'Create Support Note',
    previousValue: '',
    newValue: status,
    reason: noteType,
    notes: notes
  });

  ui.alert('Support note created in the owner workbook.');
}

function aboutCrewPayOwnerControl() {
  SpreadsheetApp.getUi().alert(
    'CrewPay Owner Control Workbook\n\n' +
      'This workbook is Tim-only control plane data for client access, licensing, bridge health, feature flags, calendar visibility, and support notes.\n\n' +
      'It does not store worker records, time entries, proof photos, payroll detail, or real bridge endpoints/tokens.'
  );
}

function ensureOwnerControlWorkbook_() {
  var workbook = SpreadsheetApp.getActiveSpreadsheet();
  if (!workbook) {
    SpreadsheetApp.getUi().alert('No active spreadsheet is available.');
    return null;
  }

  var validation = validateOwnerControlWorkbookStructure_(workbook, true);
  if (!validation.ok) {
    SpreadsheetApp.getUi().alert(validation.message);
    return null;
  }

  return workbook;
}

function validateOwnerControlWorkbookStructure_(workbook, includeWriteTargets) {
  var problems = [];

  OWNER_CONTROL.REQUIRED_TABS.forEach(function (sheetName) {
    if (!workbook.getSheetByName(sheetName)) {
      problems.push('Missing required owner-control sheet: ' + sheetName);
    }
  });

  OWNER_CONTROL.FORBIDDEN_TABS.forEach(function (sheetName) {
    if (workbook.getSheetByName(sheetName)) {
      problems.push('This workbook looks like the operational ledger workbook, not the owner control workbook. Found forbidden ledger tab: ' + sheetName);
    }
  });

  if (includeWriteTargets) {
    OWNER_CONTROL.WRITE_TARGETS.forEach(function (sheetName) {
      var sheet = workbook.getSheetByName(sheetName);
      if (!sheet) {
        problems.push('Missing write-target sheet: ' + sheetName);
        return;
      }
      var expectedHeaders = EXPECTED_HEADERS_BY_SHEET_[sheetName];
      var actualHeaders = sheet.getRange(OWNER_CONTROL.HEADER_ROW, 1, 1, expectedHeaders.length).getValues()[0].map(function (value) {
        return String(value || '').trim();
      });
      var headerMismatch = actualHeaders.length !== expectedHeaders.length || actualHeaders.some(function (value, index) {
        return value !== expectedHeaders[index];
      });
      if (headerMismatch) {
        problems.push('Missing or mismatched headers on ' + sheetName + '. Required headers must be present before writing.');
      }
    });
  }

  return {
    ok: problems.length === 0,
    message: problems.join('\n')
  };
}

var EXPECTED_HEADERS_BY_SHEET_ = {
  'Client Access Control': [
    'Access Record ID',
    'Client ID',
    'Client Display Name',
    'Access Status',
    'Access Start Date',
    'Access End Date',
    'Access Reason',
    'Disabled New Submissions',
    'Disabled Bridge',
    'Disabled Calendar Sync',
    'Last Access Review',
    'Reviewed By Alias',
    'Notes'
  ],
  'License Billing': [
    'License Record ID',
    'Client ID',
    'Plan Tier',
    'Billing Status',
    'Billing Period',
    'Renewal Date',
    'Allowed Worker Count',
    'Billing Worker Count',
    'Last Invoice Alias',
    'Payment Method Alias',
    'Grace Period Ends',
    'Billing Notes'
  ],
  'Bridge Registry': [
    'Bridge Record ID',
    'Client ID',
    'Bridge Status',
    'Bridge Endpoint Alias',
    'Token Status',
    'Token Last Rotated',
    'Token Rotation Due',
    'Last Health Check',
    'Last Successful Submit',
    'Last Failed Submit',
    'Pending Intake Count',
    'Last Error Summary',
    'Notes'
  ],
  'System Health': [
    'Health Record ID',
    'Client ID',
    'Check Date',
    'Ledger Status',
    'Bridge Status',
    'Worker App Status',
    'Calendar Status',
    'Backup Status',
    'Last Backup Alias',
    'Issue Severity',
    'Issue Summary',
    'Owner Action Needed',
    'Resolved Date',
    'Notes'
  ],
  'Support Notes': [
    'Support Note ID',
    'Client ID',
    'Note Date',
    'Note Type',
    'Priority',
    'Status',
    'Summary',
    'Owner Next Action',
    'Follow-up Date',
    'Resolved Date',
    'Notes'
  ],
  'Owner Audit Log': [
    'Audit ID',
    'Timestamp',
    'Actor Alias',
    'Area',
    'Client ID',
    'Action',
    'Previous Value',
    'New Value',
    'Reason',
    'Notes'
  ]
};

function appendAccessRow_(workbook, values) {
  appendByHeaders_(workbook, OWNER_CONTROL.LOG_TABS.ACCESS, {
    'Access Record ID': nextId_('AC'),
    'Client ID': values.clientId,
    'Client Display Name': values.clientName,
    'Access Status': values.accessStatus,
    'Access Start Date': '',
    'Access End Date': '',
    'Access Reason': values.reason,
    'Disabled New Submissions': 'FALSE',
    'Disabled Bridge': 'FALSE',
    'Disabled Calendar Sync': 'FALSE',
    'Last Access Review': new Date(),
    'Reviewed By Alias': values.actorAlias,
    'Notes': values.notes
  });
}

function appendBillingRow_(workbook, values) {
  appendByHeaders_(workbook, OWNER_CONTROL.LOG_TABS.BILLING, {
    'License Record ID': nextId_('LIC'),
    'Client ID': values.clientId,
    'Plan Tier': values.planTier,
    'Billing Status': values.billingStatus,
    'Billing Period': values.billingPeriod,
    'Renewal Date': '',
    'Allowed Worker Count': 0,
    'Billing Worker Count': 0,
    'Last Invoice Alias': 'INV-ALIAS-NEW',
    'Payment Method Alias': 'PM-ALIAS-NEW',
    'Grace Period Ends': '',
    'Billing Notes': values.notes
  });
}

function appendBridgeRow_(workbook, values) {
  appendByHeaders_(workbook, OWNER_CONTROL.LOG_TABS.BRIDGE, {
    'Bridge Record ID': nextId_('BR'),
    'Client ID': values.clientId,
    'Bridge Status': values.bridgeStatus,
    'Bridge Endpoint Alias': values.endpointAlias,
    'Token Status': values.tokenStatus,
    'Token Last Rotated': '',
    'Token Rotation Due': '',
    'Last Health Check': new Date(),
    'Last Successful Submit': '',
    'Last Failed Submit': '',
    'Pending Intake Count': 0,
    'Last Error Summary': values.summary,
    'Notes': values.notes
  });
}

function appendSystemHealthRow_(workbook, values) {
  appendByHeaders_(workbook, 'System Health', {
    'Health Record ID': nextId_('SH'),
    'Client ID': values.clientId,
    'Check Date': new Date(),
    'Ledger Status': 'Healthy',
    'Bridge Status': values.bridgeStatus,
    'Worker App Status': values.workerAppStatus,
    'Calendar Status': values.calendarStatus,
    'Backup Status': values.backupStatus,
    'Last Backup Alias': 'BACKUP-ALIAS-NEW',
    'Issue Severity': values.issueSeverity,
    'Issue Summary': values.issueSummary,
    'Owner Action Needed': values.ownerActionNeeded,
    'Resolved Date': '',
    'Notes': values.notes
  });
}

function appendSupportRow_(workbook, values) {
  appendByHeaders_(workbook, OWNER_CONTROL.LOG_TABS.SUPPORT, {
    'Support Note ID': nextId_('SN'),
    'Client ID': values.clientId,
    'Note Date': new Date(),
    'Note Type': values.noteType,
    'Priority': values.priority,
    'Status': values.status,
    'Summary': values.summary,
    'Owner Next Action': values.ownerAction,
    'Follow-up Date': '',
    'Resolved Date': '',
    'Notes': values.notes
  });
}

function appendAuditRow_(workbook, values) {
  appendByHeaders_(workbook, OWNER_CONTROL.LOG_TABS.AUDIT, {
    'Audit ID': nextId_('AU'),
    'Timestamp': new Date(),
    'Actor Alias': values.actorAlias || 'Owner',
    'Area': values.area,
    'Client ID': values.clientId,
    'Action': values.action,
    'Previous Value': values.previousValue,
    'New Value': values.newValue,
    'Reason': values.reason,
    'Notes': values.notes
  });
}

function appendByHeaders_(workbook, sheetName, valuesByHeader) {
  var sheet = workbook.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error('Missing required sheet: ' + sheetName);
  }

  var expectedHeaders = EXPECTED_HEADERS_BY_SHEET_[sheetName];
  if (expectedHeaders) {
    var actualHeaders = sheet.getRange(OWNER_CONTROL.HEADER_ROW, 1, 1, expectedHeaders.length).getValues()[0].map(function (value) {
      return String(value || '').trim();
    });
    var headerMismatch = actualHeaders.length !== expectedHeaders.length || actualHeaders.some(function (value, index) {
      return value !== expectedHeaders[index];
    });
    if (headerMismatch) {
      throw new Error('Missing or mismatched headers on ' + sheetName + '.');
    }
  }

  var headers = sheet.getRange(OWNER_CONTROL.HEADER_ROW, 1, 1, sheet.getLastColumn()).getValues()[0].map(function (value) {
    return String(value || '').trim();
  });

  var row = headers.map(function (header) {
    return Object.prototype.hasOwnProperty.call(valuesByHeader, header) ? valuesByHeader[header] : '';
  });
  sheet.appendRow(row);
}

function promptRequiredText_(ui, title, label, defaultValue) {
  return promptValue_(ui, title, label, defaultValue, true, null);
}

function promptOptionalText_(ui, title, label, defaultValue) {
  return promptValue_(ui, title, label, defaultValue, false, null);
}

function promptRequiredChoice_(ui, title, label, defaultValue) {
  var choice = promptValue_(ui, title, label, defaultValue, true, null);
  if (!choice) return '';
  return choice;
}

function promptValue_(ui, title, label, defaultValue, required, choices) {
  var response = ui.prompt(title, label + ' (default: ' + defaultValue + ')', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) {
    return '';
  }
  var text = String(response.getResponseText() || '').trim();
  if (!text) {
    text = String(defaultValue || '').trim();
  }
  if (required && !text) {
    ui.alert(label + ' is required.');
    return '';
  }
  return text;
}

function nextId_(prefix) {
  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMddHHmmss');
  var rand = Math.floor(Math.random() * 10000).toString();
  while (rand.length < 4) rand = '0' + rand;
  return prefix + '-' + stamp + '-' + rand;
}
