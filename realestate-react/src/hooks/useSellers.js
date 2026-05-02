import { useState, useEffect, useCallback } from 'react';
import { auth } from '../lib/firebase';
import { supabase } from '../lib/supabase';
import { mapSeller } from '../lib/mappers';

export function useSellers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) { setLoading(false); return; }
    setLoading(true);
    const { data: rows, error: err } = await supabase
      .from('sellers')
      .select('*')
      .eq('user_id', uid)
      .order('score', { ascending: false });
    if (err) {
      setError(err.message);
    } else {
      setData(rows.map(mapSeller));
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
