/** Map a DB seller row (snake_case) to frontend shape (camelCase) */
export function mapSeller(row) {
  if (!row) return null;
  return {
    id: row.id,
    address: row.address,
    city: row.city,
    score: row.score,
    est: row.est,
    trigger: row.trigger_reason,
    days: row.days,
    inOutreach: row.in_outreach,
    agent: row.agent,
    beds: row.beds,
    baths: row.baths,
    sqft: row.sqft,
    yearBuilt: row.year_built,
    lot: row.lot,
    ownerSince: row.owner_since,
    mortgageBalance: row.mortgage_balance,
    lastSale: row.last_sale,
    lat: row.lat,
    lng: row.lng,
  };
}

/** Map a DB campaign row (snake_case) to frontend shape (camelCase) */
export function mapCampaign(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    channel: row.channel,
    status: row.status,
    sent: row.sent,
    responses: row.responses,
    rate: row.rate,
    agent: row.agent,
    created: row.created_at ? row.created_at.slice(0, 10) : null,
    sellerIds: row.seller_ids || [],
  };
}

/** Map a DB activity_log row to frontend shape */
export function mapActivity(row) {
  if (!row) return null;
  return {
    id: row.id,
    sellerId: row.seller_id,
    campaignId: row.campaign_id,
    event: row.event,
    type: row.event_type,
    date: row.occurred_at ? row.occurred_at.slice(0, 10) : null,
  };
}

/** Map a DB analytics_snapshot row to frontend shape */
export function mapSnapshot(row) {
  if (!row) return null;
  return {
    id: row.id,
    weekLabel: row.week_label,
    projectedListings: row.projected_listings,
    identified: row.identified,
    contacted: row.contacted,
    responded: row.responded,
    listed: row.listed,
    snapshotDate: row.snapshot_date,
  };
}

/** Map a DB team_member row to frontend shape */
export function mapTeamMember(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
  };
}

/** Map a DB integration row to frontend shape */
export function mapIntegration(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    connected: row.connected,
    config: row.config,
  };
}
