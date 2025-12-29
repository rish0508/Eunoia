# Personal Journaling App

## Overview

A personal journaling application designed to encourage daily reflection through a calm, distraction-free interface. The app allows users to create journal entries with mood tracking, gym status logging, food notes, and image attachments. Built with a Notion-inspired minimalist design philosophy combined with Day One's warmth.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and data fetching
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Theme Support**: Custom ThemeProvider with light/dark mode toggle, persisted to localStorage

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **API Design**: RESTful API with JSON request/response format
- **Data Validation**: Zod schemas with drizzle-zod for type-safe validation
- **Build System**: Custom build script using esbuild for server bundling and Vite for client

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: Shared schema in `/shared/schema.ts` for type sharing between client and server
- **Current Storage**: In-memory storage implementation (`MemStorage`) with interface ready for database migration
- **Database Migrations**: Drizzle Kit configured with migrations output to `/migrations`

### Key Data Models
- **Users**: Basic user model with id, username, password
- **Journal Entries**: Rich entries with date, reflection text, gym status, gym notes, food, mood, target achievement flag, images array, and timestamps
- **Enums**: Gym status options (worked_out, rest_day, skipped) and mood options (great, good, okay, low, rough)

### Design System
- **Typography**: Inter font family from Google Fonts
- **Color Scheme**: Warm, muted palette with green accent colors for primary actions
- **Layout**: Two-column desktop layout (w-64 sidebar + max-w-3xl content), single column mobile
- **Spacing**: Tailwind spacing scale (2, 4, 6, 8, 12, 16 units)

## External Dependencies

### UI Component Libraries
- **shadcn/ui**: Full component set via Radix UI primitives
- **Radix UI**: Dialog, Select, Switch, Tabs, Toast, Tooltip, and more
- **Lucide React**: Icon library

### Data & Forms
- **TanStack React Query**: Data fetching and caching
- **React Hook Form**: Form handling with @hookform/resolvers
- **Zod**: Schema validation

### Date Handling
- **date-fns**: Date manipulation and formatting

### Database
- **Drizzle ORM**: Database ORM configured for PostgreSQL
- **connect-pg-simple**: PostgreSQL session store (available but not currently active)

### Build Tools
- **Vite**: Frontend build tool with React plugin
- **esbuild**: Server bundling for production
- **TypeScript**: Full type coverage across client, server, and shared code