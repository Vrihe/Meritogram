import { useState, useEffect } from "react";
import { X, AlertCircle, Search, BookOpen, Users, Clock } from "lucide-react";
import { courseService, type CourseData } from "../services/course.service";

interface EnrollCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnroll: (courseId: string) => Promise<void>;
  enrolledCourseIds: string[];
}

export function EnrollCourseModal({ isOpen, onClose, onEnroll, enrolledCourseIds }: EnrollCourseModalProps) {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseData[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadCourses();
    }
  }, [isOpen]);

  useEffect(() => {
    const filtered = courses.filter(
      (c) =>
        (c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.code.toLowerCase().includes(search.toLowerCase()) ||
          c.instructor.toLowerCase().includes(search.toLowerCase())) &&
        !enrolledCourseIds.includes(c.id)
    );
    setFilteredCourses(filtered);
  }, [search, courses, enrolledCourseIds]);

  const loadCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await courseService.getAvailable();
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    setEnrolling(courseId);
    setError("");
    try {
      await onEnroll(courseId);
      setSuccess("Successfully enrolled in course!");
      setTimeout(() => setSuccess(""), 3000);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enroll");
    } finally {
      setEnrolling(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#0c0814] rounded-xl border border-slate-200 dark:border-purple-900/50 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-purple-900/50">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-purple-50">Enroll in Course</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-[#1a122e] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-purple-400/70" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-purple-500/50" />
            <input
              type="text"
              placeholder="Search by course name, code, or instructor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-purple-900/50 rounded-lg bg-white dark:bg-[#130d26] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-purple-300/30 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-colors"
            />
          </div>

          {/* Messages */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-[#2a0e16] border border-red-200 dark:border-red-900/50 rounded-lg flex gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 dark:bg-[#0e2a1a] border border-green-200 dark:border-green-900/50 rounded-lg flex gap-2">
              <p className="text-sm text-green-700 dark:text-green-200">{success}</p>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-purple-300/50 font-medium">Loading courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-10">
              <BookOpen className="w-12 h-12 text-slate-300 dark:text-purple-900/30 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-purple-300/50 font-medium">No courses available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="p-4 border border-slate-200 dark:border-purple-900/30 rounded-xl bg-white dark:bg-[#160f24] hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 dark:text-purple-50">{course.name}</h4>
                      <p className="text-sm text-slate-500 dark:text-purple-300/60 mt-1">{course.code}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-600 dark:text-purple-300/50">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{course.instructor}</span>
                        </div>
                        {course.credits && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{course.credits} credits</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrolling === course.id}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition whitespace-nowrap"
                    >
                      {enrolling === course.id ? "Enrolling..." : "Enroll"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
