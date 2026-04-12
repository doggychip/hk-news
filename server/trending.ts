import type { Post, TrendDirection } from "@shared/schema";

interface TrendSnapshot {
  postId: number;
  timestamp: number;
  totalReactions: number;
  commentCount: number;
}

// Store snapshots for velocity calculation
const snapshots: Map<number, TrendSnapshot[]> = new Map();

function getTotalReactions(post: Post): number {
  const r = post.reactions;
  return r.fire + r.cringe + r.rofl + r.dead + r.chill + r.rage;
}

export function recordSnapshot(post: Post): void {
  const now = Date.now();
  const history = snapshots.get(post.id) || [];

  history.push({
    postId: post.id,
    timestamp: now,
    totalReactions: getTotalReactions(post),
    commentCount: post.commentCount,
  });

  // Keep only last 60 minutes of snapshots
  const cutoff = now - 60 * 60 * 1000;
  const trimmed = history.filter(s => s.timestamp > cutoff);
  snapshots.set(post.id, trimmed);
}

export function calculateTrendScore(post: Post): number {
  const history = snapshots.get(post.id);
  const ageMinutes = Math.max(1, (Date.now() - new Date(post.createdAt).getTime()) / 60000);

  if (!history || history.length < 2) {
    // Fallback: use current reactions + comments weighted by recency
    const totalReactions = getTotalReactions(post);
    return Math.round((totalReactions * 3 + post.commentCount * 5) / ageMinutes * 100) / 100;
  }

  const now = Date.now();

  // Recent window: last 15 minutes
  const recent = history.filter(s => s.timestamp > now - 15 * 60 * 1000);
  // Older window: 15-60 minutes ago
  const older = history.filter(s => s.timestamp > now - 60 * 60 * 1000 && s.timestamp <= now - 15 * 60 * 1000);

  if (recent.length < 1) {
    const totalReactions = getTotalReactions(post);
    return Math.round((totalReactions * 3 + post.commentCount * 5) / ageMinutes * 100) / 100;
  }

  const recentFirst = recent[0];
  const recentLast = recent[recent.length - 1];
  const recentDeltaReactions = recentLast.totalReactions - recentFirst.totalReactions;
  const recentDeltaComments = recentLast.commentCount - recentFirst.commentCount;
  const recentMinutes = Math.max(1, (recentLast.timestamp - recentFirst.timestamp) / 60000);
  const recentVelocity = (recentDeltaReactions * 3 + recentDeltaComments * 5) / recentMinutes;

  // Bonus for absolute engagement
  const totalReactions = getTotalReactions(post);
  const engagementBonus = Math.log2(Math.max(1, totalReactions + post.commentCount));

  return Math.round((recentVelocity + engagementBonus) * 100) / 100;
}

export function calculateTrendDirection(post: Post): TrendDirection {
  const history = snapshots.get(post.id);

  if (!history || history.length < 2) {
    // New posts default to "up"
    const ageMinutes = (Date.now() - new Date(post.createdAt).getTime()) / 60000;
    return ageMinutes < 30 ? "up" : "steady";
  }

  const now = Date.now();
  const recent = history.filter(s => s.timestamp > now - 15 * 60 * 1000);
  const older = history.filter(s => s.timestamp > now - 60 * 60 * 1000 && s.timestamp <= now - 15 * 60 * 1000);

  if (recent.length < 2 || older.length < 2) {
    return "steady";
  }

  // Calculate velocity for each window
  const recentVelocity = (recent[recent.length - 1].totalReactions - recent[0].totalReactions) /
    Math.max(1, (recent[recent.length - 1].timestamp - recent[0].timestamp) / 60000);

  const olderVelocity = (older[older.length - 1].totalReactions - older[0].totalReactions) /
    Math.max(1, (older[older.length - 1].timestamp - older[0].timestamp) / 60000);

  // "On fire" if recent velocity > 2x older velocity
  if (recentVelocity > olderVelocity * 2 && recentVelocity > 0.5) return "up";
  if (recentVelocity < olderVelocity * 0.5) return "down";
  return "steady";
}

export function initSnapshots(posts: Post[]): void {
  for (const post of posts) {
    recordSnapshot(post);
  }
}
