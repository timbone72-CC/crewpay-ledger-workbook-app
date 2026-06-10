/**
 * CrewPay Ledger Level 1.5 Google service helpers.
 *
 * Workbook remains the source of truth. These helpers read/write workbook tabs,
 * create selected worker proof exports, send selected admin notices, and sync
 * selected schedule rows to Calendar. They do not add a backend, database,
 * worker accounts, app bridge, chat, payroll tax, or HR compliance logic.
 */

const SHEETS = Object.freeze({
  WORKER_PROOF: 'Worker Proof',
  WORKERS: 'Workers',
  PAY_PERIODS: 'Pay Periods',
  TIME_ENTRIES: 'Time Entries',
  PROOF_EXPORTS: 'Proof Exports',
  ACCESS_LOG: 'Access Log',
  CORRECTION_LOG: 'Correction Log',
  ADMIN_NOTICES: 'Admin Notices',
  SCHEDULE: 'Schedule',
  CALENDAR_SYNC_LOG: 'Calendar Sync Log',
});

const PROOF_CELLS = Object.freeze({
  WORKER_ID: 'B3',
  PAY_PERIOD_ID: 'B4',
  GENERATED_AT: 'B9',
  SELECTOR_CHECK: 'B10',
});

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('CrewPay Ledger')
    .addItem('Generate Worker Proof', 'generateWorkerProof')
    .addItem('Log Proof Export', 'logProofExport')
    .addItem('Export Worker Proof CSV', 'exportWorkerProofCsv')
    .addItem('Export Worker Proof PDF', 'exportWorkerProofPdf')
    .addItem('Send Selected Admin Notice', 'sendSelectedAdminNotice')
    .addItem('Sync Selected Schedule to Calendar', 'syncSelectedScheduleToCalendar')
    .addItem('Log Access Change', 'logAccessChange')
    .addItem('Log Correction', 'logCorrection')
    .addItem('Create Email-Ready Notice', 'createEmailReadyNotice')
    .addSeparator()
    .addItem('About CrewPay Ledger', 'aboutCrewPayLedger')
    .addToUi();
}

function generateWorkerProof() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const proofSheet = requireSheet_(ss, SHEETS.WORKER_PROOF);
  const workerId = String(proofSheet.getRange(PROOF_CELLS.WORKER_ID).getValue()).trim();
  const payPeriodId = String(proofSheet.getRange(PROOF_CELLS.PAY_PERIOD_ID).getValue()).trim();

  if (!workerId || !payPeriodId) {
    showAlert_('Select a Worker ID and Pay Period ID on Worker Proof before generating proof.');
    return;
  }

  const payPeriod = findRowByValue_(requireSheet_(ss, SHEETS.PAY_PERIODS), 'Pay Period ID', payPeriodId);
  if (!payPeriod) {
    showAlert_(`Pay Period ID not found: ${payPeriodId}`);
    return;
  }

  if (String(payPeriod.record['Worker ID']).trim() !== workerId) {
    proofSheet.getRange(PROOF_CELLS.SELECTOR_CHECK).setValue('CHECK SELECTION - pay period belongs to another worker');
    showAlert_('Worker Proof was not refreshed because the selected pay period belongs to another worker.');
    return;
  }

  proofSheet.getRange(PROOF_CELLS.GENERATED_AT).setValue(new Date());
  proofSheet.getRange(PROOF_CELLS.SELECTOR_CHECK).setValue('OK - worker/pay period match');
  SpreadsheetApp.flush();
  showAlert_('Worker Proof refreshed for the selected worker and pay period only.');
}

