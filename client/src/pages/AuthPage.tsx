import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, Mail, Lock, ArrowRight, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function AuthPage() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success("Connexion réussie !");
      } else {
        await register(email, password);
        toast.success("Compte créé avec succès !");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <img src="/logo.svg" alt="My Favorite Addresses Logo" className="h-16 w-16" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            My Favorite Addresses
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sauvegardez et retrouvez vos adresses préférées
          </p>
        </div>

        {/* Card */}
        <div className="m3-card p-6 sm:p-8">
          {/* Toggle */}
          <div className="mb-6 flex rounded-2xl bg-secondary p-1">
            <button
              data-testid="tab-login"
              onClick={() => setIsLogin(true)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all ${isLogin
                ? "bg-card text-foreground m3-elevation-1"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Connexion
            </button>
            <button
              data-testid="tab-register"
              onClick={() => setIsLogin(false)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all ${!isLogin
                ? "bg-card text-foreground m3-elevation-1"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Inscription
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  data-testid="input-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="h-12 w-full rounded-2xl border border-border bg-surface-container pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  data-testid="input-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 w-full rounded-2xl border border-border bg-surface-container pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <button
              data-testid="button-submit"
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50 m3-elevation-1"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              ) : isLogin ? (
                <>
                  Se connecter
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Créer un compte
                  <UserPlus className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
