# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev        # Start development server on http://localhost:5173
npm run build      # TypeScript check + production build
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Git Operations
When committing, ensure TypeScript compilation succeeds and linting passes:
```bash
npm run build && npm run lint
```

## Architecture Overview

### Tech Stack
- **React 19.1.0** with TypeScript for UI
- **Vite 7.0.0** for fast builds and HMR
- **Tailwind CSS** with custom monochrome design system
- **shadcn/ui** components built on Radix UI primitives
- **React Router v7** for client-side routing
- **TanStack Query** (React Query) + **Axios** for data fetching (ready but not implemented)
- **Zustand** for state management (installed but not implemented)
- **React Hook Form** + **Zod** for form handling and validation

### Project Structure
```
src/
├── api/           # API service layer (TO BE IMPLEMENTED)
├── components/    
│   ├── auth/      # Authentication components (ProtectedRoute)
│   ├── layout/    # App layout (Sidebar, Header, Navigation)
│   ├── theme/     # Theme provider and toggle
│   └── ui/        # Reusable UI components
│       └── custom/# App-specific UI (StatusDot, Badge, DataTable)
├── pages/         # Page components (Dashboard, NodeList, etc.)
├── stores/        # Zustand stores (TO BE IMPLEMENTED)
├── types/         # TypeScript type definitions (TO BE IMPLEMENTED)
└── lib/utils.ts   # Utility functions (cn for className merging)
```

### Key Architectural Patterns

1. **Routing**: Nested routes with layout wrapper, protected routes pattern
2. **Components**: Atomic design with forwardRef for all UI components
3. **Styling**: Tailwind utility classes with cn() helper for conditional classes
4. **Type Safety**: Strict TypeScript with explicit interfaces for all props
5. **Path Aliases**: Use `@/` for imports from src directory

### Design System

- **Colors**: Minimal grayscale palette (no color casts or gradients)
- **Font**: JetBrains Mono for all text
- **Theme**: Dark/light mode support via next-themes
- **Components**: Consistent use of shadcn/ui patterns with Radix UI

### Current State

The application is a network management dashboard for PGDN in early development:
- Mock data only (no API integration yet)
- Basic routing and UI structure complete
- Authentication flow UI exists but no backend integration
- No testing framework configured

### Development Guidelines

1. **Component Creation**: Follow existing shadcn/ui patterns, use forwardRef for UI components
2. **Styling**: Use Tailwind classes only, avoid inline styles or CSS modules
3. **Type Safety**: Define explicit TypeScript interfaces for all props and data structures
4. **File Naming**: PascalCase for components, camelCase for utilities
5. **Imports**: Use `@/` path alias for all internal imports

### Areas Needing Implementation

1. **API Layer**: Create service modules in `src/api/` with Axios and React Query
2. **State Management**: Implement Zustand stores for auth, global state
3. **Type Definitions**: Create shared types in `src/types/`
4. **Authentication**: Complete ProtectedRoute logic with token management
5. **Testing**: No test framework currently configured

### Common Tasks

When adding a new page:
1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation item in `src/components/layout/Sidebar.tsx`
4. Follow existing page patterns (Card-based layout, consistent spacing)

When adding UI components:
1. Check if shadcn/ui has the component first
2. Create in `src/components/ui/` following existing patterns
3. Use Radix UI primitives when possible
4. Include forwardRef and proper TypeScript types