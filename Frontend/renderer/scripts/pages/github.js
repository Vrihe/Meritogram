// GitHub Page – Dynamic (MongoDB)
(function () {
  let selectedRepo = 0;
  let reposData = [];

  function statusLabel(status) {
    const map = {
      active: { cls: 'status-active',  text: '● Active' },
      review: { cls: 'status-review',  text: '◐ In Review' },
      idle:   { cls: 'status-idle',    text: '○ Idle' },
    };
    const s = map[status] || map.idle;
    return `<span class="status-badge ${s.cls}">${s.text}</span>`;
  }

  function renderGitHubHTML() {
    const page = document.getElementById('page-content');
    const repos = reposData;
    const repo = repos[selectedRepo] || repos[0];
    if (!repo) { page.innerHTML = '<div class="card" style="padding:var(--space-6);text-align:center;color:var(--text-muted);">No repositories found.</div>'; return; }

    page.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-5);">
        <div>
          <div style="font-size:1.05rem;font-weight:600;color:var(--text-primary);">GitHub Integration</div>
          <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Your repositories and activity</div>
        </div>
        <div style="display:flex;gap:var(--space-3);">
          <button class="btn-ghost" style="display:flex;align-items:center;gap:6px;">🔄 Sync</button>
          <button class="btn-primary" style="display:flex;align-items:center;gap:6px;">+ New Repo</button>
        </div>
      </div>

      <div class="grid-4 stagger-1" style="margin-bottom:var(--space-5);">
        <div class="card" style="padding:var(--space-4);display:flex;align-items:center;gap:12px;">
          <div class="card-icon" style="background:rgba(99,102,241,0.1);color:#6366f1;">📦</div>
          <div>
            <div style="font-size:1.1rem;font-weight:800;color:var(--text-primary);">${repos.length}</div>
            <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Repositories</div>
          </div>
        </div>
        <div class="card" style="padding:var(--space-4);display:flex;align-items:center;gap:12px;">
          <div class="card-icon" style="background:rgba(16,185,129,0.1);color:#10b981;">📝</div>
          <div>
            <div style="font-size:1.1rem;font-weight:800;color:var(--text-primary);">${repos.reduce((a, r) => a + (r.commits ? r.commits.length : 0), 0)}</div>
            <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Recent Commits</div>
          </div>
        </div>
        <div class="card" style="padding:var(--space-4);display:flex;align-items:center;gap:12px;">
          <div class="card-icon" style="background:rgba(245,158,11,0.1);color:#f59e0b;">⭐</div>
          <div>
            <div style="font-size:1.1rem;font-weight:800;color:var(--text-primary);">${repos.reduce((a, r) => a + r.stars, 0)}</div>
            <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Stars Received</div>
          </div>
        </div>
        <div class="card" style="padding:var(--space-4);display:flex;align-items:center;gap:12px;">
          <div class="card-icon" style="background:rgba(139,92,246,0.1);color:#8b5cf6;">🔀</div>
          <div>
            <div style="font-size:1.1rem;font-weight:800;color:var(--text-primary);">${repos.reduce((a, r) => a + r.forks, 0)}</div>
            <div style="font-size:var(--font-size-xs);color:var(--text-muted);">Forks</div>
          </div>
        </div>
      </div>

      <div class="github-layout">
        <div style="display:flex;flex-direction:column;gap:var(--space-4);">
          ${repos.map((r, i) => `
            <div class="repo-card stagger-${i + 2} ${selectedRepo === i ? 'selected' : ''}">
              <div class="repo-header" onclick="selectRepo(${i})">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-2);">
                  <div style="display:flex;align-items:center;gap:var(--space-2);">
                    <span style="font-size:16px;">📁</span>
                    <span style="font-size:var(--font-size-sm);font-weight:700;color:var(--color-indigo-500);">${r.name}</span>
                  </div>
                  ${statusLabel(r.status)}
                </div>
                <div style="font-size:var(--font-size-xs);color:var(--text-muted);line-height:1.5;margin-bottom:var(--space-3);">${r.desc}</div>
                <div style="display:flex;align-items:center;gap:var(--space-4);">
                  <span style="display:flex;align-items:center;gap:4px;font-size:var(--font-size-xs);color:var(--text-muted);">
                    <span class="lang-dot" style="background:${r.lang_color};"></span>
                    ${r.lang}
                  </span>
                  <span style="font-size:var(--font-size-xs);color:var(--text-muted);">⭐ ${r.stars}</span>
                  <span style="font-size:var(--font-size-xs);color:var(--text-muted);">🔀 ${r.forks}</span>
                </div>
                <div id="activity-bars-${i}" style="margin-top:var(--space-3);"></div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="card stagger-4">
          <div class="card-header" style="justify-content:space-between;">
            <div style="display:flex;align-items:center;gap:var(--space-3);">
              <div class="card-icon" style="background:rgba(99,102,241,0.1);color:#6366f1;">📜</div>
              <div>
                <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary);">Recent Commits</div>
                <div style="font-size:var(--font-size-xs);color:var(--text-muted);">${repo.name}</div>
              </div>
            </div>
            <span style="font-size:var(--font-size-xs);color:var(--text-muted);">${repo.commits ? repo.commits.length : 0} commits</span>
          </div>
          <div class="commit-history">
            ${(repo.commits || []).map(c => `
              <div class="commit-row">
                <span class="commit-sha">${c.sha}</span>
                <div style="flex:1;min-width:0;">
                  <div style="font-size:var(--font-size-sm);color:var(--text-primary);font-weight:500;">${c.msg}</div>
                  <div style="font-size:var(--font-size-xs);color:var(--text-subtle);margin-top:2px;">${c.time}</div>
                </div>
                <div style="display:flex;gap:var(--space-3);flex-shrink:0;">
                  <span class="additions">+${c.additions}</span>
                  <span class="deletions">-${c.deletions}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    repos.forEach((r, i) => {
      const container = document.getElementById(`activity-bars-${i}`);
      if (container && r.activity) renderActivityBars(r.activity, container);
    });
  }

  window.renderGitHub = async function () {
    const page = document.getElementById('page-content');
    page.innerHTML = '<div style="display:flex;justify-content:center;padding:var(--space-8);"><div class="shimmer" style="width:60px;height:60px;border-radius:var(--radius-full);"></div></div>';

    try {
      reposData = await window.electronAPI.getGithubRepos();
    } catch (err) {
      page.innerHTML = '<div class="card" style="padding:var(--space-6);text-align:center;color:var(--color-red-500);">Failed to load GitHub data. Is MongoDB running?</div>';
      return;
    }

    renderGitHubHTML();
  };

  window.selectRepo = function (index) {
    selectedRepo = index;
    renderGitHubHTML();
  };
})();
