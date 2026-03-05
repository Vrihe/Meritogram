// SPA Hash Router
(function () {
  const routes = {
    '#/':          () => renderDashboard(),
    '#/courses':   () => renderCourses(),
    '#/schedule':  () => renderSchedule(),
    '#/settings':  () => renderSettings(),
    '#/ai-tools':  () => renderAITools(),
    '#/github':    () => renderGitHub(),
    '#/analytics': () => renderAnalytics(),
    '#/profile':   () => renderProfile(),
  };

  const pageTitles = {
    '#/':          'Dashboard',
    '#/courses':   'Courses',
    '#/schedule':  'Schedule',
    '#/settings':  'Settings',
    '#/ai-tools':  'AI Tools',
    '#/github':    'GitHub',
    '#/analytics': 'Analytics',
    '#/profile':   'Profile',
  };

  window.navigate = function (hash) {
    window.location.hash = hash;
  };

  function handleRoute() {
    const hash = window.location.hash || '#/';
    const render = routes[hash] || routes['#/'];
    const content = document.getElementById('page-content');
    content.innerHTML = '';
    content.className = 'page-enter';
    render();
    updateActiveNavItem(hash);
    updateTopbarTitle(pageTitles[hash] || 'Dashboard');
  }

  window.addEventListener('hashchange', handleRoute);

  // Init
  window.addEventListener('DOMContentLoaded', async () => {
    await renderSidebar();
    await renderTopbar();
    handleRoute();
    updateThemeIcons();
  });
})();
