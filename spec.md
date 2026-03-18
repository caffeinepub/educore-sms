# EduCore SMS

## Current State
The app has a demo login page where users pick a name and role from a dropdown — no real authentication. There is no password system, no user account management, and no per-user credentials. All role data is mock data stored in localStorage. The Admin, Superadmin, and other dashboards exist with full module functionality.

## Requested Changes (Diff)

### Add
- Proper email + password login form replacing the demo role selector
- UserAccount type: id, email, password (hashed/stored), role, linkedId (studentId/staffId), schoolId, mustChangePassword (bool), isActive (bool), createdAt
- Seed user accounts in mockData for all existing students and staff (email from their records, default password Welcome@123, mustChangePassword: true)
- Admin accounts for each school seeded with known credentials
- Force password change screen: shown after login when mustChangePassword === true; user must set a new password before proceeding
- Change Password section: available from sidebar/profile for all logged-in users
- Admin "User Accounts" module section in AdminDashboard: table of all user accounts for the school, with columns for Name, Email, Role, Status, Last Login; actions: Edit email, Delete account, Force Reset password (sets back to Welcome@123 + mustChangePassword = true)
- Superadmin sees user accounts across all schools
- Auto-create account when Admin adds a student or staff record (email from the form, default password Welcome@123, mustChangePassword: true)
- Account deletion is independent of disabling a student (both can coexist)
- In-memory/localStorage persistence for accounts

### Modify
- LoginPage: replace demo name+role selector with email + password fields; on submit, look up user account by email, validate password, set session
- AppContext: add userAccounts state, setUserAccounts; login logic validates credentials; logout clears session
- Layout: add "Change Password" option in sidebar user area / profile dropdown
- AdminDashboard: add "User Accounts" section to sidebar nav
- StudentInfoModule: when adding a student, auto-create a user account for that student
- HRModule: when adding a staff member, auto-create a user account for that staff member

### Remove
- Demo role selector and name input from login page
- Free-login without credentials

## Implementation Plan
1. Add UserAccount type to types/index.ts
2. Seed user accounts in mockData.ts for all existing students, staff, admin accounts
3. Update AppContext to store userAccounts, handle login/logout via credential validation, track mustChangePassword
4. Replace LoginPage with email+password form; show errors on invalid credentials
5. Add ForceChangePassword component shown after login when mustChangePassword is true
6. Add ChangePassword component accessible from the sidebar
7. Add UserAccountsModule component for Admin (view all accounts, edit email, delete, force reset)
8. Wire UserAccountsModule into AdminDashboard and SuperadminDashboard
9. Update StudentInfoModule to auto-create account on student add
10. Update HRModule to auto-create account on staff add