function logProofExport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const proofSheet = requireSheet_(ss, SHEETS.WORKER_PROOF);
  const workerId = String(proofSheet.getRange(PROOF_CELLS.WORKER_ID).getValue()).trim();
  const payPeriodId = String(proofSheet.getRange(PROOF_CELLS.PAY_PERIOD_ID).getValue()).trim();

  assertWorkerPayPeriodMatch_(ss, workerId, payPeriodId);

  const worker = findRowByValue_(requireSheet_(ss, SHEETS.WORKERS), 'Worker ID', workerId);
  const exportType = promptRequired_('Log Proof Export', 'Export Type (Print, PDF, or CSV):', 'Print');
  const exportReference = promptRequired_('Log Proof Export', 'Export Reference:', 'Manual workbook proof');
  const notes = promptOptional_('Log Proof Export', 'Notes:', 'Worker-specific proof only.');

  logProofExportRecord_(ss, workerId, worker.record['Worker Name'], payPeriodId, exportType, exportReference, notes);

  showAlert_('Proof export logged for the selected worker only.');
}

function exportWorkerProofCsv() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const context = getSelectedProofContext_(ss);
  const csv = buildWorkerProofCsv_(ss, context);
  const fileName = proofFileName_(context, 'csv');
  const file = DriveApp.createFile(fileName, csv, MimeType.CSV);

  logProofExportRecord_(
    ss,
    context.workerId,
    context.workerName,
    context.payPeriodId,
    'CSV',
    file.getUrl(),
    'CSV proof export created for selected worker/pay period only.'
  );

  showCsvCopyDialog_(csv, file.getUrl(), fileName);
}

function exportWorkerProofPdf() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const context = getSelectedProofContext_(ss);
  generateWorkerProof();
  SpreadsheetApp.flush();

  const proofSheet = requireSheet_(ss, SHEETS.WORKER_PROOF);
  const url = buildProofPdfExportUrl_(ss, proofSheet);
  const response = UrlFetchApp.fetch(url, {
    headers: { Authorization: `Bearer ${ScriptApp.getOAuthToken()}` },
    muteHttpExceptions: true,
  });

  if (response.getResponseCode() >= 300) {
    throwFriendly_(`PDF export failed with status ${response.getResponseCode()}.`);
  }

  const fileName = proofFileName_(context, 'pdf');
  const file = DriveApp.createFile(response.getBlob().setName(fileName));

  logProofExportRecord_(
    ss,
    context.workerId,
    context.workerName,
    context.payPeriodId,
    'PDF',
    file.getUrl(),
    'PDF proof export created from Worker Proof print area only.'
  );

  showAlert_(`Worker-specific PDF proof created:\n${file.getUrl()}`);
}

function sendSelectedAdminNotice() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = requireSheet_(ss, SHEETS.ADMIN_NOTICES);
  const active = sheet.getActiveRange();
  const rowNumber = active ? active.getRow() : 0;
  if (rowNumber < 2) throwFriendly_('Select one Admin Notices row before sending.');

  const record = recordFromRow_(sheet, rowNumber);
  const recipientType = String(record['Recipient Type'] || '').trim();
  const subject = String(record.Subject || '').trim();
  const message = String(record.Message || '').trim();
  if (!subject || !message) throwFriendly_('Selected notice needs both Subject and Message.');

  const recipients = noticeRecipients_(ss, record, recipientType);
  if (!recipients.length) throwFriendly_('No active recipient email found for the selected notice.');

  const body = buildNoticeBody_(record);
  GmailApp.sendEmail(recipients.join(','), subject, body);

  const headers = headerMap_(sheet);
  if (headers['Delivery Method']) sheet.getRange(rowNumber, headers['Delivery Method']).setValue('Gmail Sent');
  if (headers['Notice Status']) sheet.getRange(rowNumber, headers['Notice Status']).setValue('Sent');
  if (headers['Sent At']) sheet.getRange(rowNumber, headers['Sent At']).setValue(new Date());
  if (headers.Notes) {
    appendCellNote_(sheet, rowNumber, headers.Notes, `Sent by ${currentUser_()} to ${recipients.length} recipient(s). One-way admin notice only.`);
  }

  showAlert_(`Admin notice sent to ${recipients.length} recipient(s).`);
}

