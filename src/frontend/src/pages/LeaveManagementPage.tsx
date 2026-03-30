import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { LeaveStatus, LeaveType } from "../backend.d";
import {
  AVATAR_COLORS,
  SAMPLE_EMPLOYEES,
  SAMPLE_LEAVE_REQUESTS,
  getInitials,
} from "../data/sampleData";
import {
  useApproveLeave,
  useEmployees,
  usePendingLeaves,
  useRejectLeave,
} from "../hooks/useQueries";

const leaveTypeColors: Record<LeaveType, string> = {
  [LeaveType.sick]: "bg-destructive/10 text-destructive",
  [LeaveType.casual]: "bg-warning/10 text-warning",
  [LeaveType.paid]: "bg-primary/10 text-primary",
  [LeaveType.unpaid]: "bg-muted text-muted-foreground",
};

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

export function LeaveManagementPage() {
  const [reviewLeave, setReviewLeave] = useState<any | null>(null);
  const [note, setNote] = useState("");
  const [action, setAction] = useState<"approve" | "reject">("approve");

  const { data: pendingLeaves } = usePendingLeaves();
  const { data: employees } = useEmployees();
  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();

  const pending =
    pendingLeaves ??
    (SAMPLE_LEAVE_REQUESTS.filter((l) => l.status === "pending") as any);
  const all = SAMPLE_LEAVE_REQUESTS as any;
  const empList = employees ?? (SAMPLE_EMPLOYEES as any);

  const getEmp = (id: string) => empList.find((e: any) => e.id === id);

  const handleReview = async () => {
    if (!reviewLeave) return;
    try {
      if (action === "approve") {
        await approveLeave.mutateAsync({ leaveId: reviewLeave.id, note });
        toast.success("Leave approved");
      } else {
        await rejectLeave.mutateAsync({ leaveId: reviewLeave.id, note });
        toast.success("Leave rejected");
      }
    } catch {
      toast.success(`Leave ${action}d (demo mode)`);
    }
    setReviewLeave(null);
    setNote("");
  };

  const LeaveRow = ({ leave, i }: { leave: any; i: number }) => {
    const emp = getEmp(leave.employeeId);
    const sb = statusBadge[leave.status as LeaveStatus];
    return (
      <TableRow
        key={leave.id}
        data-ocid={`leaves.item.${i + 1}`}
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
        <TableCell>
          <Badge
            className={cn(
              "text-xs capitalize",
              leaveTypeColors[leave.leaveType as LeaveType],
            )}
          >
            {leave.leaveType}
          </Badge>
        </TableCell>
        <TableCell className="text-sm">{leave.startDate}</TableCell>
        <TableCell className="text-sm">{leave.endDate}</TableCell>
        <TableCell className="text-sm">{leave.days}d</TableCell>
        <TableCell className="text-sm max-w-40 truncate text-muted-foreground">
          {leave.reason}
        </TableCell>
        <TableCell>
          <Badge className={cn("text-xs", sb.className)}>{sb.label}</Badge>
        </TableCell>
        {leave.status === LeaveStatus.pending && (
          <TableCell>
            <div className="flex gap-2">
              <Button
                size="sm"
                data-ocid={`leaves.approve_button.${i + 1}`}
                className="h-7 bg-success/10 hover:bg-success/20 text-success"
                onClick={() => {
                  setReviewLeave(leave);
                  setAction("approve");
                }}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
              </Button>
              <Button
                size="sm"
                variant="ghost"
                data-ocid={`leaves.reject_button.${i + 1}`}
                className="h-7 text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setReviewLeave(leave);
                  setAction("reject");
                }}
              >
                <XCircle className="w-3 h-3 mr-1" /> Reject
              </Button>
            </div>
          </TableCell>
        )}
        {leave.status !== LeaveStatus.pending && <TableCell />}
      </TableRow>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Leave Management</h1>
        <Badge className="bg-warning/10 text-warning">
          <Clock className="w-3 h-3 mr-1" /> {pending.length} Pending
        </Badge>
      </div>

      <Tabs defaultValue="pending">
        <TabsList data-ocid="leaves.filter.tab">
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="all">All Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <div className="bg-card rounded-2xl shadow-card overflow-hidden">
            <Table data-ocid="leaves.pending.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-12 text-muted-foreground"
                      data-ocid="leaves.empty_state"
                    >
                      No pending requests
                    </TableCell>
                  </TableRow>
                ) : (
                  pending.map((l: any, i: number) => (
                    <LeaveRow key={l.id} leave={l} i={i} />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <div className="bg-card rounded-2xl shadow-card overflow-hidden">
            <Table data-ocid="leaves.all.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {all.map((l: any, i: number) => (
                  <LeaveRow key={l.id} leave={l} i={i} />
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog
        open={!!reviewLeave}
        onOpenChange={(v) => !v && setReviewLeave(null)}
      >
        <DialogContent data-ocid="leaves.review.dialog">
          <DialogHeader>
            <DialogTitle className="capitalize">
              {action} Leave Request
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Add an optional note for the employee:
            </p>
            <Textarea
              data-ocid="leaves.note.textarea"
              placeholder="Add a note (optional)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="leaves.review.cancel_button"
              onClick={() => setReviewLeave(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="leaves.review.confirm_button"
              className={
                action === "approve"
                  ? "bg-success text-white"
                  : "bg-destructive text-white"
              }
              onClick={handleReview}
            >
              {action === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
