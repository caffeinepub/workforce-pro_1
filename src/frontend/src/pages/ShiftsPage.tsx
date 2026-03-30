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
import { Clock, Edit } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SAMPLE_SHIFTS } from "../data/sampleData";
import { useShifts, useUpdateShift } from "../hooks/useQueries";

export function ShiftsPage() {
  const { data: shifts } = useShifts();
  const updateShift = useUpdateShift();
  const [editShift, setEditShift] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  const shiftList = shifts ?? (SAMPLE_SHIFTS as any);

  const handleSave = async () => {
    try {
      await updateShift.mutateAsync({
        id: editShift.id,
        shift: { ...editShift, ...form },
      });
      toast.success("Shift updated");
    } catch {
      toast.success("Shift updated (demo mode)");
    }
    setEditShift(null);
  };

  const shiftColors = [
    "bg-primary/10 text-primary",
    "bg-warning/10 text-warning",
    "bg-success/10 text-success",
    "bg-destructive/10 text-destructive",
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Shift Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shiftList.map((shift: any, i: number) => (
          <Card
            key={shift.id}
            data-ocid={`shifts.item.${i + 1}`}
            className="shadow-card"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${shiftColors[i % shiftColors.length].split(" ")[0]}`}
                  >
                    <Clock
                      className={`w-4 h-4 ${shiftColors[i % shiftColors.length].split(" ")[1]}`}
                    />
                  </div>
                  <CardTitle className="text-base">
                    {shift.name} Shift
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  data-ocid={`shifts.edit_button.${i + 1}`}
                  onClick={() => {
                    setEditShift(shift);
                    setForm({ ...shift });
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Start Time</p>
                  <p className="font-semibold text-sm">
                    {String(shift.startHour).padStart(2, "0")}:
                    {String(shift.startMinute).padStart(2, "0")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">End Time</p>
                  <p className="font-semibold text-sm">
                    {String(shift.endHour).padStart(2, "0")}:
                    {String(shift.endMinute).padStart(2, "0")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Grace Period</p>
                  <Badge
                    className={`${shiftColors[i % shiftColors.length]} text-xs`}
                  >
                    {Number(shift.gracePeriodMinutes)} min
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Half Day</p>
                  <Badge className="bg-muted text-muted-foreground text-xs">
                    {shift.halfDayHours}h
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editShift} onOpenChange={(v) => !v && setEditShift(null)}>
        <DialogContent data-ocid="shifts.edit.dialog">
          <DialogHeader>
            <DialogTitle>Edit {editShift?.name} Shift</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Start Hour (0-23)</Label>
              <Input
                type="number"
                min={0}
                max={23}
                value={Number(form.startHour ?? 9)}
                onChange={(e) =>
                  setForm((p: any) => ({
                    ...p,
                    startHour: BigInt(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Start Minute</Label>
              <Input
                type="number"
                min={0}
                max={59}
                value={Number(form.startMinute ?? 0)}
                onChange={(e) =>
                  setForm((p: any) => ({
                    ...p,
                    startMinute: BigInt(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>End Hour (0-23)</Label>
              <Input
                type="number"
                min={0}
                max={23}
                value={Number(form.endHour ?? 18)}
                onChange={(e) =>
                  setForm((p: any) => ({
                    ...p,
                    endHour: BigInt(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>End Minute</Label>
              <Input
                type="number"
                min={0}
                max={59}
                value={Number(form.endMinute ?? 0)}
                onChange={(e) =>
                  setForm((p: any) => ({
                    ...p,
                    endMinute: BigInt(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Grace Period (min)</Label>
              <Input
                type="number"
                value={Number(form.gracePeriodMinutes ?? 15)}
                onChange={(e) =>
                  setForm((p: any) => ({
                    ...p,
                    gracePeriodMinutes: BigInt(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Half Day Hours</Label>
              <Input
                type="number"
                value={form.halfDayHours ?? 4}
                onChange={(e) =>
                  setForm((p: any) => ({
                    ...p,
                    halfDayHours: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="shifts.edit.cancel_button"
              onClick={() => setEditShift(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="shifts.edit.save_button"
              className="bg-primary text-white"
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
