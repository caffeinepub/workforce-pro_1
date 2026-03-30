# WorkForce Pro - HR Management System

## Current State
New project. No existing files.

## Requested Changes (Diff)

### Add
- Full HR Management System with the following modules

#### Authentication & Security
- Email/Password login and registration
- Role selection: Admin, HR, Employee
- Session persistence
- Role-based access control

#### Employee Management
- Add / Edit / Delete employees
- Employee profile: Name, Photo, Employee ID, Department, Designation, Joining Date, Salary, Phone, Email
- Role assignment (Admin/HR/Employee)
- Branch assignment
- Search & filter by name, department, branch, role

#### Attendance System
- Daily Check-in / Check-out with animated button
- Auto time capture on check-in/out
- Late / Half Day detection based on shift config
- Absent auto-mark for employees who haven't checked in
- Multiple shifts: General (9-5), Morning (6-2), Evening (2-10), Night (10-6)
- Overtime calculation (hours beyond shift end)
- GPS location capture (browser geolocation API)
- Calendar view with attendance markers

#### Leave Management
- Leave application (employee side)
- Leave approval/reject (admin/HR side)
- Leave types: Sick, Casual, Paid, Unpaid
- Leave balance tracking
- Leave history with status filter

#### Dashboard & Analytics
- Admin dashboard: Total employees, Present/Absent/Late today, Pending leave requests, Total/Average working hours
- Employee dashboard: Quick stats, today's attendance, leave balance

#### Payroll Foundation
- Salary field per employee
- Working days calculation per month
- Overtime hours tracking
- Deduction-ready data structure

#### Notifications
- Leave approval/reject notifications
- Late check-in alerts
- Unread notification counter

#### Multi-Branch Support
- Branches: Head Office, Branch Office
- Branch assignment per employee

#### Shift Management
- 4 default shifts with start/end times
- Grace period for late detection (15 min default)
- Half-day hours configuration

#### Holiday Calendar
- Pre-configured public holidays for 2026
- Holiday types: Public / Company

#### UI/UX
- Dark mode toggle
- Role-based navigation
- Animated clock-in/out button
- Pull-to-refresh
- Profile management page

### Modify
- Nothing (new project)

### Remove
- Nothing (new project)

## Implementation Plan
1. Backend: employees, attendance records, leave requests, notifications, shifts, holidays, branches stored in Motoko stable vars
2. Backend: CRUD for all entities, attendance check-in/out logic, leave workflow, notification creation
3. Frontend: Auth flow with role selection
4. Frontend: Admin/HR views - employee list, attendance management, leave approvals, dashboard
5. Frontend: Employee views - self check-in/out, leave apply, own history
6. Frontend: Shared - notifications panel, profile, dark mode, shift/holiday config
