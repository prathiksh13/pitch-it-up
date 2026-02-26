# Startup Hackathon Platform - Full Documentation

A complete, responsive full-stack website for hosting startup simulation hackathons. Built with **Next.js 14**, **Firebase Firestore**, and **Firebase Authentication**.

## 🚀 Features
- **Role-Based Access**: Admin, Participant, Teacher, and Student Voter roles.
- **Admin Dashboard**: Control event rounds, approve teams, shortlist startups, and manage problem statements.
- **Participant Portal**: Manage team info, view assigned problems, and submit project links.
- **Voting Logic**: Secure atomic transaction system for token-based community investments.
- **Live Leaderboard**: Instant updates via Firestore listeners with smooth framer-motion animations.
- **Theming**: Premium dark/light mode with persistent user preference.
- **Responsive**: Fully optimized for mobile, tablet, and desktop.

---

## 🛠️ Firebase Setup Instructions

1.  **Create a Project**: Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Authentication**:
    - Enable **Email/Password** provider (for Admins).
3.  **Firestore Database**:
    - Create a database in **Production Mode** (Asia-South1 or US-Central1).
    - Deploy the security rules provided in `firestore.rules`.
4.  **Register App**:
    - Select the Web icon (`</>`) to register a new web app.
    - Copy the `firebaseConfig` object and paste it into `src/lib/firebase.ts`.
5.  **Initial Setup**:
    - Create a document in collection `eventStatus` with ID `global`.
    - Fields: `registrationOpen: true`, `votingRoundActive: false`, `resultsFinalized: false`, `currentRound: "Registration"`.

---

## 🚢 Deployment Steps (Vercel)

1.  **Push to GitHub**: Initialize a git repo and push the code.
2.  **Connect to Vercel**:
    - Go to [Vercel](https://vercel.com/) and import your repository.
    - No build command changes needed (Vercel auto-detects Next.js).
3.  **Environment Variables**:
    - Ensure your Firebase config is accurately placed in `src/lib/firebase.ts` or move them to `.env.local` and update the code to use `process.env`.
4.  **Deploy**: Click Deploy.

---

## 🔒 Security Checks
- **Atomic Transactions**: Tokens are never double-spent or lost due to `runTransaction`.
- **RBAC**: Protected routes in Next.js ensure participants cannot access Admin tools.
- **Roll Number Hardening**: Roll numbers can only claim tokens once and are stored as unique document IDs.

### 6. Admin Portal
- **Secret Link**: `https://your-domain.com/admin-portal-access`
- **Example Credentials (to be created in Firebase)**:
  - **Email**: `admin@hackathon.com`
  - **Password**: `hackathon2026!admin`
  - **Role**: `admin` (Set this field in Firestore under the `users` collection for this UID)

### 7. Student/Voter Test Credentials
- **Roll Number**: `TEST2026` (Grant 250/500 tokens in Firestore to test)
- **Role**: `student`

---

## 📁 Folder Structure
- `src/app`: Next.js App Router pages and layouts.
- `src/components`: UI components (Navbar, Leaderboard, Sidebar).
- `src/context`: Auth and Theme state management.
- `src/lib`: Firebase initialization and utilities.
- `firestore.rules`: Critical production security guards.

`npm run dev -- --hostname 0.0.0.0 --port 3000`
