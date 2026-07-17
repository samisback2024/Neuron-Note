import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "motion/react";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useStore } from "../lib/store";
import { googleClientId } from "../lib/config";
import toast from "react-hot-toast";

async function generateNonce(): Promise<[string, string]> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const rawNonce = btoa(String.fromCharCode(...array));
  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(rawNonce),
  );
  const hashedNonce = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return [rawNonce, hashedNonce];
}

export function AuthPage() {
  const {
    session,
    authLoading,
    signIn,
    signUp,
    signInWithGoogleOneTap,
    signInWithGoogleOAuth,
  } = useStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const oneTapInitializedRef = useRef(false);
  const nonceRef = useRef("");

  useEffect(() => {
    if (!googleClientId || session || oneTapInitializedRef.current) return;

    const initializeOneTap = async () => {
      if (!window.google?.accounts?.id || oneTapInitializedRef.current) return;

      const [rawNonce, hashedNonce] = await generateNonce();
      nonceRef.current = rawNonce;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        nonce: hashedNonce,
        use_fedcm_for_prompt: true,
        auto_select: true,
        cancel_on_tap_outside: false,
        context: "signin",
        callback: async (response) => {
          setGoogleLoading(true);
          try {
            const { error } = await signInWithGoogleOneTap(
              response.credential,
              nonceRef.current,
            );
            if (error) toast.error(error);
          } catch {
            toast.error("Google sign-in failed. Please try again.");
          } finally {
            setGoogleLoading(false);
          }
        },
      });

      window.google.accounts.id.prompt();
      oneTapInitializedRef.current = true;
    };

    const existingScript = document.getElementById("google-identity-services");
    if (existingScript) {
      initializeOneTap();
      return () => window.google?.accounts?.id.cancel();
    }

    const script = document.createElement("script");
    script.id = "google-identity-services";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeOneTap;
    document.head.appendChild(script);

    return () => {
      script.onload = null;
      window.google?.accounts?.id.cancel();
    };
  }, [session, signInWithGoogleOneTap]);

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-100 dark:bg-zinc-900">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (session) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, name);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Account created! Check your email to verify.");
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error);
      }
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);

    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt(async (notification) => {
        if (notification.isDismissedMoment()) {
          setGoogleLoading(false);
          return;
        }
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // One Tap couldn't show (blocked cookies, rate-limited, etc.) — fall back to redirect
          const { error } = await signInWithGoogleOAuth();
          if (error) toast.error(error);
          setGoogleLoading(false);
        }
      });
      return;
    }

    const { error } = await signInWithGoogleOAuth();
    if (error) {
      toast.error(error);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-zinc-100 dark:bg-zinc-900">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-violet-600 p-12 flex-col justify-between">
        {/* Decorative depth layer */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-violet-400/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <img src="/favicon.svg" alt="Neuron Note" className="w-10 h-10" />
          <span className="text-2xl font-bold text-white">Neuron Note</span>
        </div>
        <div className="relative">
          <h1 className="text-5xl font-bold text-white leading-tight mb-4">
            Your thinking
            <br />
            workspace
          </h1>
          <p className="text-lg text-white/70 max-w-md">
            Capture ideas, manage tasks, visualize knowledge, and let AI help
            you connect the dots.
          </p>
        </div>
        <div className="relative flex flex-wrap gap-2">
          {["Notes", "Tasks", "Knowledge Graph", "AI Assistant"].map((f) => (
            <span
              key={f}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-white/85 bg-white/10 border border-white/15 backdrop-blur-sm"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Right auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md lg:bg-white lg:dark:bg-zinc-900/60 lg:border lg:border-zinc-200 lg:dark:border-zinc-800 lg:rounded-3xl lg:shadow-xl lg:shadow-zinc-900/5 lg:p-10"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src="/favicon.svg" alt="Neuron Note" className="w-10 h-10" />
            <span className="text-2xl font-bold text-zinc-900 dark:text-white">
              Neuron Note
            </span>
          </div>

          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h2>
          <p className="text-zinc-500 mb-8">
            {isSignUp
              ? "Start building your second brain"
              : "Sign in to your workspace"}
          </p>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full py-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="w-[18px] h-[18px]"
                >
                  <path
                    d="M21.805 10.023H12v3.955h5.6c-.242 1.272-.967 2.35-2.058 3.073v2.548h3.322c1.944-1.79 3.061-4.426 3.061-7.599 0-.66-.059-1.294-.12-1.977Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 22c2.767 0 5.086-.914 6.781-2.401l-3.322-2.548c-.924.624-2.106.993-3.459.993-2.66 0-4.914-1.79-5.72-4.2H2.86v2.628A9.996 9.996 0 0 0 12 22Z"
                    fill="#34A853"
                  />
                  <path
                    d="M6.28 13.844A5.994 5.994 0 0 1 5.96 12c0-.64.115-1.264.32-1.844V7.528H2.86A9.996 9.996 0 0 0 2 12c0 1.612.386 3.138 1.06 4.472l3.22-2.628Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.956c1.507 0 2.86.518 3.925 1.534l2.943-2.943C17.08 2.886 14.76 2 12 2A9.996 9.996 0 0 0 2.86 7.528l3.42 2.628c.806-2.41 3.06-4.2 5.72-4.2Z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {!googleClientId && (
            <p className="mt-2 text-xs text-zinc-500">
              One Tap is not configured, but Google sign-in will still work via
              redirect.
            </p>
          )}

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-zinc-400">
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
            <span>Or continue with email</span>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all text-sm shadow-sm"
                />
              </div>
            )}
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
              />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all text-sm shadow-sm"
              />
            </div>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all text-sm shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isSignUp ? "Create Account" : "Sign In"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-6">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary-500 hover:text-primary-600 font-semibold"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
