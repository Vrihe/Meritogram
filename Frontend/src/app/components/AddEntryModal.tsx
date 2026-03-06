import { useState } from "react";
import { X, Calendar, Clock, Award, BookOpen } from "lucide-react";

interface AddEntryModalProps {
  courseName: string;
  onClose: () => void;
  onSave: (entry: { date: string; time: string; grade: number; notes: string }) => void;
}

export function AddEntryModal({ courseName, onClose, onSave }: AddEntryModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("09:00");
  const [grade, setGrade] = useState("85");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"present" | "late" | "absent">("present");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ date, time, grade: parseInt(grade) || 0, notes });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white text-xs opacity-80">Log Session</p>
              <p className="text-white text-sm" style={{ fontWeight: 600 }}>
                {courseName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 text-xs mb-1.5 flex items-center gap-1.5" style={{ fontWeight: 600 }}>
                <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>
            <div>
              <label className="text-slate-700 text-xs mb-1.5 flex items-center gap-1.5" style={{ fontWeight: 600 }}>
                <Clock className="w-3.5 h-3.5 text-indigo-500" /> Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>
          </div>

          {/* Attendance Status */}
          <div>
            <label className="text-slate-700 text-xs mb-2 block" style={{ fontWeight: 600 }}>
              Attendance Status
            </label>
            <div className="flex gap-2">
              {(["present", "late", "absent"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-2 rounded-xl text-xs capitalize transition ${
                    status === s
                      ? s === "present"
                        ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-300"
                        : s === "late"
                        ? "bg-amber-100 text-amber-700 border-2 border-amber-300"
                        : "bg-red-100 text-red-700 border-2 border-red-300"
                      : "bg-slate-100 text-slate-500 border-2 border-transparent hover:bg-slate-200"
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Grade */}
          <div>
            <label className="text-slate-700 text-xs mb-1.5 flex items-center gap-1.5" style={{ fontWeight: 600 }}>
              <Award className="w-3.5 h-3.5 text-indigo-500" /> Grade (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition pr-12"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span
                  className="text-xs px-2 py-1 rounded-lg"
                  style={{
                    fontWeight: 700,
                    background:
                      parseInt(grade) >= 90
                        ? "#dcfce7"
                        : parseInt(grade) >= 75
                        ? "#dbeafe"
                        : "#fef9c3",
                    color:
                      parseInt(grade) >= 90
                        ? "#16a34a"
                        : parseInt(grade) >= 75
                        ? "#1d4ed8"
                        : "#ca8a04",
                  }}
                >
                  {parseInt(grade) >= 90 ? "A" : parseInt(grade) >= 80 ? "B" : parseInt(grade) >= 70 ? "C" : "D"}
                </span>
              </div>
            </div>
            {/* Grade slider */}
            <input
              type="range"
              min="0"
              max="100"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full mt-2 accent-indigo-600"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-slate-700 text-xs mb-1.5 block" style={{ fontWeight: 600 }}>
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Add session notes..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm transition"
              style={{ fontWeight: 500 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm transition shadow-lg shadow-indigo-200"
              style={{ fontWeight: 600 }}
            >
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
