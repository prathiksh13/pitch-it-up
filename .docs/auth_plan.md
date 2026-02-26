# Authentication & Role-Based Access Control (RBAC) Plan

This document outlines the security architecture for the Startup Simulation Hackathon platform, ensuring each user role has the correct level of access and a tailored login experience.

---

## 1. Identity Matrix

| Role | Primary Login Method | Dashboard Access | Core Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | SSO (Google/Workplace) + 2FA | Admin Control Tower | Full System Access (CRUD), Simulation Ticks, User Management. |
| **Teacher (Judge)** | Magic Link (Email) | Judging Suite | View Submissions, Grade Teams, Leave Feedback. |
| **Participant** | Email/Password or OAuth | Participant Portal | Team Management, Simulation Actions, Submissions. |
| **Non-Participant** | Guest (No Login) | Landing & Public Leaderboard | Read-only access to public info and rules. |

---

## 2. Authentication Methods

### A. Admin (High Security)
*   **Method**: Single Sign-On (SSO) integrated with the organization's domain.
*   **Strategy**: Require Multi-Factor Authentication (2FA) via Authenticator App.
*   **Rationale**: Admins can alter simulation metrics and reset teams; leak prevention is critical.

### B. Teacher/Judge (Convenience)
*   **Method**: **Magic Links** (Passwordless).
*   **Strategy**: Administrator invites the teacher via email. The teacher clicks a unique time-sensitive link to log in directly.
*   **Rationale**: Judges are often external guests who shouldn't be forced to manage another password.

### C. Participant (Standard)
*   **Method**: Social OAuth (Google/GitHub) or traditional Email/Password.
*   **Strategy**: Standard JWT (JSON Web Token) with a 24-hour expiry.
*   **Rationale**: Fast onboarding during high-pressure hackathons is essential.

### D. Non-Participant
*   **Method**: No login required for public pages.
*   **Strategy**: Session-based tracking (optional) for analytics.

---

## 3. Permission Logic (Middleware)

The application uses **Role-Based Access Control (RBAC)**. Requests are filtered through a middleware layer:

### Pseudo-Code Implementation
```javascript
const checkPermission = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role; // Decoded from JWT
    if (allowedRoles.includes(userRole)) {
      next(); // Access granted
    } else {
      res.status(403).json({ message: "Access Denied: Insufficient Permissions" });
    }
  };
};

// Route Examples
router.post('/simulation/tick', checkPermission(['admin']), triggerTick);
router.post('/submission/grade', checkPermission(['admin', 'teacher']), submitGrade);
router.post('/simulation/action', checkPermission(['participant']), takeAction);
```

---

## 4. Specific Access Levels

### 🛠️ Admin (Full Control)
- **POST** `/api/v1/event/trigger-market-crash`
- **DELETE** `/api/v1/teams/:id`
- **GET** `/api/v1/admin/analytics`

### 🎓 Teacher/Judge (Reviewer)
- **GET** `/api/v1/submissions/pending`
- **POST** `/api/v1/teams/:id/score`
- **CANNOT** edit simulation metrics or delete users.

### 🚀 Participant (Operator)
- **GET** `/api/v1/team/my-stats`
- **POST** `/api/v1/simulation/buy-resource`
- **CANNOT** see other teams' internal stats or private judge comments.

### 👁️ Non-Participant (Observer)
- **GET** `/api/v1/event/leaderboard` (Public view only)
- **GET** `/api/v1/content/rules`
- **CANNOT** access any `/api/v1/dashboard/*` routes.
