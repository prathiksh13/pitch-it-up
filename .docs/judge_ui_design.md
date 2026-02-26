# Teacher & Judge Portal UI Design Specification

The Judge Portal is built for **efficiency and objectivity**. Judges often have limited time to review dozens of teams, so the UI focuses on clarity and quick-action grading.

---

## 1. Design Philosophy
- **Base Theme**: Clean "Studio" look (Solid Slate or Light/Dark toggle).
- **Core Goal**: Zero-friction review.
- **Accents**: Gold (`#F1C40F`) for top-tier teams, Muted Blue for standard controls.

---

## 2. Layout Structure

### A. List View (Review Queue)
- **Filters**: Sort by "Pending Review," "High Growth," or "Problem Statement."
- **Team Snippet Cards**:
    - Startup Name + Industry.
    - Growth Sparkline (to see simulation performance at a glance).
    - Status Indicator: `NOT GRADED` (Yellow) / `REVIEWED` (Green).

### B. Detailed Review Panel (Split Screen)
When a team is selected, the screen splits:
- **Left (The Evidence)**:
    - PDF Viewer for Pitch Decks.
    - Embed for Video Demo / MVP Link.
    - Simulation Stats Summary (Financial performance).
- **Right (The Scorecard)**:
    - **Sliders (1-10)**: Innovation, Market Size, Financial Modeling, Presentation.
    - **Quick Note Box**: For qualitative feedback.
    - **Shortlist Toggle**: A "Star" icon to mark teams for the final grand finale.

---

## 3. Key Features

### ⚖️ 1. Normalized Grading
- **Logic**: The system shows a "Class Average" for each metric to help judges maintain consistency across 20+ teams.

### 🚩 2. Red-Flagging
- **Action**: A "Red Flag" button for teams that might be violating rules or using AI inappropriately for original content. This alerts Admins immediately.

### 📊 3. The Comparison Bucket
- **Function**: Judges can select 3 teams to view their deliverables side-by-side. Useful for break-point decisions (e.g., who gets the 3rd place spot).

---

## 4. Mobile & Responsive Design
- **Tablet Optimized**: Judges often move between rooms with an iPad or Tablet. The UI is custom-tailored for touch-drag sliders and palm-rejection note-taking.
- **Queue Management**: Swipe left to dismiss/skip, swipe right to shortlist.

---

## 5. Security & Privacy
- **Anonymous Mode**: Option for judges to see Team Code Names instead of real names to prevent bias.
- **Audit Logs**: Every score change is timestamped to prevent post-deadline tampering.
