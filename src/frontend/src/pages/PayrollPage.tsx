import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { DollarSign } from "lucide-react";
import { useState } from "react";
import {
  AVATAR_COLORS,
  SAMPLE_EMPLOYEES,
  getInitials,
} from "../data/sampleData";
import { useEmployees } from "../hooks/useQueries";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const YEARS = ["2024", "2025", "2026"];

// Mock payroll calculations
function calcPayroll(salary: number, daysInMonth = 26) {
  const workingDays = daysInMonth;
  const daysPresent = Math.floor(Math.random() * 4) + workingDays - 3;
  const overtimeHours = Math.floor(Math.random() * 20);
  const perDay = salary / 22;
  const estimated =
    perDay * daysPresent + overtimeHours * (salary / 22 / 8) * 1.5;
  return {
    workingDays,
    daysPresent,
    overtimeHours,
    estimated: Math.round(estimated),
  };
}

export function PayrollPage() {
  const [month, setMonth] = useState(String(new Date().getMonth()));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const { data: employees, isLoading } = useEmployees();
  const empList = employees ?? (SAMPLE_EMPLOYEES as any);

  const totalPayroll = empList.reduce((sum: number, emp: any) => {
    const { estimated } = calcPayroll(emp.salary);
    return sum + estimated;
  }, 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Payroll</h1>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 bg-card rounded-xl p-4 shadow-card items-center">
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger data-ocid="payroll.month.select" className="w-36 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => (
              <SelectItem key={m} value={String(i)}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger data-ocid="payroll.year.select" className="w-24 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-success" />
          <span className="text-sm font-semibold text-foreground">
            Total: ${totalPayroll.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <Table data-ocid="payroll.table">
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Base Salary</TableHead>
              <TableHead>Working Days</TableHead>
              <TableHead>Days Present</TableHead>
              <TableHead>Overtime (hrs)</TableHead>
              <TableHead>Est. Earnings</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }, (_, i) => `skel-row-${i}`).map(
                  (key) => (
                    <TableRow key={key}>
                      {["c0", "c1", "c2", "c3", "c4", "c5", "c6"].map((ck) => (
                        <TableCell key={ck}>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ),
                )
              : empList.map((emp: any, i: number) => {
                  const { workingDays, daysPresent, overtimeHours, estimated } =
                    calcPayroll(emp.salary);
                  return (
                    <TableRow
                      key={emp.id}
                      data-ocid={`payroll.item.${i + 1}`}
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
                              {getInitials(emp.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {emp.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {emp.department}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        ${emp.salary?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm">{workingDays}</TableCell>
                      <TableCell className="text-sm">{daysPresent}</TableCell>
                      <TableCell className="text-sm">
                        {overtimeHours > 0 ? (
                          <Badge className="bg-primary/10 text-primary text-xs">
                            {overtimeHours}h
                          </Badge>
                        ) : (
                          "--"
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold text-success">
                          ${estimated.toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
