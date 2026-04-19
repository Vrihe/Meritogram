import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { professorService } from "../services/professor.service";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { AlertCircle, Edit2, Mail, BookOpen } from "lucide-react";
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

interface EditingStudent extends Student {
  editing: true;
}

export function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Only professors can access this
  if (user?.role !== "professor") {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const response = await professorService.getStudents();
      setStudents(response.students || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (student: Student) => {
    setEditingId(student.id);
    setEditForm({
      ...student,
      year: student.academic.year,
    });
  };

  const handleSave = async (studentId: string) => {
    try {
      setError("");
      setSuccess("");

      const updateData = {
        profile: {
          full_name: editForm.profile?.full_name || editForm.full_name,
          student_id: editForm.profile?.student_id || editForm.student_id,
          major: editForm.profile?.major || editForm.major,
        },
        academic: {
          year: editForm.year,
          gpa_target: editForm.academic?.gpa_target || editForm.gpa_target,
        },
      };

      await professorService.updateStudent(studentId, updateData);

      // Update local state
      setStudents(
        students.map((s) =>
          s.id === studentId
            ? {
                ...s,
                profile: updateData.profile,
                academic: updateData.academic,
              }
            : s
        )
      );

      setSuccess("Student profile updated successfully");
      setEditingId(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update student");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Students</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-300 dark:border-red-700 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/10 border border-green-300 dark:border-green-700 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-800 dark:text-green-200">{success}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading students...</div>
      ) : students.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No students found</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {students.map((student) =>
            editingId === student.id ? (
              // Edit Mode
              <Card key={student.id} className="p-6 border-2 border-blue-400">
                <h3 className="text-lg font-bold mb-4">Edit Student</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editForm.profile?.full_name || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          profile: { ...editForm.profile, full_name: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Student ID</label>
                      <input
                        type="text"
                        value={editForm.profile?.student_id || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            profile: { ...editForm.profile, student_id: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Major</label>
                      <input
                        type="text"
                        value={editForm.profile?.major || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            profile: { ...editForm.profile, major: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Year</label>
                      <select
                        value={editForm.year || ""}
                        onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">GPA Target</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="4"
                        value={editForm.academic?.gpa_target || 4.0}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            academic: {
                              ...editForm.academic,
                              gpa_target: parseFloat(e.target.value),
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => handleSave(student.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              // View Mode
              <Card key={student.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{student.profile.full_name}</h3>
                    <p className="text-sm text-gray-500">{student.academic.year}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleEditClick(student)}
                    className="flex gap-2 items-center"
                  >
                    <Edit2 size={16} />
                    Edit
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail size={16} className="text-gray-400" />
                      <p className="text-sm truncate">{student.email}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Student ID</p>
                    <p className="text-sm font-semibold mt-1">{student.profile.student_id || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Major</p>
                    <p className="text-sm font-semibold mt-1">{student.profile.major || "Undeclared"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">GPA Target</p>
                    <div className="flex items-center gap-2 mt-1">
                      <BookOpen size={16} className="text-gray-400" />
                      <p className="text-sm font-semibold">{student.academic.gpa_target.toFixed(1)}</p>
                    </div>
                  </div>
                </div>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}
