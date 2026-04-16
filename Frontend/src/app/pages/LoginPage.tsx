import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, GraduationCap, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              logo_alignment?: "left" | "center";
              width?: string;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export function LoginPage() {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const { login, loginWithGoogle, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleButtonRef.current) {
      return;
    }

    const initGoogle = () => {
      if (!window.google || !googleButtonRef.current) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async ({ credential }) => {
          setGoogleLoading(true);
          setError("");
          try {
            await loginWithGoogle(credential);
            navigate("/");
          } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Google login failed");
          } finally {
            setGoogleLoading(false);
          }
        },
      });

      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: "280",
      });
    };

    const existingScript = document.getElementById("google-identity-script") as HTMLScriptElement | null;
    if (existingScript) {
      if (window.google) {
        initGoogle();
      } else {
        existingScript.addEventListener("load", initGoogle, { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.id = "google-identity-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.head.appendChild(script);
  }, [loginWithGoogle, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignUpMode) {
        await register({
          email,
          password,
          full_name: fullName,
        });
      } else {
        await login(email, password);
      }
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : isSignUpMode ? "Sign up failed" : "Login failed");
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
          <h1 className="text-slate-900 dark:text-white mb-2">
            {isSignUpMode ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {isSignUpMode ? "Sign up to start using your student portal" : "Sign in to access your student portal"}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            {isSignUpMode && (
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-border text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500"
                  required={isSignUpMode}
                />
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

            {!isSignUpMode && (
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
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? (isSignUpMode ? "Creating account..." : "Signing in...") : (isSignUpMode ? "Sign Up" : "Sign In")}
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
          <div className="flex flex-col items-center gap-2">
            {GOOGLE_CLIENT_ID ? (
              <div ref={googleButtonRef} className="w-full flex justify-center" />
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Google login is unavailable: set VITE_GOOGLE_CLIENT_ID in environment.
              </p>
            )}
            {googleLoading && (
              <p className="text-xs text-slate-500 dark:text-slate-400">Signing in with Google...</p>
            )}
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
            {isSignUpMode ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignUpMode((prev) => !prev);
                setError("");
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {isSignUpMode ? "Sign in" : "Sign up"}
            </button>
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
