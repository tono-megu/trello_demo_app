# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## Architecture Overview

This is a Next.js 15 application with Supabase authentication using the App Router and Server-Side Rendering (SSR). The application implements a complete authentication system with protected routes and a full-featured Trello-like kanban board system.

### Key Architecture Components

- **Authentication**: Cookie-based authentication using `@supabase/ssr` package
  - Client-side: `lib/supabase/client.ts` 
  - Server-side: `lib/supabase/server.ts`
  - Middleware: `lib/supabase/middleware.ts` handles session updates across requests

- **Route Protection**: 
  - `middleware.ts` runs on all routes except static assets
  - Protected routes are at root level (`/` and `/boards/`)
  - Auth pages are in `app/auth/` directory
  - About/landing page for unauthenticated users is at `/about`

- **UI Components**: 
  - Built with shadcn/ui components in `components/ui/`
  - Custom auth components in root `components/` directory
  - Tutorial components in `components/tutorial/`

### Environment Setup

Required environment variables (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`

Copy `.env.example` to `.env.local` and fill in Supabase project credentials.

### Kanban Board Features

This application includes a full-featured Trello-like kanban board system:

- **Database Schema**: Boards, Lists, Cards with proper RLS policies (`supabase-schema.sql`)
- **Drag & Drop**: Uses `@dnd-kit/core` for intuitive card movement between lists
- **Real-time Sync**: WebSocket-based updates using Supabase realtime subscriptions
- **CRUD Operations**: Full API routes in `/api/boards`, `/api/lists`, `/api/cards`

#### Key Pages
- `/` - Main dashboard for authenticated users
- `/boards` - Board listing and creation
- `/boards/[boardId]` - Individual board with kanban interface
- `/about` - Landing page for unauthenticated users

#### Components Structure
- `components/kanban/kanban-board.tsx` - Main board container with DnD context
- `components/kanban/kanban-list.tsx` - Individual lists with sortable cards
- `components/kanban/kanban-card.tsx` - Draggable card component
- `hooks/use-board-realtime.ts` - Real-time synchronization hook

### Important Implementation Notes

- Always create new Supabase server clients within functions (never global variables)
- Server components use `lib/supabase/server.ts`
- Client components use `lib/supabase/client.ts`
- Middleware automatically refreshes user sessions
- Authentication state is available across Client Components, Server Components, Route Handlers, and Server Actions
- Real-time updates use Supabase channels with board-specific subscriptions
- The application uses Japanese text in the UI components and supports multi-language content