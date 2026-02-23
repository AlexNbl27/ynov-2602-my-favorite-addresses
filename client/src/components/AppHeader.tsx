import { useAuth } from "@/contexts/AuthContext";
import { LogOut, MapPin, User } from "lucide-react";

export function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center">
            <img src="/logo.svg" alt="My Favorite Addresses Logo" className="h-9 w-9" />
          </div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-[#4285F4] to-[#34A853] bg-clip-text text-transparent">
            MFA
          </h1>
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
            <button
              onClick={logout}
              className="flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
