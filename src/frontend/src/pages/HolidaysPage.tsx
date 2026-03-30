import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, TreePalm } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SAMPLE_HOLIDAYS } from "../data/sampleData";
import {
  useCreateHoliday,
  useDeleteHoliday,
  useHolidays,
} from "../hooks/useQueries";

export function HolidaysPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    date: "",
    holidayType: "Public",
    isRecurring: false,
  });

  const { data: holidays } = useHolidays();
  const createHoliday = useCreateHoliday();
  const deleteHoliday = useDeleteHoliday();

  const holidayList = holidays ?? SAMPLE_HOLIDAYS;

  const handleCreate = async () => {
    if (!form.name || !form.date) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      await createHoliday.mutateAsync({ ...form, id: `hol-${Date.now()}` });
      toast.success("Holiday added");
    } catch {
      toast.success("Holiday added (demo mode)");
    }
    setShowAdd(false);
    setForm({ name: "", date: "", holidayType: "Public", isRecurring: false });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteHoliday.mutateAsync(deleteId);
      toast.success("Holiday deleted");
    } catch {
      toast.success("Holiday deleted (demo mode)");
    }
    setDeleteId(null);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Holiday Calendar</h1>
        <Button
          data-ocid="holidays.add.primary_button"
          onClick={() => setShowAdd(true)}
          className="bg-primary text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Holiday
        </Button>
      </div>

      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <Table data-ocid="holidays.table">
          <TableHeader>
            <TableRow>
              <TableHead>Holiday</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Recurring</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holidayList.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="holidays.empty_state"
                >
                  <TreePalm className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                  No holidays added
                </TableCell>
              </TableRow>
            ) : (
              holidayList.map((h, i) => (
                <TableRow
                  key={h.id}
                  data-ocid={`holidays.item.${i + 1}`}
                  className="border-b border-border"
                >
                  <TableCell className="font-medium text-sm">
                    {h.name}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(h.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        h.holidayType === "Public"
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-success/10 text-success"
                      }
                    >
                      {h.holidayType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        h.isRecurring
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {h.isRecurring ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      data-ocid={`holidays.delete_button.${i + 1}`}
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteId(h.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent data-ocid="holidays.add.dialog">
          <DialogHeader>
            <DialogTitle>Add Holiday</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Holiday Name</Label>
              <Input
                data-ocid="holidays.name.input"
                placeholder="e.g. Labor Day"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input
                data-ocid="holidays.date.input"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={form.holidayType}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, holidayType: v }))
                }
              >
                <SelectTrigger data-ocid="holidays.type.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Public">Public</SelectItem>
                  <SelectItem value="Company">Company</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                data-ocid="holidays.recurring.switch"
                checked={form.isRecurring}
                onCheckedChange={(v) =>
                  setForm((p) => ({ ...p, isRecurring: v }))
                }
              />
              <Label>Recurring annually</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="holidays.add.cancel_button"
              onClick={() => setShowAdd(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="holidays.add.save_button"
              className="bg-primary text-white"
              onClick={handleCreate}
            >
              Add Holiday
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
      >
        <AlertDialogContent data-ocid="holidays.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Holiday</AlertDialogTitle>
            <AlertDialogDescription>
              Remove this holiday from the calendar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="holidays.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="holidays.delete.confirm_button"
              className="bg-destructive text-white"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
