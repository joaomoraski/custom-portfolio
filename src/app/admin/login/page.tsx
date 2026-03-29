"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/admin");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl dark:bg-white/5 bg-white dark:border-white/10 border-gray-200 border dark:text-white text-gray-900 dark:placeholder-white/30 placeholder-gray-400 focus:outline-none dark:focus:border-purple-500/50 focus:border-purple-400 focus:ring-1 dark:focus:ring-purple-500/30 focus:ring-purple-400/30 transition-all duration-200 text-sm";

  return (
    <div className="fixed inset-0 dark:bg-gradient-to-br dark:from-black dark:via-purple-950 dark:to-blue-950 bg-gradient-to-br from-white via-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl dark:bg-purple-500/10 bg-purple-100 dark:border dark:border-purple-500/20 border border-purple-200 mb-4">
            <Lock size={24} className="dark:text-purple-400 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold dark:text-white text-gray-900">Admin Login</h1>
          <p className="dark:text-white/50 text-gray-500 text-sm mt-1">Sign in to manage your portfolio</p>
        </div>

        <GlassCard className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium dark:text-white/60 text-gray-600 mb-1.5">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium dark:text-white/60 text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-white/40 text-gray-400 dark:hover:text-white/70 hover:text-gray-600 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 dark:bg-red-500/10 bg-red-50 dark:border dark:border-red-500/20 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <NeonButton type="submit" variant="purple" className="w-full justify-center" size="lg" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </NeonButton>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
