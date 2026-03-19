import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, GraduationCap, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-slate-900 dark:text-white mb-2">Welcome Back</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Sign in to access your student portal
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card border border-border p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            {/* Email Field */}
            <div>
              <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-border text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-border text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-slate-300 dark:border-slate-600"
                />
                <span className="text-slate-600 dark:text-slate-400">Remember me</span>
              </label>
              <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-card text-slate-500 dark:text-slate-400">
                OR CONTINUE WITH
              </span>
            </div>
          </div>

          {/* SSO Options */}
          <div className="grid grid-cols-2 gap-3">
            <button className="py-2.5 border border-border hover:bg-slate-50 dark:hover:bg-slate-700 transition text-slate-700 dark:text-slate-300 text-sm">
              Google
            </button>
            <button className="py-2.5 border border-border hover:bg-slate-50 dark:hover:bg-slate-700 transition text-slate-700 dark:text-slate-300 text-sm">
              Microsoft
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
            Don't have an account?{" "}
            <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Sign up
            </a>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
