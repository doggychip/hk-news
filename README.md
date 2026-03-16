# 港聞匯 — HK News Aggregator

A full-stack Hong Kong news aggregation platform that pulls from 17+ RSS sources across 6 categories in real-time.

## Features

- **6 categories**: 港聞, 財經, 加密貨幣, 國際, 體育, 科技
- **17+ sources**: RTHK, 明報, 南華早報, 香港經濟日報, 經濟通, CoinDesk, 鏈新聞, Unwire.hk, and more
- **Full-text search** across all articles
- **Bookmark** articles for later reading
- **Auto-refresh** every 5 minutes
- **Dark mode** with system preference detection
- **Mobile responsive** design
- **Traditional Chinese** (繁體中文) UI

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query
- **Backend**: Express.js, rss-parser
- **Build**: Vite

## Quick Start

```bash
npm install
npm run dev
```

The dev server starts on port 5000.

## Production

```bash
npm run build
NODE_ENV=production node dist/index.cjs
```

## Deploy

Works on any Node.js hosting:

- **Railway / Render / Fly.io** — set start command to `node dist/index.cjs`
- **VPS** — run behind nginx/caddy reverse proxy
- **Docker** — straightforward Node.js container

## News Sources

| Category | Sources |
|----------|---------|
| 港聞 | 香港電台, 明報, 香港經濟日報, 南華早報, 巴士的報, 政府新聞網 |
| 財經 | 香港電台財經, 經濟通, 信報, AAStocks, 香港經濟日報財經 |
| 加密貨幣 | CoinDesk, 鏈新聞, Blockchain News |
| 國際 | 香港電台國際, 香港電台大中華 |
| 體育 | 香港電台體育 |
| 科技 | 香港經濟日報科技, Unwire.hk |

## Adding Sources

Edit `server/feeds.ts` to add or modify RSS feed sources. Each source needs:

```typescript
{ name: "Source Name", url: "https://example.com/rss", category: "港聞", language: "zh" }
```

## License

MIT
