import { useState } from "react";
import { Calendar, CheckCircle, XCircle, Clock, Filter } from "lucide-react";

interface AttendanceRecord {
  date: string;
  course: string;
  status: "present" | "absent" | "late";
  notes?: string;
}

const attendanceData: AttendanceRecord[] = [
  { date: "2026-03-06", course: "CS 301", status: "present" },
  { date: "2026-03-06", course: "CS 415", status: "late", notes: "Arrived 10 min late" },
  { date: "2026-03-05", course: "CS 301", status: "present" },
  { date: "2026-03-05", course: "CS 350", status: "absent", notes: "Sick leave" },
  { date: "2026-03-04", course: "CS 380", status: "present" },
  { date: "2026-03-04", course: "CS 420", status: "present" },
  { date: "2026-03-03", course: "CS 301", status: "present" },
  { date: "2026-03-03", course: "CS 415", status: "present" },
];

const courses = ["All Courses", "CS 301", "CS 350", "CS 380", "CS 415", "CS 420"];

export function AttendancePage() {
  const [selectedCourse, setSelectedCourse] = useState("All Courses");

  const filteredData = selectedCourse === "All Courses"
    ? attendanceData
    : attendanceData.filter(record => record.course === selectedCourse);

  const stats = {
    present: attendanceData.filter(r => r.status === "present").length,
    absent: attendanceData.filter(r => r.status === "absent").length,
    late: attendanceData.filter(r => r.status === "late").length,
    total: attendanceData.length,
  };

  const attendanceRate = ((stats.present / stats.total) * 100).toFixed(1);

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
            {((stats.present / stats.total) * 100).toFixed(0)}% of total
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Absent</p>
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl text-neutral-900 dark:text-white">{stats.absent}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
            {((stats.absent / stats.total) * 100).toFixed(0)}% of total
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Late</p>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl text-neutral-900 dark:text-white">{stats.late}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
            {((stats.late / stats.total) * 100).toFixed(0)}% of total
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
          {filteredData.map((record, idx) => (
            <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition">
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
                  <p className="text-sm text-neutral-900 dark:text-white">{record.course}</p>
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
          ))}
        </div>
      </div>
    </div>
  );
}
