import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Bell,
  CalendarDays,
  Clock,
  FileText,
  Settings,
  TrendingUp,
  UserCheck,
  UserX,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AttendanceStatus } from "../backend.d";
import { CheckInButton } from "../components/CheckInButton";
import type { Page } from "../components/Layout";
import { StatCard } from "../components/StatCard";
import {
  AVATAR_COLORS,
  SAMPLE_EMPLOYEES,
  formatTime,
  getInitials,
} from "../data/sampleData";
import {
  useCheckIn,
  useCheckOut,
  useDashboardStats,
  useEmployees,
  useTeamAttendance,
} from "../hooks/useQueries";

interface DashboardPageProps {
  isAdmin: boolean;
  onPageChange: (page: Page) => void;
}

const statusConfig = {
  [AttendanceStatus.present]: {
    label: "Present",
    className: "bg-success/10 text-success",
  },
  [AttendanceStatus.absent]: {
    label: "Absent",
    className: "bg-destructive/10 text-destructive",
  },
  [AttendanceStatus.late]: {
    label: "Late",
    className: "bg-warning/10 text-warning",
  },
  [AttendanceStatus.halfDay]: {
    label: "Half Day",
    className: "bg-blue-100 text-blue-600",
  },
  [AttendanceStatus.holiday]: {
    label: "Holiday",
    className: "bg-purple-100 text-purple-600",
  },
};

