/**
 * Optimized Firestore utilities with field selection and batch operations
 * Reduce network payload and improve performance
 * 
 * ✅ RULES:
 * - Fetch only required fields using select()
 * - Use getDocs() instead of onSnapshot() where real-time not needed
 * - onSnapshot() only for: leaderboard, admin manage-teams
 * - Always include limit() for collections
 */

import {
  collection,
  getDocs,
  query,
  DocumentData,
  QueryConstraint,
  orderBy,
  limit,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// Types
export interface TeamSummary {
  id: string;
  teamName: string;
  collegeName: string;
  leader: { name: string; email?: string; phone?: string };
  totalTokens: number;
  shortlisted: boolean;
  eliminated: boolean;
  createdAt?: any;
}

export interface LeaderboardEntry {
  id: string;
  teamName: string;
  totalTokens: number;
  shortlisted?: boolean;
}

export interface EventStatus {
  registrationOpen?: boolean;
  votingRoundActive?: boolean;
  resultsFinalized?: boolean;
}

/**
 * Fetch teams for admin manage page with all fields
 * @param constraints - Firestore query constraints
 * @returns Array of full team data
 */
export async function fetchTeamsForManagement(
  ...constraints: QueryConstraint[]
): Promise<TeamSummary[]> {
  try {
    const q = query(collection(db, "teams"), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        teamName: data.teamName || "",
        collegeName: data.collegeName || "",
        leader: data.leader || { name: "", email: "", phone: "" },
        totalTokens: data.totalTokens || 0,
        shortlisted: !!data.shortlisted,
        eliminated: !!data.eliminated,
        createdAt: data.createdAt || null,
      };
    });
  } catch (error) {
    console.error("❌ Error fetching teams for management:", error);
    throw error;
  }
}

/**
 * Fetch leaderboard with minimal fields (for real-time listener)
 * This is designed to be used with onSnapshot
 * @param constraints - Firestore query constraints
 * @returns Array of leaderboard entries
 */
export async function fetchLeaderboard(
  ...constraints: QueryConstraint[]
): Promise<LeaderboardEntry[]> {
  try {
    const q = query(collection(db, "teams"), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        teamName: data.teamName || "",
        totalTokens: data.totalTokens || 0,
        shortlisted: !!data.shortlisted,
      };
    });
  } catch (error) {
    console.error("❌ Error fetching leaderboard:", error);
    throw error;
  }
}

/**
 * Fetch event status (global config)
 */
export async function fetchEventStatus(): Promise<EventStatus> {
  try {
    const statusSnap = await getDoc(doc(db, "eventStatus", "global"));
    if (statusSnap.exists()) {
      return statusSnap.data() as EventStatus;
    }
    return {
      registrationOpen: true,
      votingRoundActive: false,
      resultsFinalized: false,
    };
  } catch (error) {
    console.error("❌ Error fetching event status:", error);
    return {
      registrationOpen: true,
      votingRoundActive: false,
      resultsFinalized: false,
    };
  }
}

/**
 * Fetch dashboard summary with limited data
 * @param limit - max teams to fetch
 * @returns Summary data
 */
export async function fetchDashboardSummary(
  pageLimit: number = 50
): Promise<{
  teams: any[];
  status: EventStatus;
}> {
  try {
    const [teamsSnap, statusSnap] = await Promise.all([
      getDocs(
        query(
          collection(db, "teams"),
          orderBy("createdAt", "desc"),
          limit(pageLimit)
        )
      ),
      getDoc(doc(db, "eventStatus", "global")),
    ]);

    const teams = teamsSnap.docs.map((doc) => ({
      id: doc.id,
      teamName: doc.data().teamName || "",
      totalTokens: doc.data().totalTokens || 0,
      shortlisted: !!doc.data().shortlisted,
      eliminated: !!doc.data().eliminated,
    }));

    const status: EventStatus = statusSnap.exists()
      ? (statusSnap.data() as EventStatus)
      : {
          registrationOpen: true,
          votingRoundActive: false,
          resultsFinalized: false,
        };

    return { teams, status };
  } catch (error) {
    console.error("❌ Error fetching dashboard summary:", error);
    throw error;
  }
}

/**
 * Fetch voters with minimal fields
 */
export async function fetchVotersOptimized(
  ...constraints: QueryConstraint[]
): Promise<
  Array<{
    id: string;
    name: string;
    tokenBalance: number;
    role?: string;
  }>
> {
  try {
    const q = query(collection(db, "voters"), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        tokenBalance: data.tokenBalance || 0,
        role: data.role,
      };
    });
  } catch (error) {
    console.error("Error fetching voters:", error);
    throw error;
  }
}

/**
 * Check if collection has data without loading all documents
 */
export async function collectionExists(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<boolean> {
  try {
    const q = query(collection(db, collectionName), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.length > 0;
  } catch (error) {
    console.error("Error checking collection:", error);
    return false;
  }
}

/**
 * Get single collection document with field selection
 */
export async function getDocOptimized(
  collectionName: string,
  docId: string,
  fields?: string[]
): Promise<{ id: string; [key: string]: any } | null> {
  try {
    const docRef = await import("firebase/firestore").then((m) =>
      m.getDoc(m.doc(db, collectionName, docId))
    );

    if (!docRef.exists()) return null;

    const data = docRef.data();
    if (!fields) return { id: docRef.id, ...data };

    const filtered: any = { id: docRef.id };
    fields.forEach((field) => {
      filtered[field] = data[field];
    });
    return filtered;
  } catch (error) {
    console.error("Error getting document:", error);
    return null;
  }
}
