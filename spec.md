# EduCore SMS

## Current State
HR module exists (HRModule.tsx) with basic staff directory, manual radio-button attendance, and payroll generation. No QR codes, no live photo capture, no leave management, no staff type distinction.

## Requested Changes (Diff)

### Add
- Staff Type field: Teaching / Non-Teaching (with subtypes: Peon, Clerk, Lab Assistant, Security, etc.)
- QR code-based attendance: each staff member has a unique QR code; scanning captures live webcam photo + timestamp automatically
- Leave Management tab: staff can apply for leave (leave type, dates, reason); Admin can approve/reject
- Staff self-view: staff (teacher role) can view their own attendance history and leave status
- QR attendance scan page: shows camera feed + QR scanner, on successful scan saves attendance with photo snapshot and timestamp
- Bulk attendance via QR scan station (Admin scans staff QR on a central device)

### Modify
- Staff add/edit form: add Staff Type dropdown (Teaching/Non-Teaching), Designation field, and Qualification field
- Attendance tab: replace radio buttons with QR-scan based attendance; keep manual override for Admin
- Payroll: auto-calculate based on present days, deductions for absences/late

### Remove
- Plain radio-button attendance UI (replaced by QR + photo approach)

## Implementation Plan
1. Update Staff type in frontend to include staffType, designation, qualification fields
2. Rebuild HRModule.tsx with 5 tabs: Directory, QR Attendance, Leave Management, Payroll, Reports
3. QR Attendance tab: camera-based QR scanner (reuse existing camera/qr-code component pattern), on scan capture photo snapshot + log attendance with timestamp
4. Each staff profile page shows their QR code for printing
5. Leave Management: table of leave requests, apply form, admin approve/reject buttons
6. Staff (teacher) dashboard: add HR tab showing their own attendance and leave records
7. Payroll: net salary = basic - (absent days * daily rate) + allowances
