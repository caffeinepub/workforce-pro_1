import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AttendanceRecord,
  Branch,
  Employee,
  Holiday,
  LeaveBalance,
  LeaveRequest,
  Notification,
  Shift,
} from "../backend.d";
import {
  SAMPLE_ATTENDANCE,
  SAMPLE_BRANCHES,
  SAMPLE_EMPLOYEES,
  SAMPLE_HOLIDAYS,
  SAMPLE_LEAVE_BALANCE,
  SAMPLE_LEAVE_REQUESTS,
  SAMPLE_NOTIFICATIONS,
  SAMPLE_SHIFTS,
} from "../data/sampleData";
import { useActor } from "./useActor";

export function useEmployees() {
  const { actor, isFetching } = useActor();
  return useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      if (!actor) return SAMPLE_EMPLOYEES as any;
      const result = await actor.getAllEmployees();
      return result.length > 0 ? result : (SAMPLE_EMPLOYEES as any);
    },
    enabled: !isFetching,
    placeholderData: SAMPLE_EMPLOYEES as any,
  });
}

export function useEmployee(id: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Employee>({
    queryKey: ["employee", id],
    queryFn: async () => {
      if (!actor || !id) throw new Error("No actor");
      return actor.getEmployee(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useBranches() {
  const { actor, isFetching } = useActor();
  return useQuery<Branch[]>({
    queryKey: ["branches"],
    queryFn: async () => {
      if (!actor) return SAMPLE_BRANCHES;
      const result = await actor.getBranches();
      return result.length > 0 ? result : SAMPLE_BRANCHES;
    },
    enabled: !isFetching,
    placeholderData: SAMPLE_BRANCHES,
  });
}

export function useShifts() {
  const { actor, isFetching } = useActor();
  return useQuery<Shift[]>({
    queryKey: ["shifts"],
    queryFn: async () => {
      if (!actor) return SAMPLE_SHIFTS as any;
      const result = await actor.getShifts();
      return result.length > 0 ? result : (SAMPLE_SHIFTS as any);
    },
    enabled: !isFetching,
    placeholderData: SAMPLE_SHIFTS as any,
  });
}

export function useHolidays() {
  const { actor, isFetching } = useActor();
  return useQuery<Holiday[]>({
    queryKey: ["holidays"],
    queryFn: async () => {
      if (!actor) return SAMPLE_HOLIDAYS;
      const result = await actor.getHolidays();
      return result.length > 0 ? result : SAMPLE_HOLIDAYS;
    },
    enabled: !isFetching,
    placeholderData: SAMPLE_HOLIDAYS,
  });
}

export function useDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor)
        return {
          totalEmployees: BigInt(8),
          presentToday: BigInt(6),
          lateToday: BigInt(1),
          absentToday: BigInt(1),
          pendingLeaves: BigInt(2),
          totalWorkingHoursThisMonth: 1240,
          avgWorkingHoursPerEmployee: 155,
        };
      return actor.getDashboardStats();
    },
    enabled: !isFetching,
    refetchInterval: 60000,
  });
}

export function useTeamAttendance(date: string) {
  const { actor, isFetching } = useActor();
  return useQuery<AttendanceRecord[]>({
    queryKey: ["teamAttendance", date],
    queryFn: async () => {
      if (!actor) return SAMPLE_ATTENDANCE as any;
      const result = await actor.getTeamAttendance(date);
      return result.length > 0 ? result : (SAMPLE_ATTENDANCE as any);
    },
    enabled: !isFetching && !!date,
    placeholderData: SAMPLE_ATTENDANCE as any,
  });
}

export function useMyAttendance(month: string) {
  const { actor, isFetching } = useActor();
  return useQuery<AttendanceRecord[]>({
    queryKey: ["myAttendance", month],
    queryFn: async () => {
      if (!actor) return SAMPLE_ATTENDANCE as any;
      const result = await actor.getMyAttendance(month);
      return result.length > 0 ? result : (SAMPLE_ATTENDANCE as any);
    },
    enabled: !isFetching,
    placeholderData: SAMPLE_ATTENDANCE as any,
  });
}

export function usePendingLeaves() {
  const { actor, isFetching } = useActor();
  return useQuery<LeaveRequest[]>({
    queryKey: ["pendingLeaves"],
    queryFn: async () => {
      if (!actor)
        return SAMPLE_LEAVE_REQUESTS.filter(
          (l) => l.status === "pending",
        ) as any;
      const result = await actor.getPendingLeaves();
      return result.length > 0
        ? result
        : (SAMPLE_LEAVE_REQUESTS.filter((l) => l.status === "pending") as any);
    },
    enabled: !isFetching,
  });
}

