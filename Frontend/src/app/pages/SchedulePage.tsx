import { ChevronLeft, ChevronRight, Clock, MapPin, Users } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

interface ClassEvent {
  id: number;
  name: string;
  code: string;
  room: string;
  instructor: string;
  color: string;
  day: number; // 0-4
  startHour: number;
  duration: number; // hours
}

const events: ClassEvent[] = [
  { id: 1, name: "Data Structures", code: "CS 301", room: "ENG 214", instructor: "Dr. Chen", color: "#6366f1", day: 0, startHour: 10, duration: 1.5 },
  { id: 1, name: "Data Structures", code: "CS 301", room: "ENG 214", instructor: "Dr. Chen", color: "#6366f1", day: 2, startHour: 10, duration: 1.5 },
  { id: 2, name: "Machine Learning", code: "CS 415", room: "SCI 108", instructor: "Prof. Wright", color: "#8b5cf6", day: 1, startHour: 14, duration: 1.5 },
  { id: 2, name: "Machine Learning", code: "CS 415", room: "SCI 108", instructor: "Prof. Wright", color: "#8b5cf6", day: 3, startHour: 14, duration: 1.5 },
  { id: 3, name: "Operating Systems", code: "CS 350", room: "COMP 301", instructor: "Dr. Patel", color: "#06b6d4", day: 0, startHour: 9, duration: 1 },
  { id: 3, name: "Operating Systems", code: "CS 350", room: "COMP 301", instructor: "Dr. Patel", color: "#06b6d4", day: 2, startHour: 9, duration: 1 },
  { id: 3, name: "Operating Systems", code: "CS 350", room: "COMP 301", instructor: "Dr. Patel", color: "#06b6d4", day: 4, startHour: 9, duration: 1 },
  { id: 4, name: "Database Mgmt", code: "CS 380", room: "ENG 102", instructor: "Prof. Torres", color: "#10b981", day: 1, startHour: 10, duration: 1.5 },
  { id: 4, name: "Database Mgmt", code: "CS 380", room: "ENG 102", instructor: "Prof. Torres", color: "#10b981", day: 3, startHour: 10, duration: 1.5 },
  { id: 5, name: "Computer Networks", code: "CS 420", room: "NET 205", instructor: "Dr. Zhao", color: "#f59e0b", day: 0, startHour: 13, duration: 1.5 },
  { id: 5, name: "Computer Networks", code: "CS 420", room: "NET 205", instructor: "Dr. Zhao", color: "#f59e0b", day: 2, startHour: 13, duration: 1.5 },
];

const CELL_HEIGHT = 56; // px per hour
const HEADER_OFFSET = 0;

