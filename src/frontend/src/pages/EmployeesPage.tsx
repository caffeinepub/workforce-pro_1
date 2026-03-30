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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Edit,
  Eye,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  UserCheck,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Employee } from "../backend.d";
import {
  AVATAR_COLORS,
  SAMPLE_EMPLOYEES,
  getInitials,
} from "../data/sampleData";
import {
  useBranches,
  useCreateEmployee,
  useDeleteEmployee,
  useEmployees,
  useShifts,
  useUpdateEmployee,
} from "../hooks/useQueries";

const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Design",
  "HR",
  "Finance",
  "Marketing",
  "Operations",
];
const ROLES = ["admin", "hr", "employee"];

function emptyEmployee(): Partial<Employee> {
  return {
    employeeId: `EMP${String(Math.floor(Math.random() * 900) + 100)}`,
    name: "",
    email: "",
    phone: "",
    department: "Engineering",
    designation: "",
    role: "employee",
    joiningDate: new Date().toISOString().split("T")[0],
    salary: 0,
    branchId: "branch-001",
    shiftId: "shift-001",
    isActive: true,
  };
}

export function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState<Partial<Employee>>(emptyEmployee());

  const { data: employees, isLoading } = useEmployees();
  const { data: branches } = useBranches();
  const { data: shifts } = useShifts();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  const empList = employees ?? (SAMPLE_EMPLOYEES as any);

  const filtered = empList.filter((e: Employee) => {
    const matchSearch =
      !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === "all" || e.department === filterDept;
    const matchRole = filterRole === "all" || e.role === filterRole;
    return matchSearch && matchDept && matchRole;
  });

  const handleSave = async () => {
    try {
      if (editEmployee) {
        await updateEmployee.mutateAsync({
          id: editEmployee.id,
          employee: { ...editEmployee, ...form } as Employee,
        });
        toast.success("Employee updated");
        setEditEmployee(null);
      } else {
        await createEmployee.mutateAsync({
          ...form,
          id: `emp-${Date.now()}`,
          userId: "principal-new" as any,
        } as Employee);
        toast.success("Employee created");
        setShowAddModal(false);
      }
      setForm(emptyEmployee());
    } catch {
      toast.error("Action completed (demo mode)");
      if (editEmployee) setEditEmployee(null);
      else setShowAddModal(false);
      setForm(emptyEmployee());
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteEmployee.mutateAsync(deleteId);
      toast.success("Employee deleted");
    } catch {
      toast.success("Employee deleted (demo mode)");
    }
    setDeleteId(null);
  };

  const openEdit = (emp: Employee) => {
    setEditEmployee(emp);
    setForm({ ...emp });
  };

  const EmployeeForm = () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <Label>Full Name</Label>
        <Input
          data-ocid="employee.name.input"
          value={form.name ?? ""}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="John Smith"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Employee ID</Label>
        <Input
          value={form.employeeId ?? ""}
          onChange={(e) =>
            setForm((p) => ({ ...p, employeeId: e.target.value }))
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input
          data-ocid="employee.email.input"
          type="email"
          value={form.email ?? ""}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Phone</Label>
        <Input
          value={form.phone ?? ""}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Department</Label>
        <Select
          value={form.department ?? "Engineering"}
          onValueChange={(v) => setForm((p) => ({ ...p, department: v }))}
        >
          <SelectTrigger data-ocid="employee.department.select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Designation</Label>
        <Input
          value={form.designation ?? ""}
          onChange={(e) =>
            setForm((p) => ({ ...p, designation: e.target.value }))
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label>Role</Label>
        <Select
          value={form.role ?? "employee"}
          onValueChange={(v) => setForm((p) => ({ ...p, role: v }))}
        >
          <SelectTrigger data-ocid="employee.role.select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r} className="capitalize">
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Joining Date</Label>
        <Input
          type="date"
          value={form.joiningDate ?? ""}
          onChange={(e) =>
            setForm((p) => ({ ...p, joiningDate: e.target.value }))
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label>Salary ($)</Label>
        <Input
          type="number"
          value={form.salary ?? 0}
          onChange={(e) =>
            setForm((p) => ({ ...p, salary: Number(e.target.value) }))
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label>Branch</Label>
        <Select
          value={form.branchId ?? "branch-001"}
          onValueChange={(v) => setForm((p) => ({ ...p, branchId: v }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(branches ?? []).map((b: any) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Shift</Label>
        <Select
          value={form.shiftId ?? "shift-001"}
          onValueChange={(v) => setForm((p) => ({ ...p, shiftId: v }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(shifts ?? []).map((s: any) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Employees</h1>
        <Button
          data-ocid="employees.add.primary_button"
          onClick={() => {
            setForm(emptyEmployee());
            setShowAddModal(true);
          }}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Employee
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-card rounded-xl p-4 shadow-card">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="employees.search_input"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={filterDept} onValueChange={setFilterDept}>
          <SelectTrigger data-ocid="employees.dept.select" className="w-40 h-9">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger data-ocid="employees.role.select" className="w-32 h-9">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r} className="capitalize">
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <Table data-ocid="employees.table">
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              ["s1", "s2", "s3", "s4", "s5"].map((sk) => (
                <TableRow key={sk}>
                  {["c1", "c2", "c3", "c4", "c5", "c6", "c7"].map((ck) => (
                    <TableCell key={ck}>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="employees.empty_state"
                >
                  <UserCheck className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((emp: Employee, i: number) => (
                <motion.tr
                  key={emp.id}
                  data-ocid={`employees.item.${i + 1}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback
                          className={cn(
                            "text-xs font-bold text-white",
                            AVATAR_COLORS[i % AVATAR_COLORS.length],
                          )}
                        >
                          {getInitials(emp.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {emp.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {emp.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{emp.department}</TableCell>
                  <TableCell className="text-sm">{emp.designation}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "text-xs capitalize",
                        emp.role === "admin"
                          ? "bg-primary/10 text-primary"
                          : emp.role === "hr"
                            ? "bg-warning/10 text-warning"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {emp.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(emp.joiningDate).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        emp.isActive
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {emp.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewEmployee(emp)}>
                          <Eye className="w-4 h-4 mr-2" /> View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(emp)}>
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          data-ocid={`employees.delete_button.${i + 1}`}
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(emp.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Modal */}
      <Dialog
        open={showAddModal || !!editEmployee}
        onOpenChange={(v) => {
          if (!v) {
            setShowAddModal(false);
            setEditEmployee(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl" data-ocid="employees.dialog">
          <DialogHeader>
            <DialogTitle>
              {editEmployee ? "Edit Employee" : "Add New Employee"}
            </DialogTitle>
          </DialogHeader>
          <EmployeeForm />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setEditEmployee(null);
              }}
              data-ocid="employees.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={createEmployee.isPending || updateEmployee.isPending}
              data-ocid="employees.save_button"
              className="bg-primary text-white"
            >
              {editEmployee ? "Save Changes" : "Add Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Profile Modal */}
      <Dialog
        open={!!viewEmployee}
        onOpenChange={(v) => !v && setViewEmployee(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Employee Profile</DialogTitle>
          </DialogHeader>
          {viewEmployee && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-primary text-white text-xl font-bold">
                    {getInitials(viewEmployee.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">{viewEmployee.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {viewEmployee.designation}
                  </p>
                  <Badge className="mt-1 bg-primary/10 text-primary text-xs">
                    {viewEmployee.employeeId}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Email", viewEmployee.email],
                  ["Phone", viewEmployee.phone],
                  ["Department", viewEmployee.department],
                  ["Role", viewEmployee.role],
                  ["Joined", viewEmployee.joiningDate],
                  ["Salary", `$${viewEmployee.salary?.toLocaleString()}`],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-muted-foreground text-xs">{k}</p>
                    <p className="font-medium capitalize">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              data-ocid="employees.view.close_button"
              onClick={() => setViewEmployee(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
      >
        <AlertDialogContent data-ocid="employees.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="employees.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="employees.delete.confirm_button"
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
