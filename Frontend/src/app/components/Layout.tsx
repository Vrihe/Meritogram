import { Outlet, NavLink, useLocation, useNavigate } from "react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Code,
  Award,
  User,
  Bell,
  Search,
  ChevronDown,
  GraduationCap,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  Github,
  Users,
  Calendar,
  Shield,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { NotificationPanel } from "./NotificationPanel";

const mainNavItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/courses", icon: BookOpen, label: "Courses" },
  { to: "/attendance", icon: Calendar, label: "Attendance" },
  { to: "/code-review", icon: Code, label: "Code Review" },
  { to: "/grades", icon: Award, label: "Grades" },
  { to: "/github", icon: Github, label: "GitHub" },
  { to: "/groups", icon: Users, label: "Groups" },
];

const adminNavItems = [
  { to: "/admin", icon: Shield, label: "Admin Panel" },
];

const allRoutes: Record<string, string> = {
  "/": "Dashboard",
  "/courses": "Courses",
  "/attendance": "Attendance",
  "/code-review": "Code Review",
  "/grades": "Grades",
  "/github": "GitHub",
  "/groups": "Groups",
  "/profile": "Profile",
  "/admin": "Admin Panel",
};

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const currentPage = allRoutes[location.pathname] ?? "Dashboard";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const userName = user?.profile?.full_name || "User";
  const userInitials = userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const userMajor = user?.profile?.major || "";

  return (
    <div
      className="flex h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Sidebar ── */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } flex-shrink-0 bg-neutral-900 flex flex-col transition-all duration-300 ease-in-out z-20`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-neutral-800">
          <div className="w-9 h-9 bg-neutral-700 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <p className="text-white text-sm" style={{ fontWeight: 700, lineHeight: "1.2" }}>
                EduAI
              </p>
              <p className="text-neutral-400 text-xs" style={{ fontWeight: 400 }}>
                Student Portal
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto scrollbar-thin">
          {mainNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 transition-all duration-150 ${
                  isActive
                    ? "bg-neutral-700 text-white"
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="text-sm" style={{ fontWeight: 500 }}>
                  {label}
                </span>
              )}
            </NavLink>
          ))}
          
          {/* Admin items - only show for admins */}
          {user?.role === "admin" && (
            <>
              <div className="h-px bg-neutral-700 my-2"></div>
              {adminNavItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 transition-all duration-150 ${
                      isActive
                        ? "bg-red-700 text-white"
                        : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                    }`
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="text-sm" style={{ fontWeight: 500 }}>
                      {label}
                    </span>
                  )}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* User */}
        <div className="relative px-3 py-4 border-t border-neutral-800">
          <div 
            className="flex items-center gap-3 px-3 py-2 hover:bg-neutral-800 cursor-pointer transition rounded-xl"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          >
            <div className="w-8 h-8 bg-neutral-600 flex items-center justify-center flex-shrink-0 rounded-md">
              <span className="text-white text-xs" style={{ fontWeight: 700 }}>
                {userInitials}
              </span>
            </div>
            {sidebarOpen && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate" style={{ fontWeight: 500 }}>
                    {userName}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <p className="text-neutral-400 text-xs truncate capitalize">
                      {user?.role || "student"}
                    </p>
                    {userMajor && <p className="text-neutral-400 text-xs">·</p>}
                    {userMajor && <p className="text-neutral-400 text-xs truncate">{userMajor}</p>}
                    {user?.role === "admin" && (
                      <span className="ml-1 px-1.5 py-0.5 bg-red-600/20 text-red-500 text-[10px] rounded font-bold tracking-wider">
                        ADMIN
                      </span>
                    )}
                    {user?.role === "professor" && (
                      <span className="ml-1 px-1.5 py-0.5 bg-[#422beb] text-white text-[10px] rounded font-bold tracking-wider">
                        PROF
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </div>

          {/* Profile Dropdown */}
          {profileDropdownOpen && sidebarOpen && (
            <div className="absolute bottom-[calc(100%+8px)] left-4 right-4 bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden shadow-xl z-50">
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  navigate('/profile');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-neutral-200 hover:bg-neutral-700 transition-colors text-sm font-medium"
              >
                <User className="w-4 h-4 text-neutral-400" />
                Profile Settings
              </button>
              <div className="h-px bg-neutral-700"></div>
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-neutral-700 transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-card border-b border-border px-6 py-3 flex items-center gap-4 z-10 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div>
            <h1
              className="text-neutral-900 dark:text-white"
              style={{ fontSize: "1.05rem", fontWeight: 600, lineHeight: "1.3" }}
            >
              {currentPage}
            </h1>
            <p className="text-neutral-400 dark:text-neutral-500" style={{ fontSize: "0.75rem" }}>
              Thursday, March 6, 2026
            </p>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-sm ml-4">
            <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 px-3 py-2">
              <Search className="w-4 h-4 text-neutral-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search courses, assignments..."
                className="bg-transparent border-none outline-none text-sm text-neutral-700 dark:text-neutral-200 w-full placeholder-neutral-400 dark:placeholder-neutral-500"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-neutral-600" />
              )}
            </button>

            {/* Notifications - Using new NotificationPanel component */}
            <NotificationPanel />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
