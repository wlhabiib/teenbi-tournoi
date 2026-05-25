import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hdcyowawybcxlmndzxhy.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Debug: log configuration status (safe to keep, no sensitive data)
if (typeof window !== 'undefined') {
  console.log('[Supabase Config] URL exists:', !!supabaseUrl);
  console.log('[Supabase Config] Key exists:', !!supabaseAnonKey);
  console.log('[Supabase Config] URL:', supabaseUrl?.substring(0, 30) + '...');
}

export const supabase = supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Check if Supabase is available
export function isSupabaseAvailable(): boolean {
  return !!supabase && !!supabaseAnonKey;
}

// Database interfaces
export interface Team {
  id: string;
  name: string;
  coach: string;
  players: string[];
  created_at?: string;
}

export interface Match {
  id: string;
  team_home: string;
  team_away: string;
  score_home: number | null;
  score_away: number | null;
  scorers_home: string;
  scorers_away: string;
  assists_home: string;
  assists_away: string;
  round: string;
  status: 'scheduled' | 'completed';
  created_at?: string;
}

export interface Message {
  id: string;
  author: string;
  content: string;
  created_at?: string;
}

export interface Settings {
  id: string;
  tournament_name: string;
  venue: string;
  pitch: string;
  sponsor_photo_url: string | null;
  updated_at?: string;
}

// Helper functions
export async function getTeams(): Promise<Team[]> {
  if (!supabase) {
    // Fallback localStorage
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem('localTeams');
    return raw ? JSON.parse(raw) : [];
  }
  const { data, error } = await supabase.from('teams').select('*');
  if (error) throw error;
  return data || [];
}

export async function addTeam(team: Omit<Team, 'id' | 'created_at'>): Promise<Team> {
  if (!supabase) {
    // Fallback localStorage
    if (typeof window === 'undefined') throw new Error('Cannot add team on server');
    const teams = await getTeams();
    const newTeam: Team = {
      ...team,
      id: 'team-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    teams.push(newTeam);
    localStorage.setItem('localTeams', JSON.stringify(teams));
    return newTeam;
  }
  try {
    const { data, error } = await supabase.from('teams').insert([team]).select().single();
    if (error) throw error;
    return data;
  } catch (e) {
    // Fallback localStorage on error
    if (typeof window === 'undefined') throw new Error('Cannot add team on server');
    const teams = await getTeams();
    const newTeam: Team = {
      ...team,
      id: 'team-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    teams.push(newTeam);
    localStorage.setItem('localTeams', JSON.stringify(teams));
    return newTeam;
  }
}

export async function updateTeam(id: string, updates: Partial<Team>): Promise<Team> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('teams').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTeam(id: string): Promise<void> {
  if (!supabase) {
    // Fallback localStorage
    if (typeof window === 'undefined') throw new Error('Cannot delete team on server');
    const teams = await getTeams();
    const filtered = teams.filter(t => t.id !== id);
    localStorage.setItem('localTeams', JSON.stringify(filtered));
    return;
  }
  try {
    const { error } = await supabase.from('teams').delete().eq('id', id);
    if (error) throw error;
  } catch (e) {
    // Fallback localStorage on error
    if (typeof window === 'undefined') throw new Error('Cannot delete team on server');
    const teams = await getTeams();
    const filtered = teams.filter(t => t.id !== id);
    localStorage.setItem('localTeams', JSON.stringify(filtered));
  }
}

export async function getMatches(filters?: { round?: string; status?: string }): Promise<any[]> {
  if (!supabase) return [];
  let query = supabase.from('matches').select('*');
  if (filters?.round) query = query.eq('round', filters.round);
  if (filters?.status) query = query.eq('status', filters.status);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function addMatch(match: Omit<Match, 'id' | 'created_at'>): Promise<Match> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('matches').insert([match]).select().single();
  if (error) throw error;
  return data;
}

export async function updateMatch(id: string, updates: Partial<Match>): Promise<Match> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('matches').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function getMessages(limit = 50): Promise<Message[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function addMessage(message: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('messages').insert([message]).select().single();
  if (error) throw error;
  return data;
}

export async function getSettings(): Promise<Settings | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('settings').select('*').single();
  if (error) return null;
  return data;
}

export async function updateSettings(updates: Partial<Settings>): Promise<Settings> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('settings').update(updates).eq('id', '1').select().single();
  if (error) throw error;
  return data;
}

export async function uploadFile(bucket: string, path: string, file: File): Promise<string> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) throw error;
  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl.publicUrl;
}