function syncSelectedScheduleToCalendar() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const scheduleSheet = requireSheet_(ss, SHEETS.SCHEDULE);
  const active = scheduleSheet.getActiveRange();
  const rowNumber = active ? active.getRow() : 0;
  if (rowNumber < 2) throwFriendly_('Select one Schedule row before syncing to Calendar.');

  const record = recordFromRow_(scheduleSheet, rowNumber);
  const scheduleId = String(record['Schedule ID'] || '').trim();
  const jobName = String(record['Job Name'] || '').trim();
  const workerName = String(record['Worker Name'] || '').trim();
  const scheduledDate = record['Scheduled Date'];
  if (!scheduleId || !jobName || !scheduledDate) throwFriendly_('Selected Schedule row needs Schedule ID, Job Name, and Scheduled Date.');

  const start = combineDateAndTime_(scheduledDate, record['Start Time']);
  const end = combineDateAndTime_(scheduledDate, record['End Time']);
  if (end <= start) end.setTime(start.getTime() + 60 * 60 * 1000);

  const title = `CrewPay Schedule: ${jobName}${workerName ? ' - ' + workerName : ''}`;
  const description = [
    `Schedule ID: ${scheduleId}`,
    `Job ID: ${record['Job ID'] || ''}`,
    `Worker ID: ${record['Worker ID'] || ''}`,
    '',
    'Calendar is schedule reference only. Time Entries and Pay Periods remain proof.',
    record.Notes ? `Notes: ${record.Notes}` : '',
  ].filter(Boolean).join('\n');

  const calendar = CalendarApp.getDefaultCalendar();
  let event;
  const existingId = String(record['Calendar Event ID'] || '').trim();
  if (existingId) {
    event = CalendarApp.getEventById(existingId);
  }
  if (event) {
    event.setTitle(title);
    event.setTime(start, end);
    event.setDescription(description);
  } else {
    event = calendar.createEvent(title, start, end, { description });
  }

  const headers = headerMap_(scheduleSheet);
  if (headers['Calendar Event ID']) scheduleSheet.getRange(rowNumber, headers['Calendar Event ID']).setValue(event.getId());
  if (headers['Schedule Status']) scheduleSheet.getRange(rowNumber, headers['Schedule Status']).setValue('Scheduled');

  appendCalendarSyncLog_(ss, record, event.getId(), 'Synced', 'Selected schedule row synced. Calendar is not proof.');
  showAlert_('Selected schedule row synced to Google Calendar as planning/reference only.');
}

function logAccessChange() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const workersSheet = requireSheet_(ss, SHEETS.WORKERS);
  const workerId = promptRequired_('Log Access Change', 'Worker ID:', '');
  const worker = findRowByValue_(workersSheet, 'Worker ID', workerId);
  if (!worker) throwFriendly_(`Worker ID not found: ${workerId}`);

  const previousStatus = String(worker.record['Access Status'] || '').trim();
  const newStatus = promptRequired_('Log Access Change', 'New Status (Active or Inactive):', previousStatus);
  const reason = promptRequired_('Log Access Change', 'Reason:', 'Manual access status update');

  appendRecord_(requireSheet_(ss, SHEETS.ACCESS_LOG), {
    'Log ID': nextId_('A', requireSheet_(ss, SHEETS.ACCESS_LOG), 'Log ID'),
    'Worker ID': workerId,
    'Worker Name': worker.record['Worker Name'],
    'Previous Status': previousStatus,
    'New Status': newStatus,
    'Changed At': new Date(),
    'Changed By': currentUser_(),
    'Reason': reason,
  });

  const headers = headerMap_(workersSheet);
  workersSheet.getRange(worker.rowNumber, headers['Access Status']).setValue(newStatus);
  if (newStatus === 'Inactive' && headers['Inactive At']) {
    workersSheet.getRange(worker.rowNumber, headers['Inactive At']).setValue(new Date());
  }

  showAlert_('Access change logged. Historical records and worker proof remain in the workbook.');
}

