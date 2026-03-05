// Topbar Component – Dynamic (MongoDB)
(function () {
  let notifOpen = false;
  let notifData = [];

  window.renderTopbar = async function () {
    const topbar = document.getElementById('topbar');
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    try {
      notifData = await window.electronAPI.getNotifications();
    } catch (e) {
      notifData = [];
    }
    const unreadCount = notifData.filter(n => n.unread).length;

    let initials = 'AJ';
    try {
      const settings = await window.electronAPI.getSettings();
      if (settings?.profile?.full_name) {
        initials = settings.profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
      }
    } catch (e) {}

    topbar.innerHTML = `
      <div class="topbar-left">
        <div>
          <div class="topbar-title" id="topbar-title">Dashboard</div>
          <div class="topbar-date">${dateStr}</div>
        </div>
      </div>

      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input type="text" placeholder="Search courses, assignments..." />
      </div>

      <div class="topbar-right">
        <div style="position:relative;">
          <button class="icon-btn" id="notif-btn" onclick="toggleNotifications()">
            🔔
            <span class="notif-badge">${unreadCount}</span>
          </button>
          <div class="notif-dropdown" id="notif-dropdown" style="display:none;">
            <div class="notif-header">
              <span style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);">Notifications</span>
              <button style="background:none;border:none;color:var(--color-indigo-500);font-size:var(--font-size-xs);font-weight:600;cursor:pointer;" onclick="markAllRead()">Mark all read</button>
            </div>
            <div class="notif-list">
              ${notifData.map(n => `
                <div class="notif-item ${n.unread ? 'unread' : ''}">
                  <div class="notif-dot ${n.unread ? 'unread' : 'read'}"></div>
                  <div style="flex:1;min-width:0;">
                    <div style="font-size:var(--font-size-xs);color:var(--text-primary);line-height:1.5;">${n.text}</div>
                    <div style="font-size:var(--font-size-xs);color:var(--text-subtle);margin-top:2px;">${n.time}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <button class="icon-btn" onclick="toggleTheme()">
          <span class="theme-icon-moon">🌙</span>
          <span class="theme-icon-sun" style="display:none;">☀️</span>
        </button>

        <div class="avatar-circle">${initials}</div>
      </div>
    `;
  };

  window.updateTopbarTitle = function (title) {
    const el = document.getElementById('topbar-title');
    if (el) el.textContent = title;
  };

  window.toggleNotifications = function () {
    notifOpen = !notifOpen;
    const dd = document.getElementById('notif-dropdown');
    if (dd) dd.style.display = notifOpen ? 'block' : 'none';
  };

  window.markAllRead = async function () {
    try {
      await window.electronAPI.markNotificationsRead();
    } catch (e) {}
    document.querySelectorAll('.notif-item').forEach(el => el.classList.remove('unread'));
    document.querySelectorAll('.notif-dot').forEach(el => { el.classList.remove('unread'); el.classList.add('read'); });
    const badge = document.querySelector('.notif-badge');
    if (badge) badge.textContent = '0';
  };

  document.addEventListener('click', (e) => {
    if (notifOpen && !e.target.closest('#notif-btn') && !e.target.closest('#notif-dropdown')) {
      notifOpen = false;
      const dd = document.getElementById('notif-dropdown');
      if (dd) dd.style.display = 'none';
    }
  });
})();
