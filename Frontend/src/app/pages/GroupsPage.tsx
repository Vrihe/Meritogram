import { useState } from "react";
import { Users, UserPlus, Mail, Search, Shield, User as UserIcon, X } from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher";
  group?: string;
  avatar?: string;
}

const initialStudents: Student[] = [];

const groups = ["Group A", "Group B", "Group C"];

export function GroupsPage() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All Groups");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", email: "", role: "student" as "student" | "teacher", group: "" });

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = selectedGroup === "All Groups" || student.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const handleAddStudent = () => {
    if (newStudent.name && newStudent.email) {
      setStudents([
        ...students,
        {
          ...newStudent,
          id: Date.now().toString(),
          group: newStudent.group || undefined,
        },
      ]);
      setNewStudent({ name: "", email: "", role: "student", group: "" });
      setIsAddModalOpen(false);
    }
  };

  const handleRemoveStudent = (id: string) => {
    setStudents(students.filter((s) => s.id !== id));
  };

  const handleRoleToggle = (id: string) => {
    setStudents(
      students.map((s) =>
        s.id === id ? { ...s, role: s.role === "student" ? "teacher" : "student" } : s
      )
    );
  };

  const stats = {
    total: students.length,
    teachers: students.filter((s) => s.role === "teacher").length,
    students: students.filter((s) => s.role === "student").length,
    unassigned: students.filter((s) => !s.group).length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-neutral-900 dark:text-white mb-2">Group Management</h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">
            Manage students, teachers, and group assignments
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-neutral-700 text-white hover:bg-neutral-800 dark:hover:bg-neutral-600 transition"
        >
          <UserPlus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-card border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-neutral-500" />
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Total Members</p>
          </div>
          <p className="text-2xl text-neutral-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-card border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <UserIcon className="w-4 h-4 text-neutral-500" />
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Students</p>
          </div>
          <p className="text-2xl text-neutral-900 dark:text-white">{stats.students}</p>
        </div>
        <div className="bg-card border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-neutral-500" />
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Teachers</p>
          </div>
          <p className="text-2xl text-neutral-900 dark:text-white">{stats.teachers}</p>
        </div>
        <div className="bg-card border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-neutral-500" />
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Unassigned</p>
          </div>
          <p className="text-2xl text-neutral-900 dark:text-white">{stats.unassigned}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex-1 max-w-md flex items-center gap-2 bg-card border-border px-3 py-2">
          <Search className="w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="bg-transparent border-none outline-none text-sm text-neutral-900 dark:text-white w-full placeholder-neutral-400"
          />
        </div>
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="px-3 py-2 bg-card border-border text-neutral-900 dark:text-white outline-none"
        >
          <option value="All Groups">All Groups</option>
          {groups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
          <option value="unassigned">Unassigned</option>
        </select>
      </div>

      {/* Student List */}
      <div className="bg-card border-border">
        <div className="border-b border-border px-6 py-4">
          <h3 className="text-neutral-900 dark:text-white">Members</h3>
        </div>
        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="px-6 py-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-neutral-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">
                    {student.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-neutral-900 dark:text-white">{student.name}</p>
                    <span
                      className={`text-xs px-2 py-0.5 ${
                        student.role === "teacher"
                          ? "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      {student.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {student.email}
                    </p>
                    {student.group && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-500 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {student.group}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRoleToggle(student.id)}
                  className="px-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                >
                  Toggle Role
                </button>
                <button
                  onClick={() => handleRemoveStudent(student.id)}
                  className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsAddModalOpen(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-card border-border p-6 w-full max-w-md">
              <h3 className="text-neutral-900 dark:text-white mb-4">Add New Member</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-700 dark:text-neutral-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white outline-none"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-700 dark:text-neutral-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white outline-none"
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-700 dark:text-neutral-300 mb-2">
                    Role
                  </label>
                  <select
                    value={newStudent.role}
                    onChange={(e) => setNewStudent({ ...newStudent, role: e.target.value as "student" | "teacher" })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-neutral-700 dark:text-neutral-300 mb-2">
                    Group (Optional)
                  </label>
                  <select
                    value={newStudent.group}
                    onChange={(e) => setNewStudent({ ...newStudent, group: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white outline-none"
                  >
                    <option value="">No Group</option>
                    {groups.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddStudent}
                  className="flex-1 px-4 py-2 bg-neutral-900 dark:bg-neutral-700 text-white hover:bg-neutral-800 dark:hover:bg-neutral-600 transition"
                >
                  Add Member
                </button>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-border text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

