// Profile Page – Dynamic (MongoDB)
(function () {
  window.renderProfile = async function () {
    const page = document.getElementById('page-content');
    page.innerHTML = '<div style="display:flex;justify-content:center;padding:var(--space-8);"><div class="shimmer" style="width:60px;height:60px;border-radius:var(--radius-full);"></div></div>';

    let settings, stats, courses;
    try {
      [settings, stats, courses] = await Promise.all([
        window.electronAPI.getSettings(),
        window.electronAPI.getStats(),
        window.electronAPI.getCourses(),
      ]);
    } catch (err) {
      page.innerHTML = '<div class="card" style="padding:var(--space-6);text-align:center;color:var(--color-red-500);">Failed to load profile. Is MongoDB running?</div>';
      return;
    }

    const p = settings.profile;
    const ac = settings.academic;
    const initials = p.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
    const totalCredits = courses.reduce((a, c) => a + c.credits, 0);
    const avgScore = courses.length > 0 ? (courses.reduce((a, c) => a + c.score, 0) / courses.length).toFixed(1) : 0;

    page.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-5);">
        <div>
          <div style="font-size:1.05rem;font-weight:600;color:var(--text-primary);">Profile</div>
          <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Your academic profile overview</div>
        </div>
        <button class="btn-primary" onclick="navigate('#/settings')">✏️ Edit Profile</button>
      </div>

      <!-- Profile Header Card -->
      <div class="card stagger-1" style="margin-bottom:var(--space-5);">
        <div class="card-body" style="display:flex;align-items:center;gap:var(--space-6);padding:var(--space-6);">
          <div style="width:96px;height:96px;border-radius:var(--radius-full);background:linear-gradient(135deg,var(--color-indigo-400),var(--color-purple-500));display:flex;align-items:center;justify-content:center;color:white;font-size:2rem;font-weight:800;flex-shrink:0;">${initials}</div>
          <div style="flex:1;">
            <div style="font-size:1.3rem;font-weight:800;color:var(--text-primary);margin-bottom:4px;">${p.full_name}</div>
            <div style="font-size:var(--font-size-sm);color:var(--text-muted);margin-bottom:var(--space-2);">${p.email}</div>
            <div style="display:flex;gap:var(--space-4);flex-wrap:wrap;">
              <span class="status-badge status-active">${p.major}</span>
              <span class="status-badge status-review">${ac.year}</span>
              <span class="status-badge status-idle">ID: ${p.student_id}</span>
            </div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:2.5rem;font-weight:900;color:var(--color-indigo-500);">${stats.current_gpa}</div>
            <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Current GPA</div>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-5);">
        <!-- Academic Info -->
        <div class="card stagger-2">
          <div class="card-header">
            <div class="card-icon" style="background:rgba(99,102,241,0.1);color:#6366f1;">🎓</div>
            <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary);">Academic Info</div>
          </div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-3);">
            <div style="display:flex;justify-content:space-between;padding:var(--space-2) 0;border-bottom:1px solid var(--border-subtle);">
              <span style="font-size:var(--font-size-sm);color:var(--text-muted);">Year</span>
              <span style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);">${ac.year}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:var(--space-2) 0;border-bottom:1px solid var(--border-subtle);">
              <span style="font-size:var(--font-size-sm);color:var(--text-muted);">GPA Target</span>
              <span style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);">${ac.gpa_target}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:var(--space-2) 0;border-bottom:1px solid var(--border-subtle);">
              <span style="font-size:var(--font-size-sm);color:var(--text-muted);">Attendance</span>
              <span style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);">${ac.attendance_pct}%</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:var(--space-2) 0;border-bottom:1px solid var(--border-subtle);">
              <span style="font-size:var(--font-size-sm);color:var(--text-muted);">Total Credits</span>
              <span style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);">${totalCredits}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:var(--space-2) 0;">
              <span style="font-size:var(--font-size-sm);color:var(--text-muted);">Avg Score</span>
              <span style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);">${avgScore}%</span>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="card stagger-3">
          <div class="card-header">
            <div class="card-icon" style="background:rgba(16,185,129,0.1);color:#10b981;">📊</div>
            <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary);">Quick Stats</div>
          </div>
          <div class="card-body" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
            <div style="text-align:center;padding:var(--space-4);border-radius:var(--radius-md);background:rgba(239,68,68,0.08);">
              <div style="font-size:1.5rem;font-weight:900;color:#ef4444;">${stats.study_streak}</div>
              <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Day Streak</div>
            </div>
            <div style="text-align:center;padding:var(--space-4);border-radius:var(--radius-md);background:rgba(99,102,241,0.08);">
              <div style="font-size:1.5rem;font-weight:900;color:#6366f1;">${stats.study_hours}</div>
              <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Study Hours</div>
            </div>
            <div style="text-align:center;padding:var(--space-4);border-radius:var(--radius-md);background:rgba(16,185,129,0.08);">
              <div style="font-size:1.5rem;font-weight:900;color:#10b981;">${stats.assignments_done}</div>
              <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Assignments Done</div>
            </div>
            <div style="text-align:center;padding:var(--space-4);border-radius:var(--radius-md);background:rgba(245,158,11,0.08);">
              <div style="font-size:1.5rem;font-weight:900;color:#f59e0b;">${courses.length}</div>
              <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Courses</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Enrolled Courses -->
      <div class="card stagger-4" style="margin-top:var(--space-5);">
        <div class="card-header">
          <div class="card-icon" style="background:rgba(139,92,246,0.1);color:#8b5cf6;">📚</div>
          <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary);">Enrolled Courses</div>
        </div>
        <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-3);">
          ${courses.map(c => `
            <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);border-radius:var(--radius-md);background:var(--bg-elevated);">
              <div class="course-icon-chip" style="background:${c.color}20;color:${c.color};">${c.icon}</div>
              <div style="flex:1;min-width:0;">
                <div style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary);">${c.name}</div>
                <div style="font-size:var(--font-size-xs);color:var(--text-muted);">${c.code} • ${c.instructor}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:var(--font-size-sm);font-weight:800;color:var(--text-primary);">${c.score}%</div>
                <div style="font-size:var(--font-size-xs);color:var(--text-muted);">${c.grade}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  };
})();
