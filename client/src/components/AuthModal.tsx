import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";

const AVATARS = ["😎", "🤓", "🐱", "🐶", "🦊", "🐼", "🦁", "🐻", "🐰", "🐨", "🐸", "🐵", "🎭", "🤖", "👻", "🔥", "💀", "👽", "🦄", "🐲"];

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const { login, register, isLoading } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState("😎");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "login") {
        await login(username);
      } else {
        await register(username, displayName || username, avatar);
      }
      onClose();
      setUsername("");
      setDisplayName("");
      setAvatar("😎");
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("409")) setError("用戶名已被使用");
      else if (msg.includes("404")) setError("搵唔到呢個用戶");
      else setError("出咗問題，再試一次");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[380px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground text-center text-lg font-black">
            {mode === "login" ? "登入吹水台" : "註冊新帳號"}
          </DialogTitle>
        </DialogHeader>

        {/* Mode tabs */}
        <div className="flex border-b border-border mb-4">
          <button
            onClick={() => { setMode("login"); setError(""); }}
            className={`flex-1 py-2 text-sm font-bold transition-colors ${mode === "login" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
            data-testid="auth-tab-login"
          >
            登入
          </button>
          <button
            onClick={() => { setMode("register"); setError(""); }}
            className={`flex-1 py-2 text-sm font-bold transition-colors ${mode === "register" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
            data-testid="auth-tab-register"
          >
            註冊
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">用戶名</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="輸入用戶名..."
              className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              required
              minLength={2}
              maxLength={20}
              data-testid="auth-username"
            />
          </div>

          {mode === "register" && (
            <>
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">顯示名稱</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="你嘅暱稱..."
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  maxLength={20}
                  data-testid="auth-displayname"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">選擇頭像</label>
                <div className="grid grid-cols-10 gap-1">
                  {AVATARS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAvatar(emoji)}
                      className={`w-8 h-8 rounded text-lg flex items-center justify-center transition-all ${
                        avatar === emoji
                          ? "bg-primary/20 ring-2 ring-primary scale-110"
                          : "hover:bg-muted"
                      }`}
                      data-testid={`avatar-${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {error && (
            <p className="text-xs text-red-500 font-bold" data-testid="auth-error">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading || !username.trim()}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold disabled:opacity-40 hover:bg-primary/90 transition-colors"
            data-testid="auth-submit"
          >
            {isLoading ? "處理中..." : mode === "login" ? "登入" : "註冊"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
