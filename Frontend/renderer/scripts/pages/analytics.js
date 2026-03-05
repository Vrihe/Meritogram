// Analytics Page – Dynamic (MongoDB)
(function () {
  window.renderAnalytics = async function () {
    const page = document.getElementById('page-content');
    page.innerHTML = '<div style="display:flex;justify-content:center;padding:var(--space-8);"><div class="shimmer" style="width:60px;height:60px;border-radius:var(--radius-full);"></div></div>';

    let data;
    try {
      data = await window.electronAPI.getAnalytics();
    } catch (err) {
      page.innerHTML = '<div class="card" style="padding:var(--space-6);text-align:center;color:var(--color-red-500);">Failed to load analytics. Is MongoDB running?</div>';
      return;
    }

    const ab = data.assignment_breakdown;
    const totalAssignments = ab.submitted + ab.pending + ab.in_progress + ab.upcoming;

    page.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-5);">
        <div>
          <div style="font-size:1.05rem;font-weight:600;color:var(--text-primary);">Analytics</div>
          <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Detailed academic performance breakdown</div>
        </div>
      </div>

      <!-- Overview Stats -->
      <div class="grid-4 stagger-1" style="margin-bottom:var(--space-5);">
        <div class="card" style="padding:var(--space-4);display:flex;align-items:center;gap:12px;">
          <div class="card-icon" style="background:rgba(99,102,241,0.1);color:#6366f1;">🎓</div>
          <div>
            <div style="font-size:1.1rem;font-weight:800;color:var(--text-primary);">${data.gpa}</div>
            <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Current GPA</div>
          </div>
        </div>
        <div class="card" style="padding:var(--space-4);display:flex;align-items:center;gap:12px;">
          <div class="card-icon" style="background:rgba(16,185,129,0.1);color:#10b981;">📊</div>
          <div>
            <div style="font-size:1.1rem;font-weight:800;color:var(--text-primary);">${data.avg_score}%</div>
            <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Avg Course Score</div>
          </div>
        </div>
        <div class="card" style="padding:var(--space-4);display:flex;align-items:center;gap:12px;">
          <div class="card-icon" style="background:rgba(245,158,11,0.1);color:#f59e0b;">📝</div>
          <div>
            <div style="font-size:1.1rem;font-weight:800;color:var(--text-primary);">${data.avg_assignment_score}%</div>
            <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Avg Assignment Score</div>
          </div>
        </div>
        <div class="card" style="padding:var(--space-4);display:flex;align-items:center;gap:12px;">
          <div class="card-icon" style="background:rgba(139,92,246,0.1);color:#8b5cf6;">📚</div>
          <div>
            <div style="font-size:1.1rem;font-weight:800;color:var(--text-primary);">${data.total_credits}</div>
            <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Total Credits</div>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-5);margin-bottom:var(--space-5);">
        <!-- Course Performance Breakdown -->
        <div class="card stagger-2">
          <div class="card-header">
            <div class="card-icon" style="background:rgba(99,102,241,0.1);color:#6366f1;">📈</div>
            <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary);">Course Performance</div>
          </div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-4);">
            ${data.course_performance.map(c => `
              <div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-2);">
                  <div style="display:flex;align-items:center;gap:var(--space-2);">
                    <span style="font-size:16px;">${c.icon}</span>
                    <span style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary);">${c.code}</span>
                  </div>
                  <span style="font-size:var(--font-size-sm);font-weight:800;color:var(--text-primary);">${c.score}%</span>
                </div>
                <div class="progress-bar-track">
                  <div class="progress-bar-fill" style="width:${c.score}%;background:${c.color};"></div>
                </div>
                <div style="display:flex;justify-content:space-between;margin-top:4px;">
                  <span style="font-size:var(--font-size-xs);color:var(--text-muted);">Attendance: ${c.attendance_pct}%</span>
                  <span style="font-size:var(--font-size-xs);color:var(--text-muted);">${c.submitted_assignments}/${c.total_assignments} submitted</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Assignment Breakdown + Study Stats -->
        <div style="display:flex;flex-direction:column;gap:var(--space-5);">
          <div class="card stagger-3">
            <div class="card-header">
              <div class="card-icon" style="background:rgba(245,158,11,0.1);color:#f59e0b;">📋</div>
              <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary);">Assignment Breakdown</div>
            </div>
            <div class="card-body">
              <div style="display:flex;gap:var(--space-4);margin-bottom:var(--space-4);">
                <div style="flex:1;text-align:center;padding:var(--space-3);border-radius:var(--radius-md);background:rgba(16,185,129,0.1);">
                  <div style="font-size:1.2rem;font-weight:800;color:#10b981;">${ab.submitted}</div>
                  <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Submitted</div>
                </div>
                <div style="flex:1;text-align:center;padding:var(--space-3);border-radius:var(--radius-md);background:rgba(245,158,11,0.1);">
                  <div style="font-size:1.2rem;font-weight:800;color:#f59e0b;">${ab.pending}</div>
                  <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Pending</div>
                </div>
                <div style="flex:1;text-align:center;padding:var(--space-3);border-radius:var(--radius-md);background:rgba(139,92,246,0.1);">
                  <div style="font-size:1.2rem;font-weight:800;color:#8b5cf6;">${ab.in_progress}</div>
                  <div style="font-size:var(--font-size-xs);color:var(--text-muted);">In Progress</div>
                </div>
                <div style="flex:1;text-align:center;padding:var(--space-3);border-radius:var(--radius-md);background:rgba(99,102,241,0.1);">
                  <div style="font-size:1.2rem;font-weight:800;color:#6366f1;">${ab.upcoming}</div>
                  <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Upcoming</div>
                </div>
              </div>
              <div class="progress-bar-track" style="height:12px;">
                <div style="display:flex;height:100%;border-radius:var(--radius-full);overflow:hidden;">
                  <div style="width:${totalAssignments > 0 ? (ab.submitted / totalAssignments * 100) : 0}%;background:#10b981;"></div>
                  <div style="width:${totalAssignments > 0 ? (ab.pending / totalAssignments * 100) : 0}%;background:#f59e0b;"></div>
                  <div style="width:${totalAssignments > 0 ? (ab.in_progress / totalAssignments * 100) : 0}%;background:#8b5cf6;"></div>
                  <div style="width:${totalAssignments > 0 ? (ab.upcoming / totalAssignments * 100) : 0}%;background:#6366f1;"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="card stagger-4">
            <div class="card-header">
              <div class="card-icon" style="background:rgba(239,68,68,0.1);color:#ef4444;">🔥</div>
              <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary);">Study Stats</div>
            </div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-3);">
              <div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-2) 0;border-bottom:1px solid var(--border-subtle);">
                <span style="font-size:var(--font-size-sm);color:var(--text-muted);">Study Streak</span>
                <span style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);">${data.study_streak} days</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-2) 0;border-bottom:1px solid var(--border-subtle);">
                <span style="font-size:var(--font-size-sm);color:var(--text-muted);">Study Hours</span>
                <span style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);">${data.study_hours} hrs</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-2) 0;">
                <span style="font-size:var(--font-size-sm);color:var(--text-muted);">Total Courses</span>
                <span style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);">${data.total_courses}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  };
})();
