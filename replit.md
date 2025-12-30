# Eunoia - Personal Journaling App

## Overview

A personal journaling application named "Eunoia" featuring a celestial/night sky theme with stars, moons, and daily motivational quotes. The app encourages daily reflection with target-setting, mood tracking, gym/workout logging, food notes, and photo/video attachments.

## User Preferences

- Preferred communication style: Simple, everyday language.
- App name: Eunoia
- Design theme: Celestial (stars, moons, motivational quotes)

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and data fetching
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Theme Support**: Custom ThemeProvider with light/dark mode toggle, persisted to localStorage

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **API Design**: RESTful API with JSON request/response format
- **Data Validation**: Zod schemas with drizzle-zod for type-safe validation
- **Object Storage**: Replit Object Storage for video uploads
- **Build System**: Custom build script using esbuild for server bundling and Vite for client

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (Replit built-in)
- **Schema Location**: Shared schema in `/shared/schema.ts` for type sharing between client and server
- **Storage Implementation**: DatabaseStorage class using Drizzle ORM

### Key Data Models
- **Users**: Basic user model with id, username, password
- **Journal Entries**: Rich entries with:
  - date: Entry date/time
  - targetPlan: Morning goal/intention setting
  - reflection: Daily reflection text
  - gymStatus: Workout status (worked_out, rest_day, skipped)
  - gymNotes: Workout details
  - food: Food logging
  - mood: Mood indicator (great, good, okay, low, rough)
  - targetMet: Boolean for goal achievement
  - images: Array of base64-encoded photos
  - videos: Array of video URLs
  - createdAt: Timestamp

### Design System
- **Typography**: Inter font family from Google Fonts
- **Color Scheme**: Celestial theme with purple primaries and golden accents
- **Visual Elements**: Animated star field, moon icons, sparkle decorations
- **Daily Quotes**: Rotating motivational quotes displayed each day
- **Layout**: Centered content (max-w-4xl), responsive single column

## External Dependencies

### UI Component Libraries
- **shadcn/ui**: Full component set via Radix UI primitives
- **Radix UI**: Dialog, Select, Switch, Tabs, Toast, Tooltip, and more
- **Lucide React**: Icon library (Moon, Star, Sparkles, etc.)

### Data & Forms
- **TanStack React Query**: Data fetching and caching
- **React Hook Form**: Form handling with @hookform/resolvers
- **Zod**: Schema validation

### Date Handling
- **date-fns**: Date manipulation and formatting

### File Storage
- **@google-cloud/storage**: Object storage client
- **Uppy**: File upload library (for video uploads)

### Database
- **Drizzle ORM**: Database ORM configured for PostgreSQL
- **pg**: PostgreSQL client

### Build Tools
- **Vite**: Frontend build tool with React plugin
- **esbuild**: Server bundling for production
- **TypeScript**: Full type coverage across client, server, and shared code

## Deployment Configuration

### Production Deployment
- **Frontend**: Cloudflare Pages (Vite/React build)
- **Backend**: Render (Node.js/Express) at `https://eunoia-backend-kmga.onrender.com`
- **API URL Configuration**: Uses `VITE_API_BASE_URL` environment variable, falls back to Render backend in production
- **API Helper**: `client/src/lib/api.ts` provides `apiUrl()` function for all API calls

## Recent Changes
- Added configurable API base URL for Cloudflare deployment
- Added celestial theme with stars, moons, and purple/gold colors
- Added targetPlan field for morning goal-setting
- Added video upload support
- Added daily motivational quotes
- Fixed form reset bug when switching dates
- Migrated from in-memory storage to PostgreSQL database
- Renamed app to "Eunoia"
