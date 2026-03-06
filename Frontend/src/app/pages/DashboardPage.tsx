import { useState } from "react";
import { useNavigate } from "react-router";
import { TrendingUp, BookOpen, Clock, CheckCircle2, AlertCircle, Plus, ChevronRight, Target, Trophy, Flame, Sparkles } from "lucide-react";
import { GPACircle } from "../components/GPACircle";
import { GradeSparkline } from "../components/GradeSparkline";
import { AddEntryModal } from "../components/AddEntryModal";
import { useTheme } from "../context/ThemeContext";

interface Course {
  id: number;
  name: string;
  code: string;
  instructor: string;
  color: string;
  attended: number;
  total: number;
  currentGrade: number;
  gradeHistory: number[];
  pending: number;
  credits: number;
}

const initialCourses: Course[] = [
  { id: 1, name: "Data Structures & Algorithms", code: "CS 301", instructor: "Dr. Sarah Chen", color: "#6366f1", attended: 24, total: 28, currentGrade: 92, gradeHistory: [78, 82, 85, 88, 91, 92], pending: 1, credits: 4 },
  { id: 2, name: "Machine Learning Fundamentals", code: "CS 415", instructor: "Prof. Marcus Wright", color: "#8b5cf6", attended: 20, total: 26, currentGrade: 87, gradeHistory: [80, 79, 83, 85, 86, 87], pending: 2, credits: 3 },
  { id: 3, name: "Operating Systems", code: "CS 350", instructor: "Dr. Priya Patel", color: "#06b6d4", attended: 22, total: 25, currentGrade: 78, gradeHistory: [70, 72, 74, 76, 77, 78], pending: 1, credits: 3 },
  { id: 4, name: "Database Management", code: "CS 380", instructor: "Prof. Alan Torres", color: "#10b981", attended: 23, total: 27, currentGrade: 95, gradeHistory: [88, 90, 91, 93, 94, 95], pending: 0, credits: 3 },
  { id: 5, name: "Computer Networks", code: "CS 420", instructor: "Dr. Linda Zhao", color: "#f59e0b", attended: 19, total: 24, currentGrade: 82, gradeHistory: [75, 76, 78, 80, 81, 82], pending: 3, credits: 3 },
];

const recentActivity = [
  { id: 1, type: "grade", course: "CS 301", text: "Assignment 7 graded — 96%", time: "2h ago", icon: Trophy },
  { id: 2, type: "attend", course: "CS 415", text: "Attendance logged for lecture", time: "5h ago", icon: CheckCircle2 },
  { id: 3, type: "pending", course: "CS 420", text: "Lab Report due in 2 days", time: "1d ago", icon: AlertCircle },
  { id: 4, type: "grade", course: "CS 380", text: "Quiz 5 graded — 100%", time: "2d ago", icon: Trophy },
];

