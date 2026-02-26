# Startup Simulation Hackathon - Sitemap & Page Structure

## 1. Overview
The Startup Simulation Hackathon platform is a multi-role web application designed to host competitive entrepreneurship simulations. It manages the entire lifecycle of a hackathon, from registration to final pitching and simulation-based scoring.

---

## 2. Sitemap

### A. Public Pages (Guest/Non-Participant)
- **Home (Landing Page)**: Event hook, statistics, mission, and "Register" CTA.
- **Rules & FAQ**: Detailed guidelines, scoring criteria, and simulation mechanics.
- **Schedule**: Live timeline of events, workshops, and deadlines.
- **Public Leaderboard**: Real-time ranking of top 10 teams (limited view).
- **Sponsors & Partners**: Recognition of supporting organizations.
- **Auth**:
  - Login
  - Register (Individual or Team Lead)
  - Password Recovery

### B. Participant Dashboard (Logged In)
- **Overview (Home)**: 
  - Team Health (Funds, Users, Reputation).
  - Current Rank.
  - Active Tasks/Deadlines.
- **Team Hub**:
  - Member management (Invite, Assign Roles).
  - Team Profile (Logo, Bio, Startup Name).
- **Simulation Console**: 
  - **Metrics**: Visual charts of growth, churn, and revenue.
  - **Marketplace**: Buy resources (Cloud credits, Marketing boosts, Virtual hires).
  - **Decision Engine**: Submit strategy choices (e.g., "Pivot to B2B", "Raise Series A").
- **Submissions**:
  - Milestone uploads (Pitch deck, MVP link, Financial model).
- **Resources**: 
  - Toolkits, mentor contact info, and workshop recordings.
- **Notifications**: System alerts, mentor feedback, and market shifts.

### C. Admin Dashboard (Organizer Only)
- **Control Tower**:
  - Event Start/Stop/Pause.
  - Simulation "Tick" Speed Controller.
- **Team Management**:
  - List of all teams + status.
  - CRUD operations on teams/users.
  - Manual score overrides.
- **Simulation Parameters**:
  - Global market constants (Volatility, Interest rates).
  - Event triggers (e.g., "Market Crash" scenario).
- **Judging Suite**:
  - Judge onboarding.
  - Team-to-Judge assignment.
  - Final score aggregation.
- **Broadcast**:
  - Site-wide announcements.
- **Support Tickets**: Managing participant queries.

---

## 3. User Flows

### Flow 1: The Participant Journey
1. **Discovery**: User lands on `Home`, reads `Rules`.
2. **Onboarding**: User `Registers` -> `Email Verification` -> `Creates Team`.
3. **Execution**: User accesses `Participant Dashboard` -> `Team Hub` to invite friends.
4. **Simulation**: User monitors `Simulation Console` -> Spends "Virtual Seed Funds" in `Marketplace` -> Observes `Metrics`.
5. **Submission**: User uploads `Pitch Deck` in `Submissions`.
6. **Finality**: View final placement in `Leaderboard`.

### Flow 2: The Admin Setup
1. **Configuration**: Admin logs in -> `Simulation Parameters` to set initial market conditions.
2. **Monitoring**: Uses `Control Tower` to start the clock.
3. **Moderation**: Checks `Team Management` to filter out inactive teams.
4. **Triggering**: Manually pushes a "Market Event" via `Control Tower`.
5. **Judging**: Closes submissions -> `Judging Suite` to assign deliverables to judges.

---

## 4. Key Metrics & Logic
- **Simulation Metrics**: Revenue, User Base, Burn Rate, Runway, Valuation.
- **Scoring Logic**: `(Revenue * Growth) + (Judge Score * Weight) - (Risk Factor)`.
