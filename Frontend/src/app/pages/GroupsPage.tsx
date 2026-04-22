import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  X,
  ChevronDown,
  UserPlus,
} from "lucide-react";
import { Navigate } from "react-router";

interface Student {
  id: string;
  email: string;
  profile: {
    full_name: string;
    student_id: string;
    major: string;
  };
  academic: {
    year: string;
    gpa_target: number;
  };
}

interface Group {
  id: string;
  name: string;
  academic_year: string;
  description?: string;
  professor_id: string;
  students: Student[];
  created_at: string;
}

export function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "year" | "created">("name");

  // Modal states
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  // Form states
  const [groupForm, setGroupForm] = useState({ name: "", academic_year: "1st Year", description: "" });
  const [editForm, setEditForm] = useState({ name: "", academic_year: "", description: "" });
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Only professors can access this
  if (user?.role !== "professor") {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      setError("");
      const [groupsRes, studentsRes] = await Promise.all([
        fetch("http://localhost:8000/api/professor/groups", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        fetch("http://localhost:8000/api/professor/unassigned-students", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
      ]);

      if (!groupsRes.ok || !studentsRes.ok) {
        throw new Error("Failed to load data");
      }

      const groupsData = await groupsRes.json();
      const studentsData = await studentsRes.json();

      const mappedGroups = (groupsData.groups || []).map((g: any) => ({
        ...g,
        id: g._id || g.id,
        students: (g.students || []).map((s: any) => ({ ...s, id: s._id || s.id }))
      }));
      setGroups(mappedGroups);
      
      const mappedStudents = (studentsData.students || []).map((s: any) => ({
        ...s,
        id: s._id || s.id
      }));
      setUnassignedStudents(mappedStudents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupForm.name.trim()) {
      setError("Group name is required");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/professor/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(groupForm),
      });

      if (!response.ok) {
        throw new Error("Failed to create group");
      }

      setSuccess("Group created successfully");
      setGroupForm({ name: "", academic_year: "1st Year", description: "" });
      setShowCreateGroupModal(false);
      setTimeout(() => setSuccess(""), 3000);
      await loadGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create group");
    }
  };

  const handleUpdateGroup = async (groupId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/professor/groups/${groupId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error("Failed to update group");
      }

      setSuccess("Group updated successfully");
      setEditingGroupId(null);
      setTimeout(() => setSuccess(""), 3000);
      await loadGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update group");
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm("Are you sure you want to delete this group?")) return;

    try {
      const response = await fetch(`http://localhost:8000/api/professor/groups/${groupId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) {
        throw new Error("Failed to delete group");
      }

      setSuccess("Group deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
      await loadGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete group");
    }
  };

  const handleAddStudentToGroup = async () => {
    if (selectedStudentIds.length === 0) {
      setError("Please select at least one student");
      return;
    }
    
    if (!selectedGroupId) {
      setError("Internal error: target group is not selected. Please try again.");
      return;
    }

    try {
      const promises = selectedStudentIds.map(studentId =>
        fetch(`http://localhost:8000/api/professor/groups/${selectedGroupId}/students`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ student_id: studentId }),
        })
      );

      const responses = await Promise.all(promises);

      const failedResponses = responses.filter(r => !r.ok);
      if (failedResponses.length > 0) {
        throw new Error("Failed to add some students to group");
      }

      setSuccess(`Successfully added ${selectedStudentIds.length} student(s)`);
      setSelectedStudentIds([]);
      setShowAddStudentModal(false);
      setTimeout(() => setSuccess(""), 3000);
      await loadGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add students");
    }
  };

  const handleRemoveStudentFromGroup = async (groupId: string, studentId: string) => {
    if (!confirm("Remove student from group?")) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/professor/groups/${groupId}/students/${studentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove student");
      }

      setSuccess("Student removed from group");
      setTimeout(() => setSuccess(""), 3000);
      await loadGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove student");
    }
  };

  const startEditGroup = (group: Group) => {
    setEditingGroupId(group.id);
    setEditForm({
      name: group.name,
      academic_year: group.academic_year,
      description: group.description || "",
    });
  };

  const filteredGroups = groups
    .filter((g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "year") return a.academic_year.localeCompare(b.academic_year);
      if (sortBy === "created") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return 0;
    });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Groups</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateGroupModal(true)} className="flex gap-2 items-center">
            <Plus size={18} />
            Create Group
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-300 dark:border-red-700 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/10 border border-green-300 dark:border-green-700 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-purple-900/50 rounded-lg bg-white dark:bg-[#130d26] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 dark:border-purple-900/50 rounded-lg bg-white dark:bg-[#130d26] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors"
        >
          <option value="name">Sort by Name</option>
          <option value="year">Sort by Year</option>
          <option value="created">Sort by Date</option>
        </select>
      </div>

      {/* Unassigned Students Info */}
      {unassignedStudents.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-300 dark:border-blue-700 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            📍 {unassignedStudents.length} student(s) not assigned to any group yet
          </p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading groups...</div>
      ) : filteredGroups.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 mb-4">No groups created yet</p>
          <Button onClick={() => setShowCreateGroupModal(true)}>Create your first group</Button>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredGroups.map((group) =>
            editingGroupId === group.id ? (
              // Edit Mode
              <Card key={group.id} className="p-6 border-2 border-blue-400">
                <h3 className="text-lg font-bold mb-4">Edit Group</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Group Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Academic Year</label>
                    <select
                      value={editForm.academic_year}
                      onChange={(e) => setEditForm({ ...editForm, academic_year: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => handleUpdateGroup(group.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Save
                    </Button>
                    <Button onClick={() => setEditingGroupId(null)} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              // View Mode
              <Card key={group.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{group.name}</h3>
                    <p className="text-sm text-gray-500">{group.academic_year}</p>
                    {group.description && <p className="text-sm text-gray-600 mt-1">{group.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => startEditGroup(group)}
                      className="flex gap-1 items-center"
                      variant="outline"
                    >
                      <Edit2 size={16} />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDeleteGroup(group.id)}
                      className="flex gap-1 items-center bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Students in Group */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-3">
                    <p className="font-semibold text-sm">Students ({group.students.length})</p>
                    {unassignedStudents.length > 0 && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedGroupId(group.id);
                          setShowAddStudentModal(true);
                        }}
                        className="flex gap-1 items-center text-xs"
                      >
                        <UserPlus size={14} />
                        Add Student
                      </Button>
                    )}
                  </div>

                  {group.students.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No students in this group</p>
                  ) : (
                    <div className="space-y-2">
                       {group.students.map((student) => (
                        <div
                          key={student.id}
                          className="flex justify-between items-center p-3 bg-gray-50 dark:bg-[#1a132e] border border-transparent dark:border-purple-900/30 rounded-lg hover:border-purple-500/50 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-sm">{student.profile.full_name}</p>
                            <p className="text-xs text-gray-500">{student.email}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              {student.academic.year} • {student.profile.major}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleRemoveStudentFromGroup(group.id, student.id)}
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            )
          )}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 bg-white dark:bg-[#0c0814] border dark:border-[#1a132e] shadow-2xl rounded-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold dark:text-white">Create New Group</h2>
              <button 
                onClick={() => setShowCreateGroupModal(false)}
                className="text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1a132e] rounded-lg p-1 transition-colors"
                >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Group Name *</label>
                <input
                  type="text"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder="e.g., Group A"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#1a132e] rounded-xl bg-gray-50 dark:bg-[#130d26] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#422beb] focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Academic Year</label>
                <select
                  value={groupForm.academic_year}
                  onChange={(e) => setGroupForm({ ...groupForm, academic_year: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#1a132e] rounded-xl bg-gray-50 dark:bg-[#130d26] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#422beb] focus:border-transparent outline-none transition-all"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Description</label>
                <textarea
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                  placeholder="Optional description..."
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#1a132e] rounded-xl bg-gray-50 dark:bg-[#130d26] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#422beb] focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-6">
                <Button onClick={handleCreateGroup} className="flex-1 bg-[#422beb] hover:bg-[#5845ff] text-white py-6 rounded-xl font-medium transition-all duration-200 shadow-[0_0_15px_rgba(66,43,235,0.4)]">
                  Create
                </Button>
                <Button
                  onClick={() => setShowCreateGroupModal(false)}
                  variant="outline"
                  className="flex-1 py-6 rounded-xl border-gray-200 dark:border-[#1a132e] hover:bg-gray-50 dark:hover:bg-[#1a132e] font-medium transition-all"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Student(s) to Group</h2>
              <button onClick={() => {
                setShowAddStudentModal(false);
                setSelectedStudentIds([]);
              }}>
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Students</label>
                <div className="max-h-60 overflow-y-auto space-y-2 border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-slate-800">
                  {unassignedStudents.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center">No unassigned students available.</p>
                  ) : (
                    unassignedStudents.map((student) => (
                      <label 
                        key={student.id} 
                        className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.includes(student.id)}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            const tId = student.id;
                            if (isChecked) {
                              setSelectedStudentIds(prev => prev.includes(tId) ? prev : [...prev, tId]);
                            } else {
                              setSelectedStudentIds(prev => prev.filter(id => id !== tId));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {student.profile.full_name || "Unknown Name"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {student.email} • {student.profile.major || "No Major"}
                          </p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                {selectedStudentIds.length > 0 && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 text-right">
                    {selectedStudentIds.length} student(s) selected
                  </p>
                )}
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleAddStudentToGroup} 
                  className={`flex-1 bg-green-600 hover:bg-green-700 text-white ${
                    selectedStudentIds.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={selectedStudentIds.length === 0}
                >
                  Add Selected ({selectedStudentIds.length})
                </Button>
                <Button
                  onClick={() => {
                    setShowAddStudentModal(false);
                    setSelectedStudentIds([]);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

