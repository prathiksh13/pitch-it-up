# Live Leaderboard & Real-Time Ranking System

This document outlines the architecture for the live leaderboard, ensuring that every token transaction reflects instantly on the scoreboard across all connected clients.

---

## 1. Ranking Logic

The leaderboard calculates the "Power Ranking" of teams based on a weighted formula.

### A. Primary Score
- **Total Tokens Received**: The sum of all tokens from the `voter_transactions` table + `wallet_balance` from the startup simulation.

### B. Tie-Break Rules
In case two teams have the exact same token count, the system applies the following hierarchy to decide the rank:
1.  **Simulation Valuation**: Higher valuation in the startup simulation console.
2.  **Growth Rate**: Higher percentage growth in the last "Simulation Tick."
3.  **Timestamp (First-to-Score)**: The team that reached the current total amount *first* takes the higher rank.

---

## 2. Real-Time Architecture

To achieve "Instant" updates, we use a **Push-based model** rather than polling.

### A. Backend: The Event Emitter
When a transaction is successfully committed to the database (see `token_logic.md`), the server emits a global event.

```javascript
// Example using Socket.io + Redis Pub/Sub
async function onVoteSuccess(teamId) {
    // 1. Recalculate Top 10 rankings (cached)
    const topTeams = await getTopRankings(10); 
    
    // 2. Broadcast to all connected clients
    io.emit('LEADERBOARD_UPDATE', topTeams);
}
```

### B. Frontend: The UI Consumer
The React frontend listens for the `LEADERBOARD_UPDATE` event and updates the state without a page refresh.

```javascript
// React Hook for Real-time Leaderboard
function useLeaderboard() {
    const [teams, setTeams] = useState([]);

    useEffect(() => {
        const socket = io(process.env.REACTION_SERVER_URL);
        
        socket.on('LEADERBOARD_UPDATE', (updatedTeams) => {
            // Apply Framer Motion animations here for smooth rank swapping
            setTeams(updatedTeams);
        });

        return () => socket.disconnect();
    }, []);

    return teams;
}
```

---

## 3. UI/UX Features for Leaderboard

- **Smooth Position Swapping**: Use `framer-motion`'s `layout` prop. When a team's rank changes, their card should physically slide up or down the list rather than just snapping.
- **Micro-Animations**: 
    - When a team receives tokens, their score should "Count Up" (using `react-countup`).
    - A brief "Pulse" effect on the team card when their balance increases.
- **Limited View**: The public leaderboard only shows the Top 10 to maintain high-stakes competition and reduce server load. The full list is only available to Admins.

---

## 4. Performance Strategy

1.  **Throttled Broadcasts**: If 100 votes happen in 1 second, the server should "Debounce" or "Throttle" the broadcast. Instead of 100 emits, it sends 1 update every 500ms containing the latest state.
2.  **Read-Replicas/Caching**: The leaderboard query is expensive. Store the current Top 10 in a **Redis** cache. 
    - Reads go to Redis.
    - Writes update both DB and Redis.
3.  **Client-Side Optimistic Updates**: (Optional) If the *current* user votes, immediately update their local view of the team score while the server processes the transaction in the background.
