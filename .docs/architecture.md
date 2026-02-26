# Technical Architecture & UX Design

## 1. Visual Aesthetics (UX/UI)
- **Theme**: Dark Mode (Space/Neon theme to reflect "Startup Innovation").
- **Colors**: 
  - `Primary`: #00F2FE (Electric Blue)
  - `Secondary`: #7367F0 (Neon Purple)
  - `Success`: #28C76F (Emerald)
  - `Background`: #0F172A (Deep Slate)
- **Design Elements**: 
  - Glassmorphism for dashboard cards.
  - Lottie animations for simulation status changes.
  - Interactive charts using `Chart.js` or `Recharts`.

## 2. Tech Stack Recommendation
- **Frontend**: Next.js (React) + Tailwind CSS + Framer Motion.
- **State Management**: Zustand or Redux Toolkit (for complex simulation state).
- **Backend**: Node.js/Express or Next.js API Routes.
- **Database**: PostgreSQL (Prisma ORM) for relational team/member data.
- **Real-time**: Socket.io or Supabase Realtime for live leaderboard updates and simulation "ticks".

## 3. Detailed Page Components

### Participant Dashboard components:
- `StatCard`: Glassy card showing real-time metrics with sparklines.
- `ActionQueue`: Timeline of upcoming simulation events.
- `DecisionConsole`: Set of buttons/forms to interact with the simulation.

### Admin Dashboard components:
- `GlobalTicker`: Admin-only view of all simulation events.
- `TeamMatrix`: Searchable grid of teams with one-click moderation actions.
- `MarketTriggerPanel`: Quick-access buttons for pre-set scenarios (e.g., "Investment Boom").

## 4. Security & Access Control
- **Public**: Access to Landing, Rules, Schedule.
- **Participant**: Access to Personal/Team Dashboard.
- **Judge**: Access to Judging Portal (view-only submissions + grading).
- **Admin**: Full system access.
- **Implementation**: JWT-based auth with RBAC (Role Based Access Control).