function logCorrection() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const entryId = promptRequired_('Log Correction', 'Entry ID:', '');
  const entry = findRowByValue_(requireSheet_(ss, SHEETS.TIME_ENTRIES), 'Entry ID', entryId);
  if (!entry) throwFriendly_(`Entry ID not found: ${entryId}`);

  const payPeriodId = promptRequired_('Log Correction', 'Related Pay Period ID:', '');
  const reason = promptRequired_('Log Correction', 'Correction Reason:', '');
  const originalSummary = promptRequired_('Log Correction', 'Original Value Summary:', '');
  const newSummary = promptRequired_('Log Correction', 'New Value Summary:', '');
  const notes = promptOptional_('Log Correction', 'Notes:', 'Correction logged before changing proof records.');

  appendRecord_(requireSheet_(ss, SHEETS.CORRECTION_LOG), {
    'Correction ID': nextId_('C', requireSheet_(ss, SHEETS.CORRECTION_LOG), 'Correction ID'),
    'Entry ID': entryId,
    'Worker ID': entry.record['Worker ID'],
    'Worker Name': entry.record['Worker Name'],
    'Pay Period ID': payPeriodId,
    'Correction Date': new Date(),
    'Corrected By': currentUser_(),
    'Correction Reason': reason,
    'Original Value Summary': originalSummary,
    'New Value Summary': newSummary,
    'Notes': notes,
  });

  showAlert_('Correction logged. Make any workbook edit visibly, with this correction record retained.');
}

function createEmailReadyNotice() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = requireSheet_(ss, SHEETS.ADMIN_NOTICES);
  const active = sheet.getActiveRange();
  const rowNumber = active ? active.getRow() : 0;
  if (rowNumber < 2) {
    showAlert_('Select a notice row on Admin Notices before creating email-ready text.');
    return;
  }

  const record = recordFromRow_(sheet, rowNumber);
  const workerContext = record['Worker Name'] ? `Worker: ${record['Worker Name']}\n` : '';
  const payPeriodContext = record['Related Pay Period ID'] ? `Pay Period: ${record['Related Pay Period ID']}\n` : '';
  const noticeText = [
    `Subject: ${record.Subject || ''}`,
    '',
    workerContext + payPeriodContext + String(record.Message || ''),
    '',
    'Note: This is email-ready text only. This helper does not send email.',
  ].join('\n');

  const headers = headerMap_(sheet);
  if (headers['Delivery Method']) sheet.getRange(rowNumber, headers['Delivery Method']).setValue('Email Ready');
  if (headers['Notice Status']) sheet.getRange(rowNumber, headers['Notice Status']).setValue('Posted');
  if (headers.Notes) {
    const prior = String(sheet.getRange(rowNumber, headers.Notes).getValue() || '');
    sheet.getRange(rowNumber, headers.Notes).setValue(`${prior ? prior + '\n\n' : ''}${noticeText}`);
  }

  showAlert_(noticeText);
}

function aboutCrewPayLedger() {
  showAlert_(
    'CrewPay Ledger helpers refresh proof, export selected proof, send selected admin notices, and sync selected schedule rows. ' +
      'The workbook remains the source of truth. No backend, database, worker accounts, chat, payroll tax, HR compliance, or app bridge is included.'
  );
}

function getSelectedProofContext_(ss) {
  const proofSheet = requireSheet_(ss, SHEETS.WORKER_PROOF);
  const workerId = String(proofSheet.getRange(PROOF_CELLS.WORKER_ID).getValue()).trim();
  const payPeriodId = String(proofSheet.getRange(PROOF_CELLS.PAY_PERIOD_ID).getValue()).trim();
  const { worker, payPeriod } = assertWorkerPayPeriodMatch_(ss, workerId, payPeriodId);
  const selectorCheck = String(proofSheet.getRange(PROOF_CELLS.SELECTOR_CHECK).getDisplayValue()).trim();
  if (selectorCheck && selectorCheck !== 'OK - worker/pay period match') {
    throwFriendly_('Worker Proof selector check is not OK. Refresh proof before export.');
  }
  return {
    workerId,
    workerName: String(worker.record['Worker Name'] || '').trim(),
    workerStatus: String(worker.record['Access Status'] || '').trim(),
    payPeriodId,
    paymentStatus: String(payPeriod.record['Payment Status'] || '').trim(),
    periodStart: payPeriod.record['Period Start'],
    periodEnd: payPeriod.record['Period End'],
    proofSheet,
  };
}

