import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hdcyowawybcxlmndzxhy.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkY3lvd2F3eWJjeGxtbmR6eGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MjQ2OTQsImV4cCI6MjA5NTIwMDY5NH0.HZIlAL_Azs8wxPu0DvtQPn0Zk-JKZuNC8sRepDk_jPE";

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
  background_photo_url?: string | null;
  sponsor_name?: string;
  sponsor_about?: string;
  updated_at?: string;
}

// Helper functions
export async function getTeams(): Promise<Team[]> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('teams').select('*');
  if (error) throw error;
  return data || [];
}

export async function addTeam(team: Omit<Team, 'id' | 'created_at'>): Promise<Team> {
  if (!supabase) throw new Error('Supabase not configured - cannot add team');
  const { data, error } = await supabase.from('teams').insert([team]).select().single();
  if (error) throw error;
  return data;
}

export async function updateTeam(id: string, updates: Partial<Team>): Promise<Team> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('teams').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTeam(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured - cannot delete team');
  const { error } = await supabase.from('teams').delete().eq('id', id);
  if (error) throw error;
}

export async function getMatches(filters?: { round?: string; status?: string }): Promise<any[]> {
  if (!supabase) throw new Error('Supabase not configured');
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
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('settings').select('*').single();
  if (error) throw error;
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

// ==================== VOTES ====================

export interface Vote {
  id?: string;
  user_id: string;
  team_id: string;
  created_at?: string;
}

export async function getVotes(): Promise<Vote[]> {
  if (!supabase) {
    console.error('Supabase not available for getVotes');
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('votes')
      .select('*');
    
    if (error) {
      console.error('Supabase getVotes error:', error);
      return [];
    }
    
    return data || [];
  } catch (e) {
    console.error('Exception in getVotes:', e);
    return [];
  }
}

export async function getUserVote(userId: string): Promise<Vote | null> {
  if (!supabase) {
    console.error('Supabase not available for getUserVote');
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Supabase getUserVote error:', error);
    }
    
    return data || null;
  } catch (e) {
    console.error('Exception in getUserVote:', e);
    return null;
  }
}

export async function addVote(teamId: string, userId: string): Promise<boolean> {
  if (!supabase) {
    console.error('Supabase not available for addVote');
    return false;
  }
  
  try {
    // Check if user already voted
    const existingVote = await getUserVote(userId);
    if (existingVote) {
      console.log('User already voted:', userId);
      return false;
    }
    
    // Insert new vote
    const { error } = await supabase
      .from('votes')
      .insert([
        {
          user_id: userId,
          team_id: teamId,
        },
      ]);
    
    if (error) {
      console.error('Supabase addVote error:', error);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Exception in addVote:', e);
    return false;
  }
}

export async function deleteVote(userId: string): Promise<boolean> {
  if (!supabase) {
    console.error('Supabase not available for deleteVote');
    return false;
  }
  
  try {
    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error('Supabase deleteVote error:', error);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Exception in deleteVote:', e);
    return false;
  }
}

// Calculate vote counts per team
export function calculateVoteCounts(votes: Vote[]): { [teamId: string]: number } {
  const counts: { [teamId: string]: number } = {};
  
  votes.forEach(vote => {
    counts[vote.team_id] = (counts[vote.team_id] || 0) + 1;
  });
  
  return counts;
}
