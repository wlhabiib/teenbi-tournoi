import { useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseAvailable } from './supabase';

export function useSupabaseSettings(shouldRefresh?: number) {
  const [settings, setSettings] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    if (!isSupabaseAvailable()) {
      setLoading(false);
      return;
    }

    try {
      const { data, error: err } = await supabase!
        .from('settings')
        .select('*')
        .eq('id', '1')
        .single();

      if (err && err.code !== 'PGRST116') {
        throw err;
      }

      setSettings(data);
      setError(null);
    } catch (err: any) {
      console.error('Error loading settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    const interval = setInterval(loadSettings, 5000);
    return () => clearInterval(interval);
  }, [shouldRefresh, loadSettings]);

  return { settings, loading, error, refresh: loadSettings };
}

export function useSupabaseTeams(shouldRefresh?: number) {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeams = useCallback(async () => {
    if (!isSupabaseAvailable()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: err } = await supabase!
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setTeams(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error loading teams:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeams();
  }, [shouldRefresh, loadTeams]);

  return { teams, loading, error, refresh: loadTeams };
}

export function useSupabaseMatches(shouldRefresh?: number) {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMatches = useCallback(async () => {
    if (!isSupabaseAvailable()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: err } = await supabase!
        .from('matches')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setMatches(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error loading matches:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [shouldRefresh, loadMatches]);

  return { matches, loading, error, refresh: loadMatches };
}
