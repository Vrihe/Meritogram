// Dashboard Page – Dynamic (MongoDB)
(function () {
  function gradeColor(grade) {
    if (grade.startsWith('A')) return { bg: '#d1fae5', text: '#065f46' };
    if (grade.startsWith('B')) return { bg: '#e0e7ff', text: '#3730a3' };
    if (grade.startsWith('C')) return { bg: '#fef3c7', text: '#92400e' };
    return { bg: '#fee2e2', text: '#b91c1c' };
  }

  window.renderDashboard = async function () {
    const page = document.getElementById('page-content');
    page.innerHTML = '<div style="display:flex;justify-content:center;padding:var(--space-8);"><div class="shimmer" style="width:60px;height:60px;border-radius:var(--radius-full);"></div></div>';

    let stats, courses;
    try {
      [stats, courses] = await Promise.all([
        window.electronAPI.getStats(),
        window.electronAPI.getCourses(),
      ]);
    } catch (err) {
      page.innerHTML = '<div class="card" style="padding:var(--space-6);text-align:center;color:var(--color-red-500);">Failed to load dashboard data. Is MongoDB running?</div>';
      return;
    }

    const miniStats = [
      { icon: '🔥', label: 'Study Streak', value: stats.study_streak + ' days', bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
      { icon: '⏱️', label: 'Study Hours', value: stats.study_hours + ' hrs', bg: 'rgba(99,102,241,0.1)', color: '#6366f1' },
      { icon: '📝', label: 'Assignments', value: stats.pending_assignments + ' pending', bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
      { icon: '🏆', label: 'Class Rank', value: 'Top ' + stats.class_rank_pct + '%', bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
    ];

    const classesAttendedPct = stats.classes_total > 0 ? Math.round((stats.classes_attended / stats.classes_total) * 100) : 0;
    const assignmentsDonePct = stats.assignments_total > 0 ? Math.round((stats.assignments_done / stats.assignments_total) * 100) : 0;

    page.innerHTML = `
      <!-- Mini Stats Row -->
      <div class="grid-4 stagger-1" style="margin-bottom:var(--space-5);">
        ${miniStats.map(s => `
          <div class="card" style="padding:var(--space-4);display:flex;align-items:center;gap:12px;">
            <div class="card-icon" style="background:${s.bg};color:${s.color};">${s.icon}</div>
            <div>
              <div style="font-size:1.1rem;font-weight:800;color:var(--text-primary);">${s.value}</div>
              <div style="font-size:var(--font-size-xs);color:var(--text-muted);">${s.label}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="dashboard-grid">
        <!-- Left Column -->
        <div class="dashboard-left">
          <!-- GPA Card -->
          <div class="card stagger-2">
            <div class="card-header">
              <div class="card-icon" style="background:rgba(99,102,241,0.1);color:#6366f1;">📊</div>
              <div>
                <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary);">GPA Overview</div>
                <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Current semester performance</div>
              </div>
            </div>
            <div class="card-body" style="display:flex;justify-content:center;padding:var(--space-6);">
              <div id="gpa-circle"></div>
            </div>
          </div>

          <!-- Stat Cards -->
          <div class="grid-3 stagger-3">
            <div class="card" style="padding:var(--space-4);">
              <div class="card-icon" style="background:rgba(99,102,241,0.1);color:#6366f1;margin-bottom:var(--space-3);">📚</div>
              <div class="stat-card-value">${stats.classes_attended}</div>
              <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-top:var(--space-1);">Classes Attended</div>
              <div style="font-size:var(--font-size-xs);color:var(--text-subtle);">of ${stats.classes_total} total</div>
              <div class="progress-bar-track">
                <div class="progress-bar-fill" style="width:${classesAttendedPct}%;background:var(--color-indigo-500);"></div>
              </div>
            </div>
            <div class="card" style="padding:var(--space-4);">
              <div class="card-icon" style="background:rgba(16,185,129,0.1);color:#10b981;margin-bottom:var(--space-3);">✅</div>
              <div class="stat-card-value">${stats.assignments_done}</div>
              <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-top:var(--space-1);">Assignments Done</div>
              <div style="font-size:var(--font-size-xs);color:var(--text-subtle);">of ${stats.assignments_total} total</div>
              <div class="progress-bar-track">
                <div class="progress-bar-fill" style="width:${assignmentsDonePct}%;background:var(--color-emerald-500);"></div>
              </div>
            </div>
            <div class="card" style="padding:var(--space-4);position:relative;">
              <div style="position:absolute;top:12px;right:12px;">
                <span class="status-badge status-review" style="font-size:0.6rem;">⚠️ Attention</span>
              </div>
              <div class="card-icon" style="background:rgba(245,158,11,0.1);color:#f59e0b;margin-bottom:var(--space-3);">📈</div>
              <div class="stat-card-value">${stats.upcoming_exams}</div>
              <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-top:var(--space-1);">Upcoming Exams</div>
              <div style="font-size:var(--font-size-xs);color:var(--text-subtle);">this month</div>
              <div class="progress-bar-track">
                <div class="progress-bar-fill" style="width:30%;background:var(--color-amber-500);"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="dashboard-right">
          <!-- AI Banner -->
          <div class="ai-banner stagger-2" onclick="navigate('#/ai-tools')">
            <div class="ai-banner-icon">🤖</div>
            <div>
              <div class="ai-banner-title">AI Study Assistant Ready</div>
              <div class="ai-banner-sub">Get personalized help with your assignments and code reviews</div>
            </div>
            <div style="margin-left:auto;color:rgba(255,255,255,0.7);font-size:20px;">→</div>
          </div>

          <!-- Course Table -->
          <div class="card stagger-3" style="flex:1;">
            <div class="card-header" style="justify-content:space-between;">
              <div style="display:flex;align-items:center;gap:var(--space-3);">
                <div class="card-icon" style="background:rgba(99,102,241,0.1);color:#6366f1;">📋</div>
                <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary);">Course Performance</div>
              </div>
              <button class="add-entry-btn" onclick="showAddEntryModal()">+ Add Entry</button>
            </div>
            <div class="course-table-header">
              <span>Course</span>
              <span>Grade</span>
              <span>Score</span>
              <span>Attendance</span>
              <span>Trend</span>
              <span></span>
            </div>
            ${courses.map(c => {
              const gc = gradeColor(c.grade);
              const attendance = c.attendance_present + '/' + c.attendance_total;
              return `
                <div class="course-row">
                  <div class="course-info">
                    <div class="course-icon-chip" style="background:${c.color}20;color:${c.color};">${c.icon}</div>
                    <div>
                      <div style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary);">${c.name}</div>
                      <div style="font-size:var(--font-size-xs);color:var(--text-muted);">${c.code}</div>
                    </div>
                  </div>
                  <div><span class="grade-badge" style="background:${gc.bg};color:${gc.text};">${c.grade}</span></div>
                  <div style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary);">${c.score}%</div>
                  <div style="font-size:var(--font-size-sm);color:var(--text-muted);">${attendance}</div>
                  <div>${buildSparkline(c.sparkline, c.color)}</div>
                  <div>
                    <button class="add-entry-btn" onclick="showAddEntryModal('${c.name}')" style="padding:4px 8px;">+</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    // Render GPA circle
    const gpaContainer = document.getElementById('gpa-circle');
    if (gpaContainer) {
      buildGPACircle(stats.current_gpa, gpaContainer);
    }
  };
})();
