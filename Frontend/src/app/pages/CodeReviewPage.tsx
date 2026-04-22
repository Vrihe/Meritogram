import { useState, useRef, useEffect } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { Sparkles, Send, RotateCcw, Copy, ChevronDown, Loader2, Code2, Bot } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { CodeMiniEditor } from "../components/CodeMiniEditor";
import { codeReviewService, ChatMessage } from "../services/codeReview.service";

const LANGUAGES = ["Python", "JavaScript", "TypeScript", "Java", "C++", "Go", "Rust", "PHP", "Ruby"];

const SAMPLE_CODE = `def find_duplicates(arr):
    duplicates = []
    for i in range(len(arr)):
        for j in range(i+1, len(arr)):
            if arr[i] == arr[j]:
                if arr[i] not in duplicates:
                    duplicates.append(arr[i])
    return duplicates

# Test
nums = [1, 2, 3, 2, 4, 3, 5]
result = find_duplicates(nums)
print(result)`;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isSelection?: boolean;
  selectionText?: string;
}

function MarkdownText({ text }: { text: string }) {
  // Very lightweight markdown renderer
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let inCode = false;
  let codeLines: string[] = [];
  let codeLang = "";
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("```")) {
      if (!inCode) {
        inCode = true;
        codeLang = line.slice(3).trim();
        codeLines = [];
      } else {
        elements.push(
          <pre key={key++} className="bg-slate-900 rounded-lg p-3 my-2 overflow-x-auto border border-slate-700">
            <code className="text-sm font-mono text-slate-200 whitespace-pre">{codeLines.join("\n")}</code>
          </pre>
        );
        inCode = false;
        codeLines = [];
      }
      continue;
    }

    if (inCode) { codeLines.push(line); continue; }

    if (line.startsWith("## ")) {
      elements.push(<h3 key={key++} className="text-sm font-bold mt-3 mb-1 text-indigo-400">{line.slice(3)}</h3>);
    } else if (line.startsWith("# ")) {
      elements.push(<h2 key={key++} className="text-sm font-bold mt-2 mb-1 text-white">{line.slice(2)}</h2>);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <div key={key++} className="flex gap-2 text-sm leading-relaxed">
          <span className="text-indigo-400 mt-0.5 flex-shrink-0">•</span>
          <span dangerouslySetInnerHTML={{ __html: inlineFormat(line.slice(2)) }} />
        </div>
      );
    } else if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
      elements.push(<p key={key++} className="text-sm font-semibold mt-1" dangerouslySetInnerHTML={{ __html: inlineFormat(line) }} />);
    } else if (line.trim() === "") {
      elements.push(<div key={key++} className="h-1" />);
    } else {
      elements.push(<p key={key++} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: inlineFormat(line) }} />);
    }
  }

  return <div className="space-y-0.5">{elements}</div>;
}

function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code class="bg-slate-800 text-indigo-300 px-1 rounded text-xs font-mono">$1</code>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

