from pathlib import Path
from datetime import date, datetime, time
import sys


LOCAL_DEPS = Path(__file__).resolve().parent / ".deps" / "usr" / "lib" / "python3" / "dist-packages"
if LOCAL_DEPS.exists():
    sys.path.insert(0, str(LOCAL_DEPS))

from openpyxl import Workbook, load_workbook
from openpyxl.formatting.rule import FormulaRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation


OUTPUT_FILE = "CrewPay_Ledger_Workbook.xlsx"
SHEET_ORDER = [
    "Instructions",
    "Dashboard",
    "Workers",
    "Jobs",
    "Time Entries",
    "Pay Periods",
    "Worker Proof",
    "Proof Exports",
    "Access Log",
    "Correction Log",
    "Schedule",
    "Admin Notices",
    "Calendar Sync Log",
    "Dropdown Lists",
]

DROPDOWNS = {
    "Access Status": ["Active", "Inactive"],
    "Job Status": ["Active", "Paused", "Closed"],
    "Approval Status": ["Draft", "Submitted", "Approved", "Finalized", "Paid", "Rejected"],
    "Pay Period Status": ["Open", "Finalized", "Paid"],
    "Payment Status": ["Unpaid", "Paid"],
    "Export Type": ["Print", "PDF", "CSV"],
    "Schedule Status": ["Planned", "Scheduled", "Completed", "Canceled"],
    "Recipient Type": ["Worker", "All Active Workers"],
    "Delivery Method": ["Workbook", "Email Ready", "Gmail Sent"],
    "Notice Status": ["Draft", "Posted", "Sent", "Archived"],
    "Sync Status": ["Not Synced", "Synced", "Failed", "Skipped"],
}

WORKERS = [
    ["W-1001", "Maya Ellis", "maya.ellis@example.local", "Crew Lead", "Active", "2026-06-01", "", "Active worker for current entries."],
    ["W-1002", "Leo Grant", "leo.grant@example.local", "Installer", "Active", "2026-06-01", "", "Active worker with pending approval."],
    ["W-1003", "Priya Shah", "priya.shah@example.local", "Helper", "Inactive", "2026-05-15", "2026-06-09", "Inactive worker with historical proof records."],
]

JOBS = [
    ["J-2001", "Oak Ridge Units", "Oak Ridge Apartments", "Active", 32, "", "Apartment unit prep and repairs."],
    ["J-2002", "Bluebird Cafe Refresh", "Bluebird Cafe", "Active", 30, "", "Cafe refresh punch list."],
    ["J-2003", "Cedar Lane Repairs", "Cedar Lane Rentals", "Closed", 24, "cal-demo-cedar-001", "Closed job retained for proof history."],
]

TIME_ENTRIES = [
    ["T-3001", "W-1001", "", "J-2001", "", "2026-06-02", "08:00", "16:30", 30, "", "", "", 35, 0, "", "Approved", "2026-06-02 16:45", "2026-06-03 09:10", "", "Unit prep and fixture checks."],
    ["T-3002", "W-1002", "", "J-2001", "", "2026-06-02", "08:00", "15:00", 30, "", "", "", 0, 0, "", "Submitted", "2026-06-02 15:20", "", "", "Drywall patch support pending approval."],
    ["T-3003", "W-1003", "", "J-2003", "", "2026-06-03", "09:00", "14:00", 0, "", "", "", 0, 0, "", "Approved", "2026-06-03 14:10", "2026-06-04 08:30", "", "Historical approved work before inactive status."],
    ["T-3004", "W-1001", "", "J-2002", "", "2026-06-06", "07:30", "13:30", 0, "", "", "", 0, 0, "", "Paid", "2026-06-06 13:40", "2026-06-07 10:00", "Paid period proof generated after final punch list.", "Final punch list."],
    ["T-3005", "W-1003", "", "J-2003", "", "2026-06-05", "08:30", "12:30", 0, "", "", "", 15, 0, "", "Finalized", "2026-06-05 12:45", "2026-06-06 09:15", "Visible correction: added reimbursement before worker was inactive.", "Historical reimbursement correction retained."],
]

PAY_PERIODS = [
    ["P-4001", "W-1001", "", "2026-06-01", "2026-06-07", "Paid", "Paid", "", "", "", "", "", "2026-06-07 10:00", "2026-06-08 12:00", "Paid worker proof can be regenerated."],
    ["P-4002", "W-1002", "", "2026-06-01", "2026-06-07", "Open", "Unpaid", "", "", "", "", "", "", "", "Open period with submitted entry."],
    ["P-4003", "W-1003", "", "2026-06-01", "2026-06-07", "Finalized", "Unpaid", "", "", "", "", "", "2026-06-08 09:00", "", "Inactive worker history remains visible and provable."],
]

PROOF_EXPORTS = [
    ["X-5001", "W-1001", "Maya Ellis", "P-4001", "Print", "2026-06-08 12:05", "Admin Demo", "Printed proof packet", "Worker-specific proof generated from workbook records."],
    ["X-5002", "W-1003", "Priya Shah", "P-4003", "CSV", "2026-06-09 09:30", "Admin Demo", "CSV proof export", "Inactive worker proof regenerated after access status changed."],
]

ACCESS_LOG = [
    ["A-6001", "W-1003", "Priya Shah", "Active", "Inactive", "2026-06-09 08:00", "Admin Demo", "End of assignment; historical proof retained."],
]

CORRECTION_LOG = [
    ["C-7001", "T-3005", "W-1003", "Priya Shah", "P-4003", "2026-06-08", "Admin Demo", "Add missing reimbursement", "Reimbursement 0", "Reimbursement 15", "Correction visible in Time Entries and log."],
]

