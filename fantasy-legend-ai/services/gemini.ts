
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

/**
 * Helper to initialize the Google GenAI client.
 * Uses the API_KEY from the environment.
 */
const getAi = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY environment variable is not configured.");
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates immediate tactical insights for the roster.
 */
export const generateRosterInsights = async (players: any[]): Promise<string[]> => {
  const ai = getAi();
  if (!players || players.length === 0) return [];
  
  const rosterStr = players.map(p => `${p.position}: ${p.name} (${p.team || 'FA'}) ${p.isBench ? '[BENCH]' : '[STARTER]'}`).join('\n');
  const prompt = `Perform a rapid tactical audit of this Fantasy Football roster. Provide exactly 3 high-impact, short tactical tips (max 12 words each).
  Focus on: depth issues, specific player value peaks, or bye week risks.
  Roster:
  ${rosterStr}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return ["Analyze roster for deeper tactical advice."];
  }
};

/**
 * Generates a team logo based on a text prompt and aspect ratio.
 */
export const generateTeamLogo = async (prompt: string, aspectRatio: '1:1' | '16:9' | '4:3' = '1:1'): Promise<string> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      imageConfig: {
        aspectRatio,
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image data returned from Gemini.");
};

/**
 * Analyzes a logo to extract brand colors and a matching font style.
 */
export const analyzeLogoColors = async (logoUrl: string): Promise<{ primary: string, secondary: string, font: string }> => {
  const ai = getAi();
  const base64Data = logoUrl.split(',')[1];
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/png', data: base64Data } },
        { text: "Extract the primary and secondary branding colors as hex codes and suggest a matching Google Font name for a sports franchise." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          primary: { type: Type.STRING },
          secondary: { type: Type.STRING },
          font: { type: Type.STRING }
        },
        required: ["primary", "secondary", "font"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

/**
 * Performs OCR and roster analysis on an uploaded image.
 */
export const analyzeRosterImage = async (base64: string): Promise<{ name: string, position: string, team?: string }[]> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/png', data: base64 } },
        { text: "Identify all NFL players in this roster screenshot. Extract their name, position (QB, RB, WR, TE, K, DEF), and team abbreviation if visible." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            position: { type: Type.STRING },
            team: { type: Type.STRING }
          },
          required: ["name", "position"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

/**
 * Fetches real-time player news and statistics using Google Search grounding.
 */
export const getPlayerNews = async (playerName: string): Promise<{ text: string, sources: { title: string, uri: string }[] }> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Find the latest news, injury updates, and recent statistics for the NFL player: ${playerName}. Provide a section SECTION_NEWS followed by SECTION_STATS.`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter(chunk => chunk.web)
    ?.map(chunk => ({ title: chunk.web!.title || 'Source', uri: chunk.web!.uri })) || [];

  return { text: response.text || "", sources };
};

/**
 * Generates a start/sit recommendation based on matchup analysis and search data.
 */
export const getStartSitRecommendation = async (playerName: string): Promise<{ data: any, sources: any[] }> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Perform a start/sit analysis for ${playerName} for the upcoming NFL week. Consider defensive matchups and expert consensus.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommendation: { type: Type.STRING, description: "START, SIT, or FLEX" },
          confidence: { type: Type.NUMBER, description: "Confidence percentage 0-100" },
          analysis: { type: Type.STRING, description: "Reasoning for the recommendation" }
        },
        required: ["recommendation", "confidence", "analysis"]
      }
    }
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter(chunk => chunk.web)
    ?.map(chunk => ({ title: chunk.web!.title || 'Source', uri: chunk.web!.uri })) || [];

  try {
    const data = JSON.parse(response.text || "{}");
    return { data, sources };
  } catch (e) {
    return { data: { recommendation: 'FLEX', confidence: 50, analysis: 'Unable to parse analysis.' }, sources };
  }
};

/**
 * Intelligent Assistant Coach that answers fantasy questions with roster context.
 */
export const askAssistant = async (history: any[], message: string, isPremium: boolean, rosterContext: string): Promise<{ text: string, sources?: any[] }> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [
      { role: 'user', parts: [{ text: `CONTEXT: ${rosterContext}` }] },
      ...history,
      { role: 'user', parts: [{ text: message }] }
    ],
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: "You are an expert Fantasy Football Assistant Coach. Use recent news and data to provide strategic advice. If relevant, refer to the user's current roster."
    }
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter(chunk => chunk.web)
    ?.map(chunk => ({ title: chunk.web!.title || 'Source', uri: chunk.web!.uri })) || [];

  return { text: response.text || "No response generated.", sources };
};

