import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Shift {
    id: string;
    endHour: bigint;
    name: string;
    gracePeriodMinutes: bigint;
    endMinute: bigint;
    halfDayHours: number;
    startMinute: bigint;
    startHour: bigint;
}
export interface LeaveRequest {
    id: string;
    status: LeaveStatus;
    appliedAt: bigint;
    endDate: string;
    days: number;
    reviewNote?: string;
    reviewedAt?: bigint;
    reviewedBy?: string;
    employeeId: string;
    leaveType: LeaveType;
    startDate: string;
    reason: string;
}
export type EmployeeKey = string;
export interface Notification {
    id: string;
    title: string;
    userId: Principal;
    notificationType: NotificationType;
    createdAt: bigint;
    isRead: boolean;
    message: string;
    relatedId?: string;
}
export interface Branch {
    id: string;
    name: string;
    isActive: boolean;
    location: string;
}
export interface Employee {
    id: EmployeeKey;
    salary: number;
    userId: Principal;
    name: string;
    designation: string;
    role: string;
    joiningDate: string;
    isActive: boolean;
    email: string;
    employeeId: string;
    phone: string;
    photo?: ExternalBlob;
    department: string;
    branchId: string;
    shiftId: string;
}
export interface AttendanceRecord {
    id: string;
    locationLat?: number;
    locationLng?: number;
    status: AttendanceStatus;
    date: string;
    checkInTime?: bigint;
    employeeId: string;
    notes: string;
    checkOutTime?: bigint;
    overtimeMinutes: bigint;
}
export interface Holiday {
    id: string;
    holidayType: string;
    isRecurring: boolean;
    date: string;
    name: string;
}
export interface LeaveBalance {
    paid: number;
    sick: number;
    year: bigint;
    unpaid: number;
    employeeId: string;
    casual: number;
}
export interface UserProfile {
    name: string;
    email: string;
}
export enum AttendanceStatus {
    halfDay = "halfDay",
    present = "present",
    late = "late",
    absent = "absent",
    holiday = "holiday"
}
export enum LeaveStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum LeaveType {
    paid = "paid",
    sick = "sick",
    unpaid = "unpaid",
    casual = "casual"
}
export enum NotificationType {
    leaveApproved = "leaveApproved",
    leaveRejected = "leaveRejected",
    lateAlert = "lateAlert",
    general = "general"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addShift(shift: Shift): Promise<void>;
    applyLeave(request: LeaveRequest): Promise<string>;
    approveLeave(leaveId: string, reviewNote: string | null): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkIn(locationLat: number | null, locationLng: number | null, notes: string): Promise<string>;
    checkOut(recordId: string): Promise<void>;
    createBranch(branch: Branch): Promise<void>;
    createEmployee(employee: Employee): Promise<void>;
    createHoliday(holiday: Holiday): Promise<void>;
    deleteEmployee(id: EmployeeKey): Promise<void>;
    deleteHoliday(id: string): Promise<void>;
    getAllEmployees(): Promise<Array<Employee>>;
    getBranch(id: string): Promise<Branch>;
    getBranches(): Promise<Array<Branch>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<{
        totalWorkingHoursThisMonth: number;
        totalEmployees: bigint;
        presentToday: bigint;
        lateToday: bigint;
        pendingLeaves: bigint;
        absentToday: bigint;
        avgWorkingHoursPerEmployee: number;
    }>;
    getEmployee(id: EmployeeKey): Promise<Employee>;
    getHoliday(id: string): Promise<Holiday>;
    getHolidays(): Promise<Array<Holiday>>;
    getLeaveBalance(employeeId: string): Promise<LeaveBalance | null>;
    getMyAttendance(month: string): Promise<Array<AttendanceRecord>>;
    getMyLeaves(): Promise<Array<LeaveRequest>>;
    getMyNotifications(): Promise<Array<Notification>>;
    getMyProfile(): Promise<Employee | null>;
    getPayrollSummary(employeeId: string, month: string, _year: bigint): Promise<{
        salary: number;
        estimatedEarnings: number;
        daysPresent: bigint;
        workingDays: bigint;
        overtimeHours: number;
    }>;
    getPendingLeaves(): Promise<Array<LeaveRequest>>;
    getShift(id: string): Promise<Shift>;
    getShifts(): Promise<Array<Shift>>;
    getTeamAttendance(_date: string): Promise<Array<AttendanceRecord>>;
    getTodayStats(): Promise<{
        present: bigint;
        late: bigint;
        absent: bigint;
    }>;
    getUnreadCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initLeaveBalance(balance: LeaveBalance): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    markAbsent(_date: string): Promise<void>;
    markAllRead(): Promise<void>;
    markNotificationRead(notifId: string): Promise<void>;
    rejectLeave(leaveId: string, reviewNote: string | null): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchEmployees(searchText: string, searchBy: string): Promise<Array<Employee>>;
    updateBranch(id: string, branch: Branch): Promise<void>;
    updateEmployee(id: EmployeeKey, updates: Employee): Promise<void>;
    updateShift(id: string, shift: Shift): Promise<void>;
}