export function DashboardPage() {
  const [courses, setCourses] = useState(initialCourses);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const totalAttended = courses.reduce((s, c) => s + c.attended, 0);
  const totalClasses = courses.reduce((s, c) => s + c.total, 0);
  const totalPending = courses.reduce((s, c) => s + c.pending, 0);
  const avgGrade = courses.reduce((s, c) => s + c.currentGrade, 0) / courses.length;
  const gpa = 3.72;

  const handleAddEntry = (course: Course) => {
    setSelectedCourse(course);
    setModalOpen(true);
  };

  const handleSaveEntry = (entry: { date: string; time: string; grade: number; notes: string }) => {
    if (!selectedCourse) return;
    setCourses((prev) =>
      prev.map((c) =>
        c.id === selectedCourse.id
          ? { ...c, attended: c.attended + 1, gradeHistory: [...c.gradeHistory, entry.grade], currentGrade: entry.grade }
          : c
      )
    );
  };

  const getAttendanceColor = (attended: number, total: number) => {
    const rate = attended / total;
    if (rate >= 0.9) return { bar: "bg-emerald-500", text: "text-emerald-500" };
    if (rate >= 0.75) return { bar: "bg-amber-400", text: "text-amber-500" };
    return { bar: "bg-red-400", text: "text-red-500" };
  };

  const getGradeColor = (g: number) => {
    if (g >= 90) return "text-emerald-500";
    if (g >= 80) return "text-indigo-500";
    if (g >= 70) return "text-amber-500";
    return "text-red-500";
  };

  const getGradeBadge = (g: number) => {
    if (g >= 90) return { label: "A", bg: isDark ? "bg-emerald-900/40 text-emerald-400" : "bg-emerald-100 text-emerald-700" };
    if (g >= 80) return { label: "B", bg: isDark ? "bg-indigo-900/40 text-indigo-400" : "bg-indigo-100 text-indigo-700" };
    if (g >= 70) return { label: "C", bg: isDark ? "bg-amber-900/40 text-amber-400" : "bg-amber-100 text-amber-700" };
    return { label: "D", bg: isDark ? "bg-red-900/40 text-red-400" : "bg-red-100 text-red-700" };
  };

  const card = isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200";
  const tableHeader = isDark ? "bg-slate-700/50 border-slate-700" : "bg-slate-50 border-slate-200";
  const rowHover = isDark ? "hover:bg-slate-700/40" : "hover:bg-slate-50/80";
  const divider = isDark ? "divide-slate-700" : "divide-slate-100";
  const textPrimary = isDark ? "text-slate-100" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const textSub = isDark ? "text-slate-500" : "text-slate-400";
  const progressBg = isDark ? "bg-slate-700" : "bg-slate-100";

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* ─── ACADEMIC OVERVIEW ─── */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* GPA Card */}
          <div className={`lg:col-span-1 rounded-2xl border shadow-sm p-6 flex flex-col items-center justify-center ${card}`}>
            <GPACircle gpa={gpa} />
            <p className={`${textPrimary} mt-4 text-sm text-center`} style={{ fontWeight: 600 }}>
              Cumulative GPA
            </p>
            <p className={`${textSub} text-xs text-center mt-1`}>Spring Semester 2025–26</p>
            <div className={`mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full ${isDark ? "bg-indigo-900/30" : "bg-indigo-50"}`}>
              <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-indigo-500 text-xs" style={{ fontWeight: 600 }}>
                +0.12 from last term
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard isDark={isDark} icon={BookOpen} iconBg={isDark ? "bg-indigo-900/50" : "bg-indigo-100"} iconColor="text-indigo-500" label="Classes Attended" value={totalAttended} sub={`of ${totalClasses} total`} progress={(totalAttended / totalClasses) * 100} progressColor="#6366f1" />
            <StatCard isDark={isDark} icon={Clock} iconBg={isDark ? "bg-amber-900/40" : "bg-amber-100"} iconColor="text-amber-500" label="Pending Assignments" value={totalPending} sub="across all courses" progress={null} alert={totalPending > 3} />
            <StatCard isDark={isDark} icon={Target} iconBg={isDark ? "bg-emerald-900/40" : "bg-emerald-100"} iconColor="text-emerald-500" label="Overall Progress" value={`${Math.round(avgGrade)}%`} sub="average grade" progress={avgGrade} progressColor="#10b981" />
          </div>

          {/* Mini stats row */}
          <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MiniStat isDark={isDark} icon={Flame} label="Study Streak" value="12 days" color="text-orange-500" bg={isDark ? "bg-orange-900/30" : "bg-orange-50"} />
            <MiniStat isDark={isDark} icon={Trophy} label="Assignments Done" value="34 / 41" color="text-violet-500" bg={isDark ? "bg-violet-900/30" : "bg-violet-50"} />
            <MiniStat isDark={isDark} icon={CheckCircle2} label="Credits Enrolled" value="16 cr." color="text-cyan-500" bg={isDark ? "bg-cyan-900/30" : "bg-cyan-50"} />
            <MiniStat isDark={isDark} icon={TrendingUp} label="Rank in Class" value="#7 / 92" color="text-indigo-500" bg={isDark ? "bg-indigo-900/30" : "bg-indigo-50"} />
          </div>
        </div>
      </section>

      {/* ─── AI Banner ─── */}
      <div
        className="rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:opacity-90 transition"
        style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}
        onClick={() => navigate("/code-review")}
      >
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white text-sm" style={{ fontWeight: 700 }}>Try AI Code Review</p>
          <p className="text-indigo-200 text-xs">Code Review · Grade Predictor · Study Planner · Assignment Assistant</p>
        </div>
        <ChevronRight className="w-5 h-5 text-white/70 flex-shrink-0" />
      </div>

      {/* ─── COURSES TABLE ─── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={textPrimary} style={{ fontWeight: 700 }}>Enrolled Courses</h2>
            <p className={`${textMuted} text-sm`}>Track attendance & grades per session</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm transition shadow-lg shadow-indigo-900/20">
            <Plus className="w-4 h-4" />
            <span style={{ fontWeight: 600 }}>Add Course</span>
          </button>
        </div>

        <div className={`rounded-2xl border shadow-sm overflow-hidden ${card}`}>
          {/* Table header */}
          <div className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b ${tableHeader}`}>
            {["Course", "Attendance", "Grade Trend", "Current Grade", "Pending", ""].map((h) => (
              <span key={h} className={`${textMuted} text-xs`} style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {h}
              </span>
            ))}
          </div>

          <div className={`divide-y ${divider}`}>
            {courses.map((course) => {
              const attnColor = getAttendanceColor(course.attended, course.total);
              const gradeBadge = getGradeBadge(course.currentGrade);
              const attnRate = Math.round((course.attended / course.total) * 100);
              return (
                <div key={course.id} className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 ${rowHover} transition`}>
                  {/* Course info */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: course.color + "20" }}>
                      <BookOpen className="w-4 h-4" style={{ color: course.color }} />
                    </div>
                    <div>
                      <p className={`${textPrimary} text-sm`} style={{ fontWeight: 600 }}>{course.name}</p>
                      <p className={`${textSub} text-xs`}>{course.code} · {course.instructor}</p>
                    </div>
                  </div>

                  {/* Attendance */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs ${attnColor.text}`} style={{ fontWeight: 600 }}>{attnRate}%</span>
                      <span className={`${textSub} text-xs`}>{course.attended}/{course.total}</span>
                    </div>
                    <div className={`h-1.5 rounded-full overflow-hidden ${progressBg}`}>
                      <div className={`h-full ${attnColor.bar} rounded-full`} style={{ width: `${attnRate}%` }} />
                    </div>
                  </div>

                  {/* Sparkline */}
                  <GradeSparkline data={course.gradeHistory} color={course.color} width={72} height={28} />

                  {/* Grade */}
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${getGradeColor(course.currentGrade)}`} style={{ fontWeight: 700 }}>{course.currentGrade}%</span>
                    <span className={`text-xs px-2 py-0.5 rounded-lg ${gradeBadge.bg}`} style={{ fontWeight: 700 }}>{gradeBadge.label}</span>
                  </div>

                  {/* Pending */}
                  <div>
                    {course.pending > 0 ? (
                      <span className="flex items-center gap-1 text-amber-500 text-xs" style={{ fontWeight: 600 }}>
                        <AlertCircle className="w-3.5 h-3.5" />{course.pending} due
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-500 text-xs" style={{ fontWeight: 600 }}>
                        <CheckCircle2 className="w-3.5 h-3.5" />Clear
                      </span>
                    )}
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => handleAddEntry(course)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition ${isDark ? "bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-400" : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700"}`}
                    style={{ fontWeight: 600 }}
                  >
                    <Plus className="w-3.5 h-3.5" />Add Entry
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM ROW ─── */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Recent Activity */}
          <div className={`rounded-2xl border shadow-sm p-5 ${card}`}>
            <h3 className={textPrimary} style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "1rem" }}>Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((a) => {
                const Icon = a.icon;
                return (
                  <div key={a.id} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      a.type === "grade" ? isDark ? "bg-emerald-900/40" : "bg-emerald-100"
                      : a.type === "attend" ? isDark ? "bg-indigo-900/40" : "bg-indigo-100"
                      : isDark ? "bg-amber-900/40" : "bg-amber-100"
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        a.type === "grade" ? "text-emerald-500"
                        : a.type === "attend" ? "text-indigo-500"
                        : "text-amber-500"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className={`${isDark ? "text-slate-300" : "text-slate-700"} text-xs`} style={{ fontWeight: 500 }}>{a.text}</p>
                      <p className={`${textSub} text-xs mt-0.5`}>{a.course} · {a.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className={`rounded-2xl border shadow-sm p-5 ${card}`}>
            <h3 className={textPrimary} style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "1rem" }}>Upcoming Deadlines</h3>
            <div className="space-y-3">
              {[
                { course: "CS 301", task: "Project Proposal", due: "Feb 21", urgent: true, credits: 15 },
                { course: "CS 415", task: "Lab 4 — Neural Nets", due: "Feb 23", urgent: false, credits: 20 },
                { course: "CS 420", task: "Network Simulation Report", due: "Feb 24", urgent: false, credits: 10 },
                { course: "CS 350", task: "Process Scheduling Quiz", due: "Feb 26", urgent: false, credits: 5 },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? "bg-slate-700/40" : "bg-slate-50"}`}>
                  <div className={`w-2 h-8 rounded-full flex-shrink-0 ${item.urgent ? "bg-red-400" : "bg-indigo-300"}`} />
                  <div className="flex-1">
                    <p className={`${isDark ? "text-slate-200" : "text-slate-700"} text-xs`} style={{ fontWeight: 600 }}>{item.task}</p>
                    <p className={`${textSub} text-xs`}>{item.course}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs ${item.urgent ? "text-red-500" : isDark ? "text-slate-300" : "text-slate-600"}`} style={{ fontWeight: 600 }}>{item.due}</p>
                    <p className={`${textSub} text-xs`}>{item.credits} pts</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${textSub}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {modalOpen && selectedCourse && (
        <AddEntryModal
          courseName={selectedCourse.name}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveEntry}
        />
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function StatCard({ isDark, icon: Icon, iconBg, iconColor, label, value, sub, progress, progressColor, alert }: {
  isDark: boolean; icon: React.ElementType; iconBg: string; iconColor: string;
  label: string; value: number | string; sub: string;
  progress: number | null; progressColor?: string; alert?: boolean;
}) {
  const card = isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200";
  const textPrimary = isDark ? "text-slate-100" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const progressBg = isDark ? "bg-slate-700" : "bg-slate-100";
  return (
    <div className={`rounded-2xl border shadow-sm p-5 ${card}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {alert && <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? "bg-red-900/40 text-red-400" : "bg-red-100 text-red-600"}`} style={{ fontWeight: 600 }}>Attention</span>}
      </div>
      <p style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: "1.1" }} className={textPrimary}>{value}</p>
      <p className={`${textMuted} text-xs mt-1`}>{label}</p>
      <p className={`${isDark ? "text-slate-500" : "text-slate-400"} text-xs`}>{sub}</p>
      {progress !== null && (
        <div className={`mt-3 h-1.5 rounded-full overflow-hidden ${progressBg}`}>
          <div className="h-full rounded-full" style={{ width: `${Math.min(progress, 100)}%`, background: progressColor || "#6366f1" }} />
        </div>
      )}
    </div>
  );
}

function MiniStat({ isDark, icon: Icon, label, value, color, bg }: {
  isDark: boolean; icon: React.ElementType; label: string; value: string; color: string; bg: string;
}) {
  const card = isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200";
  const textPrimary = isDark ? "text-slate-100" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  return (
    <div className={`rounded-2xl border shadow-sm p-4 flex items-center gap-3 ${card}`}>
      <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div>
        <p className={`text-sm ${textPrimary}`} style={{ fontWeight: 700 }}>{value}</p>
        <p className={`text-xs ${textMuted}`}>{label}</p>
      </div>
    </div>
  );
}