SCHEDULE = [
    ["S-8001", "J-2001", "Oak Ridge Units", "W-1001", "Maya Ellis", "2026-06-11", "08:00", "16:00", "Scheduled", "cal-demo-oak-001", "Planning only; not proof."],
    ["S-8002", "J-2002", "Bluebird Cafe Refresh", "W-1002", "Leo Grant", "2026-06-12", "09:00", "13:00", "Planned", "", "Schedule reference only."],
]

ADMIN_NOTICES = [
    ["N-9001", "2026-06-08 12:15", "Admin Demo", "Worker", "W-1001", "Maya Ellis", "Proof ready", "Your paid proof packet is ready in the workbook.", "P-4001", "Workbook", "Posted", "2026-06-08 12:15", "One-way notice, not chat or proof."],
    ["N-9002", "2026-06-09 08:20", "Admin Demo", "All Active Workers", "", "", "Schedule reminder", "Check the Schedule tab for upcoming planned work.", "", "Email Ready", "Draft", "", "Email-ready text only; no send automation."],
]

CALENDAR_SYNC = [
    ["G-10001", "J-2001", "Oak Ridge Units", "W-1001", "Maya Ellis", "cal-demo-oak-001", "2026-06-11", "Not Synced", "", "Calendar is reference only, not proof."],
]


def set_widths(ws, widths):
    for col, width in widths.items():
        ws.column_dimensions[col].width = width


def header_style(ws, row=1, start_col=1, end_col=None):
    end_col = end_col or ws.max_column
    fill = PatternFill("solid", fgColor="D9EAF7")
    font = Font(bold=True, color="1F2937")
    border = Border(bottom=Side(style="thin", color="9FB6C8"))
    for col in range(start_col, end_col + 1):
        cell = ws.cell(row, col)
        cell.fill = fill
        cell.font = font
        cell.border = border
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)


def table_style(ws, min_row, max_row, min_col, max_col):
    side = Side(style="thin", color="D1D5DB")
    border = Border(left=side, right=side, top=side, bottom=side)
    for row in ws.iter_rows(min_row=min_row, max_row=max_row, min_col=min_col, max_col=max_col):
        for cell in row:
            cell.border = border
            cell.alignment = Alignment(vertical="top", wrap_text=True)


def add_validation(ws, list_name, cell_range):
    keys = list(DROPDOWNS.keys())
    col = get_column_letter(keys.index(list_name) + 1)
    end_row = len(DROPDOWNS[list_name]) + 1
    dv = DataValidation(type="list", formula1=f"'Dropdown Lists'!${col}$2:${col}${end_row}", allow_blank=True)
    dv.errorTitle = "Invalid value"
    dv.error = "Choose a value from Dropdown Lists."
    ws.add_data_validation(dv)
    dv.add(cell_range)


def add_range_validation(ws, source_range, cell_range):
    dv = DataValidation(type="list", formula1=source_range, allow_blank=True)
    dv.errorTitle = "Invalid value"
    dv.error = "Choose a value from the approved workbook range."
    ws.add_data_validation(dv)
    dv.add(cell_range)


def as_date(value):
    if not value:
        return None
    return date.fromisoformat(str(value))


def as_time(value):
    if not value:
        return None
    hour, minute = str(value).split(":")[:2]
    return time(int(hour), int(minute))


def as_datetime(value):
    if not value:
        return None
    return datetime.strptime(str(value), "%Y-%m-%d %H:%M")


def build_dropdowns(ws):
    ws.title = "Dropdown Lists"
    for col_idx, (header, values) in enumerate(DROPDOWNS.items(), 1):
        ws.cell(1, col_idx, header)
        for row_idx, value in enumerate(values, 2):
            ws.cell(row_idx, col_idx, value)
    header_style(ws)
    table_style(ws, 1, ws.max_row, 1, ws.max_column)
    set_widths(ws, {get_column_letter(i): 22 for i in range(1, len(DROPDOWNS) + 1)})
    ws.freeze_panes = "A2"


def build_instructions(ws):
    ws.title = "Instructions"
    ws["A1"] = "CrewPay Ledger Workbook"
    ws["A1"].font = Font(bold=True, size=20, color="1F2937")
    ws["A1"].fill = PatternFill("solid", fgColor="EEF6FC")
    ws.merge_cells("A1:F1")
    lines = [
        ("What this workbook does", "CrewPay Ledger Level 1 is a workbook-first timesheet, pay-period, worker-proof, schedule, notice, and audit ledger."),
        ("What this workbook does not do", "It does not provide backend storage, worker accounts, payroll tax logic, HR compliance logic, enterprise permissions, Apps Script, APIs, or paid services."),
        ("Source of truth", "This workbook is the Level 1 source of truth. The existing local app is optional and is not required to use this ledger."),
        ("Worker proof protection", "Worker Proof is selected by one worker and one pay period. Proof comes from Time Entries and Pay Periods, not schedule or notices."),
        ("Inactive workers", "Inactive workers should not receive new time entries. Historical rows, pay periods, proof exports, and correction logs remain visible."),
        ("Correction notes", "Corrections after finalization should be recorded visibly in Time Entries and Correction Log. Do not silently overwrite proof."),
        ("Schedule and Calendar", "Schedule is planning only. Future Google Calendar sync may mirror schedules, but calendar rows are not proof."),
        ("Admin Notices", "Admin Notices are one-way admin notices. They are not chat, worker-to-worker messaging, or proof."),
        ("Level 1.5 readiness", "Future free Apps Script helpers may add menus, proof exports, notice drafts, calendar sync logs, and access logs without restructuring the workbook."),
        ("Manual-first rule", "The workbook must remain usable manually. Any future script helper should write back to the Proof Exports, Access Log, Correction Log, or Calendar Sync Log tabs instead of becoming the source of truth."),
    ]
    row = 3
    for heading, body in lines:
        ws.cell(row, 1, heading).font = Font(bold=True, size=12, color="374151")
        ws.cell(row + 1, 1, body)
        ws.cell(row + 1, 1).alignment = Alignment(wrap_text=True, vertical="top")
        ws.merge_cells(start_row=row + 1, start_column=1, end_row=row + 1, end_column=6)
        row += 3
    set_widths(ws, {"A": 28, "B": 18, "C": 18, "D": 18, "E": 18, "F": 18})


