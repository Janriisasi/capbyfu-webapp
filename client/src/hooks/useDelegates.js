import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useDelegates(churchId) {
  const [delegates, setDelegates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, totalFees: 0 });

  const fetch = useCallback(async () => {
    if (!churchId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('delegates')
      .select('*')
      .eq('church_id', churchId)
      .order('created_at', { ascending: false });
    const list = data || [];
    setDelegates(list);
    setStats({
      total: list.length,
      paid: list.filter(d => d.payment_status === 'paid').length,
      pending: list.filter(d => d.payment_status === 'pending').length,
      totalFees: list.reduce((sum, d) => sum + (d.registration_fee || 0), 0),
    });
    setLoading(false);
  }, [churchId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { delegates, loading, stats, refetch: fetch };
}

export function useAllDelegates() {
  const [delegates, setDelegates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('delegates')
      .select('*, churches(name, circuit)')
      .order('created_at', { ascending: false });
    setDelegates(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { delegates, loading, refetch: fetch };
}