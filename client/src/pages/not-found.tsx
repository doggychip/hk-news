import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-black text-primary mb-4 neon-text-pink">404</h1>
        <p className="text-lg font-bold text-foreground mb-2">搵唔到呢個頁面 😅</p>
        <p className="text-sm text-muted-foreground mb-6">可能已經被刪除或者你打錯地址</p>
        <Link href="/">
          <span className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors cursor-pointer">
            返回主頁
          </span>
        </Link>
      </div>
    </div>
  );
}