def append_table(ws, headers, rows, widths=None):
    ws.append(headers)
    for row in rows:
        ws.append(row)
    header_style(ws, 1, 1, len(headers))
    table_style(ws, 1, max(ws.max_row, 1), 1, len(headers))
    ws.freeze_panes = "A2"
    if widths:
        set_widths(ws, widths)


def build_workers(ws):
    ws.title = "Workers"
    headers = ["Worker ID", "Worker Name", "Worker Email", "Role", "Access Status", "Created At", "Inactive At", "Notes"]
    append_table(ws, headers, WORKERS, {"A": 12, "B": 20, "C": 28, "D": 16, "E": 16, "F": 14, "G": 14, "H": 42})
    add_validation(ws, "Access Status", "E2:E200")
    for row in range(2, ws.max_row + 1):
        ws[f"F{row}"].value = as_date(ws[f"F{row}"].value)
        ws[f"G{row}"].value = as_date(ws[f"G{row}"].value)
        ws[f"F{row}"].number_format = "m/d/yyyy"
        ws[f"G{row}"].number_format = "m/d/yyyy"


def build_jobs(ws):
    ws.title = "Jobs"
    headers = ["Job ID", "Job Name", "Client or Site", "Status", "Default Rate", "Calendar Event ID", "Notes"]
    append_table(ws, headers, JOBS, {"A": 12, "B": 24, "C": 24, "D": 14, "E": 14, "F": 24, "G": 40})
    add_validation(ws, "Job Status", "D2:D200")
    for row in range(2, ws.max_row + 1):
        ws[f"E{row}"].number_format = "$#,##0.00"


def build_time_entries(ws):
    ws.title = "Time Entries"
    headers = ["Entry ID", "Worker ID", "Worker Name", "Job ID", "Job Name", "Work Date", "Start Time", "End Time", "Break Minutes", "Hours", "Rate", "Gross Pay", "Reimbursement", "Deduction", "Net Pay", "Approval Status", "Submitted At", "Approved At", "Correction Note", "Notes"]
    append_table(ws, headers, TIME_ENTRIES, {"A": 12, "B": 12, "C": 20, "D": 12, "E": 24, "F": 13, "G": 12, "H": 12, "I": 14, "J": 12, "K": 12, "L": 14, "M": 15, "N": 12, "O": 14, "P": 16, "Q": 18, "R": 18, "S": 34, "T": 34})
    for row in range(2, 201):
        ws[f"C{row}"] = f'=IFERROR(VLOOKUP(B{row},Workers!$A:$H,2,FALSE),"")'
        ws[f"E{row}"] = f'=IFERROR(VLOOKUP(D{row},Jobs!$A:$G,2,FALSE),"")'
        ws[f"J{row}"] = f'=IF(OR(G{row}="",H{row}=""),"",MAX(0,(H{row}-G{row})*24-(I{row}/60)))'
        ws[f"K{row}"] = f'=IFERROR(VLOOKUP(D{row},Jobs!$A:$G,5,FALSE),"")'
        ws[f"L{row}"] = f'=IF(OR(J{row}="",K{row}=""),"",J{row}*K{row})'
        ws[f"O{row}"] = f'=IF(L{row}="","",L{row}+M{row}-N{row})'
    add_validation(ws, "Approval Status", "P2:P200")
    add_range_validation(ws, "Workers!$A$2:$A$200", "B2:B200")
    add_range_validation(ws, "Jobs!$A$2:$A$200", "D2:D200")
    for row in range(2, ws.max_row + 1):
        ws[f"F{row}"].value = as_date(ws[f"F{row}"].value)
        ws[f"G{row}"].value = as_time(ws[f"G{row}"].value)
        ws[f"H{row}"].value = as_time(ws[f"H{row}"].value)
        ws[f"Q{row}"].value = as_datetime(ws[f"Q{row}"].value)
        ws[f"R{row}"].value = as_datetime(ws[f"R{row}"].value)
    for row in range(2, 201):
        ws[f"F{row}"].number_format = "m/d/yyyy"
        ws[f"G{row}"].number_format = "h:mm"
        ws[f"H{row}"].number_format = "h:mm"
        ws[f"Q{row}"].number_format = "m/d/yyyy h:mm"
        ws[f"R{row}"].number_format = "m/d/yyyy h:mm"
        ws[f"J{row}"].number_format = "0.00"
        for col in ["K", "L", "M", "N", "O"]:
            ws[f"{col}{row}"].number_format = "$#,##0.00"
    ws.conditional_formatting.add("A2:T200", FormulaRule(formula=['$P2="Submitted"'], fill=PatternFill("solid", fgColor="FFF2CC")))
    ws.conditional_formatting.add("A2:T200", FormulaRule(formula=['$S2<>""'], fill=PatternFill("solid", fgColor="FCE7E7")))
    ws.conditional_formatting.add(
        "A2:T200",
        FormulaRule(
            formula=['IFERROR(VLOOKUP($B2,Workers!$A:$E,5,FALSE)="Inactive",FALSE)'],
            fill=PatternFill("solid", fgColor="E5E7EB"),
        ),
    )


