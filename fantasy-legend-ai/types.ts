
export enum Page {
  BRANDING = 'branding',
  ROSTER = 'roster',
  ASSISTANT = 'assistant',
  GEAR = 'gear',
  STREAMING = 'streaming',
  AVATAR = 'avatar',
  SMACK = 'smack',
  LEAGUE = 'league',
  SLEEPER = 'sleeper',
  DRAFT = 'draft',
  RANKINGS = 'rankings',
  DRAFT_REDO = 'draft_redo',
  SALARY_CAP = 'salary_cap'
}

export interface Player {
  id: string;
  name: string;
  position: string;
  team?: string;
  notes?: string;
  tags?: string[];
  isBench?: boolean;
  price?: number; // Added for Salary Cap mode
}

export interface TeamConfig {
  name: string;
  logoUrl?: string;
  logoPrompt?: string;
  colors?: {
    primary: string;
    secondary: string;
  };
  headerLogoUrl?: string;
}

export interface LeagueRoster {
  teamName: string;
  ownerName: string;
  players: Player[];
  isUser: boolean;
}

export interface GeneratedVideo {
  uri: string;
  prompt: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  sources?: { title: string; uri: string }[];
  isLoading?: boolean;
}
