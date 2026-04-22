import { useState } from "react";
import { Sparkles, Brain, TrendingUp, BookOpen, Send, RotateCcw } from "lucide-react";
import { CodeReviewPanel } from "../components/CodeReviewPanel";
import { useTheme } from "../context/ThemeContext";

// ── Grade Predictor ─────────────────────────────────────────────────────────

interface GradeEntry {
  id: number;
  name: string;
  weight: number;
  score: string;
}

function GradePredictorTool() {
  const { isDark } = useTheme();
  const [entries, setEntries] = useState<GradeEntry[]>([
    { id: 1, name: "Midterm Exam", weight: 30, score: "85" },
    { id: 2, name: "Assignments (Avg)", weight: 25, score: "92" },
    { id: 3, name: "Lab Reports", weight: 20, score: "78" },
    { id: 4, name: "Quizzes", weight: 10, score: "88" },
    { id: 5, name: "Final Exam", weight: 15, score: "" },
  ]);
  const [targetGrade, setTargetGrade] = useState("90");
  const [predicted, setPredicted] = useState(false);

  const totalWeight = entries.reduce((s, e) => s + e.weight, 0);
  const completedWeight = entries.filter((e) => e.score !== "").reduce((s, e) => s + e.weight, 0);
  const currentWeighted = entries
    .filter((e) => e.score !== "")
    .reduce((s, e) => s + (parseFloat(e.score) || 0) * (e.weight / 100), 0);

  const remainingWeight = entries.filter((e) => e.score === "").reduce((s, e) => s + e.weight, 0);
  const target = parseFloat(targetGrade) || 90;
  const neededOnRemaining =
    remainingWeight > 0
      ? ((target - currentWeighted) / (remainingWeight / 100)).toFixed(1)
      : null;

  const projectedIfAvg =
    remainingWeight > 0
      ? (currentWeighted + 80 * (remainingWeight / 100)).toFixed(1)
      : currentWeighted.toFixed(1);

  const letterGrade = (g: number) => {
    if (g >= 93) return { l: "A", c: "#422beb" };
    if (g >= 90) return { l: "A-", c: "#422beb" };
    if (g >= 87) return { l: "B+", c: "#5845ff" };
    if (g >= 83) return { l: "B", c: "#5845ff" };
    if (g >= 80) return { l: "B-", c: "#5845ff" };
    if (g >= 77) return { l: "C+", c: "#7d70ff" };
    if (g >= 73) return { l: "C", c: "#7d70ff" };
    return { l: "D", c: "#c9c5ff" };
  };

  const updateEntry = (id: number, field: keyof GradeEntry, value: string | number) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const card = "bg-card border-border";
  const inputCls = isDark
    ? "bg-slate-700 border-slate-600 text-slate-200 focus:border-indigo-400"
    : "bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-400";
  const textPrimary = isDark ? "text-slate-100" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const rowHover = isDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50";
  const divider = isDark ? "divide-slate-700" : "divide-slate-100";

  const lg = letterGrade(parseFloat(projectedIfAvg));
  const current = letterGrade(currentWeighted / (completedWeight / 100) || 0);

  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden ${card}`}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-inherit">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`${textPrimary}`} style={{ fontSize: "0.95rem", fontWeight: 700 }}>
              Grade Predictor
            </h3>
            <p className={`${textMuted} text-xs`}>Calculate your final grade and what you need</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-center">
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: lg.c, lineHeight: 1 }}>
              {projectedIfAvg}%
            </div>
            <div className={`text-xs ${textMuted}`}>Projected</div>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Component table */}
        <div className={`rounded-xl border overflow-hidden mb-4 ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <div
            className={`grid gap-2 px-4 py-2.5 text-xs ${isDark ? "bg-slate-700/50" : "bg-slate-50"}`}
            style={{ gridTemplateColumns: "1fr 80px 80px" }}
          >
            <span className={textMuted} style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Component
            </span>
            <span className={`${textMuted} text-center`} style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Weight %
            </span>
            <span className={`${textMuted} text-center`} style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Score %
            </span>
          </div>
          <div className={`divide-y ${divider}`}>
            {entries.map((e) => (
              <div
                key={e.id}
                className={`grid gap-2 px-4 py-2.5 items-center ${rowHover} transition`}
                style={{ gridTemplateColumns: "1fr 80px 80px" }}
              >
                <input
                  value={e.name}
                  onChange={(ev) => updateEntry(e.id, "name", ev.target.value)}
                  className={`text-sm bg-transparent border-none outline-none ${textPrimary}`}
                  style={{ fontWeight: 500 }}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={e.weight}
                  onChange={(ev) => updateEntry(e.id, "weight", parseInt(ev.target.value) || 0)}
                  className={`text-sm text-center border rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-100 transition ${inputCls}`}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={e.score}
                  onChange={(ev) => updateEntry(e.id, "score", ev.target.value)}
                  placeholder="—"
                  className={`text-sm text-center border rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-100 transition ${inputCls} ${!e.score ? "border-dashed" : ""}`}
                />
              </div>
            ))}
          </div>
          <div
            className={`flex items-center justify-between px-4 py-2 text-xs ${isDark ? "bg-slate-700/30" : "bg-slate-50"} border-t ${isDark ? "border-slate-700" : "border-slate-200"}`}
          >
            <span className={textMuted}>Total Weight</span>
            <span className={totalWeight === 100 ? "text-emerald-500" : "text-amber-500"} style={{ fontWeight: 700 }}>
              {totalWeight}% {totalWeight !== 100 && "(should be 100%)"}
            </span>
          </div>
        </div>

        {/* Target & result */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border ${isDark ? "bg-indigo-900/20 border-indigo-800" : "bg-indigo-50 border-indigo-200"}`}>
            <p className="text-indigo-500 text-xs mb-2" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Target Grade
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
                className={`w-24 text-center border rounded-xl px-3 py-2 outline-none text-sm ${inputCls}`}
                style={{ fontWeight: 700 }}
              />
              <div>
                <p className={`${isDark ? "text-slate-300" : "text-slate-700"} text-xs`} style={{ fontWeight: 600 }}>
                  {neededOnRemaining
                    ? `Need ${neededOnRemaining}% on remaining (${remainingWeight}% weight)`
                    : "All components completed"}
                </p>
                {neededOnRemaining && parseFloat(neededOnRemaining) > 100 && (
                  <p className="text-red-500 text-xs mt-0.5">Target may not be achievable</p>
                )}
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-700/40 border-slate-600" : "bg-slate-50 border-slate-200"}`}>
            <p className={`${textMuted} text-xs mb-2`} style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Current Standing
            </p>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: current.c + "20" }}
              >
                <span style={{ fontWeight: 800, fontSize: "1.1rem", color: current.c }}>
                  {current.l}
                </span>
              </div>
              <div>
                <p className={`${textPrimary} text-sm`} style={{ fontWeight: 700 }}>
                  {completedWeight > 0
                    ? `${((currentWeighted / (completedWeight / 100)) || 0).toFixed(1)}% avg`
                    : "No data yet"}
                </p>
                <p className={`${textMuted} text-xs`}>{completedWeight}% of course graded</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Study Planner Tool ───────────────────────────────────────────────────────

