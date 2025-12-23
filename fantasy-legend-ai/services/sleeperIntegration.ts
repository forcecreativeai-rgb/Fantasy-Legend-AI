
// Service for interacting with the Read-Only Sleeper API

const SLEEPER_API_BASE = 'https://api.sleeper.app/v1';

// Cache for the large player database to avoid re-fetching
let playerDatabaseCache: Record<string, any> | null = null;

export interface SleeperUser {
    username: string;
    user_id: string;
    display_name: string;
    avatar: string;
}

export interface SleeperLeague {
    league_id: string;
    name: string;
    season: string;
    status: string;
    sport: string;
    total_rosters: number;
    avatar?: string;
}

export interface SleeperRoster {
    owner_id: string;
    co_owners: string[] | null;
    league_id: string;
    roster_id: number;
    players: string[] | null; // Array of Player IDs
    starters: string[] | null; // Array of Player IDs
    settings: {
        wins: number;
        losses: number;
        ties: number;
        fpts: number;
    }
}

export interface SleeperLeagueUser {
    user_id: string;
    display_name: string;
    metadata: {
        team_name?: string;
        [key: string]: any;
    }
}

/**
 * Fetch the full NFL player database from Sleeper.
 * This is a heavy request (~5-10MB JSON).
 */
export const fetchSleeperPlayerDatabase = async (): Promise<Record<string, any>> => {
    if (playerDatabaseCache && Object.keys(playerDatabaseCache).length > 0) {
        return playerDatabaseCache;
    }

    try {
        console.log("Fetching Sleeper NFL Player Database...");
        const response = await fetch(`${SLEEPER_API_BASE}/players/nfl`);
        if (!response.ok) {
            throw new Error(`Failed to fetch player database: ${response.status}`);
        }
        const data = await response.json();
        playerDatabaseCache = data;
        return data;
    } catch (e) {
        console.error("Error fetching Sleeper player DB:", e);
        // Return empty or cached if available
        return playerDatabaseCache || {};
    }
};

export const getSleeperUser = async (usernameOrId: string): Promise<SleeperUser> => {
    const response = await fetch(`${SLEEPER_API_BASE}/user/${usernameOrId}`);
    if (!response.ok) {
        throw new Error('User not found on Sleeper.');
    }
    return response.json();
};

export const getSleeperLeagues = async (userId: string, season: string = '2024'): Promise<SleeperLeague[]> => {
    const response = await fetch(`${SLEEPER_API_BASE}/user/${userId}/leagues/nfl/${season}`);
    if (!response.ok) {
        throw new Error('Failed to fetch leagues for this user.');
    }
    return response.json();
};

export const getSleeperRosters = async (leagueId: string): Promise<SleeperRoster[]> => {
    const response = await fetch(`${SLEEPER_API_BASE}/league/${leagueId}/rosters`);
    if (!response.ok) {
        throw new Error('Failed to fetch league rosters.');
    }
    return response.json();
};

export const getSleeperLeagueUsers = async (leagueId: string): Promise<SleeperLeagueUser[]> => {
    const response = await fetch(`${SLEEPER_API_BASE}/league/${leagueId}/users`);
    if (!response.ok) {
        throw new Error('Failed to fetch league users.');
    }
    return response.json();
};

// Helpers

export const getAvatarUrl = (avatarId: string) => {
    return `https://sleepercdn.com/avatars/thumbs/${avatarId}`;
};

/**
 * Maps Sleeper's internal player IDs to the app's Player interface.
 * Validates player data to ensure only relevant, existing players are imported.
 */
export const mapSleeperPlayers = (
    playerIds: string[] | null, 
    starterIds: string[] | null, 
    playerDB: Record<string, any> = {}
) => {
    if (!playerIds || !Array.isArray(playerIds)) return [];
    
    const starters = starterIds || [];
    const hasFullDB = Object.keys(playerDB).length > 0;

    return playerIds
        .filter(id => id !== null && id !== undefined && id !== "")
        .map(id => {
            const player = playerDB[id];
            const isStarter = starters.includes(id);
            
            if (player) {
                // Determine display name
                const firstName = player.first_name || "";
                const lastName = player.last_name || "";
                const fullName = player.full_name || `${firstName} ${lastName}`.trim() || `Player ${id}`;
                
                // Only return "active-looking" players if the user wants strictly current teams,
                // but usually, fantasy rosters contain IR/retired players if not dropped.
                return {
                    id: `sleeper-${id}`,
                    name: fullName,
                    position: player.position || 'FLEX',
                    team: player.team || 'FA',
                    isBench: !isStarter,
                    tags: player.status === 'Inactive' ? ['Inactive'] : []
                };
            } else {
                // Handle team defenses (IDs are abbreviations like "SF", "KC")
                if (isNaN(Number(id)) && id.length >= 2 && id.length <= 3) {
                     return {
                        id: `sleeper-${id}`,
                        name: `${id} Defense`,
                        position: "DEF",
                        team: id,
                        isBench: !isStarter,
                        tags: []
                    };
                }

                // Fallback for missing/unknown IDs
                return {
                    id: `sleeper-${id}`,
                    name: hasFullDB ? `Unknown Player (${id})` : `Loading... (${id})`,
                    position: "BENCH",
                    team: "FA",
                    isBench: !isStarter,
                    tags: []
                };
            }
        });
};
