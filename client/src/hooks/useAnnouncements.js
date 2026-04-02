import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useAnnouncements({ limit = 10, category = null } = {}) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    let query = supabase
      .from('announcements')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (category) query = query.eq('category', category);
    const { data, error: err } = await query;
    if (err) setError(err.message);
    else setAnnouncements(data || []);
    setLoading(false);
  }, [limit, category]);

  useEffect(() => { fetch(); }, [fetch]);

  return { announcements, loading, error, refetch: fetch };
}

export function useAllAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    setAnnouncements(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { announcements, loading, refetch: fetch };
}