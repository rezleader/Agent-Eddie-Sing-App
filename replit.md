# American Split AI - ARG Music Recognition App

## Overview

American Split AI is an alternate reality game (ARG) that combines music recognition with social activism through gamified challenges. Users scan audio to identify songs, then complete challenges related to social justice themes (racism, sexism, LGBTQ+ issues, AI threats, and love/romance). The application features a mobile-first, card-based interface inspired by gamification platforms like Duolingo and social platforms like Instagram/TikTok.

The app enables users to:
- Record audio clips to identify songs
- Browse challenges organized by song segments (60-second intervals)
- Complete various challenge types (ACTION, SHARE, KNOW, ALTERNATIVE)
- Earn points for completing challenges
- View leaderboard rankings showing top players by points
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

**Routing Architecture:**
- Main router uses single catch-all route for admin: `<Route path="/admin/:rest*" component={AdminRoutes} />`
- AdminRoutes wraps content in `<WouterRouter base="/admin">` for base-relative routing
- Admin nested routes use relative paths (`/`, `/songs`, `/challenges`, `/settings`)
- Root-level navigation function passed to AdminLayout for SPA navigation to Scanner
- Active state detection in sidebar uses base-relative path comparison
- Scanner link (non-admin) uses root navigation handler to escape base router context

**Key Frontend Components:**
- `UserScanner`: Audio recording interface using Web Audio API with leaderboard access
- `SongChallenges`: Challenge browsing and filtering by segment/category with one-type-per-scan restriction
  - Users can only complete one challenge type (ACTION, SHARE, KNOW, or ALTERNATIVE) per scan session
  - Once a challenge is accepted, other type buttons are disabled until next scan
  - No "ALL" filter option - only the four specific challenge types are available
  - **Challenge rejection system**: Users can reject challenges for reduced points
  - **Skip option**: After 2 rejections, users can skip and just share about the song
- `ChallengeCard`: Gamified challenge presentation with point displays and organization links
- `AnswerInputDialog`: Answer input with album cover, organization info, and share/reject options
- `Leaderboard`: Top 100 players ranked by total points with current user highlighting
- `SocialShareModal`: Multi-platform sharing with album cover and agenteddiesing.replit.app link
  - Facebook: Direct share
  - Instagram/Snapchat: Copy text with instructions
  - Includes user's answer and ending message: "Scan the album American Split AI available at AgentEddieSing.com... Skabe din fremtid, Eddie Sing & The 31 Days"
- Admin interfaces for content management (SongsManager, ChallengesManager)

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
- PostgreSQL database with Neon serverless adapter
- Drizzle ORM for type-safe database queries
- HTTP-based Neon client (`drizzle-orm/neon-http`)
- Abstracted storage interface (`IStorage`) for testability
- **Replit Object Storage** for persistent song files (survives all deployments)
  - Google Cloud Storage SDK (@google-cloud/storage) with environment-aware authentication
  - **Development**: Uses Replit sidecar authentication (127.0.0.1:1106)
  - **Production**: Uses default application credentials (REPLIT_DEPLOYMENT=1)
  - Automatic credential detection via `createStorageClient()` factory function
  - Songs uploaded via `bucket.upload()` method with proper metadata
  - Songs served from `/public-objects/songs/` endpoint with streaming downloads
  - Production-ready implementation verified by architect review
  - 7 of 11 songs migrated; 4 need re-upload via admin panel

**Data Models:**
- Songs: Audio files with metadata (title, artist [auto-populated as "Eddie Sing & The 31 Days"], album, duration, file path)
- Challenges: Categorized tasks linked to song segments with optional organization info
  - New fields: `organization` (name), `organizationUrl` (link)
  - Organizations matched to challenge categories (NAACP for racism, Trevor Project for LGBTQ+, etc.)
- User Sessions: Point tracking and completed challenge history (stored in JSONB array)

**Business Logic:**
- **ACRCloud music recognition** - Custom audio fingerprinting for Eddie Sing's 11-song catalog
  - Identifies songs from user-recorded audio clips with 100% confidence
  - Detects which 60-second segment (1-4) user is listening to based on play offset
  - Supports both commercial music database and custom bucket responses
  - Parses artist/album metadata from both string and object formats
  - Requires ACRCLOUD_ACCESS_KEY, ACRCLOUD_ACCESS_SECRET, ACRCLOUD_HOST environment variables
  - Project 87689 bound to bucket 28354 containing all 11 fingerprints
