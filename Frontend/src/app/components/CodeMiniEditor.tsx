import { useRef, useState, useEffect, useCallback } from "react";
import hljs from "highlight.js";

// Map our language names to highlight.js aliases
const HLJS_LANG_MAP: Record<string, string> = {
  python: "python",
  javascript: "javascript",
  typescript: "typescript",
  java: "java",
  "c++": "cpp",
  go: "go",
  rust: "rust",
  php: "php",
  ruby: "ruby",
};

interface SelectionInfo {
  text: string;
  startLine: number;
  endLine: number;
  /** Pixel position (top) relative to the editor container */
  top: number;
  /** Pixel position (left) relative to the editor container */
  left: number;
}

interface CodeMiniEditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
  onAnalyzeSelection?: (selection: SelectionInfo) => void;
  highlightedLines?: number[]; // lines to highlight from AI feedback
  readOnly?: boolean;
}

export function CodeMiniEditor({
  code,
  language,
  onChange,
  onAnalyzeSelection,
  highlightedLines = [],
  readOnly = false,
}: CodeMiniEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const [highlighted, setHighlighted] = useState("");
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [showSelectionBtn, setShowSelectionBtn] = useState(false);

  // Syntax highlight
  useEffect(() => {
    const lang = HLJS_LANG_MAP[language.toLowerCase()] ?? "plaintext";
    try {
      const result = hljs.highlight(code, { language: lang, ignoreIllegals: true });
      setHighlighted(result.value);
    } catch {
      setHighlighted(hljs.highlightAuto(code).value);
    }
  }, [code, language]);

  // Sync scroll between textarea and the highlight overlay
  const syncScroll = useCallback(() => {
    if (!textareaRef.current || !preRef.current || !lineNumbersRef.current) return;
    const scrollTop = textareaRef.current.scrollTop;
    const scrollLeft = textareaRef.current.scrollLeft;
    preRef.current.scrollTop = scrollTop;
    preRef.current.scrollLeft = scrollLeft;
    lineNumbersRef.current.scrollTop = scrollTop;
  }, []);

  // Detect selection and compute floating button position
  const handleSelectionChange = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta || !containerRef.current) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;

    if (start === end) {
      setShowSelectionBtn(false);
      setSelection(null);
      return;
    }

    const selectedText = code.substring(start, end).trim();
    if (!selectedText) {
      setShowSelectionBtn(false);
      return;
    }

    // Count start/end lines
    const beforeStart = code.substring(0, start);
    const startLine = beforeStart.split("\n").length;
    const selectedLines = selectedText.split("\n").length;
    const endLine = startLine + selectedLines - 1;

    // Estimate pixel position using a hidden canvas trick
    // We'll approximate: line height ≈ 20px, top = startLine * lineHeight - scrollTop
    const lineHeight = 20;
    const containerRect = containerRef.current.getBoundingClientRect();
    const taRect = ta.getBoundingClientRect();

    // Use getBoundingClientRect difference from container
    const relativeTop = taRect.top - containerRect.top;
    const approxTop =
      relativeTop + startLine * lineHeight - ta.scrollTop - lineHeight + 8;
    const approxLeft = taRect.left - containerRect.left + 16;

    setSelection({ text: selectedText, startLine, endLine, top: approxTop, left: approxLeft });
    setShowSelectionBtn(true);
  }, [code]);

  const handleMouseUp = useCallback(() => {
    // Small delay to let selection register
    setTimeout(handleSelectionChange, 50);
  }, [handleSelectionChange]);

  const handleKeyUp = useCallback(() => {
    setTimeout(handleSelectionChange, 50);
  }, [handleSelectionChange]);

  // Hide floating button on outside click
  useEffect(() => {
    const hide = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest("[data-analyze-btn]") && !target.closest("textarea")) {
        setShowSelectionBtn(false);
      }
    };
    document.addEventListener("mousedown", hide);
    return () => document.removeEventListener("mousedown", hide);
  }, []);

  const lines = code.split("\n");

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden"
      style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace" }}
    >
      {/* Floating "Analyze Selection" button */}
      {showSelectionBtn && selection && (
        <button
          data-analyze-btn
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAnalyzeSelection?.(selection);
            setShowSelectionBtn(false);
          }}
          className="absolute z-30 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg shadow-xl transition-all animate-in fade-in zoom-in-95"
          style={{
            top: Math.max(8, selection.top),
            left: Math.max(8, selection.left),
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            boxShadow: "0 4px 20px rgba(99,102,241,0.5)",
          }}
        >
          <span>🔍</span>
          Analyze Selection ({selection.endLine - selection.startLine + 1} lines)
        </button>
      )}

      <div className="flex h-full overflow-hidden">
        {/* Line numbers */}
        <div
          ref={lineNumbersRef}
          className="flex-shrink-0 overflow-hidden select-none"
          style={{
            width: "3.2rem",
            background: "#0f1117",
            borderRight: "1px solid #1e2330",
            paddingTop: "0.75rem",
            overflowY: "hidden",
          }}
        >
          {lines.map((_, i) => {
            const lineNum = i + 1;
            const isHighlighted = highlightedLines.includes(lineNum);
            return (
              <div
                key={i}
                className="text-right pr-3 leading-5 transition-colors"
                style={{
                  fontSize: "0.75rem",
                  lineHeight: "1.25rem",
                  height: "1.25rem",
                  color: isHighlighted ? "#818cf8" : "#3d4663",
                  background: isHighlighted ? "rgba(99,102,241,0.08)" : "transparent",
                  fontWeight: isHighlighted ? 700 : 400,
                }}
              >
                {lineNum}
              </div>
            );
          })}
        </div>

        {/* Editor area: textarea + syntax-highlight overlay */}
        <div className="relative flex-1 overflow-hidden" style={{ background: "#0d1117" }}>
          {/* Syntax highlight overlay (non-interactive) */}
          <pre
            ref={preRef}
            aria-hidden
            className="absolute inset-0 m-0 p-3 pointer-events-none overflow-auto"
            style={{
              fontSize: "0.8rem",
              lineHeight: "1.25rem",
              whiteSpace: "pre",
              wordBreak: "normal",
              overflowWrap: "normal",
              color: "#cdd6f4",
              tabSize: 2,
            }}
          >
            <code
              dangerouslySetInnerHTML={{ __html: highlighted || escapeHtml(code) }}
              style={{ fontFamily: "inherit" }}
            />
            {/* Line highlight overlays */}
            {highlightedLines.length > 0 &&
              lines.map((_, i) => {
                const lineNum = i + 1;
                if (!highlightedLines.includes(lineNum)) return null;
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: `calc(${i} * 1.25rem + 0.75rem)`,
                      height: "1.25rem",
                      background: "rgba(99,102,241,0.12)",
                      borderLeft: "2px solid #6366f1",
                      pointerEvents: "none",
                    }}
                  />
                );
              })}
          </pre>

          {/* Actual editable textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            onScroll={syncScroll}
            onMouseUp={handleMouseUp}
            onKeyUp={handleKeyUp}
            readOnly={readOnly}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            className="absolute inset-0 w-full h-full resize-none outline-none border-none p-3"
            style={{
              fontSize: "0.8rem",
              lineHeight: "1.25rem",
              fontFamily: "inherit",
              background: "transparent",
              color: "transparent",
              caretColor: "#e2e8f0",
              tabSize: 2,
              whiteSpace: "pre",
              overflowWrap: "normal",
              zIndex: 10,
            }}
            placeholder="// Paste your code here..."
          />
        </div>
      </div>
    </div>
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
