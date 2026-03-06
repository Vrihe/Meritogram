import { useState, useEffect } from "react";
import { Calendar, CheckCircle, XCircle, Clock, Filter } from "lucide-react";
import { attendanceService, type AttendanceRecord } from "../services/attendance.service";
import { courseService } from "../services/course.service";

export function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [courses, setCourses] = useState<string[]>(["All Courses"]);
  const [selectedCourse, setSelectedCourse] = useState("All Courses");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [attendanceData, coursesData] = await Promise.all([
          attendanceService.getAll(),
          courseService.getAll(),
        ]);
        setRecords(attendanceData);
        setCourses(["All Courses", ...coursesData.map((c) => c.code)]);
      } catch (err) {
        console.error("Failed to load attendance:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredData = selectedCourse === "All Courses"
    ? records
    : records.filter(record => record.course_code === selectedCourse);

  const stats = {
    present: records.filter(r => r.status === "present").length,
    absent: records.filter(r => r.status === "absent").length,
    late: records.filter(r => r.status === "late").length,
    total: records.length,
  };

  const attendanceRate = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : "0.0";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
      case "absent":
        return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
      case "late":
        return "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      default:
        return "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-4 h-4" />;
      case "absent":
        return <XCircle className="w-4 h-4" />;
      case "late":
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-neutral-900 dark:text-white mb-2">Attendance Tracker</h2>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm">
          View and manage your class attendance records
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Attendance Rate</p>
            <Calendar className="w-5 h-5 text-neutral-500" />
          </div>
          <p className="text-3xl text-neutral-900 dark:text-white">{attendanceRate}%</p>
          <div className="mt-2 h-2 bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-green-600"
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Present</p>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl text-neutral-900 dark:text-white">{stats.present}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
            {stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(0) : 0}% of total
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Absent</p>
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl text-neutral-900 dark:text-white">{stats.absent}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
            {stats.total > 0 ? ((stats.absent / stats.total) * 100).toFixed(0) : 0}% of total
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Late</p>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl text-neutral-900 dark:text-white">{stats.late}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
            {stats.total > 0 ? ((stats.late / stats.total) * 100).toFixed(0) : 0}% of total
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4 flex items-center gap-3">
        <Filter className="w-4 h-4 text-neutral-500" />
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white outline-none"
        >
          {courses.map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </select>
      </div>

      {/* Attendance Records */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <div className="border-b border-neutral-200 dark:border-neutral-800 px-6 py-4">
          <h3 className="text-neutral-900 dark:text-white">Attendance Records</h3>
        </div>
        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {filteredData.length === 0 ? (
            <div className="px-6 py-8 text-center text-neutral-500 dark:text-neutral-400 text-sm">
              No attendance records found
            </div>
          ) : (
            filteredData.map((record) => (
              <div key={record.id} className="px-6 py-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-xs text-neutral-500 dark:text-neutral-500">
                      {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className="text-lg text-neutral-900 dark:text-white">
                      {new Date(record.date).getDate()}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-500">
                      {new Date(record.date).toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-900 dark:text-white">{record.course_code || record.course_name}</p>
                    {record.notes && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-0.5">
                        {record.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 border ${getStatusColor(record.status)}`}
                >
                  {getStatusIcon(record.status)}
                  <span className="text-xs capitalize">{record.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
