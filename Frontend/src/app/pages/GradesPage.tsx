import { TrendingUp, TrendingDown, Award } from "lucide-react";

interface Course {
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

const courses: Course[] = [
  {
    id: "1",
    name: "Data Structures & Algorithms",
    code: "CS 201",
    grade: 92,
    letterGrade: "A",
    credits: 4,
    trend: "up",
    assignments: [
      { name: "Midterm Exam", score: 88, maxScore: 100, weight: 30 },
      { name: "Final Project", score: 95, maxScore: 100, weight: 40 },
      { name: "Homework Avg", score: 92, maxScore: 100, weight: 30 },
    ],
  },
  {
    id: "2",
    name: "Database Systems",
    code: "CS 305",
    grade: 88,
    letterGrade: "A-",
    credits: 3,
    trend: "stable",
    assignments: [
      { name: "Midterm Exam", score: 85, maxScore: 100, weight: 35 },
      { name: "Final Project", score: 90, maxScore: 100, weight: 35 },
      { name: "Lab Work", score: 89, maxScore: 100, weight: 30 },
    ],
  },
  {
    id: "3",
    name: "Machine Learning",
    code: "CS 412",
    grade: 85,
    letterGrade: "B+",
    credits: 4,
    trend: "down",
    assignments: [
      { name: "Midterm Exam", score: 82, maxScore: 100, weight: 30 },
      { name: "Research Project", score: 88, maxScore: 100, weight: 45 },
      { name: "Assignments", score: 84, maxScore: 100, weight: 25 },
    ],
  },
  {
    id: "4",
    name: "Software Engineering",
    code: "CS 320",
    grade: 95,
    letterGrade: "A",
    credits: 3,
    trend: "up",
    assignments: [
      { name: "Team Project", score: 96, maxScore: 100, weight: 50 },
      { name: "Code Reviews", score: 94, maxScore: 100, weight: 25 },
      { name: "Documentation", score: 95, maxScore: 100, weight: 25 },
    ],
  },
];

export function GradesPage() {
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const weightedGPA = courses.reduce((sum, c) => sum + c.grade * c.credits, 0) / totalCredits;

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
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">↑ 0.12 from last semester</p>
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
            <p className="text-sm text-slate-600 dark:text-slate-400">Class Rank</p>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl text-slate-900 dark:text-white">
            12th
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Out of 245 students</p>
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