function buildWorkerProofCsv_(ss, context) {
  const timeSheet = requireSheet_(ss, SHEETS.TIME_ENTRIES);
  const headers = headerMap_(timeSheet);
  const required = ['Entry ID', 'Worker ID', 'Worker Name', 'Job ID', 'Job Name', 'Work Date', 'Hours', 'Rate', 'Gross Pay', 'Reimbursement', 'Deduction', 'Net Pay', 'Approval Status', 'Correction Note', 'Notes'];
  required.forEach((header) => {
    if (!headers[header]) throwFriendly_(`Required Time Entries header missing: ${header}`);
  });

  const rows = [
    ['CrewPay Ledger Worker Proof CSV'],
    ['Worker ID', context.workerId],
    ['Worker Name', context.workerName],
    ['Worker Status', context.workerStatus],
    ['Pay Period ID', context.payPeriodId],
    ['Period Start', formatForCsv_(context.periodStart)],
    ['Period End', formatForCsv_(context.periodEnd)],
    ['Payment Status', context.paymentStatus],
    ['Generated At', formatForCsv_(new Date())],
    [],
    required,
  ];

  const lastRow = timeSheet.getLastRow();
  if (lastRow >= 2) {
    const values = timeSheet.getRange(2, 1, lastRow - 1, timeSheet.getLastColumn()).getValues();
    values.forEach((row) => {
      const workerId = String(row[headers['Worker ID'] - 1]).trim();
      const workDate = row[headers['Work Date'] - 1];
      if (workerId !== context.workerId || !isDateWithin_(workDate, context.periodStart, context.periodEnd)) return;
      rows.push(required.map((header) => formatForCsv_(row[headers[header] - 1])));
    });
  }

  rows.push([]);
  rows.push(['Total Hours', formatForCsv_(context.proofSheet.getRange('B30').getValue())]);
  rows.push(['Gross Pay', formatForCsv_(context.proofSheet.getRange('B31').getValue())]);
  rows.push(['Reimbursements', formatForCsv_(context.proofSheet.getRange('B32').getValue())]);
  rows.push(['Deductions', formatForCsv_(context.proofSheet.getRange('B33').getValue())]);
  rows.push(['Net Pay', formatForCsv_(context.proofSheet.getRange('B34').getValue())]);

  return rows.map((row) => row.map(csvEscape_).join(',')).join('\n');
}

function showCsvCopyDialog_(csv, fileUrl, fileName) {
  const html = HtmlService.createHtmlOutput(
    '<p><strong>CSV proof export created.</strong></p>' +
      `<p><a href="${htmlEscape_(fileUrl)}" target="_blank" rel="noopener">Open saved CSV file</a></p>` +
      `<p>File: ${htmlEscape_(fileName)}</p>` +
      `<textarea style="width:100%;height:320px;font-family:monospace;">${htmlEscape_(csv)}</textarea>`
  ).setWidth(720).setHeight(480);
  SpreadsheetApp.getUi().showModalDialog(html, 'Worker Proof CSV');
}

function buildProofPdfExportUrl_(ss, proofSheet) {
  const base = ss.getUrl().split('/edit')[0] + '/';
  const params = {
    format: 'pdf',
    gid: proofSheet.getSheetId(),
    range: 'A1:M34',
    portrait: 'false',
    size: 'letter',
    fitw: 'true',
    sheetnames: 'false',
    printtitle: 'false',
    pagenumbers: 'false',
    gridlines: 'false',
    fzr: 'false',
  };
  const query = Object.keys(params).map((key) => `${key}=${encodeURIComponent(params[key])}`).join('&');
  return `${base}export?${query}`;
}

