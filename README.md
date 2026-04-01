# PNPM Monorepo

A scalable monorepo structure using **pnpm workspaces** for package management and **Turborepo** for task orchestration and caching.

## Tech Stack

- **Frontend:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL with real-time subscriptions)
- **Authentication:** Supabase Auth (OAuth, Magic Link, Email/Password)
- **Storage:** Supabase Storage
- **Monorepo:** pnpm workspaces + Turborepo
- **Language:** TypeScript

## Project Structure

```
pnpm-monorepo/
├── apps/
│   └── web/                    # Next.js web application
│       ├── app/               # App Router pages
│       │   ├── layout.tsx     # Root layout with auth provider
│       │   ├── page.tsx       # Home page
│       │   └── auth/          # Authentication pages
│       │       ├── callback/  # OAuth callback handler
│       │       └── auth-error/# Auth error page
│       ├── components/        # React components
│       │   └── providers/     # Context providers
│       ├── lib/               # Library code
│       │   ├── actions/       # Server actions
│       │   ├── hooks/         # React hooks
│       │   └── supabase/      # Supabase client utilities
│       ├── middleware.ts      # Auth middleware
│       └── package.json
├── packages/
│   └── ui/                    # Shared UI components
│       └── src/
│           ├── button.tsx     # Button component
│           └── index.ts       # Package exports
├── supabase/
│   ├── config.toml           # Supabase CLI configuration
│   └── schema.sql            # Database schema
├── tooling/
│   ├── eslint-config/        # ESLint configuration
│   └── typescript-config/    # TypeScript configurations
├── plans/
│   ├── monorepo-architecture.md    # Monorepo documentation
│   └── supabase-architecture.md    # Backend documentation
├── pnpm-workspace.yaml       # pnpm workspace config
├── turbo.json                 # Turborepo config
└── package.json               # Root package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Supabase CLI (optional, for local development)

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp apps/web/.env.local.example apps/web/.env.local
```

### Configure Environment Variables

Edit `apps/web/.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Development

```bash
# Run all apps in development mode
pnpm dev

# Run specific app
pnpm --filter web dev

# Run specific package
pnpm --filter @repo/ui dev
```

### Build

```bash
# Build all packages and apps
pnpm build
```

## Supabase Setup

### Database Schema

Run the schema in your Supabase SQL Editor:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project → SQL Editor
3. Copy and run the contents of `supabase/schema.sql`

### Tables Created

- **profiles** - User profiles (extends auth.users)
- **posts** - Blog posts with draft/published status
- **tags** - Post categorization tags
- **post_tags** - Many-to-many relationship between posts and tags

### Row Level Security (RLS)

All tables have RLS enabled with the following policies:

| Table | Select | Insert | Update | Delete |
|-------|--------|--------|--------|--------|
| profiles | Public | Own profile | Own profile | - |
| posts | Published OR own | Authenticated | Own posts | Own posts |
| tags | Public | Authenticated | - | - |
| post_tags | Public | Post owner | Post owner | Post owner |

## Authentication

The app supports multiple authentication methods:

### Email/Password

```typescript
import { signIn, signUp, signOut } from '@/lib/actions/auth'

// Sign up
await signUp(formData)

// Sign in
await signIn(formData)

// Sign out
await signOut()
```

### OAuth (Google, GitHub)

```typescript
import { signInWithOAuth } from '@/lib/actions/auth'

await signInWithOAuth('google')
```

### Magic Link

```typescript
import { signInWithMagicLink } from '@/lib/actions/auth'

await signInWithMagicLink(formData)
```

## Server Actions

### Auth Actions (`lib/actions/auth.ts`)

| Action | Description |
|--------|-------------|
| `signUp(formData)` | Create new user account |
| `signIn(formData)` | Sign in with email/password |
| `signInWithOAuth(provider)` | Sign in with OAuth provider |
| `signInWithMagicLink(formData)` | Passwordless email login |
| `signOut()` | Sign out current user |
| `getUser()` | Get current authenticated user |
| `resetPassword(formData)` | Request password reset email |
| `updatePassword(formData)` | Update user password |
| `updateProfile(formData)` | Update user profile |

### Post Actions (`lib/actions/posts.ts`)

| Action | Description |
|--------|-------------|
| `createPost(formData)` | Create new post |
| `updatePost(postId, formData)` | Update existing post |
| `deletePost(postId)` | Delete a post |
| `publishPost(postId)` | Change status to published |
| `unpublishPost(postId)` | Change status to draft |
| `getPublishedPosts(limit)` | Get public posts |
| `getUserPosts()` | Get current user's posts |
| `getPost(postId)` | Get single post by ID |

## React Hooks (`lib/hooks/`)

### useSupabase

```typescript
import { useSupabase } from '@/components/providers/SupabaseProvider'

// In a component wrapped by SupabaseProvider
const { user, session, isLoading } = useSupabase()
```

### useRealtimeTable

```typescript
import { useRealtimeTable } from '@/lib/hooks/useSupabase'

const { data, error, isLoading } = useRealtimeTable('posts', {
  filter: 'status.eq.published',
  select: '*, profiles(*)'
})
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development servers |
| `pnpm build` | Build all packages |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format code with Prettier |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License