def build_pay_periods(ws):
    ws.title = "Pay Periods"
    headers = ["Pay Period ID", "Worker ID", "Worker Name", "Period Start", "Period End", "Status", "Payment Status", "Total Hours", "Gross Pay", "Reimbursement Total", "Deduction Total", "Net Pay", "Finalized At", "Paid At", "Notes"]
    append_table(ws, headers, PAY_PERIODS, {"A": 15, "B": 12, "C": 20, "D": 14, "E": 14, "F": 14, "G": 14, "H": 13, "I": 14, "J": 20, "K": 18, "L": 14, "M": 18, "N": 18, "O": 42})
    for row in range(2, 101):
        ws[f"C{row}"] = f'=IFERROR(VLOOKUP(B{row},Workers!$A:$H,2,FALSE),"")'
        ws[f"H{row}"] = f'=SUMIFS(\'Time Entries\'!$J:$J,\'Time Entries\'!$B:$B,$B{row},\'Time Entries\'!$F:$F,">="&$D{row},\'Time Entries\'!$F:$F,"<="&$E{row},\'Time Entries\'!$P:$P,"<>Draft",\'Time Entries\'!$P:$P,"<>Rejected")'
        ws[f"I{row}"] = f'=SUMIFS(\'Time Entries\'!$L:$L,\'Time Entries\'!$B:$B,$B{row},\'Time Entries\'!$F:$F,">="&$D{row},\'Time Entries\'!$F:$F,"<="&$E{row},\'Time Entries\'!$P:$P,"<>Draft",\'Time Entries\'!$P:$P,"<>Rejected")'
        ws[f"J{row}"] = f'=SUMIFS(\'Time Entries\'!$M:$M,\'Time Entries\'!$B:$B,$B{row},\'Time Entries\'!$F:$F,">="&$D{row},\'Time Entries\'!$F:$F,"<="&$E{row},\'Time Entries\'!$P:$P,"<>Draft",\'Time Entries\'!$P:$P,"<>Rejected")'
        ws[f"K{row}"] = f'=SUMIFS(\'Time Entries\'!$N:$N,\'Time Entries\'!$B:$B,$B{row},\'Time Entries\'!$F:$F,">="&$D{row},\'Time Entries\'!$F:$F,"<="&$E{row},\'Time Entries\'!$P:$P,"<>Draft",\'Time Entries\'!$P:$P,"<>Rejected")'
        ws[f"L{row}"] = f'=I{row}+J{row}-K{row}'
    add_validation(ws, "Pay Period Status", "F2:F100")
    add_validation(ws, "Payment Status", "G2:G100")
    add_range_validation(ws, "Workers!$A$2:$A$200", "B2:B100")
    for row in range(2, ws.max_row + 1):
        ws[f"D{row}"].value = as_date(ws[f"D{row}"].value)
        ws[f"E{row}"].value = as_date(ws[f"E{row}"].value)
        ws[f"M{row}"].value = as_datetime(ws[f"M{row}"].value)
        ws[f"N{row}"].value = as_datetime(ws[f"N{row}"].value)
    for row in range(2, 101):
        ws[f"D{row}"].number_format = "m/d/yyyy"
        ws[f"E{row}"].number_format = "m/d/yyyy"
        ws[f"M{row}"].number_format = "m/d/yyyy h:mm"
        ws[f"N{row}"].number_format = "m/d/yyyy h:mm"
        ws[f"H{row}"].number_format = "0.00"
        for col in ["I", "J", "K", "L"]:
            ws[f"{col}{row}"].number_format = "$#,##0.00"
    ws.conditional_formatting.add("A2:O100", FormulaRule(formula=['AND($F2="Finalized",$G2="Unpaid")'], fill=PatternFill("solid", fgColor="FFF2CC")))


