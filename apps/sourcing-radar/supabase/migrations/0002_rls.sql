-- Row level security on every table (see 7 and 11). There is no public access
-- and no self registration: users are invited by the admin.
--
-- Ingestion, alerting and the extension ingest endpoint all run server side
-- under the service role key, which bypasses RLS. Everything a browser can
-- reach goes through the policies below.

create or replace function is_member()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from app_users u where u.id = auth.uid());
$$;

create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from app_users u where u.id = auth.uid() and u.role = 'admin');
$$;

alter table app_users               enable row level security;
alter table app_config              enable row level security;
alter table device_tokens           enable row level security;
alter table sources                 enable row level security;
alter table watch_terms             enable row level security;
alter table global_negative_keywords enable row level security;
alter table brands                  enable row level security;
alter table categories              enable row level security;
alter table listings                enable row level security;
alter table listing_matches         enable row level security;
alter table listing_states          enable row level security;
alter table duplicate_candidates    enable row level security;
alter table ingestion_runs          enable row level security;
alter table raw_payloads            enable row level security;
alter table alerts                  enable row level security;
alter table alert_queue             enable row level security;
alter table source_health_alerts    enable row level security;

-- Members read the roster. Only an admin edits it, and a user may edit their
-- own alert routing and quiet hours.
create policy app_users_read on app_users for select using (is_member());
create policy app_users_self_update on app_users for update using (id = auth.uid()) with check (id = auth.uid());
create policy app_users_admin_all on app_users for all using (is_admin()) with check (is_admin());

create policy app_config_read on app_config for select using (is_member());
create policy app_config_admin_write on app_config for all using (is_admin()) with check (is_admin());

create policy device_tokens_own on device_tokens for all using (user_id = auth.uid() or is_admin()) with check (user_id = auth.uid() or is_admin());

create policy sources_read on sources for select using (is_member());
create policy sources_admin_write on sources for all using (is_admin()) with check (is_admin());

-- The buying profile is admin only. Viewers read the feed but cannot change
-- what the business is buying (see 4).
create policy watch_terms_read on watch_terms for select using (is_member());
create policy watch_terms_admin_write on watch_terms for all using (is_admin()) with check (is_admin());

create policy global_negatives_read on global_negative_keywords for select using (is_member());
create policy global_negatives_admin_write on global_negative_keywords for all using (is_admin()) with check (is_admin());

create policy brands_read on brands for select using (is_member());
create policy brands_admin_write on brands for all using (is_admin()) with check (is_admin());
create policy categories_read on categories for select using (is_member());
create policy categories_admin_write on categories for all using (is_admin()) with check (is_admin());

create policy listings_read on listings for select using (is_member());
create policy listing_matches_read on listing_matches for select using (is_member());
create policy duplicate_candidates_read on duplicate_candidates for select using (is_member());

-- Triage is shared. Everyone sees everyone's states, and writes their own.
create policy listing_states_read on listing_states for select using (is_member());
create policy listing_states_write on listing_states for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy ingestion_runs_read on ingestion_runs for select using (is_member());
create policy source_health_read on source_health_alerts for select using (is_member());

-- Raw payloads can carry the founder's own email content, so they stay admin only.
create policy raw_payloads_admin on raw_payloads for all using (is_admin()) with check (is_admin());

create policy alerts_own_read on alerts for select using (user_id = auth.uid() or is_admin());
create policy alert_queue_own_read on alert_queue for select using (user_id = auth.uid() or is_admin());