function StudyPlannerTool() {
  const { isDark } = useTheme();
  const [topic, setTopic] = useState("");
  const [hours, setHours] = useState("10");
  const [deadline, setDeadline] = useState("2026-02-26");
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

  const card = "bg-card border-border";
  const inputCls = isDark
    ? "bg-slate-700 border-slate-600 text-slate-200 focus:border-indigo-400"
    : "bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-400";
  const textPrimary = isDark ? "text-slate-100" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";

  const planData: any[] = [];

  const handleGenerate = () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 1800);
  };

  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden ${card}`}>
      <div className="flex items-center gap-3 px-5 py-4 border-b border-inherit">
        <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-pink-600 rounded-xl flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className={textPrimary} style={{ fontSize: "0.95rem", fontWeight: 700 }}>
            AI Study Planner
          </h3>
          <p className={`${textMuted} text-xs`}>Generate a personalized study schedule</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {!generated ? (
          <>
            <div>
              <label className={`${textMuted} text-xs mb-1.5 block`} style={{ fontWeight: 600 }}>
                Topic / Exam to Prepare For
              </label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Data Structures Final Exam"
                className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition ${inputCls}`}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`${textMuted} text-xs mb-1.5 block`} style={{ fontWeight: 600 }}>
                  Total Study Hours
                </label>
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition ${inputCls}`}
                />
              </div>
              <div>
                <label className={`${textMuted} text-xs mb-1.5 block`} style={{ fontWeight: 600 }}>
                  Deadline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition ${inputCls}`}
                />
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating || !topic.trim()}
              className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm transition ${
                generating || !topic.trim()
                  ? isDark ? "bg-slate-700 text-slate-500 cursor-not-allowed" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200/30"
              }`}
              style={{ fontWeight: 600 }}
            >
              {generating ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Generating Plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate Study Plan
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <div className={`flex items-center justify-between p-3 rounded-xl mb-4 ${isDark ? "bg-violet-900/20 border border-violet-800" : "bg-violet-50 border border-violet-200"}`}>
              <div>
                <p className="text-violet-600 text-sm" style={{ fontWeight: 700 }}>
                  {topic}
                </p>
                <p className={`${textMuted} text-xs`}>{hours}h total · due {deadline}</p>
              </div>
              <button
                onClick={() => { setGenerated(false); setTopic(""); }}
                className={`flex items-center gap-1 text-xs ${textMuted} hover:text-violet-600 transition`}
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
            <div className="space-y-3">
              {planData.map((day, i) => (
                <div key={i} className={`rounded-xl border p-3.5 ${isDark ? "bg-slate-700/40 border-slate-600" : "bg-slate-50 border-slate-200"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-sm ${textPrimary}`} style={{ fontWeight: 700 }}>
                      {day.day}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? "bg-violet-900/40 text-violet-400" : "bg-violet-100 text-violet-700"}`} style={{ fontWeight: 600 }}>
                      {day.hours}h
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {day.tasks.map((task, ti) => (
                      <li key={ti} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                        <span className={`text-xs ${textMuted}`}>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Assignment Assistant ─────────────────────────────────────────────────────

function AssignmentAssistant() {
  const { isDark } = useTheme();
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    {
      role: "ai",
      text: "Hi! I'm your AI Assignment Assistant. Describe your assignment or paste a question, and I'll help you understand it and suggest an approach.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const mockResponses: Record<string, string> = {
    default: "Great question! Here's how I'd approach this:\n\n1. **Break it down** — Identify the core requirements first.\n2. **Research** — Look for relevant lecture notes or textbook sections.\n3. **Draft a plan** — Outline your solution before coding or writing.\n4. **Iterate** — Start with a simple working solution, then refine.\n\nWould you like me to help with a specific part?",
    algo: "For algorithm problems, I recommend:\n\n1. **Understand the input/output** — What goes in, what comes out?\n2. **Think about edge cases** — Empty input, duplicates, very large n.\n3. **Start brute force** — An O(n²) solution is better than no solution.\n4. **Optimize** — Use hash maps, sorting, or two pointers to improve complexity.\n\nWhat's the problem statement?",
    design: "For system design:\n\n1. **Clarify requirements** — Scale, latency, consistency needs.\n2. **Estimate scale** — Users, QPS, storage.\n3. **High-level design** — Draw components and data flow.\n4. **Deep dive** — Focus on one complex component.\n\nWhat system are you designing?",
  };

  const handleSend = () => {
    if (!prompt.trim() || loading) return;
    const userMsg = prompt.trim();
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setPrompt("");
    setLoading(true);
    setTimeout(() => {
      const lower = userMsg.toLowerCase();
      const reply =
        lower.includes("algo") || lower.includes("sort") || lower.includes("search")
          ? mockResponses.algo
          : lower.includes("design") || lower.includes("system")
          ? mockResponses.design
          : mockResponses.default;
      setMessages((m) => [...m, { role: "ai", text: reply }]);
      setLoading(false);
    }, 1400);
  };

  const card = "bg-card border-border";
  const textPrimary = isDark ? "text-slate-100" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const inputCls = isDark
    ? "bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-500 focus:border-indigo-400"
    : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-400";

  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden flex flex-col ${card}`} style={{ height: "420px" }}>
      <div className="flex items-center gap-3 px-5 py-4 border-b border-inherit flex-shrink-0">
        <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className={textPrimary} style={{ fontSize: "0.95rem", fontWeight: 700 }}>
            Assignment Assistant
          </h3>
          <p className={`${textMuted} text-xs`}>Ask questions, get guidance on your assignments</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "ai" && (
              <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : isDark
                  ? "bg-slate-700 text-slate-200 rounded-bl-sm"
                  : "bg-slate-100 text-slate-700 rounded-bl-sm"
              }`}
              style={{ fontWeight: msg.role === "ai" ? 400 : 500 }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <div className={`px-3.5 py-2.5 rounded-2xl rounded-bl-sm flex gap-1 ${isDark ? "bg-slate-700" : "bg-slate-100"}`}>
              {[0, 1, 2].map((j) => (
                <div key={j} className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: `${j * 150}ms` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className={`flex gap-2 p-3 border-t ${isDark ? "border-slate-700" : "border-slate-200"} flex-shrink-0`}>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Describe your assignment or ask a question..."
          className={`flex-1 border rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-amber-200 transition ${inputCls}`}
        />
        <button
          onClick={handleSend}
          disabled={!prompt.trim() || loading}
          className={`px-3 py-2 rounded-xl transition ${prompt.trim() && !loading ? "bg-amber-500 hover:bg-amber-600 text-white" : isDark ? "bg-slate-700 text-slate-500" : "bg-slate-100 text-slate-400"}`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

type ToolTab = "code-review" | "grade-predictor" | "study-planner" | "assistant";

const tabs: { id: ToolTab; label: string; icon: string }[] = [
  { id: "code-review", label: "Code Review", icon: "✨" },
  { id: "grade-predictor", label: "Grade Predictor", icon: "📊" },
  { id: "study-planner", label: "Study Planner", icon: "📅" },
  { id: "assistant", label: "Assignment Assistant", icon: "🧠" },
];

export function AIToolsPage() {
  const [activeTab, setActiveTab] = useState<ToolTab>("code-review");
  const { isDark } = useTheme();

  const tabBg = isDark ? "bg-card" : "bg-white";
  const activeTabCls = isDark
    ? "bg-slate-700 text-indigo-400 shadow-sm"
    : "bg-white text-indigo-700 shadow-sm";
  const inactiveTabCls = isDark
    ? "text-slate-500 hover:text-slate-300"
    : "text-slate-500 hover:text-slate-700";
  const tabWrapperBg = isDark ? "bg-slate-700/50" : "bg-slate-100";

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      {/* Header */}
      <div className={`rounded-2xl border shadow-sm p-5 flex items-center gap-4 bg-card border-border`}>
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2
            className={`${isDark ? "text-slate-100" : "text-slate-900"}`}
            style={{ fontWeight: 700, fontSize: "1.1rem" }}
          >
            AI Learning Tools
          </h2>
          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Powered by AI — Code Review, Grade Prediction, Study Planning & Assignment Help
          </p>
        </div>
        <div className="flex gap-2">
          {[
            { label: "Code Review", color: "#422beb" },
            { label: "Grade AI", color: "#5845ff" },
            { label: "Study Planner", color: "#7d70ff" },
          ].map((t) => (
            <span
              key={t.label}
              className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: t.color + "15", color: t.color, fontWeight: 600 }}
            >
              {t.label}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 p-1 rounded-xl w-fit ${tabWrapperBg}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
              activeTab === tab.id ? activeTabCls : inactiveTabCls
            }`}
            style={{ fontWeight: activeTab === tab.id ? 600 : 500 }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "code-review" && <CodeReviewPanel />}
      {activeTab === "grade-predictor" && <GradePredictorTool />}
      {activeTab === "study-planner" && <StudyPlannerTool />}
      {activeTab === "assistant" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <AssignmentAssistant />
          <div className={`rounded-2xl border shadow-sm p-5 bg-card border-border`}>
            <h3
              className={`${isDark ? "text-slate-100" : "text-slate-900"} mb-4`}
              style={{ fontWeight: 700, fontSize: "0.95rem" }}
            >
              Quick Assignment Tips
            </h3>
            <div className="space-y-3">
              {[
                { emoji: "📝", tip: "Start early — even 30 min the first day reduces last-minute stress." },
                { emoji: "🎯", tip: "Re-read the rubric before submitting to catch missed requirements." },
                { emoji: "🔍", tip: "Use office hours — professors love questions, and it shows initiative." },
                { emoji: "🤝", tip: "Form study groups for tricky topics, but write your own code/text." },
                { emoji: "💡", tip: "Explain the concept aloud (Feynman technique) to check understanding." },
                { emoji: "⏱️", tip: "Time-box tricky problems — spend max 25 min before seeking help." },
              ].map((item, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${isDark ? "bg-slate-700/40" : "bg-slate-50"}`}>
                  <span className="text-lg flex-shrink-0">{item.emoji}</span>
                  <p className={`text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`} style={{ fontWeight: 400 }}>
                    {item.tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

