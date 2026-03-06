import { Mail, Phone, MapPin, Calendar, GraduationCap, Award, BookOpen, Clock } from "lucide-react";

export function ProfilePage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-3xl">AJ</span>
          </div>
          <div className="flex-1">
            <h2 className="text-slate-900 dark:text-white mb-1">Alex Johnson</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-3">Computer Science · Junior Year</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Mail className="w-4 h-4" />
                <span>alex.johnson@university.edu</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <MapPin className="w-4 h-4" />
                <span>Stanford, CA</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>Joined September 2023</span>
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
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-5 h-5 text-indigo-500" />
            <p className="text-xs text-slate-600 dark:text-slate-400">GPA</p>
          </div>
          <p className="text-2xl text-slate-900 dark:text-white">3.68</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <p className="text-xs text-slate-600 dark:text-slate-400">Credits</p>
          </div>
          <p className="text-2xl text-slate-900 dark:text-white">87</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-amber-500" />
            <p className="text-xs text-slate-600 dark:text-slate-400">Rank</p>
          </div>
          <p className="text-2xl text-slate-900 dark:text-white">12th</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-green-500" />
            <p className="text-xs text-slate-600 dark:text-slate-400">Attendance</p>
          </div>
          <p className="text-2xl text-slate-900 dark:text-white">94%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Academic Information */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-slate-900 dark:text-white mb-4">Academic Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">Student ID</span>
              <span className="text-slate-900 dark:text-white">20231045</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">Major</span>
              <span className="text-slate-900 dark:text-white">Computer Science</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">Minor</span>
              <span className="text-slate-900 dark:text-white">Mathematics</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">Expected Graduation</span>
              <span className="text-slate-900 dark:text-white">May 2027</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">Academic Advisor</span>
              <span className="text-slate-900 dark:text-white">Dr. Sarah Chen</span>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5">
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

      {/* Bio Section */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 mt-6">
        <h3 className="text-slate-900 dark:text-white mb-3">Bio</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          I'm a passionate Computer Science student with a focus on artificial intelligence and machine learning.
          I enjoy building projects that solve real-world problems and have a particular interest in natural language
          processing and computer vision. When I'm not coding, you can find me participating in hackathons, contributing
          to open-source projects, or mentoring freshman students in introductory programming courses.
        </p>
      </div>
    </div>
  );
}
