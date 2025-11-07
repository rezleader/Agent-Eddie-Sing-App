# American Split AI - ARG Music Recognition App

## Overview

American Split AI is an alternate reality game (ARG) that combines music recognition with social activism through gamified challenges. Users scan audio to identify songs, then complete challenges related to social justice themes (racism, sexism, LGBTQ+ issues, AI threats, and love/romance). The application features a mobile-first, card-based interface inspired by gamification platforms like Duolingo and social platforms like Instagram/TikTok.

The app enables users to:
- Record audio clips to identify songs
- Browse challenges organized by song segments (60-second intervals)
- Complete various challenge types (ACTION, SHARE, KNOW, ALTERNATIVE)
- Earn points for completing challenges
- Share achievements on social media platforms

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling:**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack React Query for server state management and caching

**UI System:**
- Shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design system
- Mobile-first responsive design approach
- Custom theme system supporting light/dark modes via CSS variables

**Design Patterns:**
- Component-based architecture with reusable UI primitives
- Custom hooks pattern for business logic separation
- Query-based data fetching with optimistic updates
- Card-based layouts optimized for mobile interactions

**Key Frontend Components:**
- `UserScanner`: Audio recording interface using Web Audio API
- `SongChallenges`: Challenge browsing and filtering by segment/category
- `ChallengeCard`: Gamified challenge presentation with point displays
- `SocialShareModal`: Multi-platform sharing functionality
- Admin interfaces for content management

### Backend Architecture

**Server Framework:**
- Express.js for HTTP server and API endpoints
- TypeScript for type safety across the stack
- Session-based user tracking (no authentication required)

**API Design:**
- RESTful API structure with `/api` prefix
- Resource-oriented endpoints for songs, challenges, and user sessions
- Multipart form data handling for audio file uploads
- CORS-enabled file serving for uploaded audio

**Storage Layer:**
- In-memory storage implementation (`MemStorage` class)
- Abstracted storage interface (`IStorage`) for future database migration
- File system storage for uploaded audio files in `/uploads` directory

**Data Models:**
- Songs: Audio files with metadata (title, artist, duration, file path)
- Challenges: Categorized tasks linked to song segments
- User Sessions: Point tracking and completed challenge history

**Business Logic:**
- Audio fingerprinting placeholder for song recognition
- Challenge completion validation
- Point accumulation system
- Session management with localStorage persistence

### Database Schema

The application uses Drizzle ORM with PostgreSQL-compatible schema definitions:

**Tables:**
- `songs`: Audio metadata and file references
- `challenges`: Challenge content with category/type/segment associations
- `user_sessions`: Session tokens, points, and completion tracking (JSON array)

**Relationships:**
- Challenges reference songs via foreign key with cascade delete
- User sessions track completed challenges via JSONB array field

**Key Design Decisions:**
- UUID primary keys for distributed compatibility
- JSONB for flexible completed challenges array
- Timestamp tracking for sessions and content creation
- Text fields for categorical data (category, type) instead of enums for flexibility

### External Dependencies

**Core Infrastructure:**
- Neon Database (@neondatabase/serverless) - PostgreSQL serverless database
- Drizzle ORM - Type-safe database queries and migrations

**Audio Processing:**
- Multer - Multipart file upload handling for audio files
- Native Web Audio API - Client-side audio recording

**UI Component Libraries:**
- Radix UI - Headless accessible component primitives (17+ components)
- React Icons - Icon library including social platform logos

**State Management:**
- TanStack React Query - Server state synchronization and caching
- React Hook Form - Form state management with validation

**Styling:**
- Tailwind CSS - Utility-first CSS framework
- class-variance-authority - Component variant management
- tailwind-merge - Conditional class merging utility

**Session Management:**
- connect-pg-simple - PostgreSQL session store for Express
- Native localStorage - Client-side session token persistence

**Development Tools:**
- Vite plugins for Replit integration (cartographer, dev banner, runtime error overlay)
- tsx - TypeScript execution for development server
- esbuild - Production build bundling

**Validation:**
- Zod - Schema validation and type inference
- drizzle-zod - Automatic schema generation from Drizzle models

**Key Architectural Choices:**

1. **In-Memory Storage with Future Database Path**: Currently uses `MemStorage` class but schema is defined for PostgreSQL migration, allowing rapid prototyping while maintaining production-ready data models.

2. **Session-Based Anonymous Users**: No authentication system - users identified by session tokens, enabling frictionless onboarding critical for ARG participation.

3. **Segment-Based Challenge Organization**: Songs divided into 60-second segments (1-4) allowing progressive challenge unlocking as users listen through tracks.

4. **Client-Side Audio Recording**: Web Audio API used directly in browser to avoid server-side audio processing complexity.

5. **Mobile-First Gamification**: Card-based UI with prominent point displays, category badges, and social sharing optimized for smartphone touch interactions.

6. **Admin Panel Separation**: Dedicated admin routes and components for content management separate from user-facing ARG experience.