/**
 * Generates mockups for team gear using the team's logo and colors.
 */
export const generateGear = async (logoUrl: string, gearType: string, pose: string, colors: any, playerInfo: any, helmetStyle?: string, background?: string): Promise<string[]> => {
  const ai = getAi();
  const base64Logo = logoUrl.split(',')[1];
  const prompt = `Design 3 distinct variations of professional NFL style ${gearType} for a team with logo ${base64Logo}. 
    Colors: ${JSON.stringify(colors)}. 
    Pose/Character: ${pose}. 
    Environment: ${background}. 
    ${playerInfo ? `Include player info: ${JSON.stringify(playerInfo)}` : ""}
    ${helmetStyle ? `Helmet finish: ${helmetStyle}` : ""}`;

  // Since we need 3 variations and nano banana usually returns 1, we execute 3 parallel requests for better diversity.
  const requests = [1, 2, 3].map(() => ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/png', data: base64Logo } },
        { text: prompt }
      ]
    },
    config: { imageConfig: { aspectRatio: '1:1' } }
  }));

  const responses = await Promise.all(requests);
  const results: string[] = [];

  for (const resp of responses) {
    for (const part of resp.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        results.push(`data:image/png;base64,${part.inlineData.data}`);
      }
    }
  }

  return results;
};

/**
 * Provides waiver wire analysis for a specific position.
 */
export const getStreamingAnalysis = async (position: string): Promise<{ data: any, sources: any[] }> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Find the top waiver wire pickups and streaming targets for the ${position} position in Fantasy Football for the current week. Also include 'stashes' for the following week.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          currentWeek: { type: Type.STRING },
          streamers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                rank: { type: Type.NUMBER },
                name: { type: Type.STRING },
                opponent: { type: Type.STRING },
                ownership: { type: Type.STRING },
                analysis: { type: Type.STRING }
              },
              required: ["name", "opponent", "ownership", "analysis"]
            }
          },
          stashes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                ownership: { type: Type.STRING },
                nextOpponent: { type: Type.STRING },
                analysis: { type: Type.STRING }
              },
              required: ["name", "ownership", "nextOpponent", "analysis"]
            }
          }
        },
        required: ["currentWeek", "streamers", "stashes"]
      }
    }
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter(chunk => chunk.web)
    ?.map(chunk => ({ title: chunk.web!.title || 'Source', uri: chunk.web!.uri })) || [];

  return { data: JSON.parse(response.text || "{}"), sources };
};

/**
 * Generates 4 rotational angles of a user avatar.
 */
export const generateAvatarAngles = async (userImage: string, logoUrl: string | undefined, helmetOn: boolean, colors: any, role: string): Promise<string[]> => {
  const ai = getAi();
  const base64User = userImage.split(',')[1];
  const angles = ['front view', 'right side profile', 'back view', 'left side profile'];
  
  const requests = angles.map(angle => ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/png', data: base64User } },
        { text: `Create a professional Madden-style 3D avatar of this person as a ${role}. Angle: ${angle}. ${helmetOn ? "Wearing a football helmet with team branding." : ""} Team colors: ${JSON.stringify(colors)}.` }
      ]
    }
  }));

  const responses = await Promise.all(requests);
  const results: string[] = [];

  for (const resp of responses) {
    for (const part of resp.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        results.push(`data:image/png;base64,${part.inlineData.data}`);
      }
    }
  }

  return results;
};

/**
 * Generates creative smack talk lines.
 */
export const generateSmackTalk = async (opponentName: string, tone: string, opponentPlayers: string): Promise<string[]> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 5 savage and creative fantasy football smack talk lines for an opponent named ${opponentName}. 
      Tone: ${tone}. 
      Context: ${opponentPlayers}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

/**
 * Fetches seasonal and Rest of Season rankings.
 */
