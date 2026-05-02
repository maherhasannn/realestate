import { useState, useEffect, useCallback } from 'react';
import { auth } from '../lib/firebase';
import { supabase } from '../lib/supabase';
import { mapSnapshot } from '../lib/mappers';

export function useAnalytics() {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) { setLoading(false); return; }
    setLoading(true);
    const { data: rows, error: err } = await supabase
      .from('analytics_snapshots')
      .select('*')
      .eq('user_id', uid)
      .order('snapshot_date', { ascending: true });
    if (err) {
      setError(err.message);
    } else {
      setSnapshots(rows.map(mapSnapshot));
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { snapshots, loading, error, refetch: fetch };
}
