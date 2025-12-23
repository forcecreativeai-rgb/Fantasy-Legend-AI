
// This service handles the Yahoo Fantasy Sports API integration.
// NOTE: In a production environment, the OAuth Token Exchange must happen server-side 
// to protect the Client Secret. This client-side implementation mocks the response 
// for demonstration purposes while structuring the calls correctly.

const YAHOO_AUTH_ENDPOINT = 'https://api.login.yahoo.com/oauth2/request_auth';
const YAHOO_API_BASE = 'https://fantasysports.yahooapis.com/fantasy/v2';

export interface YahooLeagueData {
  league_key: string;
  name: string;
  season: string;
  num_teams: number;
  user_team: {
      team_key: string;
      name: string;
      logo_url: string;
      rank: number;
      record: string;
  }
}

// Simulate the OAuth Popup Flow
export const initiateYahooAuth = async (): Promise<string> => {
  return new Promise((resolve) => {
      // In production: window.location.href = `${YAHOO_AUTH_ENDPOINT}?client_id=...&redirect_uri=...&response_type=code`;
      // Here we simulate the user logging in and granting access
      setTimeout(() => {
          resolve("mock_access_token_" + Date.now());
      }, 2000);
  });
};

// Fetch League Data (Mocking the XML/JSON response from Yahoo)
export const getYahooLeagueData = async (token: string): Promise<YahooLeagueData> => {
    // In production:
    // const response = await fetch(`${YAHOO_API_BASE}/users;use_login=1/games;game_keys=nfl/leagues`, {
    //    headers: { Authorization: `Bearer ${token}` }
    // });
    
    // Simulating network delay
    await new Promise(r => setTimeout(r, 1500));

    // Return mock data that looks like a parsed Yahoo API response
    return {
        league_key: "425.l.8675309",
        name: "Gridiron Gentlemen League",
        season: "2024",
        num_teams: 12,
        user_team: {
            team_key: "425.l.8675309.t.5",
            name: "Touchdown Vultures",
            logo_url: "https://s.yimg.com/cv/apiv2/default/nfl/nfl_7.png",
            rank: 3,
            record: "7-4-0"
        }
    };
};

export const getYahooRoster = async (token: string, teamKey: string) => {
    // In production: fetch(`${YAHOO_API_BASE}/team/${teamKey}/roster`)
    await new Promise(r => setTimeout(r, 1000));

    // Mock Roster Data
    return [
        { id: 'p1', name: "Patrick Mahomes", position: "QB", team: "KC", isBench: false },
        { id: 'p2', name: "Christian McCaffrey", position: "RB", team: "SF", isBench: false },
        { id: 'p3', name: "Tyreek Hill", position: "WR", team: "MIA", isBench: false },
        { id: 'p4', name: "Travis Kelce", position: "TE", team: "KC", isBench: false },
        { id: 'p5', name: "CeeDee Lamb", position: "WR", team: "DAL", isBench: false },
        { id: 'p6', name: "Bijan Robinson", position: "RB", team: "ATL", isBench: false },
        { id: 'p7', name: "Justin Tucker", position: "K", team: "BAL", isBench: false },
        { id: 'p8', name: "San Francisco", position: "DEF", team: "SF", isBench: false },
        { id: 'p9', name: "Jaylen Waddle", position: "WR", team: "MIA", isBench: true },
        { id: 'p10', name: "Trevor Lawrence", position: "QB", team: "JAX", isBench: true },
    ];
};
