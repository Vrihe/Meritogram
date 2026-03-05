// Courses Page – Dynamic (MongoDB)
(function () {
  let expandedCourse = null;
  let coursesData = [];
  let assignmentsData = {};

  function statusBadge(status) {
    const map = {
      submitted: { cls: 'status-active',  label: 'Submitted' },
      pending:   { cls: 'status-review',  label: 'Pending' },
      'in-progress': { cls: 'status-review', label: 'In Progress' },
      upcoming:  { cls: 'status-idle',    label: 'Upcoming' },
    };
    const s = map[status] || map.upcoming;
    return `<span class="status-badge ${s.cls}">${s.label}</span>`;
  }

  function gradeColor(grade) {
    if (grade.startsWith('A')) return { bg: '#d1fae5', text: '#065f46' };
    if (grade.startsWith('B')) return { bg: '#e0e7ff', text: '#3730a3' };
    if (grade.startsWith('C')) return { bg: '#fef3c7', text: '#92400e' };
    return { bg: '#fee2e2', text: '#b91c1c' };
  }

  function formatScore(a) {
    if (a.score !== null && a.score !== undefined) return a.score + '/' + a.max_score;
    return '-';
  }

  function formatDue(d) {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function renderCoursesHTML() {
    const page = document.getElementById('page-content');

    page.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-5);">
        <div>
          <div style="font-size:1.05rem;font-weight:600;color:var(--text-primary);">My Courses</div>
          <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Spring 2026 • ${coursesData.length} courses enrolled</div>
        </div>
        <button class="btn-primary" style="display:flex;align-items:center;gap:6px;">📚 Browse Catalog</button>
      </div>

      <div style="display:flex;flex-direction:column;gap:var(--space-4);">
        ${coursesData.map((c, i) => {
          const gc = gradeColor(c.grade);
          const isExpanded = expandedCourse === i;
          const courseAssignments = assignmentsData[c._id] || [];
          return `
            <div class="card stagger-${i + 1}">
              <div style="padding:var(--space-4) var(--space-5);display:flex;align-items:center;gap:var(--space-4);cursor:pointer;" onclick="toggleCourseExpand(${i})">
                <div class="course-icon-chip" style="background:${c.color}20;color:${c.color};width:44px;height:44px;font-size:20px;">${c.icon}</div>
                <div style="flex:1;min-width:0;">
                  <div style="display:flex;align-items:center;gap:var(--space-3);">
                    <div style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);">${c.name}</div>
                    <span class="grade-badge" style="background:${gc.bg};color:${gc.text};">${c.grade}</span>
                  </div>
                  <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-top:2px;">${c.code} • ${c.instructor} • ${c.credits} credits</div>
                </div>
                <div style="text-align:right;">
                  <div style="font-size:1.1rem;font-weight:800;color:var(--text-primary);">${c.score}%</div>
                  <div style="font-size:var(--font-size-xs);color:var(--text-muted);">${c.schedule}</div>
                </div>
                <div style="color:var(--text-subtle);font-size:16px;transition:transform var(--transition-fast);transform:rotate(${isExpanded ? 180 : 0}deg);">▼</div>
              </div>

              ${isExpanded ? `
                <div style="border-top:1px solid var(--border-color);padding:var(--space-4) var(--space-5);animation:slideUp 0.2s ease;">
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);margin-bottom:var(--space-4);">
                    <div>
                      <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-bottom:var(--space-2);">Description</div>
                      <div style="font-size:var(--font-size-sm);color:var(--text-secondary);">${c.description}</div>
                    </div>
                    <div>
                      <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-bottom:var(--space-2);">Room</div>
                      <div style="font-size:var(--font-size-sm);color:var(--text-secondary);">${c.room}</div>
                      <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-top:var(--space-3);margin-bottom:var(--space-2);">Progress</div>
                      <div class="progress-bar-track">
                        <div class="progress-bar-fill" style="width:${c.progress}%;background:${c.color};"></div>
                      </div>
                      <div style="font-size:var(--font-size-xs);color:var(--text-subtle);margin-top:4px;">${c.progress}% complete</div>
                    </div>
                  </div>

                  <div style="font-size:var(--font-size-xs);font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:var(--space-3);">Assignments</div>
                  <div style="display:flex;flex-direction:column;gap:var(--space-2);">
                    ${courseAssignments.map(a => `
                      <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2) var(--space-3);border-radius:var(--radius-md);background:var(--bg-elevated);">
                        <div style="flex:1;font-size:var(--font-size-sm);color:var(--text-primary);">${a.name}</div>
                        <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Due: ${formatDue(a.due)}</div>
                        ${statusBadge(a.status)}
                        <div style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary);min-width:60px;text-align:right;">${formatScore(a)}</div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  window.renderCourses = async function () {
    const page = document.getElementById('page-content');
    page.innerHTML = '<div style="display:flex;justify-content:center;padding:var(--space-8);"><div class="shimmer" style="width:60px;height:60px;border-radius:var(--radius-full);"></div></div>';

    try {
      const [courses, assignments] = await Promise.all([
        window.electronAPI.getCourses(),
        window.electronAPI.getAssignments(),
      ]);
      coursesData = courses;
      assignmentsData = {};
      assignments.forEach(a => {
        if (!assignmentsData[a.course_id]) assignmentsData[a.course_id] = [];
        assignmentsData[a.course_id].push(a);
      });
    } catch (err) {
      page.innerHTML = '<div class="card" style="padding:var(--space-6);text-align:center;color:var(--color-red-500);">Failed to load courses. Is MongoDB running?</div>';
      return;
    }

    renderCoursesHTML();
  };

  window.toggleCourseExpand = function (index) {
    expandedCourse = expandedCourse === index ? null : index;
    renderCoursesHTML();
  };
})();