export function SchedulePage() {
  const [week, setWeek] = useState(0);
  const todayDay = 3;
  const { isDark } = useTheme();

  const weekLabel = week === 0 ? "This Week" : week === 1 ? "Next Week" : week === -1 ? "Last Week" : `Week ${week > 0 ? "+" : ""}${week}`;

  const card = "bg-card border-border";
  const textPrimary = isDark ? "text-slate-100" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const gridBorder = isDark ? "border-slate-700" : "border-slate-200";
  const hourLine = isDark ? "border-slate-700/60" : "border-slate-100";
  const todayBg = isDark ? "bg-indigo-900/20" : "bg-indigo-50";
  const btnBg = isDark ? "bg-slate-800 border-slate-700 hover:bg-slate-700" : "bg-white border-slate-200 hover:bg-slate-50";

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={textPrimary} style={{ fontWeight: 700, fontSize: "1.2rem" }}>Weekly Schedule</h2>
          <p className={`${textMuted} text-sm`}>Feb 16 – Feb 20, 2026 · Spring Semester</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeek((w) => w - 1)} className={`w-9 h-9 border rounded-xl flex items-center justify-center transition ${btnBg}`}>
            <ChevronLeft className={`w-4 h-4 ${textPrimary}`} />
          </button>
          <span className={`${textPrimary} text-sm px-3`} style={{ fontWeight: 600 }}>{weekLabel}</span>
          <button onClick={() => setWeek((w) => w + 1)} className={`w-9 h-9 border rounded-xl flex items-center justify-center transition ${btnBg}`}>
            <ChevronRight className={`w-4 h-4 ${textPrimary}`} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${card}`}>
        {/* Day headers */}
        <div className={`grid border-b ${gridBorder}`} style={{ gridTemplateColumns: "60px repeat(5, 1fr)" }}>
          <div className={`p-3 border-r ${gridBorder}`} />
          {DAYS.map((day, i) => (
            <div key={day} className={`p-3 text-center border-r ${gridBorder} last:border-r-0 ${i === todayDay ? todayBg : ""}`}>
              <p className={`text-xs ${i === todayDay ? "text-indigo-500" : textMuted}`} style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{day}</p>
              <p
                className={`text-lg mt-0.5 ${i === todayDay ? "text-white bg-indigo-600 rounded-full w-8 h-8 flex items-center justify-center mx-auto" : textPrimary}`}
                style={{ fontWeight: i === todayDay ? 700 : 600 }}
              >
                {16 + i}
              </p>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="overflow-y-auto" style={{ maxHeight: "560px" }}>
          <div className="relative grid" style={{ gridTemplateColumns: "60px repeat(5, 1fr)" }}>
            {HOURS.map((h) => (
              <div key={h} className={`col-start-1 border-t ${hourLine} flex items-start justify-end pr-3 pt-1`} style={{ height: CELL_HEIGHT, gridColumnStart: 1 }}>
                <span className={`${textMuted}`} style={{ fontSize: "0.7rem", fontWeight: 500 }}>{h}:00</span>
              </div>
            ))}
            {DAYS.map((_, dayIdx) => (
              <div
                key={dayIdx}
                className={`relative border-r ${gridBorder} last:border-r-0 ${dayIdx === todayDay ? (isDark ? "bg-indigo-900/10" : "bg-indigo-50/30") : ""}`}
                style={{ gridColumnStart: dayIdx + 2, gridRowStart: 1, gridRowEnd: HOURS.length + 1, height: CELL_HEIGHT * HOURS.length }}
              >
                {HOURS.map((h) => (
                  <div key={h} className={`border-t ${hourLine}`} style={{ height: CELL_HEIGHT }} />
                ))}
                {events.filter((e) => e.day === dayIdx).map((event, ei) => {
                  const top = (event.startHour - HOURS[0]) * CELL_HEIGHT;
                  const height = event.duration * CELL_HEIGHT - 4;
                  return (
                    <div
                      key={`${event.id}-${ei}`}
                      className="absolute left-1 right-1 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      style={{ top: top + 2, height, background: event.color + "20", borderLeft: `3px solid ${event.color}` }}
                    >
                      <div className="px-2 py-1.5">
                        <p className="text-xs truncate" style={{ fontWeight: 700, color: event.color }}>{event.name}</p>
                        <p className="text-xs truncate" style={{ color: event.color + "99", fontWeight: 500 }}>{event.code}</p>
                        {height > 60 && (
                          <>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="w-2.5 h-2.5" style={{ color: event.color + "aa" }} />
                              <span style={{ fontSize: "0.65rem", color: event.color + "aa" }}>
                                {event.startHour}:00 – {Math.floor(event.startHour + event.duration)}:{(event.startHour + event.duration) % 1 === 0.5 ? "30" : "00"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" style={{ color: event.color + "aa" }} />
                              <span style={{ fontSize: "0.65rem", color: event.color + "aa" }}>{event.room}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's classes */}
      <div className="mt-5">
        <h3 className={`${textPrimary} mb-3`} style={{ fontWeight: 700, fontSize: "0.95rem" }}>Today's Classes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {events.filter((e) => e.day === todayDay).map((event, i) => (
            <div key={i} className={`rounded-xl border shadow-sm p-4 flex items-center gap-3 ${card}`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: event.color + "15" }}>
                <Clock className="w-5 h-5" style={{ color: event.color }} />
              </div>
              <div className="flex-1">
                <p className={`${textPrimary} text-sm`} style={{ fontWeight: 600 }}>{event.name}</p>
                <p className={`${textMuted} text-xs`}>{event.startHour}:00 · {event.room}</p>
              </div>
              <div className="text-xs px-2 py-1 rounded-lg" style={{ background: event.color + "15", color: event.color, fontWeight: 700 }}>
                {event.code}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
