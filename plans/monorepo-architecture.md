# Monorepo Architecture Plan

## Overview
A scalable monorepo structure using **pnpm workspaces** for package management and **Turborepo** for task orchestration and caching.

## Backend Architecture
- **Database**: Supabase (PostgreSQL with real-time subscriptions)
- **Authentication**: Supabase Auth (OAuth, Magic Link, Email/Password)
- **Storage**: Supabase Storage for file uploads
- See [`supabase-architecture.md`](supabase-architecture.md) for detailed backend design.

## Directory Structure

```
my-monorepo/
├── apps/                          # Deployable applications
│   ├── web/                       # Next.js web application
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── api/                       # Node.js API server
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── mobile/                    # React Native mobile app
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
│
├── packages/                      # Shared packages
│   ├── ui/                        # Shared UI component library
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── config/                    # Shared configuration files
│   │   ├── eslint/
│   │   ├── typescript/
│   │   ├── tailwind/
│   │   └── package.json
│   ├── utils/                     # Shared utility functions
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── types/                     # Shared TypeScript types
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
│
├── tooling/                       # Build and dev tools
│   ├── eslint-config/
│   ├── typescript-config/
│   └── prettier-config/
│
├── package.json                   # Root package.json
├── pnpm-workspace.yaml            # Workspace configuration
├── turbo.json                     # Turbo task pipeline
├── pnpm-lock.yaml                 # Lock file
└── .npmrc                         # pnpm configuration
```

## Key Features

### 1. **pnpm Workspaces**
- Efficient disk space usage with content-addressable store
- Strict dependency management
- Fast installation speeds

### 2. **Turborepo**
- Incremental builds
- Remote caching capabilities
- Parallel task execution
- Dependency-aware task scheduling

### 3. **Package Categories**
- **apps/**: End-user applications (web, api, mobile)
- **packages/**: Shared libraries and configurations
- **tooling/**: Internal build tools and configurations

## Task Pipeline (turbo.json)

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    },
    "typecheck": {}
  }
}
```

## Benefits

1. **Code Sharing**: Shared packages can be imported by any app
2. **Unified Tooling**: Single configuration for linting, formatting, TypeScript
3. **Atomic Changes**: Update multiple packages in a single commit
4. **Efficient CI/CD**: Turborepo only rebuilds what changed
5. **Developer Experience**: Single command to run everything

## Commands

```bash
# Install dependencies
pnpm install

# Run dev server for all apps
pnpm dev

# Build all packages and apps
pnpm build

# Run lint on all packages
pnpm lint

# Run tests
pnpm test

# Add dependency to specific app
pnpm --filter web add react

# Add internal dependency
pnpm --filter web add @repo/ui
```
