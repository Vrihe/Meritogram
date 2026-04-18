import { useState } from "react";
import { Github, GitBranch, Star, GitPullRequest, Calendar, ExternalLink, AlertCircle } from "lucide-react";

// Generate mock contribution data for the past 365 days
const contributions: any[] = [];

const repos = [
  { name: "student-portal", language: "TypeScript", stars: 23, lastCommit: "2 hours ago", url: "#" },
  { name: "ml-algorithms", language: "Python", stars: 45, lastCommit: "1 day ago", url: "#" },
  { name: "data-structures", language: "Java", stars: 12, lastCommit: "3 days ago", url: "#" },
  { name: "web-portfolio", language: "React", stars: 8, lastCommit: "1 week ago", url: "#" },
];

const recentActivity = [
  { type: "commit", repo: "student-portal", message: "Fix navigation routing", time: "2 hours ago" },
  { type: "pr", repo: "ml-algorithms", message: "Add gradient descent optimization", time: "5 hours ago" },
  { type: "commit", repo: "data-structures", message: "Implement AVL tree", time: "1 day ago" },
  { type: "star", repo: "tensorflow/tensorflow", message: "Starred repository", time: "2 days ago" },
];

export function GitHubPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalContributions = contributions.reduce((sum, day) => sum + day.count, 0);

  const getLevelColor = (level: number) => {
    if (level === 0) return "bg-neutral-200 dark:bg-neutral-800";
    if (level === 1) return "bg-neutral-400 dark:bg-neutral-700";
    if (level === 2) return "bg-neutral-500 dark:bg-neutral-600";
    if (level === 3) return "bg-neutral-600 dark:bg-neutral-500";
    return "bg-neutral-700 dark:bg-neutral-400";
  };

  const handleConnect = async () => {
    setLoading(true);
    setError("");
    try {
      // GitHub OAuth flow
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || "your-client-id";
      const redirectUri = `${window.location.origin}/github-callback`;
      const scope = "user:email repo";

      const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
      window.location.href = authUrl;
    } catch (err) {
      setError("Failed to connect GitHub");
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch("/api/github/disconnect", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setIsConnected(false);
      setUsername("");
    } catch (err) {
      setError("Failed to disconnect GitHub");
    }
  };

  // Group contributions by week
  const weeks = [];
  for (let i = 0; i < contributions.length; i += 7) {
    weeks.push(contributions.slice(i, i + 7));
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Github className="w-8 h-8 text-neutral-700 dark:text-neutral-300" />
          <div>
            <h2 className="text-neutral-900 dark:text-white mb-1">GitHub Integration</h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              {isConnected ? `Connected as @${username}` : "Connect your GitHub account"}
            </p>
          </div>
        </div>
        <button
          onClick={isConnected ? handleDisconnect : handleConnect}
          disabled={loading}
          className="px-4 py-2 bg-neutral-900 dark:bg-neutral-700 text-white hover:bg-neutral-800 dark:hover:bg-neutral-600 disabled:opacity-50 transition"
        >
          {loading ? "Connecting..." : isConnected ? "Disconnect" : "Connect GitHub"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </div>
      )}

      {isConnected ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-card border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-neutral-500" />
                <p className="text-xs text-neutral-600 dark:text-neutral-400">Total Contributions</p>
              </div>
              <p className="text-2xl text-neutral-900 dark:text-white">{totalContributions}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">Last year</p>
            </div>
            <div className="bg-card border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="w-4 h-4 text-neutral-500" />
                <p className="text-xs text-neutral-600 dark:text-neutral-400">Repositories</p>
              </div>
              <p className="text-2xl text-neutral-900 dark:text-white">{repos.length}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">Public repos</p>
            </div>
            <div className="bg-card border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-neutral-500" />
                <p className="text-xs text-neutral-600 dark:text-neutral-400">Total Stars</p>
              </div>
              <p className="text-2xl text-neutral-900 dark:text-white">
                {repos.reduce((sum, r) => sum + r.stars, 0)}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">Across all repos</p>
            </div>
            <div className="bg-card border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <GitPullRequest className="w-4 h-4 text-neutral-500" />
                <p className="text-xs text-neutral-600 dark:text-neutral-400">Pull Requests</p>
              </div>
              <p className="text-2xl text-neutral-900 dark:text-white">12</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">This month</p>
            </div>
          </div>

          {/* Contribution Heatmap */}
          <div className="bg-card border-border p-6 mb-6">
            <h3 className="text-neutral-900 dark:text-white mb-4">Contribution Activity</h3>
            <div className="overflow-x-auto">
              <div className="inline-flex gap-1">
                {weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-1">
                    {week.map((day, dayIdx) => (
                      <div
                        key={dayIdx}
                        className={`w-3 h-3 ${getLevelColor(day.level)} hover:ring-2 hover:ring-neutral-400 transition cursor-pointer`}
                        title={`${day.date}: ${day.count} contributions`}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs text-neutral-600 dark:text-neutral-400">
                <span>Less</span>
                {[0, 1, 2, 3, 4].map(level => (
                  <div key={level} className={`w-3 h-3 ${getLevelColor(level)}`} />
                ))}
                <span>More</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Repositories */}
            <div className="bg-card border-border p-5">
              <h3 className="text-neutral-900 dark:text-white mb-4">Top Repositories</h3>
              <div className="space-y-3">
                {repos.map((repo, idx) => (
                  <div key={idx} className="p-3 border border-border hover:border-neutral-300 dark:hover:border-neutral-700 transition">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Github className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                        <span className="text-sm text-neutral-900 dark:text-white">{repo.name}</span>
                      </div>
                      <a href={repo.url} className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-neutral-600 rounded-full"></div>
                        {repo.language}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {repo.stars}
                      </span>
                      <span>Updated {repo.lastCommit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-card border-border p-5">
              <h3 className="text-neutral-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                      {activity.type === "commit" && <GitBranch className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />}
                      {activity.type === "pr" && <GitPullRequest className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />}
                      {activity.type === "star" && <Star className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-neutral-900 dark:text-white">{activity.message}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-0.5">
                        {activity.repo} · {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-card border-border p-12 text-center">
          <Github className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-neutral-900 dark:text-white mb-2">Connect Your GitHub Account</h3>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-6">
            Link your GitHub account to view your contribution activity, repositories, and more.
          </p>
          <button
            onClick={handleConnect}
            disabled={loading}
            className="px-6 py-2.5 bg-neutral-900 dark:bg-neutral-700 text-white hover:bg-neutral-800 dark:hover:bg-neutral-600 disabled:opacity-50 transition"
          >
            {loading ? "Connecting..." : "Connect GitHub"}
          </button>
        </div>
      )}
    </div>
  );
}

