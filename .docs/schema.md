# Startup Simulation Hackathon - Database Schema

This schema is designed for a relational (SQL) or document (NoSQL) hybrid approach. For this simulation, we prioritize tracking state changes and team performance.

---

## 1. Users
Stores identity and role information.
- `id`: UUID (Primary Key)
- `name`: String
- `email`: String (Unique)
- `role`: Enum ('admin', 'participant', 'judge')
- `team_id`: UUID (Foreign Key, Nullable)
- `avatar_url`: String
- `created_at`: Timestamp

### Example JSON
```json
{
  "id": "u_9823",
  "name": "Jane Founder",
  "email": "jane@startup.ico",
  "role": "participant",
  "team_id": "t_456",
  "avatar_url": "https://api.dicebear.com/7.x/pixel-art/svg",
  "created_at": "2026-02-18T12:00:00Z"
}
```

---

## 2. Teams
The central entity for the simulation.
- `id`: UUID (Primary Key)
- `name`: String (The Startup Name)
- `founder_id`: UUID (Link to User)
- `problem_statement_id`: UUID
- `status`: Enum ('active', 'shortlisted', 'eliminated')
- `wallet_balance`: Decimal (Tokens)
- `stats`: JSON Object (Revenue, Growth, Churn, Reputation)
- `current_round_id`: UUID

### Example JSON
```json
{
  "id": "t_456",
  "name": "NexGen AI",
  "founder_id": "u_9823",
  "problem_statement_id": "ps_01",
  "status": "shortlisted",
  "wallet_balance": 50000.00,
  "stats": {
    "revenue": 1200.50,
    "growth_rate": 0.15,
    "user_base": 500,
    "runway_months": 8
  },
  "current_round_id": "r_02"
}
```

---

## 3. Problem Statements
Available challenges for teams to solve.
- `id`: UUID
- `title`: String
- `description`: Text
- `industry`: String (e.g., 'HealthTech')
- `difficulty`: Integer (1-5)

### Example JSON
```json
{
  "id": "ps_01",
  "title": "Decentralized Carbon Credits",
  "description": "Build a transparent market for carbon offsets using...",
  "industry": "GreenTech",
  "difficulty": 4
}
```

---

## 4. Tokens & Transactions
Tracking the virtual economy.
- `id`: UUID
- `team_id`: UUID
- `amount`: Decimal
- `type`: Enum ('CREDIT', 'DEBIT')
- `category`: Enum ('hiring', 'marketing', 'pivot', 'reward')
- `metadata`: JSON (Details about the purchase)
- `timestamp`: Timestamp

### Example JSON
```json
{
  "id": "tx_123",
  "team_id": "t_456",
  "amount": 5000.00,
  "type": "DEBIT",
  "category": "marketing",
  "metadata": {
    "campaign_name": "Google Ads Blitz",
    "expected_growth": 0.05
  },
  "timestamp": "2026-02-18T14:30:00Z"
}
```

---

## 5. Event Rounds
Managing the hackathon timeline.
- `id`: UUID
- `name`: String
- `type`: Enum ('simulation', 'pitching', 'submission')
- `start_time`: Timestamp
- `end_time`: Timestamp
- `status`: Enum ('upcoming', 'active', 'completed')

### Example JSON
```json
{
  "id": "r_02",
  "name": "Market Entry Simulation",
  "type": "simulation",
  "start_time": "2026-02-18T09:00:00Z",
  "end_time": "2026-02-18T21:00:00Z",
  "status": "active"
}
```

---

## 6. Shortlisted Teams (Mapping)
Specific to selection phases.
- `id`: UUID
- `team_id`: UUID
- `round_id`: UUID
- `score`: Decimal
- `judge_comments`: Text
- `shortlisted_at`: Timestamp

---

## 7. Leaderboard
Snapshots of rankings.
- `round_id`: UUID
- `team_id`: UUID
- `rank`: Integer
- `total_score`: Decimal
- `last_updated`: Timestamp

---

## 8. Voters (Non-Participants)
Tracks students who are supporting teams.
- `roll_number`: String (Primary Key / Unique)
- `token_balance`: Decimal (e.g., Initial 500)
- `last_active`: Timestamp

---

## 9. Voter Transactions
Logs when a student sends tokens to a team.
- `id`: UUID
- `voter_roll_number`: String (Foreign Key)
- `team_id`: UUID (Foreign Key)
- `amount`: Decimal
- `timestamp`: Timestamp

### Example JSON
```json
{
  "round_id": "r_02",
  "team_id": "t_456",
  "rank": 3,
  "total_score": 885.50,
  "last_updated": "2026-02-18T22:00:00Z"
}
```
