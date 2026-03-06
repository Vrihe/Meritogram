import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Award } from "lucide-react";
import { gradeService, type GradeRecord } from "../services/grade.service";
import { courseService, type CourseData } from "../services/course.service";

interface CourseGrades {
  id: string;
  name: string;
  code: string;
  grade: number;
  letterGrade: string;
  credits: number;
  trend: "up" | "down" | "stable";
  assignments: {
    name: string;
    score: number;
    maxScore: number;
    weight: number;
  }[];
}

function getLetterGrade(score: number): string {
  if (score >= 93) return "A";
  if (score >= 90) return "A-";
  if (score >= 87) return "B+";
  if (score >= 83) return "B";
  if (score >= 80) return "B-";
  if (score >= 77) return "C+";
  if (score >= 73) return "C";
  if (score >= 70) return "C-";
  if (score >= 67) return "D+";
  if (score >= 60) return "D";
  return "F";
}

function getTrend(grades: GradeRecord[]): "up" | "down" | "stable" {
  if (grades.length < 2) return "stable";
  const sorted = [...grades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const recent = sorted[sorted.length - 1].score;
  const prev = sorted[sorted.length - 2].score;
  if (recent > prev) return "up";
  if (recent < prev) return "down";
  return "stable";
}

export function GradesPage() {
  const [courses, setCourses] = useState<CourseGrades[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [gradesData, coursesData] = await Promise.all([
          gradeService.getAll(),
          courseService.getAll(),
        ]);

        const courseMap = new Map<string, CourseData>();
        coursesData.forEach((c) => courseMap.set(c.id, c));

        const gradesByCourse = new Map<string, GradeRecord[]>();
        gradesData.forEach((g) => {
          const list = gradesByCourse.get(g.course_id) || [];
          list.push(g);
          gradesByCourse.set(g.course_id, list);
        });

        const mapped: CourseGrades[] = [];
        gradesByCourse.forEach((grades, courseId) => {
          const course = courseMap.get(courseId);
          if (!course) return;

          const avgScore = grades.reduce((s, g) => s + g.score, 0) / grades.length;

          mapped.push({
            id: courseId,
            name: course.name,
            code: course.code,
            grade: Math.round(avgScore),
            letterGrade: getLetterGrade(avgScore),
            credits: course.credits || 3,
            trend: getTrend(grades),
            assignments: grades.map((g) => ({
              name: g.name,
              score: g.score,
              maxScore: g.max_score,
              weight: g.weight,
            })),
          });
        });

        setCourses(mapped);
      } catch (err) {
        console.error("Failed to load grades:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const weightedGPA = totalCredits > 0
    ? courses.reduce((sum, c) => sum + c.grade * c.credits, 0) / totalCredits
    : 0;

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">Cumulative GPA</p>
            <Award className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-3xl text-slate-900 dark:text-white">
            {(weightedGPA / 25).toFixed(2)}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">Current semester</p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Credits</p>
            <Award className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl text-slate-900 dark:text-white">
            {totalCredits}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">This semester</p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">Courses</p>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl text-slate-900 dark:text-white">
            {courses.length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">With grades</p>
        </div>
      </div>

      {/* Course Grades */}
      <div className="space-y-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-slate-900 dark:text-white">{course.name}</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-slate-700">
                    {course.code}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {course.credits} credits
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <span className="text-2xl text-slate-900 dark:text-white">
                    {course.grade}%
                  </span>
                  <span
                    className={`text-lg px-2 py-0.5 ${
                      course.letterGrade.startsWith("A")
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : course.letterGrade.startsWith("B")
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    {course.letterGrade}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  {course.trend === "up" ? (
                    <>
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-green-600 dark:text-green-400">Improving</span>
                    </>
                  ) : course.trend === "down" ? (
                    <>
                      <TrendingDown className="w-3 h-3 text-red-500" />
                      <span className="text-red-600 dark:text-red-400">Declining</span>
                    </>
                  ) : (
                    <span className="text-slate-500 dark:text-slate-400">Stable</span>
                  )}
                </div>
              </div>
            </div>

            {/* Assignment Breakdown */}
            <div className="space-y-2">
              {course.assignments.map((assignment, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {assignment.name}
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {assignment.score}/{assignment.maxScore} ({assignment.weight}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 overflow-hidden">
                      <div
                        className={`h-full ${
                          (assignment.score / assignment.maxScore) * 100 >= 90
                            ? "bg-green-500"
                            : (assignment.score / assignment.maxScore) * 100 >= 80
                            ? "bg-blue-500"
                            : "bg-amber-500"
                        }`}
                        style={{
                          width: `${(assignment.score / assignment.maxScore) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
