/**
 * Live data, through the viewer's own claude.ai connectors.
 *
 * The published page has no server and holds no token. It asks the viewer's
 * Meta Ads and HubSpot connectors for data using the viewer's own credentials,
 * via the artifact `mcp` capability. If the capability is absent, or a
 * connector is not connected, the page falls back to the frozen snapshot and
 * says so.
 *
 * Request shapes here were observed against these exact tools in the session
 * that built this page. None is guessed.
 */

export const META_SERVER = 'Meta Ads';
export const HUBSPOT_SERVER = 'HubSpot';
export const META_TOOL = 'ads_get_ad_entities';
export const HUBSPOT_TOOL = 'search_crm_objects';

/** The Meta tool requires a 20 character alphanumeric conversation id on every call. */
function conversationId() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}
const CONVERSATION_ID = conversationId();

const INSIGHT_FIELDS = ['id', 'name', 'amount_spent', 'impressions', 'reach', 'frequency', 'clicks', 'ctr', 'cpm', 'cpc', 'results', 'cost_per_result'];

const REQUEST_NOTE =
  'Show the HireHospo acquisition dashboard: spend, leads, cost per lead, ' +
  'the funnel through to funded contracts, unit economics, creative fatigue and equipment demand.';

/** Build the Meta insights argument object. Observed shape, not guessed. */
export function metaArgs({ adAccountId, campaignId, since, until, level = 'campaign', timeIncrement = null, breakdowns = null }) {
  const args = {
    ad_account_id: String(adAccountId),
    client_conversation_id: CONVERSATION_ID,
    advertiser_request: REQUEST_NOTE,
    level,
    fields: INSIGHT_FIELDS,
    // time_range and filtering are JSON STRINGS, not objects.
    time_range: JSON.stringify({ since, until }),
  };
  if (timeIncrement) args.time_increment = String(timeIncrement);
  if (breakdowns) args.breakdowns = breakdowns;
  if (campaignId) args.filtering = [{ field: 'campaign.id', operator: 'EQUAL', value: [String(campaignId)] }];
  return args;
}

/** HubSpot contact search for the campaign lead cohort. */
export function hubspotArgs({ joinProperty, matchValue, equipmentProperty, limit = 100 }) {
  return {
    objectType: 'CONTACT',
    filterGroups: [{ filters: [{ propertyName: joinProperty, operator: 'EQ', value: matchValue }] }],
    // Deliberately narrow. The equipment enquiry and the campaign key are all
    // this page needs, so no name, email or phone number is ever requested.
    properties: [equipmentProperty, joinProperty],
    limit,
    chatInsights: { userIntent: 'Show equipment demand for the acquisition dashboard', satisfaction: 'NEUTRAL' },
  };
}

/**
 * How each failure code should be presented. Branching on the code matters:
 * collapsing them into one banner hides the single action that would fix the
 * page.
 */
export function describeError(err, server) {
  const code = err?.code ?? 'upstream_error';
  const name = err?.server ?? server;
  switch (code) {
    case 'needs_reauth':
      return { code, retry: false, retract: true, message: `${name} needs reconnecting. Open claude.ai Settings, then Connectors, and reconnect ${name}.` };
    case 'server_not_connected':
      return { code, retry: false, retract: true, message: `The ${name} connector is not added to this account. Add it in claude.ai Settings, then Connectors.` };
    case 'not_granted':
      return { code, retry: false, retract: true, message: `Permission to use ${name} was not granted for this page. Reload and allow it to show live figures.` };
    case 'blocked_by_policy':
      return { code, retry: false, retract: true, message: `An account policy blocks this page from using ${name}.` };
    case 'approval_required':
      return { code, retry: false, retract: true, message: `${name} needs approval before this page can read it.` };
    case 'selection_required':
      return { code, retry: false, retract: true, message: `More than one ${name} connector is available. Choose one in claude.ai, then reload.` };
    case 'server_not_found':
      return { code, retry: false, retract: true, message: `No connector named ${name} is available to this view.` };
    case 'not_in_manifest':
      return { code, retry: false, retract: true, message: `This page did not declare access to ${name}.` };
    case 'tool_error':
      return { code, retry: false, retract: false, message: `${name} reported: ${err?.message ?? 'the request failed'}` };
    case 'bad_request':
      return { code, retry: false, retract: false, message: `${name} rejected the request as malformed. ${err?.message ?? ''}`.trim() };
    case 'cancelled':
      return { code, retry: false, retract: false, message: `The request to ${name} was cancelled.` };
    case 'rate_limited':
      return { code, retry: true, retract: false, message: `${name} is rate limiting requests. The figures shown are the last that loaded.` };
    case 'server_unavailable':
      return { code, retry: true, retract: false, message: `${name} is briefly unreachable. The figures shown are the last that loaded.` };
    case 'capability_disabled':
    case 'capability_removed':
      return { code, retry: false, retract: true, message: 'Live data is switched off for this page.' };
    default:
      return { code, retry: false, retract: false, message: `${name} could not be read. ${err?.message ?? ''}`.trim() };
  }
}

