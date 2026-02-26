# Participant Dashboard UI Design Specification

The Participant Dashboard is a "Startup Command Center." It is designed to be immersive, data-driven, and highly interactive, simulating the high-pressure environment of a growing company.

---

## 1. Visual Theme (Immersive)
- **Concept**: "The Glass Cockpit" – everything feels like an advanced cockpit of a spacecraft or high-tech trading floor.
- **Surface**: High-contrast dark mode with neon data points.
- **Feedback**: Haptic-like visual feedback (subtle glows on click, data tremors during "Market Events").

---

## 2. Dashboard Layout

### A. Sidebar (The Operations Menu)
- **Team Identity**: Logo + Startup Name + Current Valuation.
- **Nav Items**:
    - `Overview` (Main cockpit)
    - `Team Hub` (Manage members/roles)
    - `Marketplace` (Spend tokens on perks)
    - `Strategy & Pivots` (Submit major decisions)
    - `Submissions` (Upload deliverables)
    - `Mentor Chat` (Support channel)

### B. Top Header (The Vitals)
- **Live Metrics**: A horizontal ticker showing:
    - **Cash Balance**: 🪙 45,000
    - **Monthly Burn**: 📉 2,500
    - **Runway**: 🗓️ 6 Months
    - **Users**: 👥 1,240 (+12%)

---

## 3. Core Sections & Components

### 📈 1. Simulation Console (The Hero)
- **Interactive Chart**: A large, multi-line graph (Recharts) showing Revenue vs. User Growth vs. Burn.
- **Event Feed**: A vertical scrolling ticker on the right showing live "Ticks":
    - *[14:10] New Marketing Campaign launched (+50 users)*
    - *[13:55] Cloud billing cycle (-200 tokens)*
    - *[12:00] Market Event: 'AI Hype' increased valuations by 1.2x*

### 🛠️ 2. The Marketplace (Spending Tokens)
- **Layout**: Grid of "Upgrade Cards."
- **Categories**:
    - **Talent**: "Hire Virtual Senior Dev" (Duces churn, increases dev speed).
    - **Cloud**: "Scalable Infra Upgrade" (Handles more traffic).
    - **Marketing**: "Social Media Blitz" (Immediate user spike).
- **Interaction**: Clicking "Buy" opens a confirmation modal showing the immediate impact on stats.

### 🎯 3. Strategy Board
- **Logic**: A "Decision Tree" interface. 
- **Action**: Teams choose between paths (e.g., "Pivot to B2B" vs. "Stay B2C").
- **Visual**: A progress bar showing how long the pivot takes to reflect in simulation stats.

### 📤 4. Milestone Vault (Submissions)
- **Cards**: Deadline-driven boxes for Pitch Decks, Lean Canvas, and Video Demos.
- **Status**: Visual indicators for `Pending`, `Submitted`, and `Judged`.

---

## 4. Mobile & Responsive Design
- **Bottom Navigation**: Major operations accessible via thumb.
- **Compact Rails**: Ticker collapses into a single "Health Bar" at the top of the mobile screen.
- **Chart Handling**: Switches from 3-series to single-series view (User chooses which metric to focus on).

---

## 5. Gamification Mechanics
- **Badges**: Floating icons for "First Sale," "Unicorn Status," or "Pivot King."
- **Team Health Bar**: A colorful gradient (Green → Red) that shifts based on the "Burn Rate vs. Cash" ratio.
