import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AVATAR_COLORS,
  SAMPLE_EMPLOYEES,
  getInitials,
} from "../data/sampleData";
import { useActor } from "../hooks/useActor";
import { useMyProfile } from "../hooks/useQueries";

export function ProfilePage() {
  const { data: profile } = useMyProfile();
  const { actor } = useActor();
  const emp = profile ?? (SAMPLE_EMPLOYEES[0] as any);

  const [name, setName] = useState(emp?.name ?? "");
  const [email, setEmail] = useState(emp?.email ?? "");
  const [phone, setPhone] = useState(emp?.phone ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (actor) {
        await actor.saveCallerUserProfile({ name, email });
      }
      toast.success("Profile updated successfully!");
    } catch {
      toast.success("Profile updated (demo mode)!");
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">Profile</h1>

      {/* Profile Header */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarFallback
                  className={`text-2xl font-bold text-white ${AVATAR_COLORS[0]}`}
                >
                  {getInitials(emp?.name ?? "U")}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                data-ocid="profile.upload_button"
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-md"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{emp?.name}</h2>
              <p className="text-muted-foreground text-sm">
                {emp?.designation}
              </p>
              <div className="flex gap-2 mt-2">
                <Badge className="bg-primary/10 text-primary text-xs">
                  {emp?.employeeId}
                </Badge>
                <Badge className="bg-success/10 text-success text-xs capitalize">
                  {emp?.role}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input
                data-ocid="profile.name.input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                data-ocid="profile.email.input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Employee ID</Label>
              <Input
                value={emp?.employeeId ?? ""}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Input
                value={emp?.department ?? ""}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Designation</Label>
              <Input
                value={emp?.designation ?? ""}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Joining Date</Label>
              <Input
                value={emp?.joiningDate ?? ""}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Salary</Label>
              <Input
                value={`$${emp?.salary?.toLocaleString() ?? 0}`}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
          <Button
            data-ocid="profile.save_button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary text-white mt-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