def build_worker_proof(ws):
    ws.title = "Worker Proof"
    ws.sheet_view.showGridLines = False
    ws["A1"] = "CrewPay Ledger Worker Proof"
    ws["A1"].font = Font(bold=True, size=18, color="1F2937")
    ws["A1"].fill = PatternFill("solid", fgColor="EEF6FC")
    ws.merge_cells("A1:H1")
    labels = [
        ("A3", "Selected Worker ID"), ("A4", "Selected Pay Period ID"), ("A5", "Worker Name"),
        ("A6", "Worker Status"), ("A7", "Date Range"), ("A8", "Payment Status"), ("A9", "Generated Timestamp"),
        ("A10", "Proof Selector Check")
    ]
    for cell, label in labels:
        ws[cell] = label
        ws[cell].font = Font(bold=True)
    ws["B3"] = "W-1001"
    ws["B4"] = "P-4001"
    ws["B5"] = '=IFERROR(VLOOKUP($B$3,Workers!$A:$H,2,FALSE),"")'
    ws["B6"] = '=IFERROR(VLOOKUP($B$3,Workers!$A:$H,5,FALSE),"")'
    ws["B7"] = '=IFERROR(TEXT(VLOOKUP($B$4,\'Pay Periods\'!$A:$O,4,FALSE),"m/d/yyyy")&" to "&TEXT(VLOOKUP($B$4,\'Pay Periods\'!$A:$O,5,FALSE),"m/d/yyyy"),"")'
    ws["B8"] = '=IFERROR(VLOOKUP($B$4,\'Pay Periods\'!$A:$O,7,FALSE),"")'
    ws["B9"] = '=NOW()'
    ws["B10"] = '=IFERROR(IF(VLOOKUP($B$4,\'Pay Periods\'!$A:$O,2,FALSE)=$B$3,"OK - worker/pay period match","CHECK SELECTION - pay period belongs to another worker"),"CHECK SELECTION")'
    ws["B9"].number_format = "m/d/yyyy h:mm"
    add_validation(ws, "Payment Status", "B8")
    dv_worker = DataValidation(type="list", formula1="Workers!$A$2:$A$200", allow_blank=False)
    dv_period = DataValidation(type="list", formula1="'Pay Periods'!$A$2:$A$100", allow_blank=False)
    ws.add_data_validation(dv_worker); dv_worker.add("B3")
    ws.add_data_validation(dv_period); dv_period.add("B4")
    headers = ["Entry ID", "Work Date", "Job ID", "Job Name", "Hours", "Rate", "Gross Pay", "Reimbursement", "Deduction", "Net Pay", "Approval Status", "Correction Note", "Notes"]
    for idx, header in enumerate(headers, 1):
        ws.cell(12, idx, header)
    header_style(ws, 12, 1, len(headers))
    ws["A13"] = '=IF($B$10<>"OK - worker/pay period match","Check selected worker/pay period before printing proof",FILTER({\'Time Entries\'!A2:A200,\'Time Entries\'!F2:F200,\'Time Entries\'!D2:D200,\'Time Entries\'!E2:E200,\'Time Entries\'!J2:J200,\'Time Entries\'!K2:K200,\'Time Entries\'!L2:L200,\'Time Entries\'!M2:M200,\'Time Entries\'!N2:N200,\'Time Entries\'!O2:O200,\'Time Entries\'!P2:P200,\'Time Entries\'!S2:S200,\'Time Entries\'!T2:T200},\'Time Entries\'!B2:B200=$B$3,\'Time Entries\'!F2:F200>=VLOOKUP($B$4,\'Pay Periods\'!$A:$O,4,FALSE),\'Time Entries\'!F2:F200<=VLOOKUP($B$4,\'Pay Periods\'!$A:$O,5,FALSE)))'
    total_row = 30
    totals = [
        ("A30", "Total Hours", "B30", '=IF($B$10<>"OK - worker/pay period match",0,SUMIFS(\'Time Entries\'!$J:$J,\'Time Entries\'!$B:$B,$B$3,\'Time Entries\'!$F:$F,">="&VLOOKUP($B$4,\'Pay Periods\'!$A:$O,4,FALSE),\'Time Entries\'!$F:$F,"<="&VLOOKUP($B$4,\'Pay Periods\'!$A:$O,5,FALSE),\'Time Entries\'!$P:$P,"<>Draft",\'Time Entries\'!$P:$P,"<>Rejected"))'),
        ("A31", "Gross Pay", "B31", '=IF($B$10<>"OK - worker/pay period match",0,SUMIFS(\'Time Entries\'!$L:$L,\'Time Entries\'!$B:$B,$B$3,\'Time Entries\'!$F:$F,">="&VLOOKUP($B$4,\'Pay Periods\'!$A:$O,4,FALSE),\'Time Entries\'!$F:$F,"<="&VLOOKUP($B$4,\'Pay Periods\'!$A:$O,5,FALSE),\'Time Entries\'!$P:$P,"<>Draft",\'Time Entries\'!$P:$P,"<>Rejected"))'),
        ("A32", "Reimbursements", "B32", '=IF($B$10<>"OK - worker/pay period match",0,SUMIFS(\'Time Entries\'!$M:$M,\'Time Entries\'!$B:$B,$B$3,\'Time Entries\'!$F:$F,">="&VLOOKUP($B$4,\'Pay Periods\'!$A:$O,4,FALSE),\'Time Entries\'!$F:$F,"<="&VLOOKUP($B$4,\'Pay Periods\'!$A:$O,5,FALSE),\'Time Entries\'!$P:$P,"<>Draft",\'Time Entries\'!$P:$P,"<>Rejected"))'),
        ("A33", "Deductions", "B33", '=IF($B$10<>"OK - worker/pay period match",0,SUMIFS(\'Time Entries\'!$N:$N,\'Time Entries\'!$B:$B,$B$3,\'Time Entries\'!$F:$F,">="&VLOOKUP($B$4,\'Pay Periods\'!$A:$O,4,FALSE),\'Time Entries\'!$F:$F,"<="&VLOOKUP($B$4,\'Pay Periods\'!$A:$O,5,FALSE),\'Time Entries\'!$P:$P,"<>Draft",\'Time Entries\'!$P:$P,"<>Rejected"))'),
        ("A34", "Net Pay", "B34", '=B31+B32-B33'),
    ]
    for label_cell, label, value_cell, formula in totals:
        ws[label_cell] = label
        ws[label_cell].font = Font(bold=True)
        ws[value_cell] = formula
    for row in range(31, 35):
        ws[f"B{row}"].number_format = "$#,##0.00"
    ws["B30"].number_format = "0.00"
    ws["D3"] = "Rule: Worker Proof is selected by one worker and one pay period only. It is print-ready and must not be replaced by crew-wide reports."
    ws["D3"].alignment = Alignment(wrap_text=True, vertical="top")
    ws.merge_cells("D3:H6")
    table_style(ws, 3, 10, 1, 2)
    ws.conditional_formatting.add("A10:B10", FormulaRule(formula=['$B$10<>"OK - worker/pay period match"'], fill=PatternFill("solid", fgColor="F8D7DA")))
    set_widths(ws, {"A": 18, "B": 22, "C": 14, "D": 24, "E": 12, "F": 12, "G": 14, "H": 16, "I": 12, "J": 14, "K": 18, "L": 28, "M": 34})
    ws.freeze_panes = "A12"
    ws.print_title_rows = "1:12"
    ws.print_area = "A1:M34"
    ws.page_setup.orientation = "landscape"
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 1
    ws.sheet_properties.pageSetUpPr.fitToPage = True


