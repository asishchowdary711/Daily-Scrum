import pandas as pd
import json
import datetime
import re
import sys

file_path = 'QBE Project Daily Action Items_2026.xlsx'

def clean_value(val):
    if pd.isna(val):
        return ""
    if isinstance(val, (datetime.datetime, datetime.date)):
        return val.strftime('%Y-%m-%d')
    return str(val).strip()

def normalize_status(raw):
    raw = str(raw).lower().strip()
    if raw in ('', 'nan'):
        return 'open'
    if 'closed' in raw or 'clsoed' in raw or 'cloed' in raw:
        return 'closed'
    if 'live' in raw:
        return 'live'
    if 'hold' in raw:
        return 'on-hold'
    if 'progress' in raw:
        return 'in-progress'
    if 'duplicate' in raw:
        return 'closed'
    if 'known' in raw:
        return 'on-hold'
    if 'dev' in raw or 'qa' in raw:
        return 'in-progress'
    return 'open'

def get_priority(status, comments):
    s = str(status).lower() + ' ' + str(comments).lower()
    if any(w in s for w in ['urgent', 'critical', 'block', 'high']):
        return 'high'
    if any(w in s for w in ['low', 'minor']):
        return 'low'
    return 'medium'

# ── Finding 7: Normalize sheet names for fuzzy matching ──
def normalize_sheet_name(name):
    """Normalize a sheet name for fuzzy matching: lowercase, collapse whitespace, normalize & vs and."""
    name = str(name).strip().lower()
    name = re.sub(r'\s+', ' ', name)          # collapse whitespace
    name = name.replace('&', 'and')           # normalize ampersand
    name = name.replace('_', ' ')             # normalize underscores
    return name

EXPECTED_SHEETS = {
    'cortex items': 'cortex',
    'july 2024 dup': 'july2024',
    'periodic updates': 'periodic',
    'generic and other items': 'generic',
}

def find_sheet(sheet_names, target_key):
    """Find a sheet by normalized name. Returns the original sheet name or None."""
    for actual_name in sheet_names:
        normalized = normalize_sheet_name(actual_name)
        if normalized == target_key:
            return actual_name
        # Also try 'contains' match for partial names
        if target_key in normalized or normalized in target_key:
            return actual_name
    return None

