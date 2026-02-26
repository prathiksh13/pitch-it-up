# Admin Dashboard UI Design Specification

The Admin Dashboard is the "Mission Control" of the hackathon. It prioritizes data density, real-time control, and intuitive navigation.

---

## 1. Design Language (Aesthetics)
- **Base Theme**: Dark Mode (Deep Slate `#0F172A`).
- **Accent Colors**: Electric Blue (`#00F2FE`), Neon Purple (`#7367F0`).
- **Surface**: Glassmorphism (Semi-transparent cards with `backdrop-filter: blur(12px)`).
- **Typography**: `Outfit` (Headings) and `Inter` (Body/Data).

---

## 2. Layout Structure

### A. Persistent Sidebar (Left - Desktop / Bottom - Mobile)
- **Profile Summary**: Admin Avatar + "Super Admin" badge.
- **Navigation Links**:
    - `Dashboard Overview` (The High-Level view)
    - `Event Rounds` (Control timelines)
    - `Team Matrix` (Manage teams/users)
    - `Problem Bank` (Edit problem statements)
    - `Token Center` (Distribution & Logs)
    - `Judging Suite` (Shortlisting & Grading)

### B. Top Navigation
- **Global Status**: Live indicator (e.g., "Round 2: Active - 01:45:12 remaining").
- **Quick Action**: "Broadcast Message" button.
- **Notifications**: Ping for support tickets or critical simulation errors.

---

## 3. Core Sections & Components

### 🏗️ 1. Control Tower (The "God View")
- **Layout**: Large Hero section at the top.
- **Components**:
    - **Live Timeline**: Visual slider showing event progress.
    - **Kill Switch & Play**: Large, guarded buttons to pause/resume the global simulation clock.
    - **Scenario Triggers**: A grid of "Event Cards" like *Market Crash*, *Seed Funding Boom*, *Tech Outage*—pressing one triggers a site-wide simulation shift.

### 🏃 2. Team Matrix (Management)
- **Layout**: Searchable, filterable data table.
- **Features**:
    - Sparkline charts in each row showing 24h performance.
    - Status toggle (Active / Shortlisted / Eliminated).
    - "Impersonate" button to view the dashboard from a specific team's perspective.

### 🗳️ 3. Token & Shortlisting Center
- **Layout**: Two-column split.
- **Left Column (Distribution)**: Total tokens in circulation vs. tokens held by teams. One-click "Grant 500 Tokens to All" button.
- **Right Column (Shortlist Control)**: Vertical list of teams ordered by score. A "Shortlist Top X Teams" slider with a "Finalize" button.

### 📊 4. Real-time Leaderboard Snippet
- **Component**: A vertical ticker on the far right.
- **Behavior**: Teams slide up and down with glow effects when ranks change.
- **Data**: Shows "Name | Valuation | Community Votes".

---

## 4. Responsive Adaptations

| Screen Size | Adaptation |
| :--- | :--- |
| **Desktop (1440px+)** | 3-column layout (Sidebar \| Main \| Leaderboard). |
| **Tablet (1024px)** | 2-column layout (Sidebar \| Main with Leaderboard as a modal/drawer). |
| **Mobile (375px)** | Single column. Full-screen section switching via bottom nav. Data tables convert to card stacks. |

---

## 5. Micro-Interactions
- **Hover Transitions**: Cards slightly elevate with a neon border glow.
- **Success Toasts**: "Market Crash Triggered Successfully" in emerald green.
- **Processing States**: Buttons show a spinning loader when recalculating leaderboard scores.