export function CodeReviewPage() {
  const { isDark } = useTheme();
  const [code, setCode] = useState(SAMPLE_CODE);
  const [language, setLanguage] = useState("Python");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [highlightedLines, setHighlightedLines] = useState<number[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (userMessage: string, selection?: string) => {
    if (!userMessage.trim() && !selection) return;
    setIsLoading(true);

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: selection ? `Analyze this fragment:\n\`\`\`\n${selection}\n\`\`\`` : userMessage,
      isSelection: !!selection,
      selectionText: selection,
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInputValue("");

    try {
      const history: ChatMessage[] = updatedMessages.slice(0, -1).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const resp = await codeReviewService.chat({
        code,
        language: language.toLowerCase(),
        selection: selection,
        messages: history,
        message: selection ? `Analyze this selected fragment:\n${selection}` : userMessage,
      });

      setMessages(prev => [
        ...prev,
        { id: Date.now().toString() + "_ai", role: "assistant", content: resp.reply },
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString() + "_err",
          role: "assistant",
          content: `**Error:** ${err?.message || "Could not reach the server. Make sure the backend is running."}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeAll = () => {
    sendMessage("Please do a full code review. Analyze the code for bugs, performance issues, best practices, and suggest improvements.");
  };

  const handleAnalyzeSelection = (sel: { text: string; startLine: number; endLine: number }) => {
    setHighlightedLines(
      Array.from({ length: sel.endLine - sel.startLine + 1 }, (_, i) => sel.startLine + i)
    );
    sendMessage("", sel.text);
  };

  const handleSend = () => {
    if (inputValue.trim()) sendMessage(inputValue.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCode(SAMPLE_CODE);
    setMessages([]);
    setHighlightedLines([]);
  };

  const cardBorder = isDark ? "border-slate-700/60" : "border-slate-200";
  const panelBg = isDark ? "bg-slate-900" : "bg-white";
  const chatBg = isDark ? "bg-[#0a0e1a]" : "bg-slate-50";
  const textPrimary = isDark ? "text-slate-100" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ height: "calc(100vh - 60px)" }}>
      {/* Top toolbar */}
      <div className={`flex items-center gap-3 px-5 py-3 border-b ${cardBorder} ${isDark ? "bg-[#0d1117]" : "bg-white"} flex-shrink-0`}>
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className={`text-sm font-bold ${textPrimary}`}>AI Code Review</h2>
            <p className={`text-xs ${textMuted}`}>Powered by Ollama</p>
          </div>
        </div>

        <div className="flex-1" />

        {/* Language dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${isDark ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"}`}
          >
            <Code2 className="w-3.5 h-3.5" />
            {language}
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
          {showLangDropdown && (
            <div className={`absolute right-0 top-full mt-1 w-40 rounded-xl border shadow-xl z-50 py-1 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
              {LANGUAGES.map(lang => (
                <button
                  key={lang}
                  onClick={() => { setLanguage(lang); setShowLangDropdown(false); }}
                  className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${lang === language ? "text-indigo-500 font-semibold" : textPrimary} ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-50"}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Copy / Reset */}
        <button onClick={handleCopy} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all ${isDark ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>
          <Copy className="w-3.5 h-3.5" />
          {copied ? "Copied!" : "Copy"}
        </button>
        <button onClick={handleReset} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all ${isDark ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>

        {/* Analyze All */}
        <button
          onClick={handleAnalyzeAll}
          disabled={isLoading || !code.trim()}
          className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", boxShadow: "0 4px 15px rgba(99,102,241,0.4)" }}
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          Analyze All
        </button>
      </div>

      {/* Resizable panels */}
      <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        {/* LEFT: Mini IDE */}
        <Panel defaultSize={55} minSize={30}>
          <div className={`h-full flex flex-col border-r ${cardBorder} overflow-hidden`} style={{ background: "#0d1117" }}>
            {/* Editor toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 flex-shrink-0" style={{ background: "#161b2e" }}>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-red-500 rounded-full opacity-80" />
                <div className="w-3 h-3 bg-yellow-500 rounded-full opacity-80" />
                <div className="w-3 h-3 bg-green-500 rounded-full opacity-80" />
                <span className="text-slate-500 text-xs ml-3 font-mono">solution.{language === "Python" ? "py" : language === "JavaScript" ? "js" : language === "TypeScript" ? "ts" : language === "Java" ? "java" : language === "C++" ? "cpp" : language === "Go" ? "go" : "txt"}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-600 text-xs font-mono">
                  {code.split("\n").length} lines · {code.length} chars
                </span>
                {highlightedLines.length > 0 && (
                  <button onClick={() => setHighlightedLines([])} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                    Clear highlights
                  </button>
                )}
              </div>
            </div>

            {/* Select hint */}
            <div className="px-4 py-1.5 flex-shrink-0 border-b border-slate-800" style={{ background: "#0f1420" }}>
              <p className="text-xs text-slate-600">
                💡 Select a code fragment to analyze just that part
              </p>
            </div>

            {/* The editor itself */}
            <CodeMiniEditor
              code={code}
              language={language.toLowerCase()}
              onChange={setCode}
              onAnalyzeSelection={handleAnalyzeSelection}
              highlightedLines={highlightedLines}
            />
          </div>
        </Panel>

        {/* Resize handle */}
        <PanelResizeHandle className="w-1.5 flex items-center justify-center cursor-col-resize group" style={{ background: isDark ? "#1a2035" : "#e2e8f0" }}>
          <div className="w-0.5 h-10 rounded-full transition-all group-hover:h-20 group-hover:bg-indigo-500" style={{ background: isDark ? "#2d3a5a" : "#cbd5e1" }} />
        </PanelResizeHandle>

        {/* RIGHT: Chat */}
        <Panel defaultSize={45} minSize={30}>
          <div className={`h-full flex flex-col overflow-hidden ${chatBg}`}>
            {/* Chat header */}
            <div className={`px-5 py-3 border-b ${cardBorder} flex-shrink-0 ${isDark ? "bg-[#0d1420]" : "bg-white"}`}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${textPrimary}`}>AI Code Reviewer</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <p className="text-xs text-emerald-400">Ollama · {messages.length > 0 ? `${messages.filter(m => m.role === "assistant").length} replies` : "ready"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center py-8 gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-indigo-400" />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${textPrimary}`}>Ready to review your code</p>
                    <p className={`text-xs mt-1 ${textMuted} max-w-[220px]`}>
                      Click <strong className="text-indigo-400">Analyze All</strong> or select a fragment in the editor
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full max-w-xs mt-2">
                    {["Check for bugs", "Review performance", "Best practices", "Security issues"].map(q => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        disabled={isLoading}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all hover:border-indigo-500/50 ${isDark ? "border-slate-700 text-slate-400 hover:text-indigo-400 bg-slate-800/50" : "border-slate-200 text-slate-600 hover:text-indigo-600 bg-white"}`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 mr-2">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-tr-sm"
                        : isDark
                        ? "bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-tl-sm"
                        : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <MarkdownText text={msg.content} />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 mr-2">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className={`px-4 py-3 rounded-2xl rounded-tl-sm ${isDark ? "bg-slate-800/80 border border-slate-700/50" : "bg-white border border-slate-200 shadow-sm"}`}>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <div key={i} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                        ))}
                      </div>
                      <span className={`text-xs ${textMuted}`}>Analyzing...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input area */}
            <div className={`p-3 border-t ${cardBorder} flex-shrink-0 ${isDark ? "bg-[#0d1420]" : "bg-white"}`}>
              <div className={`flex items-end gap-2 rounded-xl border px-3 py-2 transition-all focus-within:border-indigo-500/60 ${isDark ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  placeholder="Ask about the code... (Enter to send)"
                  rows={1}
                  className={`flex-1 bg-transparent resize-none outline-none text-sm ${textPrimary} placeholder:${textMuted} disabled:opacity-50`}
                  style={{ maxHeight: "120px" }}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !inputValue.trim()}
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
                </button>
              </div>
              <p className={`text-xs mt-1.5 text-center ${textMuted}`}>
                Shift+Enter for new line · Enter to send
              </p>
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
