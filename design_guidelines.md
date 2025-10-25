# Voluntapp Mobile Application Design Guidelines

## Design Approach

**Reference-Based Approach:** Drawing inspiration from successful mobile discovery platforms including Tinder (card-based discovery), Instagram (visual engagement), LinkedIn (professional networking), and Airbnb (location-based experiences) to create an engaging volunteer opportunity matching experience.

**Core Design Principles:**
- Mobile-first, touch-optimized interactions
- Card-based discovery for immersive browsing
- Visual storytelling through imagery
- Effortless personalization and filtering
- Clear distinction between volunteer and organization modes

## Typography System

**Primary Font:** Inter (via Google Fonts CDN)
**Secondary Font:** Poppins for headlines and impact moments

**Type Scale:**
- Hero Headlines: Poppins, 32px, Bold (organization names, opportunity titles)
- Section Headers: Poppins, 24px, Semibold
- Card Titles: Inter, 18px, Semibold
- Body Text: Inter, 16px, Regular
- Metadata/Labels: Inter, 14px, Medium
- Captions: Inter, 12px, Regular
- Button Text: Inter, 16px, Semibold

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8 (p-2, p-4, p-6, p-8, etc.)
- Micro spacing (badges, icons): 2 units
- Standard component spacing: 4 units
- Section spacing: 6 units
- Major layout spacing: 8 units

**Container Strategy:**
- Mobile viewport: Full width with 4-unit horizontal padding
- Maximum content width: 100% (mobile-optimized)
- Card containers: Rounded corners with 6-unit radius
- Safe areas: Account for mobile notches and navigation bars

## Navigation Architecture

**Bottom Tab Navigation (Primary):**
- Five tabs: Discover, My Opportunities, Profile, Organizations, Create (org mode)
- Fixed bottom position with elevated shadow
- Icon + label combination using Heroicons
- Active state with filled icons
- Tab bar height: 16 units with 2-unit padding

**Top Navigation Bar:**
- App logo/name on left
- Filter/search icon on right
- Location indicator (city name with pin icon)
- Notification bell with badge indicator
- Height: 14 units with status bar consideration

## Component Library

### 1. Opportunity Discovery Cards (Primary Feature)

**Full-Screen Swipeable Cards:**
- Large hero image (400px height minimum)
- Gradient overlay at bottom for text legibility
- Overlay content includes:
  - Organization logo (circular, 48px)
  - Opportunity title (truncate at 2 lines)
  - Quick stats row (duration, volunteers needed, distance)
  - Category badges (max 2 visible)
- Swipe actions: Right (interested), Left (pass), Up (save for later)
- Action buttons at bottom: Pass (X icon), Save (bookmark), Apply (heart)

### 2. Opportunity List Cards (Alternative View)

**Horizontal Cards:**
- Left: Square thumbnail image (96px × 96px)
- Right: Content area with 4-unit padding
  - Organization name (small, gray)
  - Opportunity title (2 line max)
  - Location + distance badge
  - Date/time commitment
  - Quick action button (Apply/View)
- Card spacing: 4 units between cards
- Rounded corners with subtle shadow

### 3. Profile Components

**User Profile Header:**
- Large circular avatar (120px) centered
- Name below (24px, Semibold)
- Location and member since metadata
- Stats row: Opportunities completed, Hours volunteered, Impact score
- Edit profile button (secondary style)

**Completed Opportunities Timeline:**
- Chronological list with month/year dividers
- Mini cards with thumbnail, title, date, organization
- "View certificate" or "Share" actions
- Infinite scroll pagination

### 4. Organization Dashboard

**Opportunity Management Cards:**
- Header with opportunity title and status badge (Active/Paused/Completed)
- Summary metrics (views, applications, confirmed volunteers)
- Thumbnail image with edit overlay
- Action buttons: Edit, Pause/Resume, View Applications
- Application count with notification dot

### 5. Onboarding Flow

**Step-by-Step Screens:**
- Welcome screen with full illustration
- Account type selection (large tiles: "I want to volunteer" vs "I'm an organization")
- Profile setup with progressive disclosure:
  - Step 1: Email and name
  - Step 2: Location (map picker with search)
  - Step 3: Interests (multi-select pills, minimum 3)
  - Step 4: Availability preferences (calendar-style picker)
