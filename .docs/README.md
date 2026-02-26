# Startup Simulation Hackathon Platform

This directory contains the structural and architectural planning for a comprehensive hackathon platform focused on startup simulations.

## Project Contents
1.  **[sitemap.md](./sitemap.md)**: Overall page structure and navigation.
2.  **[architecture.md](./architecture.md)**: Technical stack and UI/UX design philosophy.
3.  **[schema.md](./schema.md)**: Database models and relationship mapping.
4.  **[auth_plan.md](./auth_plan.md)**: Role-Based Access Control (RBAC) and security.
5.  **[voting_workflow.md](./voting_workflow.md)**: Non-participant student voting logic.
6.  **[token_logic.md](./token_logic.md)**: Transactional integrity and anti-cheat design.
7.  **[leaderboard_system.md](./leaderboard_system.md)**: Real-time ranking and WebSocket sync logic.
8.  **[admin_ui_design.md](./admin_ui_design.md)**: Mission Control interface for organizers.
9.  **[participant_ui_design.md](./participant_ui_design.md)**: High-pressure simulation console for hackers.
10. **[judge_ui_design.md](./judge_ui_design.md)**: Efficiency-focused grading portal for teachers.

## Role-Based Dashboard Strategy

### 🛡️ Admin (Mission Control)
Focus on **Macro-Management**. Controlling the speed of time, triggering market volatility, and moderating team status.

### 🚀 Participant (The Cockpit)
Focus on **Micro-Execution**. Monitoring burn rates, purchasing viral marketing, and making "pivot" decisions to survive the simulation.

### 🎓 Teacher/Judge (The Reviewer)
Focus on **Fair Appraisal**. A streamlined view for grading deliverables side-by-side with simulation performance metrics.

### 🗳️ Student/Voter (The Public)
Focus on **Community Engagement**. Entering a roll number to receive "Investment Tokens" to back their favorite startups.

## User Flow Summary
- **Phase 1 (Preparation)**: Register -> Team Formation -> Onboarding Workshop.
- **Phase 2 (Simulation)**: Dashboard opens -> Market starts -> Metrics update hourly -> Decisions made daily.
- **Phase 3 (Climax)**: Submission of Pitch Decks -> Admin closes Market -> Judges grade deliverables.
- **Phase 4 (Results)**: Final scores computed (Simulation metrics + Judge scores) -> Winner announcement on Leaderboard.
