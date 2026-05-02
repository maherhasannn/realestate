import { useState, useEffect, useCallback } from 'react';
import { auth } from '../lib/firebase';
import { supabase } from '../lib/supabase';
import { mapTeamMember } from '../lib/mappers';

export function useTeam() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) { setLoading(false); return; }
    setLoading(true);
    const { data: rows, error: err } = await supabase
      .from('team_members')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: true });
    if (err) {
      setError(err.message);
    } else {
      setData(rows.map(mapTeamMember));
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  async function addMember(member) {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const { error: err } = await supabase.from('team_members').insert({
      user_id: uid,
      name: member.name,
      email: member.email,
      role: member.role || 'Agent',
      status: 'invited',
    });
    if (err) throw err;
    await fetch();
  }

  async function updateMember(id, updates) {
    const { error: err } = await supabase.from('team_members').update(updates).eq('id', id);
    if (err) throw err;
    await fetch();
  }

  async function removeMember(id) {
    const { error: err } = await supabase.from('team_members').delete().eq('id', id);
    if (err) throw err;
    await fetch();
  }

  return { data, loading, error, refetch: fetch, addMember, updateMember, removeMember };
}
