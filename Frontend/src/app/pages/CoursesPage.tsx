import { useState, useEffect } from "react";
import { BookOpen, Users, Clock, Award, ChevronRight, Plus, Search, Filter } from "lucide-react";
import { GradeSparkline } from "../components/GradeSparkline";
import { useTheme } from "../context/ThemeContext";
import { courseService, type CourseData } from "../services/course.service";
import { gradeService } from "../services/grade.service";

interface CourseFull extends CourseData {
  students: number;
  attended: number;
  total: number;
  currentGrade: number;
  gradeHistory: number[];
}

export function CoursesPage() {
  const [courses, setCourses] = useState<CourseFull[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CourseFull | null>(null);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    async function load() {
      try {
        const [coursesData, gradesData] = await Promise.all([
          courseService.getAll(),
          gradeService.getAll(),
        ]);
        const mapped: CourseFull[] = coursesData.map((c) => {
          const courseGrades = gradesData
            .filter((g) => g.course_id === c.id)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          return {
            ...c,
            students: 30,
            attended: c.attendance?.length || 0,
            total: c.total_sessions,
            currentGrade: courseGrades.length > 0 ? courseGrades[courseGrades.length - 1].score : 0,
            gradeHistory: courseGrades.map((g) => g.score),
          };
        });
        setCourses(mapped);
      } catch (err) {
        console.error("Failed to load courses:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase())
  );

  const card = isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200";
  const cardHover = isDark ? "hover:border-slate-600" : "hover:border-slate-300";
  const textPrimary = isDark ? "text-slate-100" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const textSub = isDark ? "text-slate-500" : "text-slate-400";
  const inputBg = isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200";
  const inputText = isDark ? "text-slate-200 placeholder-slate-500" : "text-slate-700 placeholder-slate-400";
  const tagBg = isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-500";
  const progressBg = isDark ? "bg-slate-700" : "bg-slate-100";
  const detailBg = isDark ? "bg-slate-700/40" : "bg-slate-50";
  const detailBorder = isDark ? "border-slate-700" : "border-slate-100";

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={textPrimary} style={{ fontWeight: 700, fontSize: "1.2rem" }}>My Courses</h2>
          <p className={`${textMuted} text-sm`}>Spring 2026 · {courses.length} enrolled courses · 16 credits</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm transition shadow-lg shadow-indigo-900/20">
          <Plus className="w-4 h-4" />
          <span style={{ fontWeight: 600 }}>Enroll in Course</span>
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-5">
        <div className={`flex items-center gap-2 border px-3 py-2 flex-1 max-w-sm ${inputBg}`}>
          <Search className="w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className={`bg-transparent border-none outline-none text-sm w-full ${inputText}`}
          />
        </div>
        <button className={`flex items-center gap-2 px-4 py-2 border text-sm hover:opacity-80 transition ${isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-slate-200 text-slate-600"}`}>
          <Filter className="w-4 h-4" />
          <span style={{ fontWeight: 500 }}>Filter</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Course list */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.map((course) => {
            const attnRate = Math.round((course.attended / course.total) * 100);
            const isSelected = selected?.id === course.id;
            return (
              <div
                key={course.id}
                onClick={() => setSelected(isSelected ? null : course)}
                className={`border shadow-sm p-5 cursor-pointer transition-all ${
                  isSelected
                    ? isDark ? "border-indigo-700 shadow-indigo-900/30 shadow-md" : "border-indigo-300 shadow-indigo-100 shadow-md"
                    : `${card} ${cardHover}`
                } ${isSelected ? (isDark ? "bg-slate-800" : "bg-white") : card}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex items-center justify-center flex-shrink-0" style={{ background: course.color + "15" }}>
                    <BookOpen className="w-6 h-6" style={{ color: course.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`${textPrimary} text-sm`} style={{ fontWeight: 700 }}>{course.name}</p>
                        <p className={`${textMuted} text-xs mt-0.5`}>{course.code} · {course.instructor}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm" style={{ fontWeight: 800, color: course.currentGrade >= 90 ? "#10b981" : course.currentGrade >= 80 ? "#6366f1" : "#f59e0b" }}>
                          {course.currentGrade}%
                        </p>
                        <p className={`${textSub} text-xs`}>{course.credits} cr.</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`${textMuted} text-xs`}>Attendance</span>
                          <span className={`${isDark ? "text-slate-300" : "text-slate-600"} text-xs`} style={{ fontWeight: 600 }}>{attnRate}%</span>
                        </div>
                        <div className={`h-1.5 rounded-full overflow-hidden ${progressBg}`}>
                          <div className="h-full rounded-full" style={{ width: `${attnRate}%`, background: attnRate >= 90 ? "#10b981" : attnRate >= 75 ? "#f59e0b" : "#ef4444" }} />
                        </div>
                      </div>
                      <GradeSparkline data={course.gradeHistory} color={course.color} />
                    </div>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {course.tags.map((tag) => (
                        <span key={tag} className={`text-xs px-2 py-0.5 ${tagBg}`} style={{ fontWeight: 500 }}>{tag}</span>
                      ))}
                      <span className={`ml-auto flex items-center gap-1 ${textMuted} text-xs`}>
                        <Clock className="w-3 h-3" /> {course.schedule}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 flex-shrink-0 mt-1 transition-transform ${isSelected ? "rotate-90 text-indigo-500" : textMuted}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-1">
          {selected ? (
            <div className={`border shadow-sm overflow-hidden sticky top-6 ${card}`}>
              <div className="h-2" style={{ background: `linear-gradient(to right, ${selected.color}, ${selected.color}80)` }} />
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 flex items-center justify-center" style={{ background: selected.color + "15" }}>
                    <BookOpen className="w-5 h-5" style={{ color: selected.color }} />
                  </div>
                  <div>
                    <p className={`${textPrimary} text-sm`} style={{ fontWeight: 700 }}>{selected.name}</p>
                    <p className={`${textMuted} text-xs`}>{selected.code}</p>
                  </div>
                </div>
                <p className={`${isDark ? "text-slate-300" : "text-slate-600"} text-sm mb-4 leading-relaxed`}>{selected.description}</p>
                <div className="space-y-3">
                  {[
                    { icon: Users, label: "Instructor", value: selected.instructor },
                    { icon: Clock, label: "Schedule", value: selected.schedule },
                    { icon: Award, label: "Room", value: selected.room },
                    { icon: Users, label: "Class Size", value: `${selected.students} students` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className={`flex items-center gap-3 py-2 border-b ${detailBorder}`}>
                      <Icon className={`w-4 h-4 ${textMuted} flex-shrink-0`} />
                      <div className="flex-1">
                        <p className={`${textMuted} text-xs`}>{label}</p>
                        <p className={`${isDark ? "text-slate-200" : "text-slate-700"} text-sm`} style={{ fontWeight: 500 }}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={`mt-4 p-3 ${detailBg}`}>
                  <p className={`${isDark ? "text-slate-300" : "text-slate-700"} text-xs mb-2`} style={{ fontWeight: 600 }}>Grade History</p>
                  <GradeSparkline data={selected.gradeHistory} color={selected.color} width={200} height={50} />
                </div>
                <button className="mt-4 w-full py-2.5 text-sm text-white transition" style={{ background: selected.color, fontWeight: 600 }}>
                  View Full Details
                </button>
              </div>
            </div>
          ) : (
            <div className={`border shadow-sm p-8 flex flex-col items-center justify-center text-center ${card}`}>
              <div className={`w-14 h-14 flex items-center justify-center mb-3 ${isDark ? "bg-indigo-900/30" : "bg-indigo-50"}`}>
                <BookOpen className="w-7 h-7 text-indigo-400" />
              </div>
              <p className={`${textPrimary} text-sm`} style={{ fontWeight: 600 }}>Select a Course</p>
              <p className={`${textMuted} text-xs mt-1`}>Click any course to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}