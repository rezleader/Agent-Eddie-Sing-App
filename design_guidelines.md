# American Split AI - ARG Music Recognition App Design Guidelines

## Design Approach

**Selected Approach**: Reference-Based Design inspired by gamification platforms (Duolingo, Kahoot), music apps (Spotify), and social platforms (Instagram, TikTok)

**Rationale**: This ARG combines social activism, music discovery, and gamified challenges requiring an engaging, mobile-first experience that encourages sharing and participation. The design must feel energetic and activist-oriented while maintaining usability for both gameplay and administration.

---

## Core Design Principles

1. **Activist Energy**: Bold, confident design that reflects social justice themes
2. **Mobile-First Gamification**: Card-based interactions optimized for smartphone use
3. **Clear Hierarchy**: Challenges, points, and actions must be instantly scannable
4. **Social-Ready**: Every interaction designed for easy sharing across platforms

---

## Typography System

**Primary Font**: Inter or Work Sans (Google Fonts)
- Clean, modern sans-serif for readability on mobile
- Strong hierarchy support

**Font Scale**:
- Hero/Album Title: 3xl to 4xl, font-bold
- Section Headers: 2xl, font-bold
- Challenge Card Titles: xl, font-semibold
- Body Text: base, font-normal
- Point Values/Metadata: sm, font-medium
- Button Text: base, font-semibold

**Typographic Hierarchy**:
- Challenge category names (RACISM, SEXISM, etc.): Uppercase, font-bold, tracked spacing
- Challenge types (ACTION, SHARE, KNOW, ALTERNATIVE): Uppercase, sm, font-bold
- Point values: Prominent, large size (2xl) when displayed as rewards

---

## Layout System

**Tailwind Spacing Units**: Consistent use of 4, 6, 8, 12, 16, 20, 24 for spacing
- Component padding: p-4 to p-6 (mobile), p-6 to p-8 (desktop)
- Section spacing: space-y-8 to space-y-12
- Card gaps: gap-4 to gap-6

**Mobile-First Grid**:
- Base: Single column, full-width cards
- Tablet (md:): 2-column grid for challenge cards
- Desktop (lg:): 3-column grid maximum for admin dashboard

**Container Strategy**:
- User Interface: max-w-2xl centered (focused, mobile-optimized)
- Admin Dashboard: max-w-7xl with sidebar layout
- Full-width sections for music player and timeline

---

## Component Library

### User Interface Components

**1. Music Recognition Scanner**
- Large, centered upload/record button with pulsing animation during listening
- Waveform visualization showing audio capture
- Song identification result card with album art, title, artist
- Horizontal timeline bar showing 4 time segments with clickable zones

**2. Challenge Cards** (Primary UI Element)
- Card format: Rounded corners (rounded-xl), shadow-lg
- Card header: Category badge + challenge type (ACTION/SHARE/KNOW/ALTERNATIVE)
- Card body: Challenge description, clear and scannable
- Card footer: Point value (large, bold) + Accept Challenge button
- Card states: Default, Active (when in current song segment), Completed (checkmark overlay)

**3. Timeline/Segmentation Display**
- Horizontal progress bar divided into 4 colored segments
- Each segment: Minute 1 (0-60s), Minute 2 (60-120s), Minute 3 (120-180s), Minute 4 (180s+)
- Current playback position indicator (draggable pin)
- Click segment to view available challenges
- Visual differentiation: Each segment has subtle background tint

**4. Point Display**
- Floating counter in header showing total points
- Point animations when challenges completed (+50, +75 popup)
- Progress bar toward next reward milestone

**5. Social Sharing Modal**
- Pre-formatted post content with hashtags (#AmericanSplit, category tags)
- Platform selection: FB, Instagram, Snapchat, TikTok with native share buttons
- Preview of how post will appear
- Quick copy-to-clipboard option

**6. Challenge Category Navigation**
- 5 tabs or pill buttons for categories: Love & Romance, Racism, Sexism, Homo/Transphobia, Threat of A.I.
- Active category highlighted with bold underline or filled background
- Category-specific accent colors for visual coding

### Admin Dashboard Components

**1. Song Management**
- Table view of uploaded songs with album art thumbnails
- CRUD operations: Upload, Edit, Delete
- Audio file upload with drag-and-drop
- Metadata fields: Title, Artist, Duration

**2. Challenge Editor**
- Form to create/edit challenges
- Category dropdown (5 categories)
- Challenge type selector (ACTION, SHARE, KNOW, ALTERNATIVE)
- Rich text editor for challenge description
- Point value input (1-100 slider with numeric display)
- Song assignment: Select song + time segment (1-4)

**3. Segment Assignment Interface**
- Visual song timeline (similar to user view)
- Drag-and-drop challenges onto segments
- Each segment shows count of assigned challenges
- Quick preview of challenge on hover

**4. Analytics Dashboard** (Optional but recommended)
- Cards showing: Total users, Challenges completed, Points distributed, Most popular songs
- Simple bar/line charts for engagement metrics

---

## Navigation Patterns

**User Interface**:
- Bottom navigation bar (mobile): Home (scanner), Challenges, Profile, Leaderboard
- Top header: Points counter, menu icon
- Floating Action Button: Quick access to "Scan Song"

**Admin Dashboard**:
- Sidebar navigation: Dashboard, Songs, Challenges, Users, Settings
- Collapsible on mobile (hamburger menu)

---

## Interaction Patterns

**Challenge Acceptance Flow**:
1. User scans/identifies song
2. Timeline appears showing 4 segments
3. Click segment → Challenge cards appear
4. Select challenge → Challenge details modal
5. Accept → Track completion or share to social media
6. Complete → Points awarded with animation

**Social Sharing Flow**:
1. Complete challenge → Share button appears
2. Click share → Platform selection modal
3. Select platform → Native share sheet opens with pre-formatted content
4. Share confirmation → Bonus points awarded

**Admin Challenge Creation**:
1. Navigate to Challenges → New Challenge
2. Fill form: Category, Type, Description, Points
3. Assign to Song + Segment
4. Save → Challenge appears in user interface

---

## Visual Treatment Notes

**Imagery**:
- Album artwork featured prominently in song recognition results
- Challenge category icons (custom or from Heroicons)
- User avatars in leaderboard/profile
- Social proof: Preview images for shared challenges

**Card Design**:
- Use subtle gradients or solid fills for category differentiation
- Consistent shadow elevation: shadow-md for standard cards, shadow-lg for active/featured
- Border radius: rounded-lg for small elements, rounded-xl for cards

**Buttons**:
- Primary action: Large, full-width on mobile (CTA for accepting challenges)
- Secondary: Outlined or ghost style
- Social share buttons: Platform-branded colors with icons
- Blurred backgrounds when overlaid on images

**Feedback & States**:
- Loading: Skeleton screens for content, spinner for actions
- Success: Green checkmark animations, confetti for milestones
- Completion: Grayed out or subtle checkmark overlay on completed challenges
- Error: Red toast notifications at top of screen

---

## Responsive Behavior

**Mobile (base to md)**:
- Single column layouts
- Full-width challenge cards
- Bottom sheet modals for challenge details
- Sticky header with points
- Collapsible timeline (tap to expand segments)

**Tablet (md to lg)**:
- 2-column challenge grid
- Expanded timeline always visible
- Side-by-side song list + challenge editor in admin

**Desktop (lg+)**:
- 3-column grid for admin challenge library
- Persistent sidebar navigation
- Wider containers with breathing room

---

This design creates an activist-focused, mobile-optimized ARG experience that gamifies social justice education through music while maintaining clear information architecture for both players and administrators.