def build_dashboard(ws):
    ws.title = "Dashboard"
    ws.sheet_view.showGridLines = False
    ws["A1"] = "CrewPay Ledger Dashboard"
    ws["A1"].font = Font(bold=True, size=18, color="1F2937")
    ws["A2"] = "Workbook-first Level 1 source-of-truth view"
    cards = [
        ("A4", "Active workers", '=COUNTIF(Workers!$E$2:$E$200,"Active")'),
        ("C4", "Inactive workers", '=COUNTIF(Workers!$E$2:$E$200,"Inactive")'),
        ("E4", "Pending entries", '=COUNTIF(\'Time Entries\'!$P$2:$P$200,"Submitted")'),
        ("G4", "Current pay period totals", '=SUMIFS(\'Pay Periods\'!$L$2:$L$100,\'Pay Periods\'!$F$2:$F$100,"<>Paid")'),
        ("A7", "Unpaid finalized pay periods", '=COUNTIFS(\'Pay Periods\'!$F$2:$F$100,"Finalized",\'Pay Periods\'!$G$2:$G$100,"Unpaid")'),
        ("C7", "Posted/sent admin notices", '=COUNTIF(\'Admin Notices\'!$K$2:$K$100,"Posted")+COUNTIF(\'Admin Notices\'!$K$2:$K$100,"Sent")'),
    ]
    for anchor, label, formula in cards:
        cell = ws[anchor]
        row, col = cell.row, cell.column
        ws.merge_cells(start_row=row, start_column=col, end_row=row, end_column=col + 1)
        ws.merge_cells(start_row=row + 1, start_column=col, end_row=row + 1, end_column=col + 1)
        ws.cell(row, col, label)
        ws.cell(row + 1, col, formula)
        ws.cell(row, col).font = Font(bold=True, color="374151")
        ws.cell(row + 1, col).font = Font(bold=True, size=15, color="111827")
        if "totals" in label:
            ws.cell(row + 1, col).number_format = "$#,##0.00"
        for r in (row, row + 1):
            for c in (col, col + 1):
                ws.cell(r, c).fill = PatternFill("solid", fgColor="EEF6FC")
                ws.cell(r, c).border = Border(left=Side(style="thin", color="A6B7C8"), right=Side(style="thin", color="A6B7C8"), top=Side(style="thin", color="A6B7C8"), bottom=Side(style="thin", color="A6B7C8"))
                ws.cell(r, c).alignment = Alignment(horizontal="center", vertical="center")
    ws["A11"] = "Workbook rules"
    ws["A11"].font = Font(bold=True, size=13)
    rules = [
        "Workbook is the Level 1 ledger/source of truth.",
        "Worker Proof is one worker and one pay period only.",
        "Schedule and Calendar Sync Log are planning/reference only, not proof.",
        "Admin Notices are one-way notices only, not chat or proof.",
    ]
    for idx, rule in enumerate(rules, 12):
        ws.cell(idx, 1, rule)
    set_widths(ws, {"A": 26, "B": 14, "C": 24, "D": 14, "E": 22, "F": 14, "G": 28, "H": 14})