try:
    xl = pd.ExcelFile(file_path)
    projects = []

    # Map normalized names to actual sheet names
    sheet_map = {}
    for target_key, project_id in EXPECTED_SHEETS.items():
        actual = find_sheet(xl.sheet_names, target_key)
        if actual:
            sheet_map[project_id] = actual
        else:
            print(f"⚠ WARNING: Expected sheet matching '{target_key}' not found. Available: {xl.sheet_names}", file=sys.stderr)

    # ── 1. Cortex Items (Kanban) ──
    if 'cortex' in sheet_map:
        df = xl.parse(sheet_map['cortex'])
        df.columns = [str(c).strip() for c in df.columns]

        status_map = {
            'todo':       {'id': 'todo',       'title': 'To Do',        'color': '#3b82f6', 'taskIds': []},
            'inprogress': {'id': 'inprogress', 'title': 'In Progress',  'color': '#f59e0b', 'taskIds': []},
            'qa':         {'id': 'qa',         'title': 'Ready for QA', 'color': '#8b5cf6', 'taskIds': []},
            'live':       {'id': 'live',       'title': 'Live',         'color': '#10b981', 'taskIds': []},
            'done':       {'id': 'done',       'title': 'Closed',       'color': '#6b7280', 'taskIds': []},
        }
        tasks = {}

        for idx, row in df.iterrows():
            tid = f"cortex-{idx}"
            raw_status = str(row.get('Status', '')).lower()

            sid = 'todo'
            if 'live' in raw_status:   sid = 'live'
            elif 'progress' in raw_status: sid = 'inprogress'
            elif 'qa' in raw_status:   sid = 'qa'
            elif 'closed' in raw_status: sid = 'done'

            status_map[sid]['taskIds'].append(tid)
            tasks[tid] = {
                'id': tid,
                'code': clean_value(row.get('CR', '')),
                'title': clean_value(row.get('Description', 'No Title')),
                'status': sid,
                'assignee': clean_value(row.get('Assignee', 'Unassigned')) or 'Unassigned',
                'liveDate': clean_value(row.get('Live Date', '')),
                'comments': clean_value(row.get('Comments', '')),
                'priority': get_priority(row.get('Status', ''), row.get('Comments', '')),
            }

        projects.append({
            'id': 'cortex',
            'name': 'Cortex Release',
            'icon': 'Layers',
            'type': 'kanban',
            'columns': list(status_map.values()),
            'tasks': tasks,
        })

    # ── 2. July 2024 Dup (Action items table) ──
    if 'july2024' in sheet_map:
        df = xl.parse(sheet_map['july2024'], header=None)

        header_names = ['#', 'Date Raised', 'Area', 'Item', 'Target Date',
                        'Assignee', 'Raised By', 'Responsible', 'Status',
                        'Next Action', 'Comment']
        raw_headers = [clean_value(c) for c in df.iloc[0]]
        while len(header_names) < len(raw_headers):
            header_names.append(f'Extra {len(header_names)}')

        items = []
        for idx in range(1, len(df)):
            row = df.iloc[idx]
            cells = [clean_value(c) for c in row]

            if all(c == '' for c in cells):
                continue

            area = cells[2] if len(cells) > 2 else ''
            item_desc = cells[3] if len(cells) > 3 else ''
            status_raw = cells[8] if len(cells) > 8 else ''
            responsible = cells[7] if len(cells) > 7 else ''
            next_action = cells[9] if len(cells) > 9 else ''
            assignee = cells[5] if len(cells) > 5 else ''
            date_raised = cells[1] if len(cells) > 1 else ''
            target_date = cells[4] if len(cells) > 4 else ''
            comment = cells[10] if len(cells) > 10 else ''

            status = normalize_status(status_raw)
            priority = get_priority(status_raw, next_action)

            items.append({
                'id': f'july-{idx}',
                'area': area,
                'title': area if area else item_desc,
                'description': item_desc,
                'status': status,
                'statusRaw': status_raw,
                'responsible': responsible,
                'assignee': assignee or responsible,
                'nextAction': next_action,
                'dateRaised': date_raised,
                'targetDate': target_date,
                'comment': comment,
                'priority': priority,
            })

        projects.append({
            'id': 'july2024',
            'name': 'Daily Action Items',
            'icon': 'ClipboardList',
            'type': 'table',
            'headers': header_names[:11],
            'items': items,
        })

    # ── 3. Periodic Updates ──
    if 'periodic' in sheet_map:
        df = xl.parse(sheet_map['periodic'], header=None)
        items = []
        for idx in range(1, len(df)):
            row = df.iloc[idx]
            cells = [clean_value(c) for c in row]
            if all(c == '' for c in cells):
                continue
            area = cells[0] if len(cells) > 0 else ''
            action = cells[1] if len(cells) > 1 else ''
            detail = cells[2] if len(cells) > 2 else ''
            items.append({
                'id': f'periodic-{idx}',
                'area': area,
                'title': area,
                'action': action,
                'detail': detail,
                'status': 'open',
                'priority': 'medium',
            })
        if items:
            projects.append({
                'id': 'periodic',
                'name': 'Periodic Updates',
                'icon': 'CalendarClock',
                'type': 'simple',
                'items': items,
            })

    # ── 4. Generic & Other Items ──
    if 'generic' in sheet_map:
        df = xl.parse(sheet_map['generic'], header=None)
        items = []
        for idx in range(1, len(df)):
            row = df.iloc[idx]
            cells = [clean_value(c) for c in row]
            if all(c == '' for c in cells):
                continue
            items.append({
                'id': f'generic-{idx}',
                'title': cells[0] if len(cells) > 0 else '',
                'description': cells[1] if len(cells) > 1 else '',
                'detail': cells[2] if len(cells) > 2 else '',
                'status': normalize_status(cells[3] if len(cells) > 3 else ''),
                'priority': 'medium',
            })
        if items:
            projects.append({
                'id': 'generic',
                'name': 'Generic & Other Items',
                'icon': 'Boxes',
                'type': 'simple',
                'items': items,
            })

    # ── Write output ──
    js = f"export const initialData = {json.dumps({'projects': projects}, indent=2)};\n"
    with open('scrum-app/src/data/initialData.js', 'w', encoding='utf-8') as f:
        f.write(js)
    print(f"✓ Wrote {len(projects)} projects to initialData.js")

    # Report missing sheets
    found = len(sheet_map)
    expected = len(EXPECTED_SHEETS)
    if found < expected:
        print(f"⚠ WARNING: Only {found}/{expected} expected sheets were matched.", file=sys.stderr)

except Exception as e:
    import traceback
    traceback.print_exc()
