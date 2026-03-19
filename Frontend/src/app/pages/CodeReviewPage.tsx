import { useState } from "react";
import { Code, Play, CheckCircle, AlertTriangle, Info, Loader2 } from "lucide-react";

const SAMPLE_CODE = `function calculateGPA(grades) {
  let sum = 0;
  for (let i = 0; i < grades.length; i++) {
    sum += grades[i];
  }
  return sum / grades.length;
}

// Example usage
const myGrades = [85, 92, 78, 95];
console.log(calculateGPA(myGrades));`;

interface Feedback {
  type: "error" | "warning" | "info" | "success";
  line: number;
  message: string;
  suggestion?: string;
}

export function CodeReviewPage() {
  const [code, setCode] = useState(SAMPLE_CODE);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<Feedback[]>([]);

  const analyzeCode = () => {
    setIsAnalyzing(true);

    setTimeout(() => {
      const mockFeedback: Feedback[] = [
        {
          type: "warning",
          line: 1,
          message: "Missing parameter validation",
          suggestion: "Add null/undefined check for the 'grades' parameter"
        },
        {
          type: "info",
          line: 2,
          message: "Consider using reduce() for cleaner code",
          suggestion: "return grades.reduce((acc, grade) => acc + grade, 0) / grades.length;"
        },
        {
          type: "error",
          line: 5,
          message: "Division by zero risk",
          suggestion: "Check if grades.length is 0 before dividing"
        },
        {
          type: "success",
          line: 9,
          message: "Good: Clear variable naming",
          suggestion: ""
        }
      ];

      setFeedback(mockFeedback);
      setIsAnalyzing(false);
    }, 2000);
  };

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getFeedbackBg = (type: string) => {
    switch (type) {
      case "error":
        return "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800";
      case "warning":
        return "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800";
      case "info":
        return "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800";
      case "success":
        return "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800";
      default:
        return "bg-card";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-slate-900 dark:text-white mb-2">AI Code Review Assistant</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Paste your code below and get instant AI-powered feedback on code quality, bugs, and best practices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Editor Panel */}
        <div className="bg-card border border-border">
          <div className="border-b border-border px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Code Editor
              </span>
            </div>
            <button
              onClick={analyzeCode}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Analyzing...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span className="text-sm">Analyze Code</span>
                </>
              )}
            </button>
          </div>
          <div className="p-0">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-[500px] p-4 bg-slate-900 text-slate-100 font-mono text-sm border-none outline-none resize-none"
              spellCheck={false}
              placeholder="Paste your code here..."
            />
          </div>
        </div>

        {/* Feedback Panel */}
        <div className="bg-card border border-border">
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-indigo-500" />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                AI Feedback
              </span>
            </div>
          </div>
          <div className="p-4 h-[500px] overflow-y-auto space-y-3">
            {feedback.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-slate-400 dark:text-slate-500">
                  <Code className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No feedback yet</p>
                  <p className="text-xs mt-1">Click "Analyze Code" to get AI-powered insights</p>
                </div>
              </div>
            ) : (
              feedback.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 border ${getFeedbackBg(item.type)}`}
                >
                  <div className="flex items-start gap-2 mb-1">
                    {getFeedbackIcon(item.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Line {item.line}
                        </span>
                        <span
                          className={`text-xs px-1.5 py-0.5 ${
                            item.type === "error"
                              ? "bg-red-200 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                              : item.type === "warning"
                              ? "bg-amber-200 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                              : item.type === "success"
                              ? "bg-green-200 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                              : "bg-blue-200 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          }`}
                        >
                          {item.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {item.message}
                      </p>
                      {item.suggestion && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 pl-3 border-l-2 border-slate-300 dark:border-slate-600">
                          💡 {item.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {feedback.length > 0 && (
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="bg-card border border-border p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Issues</p>
            <p className="text-2xl text-slate-900 dark:text-white">
              {feedback.length}
            </p>
          </div>
          <div className="bg-card border border-border p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Errors</p>
            <p className="text-2xl text-red-600 dark:text-red-400">
              {feedback.filter((f) => f.type === "error").length}
            </p>
          </div>
          <div className="bg-card border border-border p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Warnings</p>
            <p className="text-2xl text-amber-600 dark:text-amber-400">
              {feedback.filter((f) => f.type === "warning").length}
            </p>
          </div>
          <div className="bg-card border border-border p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Suggestions</p>
            <p className="text-2xl text-blue-600 dark:text-blue-400">
              {feedback.filter((f) => f.type === "info").length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
