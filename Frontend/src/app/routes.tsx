import { createHashRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";
import { CoursesPage } from "./pages/CoursesPage";
import { AttendancePage } from "./pages/AttendancePage";
import { CodeReviewPage } from "./pages/CodeReviewPage";
import { GradesPage } from "./pages/GradesPage";
import { GitHubPage } from "./pages/GitHubPage";
import { GroupsPage } from "./pages/GroupsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AdminPage } from "./pages/AdminPage";
import { LoginPage } from "./pages/LoginPage";

export const router = createHashRouter([
  {
    path: "/",
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      { index: true, Component: DashboardPage },
      { path: "courses", Component: CoursesPage },
      { path: "attendance", Component: AttendancePage },
      { path: "code-review", Component: CodeReviewPage },
      { path: "grades", Component: GradesPage },
      { path: "github", Component: GitHubPage },
      { path: "groups", Component: GroupsPage },
      { path: "profile", Component: ProfilePage },
      { path: "admin", Component: AdminPage },
      { path: "ai-tools", element: <Navigate to="/code-review" replace /> },
      { path: "schedule", element: <Navigate to="/" replace /> },
      { path: "settings", element: <Navigate to="/profile" replace /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
  {
    path: "/login",
    Component: LoginPage,
  },
]);
