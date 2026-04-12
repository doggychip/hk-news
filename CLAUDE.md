# 港聞匯 Pro — CLAUDE.md

## Project Overview

Hong Kong news aggregation + discussion forum ("吹水台"). Full-stack TypeScript app with React frontend and Express backend. RSS feeds from 9 HK sources, in-memory storage, emoji reaction system, user auth.

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Framer Motion, wouter
- **Backend**: Express 5, rss-parser, Zod validation
- **Build**: Vite 7, esbuild
- **Storage**: In-memory (MemStorage class) — no database

## Architecture

```
client/src/
  pages/          → home.tsx, post-detail.tsx, profile.tsx
  components/     → PostCard, ReactionBar, CommentSection, AuthModal, etc.
  contexts/       → AuthContext (user state + token)
  lib/            → queryClient.ts (TanStack Query + fetch helper)

server/
  index.ts        → Express app + HTTP server
  routes.ts       → All API endpoints (posts, comments, auth, trending)
  feeds.ts        → RSS fetch, heat calc, post generation
  storage.ts      → MemStorage (maps for posts, comments, users, sessions)
  summarizer.ts   → Sentence-scoring summary algorithm

shared/
  schema.ts       → All TypeScript interfaces + Zod schemas
```

## Key Conventions

- **Language**: UI in Traditional Chinese (繁體中文), Cantonese slang throughout
- **Categories**: 熱門, 吹水, 娛樂, 時事, 返工, 感情, 飲食, 科技
- **Reactions**: 🔥正 🥴膠 🤣SLDPK 💀RIP 😎Chill 🤬屌
- **Auth**: No passwords — username-only login, Bearer token (UUID)
- **Data**: Volatile in-memory storage, RSS re-fetched every 5 minutes

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | /api/posts | List posts (category, search filters) |
| GET | /api/posts/:id | Single post |
| POST | /api/posts | Create post (auth required) |
| POST | /api/posts/:id/react | Add reaction |
| GET | /api/posts/:id/comments | List comments |
| POST | /api/posts/:id/comments | Add comment |
| GET | /api/trending | Top 10 by heat |
| POST | /api/refresh | Force RSS re-fetch |
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |

---

## Feature Specs: Pro Upgrade

### 1. Sentiment Tags (情緒標籤)

**Goal**: Auto-tag every post with a sentiment label so users can scan mood at a glance.

**Sentiment types**:
| Tag | Label | Color | Condition |
|-----|-------|-------|-----------|
| positive | 正面 ✨ | green | Positive keywords dominate |
| negative | 負面 😤 | red | Negative keywords dominate |
| neutral | 中立 😐 | gray | No strong signal |
| explosive | 爆炸 💥 | orange | High heat + high reaction count |

**Implementation**:
- `server/sentiment.ts` — keyword-based analyzer (no external API needed)
  - Cantonese positive words: 正, 勁, 靚, 開心, 好嘢, 讚, 感動, 幸福, amazing, good...
  - Cantonese negative words: 衰, 慘, 嬲, 廢, 垃圾, 死, 崩潰, 離譜, 黑心, bad, worse...
  - Score = (positive hits - negative hits) / total words
  - explosive = heat > 75 AND total reactions > 150
- Add `sentiment: "positive" | "negative" | "neutral" | "explosive"` to Post type in `shared/schema.ts`
- Tag posts during RSS fetch in `feeds.ts` and during user post creation in `routes.ts`
- UI: colored badge on `PostCard` next to category badge

### 2. Smart Trending Detection (趨勢偵測)

**Goal**: Replace random-based heat with velocity-based trending that detects posts gaining momentum.

**Implementation**:
- `server/trending.ts` — trending engine
  - Track reaction velocity: reactions-per-minute over sliding windows (5min, 15min, 60min)
  - Track comment velocity: comments-per-minute
  - Trending score = `(recentReactions * 3 + recentComments * 5) / ageMinutes`
  - Detect "trending up" 📈 vs "trending down" 📉 vs "steady" ➡️
  - A post is "on fire" 🔥 if velocity in last 15min > 2x its 60min average
- Add `trendDirection: "up" | "down" | "steady"` and `trendScore: number` to Post type
- New endpoint: `GET /api/trending/velocity` — posts sorted by velocity score
- UI: trending indicator arrow on PostCard, pulsing animation for "on fire" posts
- Update HotTicker to use velocity-based ordering

### 3. AI Daily Briefing (每日AI簡報)

**Goal**: Generate a daily news briefing summarizing top stories across categories.

**Implementation**:
- `server/briefing.ts` — briefing generator
  - Runs on-demand (not scheduled, since in-memory)
  - Groups top posts by category (top 3 per category)
  - For each category: summarize the key themes using the existing summarizer
  - Generate overall mood from sentiment distribution
  - Output structure:
    ```typescript
    interface DailyBriefing {
      date: string;
      greeting: string;          // Time-aware Cantonese greeting
      overallMood: string;       // "今日香港心情：偏正面 ✨"
      sentimentBreakdown: { positive: number; negative: number; neutral: number; explosive: number };
      categories: Array<{
        category: string;
        topStories: Array<{ title: string; summary: string; sentiment: string; heat: number }>;
        categoryMood: string;
      }>;
      hotTake: string;           // Fun editorial Cantonese one-liner
      generatedAt: string;
    }
    ```
- New endpoint: `GET /api/briefing` — returns today's briefing (cached for 30 minutes)
- UI: New `DailyBriefing` component on HomePage
  - Collapsible card at top of feed (above category tabs)
  - Greeting + overall mood
  - Expandable category sections with top 3 stories each
  - Sentiment pie/bar chart using colored dots
  - "Hot take" footer with random Cantonese editorial quip
  - Styled with gradient background matching overall mood color

---

## Dev Commands

```bash
npm install       # Install deps
npm run dev       # Dev server on :5000
npm run build     # Production build
npm run check     # TypeScript check
```

## Style Guide

- Use Tailwind utility classes, match existing dark mode patterns
- Cantonese copy for all user-facing text
- Framer Motion for new animations (match existing stagger patterns)
- shadcn/ui components for new UI elements

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