function logProofExportRecord_(ss, workerId, workerName, payPeriodId, exportType, exportReference, notes) {
  const sheet = requireSheet_(ss, SHEETS.PROOF_EXPORTS);
  appendRecord_(sheet, {
    'Export ID': nextId_('X', sheet, 'Export ID'),
    'Worker ID': workerId,
    'Worker Name': workerName,
    'Pay Period ID': payPeriodId,
    'Export Type': exportType,
    'Generated At': new Date(),
    'Generated By': currentUser_(),
    'Export Reference': exportReference,
    'Notes': notes,
  });
}

function noticeRecipients_(ss, notice, recipientType) {
  const workersSheet = requireSheet_(ss, SHEETS.WORKERS);
  const headers = headerMap_(workersSheet);
  ['Worker ID', 'Worker Email', 'Access Status'].forEach((header) => {
    if (!headers[header]) throwFriendly_(`Required Workers header missing: ${header}`);
  });
  const recipients = [];
  const lastRow = workersSheet.getLastRow();
  if (lastRow < 2) return recipients;
  const rows = workersSheet.getRange(2, 1, lastRow - 1, workersSheet.getLastColumn()).getValues();
  rows.forEach((row) => {
    const workerId = String(row[headers['Worker ID'] - 1]).trim();
    const email = String(row[headers['Worker Email'] - 1]).trim();
    const status = String(row[headers['Access Status'] - 1]).trim();
    if (!email) return;
    if (recipientType === 'Worker' && workerId === String(notice['Worker ID'] || '').trim()) recipients.push(email);
    if (recipientType === 'All Active Workers' && status === 'Active') recipients.push(email);
  });
  return recipients;
}

function buildNoticeBody_(record) {
  return [
    record['Worker Name'] ? `Worker: ${record['Worker Name']}` : '',
    record['Related Pay Period ID'] ? `Pay Period: ${record['Related Pay Period ID']}` : '',
    '',
    String(record.Message || ''),
    '',
    'This is a one-way CrewPay Ledger admin notice. The workbook remains the source of truth.',
  ].filter((line, index) => line || index === 2).join('\n');
}

function appendCalendarSyncLog_(ss, schedule, eventId, syncStatus, notes) {
  const sheet = requireSheet_(ss, SHEETS.CALENDAR_SYNC_LOG);
  appendRecord_(sheet, {
    'Calendar Log ID': nextId_('G', sheet, 'Calendar Log ID'),
    'Job ID': schedule['Job ID'],
    'Job Name': schedule['Job Name'],
    'Worker ID': schedule['Worker ID'],
    'Worker Name': schedule['Worker Name'],
    'Calendar Event ID': eventId,
    'Event Date': schedule['Scheduled Date'],
    'Sync Status': syncStatus,
    'Last Synced At': new Date(),
    'Notes': notes,
  });
}

function proofFileName_(context, extension) {
  const safeWorker = String(context.workerName || context.workerId).replace(/[^A-Za-z0-9_-]+/g, '_');
  return `CrewPay_Proof_${safeWorker}_${context.payPeriodId}.${extension}`;
}

function combineDateAndTime_(dateValue, timeValue) {
  const date = new Date(dateValue);
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0, 0);
  if (timeValue instanceof Date) {
    result.setHours(timeValue.getHours(), timeValue.getMinutes(), 0, 0);
  }
  return result;
}

function isDateWithin_(dateValue, startValue, endValue) {
  const date = dateOnly_(dateValue);
  return date >= dateOnly_(startValue) && date <= dateOnly_(endValue);
}

