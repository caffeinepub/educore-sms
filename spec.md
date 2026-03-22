# EduCore SMS

## Current State
- StudentInfoModule has Add/Edit/Delete students, Student Promote section
- BulkImportModule supports CSV import for students
- ReportsModule has student reports (enrollment, attendance, fee collection)
- No dedicated performance tracking dashboard for Admin

## Requested Changes (Diff)

### Add
- Excel (XLSX) import support in BulkImportModule for students (alongside existing CSV, using SheetJS/xlsx library via CDN or npm)
- Performance Tracking section in StudentInfoModule or ReportsModule: per-student and class-wide exam scores, attendance percentage, grade trends, pass/fail analysis
- Performance dashboard card on Admin Dashboard

### Modify
- BulkImportModule: add Excel (.xlsx, .xls) file parsing in addition to CSV for student imports; show column mapping preview
- ReportsModule: add a "Performance" tab with class-wide analytics, top performers, at-risk students (attendance < 75% or marks < 40%)
- StudentInfoModule (Student List): add a "Performance" column or quick-view button showing attendance % and latest exam average per student

### Remove
- Nothing removed

## Implementation Plan
1. Install `xlsx` (SheetJS) npm package in frontend for Excel parsing
2. Update BulkImportModule to accept .xlsx/.xls files, parse with SheetJS, map columns, preview rows, then import
3. Add Performance tab in ReportsModule with:
   - Class/session filter
   - Table: student name, attendance %, exam average, grade, status (Pass/At-Risk/Fail)
   - Summary cards: top performer, lowest attendance, class average
4. Add performance quick-view in Student List (attendance % badge)
5. Add Performance quick-action card on Admin Dashboard
