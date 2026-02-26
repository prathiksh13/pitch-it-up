# Non-Participant Voting Portal Workflow

This workflow describes the UX and Logic for the public voting system where non-participating students can support their favorite startup teams using virtual tokens.

---

## 🚀 The Workflow Journey

### 1. Step 1: Identification & Token Grant
- **User Action**: Student navigates to the "Community Choice" portal.
- **Entry**: Prompted to enter their **Roll Number**.
- **System Logic**:
    - **Check**: Does this Roll Number exist in the `Voters` table?
    - **If New**: Create a New Record + Grant **500 Tokens** (Standard starting balance).
    - **If Existing**: Recall the existing `token_balance`.
- **UX**: Display a "Welcome [Roll Number]! You have 500 tokens to invest." toast notification.

### 2. Step 2: Voting Round Validation
- **System Logic**:
    - Check the `Event Rounds` table.
    - Query: `WHERE type = 'voting' AND status = 'active'`.
- **Condition A (No Active Round)**: Show a "Voting is currently closed. Next round starts at [Time]."
- **Condition B (Success)**: Proceed to the Team Gallery.

### 3. Step 3: Team Discovery & Selection
- **Display**: Show a grid of `Teams` where `status = 'shortlisted'`.
- **Team Cards Include**:
    - Startup Name & Logo.
    - Elevator Pitch (30 words).
    - "Power Score" (How many tokens they have received so far).
- **User Action**: Click "Support Team".

### 4. Step 4: Transaction & Deduction
- **User Action**: Input an amount (e.g., 50 tokens).
- **Validation (Frontend & Backend)**:
    - `IF (input_amount <= current_voter_balance)`:
        - Deduct `amount` from `Voters.token_balance`.
        - Add `amount` to `Teams.wallet_balance` OR specialized `Team.votes_tally`.
        - Create a record in `Voter Transactions` for the audit trail.
    - `ELSE`: Show error "Insufficient Token Balance".
- **UX**: Confetti animation + Update remaining balance on the navbar.

---

## 🛠️ Security Measures
1. **Roll Number Rate Limiting**: Prevent brute-force roll number entry to farm tokens (IP-based throttling).
2. **Transaction Atomicity**: Ensure that common database transactions are used so tokens aren't "lost" or "duplicated" if a network error occurs.
3. **Shortlist Check**: Ensure the API endpoint only returns teams with the `shortlisted` flag to prevent voting for disqualified teams.

---

## 📊 Success Metrics for Admins
- **Total Tokens Circulated**: Sum of all transactions.
- **Voter Participation**: Number of unique roll numbers engaged.
- **Viral Coefficient**: Which teams are attracting the most "External Investment" (tokens).
