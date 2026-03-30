import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Bell,
  Briefcase,
  Building2,
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  Clock,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  TreePalm,
  User,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { AVATAR_COLORS, getInitials } from "../data/sampleData";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMyProfile, useUnreadCount } from "../hooks/useQueries";

type Page =
  | "dashboard"
  | "employees"
  | "attendance"
  | "leaves"
  | "payroll"
  | "notifications"
  | "shifts"
  | "holidays"
  | "branches"
  | "profile"
  | "my-attendance"
  | "my-leaves";

interface LayoutProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  isAdmin: boolean;
  isDark: boolean;
  onToggleDark: () => void;
  children: React.ReactNode;
}

const adminNavItems = [
  { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  { id: "employees" as Page, label: "Employees", icon: Users },
  { id: "attendance" as Page, label: "Attendance", icon: Clock },
  { id: "leaves" as Page, label: "Leave Management", icon: CalendarDays },
  { id: "payroll" as Page, label: "Payroll", icon: DollarSign },
  {
    id: "notifications" as Page,
    label: "Notifications",
    icon: Bell,
    badge: true,
  },
  { id: "shifts" as Page, label: "Shifts", icon: Briefcase },
  { id: "holidays" as Page, label: "Holidays", icon: TreePalm },
  { id: "branches" as Page, label: "Branches", icon: Building2 },
  { id: "profile" as Page, label: "Profile", icon: User },
];

const employeeNavItems = [
  { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  { id: "my-attendance" as Page, label: "My Attendance", icon: CalendarCheck },
  { id: "my-leaves" as Page, label: "My Leaves", icon: CalendarDays },
  {
    id: "notifications" as Page,
    label: "Notifications",
    icon: Bell,
    badge: true,
  },
  { id: "profile" as Page, label: "Profile", icon: User },
];

export function Layout({
  currentPage,
  onPageChange,
  isAdmin,
  isDark,
  onToggleDark,
  children,
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: unreadCount } = useUnreadCount();
  const { data: myProfile } = useMyProfile();
  const { clear } = useInternetIdentity();

  const navItems = isAdmin ? adminNavItems : employeeNavItems;
  const profileName = myProfile?.name ?? "Admin User";
  const profileRole =
    myProfile?.role ?? (isAdmin ? "Administrator" : "Employee");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col h-full transition-all duration-300 ease-in-out flex-shrink-0",
          "bg-gradient-to-b from-[oklch(0.17_0.04_220)] to-[oklch(0.14_0.05_220)]",
          sidebarOpen ? "w-64" : "w-16",
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <img
              src="/assets/generated/workforce-logo-transparent.dim_80x80.png"
              alt="Logo"
              className="w-6 h-6 object-contain"
            />
          </div>
          {sidebarOpen && (
            <span className="text-white font-bold text-sm tracking-wide">
              WorkForce Pro
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "ml-auto text-sidebar-foreground/60 hover:text-white hover:bg-sidebar-border h-7 w-7",
              !sidebarOpen && "hidden",
            )}
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* User Profile Mini */}
        {sidebarOpen && (
          <div className="px-4 py-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-primary text-white text-xs font-bold">
                    {getInitials(profileName)}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border-2 border-[oklch(0.17_0.04_220)]" />
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">
                  {profileName}
                </p>
                <p className="text-sidebar-foreground/60 text-xs capitalize">
                  {profileRole}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="w-full mb-2 text-sidebar-foreground/60 hover:text-white hover:bg-sidebar-border h-10"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-4 h-4" />
            </Button>
          )}
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              data-ocid={`nav.${item.id}.link`}
              onClick={() => onPageChange(item.id)}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all",
                currentPage === item.id
                  ? "bg-primary text-white"
                  : "text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-border",
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && (
                <span className="flex-1 text-left">{item.label}</span>
              )}
              {sidebarOpen &&
                item.badge &&
                (unreadCount ?? BigInt(0)) > BigInt(0) && (
                  <Badge className="bg-destructive text-white text-xs px-1.5 py-0 h-4 min-w-[1rem]">
                    {Number(unreadCount)}
                  </Badge>
                )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-sidebar-border">
            <p className="text-sidebar-foreground/40 text-xs text-center">
              WorkForce Pro v2.0
            </p>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center gap-4 px-6 py-3 bg-card border-b border-border flex-shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-ocid="topbar.search_input"
              placeholder="Search employees, records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background border-border text-sm h-9"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleDark}
              className="text-muted-foreground hover:text-foreground"
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              data-ocid="topbar.notifications.button"
              className="relative text-muted-foreground hover:text-foreground"
              onClick={() => onPageChange("notifications")}
            >
              <Bell className="w-4 h-4" />
              {(unreadCount ?? BigInt(0)) > BigInt(0) && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  data-ocid="topbar.user.dropdown_menu"
                  className="flex items-center gap-2 h-9 px-2"
                >
                  <Avatar className="w-7 h-7">
                    <AvatarFallback
                      className={cn(
                        "text-xs font-bold text-white",
                        AVATAR_COLORS[0],
                      )}
                    >
                      {getInitials(profileName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden md:block">
                    {profileName}
                  </span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onPageChange("profile")}>
                  <User className="w-4 h-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPageChange("profile")}>
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  data-ocid="topbar.logout.button"
                  className="text-destructive focus:text-destructive"
                  onClick={() => clear()}
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

export type { Page };