export const getSeasonRankings = async (activeTab: 'season' | 'ros', position: string): Promise<any[]> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Find the current NFL season rankings for the ${position} position. ${activeTab === 'ros' ? "Focus on Rest of Season (ROS) outlook and tiers." : "Focus on total points and average stats."}`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            rank: { type: Type.NUMBER },
            name: { type: Type.STRING },
            team: { type: Type.STRING },
            points: { type: Type.NUMBER },
            stats: { type: Type.OBJECT, properties: {
              passYds: { type: Type.STRING },
              passTD: { type: Type.STRING },
              rushYds: { type: Type.STRING },
              rushTD: { type: Type.STRING },
              targets: { type: Type.STRING },
              catches: { type: Type.STRING },
              totalTD: { type: Type.STRING },
              tier: { type: Type.STRING },
              outlook: { type: Type.STRING }
            }}
          },
          required: ["name", "team"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

/**
 * Fetches rankings suitable for mock drafting or salary cap simulation.
 */
export const getMockDraftRankings = async (scoring: string): Promise<any[]> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Provide a list of the top 200 NFL players for a current Fantasy Football Draft using ${scoring} scoring. Include a value (0-100) and suggested auction price (up to $200 budget).`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            rank: { type: Type.NUMBER },
            name: { type: Type.STRING },
            team: { type: Type.STRING },
            position: { type: Type.STRING },
            price: { type: Type.NUMBER },
            value: { type: Type.NUMBER },
            projectedRound: { type: Type.NUMBER },
            projectedPick: { type: Type.NUMBER }
          },
          required: ["id", "rank", "name", "team", "position", "price", "value"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

export const generateDraftGrade = async (players: any[], scoring: string, numTeams: string) => {
    const ai = getAi();
    const rosterStr = players.map(p => `${p.position}: ${p.name}`).join('\n');
    const prompt = `Perform a deep expert audit of this Fantasy Football roster. 
    Scoring: ${scoring}. League Size: ${numTeams} teams. 
    Roster:
    ${rosterStr}

    CRITICAL RULES:
    1. Base valuation on current consensus draft rankings (FantasyPros/ESPN/Sleeper).
    2. Identify 'Steals' (high ADP value) and 'Reaches' (overpaid/drafted too early).
    3. Analyze balance: Does the team have enough RB/WR depth?
    4. QB/TE Limit: Flag if more than 2 QBs or 2 TEs are drafted (inefficient allocation).
    5. Streaming Defense/Kicker: DO NOT penalize if no K or DEF is on roster, as they are often streamed.
    6. Return a comprehensive JSON response.`;

    const response = await ai.models.generateContent({ 
        model: 'gemini-3-pro-preview', 
        contents: prompt, 
        config: { 
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    grade: { type: Type.STRING, description: "Letter grade A-F" },
                    summary: { type: Type.STRING },
                    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                    bestValue: { type: Type.STRING, description: "The single best pick value" },
                    reach: { type: Type.STRING, description: "The biggest reach pick" }
                },
                required: ["grade", "summary", "strengths", "weaknesses", "bestValue", "reach"]
            }
        } 
    });
    try { return JSON.parse(response.text || "{}"); } catch (e) { return { grade: 'C' }; }
};

export const generateLeagueDraftGrades = async (rosters: any[], scoring: string) => {
    const ai = getAi();
    const rostersStr = rosters.map(r => `TEAM: ${r.teamName} (Owner: ${r.ownerName})\nROSTER:\n${r.players.map((p: any) => `${p.position}: ${p.name}`).join('\n')}`).join('\n\n---\n\n');
    
    const prompt = `You are a high-level Fantasy Football Draft Analyst. Analyze the entire league's rosters based on ${scoring} scoring.
    
    Rosters Data:
    ${rostersStr}

    CRITICAL EVALUATION CRITERIA:
    - Grading based on current ADP/Rankings.
    - Consistency of roster construction.
    - High-upside vs safe floor balance.
    - Positional depth (specifically RB/WR).
    
    RETURN JSON only. A summary for the league and a specific grade and short analysis for EVERY team.`;

    const response = await ai.models.generateContent({ 
        model: 'gemini-3-pro-preview', 
        contents: prompt, 
        config: { 
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    leagueSummary: { type: Type.STRING },
                    rankings: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                teamName: { type: Type.STRING },
                                grade: { type: Type.STRING },
                                analysis: { type: Type.STRING }
                            },
                            required: ["teamName", "grade", "analysis"]
                        }
                    }
                },
                required: ["leagueSummary", "rankings"]
            }
        } 
    });
    try { return JSON.parse(response.text || "{}"); } catch (e) { return { leagueSummary: 'Error', rankings: [] }; }
};
