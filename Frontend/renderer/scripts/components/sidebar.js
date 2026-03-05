// Sidebar Component – Dynamic (MongoDB)
(function () {
  const navItems = [
    {
      section: 'Main Menu',
      items: [
        { icon: '📊', label: 'Dashboard', hash: '#/' },
        { icon: '📚', label: 'Courses', hash: '#/courses' },
        { icon: '📅', label: 'Schedule', hash: '#/schedule' },
        { icon: '📈', label: 'Analytics', hash: '#/analytics' },
        { icon: '👤', label: 'Profile', hash: '#/profile' },
        { icon: '⚙️', label: 'Settings', hash: '#/settings' },
      ]
    },
    {
      section: 'AI & Integrations',
      items: [
        { icon: '🤖', label: 'AI Tools', hash: '#/ai-tools', badge: 'AI' },
        { icon: '🐙', label: 'GitHub', hash: '#/github' },
      ]
    }
  ];

  window.renderSidebar = async function () {
    const sidebar = document.getElementById('sidebar');
    const currentHash = window.location.hash || '#/';

    let userName = 'Alex Johnson';
    let userMajor = 'Computer Science';
    let initials = 'AJ';
    try {
      const settings = await window.electronAPI.getSettings();
      if (settings?.profile) {
        userName = settings.profile.full_name || userName;
        userMajor = settings.profile.major || userMajor;
        initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
      }
    } catch (e) {}

    sidebar.innerHTML = `
      <div class="sidebar-logo">
        <div class="logo-icon">🎓</div>
        <div class="logo-text">
          EduAI
          <span>Learning Platform</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        ${navItems.map(section => `
          <div class="nav-section">
            <div class="nav-section-label">${section.section}</div>
            ${section.items.map(item => `
              <a class="nav-item ${currentHash === item.hash ? 'active' : ''}" data-hash="${item.hash}" onclick="navigate('${item.hash}')">
                <span class="nav-item-icon">${item.icon}</span>
                <span class="nav-item-label">${item.label}</span>
                ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
              </a>
            `).join('')}
          </div>
        `).join('')}
      </nav>

      <div class="sidebar-footer">
        <button class="sidebar-toggle-btn" onclick="toggleTheme()">
          <span class="nav-item-icon">
            <span class="theme-icon-moon">🌙</span>
            <span class="theme-icon-sun">☀️</span>
          </span>
          <span class="nav-item-label">Toggle Theme</span>
        </button>

        <div class="sidebar-user">
          <div class="sidebar-user-avatar">${initials}</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">${userName}</div>
            <div class="sidebar-user-role">${userMajor}</div>
          </div>
        </div>
      </div>
    `;
  };

  window.updateActiveNavItem = function (hash) {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.hash === hash);
    });
  };
})();
