import { useState, useEffect } from "react";
import { Mail, GraduationCap, Award, BookOpen, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { courseService } from "../services/course.service";
import { gradeService } from "../services/grade.service";
import { attendanceService } from "../services/attendance.service";

export function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ gpa: 0, credits: 0, attendanceRate: 0, courses: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [coursesData, gradesData, attendanceData] = await Promise.all([
          courseService.getAll(),
          gradeService.getAll(),
          attendanceService.getAll(),
        ]);

        const totalCredits = coursesData.reduce((s, c) => s + (c.credits || 0), 0);

        const gradesByCourse = new Map<string, number[]>();
        gradesData.forEach((g) => {
          const list = gradesByCourse.get(g.course_id) || [];
          list.push(g.score);
          gradesByCourse.set(g.course_id, list);
        });

        let weightedSum = 0;
        let weightCredits = 0;
        gradesByCourse.forEach((scores, courseId) => {
          const course = coursesData.find((c) => c.id === courseId);
          if (!course) return;
          const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
          weightedSum += avg * (course.credits || 3);
          weightCredits += course.credits || 3;
        });

        const avgGrade = weightCredits > 0 ? weightedSum / weightCredits : 0;

        const presentCount = attendanceData.filter((a) => a.status === "present").length;
        const attRate = attendanceData.length > 0 ? Math.round((presentCount / attendanceData.length) * 100) : 0;

        setStats({
          gpa: parseFloat((avgGrade / 25).toFixed(2)),
          credits: totalCredits,
          attendanceRate: attRate,
          courses: coursesData.length,
        });
      } catch (err) {
        console.error("Failed to load profile stats:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const userName = user?.profile?.full_name || "Student";
  const userEmail = user?.email || "";
  const userMajor = user?.profile?.major || "Undeclared";
  const userYear = user?.academic?.year || "1st Year";
  const userStudentId = user?.profile?.student_id || "N/A";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Profile Header */}
      <div className="bg-card border border-border p-6 mb-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-3xl">{userInitials}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-slate-900 dark:text-white mb-1">{userName}</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-3">{userMajor} · {userYear}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Mail className="w-4 h-4" />
                <span>{userEmail}</span>
              </div>
            </div>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 transition">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Academic Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-5 h-5 text-indigo-500" />
            <p className="text-xs text-slate-600 dark:text-slate-400">GPA</p>
          </div>
          <p className="text-2xl text-slate-900 dark:text-white">
            {loading ? "..." : stats.gpa.toFixed(2)}
          </p>
        </div>
        <div className="bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <p className="text-xs text-slate-600 dark:text-slate-400">Credits</p>
          </div>
          <p className="text-2xl text-slate-900 dark:text-white">
            {loading ? "..." : stats.credits}
          </p>
        </div>
        <div className="bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-amber-500" />
            <p className="text-xs text-slate-600 dark:text-slate-400">Courses</p>
          </div>
          <p className="text-2xl text-slate-900 dark:text-white">
            {loading ? "..." : stats.courses}
          </p>
        </div>
        <div className="bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-green-500" />
            <p className="text-xs text-slate-600 dark:text-slate-400">Attendance</p>
          </div>
          <p className="text-2xl text-slate-900 dark:text-white">
            {loading ? "..." : `${stats.attendanceRate}%`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Academic Information */}
        <div className="bg-card border border-border p-5">
          <h3 className="text-slate-900 dark:text-white mb-4">Academic Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-slate-600 dark:text-slate-400">Student ID</span>
              <span className="text-slate-900 dark:text-white">{userStudentId}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-slate-600 dark:text-slate-400">Major</span>
              <span className="text-slate-900 dark:text-white">{userMajor}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-slate-600 dark:text-slate-400">Year</span>
              <span className="text-slate-900 dark:text-white">{userYear}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-slate-600 dark:text-slate-400">Email</span>
              <span className="text-slate-900 dark:text-white">{userEmail}</span>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-card border border-border p-5">
          <h3 className="text-slate-900 dark:text-white mb-4">Recent Achievements</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
              <Award className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-slate-900 dark:text-white">Dean's List</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Fall 2025 Semester</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
              <Award className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-slate-900 dark:text-white">Hackathon Winner</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Stanford CodeJam 2025</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
              <Award className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-slate-900 dark:text-white">Research Grant</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">AI/ML Research Project</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