def build_simple_logs(wb):
    append_table(wb["Proof Exports"], ["Export ID", "Worker ID", "Worker Name", "Pay Period ID", "Export Type", "Generated At", "Generated By", "Export Reference", "Notes"], PROOF_EXPORTS, {"A": 12, "B": 12, "C": 20, "D": 15, "E": 12, "F": 18, "G": 16, "H": 24, "I": 44})
    add_range_validation(wb["Proof Exports"], "Workers!$A$2:$A$200", "B2:B100")
    add_range_validation(wb["Proof Exports"], "'Pay Periods'!$A$2:$A$100", "D2:D100")
    add_validation(wb["Proof Exports"], "Export Type", "E2:E100")
    append_table(wb["Access Log"], ["Log ID", "Worker ID", "Worker Name", "Previous Status", "New Status", "Changed At", "Changed By", "Reason"], ACCESS_LOG, {"A": 12, "B": 12, "C": 20, "D": 16, "E": 16, "F": 18, "G": 16, "H": 46})
    add_range_validation(wb["Access Log"], "Workers!$A$2:$A$200", "B2:B100")
    add_validation(wb["Access Log"], "Access Status", "D2:E100")
    append_table(wb["Correction Log"], ["Correction ID", "Entry ID", "Worker ID", "Worker Name", "Pay Period ID", "Correction Date", "Corrected By", "Correction Reason", "Original Value Summary", "New Value Summary", "Notes"], CORRECTION_LOG, {"A": 14, "B": 12, "C": 12, "D": 20, "E": 15, "F": 15, "G": 16, "H": 24, "I": 24, "J": 24, "K": 38})
    add_range_validation(wb["Correction Log"], "'Time Entries'!$A$2:$A$200", "B2:B100")
    add_range_validation(wb["Correction Log"], "Workers!$A$2:$A$200", "C2:C100")
    add_range_validation(wb["Correction Log"], "'Pay Periods'!$A$2:$A$100", "E2:E100")
    append_table(wb["Schedule"], ["Schedule ID", "Job ID", "Job Name", "Worker ID", "Worker Name", "Scheduled Date", "Start Time", "End Time", "Schedule Status", "Calendar Event ID", "Notes"], SCHEDULE, {"A": 13, "B": 12, "C": 24, "D": 12, "E": 20, "F": 15, "G": 12, "H": 12, "I": 16, "J": 24, "K": 42})
    add_range_validation(wb["Schedule"], "Jobs!$A$2:$A$200", "B2:B100")
    add_range_validation(wb["Schedule"], "Workers!$A$2:$A$200", "D2:D100")
    add_validation(wb["Schedule"], "Schedule Status", "I2:I100")
    append_table(wb["Admin Notices"], ["Notice ID", "Created At", "Created By", "Recipient Type", "Worker ID", "Worker Name", "Subject", "Message", "Related Pay Period ID", "Delivery Method", "Notice Status", "Sent At", "Notes"], ADMIN_NOTICES, {"A": 12, "B": 18, "C": 16, "D": 20, "E": 12, "F": 20, "G": 24, "H": 44, "I": 20, "J": 16, "K": 15, "L": 18, "M": 38})
    add_validation(wb["Admin Notices"], "Recipient Type", "D2:D100")
    add_range_validation(wb["Admin Notices"], "Workers!$A$2:$A$200", "E2:E100")
    add_range_validation(wb["Admin Notices"], "'Pay Periods'!$A$2:$A$100", "I2:I100")
    add_validation(wb["Admin Notices"], "Delivery Method", "J2:J100")
    add_validation(wb["Admin Notices"], "Notice Status", "K2:K100")
    append_table(wb["Calendar Sync Log"], ["Calendar Log ID", "Job ID", "Job Name", "Worker ID", "Worker Name", "Calendar Event ID", "Event Date", "Sync Status", "Last Synced At", "Notes"], CALENDAR_SYNC, {"A": 16, "B": 12, "C": 24, "D": 12, "E": 20, "F": 24, "G": 14, "H": 16, "I": 18, "J": 44})
    add_range_validation(wb["Calendar Sync Log"], "Jobs!$A$2:$A$200", "B2:B100")
    add_range_validation(wb["Calendar Sync Log"], "Workers!$A$2:$A$200", "D2:D100")
    add_validation(wb["Calendar Sync Log"], "Sync Status", "H2:H100")

    for row in range(2, wb["Proof Exports"].max_row + 1):
        wb["Proof Exports"][f"F{row}"].value = as_datetime(wb["Proof Exports"][f"F{row}"].value)
        wb["Proof Exports"][f"F{row}"].number_format = "m/d/yyyy h:mm"
    for row in range(2, wb["Access Log"].max_row + 1):
        wb["Access Log"][f"F{row}"].value = as_datetime(wb["Access Log"][f"F{row}"].value)
        wb["Access Log"][f"F{row}"].number_format = "m/d/yyyy h:mm"
    for row in range(2, wb["Correction Log"].max_row + 1):
        wb["Correction Log"][f"F{row}"].value = as_date(wb["Correction Log"][f"F{row}"].value)
        wb["Correction Log"][f"F{row}"].number_format = "m/d/yyyy"
    for row in range(2, wb["Schedule"].max_row + 1):
        wb["Schedule"][f"F{row}"].value = as_date(wb["Schedule"][f"F{row}"].value)
        wb["Schedule"][f"G{row}"].value = as_time(wb["Schedule"][f"G{row}"].value)
        wb["Schedule"][f"H{row}"].value = as_time(wb["Schedule"][f"H{row}"].value)
        wb["Schedule"][f"F{row}"].number_format = "m/d/yyyy"
        wb["Schedule"][f"G{row}"].number_format = "h:mm"
        wb["Schedule"][f"H{row}"].number_format = "h:mm"
    for row in range(2, wb["Admin Notices"].max_row + 1):
        wb["Admin Notices"][f"B{row}"].value = as_datetime(wb["Admin Notices"][f"B{row}"].value)
        wb["Admin Notices"][f"L{row}"].value = as_datetime(wb["Admin Notices"][f"L{row}"].value)
        wb["Admin Notices"][f"B{row}"].number_format = "m/d/yyyy h:mm"
        wb["Admin Notices"][f"L{row}"].number_format = "m/d/yyyy h:mm"
    for row in range(2, wb["Calendar Sync Log"].max_row + 1):
        wb["Calendar Sync Log"][f"G{row}"].value = as_date(wb["Calendar Sync Log"][f"G{row}"].value)
        wb["Calendar Sync Log"][f"I{row}"].value = as_datetime(wb["Calendar Sync Log"][f"I{row}"].value)
        wb["Calendar Sync Log"][f"G{row}"].number_format = "m/d/yyyy"
        wb["Calendar Sync Log"][f"I{row}"].number_format = "m/d/yyyy h:mm"


def build_workbook():
    wb = Workbook()
    for sheet in SHEET_ORDER[1:]:
        wb.create_sheet(sheet)
    wb._sheets = [wb[name] for name in wb.sheetnames if name in SHEET_ORDER]
    wb._sheets = [wb[sheet] if sheet in wb.sheetnames else wb.create_sheet(sheet) for sheet in SHEET_ORDER]
    build_instructions(wb["Instructions"])
    build_dashboard(wb["Dashboard"])
    build_workers(wb["Workers"])
    build_jobs(wb["Jobs"])
    build_time_entries(wb["Time Entries"])
    build_pay_periods(wb["Pay Periods"])
    build_worker_proof(wb["Worker Proof"])
    build_simple_logs(wb)
    build_dropdowns(wb["Dropdown Lists"])

    # Format date/time columns in simple logs.
    for ws_name in ["Proof Exports", "Access Log", "Correction Log", "Schedule", "Admin Notices", "Calendar Sync Log"]:
        table_style(wb[ws_name], 1, wb[ws_name].max_row, 1, wb[ws_name].max_column)
    wb.save(Path(__file__).resolve().parent / OUTPUT_FILE)
    return Path(__file__).resolve().parent / OUTPUT_FILE


