// Schedule Page – Dynamic (MongoDB)
(function () {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const hours = ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  window.renderSchedule = async function () {
    const page = document.getElementById('page-content');
    page.innerHTML = '<div style="display:flex;justify-content:center;padding:var(--space-8);"><div class="shimmer" style="width:60px;height:60px;border-radius:var(--radius-full);"></div></div>';

    let events, assignments;
    try {
      [events, assignments] = await Promise.all([
        window.electronAPI.getScheduleEvents(),
        window.electronAPI.getAssignments(),
      ]);
    } catch (err) {
      page.innerHTML = '<div class="card" style="padding:var(--space-6);text-align:center;color:var(--color-red-500);">Failed to load schedule. Is MongoDB running?</div>';
      return;
    }

    const upcomingDeadlines = assignments
      .filter(a => a.status !== 'submitted')
      .sort((a, b) => new Date(a.due) - new Date(b.due))
      .slice(0, 5)
      .map(a => {
        const dueDate = new Date(a.due);
        const now = new Date();
        const daysUntil = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        return {
          title: a.name,
          course: a.course_id.toUpperCase(),
          date: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          color: '#6366f1',
          urgent: daysUntil <= 3,
        };
      });

    const totalHours = events.reduce((acc, e) => acc + e.duration, 0);
    const dayLoadMap = {};
    events.forEach(e => { dayLoadMap[e.day] = (dayLoadMap[e.day] || 0) + e.duration; });
    const busiestDayIdx = Object.entries(dayLoadMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0;
    const totalSlots = days.length * hours.length;
    const occupiedSlots = events.reduce((acc, e) => acc + Math.ceil(e.duration), 0);
    const freeSlots = totalSlots - occupiedSlots;

    page.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-5);">
        <div>
          <div style="font-size:1.05rem;font-weight:600;color:var(--text-primary);">Weekly Schedule</div>
          <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Spring 2026 • Week 8</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 280px;gap:var(--space-5);">
        <!-- Schedule Grid -->
        <div class="card stagger-1" style="overflow:auto;">
          <div class="card-header">
            <div class="card-icon" style="background:rgba(99,102,241,0.1);color:#6366f1;">📅</div>
            <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary);">Timetable</div>
          </div>
          <div style="padding:var(--space-3);">
            <div class="schedule-grid">
              <div class="schedule-day-header"></div>
              ${days.map(d => `<div class="schedule-day-header">${d}</div>`).join('')}

              ${hours.map((h) => {
                const hourVal = parseInt(h);
                return `
                  <div class="schedule-time-label">${h}</div>
                  ${days.map((d, di) => {
                    const evt = events.find(e => e.day === di && e.start_hour === hourVal);
                    if (evt) {
                      return `
                        <div class="schedule-cell">
                          <div class="schedule-event" style="background:${evt.color}15;color:${evt.color};border-left:3px solid ${evt.color};height:${evt.duration * 56}px;">
                            <div style="font-size:var(--font-size-xs);font-weight:700;">${evt.title}</div>
                            <div style="font-size:0.6rem;opacity:0.8;">${evt.room}</div>
                          </div>
                        </div>
                      `;
                    }
                    const overlapping = events.find(e => e.day === di && e.start_hour < hourVal && e.start_hour + e.duration > hourVal);
                    if (overlapping) return `<div class="schedule-cell"></div>`;
                    return `<div class="schedule-cell"></div>`;
                  }).join('')}
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div style="display:flex;flex-direction:column;gap:var(--space-5);">
          <div class="card stagger-2">
            <div class="card-header">
              <div class="card-icon" style="background:rgba(239,68,68,0.1);color:#ef4444;">🔔</div>
              <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary);">Upcoming Deadlines</div>
            </div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-3);">
              ${upcomingDeadlines.length === 0 ? '<div style="font-size:var(--font-size-sm);color:var(--text-muted);text-align:center;padding:var(--space-4);">No upcoming deadlines</div>' : upcomingDeadlines.map(dl => `
                <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2) var(--space-3);border-radius:var(--radius-md);background:var(--bg-elevated);">
                  <div style="width:4px;height:32px;border-radius:2px;background:${dl.color};flex-shrink:0;"></div>
                  <div style="flex:1;min-width:0;">
                    <div style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary);">${dl.title}</div>
                    <div style="font-size:var(--font-size-xs);color:var(--text-muted);">${dl.course} • ${dl.date}</div>
                  </div>
                  ${dl.urgent ? '<span style="font-size:var(--font-size-xs);color:var(--color-red-500);font-weight:600;">Urgent</span>' : ''}
                </div>
              `).join('')}
            </div>
          </div>

          <div class="card stagger-3">
            <div class="card-header">
              <div class="card-icon" style="background:rgba(16,185,129,0.1);color:#10b981;">📊</div>
              <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary);">Quick Stats</div>
            </div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-3);">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:var(--font-size-sm);color:var(--text-muted);">Total Hours/Week</span>
                <span style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);">${totalHours} hrs</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:var(--font-size-sm);color:var(--text-muted);">Free Slots</span>
                <span style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);">${freeSlots}</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:var(--font-size-sm);color:var(--text-muted);">Busiest Day</span>
                <span style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);">${days[busiestDayIdx] || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  };
})();
