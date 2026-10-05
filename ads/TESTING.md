# HireHospo organic video testing

We post 2-4 videos a week organically, see which get the most engagement, and move the winners to paid ads. Every brief is already paid-compliant, so a winner can go to paid as it is.

## Weekly loop
1. **Sunday night:** the automation writes 4 briefs and a week plan in `ads/weekly/`. Briefs 1-2 are made first.
2. **During the week:** the producer makes and posts 2-4 videos. Post each one on the same platforms, at a similar time of day, with the caption from its week plan.
3. **7 days after posting:** fill in that video's row in `test-log.csv` from Instagram / Facebook insights. Set `status` to `posted` when it goes up and `measured` once its 7-day numbers are in.
4. **The next Sunday:** the automation reads `test-log.csv`, ranks every measured video, recommends which to move to paid, and leans the next 4 briefs toward the angles that are winning.

## What to record (7 days after posting)
| Column | Where to find it |
|---|---|
| views, reach | Reel / video insights |
| avg_watch_s | "Average watch time" |
| pct_watched_full | % of viewers who watched to the end, if shown |
| three_sec_views | 3-second views (Facebook) or the 3-second hold %, converted to a count |
| shares, saves, comments | Interactions |
| link_clicks_or_profile_visits | Profile activity / link clicks |
| enquiries | Applications or enquiries you can trace to this video |

## How a winner is picked (starting rules - adjust once there's data)
- A video needs **at least 500 views** before it's ranked.
- Ranked on, in order: **hold rate** (3-second views ÷ views), **average watch time as a share of length**, **shares + saves per 1,000 views**, then enquiries.
- **Move to paid:** top quarter on hold rate *and* above the median on shares + saves per 1,000 views. Any video that produces an enquiry is reviewed for paid regardless.
- Every video should keep the same compliance (no "+ GST", "dishwasher" not "glasswasher", "Subject to credit approval" on the end card), so it can go to paid without edits.
