// Settings Page – Dynamic (MongoDB)
(function () {
  let cachedSettings = null;

  function makeToggle(isOn, path) {
    return `<div class="toggle-track ${isOn ? 'on' : ''}" onclick="toggleSettingBool('${path}', ${!isOn})">
      <div class="toggle-thumb"></div>
    </div>`;
  }

  window.toggleSettingBool = async function (path, value) {
    await window.electronAPI.updateSettings(path, value);
    if (path === 'app_settings.dark_mode') {
      if (value) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      localStorage.setItem('eduai-theme', value ? 'dark' : 'light');
      updateThemeIcons();
    }
    cachedSettings = await window.electronAPI.getSettings();
    renderSettingsHTML();
  };

  window.saveProfileField = async function (field, inputId) {
    const val = document.getElementById(inputId)?.value;
    if (val !== undefined) {
      await window.electronAPI.updateSettings('profile.' + field, val);
      cachedSettings = await window.electronAPI.getSettings();
    }
  };

  function renderSettingsHTML() {
    const page = document.getElementById('page-content');
    const s = cachedSettings;
    if (!s) return;

    const isDark = s.app_settings.dark_mode;
    const initials = s.profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase();

    page.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-5);">
        <div>
          <div style="font-size:1.05rem;font-weight:600;color:var(--text-primary);">Settings</div>
          <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Manage your preferences</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:240px 1fr;gap:var(--space-5);">
        <!-- Settings Nav -->
        <div class="card stagger-1" style="height:fit-content;">
          <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-1);">
            <button class="nav-item active" style="color:var(--color-indigo-600);background:var(--color-indigo-50);">
              <span class="nav-item-icon">👤</span><span>Profile</span>
            </button>
            <button class="nav-item">
              <span class="nav-item-icon">🎓</span><span>Academic</span>
            </button>
            <button class="nav-item">
              <span class="nav-item-icon">🔔</span><span>Notifications</span>
            </button>
            <button class="nav-item">
              <span class="nav-item-icon">🔒</span><span>Security</span>
            </button>
            <button class="nav-item">
              <span class="nav-item-icon">🎨</span><span>Appearance</span>
            </button>
          </div>
        </div>

        <!-- Settings Content -->
        <div style="display:flex;flex-direction:column;gap:var(--space-5);">
          <!-- Profile Section -->
          <div class="card stagger-2">
            <div class="card-header">
              <div class="card-icon" style="background:rgba(99,102,241,0.1);color:#6366f1;">👤</div>
              <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary);">Profile Information</div>
            </div>
            <div class="card-body">
              <div style="display:flex;align-items:center;gap:var(--space-5);margin-bottom:var(--space-5);">
                <div style="width:72px;height:72px;border-radius:var(--radius-full);background:linear-gradient(135deg,var(--color-indigo-400),var(--color-purple-500));display:flex;align-items:center;justify-content:center;color:white;font-size:1.5rem;font-weight:800;">${initials}</div>
                <div>
                  <div style="font-size:var(--font-size-lg);font-weight:700;color:var(--text-primary);">${s.profile.full_name}</div>
                  <div style="font-size:var(--font-size-sm);color:var(--text-muted);">${s.profile.email}</div>
                  <div style="font-size:var(--font-size-xs);color:var(--text-subtle);margin-top:4px;">${s.profile.major} • ${s.academic.year} • ID: ${s.profile.student_id}</div>
                </div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
                <div class="form-group">
                  <label class="form-label">Full Name</label>
                  <input class="form-input" id="inp-name" type="text" value="${s.profile.full_name}" />
                </div>
                <div class="form-group">
                  <label class="form-label">Email</label>
                  <input class="form-input" id="inp-email" type="email" value="${s.profile.email}" />
                </div>
                <div class="form-group">
                  <label class="form-label">Student ID</label>
                  <input class="form-input" id="inp-sid" type="text" value="${s.profile.student_id}" />
                </div>
                <div class="form-group">
                  <label class="form-label">Major</label>
                  <input class="form-input" id="inp-major" type="text" value="${s.profile.major}" />
                </div>
              </div>
              <div style="margin-top:var(--space-4);display:flex;justify-content:flex-end;">
                <button class="btn-primary" onclick="(async()=>{await saveProfileField('full_name','inp-name');await saveProfileField('email','inp-email');await saveProfileField('student_id','inp-sid');await saveProfileField('major','inp-major');renderSettings();})()">Save Changes</button>
              </div>
            </div>
          </div>

          <!-- Academic Section -->
          <div class="card stagger-3">
            <div class="card-header">
              <div class="card-icon" style="background:rgba(16,185,129,0.1);color:#10b981;">🎓</div>
              <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary);">Academic</div>
            </div>
            <div class="card-body">
              <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3) 0;border-bottom:1px solid var(--border-subtle);">
                <div>
                  <div style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary);">Academic Year</div>
                  <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Current year of study</div>
                </div>
                <span style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);">${s.academic.year}</span>
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3) 0;border-bottom:1px solid var(--border-subtle);">
                <div>
                  <div style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary);">GPA Target</div>
                  <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Your semester GPA goal</div>
                </div>
                <span style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);">${s.academic.gpa_target}</span>
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3) 0;">
                <div>
                  <div style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary);">Attendance</div>
                  <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Overall attendance percentage</div>
                </div>
                <span style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);">${s.academic.attendance_pct}%</span>
              </div>
            </div>
          </div>

          <!-- Theme Section -->
          <div class="card stagger-4">
            <div class="card-header">
              <div class="card-icon" style="background:rgba(139,92,246,0.1);color:#8b5cf6;">🎨</div>
              <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary);">Appearance</div>
            </div>
            <div class="card-body">
              <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3) 0;border-bottom:1px solid var(--border-subtle);">
                <div>
                  <div style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary);">Dark Mode</div>
                  <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Toggle dark/light theme</div>
                </div>
                ${makeToggle(isDark, 'app_settings.dark_mode')}
              </div>
            </div>
          </div>

          <!-- Notifications Section -->
          <div class="card stagger-5">
            <div class="card-header">
              <div class="card-icon" style="background:rgba(245,158,11,0.1);color:#f59e0b;">🔔</div>
              <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary);">Notifications</div>
            </div>
            <div class="card-body">
              <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3) 0;border-bottom:1px solid var(--border-subtle);">
                <div>
                  <div style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary);">Email Notifications</div>
                  <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Receive updates via email</div>
                </div>
                ${makeToggle(s.notifications.email_notifications, 'notifications.email_notifications')}
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3) 0;border-bottom:1px solid var(--border-subtle);">
                <div>
                  <div style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary);">Push Notifications</div>
                  <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Browser and desktop alerts</div>
                </div>
                ${makeToggle(s.notifications.push_notifications, 'notifications.push_notifications')}
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3) 0;border-bottom:1px solid var(--border-subtle);">
                <div>
                  <div style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary);">Grade Updates</div>
                  <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Notify when grades are posted</div>
                </div>
                ${makeToggle(s.notifications.grade_updates, 'notifications.grade_updates')}
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3) 0;">
                <div>
                  <div style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary);">Assignment Reminders</div>
                  <div style="font-size:var(--font-size-xs);color:var(--text-muted);">24h before due date</div>
                </div>
                ${makeToggle(s.notifications.assignment_reminders, 'notifications.assignment_reminders')}
              </div>
            </div>
          </div>

          <!-- Security Section -->
          <div class="card stagger-6">
            <div class="card-header">
              <div class="card-icon" style="background:rgba(239,68,68,0.1);color:#ef4444;">🔒</div>
              <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary);">Security</div>
            </div>
            <div class="card-body">
              <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3) 0;border-bottom:1px solid var(--border-subtle);">
                <div>
                  <div style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary);">Two-Factor Authentication</div>
                  <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Extra layer of account security</div>
                </div>
                ${makeToggle(s.security.two_factor_enabled, 'security.two_factor_enabled')}
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3) 0;">
                <div>
                  <div style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary);">Active Sessions</div>
                  <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Currently active login sessions</div>
                </div>
                <span style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);">${s.security.active_sessions.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  window.renderSettings = async function () {
    const page = document.getElementById('page-content');
    page.innerHTML = '<div style="display:flex;justify-content:center;padding:var(--space-8);"><div class="shimmer" style="width:60px;height:60px;border-radius:var(--radius-full);"></div></div>';

    try {
      cachedSettings = await window.electronAPI.getSettings();
    } catch (err) {
      page.innerHTML = '<div class="card" style="padding:var(--space-6);text-align:center;color:var(--color-red-500);">Failed to load settings. Is MongoDB running?</div>';
      return;
    }

    renderSettingsHTML();
  };
})();