def has_formula(ws, cell_range):
    for row in ws[cell_range]:
        for cell in row:
            if isinstance(cell.value, str) and cell.value.startswith("="):
                return True
    return False


def audit(path):
    wb = load_workbook(path, data_only=False)
    required = {
        "Workers": ["Worker ID", "Worker Name", "Worker Email", "Role", "Access Status", "Created At", "Inactive At", "Notes"],
        "Jobs": ["Job ID", "Job Name", "Client or Site", "Status", "Default Rate", "Calendar Event ID", "Notes"],
        "Time Entries": ["Entry ID", "Worker ID", "Worker Name", "Job ID", "Job Name", "Work Date", "Start Time", "End Time", "Break Minutes", "Hours", "Rate", "Gross Pay", "Reimbursement", "Deduction", "Net Pay", "Approval Status", "Submitted At", "Approved At", "Correction Note", "Notes"],
        "Pay Periods": ["Pay Period ID", "Worker ID", "Worker Name", "Period Start", "Period End", "Status", "Payment Status", "Total Hours", "Gross Pay", "Reimbursement Total", "Deduction Total", "Net Pay", "Finalized At", "Paid At", "Notes"],
        "Proof Exports": ["Export ID", "Worker ID", "Worker Name", "Pay Period ID", "Export Type", "Generated At", "Generated By", "Export Reference", "Notes"],
        "Access Log": ["Log ID", "Worker ID", "Worker Name", "Previous Status", "New Status", "Changed At", "Changed By", "Reason"],
        "Correction Log": ["Correction ID", "Entry ID", "Worker ID", "Worker Name", "Pay Period ID", "Correction Date", "Corrected By", "Correction Reason", "Original Value Summary", "New Value Summary", "Notes"],
        "Schedule": ["Schedule ID", "Job ID", "Job Name", "Worker ID", "Worker Name", "Scheduled Date", "Start Time", "End Time", "Schedule Status", "Calendar Event ID", "Notes"],
        "Admin Notices": ["Notice ID", "Created At", "Created By", "Recipient Type", "Worker ID", "Worker Name", "Subject", "Message", "Related Pay Period ID", "Delivery Method", "Notice Status", "Sent At", "Notes"],
        "Calendar Sync Log": ["Calendar Log ID", "Job ID", "Job Name", "Worker ID", "Worker Name", "Calendar Event ID", "Event Date", "Sync Status", "Last Synced At", "Notes"],
        "Dropdown Lists": list(DROPDOWNS.keys()),
    }
    checks = [
        ("workbook file exists", path.exists()),
        ("exactly 14 tabs", len(wb.sheetnames) == 14),
        ("tab order matches prompt", wb.sheetnames == SHEET_ORDER),
        ("Dashboard formulas exist", has_formula(wb["Dashboard"], "A5:H8")),
        ("Time Entries formulas exist", has_formula(wb["Time Entries"], "C2:O200")),
        ("Pay Period formulas exist", has_formula(wb["Pay Periods"], "C2:L100")),
        ("Worker Proof formulas exist", has_formula(wb["Worker Proof"], "A13:M34")),
        ("Worker Proof selected worker selector exists", wb["Worker Proof"]["B3"].value == "W-1001"),
        ("Worker Proof selector check exists", "worker/pay period match" in str(wb["Worker Proof"]["B10"].value)),
        ("Worker Proof print area exists", bool(wb["Worker Proof"].print_area)),
        ("Schedule tab states not proof", "not proof" in str(wb["Schedule"]["K2"].value).lower()),
        ("Admin Notices tab states not chat/proof", "not chat" in str(wb["Admin Notices"]["M2"].value).lower()),
        ("active worker sample exists", any(row[4].value == "Active" for row in wb["Workers"].iter_rows(min_row=2, max_col=5))),
        ("inactive worker sample exists", any(row[4].value == "Inactive" for row in wb["Workers"].iter_rows(min_row=2, max_col=5))),
    ]
    for sheet_name, headers in required.items():
        actual = [wb[sheet_name].cell(1, col).value for col in range(1, len(headers) + 1)]
        checks.append((f"{sheet_name} required headers exist", actual == headers))
    validation_count = sum(len(ws.data_validations.dataValidation) for ws in wb.worksheets)
    checks.append(("data validation applied", validation_count >= 24))
    text = " ".join(str(cell.value).lower() for ws in wb.worksheets for row in ws.iter_rows() for cell in row if cell.value)
    forbidden = ["gmail.com", "outlook.com", "yahoo.com", "api key", "password", "token"]
    checks.append(("no real/private data strings", not any(term in text for term in forbidden)))
    passed = all(result for _, result in checks)
    print("CrewPay Ledger workbook audit")
    print(f"Output file path: {path}")
    print(f"Sheet names: {wb.sheetnames}")
    for label, result in checks:
        print(f"{'PASS' if result else 'FAIL'} - {label}")
    print(f"Overall audit: {'PASS' if passed else 'FAIL'}")
    return passed


if __name__ == "__main__":
    output = build_workbook()
    if not audit(output):
        raise SystemExit(1)