/**
 * Register the watches that feed the dashboard.
 *
 * Each section is watched independently, so one failing connector annotates its
 * own section rather than blanking the page. `onChange` is called whenever any
 * section changes, with the whole current state.
 */
export function startLiveFeed({ mcp, meta, hubspot, range, onChange }) {
  const state = {
    parts: {},          // key -> raw rows
    errors: {},         // key -> described error
    storedAt: {},       // key -> epoch ms of the served result
    ready: false,
  };
  const unsubs = [];
  const retried = new Set();

  const deliver = () => { state.ready = true; onChange({ ...state, parts: { ...state.parts }, errors: { ...state.errors } }); };

  const watch = (key, server, tool, args) => {
    const handler = (ev) => {
      if (ev.type === 'data') {
        state.parts[key] = ev.result?.payload ?? null;
        // Freshness comes from the served result, never from the local clock.
        state.storedAt[key] = ev.result?.cache?.storedAt ?? Date.now();
        delete state.errors[key];
        deliver();
        return;
      }
      const described = describeError(ev.error, server);
      state.errors[key] = described;
      // Authz denials retract rendered data. Transient errors keep last good.
      if (described.retract) delete state.parts[key];
      if (described.retry && !retried.has(key)) {
        retried.add(key);
        const wait = Math.min(ev.error?.retryAfterMs ?? 2000, 60000) + Math.random() * 800;
        setTimeout(() => { mcp.invalidate?.(server, tool, args); }, wait);
      }
      deliver();
    };
    try {
      unsubs.push(mcp.watchTool(server, tool, args, handler));
    } catch (err) {
      state.errors[key] = describeError(err, server);
      deliver();
    }
  };

  const base = { adAccountId: meta.adAccountId, campaignId: meta.campaignId, since: range.since, until: range.until };
  watch('campaign', META_SERVER, META_TOOL, metaArgs(base));
  watch('daily', META_SERVER, META_TOOL, metaArgs({ ...base, timeIncrement: '1' }));
  watch('platform', META_SERVER, META_TOOL, metaArgs({ ...base, breakdowns: ['publisher_platform'] }));
  watch('region', META_SERVER, META_TOOL, metaArgs({ ...base, breakdowns: ['region'] }));
  watch('age', META_SERVER, META_TOOL, metaArgs({ ...base, breakdowns: ['age'] }));
  watch('ad', META_SERVER, META_TOOL, metaArgs({ ...base, level: 'ad' }));
  if (range.prevSince && range.prevUntil) {
    watch('previous', META_SERVER, META_TOOL, metaArgs({ ...base, since: range.prevSince, until: range.prevUntil }));
  }
  if (hubspot?.joinProperty && hubspot?.matchValue && hubspot?.equipmentProperty) {
    watch('cohort', HUBSPOT_SERVER, HUBSPOT_TOOL, hubspotArgs(hubspot));
  }

  return () => { for (const u of unsubs) { try { u(); } catch { /* already gone */ } } };
}
