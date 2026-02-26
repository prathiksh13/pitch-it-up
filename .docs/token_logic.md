# Token Transaction Logic & Security

This document details the implementation of the virtual economy for the voting portal, focusing on transactional integrity and anti-cheat mechanisms.

---

## 1. Token Life Cycle

### A. Assignment (The "Airdrop")
- **Trigger**: First-time login with a valid Roll Number.
- **Logic**: 
  - Check if `roll_number` exists in `Voters` table.
  - If NOT: Create record with `token_balance: 500`.
- **Anti-Cheat**: 
  - Roll number format validation (e.g., regex `^[A-Z0-9]{8,12}$`).
  - IP-based rate limiting (preventing automated balance farming).

### B. The Transaction (The "Vote")
- **Flow**: Voter (Roll No) $\rightarrow$ Amount $\rightarrow$ Team ID.
- **Database Sequence**: Must be wrapped in a **Database Transaction (ACID)** to prevent partial failures.

---

## 2. Implementation Logic (Node.js/PostgreSQL Example)

```javascript
async function castVote(voterRollNo, teamId, amount) {
  // 1. Validation Rules
  if (amount <= 0) throw new Error("Amount must be positive");
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN'); // Start Transaction

    // 2. Fetch Voter Balance (Lock for update to prevent double-spending)
    const voterRes = await client.query(
      'SELECT token_balance FROM voters WHERE roll_number = $1 FOR UPDATE',
      [voterRollNo]
    );
    const balance = voterRes.rows[0].token_balance;

    if (balance < amount) {
      throw new Error("Insufficient tokens");
    }

    // 3. Verify Team Eligibility (Is it shortlisted?)
    const teamRes = await client.query(
      'SELECT status FROM teams WHERE id = $1',
      [teamId]
    );
    if (teamRes.rows[0].status !== 'shortlisted') {
      throw new Error("Team is not eligible for votes");
    }

    // 4. Deduct from Voter
    await client.query(
      'UPDATE voters SET token_balance = token_balance - $1 WHERE roll_number = $2',
      [amount, voterRollNo]
    );

    // 5. Add to Team Wallet
    await client.query(
      'UPDATE teams SET wallet_balance = wallet_balance + $1 WHERE id = $2',
      [amount, teamId]
    );

    // 6. Log Transaction
    await client.query(
      'INSERT INTO voter_transactions (id, voter_roll_number, team_id, amount, timestamp) VALUES ($1, $2, $3, $4, NOW())',
      [uuid(), voterRollNo, teamId, amount]
    );

    await client.query('COMMIT'); // Success
    return { success: true };

  } catch (error) {
    await client.query('ROLLBACK'); // Failure: Undo everything
    throw error;
  } finally {
    client.release();
  }
}
```

---

## 3. Anti-Cheat & Validation Rules

| Rule Name | Logic | Purpose |
| :--- | :--- | :--- |
| **Atomic Updates** | Use `UPDATE ... SET balance = balance - X` instead of updating to a pre-calculated value. | Prevents "Lost Updates" in high-concurrency environments. |
| **Shortlist Constraint** | `WHERE team_id IN (SELECT id FROM teams WHERE status = 'shortlisted')`. | Prevents bad actors from sending tokens to disqualified or non-existent teams via API. |
| **Negative Check** | Database constraint: `CHECK (token_balance >= 0)`. | A hardware-level safeguard ensuring balances can never go below zero. |
| **Rate Throttling** | Limit a single Roll Number to 1 vote every 5 seconds. | Prevents automated macro-bots from tilting the leaderboard too quickly. |
| **Dual-Logging** | Record in `voter_transactions` AND update `teams.total_votes`. | Allows admins to cross-reference logs if a team's score looks suspicious. |

---

## 4. Admin Recovery
In case of a detected exploit, admins can:
1. **Pause Simulation**: Sets `Event Round` status to `paused`, disabling the `castVote` middleware.
2. **Revert Transaction**: Admins can query `voter_transactions` for a specific timestamp range and run a reversal script to restore balances.
