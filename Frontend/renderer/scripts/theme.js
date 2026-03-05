// Theme management
(function () {
  const saved = localStorage.getItem('eduai-theme') || 'light';
  document.documentElement.classList.toggle('dark', saved === 'dark');

  window.toggleTheme = function () {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('eduai-theme', isDark ? 'dark' : 'light');
    updateThemeIcons();
  };

  window.updateThemeIcons = function () {
    const isDark = document.documentElement.classList.contains('dark');
    const moonIcons = document.querySelectorAll('.theme-icon-moon');
    const sunIcons = document.querySelectorAll('.theme-icon-sun');
    moonIcons.forEach(el => el.style.display = isDark ? 'none' : 'block');
    sunIcons.forEach(el => el.style.display = isDark ? 'block' : 'none');
  };
})();
