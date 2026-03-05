// AI Tools Page
(function () {
  let activeTab = 'code-review';

  const sampleCode = `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

def binary_search(arr, target):
    left, right = 0, len(arr)
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

result = bubble_sort([64, 34, 25, 12, 22, 11, 90])
print(result)
idx = binary_search(result, 25)
print(f"Found at index: {idx}")`;

  const feedbackItems = [
    {
      type: 'error',
      title: 'Bug: Off-by-one in binary_search',
      line: 10,
      desc: 'right should be len(arr) - 1, not len(arr). This can cause an IndexError.',
      fix: 'Change line 10 to:\nright = 0, len(arr) - 1\n\nThis ensures the right pointer stays within array bounds.',
    },
    {
      type: 'warning',
      title: 'Performance: Inefficient sort',
      line: 2,
      desc: 'Bubble sort is O(n²). Consider using a more efficient algorithm for large datasets.',
      fix: 'For production code, use Python\'s built-in sorted() or list.sort() which uses Timsort O(n log n).',
    },
    {
      type: 'suggestion',
      title: 'Add early termination',
      line: 3,
      desc: 'Add a swapped flag to exit early if the list is already sorted.',
      fix: 'Add a boolean flag:\nswapped = False\nAfter each swap: swapped = True\nAfter inner loop: if not swapped: break',
    },
    {
      type: 'good',
      title: 'Clean function signatures',
      line: 1,
      desc: 'Good use of descriptive function names and clean parameter naming.',
      fix: null,
    },
  ];

  const gradeComponents = [
    { name: 'Assignments', weight: 30, score: 92 },
    { name: 'Midterm Exam', weight: 25, score: 88 },
    { name: 'Final Exam', weight: 25, score: '' },
    { name: 'Participation', weight: 10, score: 95 },
    { name: 'Project', weight: 10, score: '' },
  ];

  const chatMessages = [
    { role: 'ai', text: 'Hi! I\'m your AI study assistant. How can I help you today? I can help with:\n\n• Explaining concepts\n• Solving practice problems\n• Reviewing your work\n• Study planning' },
    { role: 'user', text: 'Can you explain how binary search works?' },
    { role: 'ai', text: 'Binary search is an efficient algorithm for finding an element in a sorted array.\n\n1. Start with the full array\n2. Check the middle element\n3. If target < middle, search left half\n4. If target > middle, search right half\n5. Repeat until found or range is empty\n\nTime complexity: O(log n)\nSpace complexity: O(1) iterative, O(log n) recursive' },
  ];

  const lineAnnotations = {};
  feedbackItems.forEach(f => {
    if (f.line) lineAnnotations[f.line] = f.type;
  });

  function renderCodeReview() {
    const lines = sampleCode.split('\n');

    return `
      <div class="ai-tools-layout">
        <!-- Code Editor -->
        <div class="card" style="flex:1;display:flex;flex-direction:column;overflow:hidden;">
          <div class="code-editor-wrapper" style="flex:1;display:flex;flex-direction:column;">
            <div class="editor-toolbar">
              <span style="color:#8b949e;font-size:0.75rem;font-weight:600;">📄 solution.py</span>
              <div style="margin-left:auto;display:flex;gap:var(--space-2);">
                <button class="editor-toolbar-btn active">Python</button>
                <button class="editor-toolbar-btn">JavaScript</button>
                <button class="editor-toolbar-btn">Java</button>
              </div>
            </div>
            <div class="code-area" style="flex:1;">
              <div class="line-numbers">
                ${lines.map((_, i) => {
                  const num = i + 1;
                  const hl = lineAnnotations[num] ? 'highlighted' : '';
                  return `<span class="${hl}">${num}</span>`;
                }).join('')}
              </div>
              <pre class="code-content">${lines.map((line, i) => {
                const num = i + 1;
                const annotation = lineAnnotations[num];
                const cls = annotation ? `code-line ${annotation}-line` : 'code-line';
                return `<span class="${cls}">${escapeHtml(line)}</span>`;
              }).join('\n')}</pre>
            </div>
            <button class="analyze-btn" onclick="triggerAnalysis()">
              🤖 Analyze Code with AI
            </button>
          </div>
        </div>

        <!-- Feedback Sidebar -->
        <div class="feedback-sidebar card" style="width:320px;overflow-y:auto;">
          <div style="padding:var(--space-4);border-bottom:1px solid var(--border-color);display:flex;align-items:center;justify-content:space-between;">
            <div style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);">AI Feedback</div>
            <span style="font-size:var(--font-size-xs);color:var(--text-muted);">${feedbackItems.length} issues</span>
          </div>
          <div style="padding:var(--space-3);display:flex;flex-direction:column;gap:var(--space-3);">
            ${feedbackItems.map(f => `
              <div class="feedback-card" data-type="${f.type}">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                  <span class="feedback-type-badge badge-${f.type}">${f.type}</span>
                  ${f.line ? `<span style="font-size:var(--font-size-xs);color:var(--text-subtle);">Line ${f.line}</span>` : ''}
                </div>
                <div style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary);">${f.title}</div>
                <div style="font-size:var(--font-size-xs);color:var(--text-muted);line-height:1.5;">${f.desc}</div>
                ${f.fix ? `
                  <div class="how-to-fix">
                    <div class="how-to-fix-label">💡 How to fix</div>
                    <div style="white-space:pre-line;">${f.fix}</div>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function renderGradePredictor() {
    let predicted = 0;
    let totalWeight = 0;
    gradeComponents.forEach(c => {
      if (c.score !== '') {
        predicted += (c.score / 100) * c.weight;
        totalWeight += c.weight;
      }
    });
    const projectedGrade = totalWeight > 0 ? (predicted / totalWeight * 100).toFixed(1) : '—';

    return `
      <div style="display:grid;grid-template-columns:1fr 320px;gap:var(--space-5);">
        <div class="card">
          <div class="card-header">
            <div class="card-icon" style="background:rgba(99,102,241,0.1);color:#6366f1;">📊</div>
            <div>
              <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary);">Grade Components</div>
              <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Enter your scores to predict final grade</div>
            </div>
          </div>
          <div>
            <div class="grade-row" style="background:var(--bg-elevated);font-weight:700;">
              <span style="font-size:var(--font-size-xs);color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;">Component</span>
              <span style="font-size:var(--font-size-xs);color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;text-align:center;">Weight</span>
              <span style="font-size:var(--font-size-xs);color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;text-align:center;">Score</span>
            </div>
            ${gradeComponents.map((c, i) => `
              <div class="grade-row">
                <span style="font-size:var(--font-size-sm);color:var(--text-primary);font-weight:500;">${c.name}</span>
                <span style="font-size:var(--font-size-sm);color:var(--text-muted);text-align:center;">${c.weight}%</span>
                <input class="grade-input" type="number" min="0" max="100" value="${c.score}" placeholder="—" data-index="${i}" onchange="updateGradeComponent(${i}, this.value)" />
              </div>
            `).join('')}
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:var(--space-5);">
          <div class="card" style="padding:var(--space-5);text-align:center;">
            <div style="font-size:var(--font-size-xs);color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:var(--space-3);">Projected Grade</div>
            <div style="font-size:2.5rem;font-weight:800;color:var(--color-indigo-500);">${projectedGrade}%</div>
            <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-top:var(--space-2);">Based on ${totalWeight}% of components</div>
            <div class="progress-bar-track" style="margin-top:var(--space-4);">
              <div class="progress-bar-fill" style="width:${Math.min(100, projectedGrade)}%;background:var(--color-indigo-500);"></div>
            </div>
          </div>

          <div class="card" style="padding:var(--space-5);">
            <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary);margin-bottom:var(--space-3);">Grade Scale</div>
            <div style="display:flex;flex-direction:column;gap:var(--space-2);">
              ${[
                { range: '93-100', letter: 'A', color: '#10b981' },
                { range: '90-92', letter: 'A-', color: '#10b981' },
                { range: '87-89', letter: 'B+', color: '#6366f1' },
                { range: '83-86', letter: 'B', color: '#6366f1' },
                { range: '80-82', letter: 'B-', color: '#6366f1' },
                { range: '77-79', letter: 'C+', color: '#f59e0b' },
                { range: '<77', letter: 'C or below', color: '#ef4444' },
              ].map(g => `
                <div style="display:flex;align-items:center;justify-content:space-between;font-size:var(--font-size-xs);">
                  <span style="color:var(--text-muted);">${g.range}%</span>
                  <span style="font-weight:700;color:${g.color};">${g.letter}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderChatAssistant() {
    return `
      <div class="card" style="max-width:700px;">
        <div class="card-header">
          <div class="ai-avatar">🤖</div>
          <div>
            <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary);">AI Study Assistant</div>
            <div style="font-size:var(--font-size-xs);color:var(--color-emerald-500);display:flex;align-items:center;gap:4px;">
              <span style="width:6px;height:6px;border-radius:50%;background:var(--color-emerald-500);"></span>
              Online
            </div>
          </div>
        </div>
        <div class="chat-container">
          <div class="chat-messages" id="chat-messages">
            ${chatMessages.map(m => `
              <div class="message-row ${m.role}">
                ${m.role === 'ai' ? '<div class="ai-avatar" style="font-size:10px;">🤖</div>' : ''}
                <div class="message-bubble ${m.role}">${m.text}</div>
              </div>
            `).join('')}
          </div>
          <div class="chat-input-area">
            <input class="chat-input" id="chat-input" type="text" placeholder="Ask a question..." onkeydown="if(event.key==='Enter')sendChatMessage()" />
            <button class="chat-send-btn" onclick="sendChatMessage()">➤</button>
          </div>
        </div>
      </div>
    `;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  window.renderAITools = function () {
    const page = document.getElementById('page-content');
    const tabs = [
      { id: 'code-review', icon: '💻', label: 'Code Review' },
      { id: 'grade-predictor', icon: '📊', label: 'Grade Predictor' },
      { id: 'chat', icon: '💬', label: 'Study Assistant' },
    ];

    let tabContent = '';
    if (activeTab === 'code-review') tabContent = renderCodeReview();
    else if (activeTab === 'grade-predictor') tabContent = renderGradePredictor();
    else if (activeTab === 'chat') tabContent = renderChatAssistant();

    page.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-5);">
        <div>
          <div style="font-size:1.05rem;font-weight:600;color:var(--text-primary);">AI Tools</div>
          <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Powered by artificial intelligence</div>
        </div>
      </div>

      <div class="tab-bar" style="margin-bottom:var(--space-5);">
        ${tabs.map(t => `
          <button class="tab-btn ${activeTab === t.id ? 'active' : ''}" onclick="switchAITab('${t.id}')">
            ${t.icon} ${t.label}
          </button>
        `).join('')}
      </div>

      ${tabContent}
    `;

    // Scroll chat to bottom
    const chatContainer = document.getElementById('chat-messages');
    if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
  };

  window.switchAITab = function (tabId) {
    activeTab = tabId;
    renderAITools();
  };

  window.triggerAnalysis = function () {
    const btn = document.querySelector('.analyze-btn');
    if (btn) {
      btn.innerHTML = '<span class="animate-spin">⟳</span> Analyzing...';
      btn.style.opacity = '0.7';
      setTimeout(() => {
        btn.innerHTML = '✓ Analysis Complete';
        btn.style.opacity = '1';
        btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        setTimeout(() => {
          btn.innerHTML = '🤖 Analyze Code with AI';
          btn.style.background = '';
        }, 2000);
      }, 1500);
    }
  };

  window.updateGradeComponent = function (index, value) {
    gradeComponents[index].score = value === '' ? '' : Number(value);
    renderAITools();
  };

  window.sendChatMessage = function () {
    const input = document.getElementById('chat-input');
    if (!input || !input.value.trim()) return;
    const text = input.value.trim();
    chatMessages.push({ role: 'user', text });
    input.value = '';
    renderAITools();

    // Simulate AI response
    setTimeout(() => {
      chatMessages.push({
        role: 'ai',
        text: 'That\'s a great question! Let me think about that...\n\nBased on the course material, here\'s what I can tell you:\n\nThe key concept involves understanding the underlying principles and applying them step by step. Would you like me to go into more detail on any specific aspect?'
      });
      renderAITools();
    }, 1200);
  };
})();
