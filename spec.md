# EduCore SMS — Barcode Bulk Print & Camera Scanner Issue/Return

## Current State
The Library module exists in `LibraryModule.tsx` with:
- Book catalog with accession numbers and fake QR codes (static visual)
- Issue/return managed by librarian via UI forms
- Individual QR code dialog per book

## Requested Changes (Diff)

### Add
- **Barcode Bulk Print Module**: New tab/section in Librarian dashboard. Select multiple books via checkboxes, preview all their barcodes (using real `qrcode` library or Code128 barcode style), and trigger a browser print dialog that outputs a print-friendly grid of barcodes with book title, accession number, and QR/barcode label per book.
- **Camera Scanner for Issue/Return**: A dedicated scanner dialog (accessible from the Issue/Return section) using `useQRScanner` hook. Librarian opens scanner, points camera at a book barcode/QR, the app auto-detects the accession number, looks up the book, and shows quick issue or return action buttons based on book status.

### Modify
- `LibraryModule.tsx`: Add Bulk Print tab and Scanner button to Issue/Return workflow.
- Navigation/tabs in LibrarianDashboard to expose the new Bulk Print section.

### Remove
- Nothing removed.

## Implementation Plan
1. Add `BulkBarcodePrint` component: book list with checkboxes, select-all, print preview, and `window.print()` with print-only CSS.
2. Use `qrcode` npm package (or generate SVG QR codes using existing QRBox pattern) to render real scannable QR codes containing the accession number.
3. Add `BarcodeScannerDialog` component using `useQRScanner` from `qr-code/useQRScanner`.
4. On QR scan result, look up book by accession number from local book list, show book details + Issue / Return / Already Returned status.
5. Wire both into the existing `LibraryModule.tsx` tabs.
