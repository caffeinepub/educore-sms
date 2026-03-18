# EduCore SMS

## Current State
Student Attendance section exists in StudentInfoModule.tsx with basic manual daily attendance (select course/sem, mark Present/Absent/Late/Half-Day per student, save). No QR code or RFID support.

## Requested Changes (Diff)

### Add
- **QR Code Attendance Mode**: Camera-based QR scanner (using existing qr-code component). Each student has a unique QR code (based on Roll No / Admission No). When scanned, system auto-marks that student as Present with timestamp. Multiple scans possible in session.
- **RFID Attendance Mode**: Text input field simulating RFID reader input (USB HID device sends card ID as keypress + Enter). Admin/Teacher enters or scanner auto-types the RFID/card ID and system looks up the student and marks attendance.
- **Attendance Mode Selector**: Three tab/button modes -- Manual, QR Scan, RFID.
- **Session Management**: Select Date, Course, Sem/Year before starting attendance in any mode.
- **Live Attendance Log**: Real-time list showing students marked in current session with timestamp and method used (Manual/QR/RFID).
- **Student QR Codes**: In Student List, each student can view/print their personal attendance QR code.

### Modify
- StudentInfoModule.tsx -- Replace attendance section with enhanced multi-mode attendance UI
- Attendance state model -- Add `method` field (manual/qr/rfid) and `timestamp` to attendance records

### Remove
- Nothing removed; existing manual attendance logic is preserved and improved

## Implementation Plan
1. Add `method` and `timestamp` fields to AttendanceRecord interface
2. Add attendance mode state: 'manual' | 'qr' | 'rfid'
3. Build Manual mode: existing UI improved with bulk select all / clear
4. Build QR Scan mode: camera view using @zxing/browser or jsQR, decode QR → match student by rollNo/admissionNo → auto-mark present
5. Build RFID mode: focused text input that captures card ID on Enter keypress → lookup student → mark present
6. Build live attendance log panel showing current session marks with method badge and time
7. Add student QR code display in Student List profile view