- Progress indicator at top (dots or bar)
- "Skip" option for optional fields
- Large, centered CTAs for each step

### 6. Forms & Inputs

**Text Inputs:**
- Height: 12 units
- Border radius: 2 units
- Label above input (14px, Medium)
- Placeholder text with lower contrast
- Focus state with border emphasis
- Error state with message below

**Selection Controls:**
- Interest Pills: Multi-select chips with checkmark icon, pill-shaped
- Location Picker: Map interface with search bar, current location button
- Date/Time Pickers: Native mobile pickers
- Toggle Switches: For notifications and preferences

**Primary Buttons:**
- Height: 12 units
- Full width on mobile
- Border radius: 3 units
- Semibold text, 16px
- Prominent CTA positioning

**Secondary Buttons:**
- Same height, outline style
- Less visual weight
- Use for alternative actions

### 7. Search & Filters

**Filter Panel (Slide-up Modal):**
- Category chips (all interests)
- Distance slider with live preview
- Date range calendar
- Time commitment options
- Clear all and Apply buttons at bottom

**Search Bar:**
- Height: 10 units
- Search icon prefix
- Voice search icon suffix (optional)
- Recent searches below when focused
- Auto-suggestions as user types

### 8. Status & Feedback

**Loading States:**
- Skeleton screens for card loading
- Shimmer animation on placeholders
- Pull-to-refresh with custom indicator

**Empty States:**
- Centered illustration
- Headline explaining no results
- Helpful suggestion text
- CTA to adjust filters or explore all

**Success/Error Toasts:**
- Slide from top or bottom
- Auto-dismiss after 3 seconds
- Icon + message + optional action
- Positioned to avoid navigation bars

## Images Strategy

**Hero Images:** 
- Every opportunity MUST have a representative image
- Dimensions: 1200×800px minimum (3:2 aspect ratio)
- Images showing volunteers in action, community impact, or location context
- Organization logos: Square, 512×512px minimum
- Profile avatars: Circular crop, 400×400px recommended

**Image Placement:**
- Discovery cards: Full-width hero at top
- List view: Square thumbnail on left
- Organization profiles: Banner image (16:9) + circular logo overlay
- Onboarding: Full-screen illustrations for each step
- Empty states: Centered illustrations

**Image Treatment:**
- Subtle rounding on corners (6-unit radius)
- Gradient overlays when text appears over images (linear gradient from transparent to semi-dark)
- Blurred backgrounds for buttons over images

## Interaction Patterns

**Gestures:**
- Swipe cards left/right for discovery
- Pull down to refresh feeds
- Swipe left on list items for quick actions
- Pinch to zoom on images
- Long press for additional options

**Transitions:**
- Page transitions: Slide from right (forward), slide to right (back)
- Modal presentations: Slide up from bottom with dimmed background
- Card interactions: Scale and fade animations
- Loading content: Fade in with stagger for lists

**Micro-interactions:**
- Heart animation on save/apply
- Checkbox fills when selecting interests
- Button press with subtle scale down
- Toast notifications slide in smoothly

## Accessibility

- Minimum touch target: 44×44px (11 tailwind units)
- High contrast text on all backgrounds
- Screen reader labels for all interactive elements
- Alternative text for all images
- Keyboard navigation support for web version
- Focus indicators visible and clear

## Special Considerations

**Location Features:**
- Map view toggle for opportunity browsing
- Distance indicators always visible
- "Near me" quick filter prominent
- Location permission prompt with clear benefits

**Personalization Algorithm Display:**
- "Recommended for you" badge on matches
- Brief explanation of why opportunity matches ("Based on your interest in Education")
- "Not interested" feedback loop with reason selection

**Dual User Types:**
- Mode switcher in profile/settings
- Conditional navigation (Create tab only for organizations)
- Different dashboards for volunteers vs organizations
- Clear visual distinction between modes

This design creates an engaging, modern mobile volunteer discovery experience that prioritizes visual content, ease of use, and personalized matching while maintaining clarity for both volunteers and organizations.