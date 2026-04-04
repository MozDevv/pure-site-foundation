# Architecture — TechAI LMS

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                        Client                            │
│  React 18 + TypeScript + Vite 5 + Tailwind CSS           │
│  Shadcn/UI + MUI + Framer Motion                         │
└────────────────┬───────────────┬────────────────────────┘
                 │ REST/HTTP     │ WebSocket (STOMP)
                 ▼               ▼
┌────────────────────────────────────────────────────────┐
│                   Nginx Reverse Proxy                    │
│  /api/* → backend:8080    / → SPA fallback               │
└────────────────┬───────────────┬───────────────────────┘
                 │               │
                 ▼               ▼
┌────────────────────────────────────────────────────────┐
│               Spring Boot 3.4.3 (Java 17)                │
│  REST Controllers · WebSocket (STOMP) · Security (JWT)   │
└──┬──────────┬──────────┬──────────┬───────────────────┘
   │          │          │          │
   ▼          ▼          ▼          ▼
┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
│Postgre│  │Redis │  │MinIO │  │Jitsi │
│SQL 15 │  │  7   │  │      │  │      │
└──────┘  └──────┘  └──────┘  └──────┘
```

## Frontend Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React 18 | UI rendering |
| Language | TypeScript | Type safety |
| Build | Vite 5 | Dev server, HMR, production bundling |
| Package Manager | Bun | Fast dependency management |
| Styling | Tailwind CSS + CSS Variables | Utility-first with design tokens |
| Component Libraries | Shadcn/UI (Radix) + MUI | UI primitives + complex widgets |
| Animation | Framer Motion | Page transitions, micro-interactions |
| Data Fetching | React Query (`@tanstack/react-query`) | Server state caching, refetching |
| HTTP Client | Axios | API requests with interceptors |
| Routing | React Router v6 | Client-side routing |
| Real-time | `@stomp/stompjs` | WebSocket notifications |
| Chat | Firebase Firestore | Real-time chat messages |
| Code Editor | Monaco Editor (`@monaco-editor/react`) | Code playground |
| Rich Text | CKEditor 5 | Content authoring |
| Charts | Recharts | Analytics & dashboards |
| Calendar | `react-big-calendar` + Moment.js | Timetable display |

## Backend Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Spring Boot 3.4.3 | REST API, WebSocket, Security |
| Language | Java 17 | Application logic |
| Database | PostgreSQL 15 | Primary data store |
| Cache | Redis 7 | Session cache, token blacklisting |
| Object Storage | MinIO | File uploads (assignments, resources) |
| Video | Jitsi | Video conferencing for meetings |
| Auth | JWT (Bearer tokens) | Stateless authentication |
| Build | Maven | Dependency management, Jib container builds |

## Key Architectural Patterns

### 1. API Layer

All API calls go through a centralized service:

- **`src/lib/api.ts`** — Single source of truth for:
  - `API_BASE_URL`: From env (`/api` in dev, `https://techaipath.com/api` in prod)
  - `endpoints`: Object mapping all route names to URL paths
  - `apiService`: Axios instance with JWT interceptor (auto-attaches `Authorization: Bearer` header)

Environment config:
- `.env` → `VITE_API_BASE_URL=/api` (dev proxy)
- `.env.production` → `VITE_API_BASE_URL=https://techaipath.com/api`

### 2. Dev Proxy

Vite dev server proxies `/api` and `/ws` to `https://techaipath.com`:
- Avoids CORS issues in development
- WebSocket proxy enabled for `/ws` paths
- Dev server runs on port 5000

### 3. Route Guards

Three-layer protection:

```
MaintenanceGuard → blocks non-admin during maintenance
  └── DashboardLayout → shared chrome (sidebar, header)
       └── ProtectedRoute → role-based access (STUDENT/TUTOR/ADMIN)
            └── Page Component
```

**`ProtectedRoute`** checks:
1. JWT token exists in localStorage
2. User object exists with valid role
3. Role is in `allowedRoles` array (case-insensitive)
4. Smart redirect to user's own dashboard on access denied

### 4. Code Splitting

Every page is lazy-loaded via `React.lazy()`:
```tsx
const CoursesManagement = lazy(() => import('./components/CoursesManagement'));
```

Vendor chunks are manually configured in Vite:
- `vendor-react` — React core
- `vendor-mui` — MUI components
- `vendor-mui-icons` — MUI icons
- `vendor-query` — React Query + Axios
- `vendor-motion` — Framer Motion
- `vendor-radix` — Shadcn/Radix primitives
- `vendor-charts` — Recharts
- `vendor-utils` — date-fns, clsx, lucide-react
- `vendor-ckeditor` — CKEditor (~1MB isolated)
- `vendor-firebase` — Firebase SDK
- `vendor-stomp` — STOMP WebSocket
- `vendor-monaco` — Monaco Editor

### 5. React Query

Global defaults (configured in `App.tsx`):
- `staleTime: 2min` — data considered fresh for 2 minutes
- `gcTime: 10min` — unused cache kept for 10 minutes
- `refetchOnWindowFocus: false` — no refetch on tab switch
- `retry: 1` — retry failed requests once

### 6. WebSocket (STOMP)

Real-time notification delivery:
- **Transport**: WebSocket → STOMP protocol
- **Endpoint**: `/ws/notifications/websocket`
- **Auth**: JWT token in STOMP connect headers
- **Subscription**: `/user/queue/notifications` (per-user queue)
- **Heartbeat**: 10s incoming/outgoing
- **Reconnect**: Automatic every 5s
- **Integration**: `useNotificationWebSocket()` hook in `DashboardLayout`

### 7. Theming

Dual-layer theme system:
- **CSS Variables**: `:root` and `.dark` classes in `index.css` define all design tokens
- **Tailwind**: Uses CSS variables via `hsl(var(--primary))` etc.
- **MUI ThemeProvider**: Palette colors mapped to same CSS variables
- **Toggle**: `ThemeToggle` component toggles `dark` class on `<html>` element, persists to localStorage

### 8. Sidebar Architecture

Role-aware dual-filter system:
1. **Client-side**: `getNavigationSections(userRole)` generates role-specific menu structure
2. **Server-side**: `getMenusByRole(roleId)` API further filters allowed menu items
3. **Result**: `visibleSections` = intersection of both filters

Base route prefixes: `/student/*`, `/tutor/*`, `/admin/*`

## Deployment

### Docker Compose Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| `postgres` | postgres:15 | 5432 | Primary database |
| `redis` | redis:7-alpine | 6379 | Cache (256MB, allkeys-lru) |
| `minio` | minio/minio | 9000/9001 | Object storage |
| `jitsi-web` | jitsi/web:stable | 8081 | Video conferencing |
| `backend` | Custom (Jib) | 8080 | Spring Boot API |
| `frontend` | Custom (Dockerfile) | 80 | Nginx + SPA |

### Frontend Build Pipeline
1. `bun install` — install dependencies
2. `bun run build` — Vite production build (TypeScript check + bundle)
3. Docker multi-stage: build with Bun → serve with Nginx
4. Nginx handles `/api/*` proxy to backend, SPA fallback for all other routes
5. Static assets cached 30 days with `Cache-Control: public, immutable`

### Backend Build
- Maven with Jib plugin for container image creation
- `./build-push.ps1` — PowerShell script for build + push

## Directory Structure

```
pure-site-foundation/
├── src/
│   ├── App.tsx              # Routes, QueryClient, lazy imports
│   ├── main.tsx             # React root, providers
│   ├── index.css            # CSS variables, design tokens
│   ├── components/
│   │   ├── auth/            # ProtectedRoute, MaintenanceGuard, SignIn
│   │   ├── layout/          # DashboardLayout, header, admin-sidebar
│   │   ├── dashboard/       # Admin/Student/Tutor dashboards
│   │   ├── chat/            # Firestore chat, FloatingAIChat
│   │   ├── onboarding/      # OnboardingTour
│   │   ├── assessments/     # Assignments, quizzes, grades
│   │   ├── module-builder/  # Course modules, resources
│   │   ├── mentorship/      # (pages in /pages/mentorship/)
│   │   ├── innovation-hub/  # (pages in /pages/innovation/)
│   │   └── ui/              # Shadcn primitives (sidebar, button, etc.)
│   ├── pages/               # Route-level page components
│   ├── hooks/               # Custom hooks (useMaintenanceMode, useTour)
│   ├── lib/                 # API config, utilities
│   ├── services/            # WebSocket, API re-exports
│   └── types/               # TypeScript interfaces
├── docs/                    # Role & feature documentation
├── public/                  # Static assets
├── vite.config.ts           # Build config, proxy, chunks
├── tailwind.config.ts       # Tailwind theme extension
└── Dockerfile               # Multi-stage build
```