- **ACRCloud auto-upload service** - Automatic bucket upload during song creation
  - Uploads songs to ACRCloud bucket (ID: 28354) via Console API
  - Triggered automatically when admin uploads songs via admin panel
  - Uses ACRCLOUD_BUCKET_ID and ACRCLOUD_BEARER_TOKEN environment variables
  - Generates fingerprints using ACRCloud extraction tool binary
  - Implements idempotent uploads via custom_file_id (prevents duplicates)
  - Returns acrid for tracking uploaded songs
  - Graceful fallback when not configured (logs warning)
  - Console API uses Bearer token authentication with api-v2.acrcloud.com
- **Server-side audio duration detection** - ffprobe-based auto-detection
  - Extracts duration from uploaded audio files using fluent-ffmpeg
  - 180-second fallback if ffprobe unavailable or detection fails
  - Eliminates manual duration entry in admin panel
- **Challenge flow with answer input and sharing**:
  1. User accepts challenge → Answer dialog opens with album cover and organization info
  2. User types answer → Click "Share & Complete"
  3. Share modal opens immediately with answer included
  4. After sharing → Completion modal shows points earned
- **Challenge rejection and retry system**:
  - Users can reject challenges for reduced points (-10 points per rejection, minimum 5)
  - After 2 rejections, "Skip and Post About Song" option appears
  - Skip option awards 5 points for just sharing about the song
- Challenge completion validation with duplicate prevention
- **One challenge type per scan restriction** - Users locked to selected type after accepting a challenge
  - Encourages multiple scans and sustained engagement with the music
  - Prevents gaming the system by completing all types in one scan
- Point accumulation system with dynamic adjustment
- Session management with localStorage persistence
- Leaderboard ranking system (top 100 players, anonymized player IDs)
- Sanitized leaderboard API to prevent session token exposure

### Database Schema

The application uses Drizzle ORM with PostgreSQL (Neon serverless):

**Tables:**
- `songs`: Audio metadata (id, title, artist, album, audioFile, duration, createdAt)
  - Artist field defaults to "Eddie Sing & The 31 Days"
  - Album field added for organizing music collections
- `challenges`: Challenge content (id, songId, segment, category, type, description, points, createdAt)
  - Categories: "Love & Romance", "Racism", "Sexism", "Homo/Transphobia", "Threat of A.I."
  - Types: "ACTION", "SHARE", "KNOW", "ALTERNATIVE"
  - Segment: 1-4 (60-second intervals)
  - Total: 4,400 challenges (11 songs × 4 segments × 100 challenges per segment)
  - Distribution: 20 challenges per type per category per segment (evenly distributed)
- `user_sessions`: Session state (id, sessionToken, totalPoints, completedChallenges, createdAt, lastActive)
  - completedChallenges stored as JSONB array of challenge IDs
  - Anonymous identification via truncated session IDs

**Relationships:**
- Challenges reference songs via foreign key with cascade delete
- User sessions track completed challenges via JSONB array field

**Key Design Decisions:**
- UUID primary keys for distributed compatibility
- JSONB for flexible completed challenges array
- Timestamp tracking for sessions and content creation
- Text fields for categorical data (category, type) instead of enums for flexibility
- HTTP-based Neon adapter (`drizzle-orm/neon-http`) for serverless compatibility

**Database Migrations:**
The application uses Drizzle for schema management. To apply schema changes:
```bash
npm run db:push
# If data-loss warning appears and migration is safe:
npm run db:push --force
```

Recent schema changes (November 2025):
- Added `currentScanSongId`, `currentScanSegment`, `lockedChallengeType`, and `lastScanAt` columns to `user_sessions` table for one-type-per-scan restriction feature

### External Dependencies

**Core Infrastructure:**
- Neon Database (@neondatabase/serverless) - PostgreSQL serverless database
- Drizzle ORM - Type-safe database queries and migrations

**Audio Processing:**
- **ACRCloud (acrcloud)** - Music recognition API for custom song identification
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

1. **Object Storage for Song Persistence**: Replit Object Storage replaces ephemeral filesystem, ensuring songs survive all deployments. Fetch-based implementation bypasses @google-cloud/storage npm install errors.

2. **Session-Based Anonymous Users**: No authentication system - users identified by session tokens, enabling frictionless onboarding critical for ARG participation.

3. **Segment-Based Challenge Organization**: Songs divided into 60-second segments (1-4) allowing progressive challenge unlocking as users listen through tracks.

4. **Client-Side Audio Recording**: Web Audio API used directly in browser to avoid server-side audio processing complexity.

5. **Mobile-First Gamification**: Card-based UI with prominent point displays, category badges, and social sharing optimized for smartphone touch interactions.

6. **Admin Panel Separation**: Dedicated admin routes and components for content management separate from user-facing ARG experience.