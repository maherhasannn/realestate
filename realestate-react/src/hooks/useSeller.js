import { useState, useEffect, useCallback } from 'react';
import { auth } from '../lib/firebase';
import { supabase } from '../lib/supabase';
import { mapSeller, mapActivity, mapCampaign } from '../lib/mappers';

export function useSeller(id) {
  const [data, setData] = useState(null);
  const [activity, setActivity] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!id || !uid) { setLoading(false); return; }
    setLoading(true);

    const { data: row, error: err } = await supabase
      .from('sellers')
      .select('*')
      .eq('id', id)
      .eq('user_id', uid)
      .single();

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setData(mapSeller(row));

    const { data: logs } = await supabase
      .from('activity_log')
      .select('*')
      .eq('seller_id', id)
      .eq('user_id', uid)
      .order('occurred_at', { ascending: false });
    setActivity((logs || []).map(mapActivity));

    const { data: junctions } = await supabase
      .from('campaign_sellers')
      .select('campaign_id')
      .eq('seller_id', id);

    if (junctions && junctions.length > 0) {
      const campaignIds = junctions.map(j => j.campaign_id);
      const { data: campRows } = await supabase
        .from('campaigns')
        .select('*')
        .in('id', campaignIds)
        .eq('user_id', uid);
      setCampaigns((campRows || []).map(mapCampaign));
    } else {
      setCampaigns([]);
    }

    setError(null);
    setLoading(false);
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, activity, campaigns, loading, error, refetch: fetch };
}
