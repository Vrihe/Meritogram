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
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const mainNavItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/courses", icon: BookOpen, label: "Courses" },
  { to: "/attendance", icon: Calendar, label: "Attendance" },
  { to: "/code-review", icon: Code, label: "Code Review" },
  { to: "/grades", icon: Award, label: "Grades" },
  { to: "/github", icon: Github, label: "GitHub" },
  { to: "/groups", icon: Users, label: "Groups" },
  { to: "/profile", icon: User, label: "Profile" },
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
};

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const currentPage = allRoutes[location.pathname] ?? "Dashboard";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userName = user?.profile?.full_name || "User";
  const userInitials = userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const userMajor = user?.profile?.major || "";

  const notifications = [
    { id: 1, text: "Assignment due: Data Structures — tomorrow", time: "2h ago", unread: true },
    { id: 2, text: "Grade posted: Algorithms midterm — 92%", time: "5h ago", unread: true },
    { id: 3, text: "New feedback on your code submission", time: "1d ago", unread: false },
  ];

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
        </nav>

        {/* Theme toggle & Logout */}
        <div className="px-3 pb-3 space-y-1">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition"
          >
            {isDark ? <Sun className="w-4 h-4 flex-shrink-0" /> : <Moon className="w-4 h-4 flex-shrink-0" />}
            {sidebarOpen && (
              <span className="text-xs" style={{ fontWeight: 500 }}>
                {isDark ? "Light Mode" : "Dark Mode"}
              </span>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-neutral-400 hover:bg-red-900 hover:text-white transition"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && (
              <span className="text-xs" style={{ fontWeight: 500 }}>
                Logout
              </span>
            )}
          </button>
        </div>

        {/* User */}
        <div className="px-3 py-4 border-t border-neutral-800">
          <div className="flex items-center gap-3 px-3 py-2 hover:bg-neutral-800 cursor-pointer transition">
            <div className="w-8 h-8 bg-neutral-600 flex items-center justify-center flex-shrink-0">
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
                  <p className="text-neutral-400 text-xs truncate">Student{userMajor ? ` · ${userMajor}` : ""}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-neutral-400 flex-shrink-0" />
              </>
            )}
          </div>
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

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition relative"
              >
                <Bell className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-neutral-700 flex items-center justify-center">
                  <span className="text-white" style={{ fontSize: "0.6rem", fontWeight: 700 }}>
                    2
                  </span>
                </span>
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-card shadow-2xl border border-border z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <p
                      className="text-neutral-900 dark:text-neutral-100 text-sm"
                      style={{ fontWeight: 600 }}
                    >
                      Notifications
                    </p>
                    <span
                      className="text-neutral-600 dark:text-neutral-400 text-xs cursor-pointer"
                      style={{ fontWeight: 500 }}
                    >
                      Mark all read
                    </span>
                  </div>
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 flex gap-3 ${
                          n.unread ? "bg-neutral-50 dark:bg-neutral-800/50" : ""
                        }`}
                      >
                        <div
                          className={`w-2 h-2 mt-1.5 flex-shrink-0 ${
                            n.unread ? "bg-neutral-700" : "bg-neutral-300 dark:bg-neutral-600"
                          }`}
                        />
                        <div className="flex-1">
                          <p
                            className="text-neutral-700 dark:text-neutral-300 text-xs"
                            style={{ fontWeight: n.unread ? 500 : 400 }}
                          >
                            {n.text}
                          </p>
                          <p className="text-neutral-400 dark:text-neutral-500 text-xs mt-0.5">
                            {n.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="w-9 h-9 bg-neutral-600 flex items-center justify-center cursor-pointer">
              <span className="text-white text-sm" style={{ fontWeight: 700 }}>
                {userInitials}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-950">
          <Outlet />
        </main>
      </div>

      {/* Notif overlay */}
      {notifOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
      )}
    </div>
  );
}
