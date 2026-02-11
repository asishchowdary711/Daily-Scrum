<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38BDF8?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

# ⚡ ScrumPro — Daily Stand-up Tracker

A modern, feature-rich SCRUM meeting application built with React. Designed to replace Excel-based project tracking with an interactive Kanban board, action item tracker, and real-time status management — all in a premium dark-themed UI.

---

## 📸 Features

### 🗂️ Kanban Board (Drag & Drop)
- **5 columns**: To Do → In Progress → Ready for QA → Live → Closed
- Drag and drop tasks between columns to update status instantly
- Color-coded column headers with live item counts
- Priority indicators (🔴 High, 🟡 Medium, 🟢 Low) on every card
- Click any card to view/edit full details in a modal

### 📋 Action Item Tracker
- Tabular view for daily action items with **status filter pills** (All / Open / In Progress / On Hold / Live / Closed)
- **Sortable columns** — click Area, Status, or Responsible to sort
- **Expandable rows** — click any row to reveal full history, notes, dates, and comments
- Real-time search across all fields

### 📝 Simple List Views
- Clean card-based layout for Periodic Updates and Generic Items
- Searchable and filterable

### ✨ Interactive UI
| Feature | Description |
|---------|-------------|
| **Create Issue** | Modal form adapts to project type (Kanban vs Table) |
| **Issue Detail** | Click any Kanban card to view/edit/delete with inline editing |
| **Notifications** | Bell icon with unread badge, typed alerts, "Mark all read" |
| **Settings** | Theme switcher (Dark/Light/Auto), compact mode, date format |
| **User Menu** | Profile dropdown with Settings, Help, and Sign Out |
| **Global Search** | Live filtering across all views with clear button |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| [React 19](https://react.dev/) | UI framework |
| [Vite 7](https://vitejs.dev/) | Build tool & dev server |
| [TailwindCSS 3](https://tailwindcss.com/) | Utility-first styling |
| [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) | Drag-and-drop for Kanban |
| [Lucide React](https://lucide.dev/) | Icon library |
| [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge) | Conditional class utilities |
| [date-fns](https://date-fns.org/) | Date formatting |
| Python (openpyxl) | Excel data extraction |

---

## 📁 Project Structure

```
Daily-Scrum/
├── extract_all_data.py          # Python script to parse Excel → initialData.js
├── inspect_excel.py             # Excel inspection utility
├── QBE Project Daily Action Items_2026.xlsx   # Source data (not in git)
│
└── scrum-app/                   # React application
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx           # App shell: sidebar, header, nav
    │   │   ├── KanbanBoard.jsx      # Drag-and-drop board
    │   │   ├── IssueCard.jsx        # Draggable task card
    │   │   ├── TableView.jsx        # Action items table with filters
    │   │   ├── SimpleListView.jsx   # Card list for simple sheets
    │   │   ├── Modal.jsx            # Reusable modal component
    │   │   ├── CreateIssueModal.jsx # New issue form
    │   │   ├── IssueDetailModal.jsx # View/edit/delete issue
    │   │   ├── NotificationsPanel.jsx # Notifications dropdown
    │   │   └── SettingsModal.jsx    # App settings
    │   ├── data/
    │   │   └── initialData.js       # Extracted data from Excel
    │   ├── App.jsx                  # Root component & state management
    │   ├── index.css                # Tailwind directives & design system
    │   └── main.jsx                 # Entry point
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later)
- [Python 3](https://www.python.org/) (only if re-extracting Excel data)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/asishchowdary711/Daily-Scrum.git
cd Daily-Scrum

# 2. Navigate to the React app
cd scrum-app

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

The app will be available at **http://localhost:5173/**

### Production Build

```bash
npm run build
npm run preview
```

---

## 📊 Data Pipeline

The application data is extracted from `QBE Project Daily Action Items_2026.xlsx` using a Python script:

```bash
# Install Python dependency (if not already installed)
pip install openpyxl pandas

# Run the extraction (from root directory)
python extract_all_data.py
```

This parses 4 Excel sheets and writes structured JSON to `scrum-app/src/data/initialData.js`:

| Excel Sheet | App View | Items |
|------------|----------|-------|
| Cortex items | Kanban Board | 14 CRs |
| July 2024 Dup | Action Item Table | ~72 items |
| Periodic Updates | Simple List | Variable |
| Generic & Other Items | Simple List | Variable |

### Data Mapping

| Excel Column | App Field |
|-------------|-----------|
| CR | Ticket Code (e.g., FBFM-170) |
| Description | Title |
| Status | Normalized status + column placement |
| Live Date | Due date badge |
| Comments | Comments preview |
| Responsible | Assignee |
| Next Action | Expandable notes |

Status values are **automatically normalized** (e.g., `Closed`, `CLosed`, `closed` → **Closed**).

---

## 🎯 Usage in SCRUM Meetings

1. **Open the Cortex Board** — review release status, drag tickets as you discuss updates
2. **Switch to Daily Action Items** — walk through open items filtered by status
3. **Use filters** to focus — e.g., filter "On Hold" to discuss blockers
4. **Expand rows** to read full notes and history
5. **Create issues** on the fly during the meeting
6. **Search** for specific items by name, assignee, or keyword

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  Built with ❤️ for efficient daily stand-ups
</p>
