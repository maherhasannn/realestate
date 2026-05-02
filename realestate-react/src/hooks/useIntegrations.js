import { useState, useEffect, useCallback } from 'react';
import { auth } from '../lib/firebase';
import { supabase } from '../lib/supabase';
import { mapIntegration } from '../lib/mappers';

export function useIntegrations() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) { setLoading(false); return; }
    setLoading(true);
    const { data: rows, error: err } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', uid)
      .order('name', { ascending: true });
    if (err) {
      setError(err.message);
    } else {
      setData(rows.map(mapIntegration));
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  async function toggleIntegration(id, connected) {
    const { error: err } = await supabase
      .from('integrations')
      .update({ connected })
      .eq('id', id);
    if (err) throw err;
    await fetch();
  }

  return { data, loading, error, refetch: fetch, toggleIntegration };
}