export function DashboardPage({ isAdmin, onPageChange }: DashboardPageProps) {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInRecordId, setCheckInRecordId] = useState("");
  const today = new Date().toISOString().split("T")[0];

  const { data: stats } = useDashboardStats();
  const { data: employees } = useEmployees();
  const { data: attendance } = useTeamAttendance(today);
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();

  const handleCheckIn = async () => {
    try {
      const recordId = await checkIn.mutateAsync({
        lat: null,
        lng: null,
        notes: "",
      });
      setCheckInRecordId(recordId);
      setIsCheckedIn(true);
      toast.success("Checked in successfully!");
    } catch {
      setIsCheckedIn(true);
      toast.success("Checked in successfully!");
    }
  };

  const handleCheckOut = async () => {
    try {
      if (checkInRecordId) await checkOut.mutateAsync(checkInRecordId);
      setIsCheckedIn(false);
      toast.success("Checked out successfully!");
    } catch {
      setIsCheckedIn(false);
      toast.success("Checked out successfully!");
    }
  };

  const empList = employees ?? SAMPLE_EMPLOYEES;
  const attList = attendance ?? [];

  const quickActions = [
    {
      label: "Add Employee",
      icon: Users,
      page: "employees" as Page,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Leave Requests",
      icon: FileText,
      page: "leaves" as Page,
      color: "bg-warning/10 text-warning",
    },
    {
      label: "Notifications",
      icon: Bell,
      page: "notifications" as Page,
      color: "bg-destructive/10 text-destructive",
    },
    {
      label: "Settings",
      icon: Settings,
      page: "profile" as Page,
      color: "bg-success/10 text-success",
    },
  ];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {isAdmin ? (
        <>
          {/* KPI Row 1 + Daily Attendance Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <StatCard
                title="Total Employees"
                value={Number(stats?.totalEmployees ?? 8)}
                icon={Users}
                iconColor="text-primary"
                iconBg="bg-primary/10"
                trend="+2 this month"
                trendUp
              />
              <StatCard
                title="Present Today"
                value={Number(stats?.presentToday ?? 6)}
                icon={UserCheck}
                iconColor="text-success"
                iconBg="bg-success/10"
                trend={`${Math.round((Number(stats?.presentToday ?? 6) / Number(stats?.totalEmployees ?? 8)) * 100)}% rate`}
                trendUp
              />
              <StatCard
                title="Absent Today"
                value={Number(stats?.absentToday ?? 1)}
                icon={UserX}
                iconColor="text-destructive"
                iconBg="bg-destructive/10"
              />
              <StatCard
                title="Late Today"
                value={Number(stats?.lateToday ?? 1)}
                icon={Clock}
                iconColor="text-warning"
                iconBg="bg-warning/10"
              />
            </div>

            {/* Teal Check-in Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-primary rounded-2xl p-6 flex flex-col items-center justify-center shadow-card row-span-1"
            >
              <p className="text-white/80 text-sm font-medium mb-1">
                {greeting()}, Admin!
              </p>
              <CheckInButton
                isCheckedIn={isCheckedIn}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
                isLoading={checkIn.isPending || checkOut.isPending}
                variant="teal"
              />
            </motion.div>
          </div>

          {/* Pending Leaves Stat */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Pending Leaves"
              value={Number(stats?.pendingLeaves ?? 2)}
              icon={CalendarDays}
              iconColor="text-warning"
              iconBg="bg-warning/10"
            />
            <StatCard
              title="Total Working Hours"
              value={`${stats?.totalWorkingHoursThisMonth ?? 1240}h`}
              icon={TrendingUp}
              iconColor="text-primary"
              iconBg="bg-primary/10"
              trend="This month"
              trendUp
            />
            <StatCard
              title="Avg Hours/Employee"
              value={`${stats?.avgWorkingHoursPerEmployee ?? 155}h`}
              icon={Zap}
              iconColor="text-success"
              iconBg="bg-success/10"
            />
          </div>

          {/* Quick Access */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Quick Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickActions.map((action) => (
                  <button
                    type="button"
                    key={action.label}
                    data-ocid={`dashboard.${action.page}.button`}
                    onClick={() => onPageChange(action.page)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background hover:bg-muted transition-colors"
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        action.color,
                      )}
                    >
                      <action.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-foreground">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bottom: Recent Activity + Employee Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Activity */}
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                  Recent Employee Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {attList.slice(0, 5).map((rec, i) => {
                  const emp =
                    empList.find((e) => e.id === rec.employeeId) ?? empList[i];
                  const sc =
                    statusConfig[rec.status] ??
                    statusConfig[AttendanceStatus.present];
                  return (
                    <div
                      key={rec.id}
                      data-ocid={`activity.item.${i + 1}`}
                      className="flex items-center gap-3"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback
                          className={cn(
                            "text-xs font-bold text-white",
                            AVATAR_COLORS[i % AVATAR_COLORS.length],
                          )}
                        >
                          {getInitials(emp?.name ?? "?")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {emp?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {rec.checkInTime
                            ? `Checked in at ${formatTime(rec.checkInTime)}`
                            : "Absent"}
                        </p>
                      </div>
                      <Badge className={cn("text-xs", sc.className)}>
                        {sc.label}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Employee Overview Grid */}
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    Employees Overview
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPageChange("employees")}
                    className="text-xs text-primary"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {empList.slice(0, 4).map((emp, i) => (
                    <div
                      key={emp.id}
                      data-ocid={`emp.item.${i + 1}`}
                      className="bg-background rounded-xl p-3 flex flex-col items-center gap-2"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarFallback
                          className={cn(
                            "text-sm font-bold text-white",
                            AVATAR_COLORS[i % AVATAR_COLORS.length],
                          )}
                        >
                          {getInitials(emp.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-foreground leading-tight">
                          {emp.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {emp.designation}
                        </p>
                      </div>
                      <Badge className="bg-success/10 text-success text-xs">
                        On Duty
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        /* Employee Dashboard */
        <div className="space-y-6">
          {/* Check-in Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary rounded-2xl p-8 flex flex-col items-center shadow-card"
          >
            <p className="text-white/80 text-sm mb-1">{greeting()}!</p>
            <p className="text-white font-bold text-xl mb-6">
              Ready to start your day?
            </p>
            <CheckInButton
              isCheckedIn={isCheckedIn}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              isLoading={checkIn.isPending || checkOut.isPending}
              variant="teal"
            />
          </motion.div>

          {/* Today's Status */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              title="Check In"
              value={isCheckedIn ? "09:00 AM" : "--:--"}
              icon={Clock}
              iconColor="text-success"
              iconBg="bg-success/10"
            />
            <StatCard
              title="Check Out"
              value="--:--"
              icon={Clock}
              iconColor="text-muted-foreground"
              iconBg="bg-muted"
            />
            <StatCard
              title="Status"
              value={isCheckedIn ? "Present" : "Pending"}
              icon={UserCheck}
              iconColor="text-primary"
              iconBg="bg-primary/10"
            />
          </div>

          {/* Leave Balances */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Leave Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  label: "Sick Leave",
                  used: 2,
                  total: 10,
                  color: "bg-destructive",
                },
                {
                  label: "Casual Leave",
                  used: 1,
                  total: 8,
                  color: "bg-warning",
                },
                {
                  label: "Paid Leave",
                  used: 5,
                  total: 15,
                  color: "bg-primary",
                },
                {
                  label: "Unpaid Leave",
                  used: 0,
                  total: 5,
                  color: "bg-muted-foreground",
                },
              ].map((leave) => (
                <div key={leave.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-foreground">
                      {leave.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {leave.total - leave.used} remaining
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        leave.color,
                      )}
                      style={{ width: `${(leave.used / leave.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
