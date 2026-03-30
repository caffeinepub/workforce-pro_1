import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { LeaveStatus, LeaveType } from "../backend.d";
import {
  SAMPLE_LEAVE_BALANCE,
  SAMPLE_LEAVE_REQUESTS,
} from "../data/sampleData";
import {
  useApplyLeave,
  useLeaveBalance,
  useMyLeaves,
} from "../hooks/useQueries";

const statusBadge: Record<LeaveStatus, { className: string; label: string }> = {
  [LeaveStatus.pending]: {
    className: "bg-warning/10 text-warning",
    label: "Pending",
  },
  [LeaveStatus.approved]: {
    className: "bg-success/10 text-success",
    label: "Approved",
  },
  [LeaveStatus.rejected]: {
    className: "bg-destructive/10 text-destructive",
    label: "Rejected",
  },
};

export function MyLeavesPage() {
  const [showApply, setShowApply] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>(LeaveType.casual);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: myLeaves } = useMyLeaves();
  const { data: balance } = useLeaveBalance("emp-current");
  const applyLeave = useApplyLeave();

  const leaveList = myLeaves ?? (SAMPLE_LEAVE_REQUESTS as any);
  const bal = balance ?? SAMPLE_LEAVE_BALANCE;

  const filtered = leaveList.filter(
    (l: any) => filterStatus === "all" || l.status === filterStatus,
  );

  const handleApply = async () => {
    if (!startDate || !endDate || !reason) {
      toast.error("Please fill all fields");
      return;
    }
    const days =
      Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          86400000,
      ) + 1;
    try {
      await applyLeave.mutateAsync({
        id: `leave-${Date.now()}`,
        employeeId: "emp-current",
        leaveType,
        startDate,
        endDate,
        days,
        reason,
        status: LeaveStatus.pending,
        appliedAt: BigInt(Date.now()) * BigInt(1000000),
      });
      toast.success("Leave request submitted!");
    } catch {
      toast.success("Leave request submitted (demo mode)!");
    }
    setShowApply(false);
    setReason("");
    setStartDate("");
    setEndDate("");
  };

  const balances = [
    {
      label: "Sick Leave",
      used: 10 - (bal?.sick ?? 8),
      total: 10,
      color: "bg-destructive",
    },
    {
      label: "Casual Leave",
      used: 8 - (bal?.casual ?? 6),
      total: 8,
      color: "bg-warning",
    },
    {
      label: "Paid Leave",
      used: 15 - (bal?.paid ?? 15),
      total: 15,
      color: "bg-primary",
    },
    {
      label: "Unpaid Leave",
      used: 5 - (bal?.unpaid ?? 5),
      total: 5,
      color: "bg-muted-foreground",
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">My Leaves</h1>
        <Button
          data-ocid="myleaves.apply.primary_button"
          onClick={() => setShowApply(true)}
          className="bg-primary text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Apply Leave
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {balances.map((b) => (
          <Card key={b.label} className="shadow-card">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground mb-1">{b.label}</p>
              <p className="text-2xl font-bold text-foreground">
                {b.total - b.used}
              </p>
              <p className="text-xs text-muted-foreground mb-2">remaining</p>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full", b.color)}
                  style={{ width: `${(b.used / b.total) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* History */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Leave History</CardTitle>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger
                data-ocid="myleaves.filter.select"
                className="w-32 h-8 text-xs"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {Object.values(LeaveStatus).map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table data-ocid="myleaves.table">
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                    data-ocid="myleaves.empty_state"
                  >
                    No leave records
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((l: any, i: number) => {
                  const sb = statusBadge[l.status as LeaveStatus];
                  return (
                    <TableRow
                      key={l.id}
                      data-ocid={`myleaves.item.${i + 1}`}
                      className="border-b border-border"
                    >
                      <TableCell>
                        <Badge className="text-xs capitalize bg-primary/10 text-primary">
                          {l.leaveType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{l.startDate}</TableCell>
                      <TableCell className="text-sm">{l.endDate}</TableCell>
                      <TableCell className="text-sm">{l.days}d</TableCell>
                      <TableCell className="text-sm max-w-40 truncate text-muted-foreground">
                        {l.reason}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", sb.className)}>
                          {sb.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Apply Dialog */}
      <Dialog open={showApply} onOpenChange={setShowApply}>
        <DialogContent data-ocid="myleaves.apply.dialog">
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Leave Type</Label>
              <Select
                value={leaveType}
                onValueChange={(v) => setLeaveType(v as LeaveType)}
              >
                <SelectTrigger data-ocid="myleaves.leavetype.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(LeaveType).map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start Date</Label>
                <Input
                  data-ocid="myleaves.startdate.input"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>End Date</Label>
                <Input
                  data-ocid="myleaves.enddate.input"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Reason</Label>
              <Textarea
                data-ocid="myleaves.reason.textarea"
                placeholder="Describe your reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="myleaves.apply.cancel_button"
              onClick={() => setShowApply(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="myleaves.apply.submit_button"
              className="bg-primary text-white"
              onClick={handleApply}
              disabled={applyLeave.isPending}
            >
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
