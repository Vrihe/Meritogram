import { useState } from "react";
import { Sparkles, Send, Lightbulb, AlertTriangle, Zap, CheckCircle, RotateCcw, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface FeedbackCard {
  id: number;
  line: number;
  type: "error" | "warning" | "suggestion" | "good";
  title: string;
  description: string;
  howToFix: string;
}

const sampleCode = `def find_duplicates(arr):
    duplicates = []
    for i in range(len(arr)):
        for j in range(i+1, len(arr)):
            if arr[i] == arr[j]:
                if arr[i] not in duplicates:
                    duplicates.append(arr[i])
    return duplicates

# Test
nums = [1,2,3,2,4,3,5]
result = find_duplicates(nums)
print(result)`;

const mockFeedback: FeedbackCard[] = [
  {
    id: 1,
    line: 3,
    type: "error",
    title: "O(n²) Time Complexity",
    description: "Nested loop creates quadratic time complexity. For large arrays this will be very slow.",
    howToFix: "Use a hash set/dict to track seen elements. Iterate once: O(n) time, O(n) space.",
  },
  {
    id: 2,
    line: 5,
    type: "warning",
    title: "Redundant Membership Check",
    description: "Checking `if arr[i] not in duplicates` inside a loop adds another O(n) scan on top of the nested loop.",
    howToFix: "Replace `duplicates` list with a `set` so membership checks become O(1).",
  },
  {
    id: 3,
    line: 1,
    type: "suggestion",
    title: "Missing Type Hints",
    description: "Python 3.5+ supports type annotations. Adding them improves readability and enables static analysis.",
    howToFix: "Update signature to: `def find_duplicates(arr: list[int]) -> list[int]:`",
  },
  {
    id: 4,
    line: 2,
    type: "suggestion",
    title: "Variable Naming Convention",
    description: "`duplicates` is fine, but you could use a more descriptive name for clarity.",
    howToFix: "Consider renaming to `seen_duplicates` or `result` to clarify intent at first glance.",
  },
  {
    id: 5,
    line: 10,
    type: "good",
    title: "Good: Test Block Present",
    description: "Including a test block is a great habit for verifying function behavior.",
    howToFix: "Consider wrapping in `if __name__ == '__main__':` for module safety.",
  },
];

const typeConfig = {
  error: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-700", label: "Error" },
  warning: { icon: Zap, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700", label: "Warning" },
  suggestion: { icon: Lightbulb, color: "text-indigo-500", bg: "bg-indigo-50", border: "border-indigo-200", badge: "bg-indigo-100 text-indigo-700", label: "Suggestion" },
  good: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700", label: "Good" },
};

export function CodeReviewPanel() {
  const [code, setCode] = useState(sampleCode);
  const [feedback, setFeedback] = useState<FeedbackCard[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set([1, 2]));
  const [highlightLine, setHighlightLine] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const { isDark } = useTheme();

  const sidebarBg = isDark ? "bg-slate-900" : "bg-slate-50";
  const cardBorder = isDark ? "border-slate-700" : "border-slate-200";
  const headerBg = isDark ? "bg-slate-800" : "bg-white";
  const textPrimary = isDark ? "text-slate-100" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const sidebarDivider = isDark ? "divide-slate-700" : "divide-slate-100";
  const sidebarSectionBg = isDark ? "bg-slate-800/60" : "bg-slate-50";

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setFeedback([]);
    setTimeout(() => {
      setFeedback(mockFeedback);
      setIsAnalyzing(false);
      setAnalyzed(true);
    }, 2200);
  };

  const toggleCard = (id: number) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeLines = code.split("\n");

  const lineHasFeedback = (lineNum: number) =>
    feedback.find((f) => f.line === lineNum);

  const getLineColor = (lineNum: number) => {
    const f = lineHasFeedback(lineNum);
    if (!f) return "";
    return f.type === "error"
      ? "bg-red-500/10 border-l-2 border-red-400"
      : f.type === "warning"
      ? "bg-amber-500/10 border-l-2 border-amber-400"
      : f.type === "suggestion"
      ? "bg-indigo-500/10 border-l-2 border-indigo-400"
      : "bg-emerald-500/10 border-l-2 border-emerald-400";
  };

  const errorCount = feedback.filter((f) => f.type === "error").length;
  const warningCount = feedback.filter((f) => f.type === "warning").length;
  const suggCount = feedback.filter((f) => f.type === "suggestion").length;
  const goodCount = feedback.filter((f) => f.type === "good").length;

  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? "border-slate-700" : "border-slate-200"}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-4 border-b ${cardBorder} ${headerBg}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={textPrimary} style={{ fontSize: "0.95rem", fontWeight: 700 }}>
              AI Code Review Assistant
            </h3>
            <p className={`${textMuted} text-xs`}>Paste your code and get instant AI feedback</p>
          </div>
        </div>
        {analyzed && (
          <div className="flex items-center gap-2">
            {errorCount > 0 && (
              <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs" style={{ fontWeight: 600 }}>
                {errorCount} Error{errorCount > 1 ? "s" : ""}
              </span>
            )}
            {warningCount > 0 && (
              <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs" style={{ fontWeight: 600 }}>
                {warningCount} Warning{warningCount > 1 ? "s" : ""}
              </span>
            )}
            {suggCount > 0 && (
              <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs" style={{ fontWeight: 600 }}>
                {suggCount} Tip{suggCount > 1 ? "s" : ""}
              </span>
            )}
            {goodCount > 0 && (
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs" style={{ fontWeight: 600 }}>
                {goodCount} Good
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-0 min-h-[420px]">
        {/* Code editor */}
        <div className={`flex-1 border-r ${cardBorder} flex flex-col`}>
          {/* Editor toolbar */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-red-400 rounded-full" />
              <div className="w-3 h-3 bg-amber-400 rounded-full" />
              <div className="w-3 h-3 bg-emerald-400 rounded-full" />
              <span className="text-slate-400 text-xs ml-2">solution.py</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-200 text-xs transition"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={() => { setCode(sampleCode); setFeedback([]); setAnalyzed(false); }}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-200 text-xs transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>

          {/* Code area with line numbers */}
          <div className="flex-1 bg-slate-900 overflow-auto">
            {analyzed ? (
              <div className="font-mono text-sm py-3">
                {codeLines.map((line, idx) => {
                  const lineNum = idx + 1;
                  const fb = lineHasFeedback(lineNum);
                  return (
                    <div
                      key={idx}
                      className={`flex group cursor-pointer transition-colors ${
                        highlightLine === lineNum ? "bg-indigo-900/40" : ""
                      } ${fb ? getLineColor(lineNum) : "hover:bg-slate-800/50"}`}
                      onMouseEnter={() => fb && setHighlightLine(lineNum)}
                      onMouseLeave={() => setHighlightLine(null)}
                    >
                      <span className="w-10 text-right pr-4 py-0.5 text-slate-600 select-none flex-shrink-0" style={{ fontSize: "0.75rem" }}>
                        {lineNum}
                      </span>
                      <span className="flex-1 py-0.5 pr-4 text-slate-200 whitespace-pre" style={{ fontSize: "0.8rem" }}>
                        {line || " "}
                      </span>
                      {fb && (
                        <span
                          className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center my-0.5 mr-2 ${typeConfig[fb.type].badge}`}
                          style={{ fontSize: "0.6rem", fontWeight: 700 }}
                        >
                          {fb.type === "good" ? "✓" : "!"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full min-h-[360px] bg-transparent text-slate-200 font-mono text-sm p-4 resize-none outline-none"
                style={{ fontSize: "0.8rem", lineHeight: "1.6" }}
                placeholder="Paste your code here..."
                spellCheck={false}
              />
            )}
          </div>

          {/* Analyze button */}
          <div className="px-4 py-3 bg-slate-900 border-t border-slate-700 flex items-center gap-3">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !code.trim()}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm transition ${
                isAnalyzing
                  ? "bg-indigo-700 text-indigo-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/50"
              }`}
              style={{ fontWeight: 600 }}
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {analyzed ? "Re-analyze" : "Analyze Code"}
                </>
              )}
            </button>
            {analyzed && (
              <button
                onClick={() => { setFeedback([]); setAnalyzed(false); }}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-200 text-xs transition"
              >
                <Send className="w-3.5 h-3.5" /> Edit Code
              </button>
            )}
            <span className="ml-auto text-slate-500 text-xs">
              {codeLines.length} lines · Python 3
            </span>
          </div>
        </div>

        {/* Feedback sidebar */}
        <div className={`w-80 flex flex-col ${sidebarBg}`}>
          <div className={`px-4 py-3 border-b ${cardBorder}`}>
            <p className={`${textMuted} text-xs`} style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              AI Feedback
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {!analyzed && !isAnalyzing && (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${isDark ? "bg-indigo-900/30" : "bg-indigo-100"}`}>
                  <Sparkles className="w-7 h-7 text-indigo-500" />
                </div>
                <p className={`${textPrimary} text-sm`} style={{ fontWeight: 600 }}>
                  Ready to Review
                </p>
                <p className={`${textMuted} text-xs mt-1 max-w-[200px]`}>
                  Paste your code and click "Analyze Code" to get AI feedback
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 animate-pulse ${isDark ? "bg-indigo-900/30" : "bg-indigo-100"}`}>
                  <Sparkles className="w-7 h-7 text-indigo-500" />
                </div>
                <p className={`${textPrimary} text-sm`} style={{ fontWeight: 600 }}>
                  Analyzing your code...
                </p>
                <p className={`${textMuted} text-xs mt-1`}>Scanning for issues and improvements</p>
                <div className="flex gap-1 mt-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            )}

            {analyzed &&
              feedback.map((card) => {
                const cfg = typeConfig[card.type];
                const Icon = cfg.icon;
                const isExpanded = expandedCards.has(card.id);
                return (
                  <div key={card.id} className={`rounded-xl border ${cfg.border} ${cfg.bg} overflow-hidden transition-all`}>
                    <button onClick={() => toggleCard(card.id)} className="w-full flex items-start gap-2.5 px-3 py-3 text-left">
                      <Icon className={`w-4 h-4 ${cfg.color} mt-0.5 flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-xs px-1.5 py-0.5 rounded-md ${cfg.badge}`} style={{ fontWeight: 700 }}>{cfg.label}</span>
                          <span className="text-slate-400 text-xs">Line {card.line}</span>
                        </div>
                        <p className="text-slate-800 text-xs mt-1" style={{ fontWeight: 600 }}>{card.title}</p>
                      </div>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />}
                    </button>
                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-2.5">
                        <p className="text-slate-600 text-xs leading-relaxed">{card.description}</p>
                        <div className="bg-white/70 rounded-lg p-2.5 border border-white/50">
                          <p className="text-xs mb-1" style={{ fontWeight: 700, color: "#4f46e5" }}>💡 How to fix</p>
                          <p className="text-slate-700 text-xs leading-relaxed">{card.howToFix}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}