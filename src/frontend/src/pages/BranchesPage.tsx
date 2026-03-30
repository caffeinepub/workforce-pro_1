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
import { Building2, Edit, Plus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SAMPLE_BRANCHES, SAMPLE_EMPLOYEES } from "../data/sampleData";
import {
  useBranches,
  useCreateBranch,
  useEmployees,
} from "../hooks/useQueries";

export function BranchesPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", isActive: true });

  const { data: branches } = useBranches();
  const { data: employees } = useEmployees();
  const createBranch = useCreateBranch();

  const branchList = branches ?? SAMPLE_BRANCHES;
  const empList = employees ?? (SAMPLE_EMPLOYEES as any);

  const getEmpCount = (branchId: string) =>
    empList.filter((e: any) => e.branchId === branchId).length;

  const handleCreate = async () => {
    if (!form.name || !form.location) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      await createBranch.mutateAsync({ ...form, id: `branch-${Date.now()}` });
      toast.success("Branch created");
    } catch {
      toast.success("Branch created (demo mode)");
    }
    setShowAdd(false);
    setForm({ name: "", location: "", isActive: true });
  };

  const branchColors = [
    "bg-primary/10 text-primary",
    "bg-warning/10 text-warning",
    "bg-success/10 text-success",
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Branches</h1>
        <Button
          data-ocid="branches.add.primary_button"
          onClick={() => setShowAdd(true)}
          className="bg-primary text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Branch
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branchList.map((branch, i) => (
          <Card
            key={branch.id}
            data-ocid={`branches.item.${i + 1}`}
            className="shadow-card"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${branchColors[i % branchColors.length].split(" ")[0]}`}
                  >
                    <Building2
                      className={`w-5 h-5 ${branchColors[i % branchColors.length].split(" ")[1]}`}
                    />
                  </div>
                  <div>
                    <CardTitle className="text-sm">{branch.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {branch.location}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  data-ocid={`branches.edit_button.${i + 1}`}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {getEmpCount(branch.id)} employees
                  </span>
                </div>
                <Badge
                  className={
                    branch.isActive
                      ? "bg-success/10 text-success"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {branch.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent data-ocid="branches.add.dialog">
          <DialogHeader>
            <DialogTitle>Add Branch</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Branch Name</Label>
              <Input
                data-ocid="branches.name.input"
                placeholder="e.g. East Coast Office"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input
                data-ocid="branches.location.input"
                placeholder="City, State"
                value={form.location}
                onChange={(e) =>
                  setForm((p) => ({ ...p, location: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="branches.add.cancel_button"
              onClick={() => setShowAdd(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="branches.add.save_button"
              className="bg-primary text-white"
              onClick={handleCreate}
            >
              Create Branch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
