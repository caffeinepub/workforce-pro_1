import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { AttendanceStatus } from "../backend.d";
import {
  AVATAR_COLORS,
  SAMPLE_ATTENDANCE,
  SAMPLE_EMPLOYEES,
  formatTime,
  getInitials,
} from "../data/sampleData";
import { useEmployees, useTeamAttendance } from "../hooks/useQueries";

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
    className:
      "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  },
  [AttendanceStatus.holiday]: {
    label: "Holiday",
    className:
      "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  },
};

export function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: employees, isLoading: empLoading } = useEmployees();
  const { data: attendance, isLoading: attLoading } =
    useTeamAttendance(selectedDate);

  const empList = employees ?? (SAMPLE_EMPLOYEES as any);
  const attList = attendance ?? (SAMPLE_ATTENDANCE as any);
  const isLoading = empLoading || attLoading;

  const filteredAtt = attList.filter(
    (a: any) => filterStatus === "all" || a.status === filterStatus,
  );

  const getEmp = (id: string) => empList.find((e: any) => e.id === id);

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Attendance</h1>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 bg-card rounded-xl p-4 shadow-card">
        <div className="relative">
          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="attendance.date.input"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="pl-9 w-44 h-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger
            data-ocid="attendance.status.select"
            className="w-36 h-9"
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.values(AttendanceStatus).map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex gap-2 text-sm">
          {Object.values(AttendanceStatus)
            .slice(0, 3)
            .map((s) => {
              const count = attList.filter((a: any) => a.status === s).length;
              const sc = statusConfig[s];
              return (
                <Badge key={s} className={cn("text-xs", sc.className)}>
                  {sc.label}: {count}
                </Badge>
              );
            })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <Table data-ocid="attendance.table">
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Shift</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Overtime</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              ["s1", "s2", "s3", "s4", "s5"].map((sk) => (
                <TableRow key={sk}>
                  {["c1", "c2", "c3", "c4", "c5", "c6"].map((ck) => (
                    <TableCell key={ck}>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredAtt.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="attendance.empty_state"
                >
                  No attendance records found
                </TableCell>
              </TableRow>
            ) : (
              filteredAtt.map((rec: any, i: number) => {
                const emp = getEmp(rec.employeeId);
                const sc =
                  statusConfig[rec.status as AttendanceStatus] ??
                  statusConfig[AttendanceStatus.absent];
                return (
                  <TableRow
                    key={rec.id}
                    data-ocid={`attendance.item.${i + 1}`}
                    className="border-b border-border"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-7 h-7">
                          <AvatarFallback
                            className={cn(
                              "text-xs font-bold text-white",
                              AVATAR_COLORS[i % AVATAR_COLORS.length],
                            )}
                          >
                            {getInitials(emp?.name ?? "?")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {emp?.name ?? "Unknown"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      General
                    </TableCell>
                    <TableCell className="text-sm">
                      {rec.checkInTime ? (
                        formatTime(rec.checkInTime)
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {rec.checkOutTime ? (
                        formatTime(rec.checkOutTime)
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-xs", sc.className)}>
                        {sc.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {Number(rec.overtimeMinutes) > 0 ? (
                        <Badge className="bg-primary/10 text-primary text-xs">
                          +{Math.floor(Number(rec.overtimeMinutes) / 60)}h{" "}
                          {Number(rec.overtimeMinutes) % 60}m
                        </Badge>
                      ) : (
                        "--"
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
