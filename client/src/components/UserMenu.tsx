import { useState } from "react";
import { User, LogOut, PenSquare, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "./AuthModal";

interface UserMenuProps {
  onCreatePost: () => void;
}

export function UserMenu({ onCreatePost }: UserMenuProps) {
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuth(true)}
          className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-[11px] font-bold hover:bg-primary/90 transition-colors"
          data-testid="login-button"
        >
          登入
        </button>
        <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-muted/50 transition-colors"
        data-testid="user-menu-button"
      >
        <span className="text-lg">{user.avatar}</span>
        <span className="text-xs font-bold text-foreground max-w-[60px] truncate hidden sm:block">
          {user.displayName}
        </span>
        <ChevronDown className="w-3 h-3 text-muted-foreground" />
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-card border border-border rounded-lg shadow-lg py-1">
            <Link href={`/profile/${user.id}`}>
              <button
                onClick={() => setShowDropdown(false)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
                data-testid="menu-profile"
              >
                <User className="w-4 h-4" />
                我的檔案
              </button>
            </Link>
            <button
              onClick={() => { setShowDropdown(false); onCreatePost(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
              data-testid="menu-create-post"
            >
              <PenSquare className="w-4 h-4" />
              發帖
            </button>
            <div className="border-t border-border my-1" />
            <button
              onClick={() => { setShowDropdown(false); logout(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              data-testid="menu-logout"
            >
              <LogOut className="w-4 h-4" />
              登出
            </button>
          </div>
        </>
      )}
    </div>
  );
}