function dateOnly_(value) {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function formatForCsv_(value) {
  if (value instanceof Date) return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
  return value == null ? '' : value;
}

function csvEscape_(value) {
  const text = String(value == null ? '' : value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function htmlEscape_(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function appendCellNote_(sheet, rowNumber, columnNumber, text) {
  const prior = String(sheet.getRange(rowNumber, columnNumber).getValue() || '');
  sheet.getRange(rowNumber, columnNumber).setValue(`${prior ? prior + '\n\n' : ''}${text}`);
}

function requireSheet_(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) throwFriendly_(`Required sheet missing: ${name}`);
  return sheet;
}

function headerMap_(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = {};
  headers.forEach((header, index) => {
    if (header) map[String(header).trim()] = index + 1;
  });
  return map;
}

function recordFromRow_(sheet, rowNumber) {
  const headers = headerMap_(sheet);
  const values = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];
  const record = {};
  Object.keys(headers).forEach((header) => {
    record[header] = values[headers[header] - 1];
  });
  return record;
}

function findRowByValue_(sheet, headerName, value) {
  const headers = headerMap_(sheet);
  if (!headers[headerName]) throwFriendly_(`Required header missing on ${sheet.getName()}: ${headerName}`);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  const values = sheet.getRange(2, headers[headerName], lastRow - 1, 1).getValues();
  const needle = String(value).trim();
  for (let i = 0; i < values.length; i += 1) {
    if (String(values[i][0]).trim() === needle) {
      const rowNumber = i + 2;
      return { rowNumber, record: recordFromRow_(sheet, rowNumber) };
    }
  }
  return null;
}

function appendRecord_(sheet, record) {
  const headers = headerMap_(sheet);
  const row = Object.keys(headers).map((header) => (header in record ? record[header] : ''));
  sheet.appendRow(row);
}

function nextId_(prefix, sheet, idHeader) {
  const headers = headerMap_(sheet);
  if (!headers[idHeader]) throwFriendly_(`Required header missing on ${sheet.getName()}: ${idHeader}`);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return `${prefix}-0001`;
  const values = sheet.getRange(2, headers[idHeader], lastRow - 1, 1).getValues().flat();
  let max = 0;
  values.forEach((value) => {
    const match = String(value).match(/(\d+)$/);
    if (match) max = Math.max(max, Number(match[1]));
  });
  return `${prefix}-${String(max + 1).padStart(4, '0')}`;
}

function assertWorkerPayPeriodMatch_(ss, workerId, payPeriodId) {
  if (!workerId || !payPeriodId) throwFriendly_('Worker ID and Pay Period ID are required.');
  const worker = findRowByValue_(requireSheet_(ss, SHEETS.WORKERS), 'Worker ID', workerId);
  if (!worker) throwFriendly_(`Worker ID not found: ${workerId}`);
  const payPeriod = findRowByValue_(requireSheet_(ss, SHEETS.PAY_PERIODS), 'Pay Period ID', payPeriodId);
  if (!payPeriod) throwFriendly_(`Pay Period ID not found: ${payPeriodId}`);
  if (String(payPeriod.record['Worker ID']).trim() !== workerId) {
    throwFriendly_('Selected pay period belongs to a different worker. Worker-specific proof was not logged.');
  }
  return { worker, payPeriod };
}

function promptRequired_(title, prompt, defaultValue) {
  const response = SpreadsheetApp.getUi().prompt(title, prompt, SpreadsheetApp.getUi().ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== SpreadsheetApp.getUi().Button.OK) throwFriendly_('Action canceled.');
  const value = String(response.getResponseText() || defaultValue || '').trim();
  if (!value) throwFriendly_('A value is required.');
  return value;
}

function promptOptional_(title, prompt, defaultValue) {
  const response = SpreadsheetApp.getUi().prompt(title, prompt, SpreadsheetApp.getUi().ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== SpreadsheetApp.getUi().Button.OK) throwFriendly_('Action canceled.');
  return String(response.getResponseText() || defaultValue || '').trim();
}

function currentUser_() {
  const email = Session.getActiveUser().getEmail();
  return email || 'Workbook User';
}

function showAlert_(message) {
  SpreadsheetApp.getUi().alert(String(message));
}

function throwFriendly_(message) {
  SpreadsheetApp.getUi().alert(String(message));
  throw new Error(message);
}
