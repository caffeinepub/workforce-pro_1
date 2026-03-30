import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Layout } from "./components/Layout";
import type { Page } from "./components/Layout";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useIsAdmin } from "./hooks/useQueries";
import { AttendancePage } from "./pages/AttendancePage";
import { BranchesPage } from "./pages/BranchesPage";
import { DashboardPage } from "./pages/DashboardPage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { HolidaysPage } from "./pages/HolidaysPage";
import { LeaveManagementPage } from "./pages/LeaveManagementPage";
import { LoginPage } from "./pages/LoginPage";
import { MyAttendancePage } from "./pages/MyAttendancePage";
import { MyLeavesPage } from "./pages/MyLeavesPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { PayrollPage } from "./pages/PayrollPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { ShiftsPage } from "./pages/ShiftsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, retry: 1 },
  },
});

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [isDark, setIsDark] = useState(() => {
    return (
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  const { data: isAdmin } = useIsAdmin();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
            <img
              src="/assets/generated/workforce-logo-transparent.dim_80x80.png"
              alt="Logo"
              className="w-8 h-8 object-contain"
            />
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary"
                style={{
                  animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!identity) {
    return authView === "login" ? (
      <LoginPage onShowRegister={() => setAuthView("register")} />
    ) : (
      <RegisterPage onShowLogin={() => setAuthView("login")} />
    );
  }

  const adminMode = isAdmin ?? true;

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <DashboardPage isAdmin={adminMode} onPageChange={setCurrentPage} />
        );
      case "employees":
        return adminMode ? (
          <EmployeesPage />
        ) : (
          <DashboardPage isAdmin={false} onPageChange={setCurrentPage} />
        );
      case "attendance":
        return adminMode ? <AttendancePage /> : <MyAttendancePage />;
      case "my-attendance":
        return <MyAttendancePage />;
      case "leaves":
        return adminMode ? <LeaveManagementPage /> : <MyLeavesPage />;
      case "my-leaves":
        return <MyLeavesPage />;
      case "payroll":
        return <PayrollPage />;
      case "notifications":
        return <NotificationsPage />;
      case "profile":
        return <ProfilePage />;
      case "shifts":
        return <ShiftsPage />;
      case "holidays":
        return <HolidaysPage />;
      case "branches":
        return <BranchesPage />;
      default:
        return (
          <DashboardPage isAdmin={adminMode} onPageChange={setCurrentPage} />
        );
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      isAdmin={adminMode}
      isDark={isDark}
      onToggleDark={() => setIsDark((d) => !d)}
    >
      {renderPage()}
    </Layout>
  );
}

function App() {
  return (
    <InternetIdentityProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </InternetIdentityProvider>
  );
}

export default App;