export function useMyLeaves() {
  const { actor, isFetching } = useActor();
  return useQuery<LeaveRequest[]>({
    queryKey: ["myLeaves"],
    queryFn: async () => {
      if (!actor) return SAMPLE_LEAVE_REQUESTS as any;
      const result = await actor.getMyLeaves();
      return result.length > 0 ? result : (SAMPLE_LEAVE_REQUESTS as any);
    },
    enabled: !isFetching,
  });
}

export function useLeaveBalance(employeeId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<LeaveBalance | null>({
    queryKey: ["leaveBalance", employeeId],
    queryFn: async () => {
      if (!actor) return SAMPLE_LEAVE_BALANCE as any;
      const result = await actor.getLeaveBalance(employeeId);
      return result ?? (SAMPLE_LEAVE_BALANCE as any);
    },
    enabled: !isFetching,
  });
}

export function useNotifications() {
  const { actor, isFetching } = useActor();
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return SAMPLE_NOTIFICATIONS as any;
      const result = await actor.getMyNotifications();
      return result.length > 0 ? result : (SAMPLE_NOTIFICATIONS as any);
    },
    enabled: !isFetching,
  });
}

export function useUnreadCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["unreadCount"],
    queryFn: async () => {
      if (!actor) return BigInt(2);
      return actor.getUnreadCount();
    },
    enabled: !isFetching,
    refetchInterval: 30000,
  });
}

export function useMyProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<Employee | null>({
    queryKey: ["myProfile"],
    queryFn: async () => {
      if (!actor) return SAMPLE_EMPLOYEES[0] as any;
      return actor.getMyProfile();
    },
    enabled: !isFetching,
  });
}

export function useUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userRole"],
    queryFn: async () => {
      if (!actor) return "admin";
      return actor.getCallerUserRole();
    },
    enabled: !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return true;
      return actor.isCallerAdmin();
    },
    enabled: !isFetching,
  });
}

export function useCreateEmployee() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (employee: any) => {
      if (!actor) throw new Error("Not connected");
      await actor.createEmployee(employee);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useUpdateEmployee() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, employee }: { id: string; employee: any }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateEmployee(id, employee);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useDeleteEmployee() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteEmployee(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useApproveLeave() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      leaveId,
      note,
    }: { leaveId: string; note: string }) => {
      if (!actor) throw new Error("Not connected");
      await actor.approveLeave(leaveId, note || null);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pendingLeaves"] });
    },
  });
}

export function useRejectLeave() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      leaveId,
      note,
    }: { leaveId: string; note: string }) => {
      if (!actor) throw new Error("Not connected");
      await actor.rejectLeave(leaveId, note || null);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pendingLeaves"] });
    },
  });
}

export function useApplyLeave() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (request: any) => {
      if (!actor) throw new Error("Not connected");
      return actor.applyLeave(request);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myLeaves"] });
    },
  });
}

export function useCheckIn() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      lat,
      lng,
      notes,
    }: { lat: number | null; lng: number | null; notes: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.checkIn(lat, lng, notes);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myAttendance"] });
    },
  });
}

export function useCheckOut() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (recordId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.checkOut(recordId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myAttendance"] });
    },
  });
}

export function useMarkAllRead() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      await actor.markAllRead();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });
}

export function useCreateBranch() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (branch: any) => {
      if (!actor) throw new Error("Not connected");
      await actor.createBranch(branch);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branches"] });
    },
  });
}

export function useCreateHoliday() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (holiday: any) => {
      if (!actor) throw new Error("Not connected");
      await actor.createHoliday(holiday);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["holidays"] });
    },
  });
}

export function useDeleteHoliday() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteHoliday(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["holidays"] });
    },
  });
}

export function useUpdateShift() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, shift }: { id: string; shift: any }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateShift(id, shift);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shifts"] });
    },
  });
}

export function usePayrollSummary(
  employeeId: string,
  month: string,
  year: bigint,
) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["payroll", employeeId, month, year.toString()],
    queryFn: async () => {
      if (!actor || !employeeId) return null;
      return actor.getPayrollSummary(employeeId, month, year);
    },
    enabled: !!actor && !isFetching && !!employeeId,
  });
}
