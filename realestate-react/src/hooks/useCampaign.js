import { useState, useEffect, useCallback } from 'react';
import { auth } from '../lib/firebase';
import { supabase } from '../lib/supabase';
import { mapCampaign, mapSeller, mapActivity } from '../lib/mappers';

export function useCampaign(id) {
  const [data, setData] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!id || !uid) { setLoading(false); return; }
    setLoading(true);

    const { data: row, error: err } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .eq('user_id', uid)
      .single();

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setData(mapCampaign(row));

    const { data: junctions } = await supabase
      .from('campaign_sellers')
      .select('seller_id')
      .eq('campaign_id', id);

    if (junctions && junctions.length > 0) {
      const sellerIds = junctions.map(j => j.seller_id);
      const { data: sellerRows } = await supabase
        .from('sellers')
        .select('*')
        .in('id', sellerIds)
        .eq('user_id', uid);
      setSellers((sellerRows || []).map(mapSeller));
    } else {
      setSellers([]);
    }

    const { data: logs } = await supabase
      .from('activity_log')
      .select('*')
      .eq('campaign_id', id)
      .eq('user_id', uid)
      .order('occurred_at', { ascending: false });
    setMessages((logs || []).map(mapActivity));

    setError(null);
    setLoading(false);
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, sellers, messages, loading, error, refetch: fetch };
}
