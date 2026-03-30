import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { AttendanceStatus } from "../backend.d";
import { SAMPLE_ATTENDANCE } from "../data/sampleData";
import { useMyAttendance } from "../hooks/useQueries";

const statusConfig = {
  [AttendanceStatus.present]: {
    label: "P",
    color: "bg-success",
    full: "Present",
  },
  [AttendanceStatus.absent]: {
    label: "A",
    color: "bg-destructive",
    full: "Absent",
  },
  [AttendanceStatus.late]: { label: "L", color: "bg-warning", full: "Late" },
  [AttendanceStatus.halfDay]: {
    label: "H",
    color: "bg-blue-500",
    full: "Half Day",
  },
  [AttendanceStatus.holiday]: {
    label: "Ho",
    color: "bg-purple-500",
    full: "Holiday",
  },
};

export function MyAttendancePage() {
  const [viewDate, setViewDate] = useState(new Date());
  const month = viewDate.toISOString().slice(0, 7);
  const { data: records } = useMyAttendance(month);
  const recList = records ?? (SAMPLE_ATTENDANCE as any);

  const year = viewDate.getFullYear();
  const monthIdx = viewDate.getMonth();
  const firstDay = new Date(year, monthIdx, 1).getDay();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  const prevMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const getRecordForDay = (day: number) => {
    const dateStr = `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return recList.find((r: any) => r.date === dateStr);
  };

  const summary = {
    present: recList.filter((r: any) => r.status === AttendanceStatus.present)
      .length,
    absent: recList.filter((r: any) => r.status === AttendanceStatus.absent)
      .length,
    late: recList.filter((r: any) => r.status === AttendanceStatus.late).length,
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">My Attendance</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Present",
            value: summary.present,
            className: "text-success",
          },
          {
            label: "Absent",
            value: summary.absent,
            className: "text-destructive",
          },
          { label: "Late", value: summary.late, className: "text-warning" },
        ].map((s) => (
          <Card key={s.label} className="shadow-card">
            <CardContent className="pt-5 text-center">
              <p className={cn("text-3xl font-bold", s.className)}>{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Calendar */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="text-sm">
              {viewDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="text-xs font-medium text-muted-foreground py-2"
              >
                {d}
              </div>
            ))}
            {(Array.from({ length: firstDay }) as undefined[])
              .map(() => null)
              .map((_v, idx) => (
                <div key={[...Array(firstDay).keys()][idx]} />
              ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const rec = getRecordForDay(day);
              const sc = rec
                ? statusConfig[rec.status as AttendanceStatus]
                : null;
              const isToday =
                day === new Date().getDate() &&
                monthIdx === new Date().getMonth() &&
                year === new Date().getFullYear();
              return (
                <div
                  key={day}
                  className={cn(
                    "aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-colors",
                    isToday && "ring-2 ring-primary",
                    sc
                      ? `${sc.color} text-white`
                      : "bg-muted/40 text-muted-foreground",
                  )}
                  title={sc?.full}
                >
                  {day}
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div className="flex gap-4 mt-4 flex-wrap">
            {Object.values(statusConfig).map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <div className={cn("w-3 h-3 rounded-full", s.color)} />
                <span className="text-xs text-muted-foreground">{s.full}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">This Month's Records</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recList.slice(0, 10).map((rec: any, i: number) => {
            const sc = statusConfig[rec.status as AttendanceStatus];
            return (
              <div
                key={rec.id}
                data-ocid={`myattendance.item.${i + 1}`}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <p className="text-sm font-medium">{rec.date}</p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  {rec.checkInTime && (
                    <span>In: {formatTime(rec.checkInTime)}</span>
                  )}
                  {rec.checkOutTime && (
                    <span>Out: {formatTime(rec.checkOutTime)}</span>
                  )}
                </div>
                {sc && (
                  <Badge className={cn("text-xs", `${sc.color} text-white`)}>
                    {sc.full}
                  </Badge>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function formatTime(nanoseconds: bigint): string {
  const ms = Number(nanoseconds) / 1_000_000;
  return new Date(ms).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
