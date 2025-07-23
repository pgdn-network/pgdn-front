# PGDN Scan Execution Page (Node View)

## 🎯 Purpose

Build a **dedicated scan execution page** to replace the current scan modal. This will allow users to initiate scans, view live status, and receive intelligent follow-up actions for a single node.

---

## 📦 Page Location

- Exists per node (`http://localhost:5173/organizations/test-organization-1/nodes/d1ec2011-872d-45c0-a7e3-ce351e294af3/scans`)
- Linked to from the scan button in the node details view

---

## 🖼️ Page Layout

### 1. **Scan Controls**
- Buttons to run:
  - `Basic Scan`
  - `Smart Scan`
  - `Custom Scan` (checkboxes or dropdowns for advanced config)

Optional: drawer/overlay for config

---

### 2. **Scan Queue / Recent Jobs**
| Scan Type     | Status    | Trigger    | Started At |
|---------------|-----------|------------|------------|
| Basic         | ✅ Done    | Manual     | Jul 23     |
| SSH Probe     | ⏳ Queued  | Smart Scan | Jul 23     |

- Shows last ~5 jobs
- Clicking a row links to scan result
- Show live progress if possible

---

### 3. **Recommendations Panel**
- Based on previous results, show:
  - Follow-up scan suggestions (e.g., “Port 22 open → suggest SSH Scan”)
  - Retry failed scans
  - Additional probes based on node type

---

## 🛠️ Backend

This is a prototype, so the backend will be minimal.

---

## ✨ UX Goals

- Eliminate modals entirely
- Give scans room to grow as workflows
- Encourage next steps, not just one-off probes

---

## 🔮 Future Extensions

- Scan graph viewer (timeline of scans per node)
- Save custom scan presets per node
- Trigger orchestrations for a node
