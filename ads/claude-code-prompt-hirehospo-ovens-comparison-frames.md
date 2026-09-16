# Claude Code Prompt - HireHospo 16s "Get The Oven You Really Want": Animated Frames

> **This ad is a re-skin.** Open Claude Code with `HireHospo_ovens-comparison_script_16s.md`,
> `HireHospo_ovens-comparison_storyboard.md`, and **`ad/machines-you-really-want/`**.
> The SCC101 comparison build already contains every frame this ad needs. **Do not rebuild anything.**
> Paste below the line.

---

## 1. Mandate

Produce `ad/ovens-comparison/` as a **configuration of the existing SCC101 comparison build**, plus one
new product cut-out. Stitched **16.0s animatic at 1080×1920 (9:16)**. If you find yourself writing a new
frame component, stop - it already exists.

## 2. What actually changes

| Token | Value |
|---|---|
| `--product-name` | `Turbofan E31D4` |
| `--product-image` | Turbofan E31D4 cut-out, transparent background, front three-quarter, lit upper left |
| `--buy-price` | `$6,550` ⚠ **derived, confirm against the portal brochure before publishing** |
| `--entry-rate` | `$5.90` ⚠ **derived, confirm against the portal brochure before publishing** |
| `--short-figure` | `6.5K` (used in rows 2 and in the payoff strike-through) |
| `--hero-line` | `GET THE OVEN YOU REALLY WANT` |
| `--outcome-1` | `CONSISTENT BAKES, EVERY TRAY` |
| `--outcome-2` | `PUT HOT FOOD ON THE MENU` |
| `--category-sfx` | oven-door thunk, lighter and higher than the combi ad |

Everything else - table, rows, ticks, crosses, disclaimer, hero frame, payoff, end card, tokens, stage,
`?record` - is inherited unchanged.

## 3. The table (identical structure to the sibling ads)

| | Buy outright · `--buy-price` | Lease-to-Own · from `--entry-rate`/day |
|---|---|---|
| 1 | ✓ `OWN IT DAY ONE` | ✓ `OWN IT AT END OF TERM` |
| 2 | ✗ `6.5K OUT OF YOUR POCKET` | ✓ `KEEP 6.5K IN YOUR POCKET` |
| 3 | ✗ `LARGE UPFRONT` | ✓ `LOW WEEKLY PAYMENTS` |
| 4 | ✓ `TAX DEDUCTIBLE*` | ✓ `TAX DEDUCTIBLE*` |

`*Seek independent tax advice for your circumstances`

## 4. Timing

1.0 + 1.5 + 1.5 + 2.0 + 0.75 + 0.75 + 0.75 + 0.75 + 2.5 + 2.0 + 2.5 = **16.0s**

## 5. Compliance - non-negotiable

- **`OWN IT AT END OF TERM` on the right. Never `OWN IT DAY ONE` on the right** - Lease-to-Own transfers ownership at the end of the 36-month term, so that would misstate the contract.
- **`6.5K OUT OF YOUR POCKET` on the left, never `6.5K DEBT`** - a cash purchase spends capital, it does not create debt.
- **The tax disclaimer is a DOM child of the table block.** No independent animation, no reflow that separates it, minimum 24px at 1080 width.
- **Rows 1 and 4 match on both sides. Do not convert the table to a clean sweep of ticks against crosses.**
- **Both figures are parameterised tokens, defined once.** They are derived, not published, and the portal governs. **State in the README exactly which line to edit.** Ship a `?alt` cut with `[BUY]` and `[RATE]` placeholders.
- **No arithmetic anywhere** - no totals, no working, no multiplication.
- **No GST line** - removed by client direction. Do not reinstate.
- **"Subject to credit approval"** on the end card. **"Fully serviced, with warranty"**, never "refurbished".
- **Left column carries no flame at any point.** Ticks `approve` and small, crosses `mute`, never a fill.
- **No specs.** No capacity, tray count, racks per hour, cycle time, dimensions or power. Those live on the product page and vary by unit.
- **Roles clean:** HireHospo finances; Washpro sources, refurbishes, delivers, installs and services.

## 6. Self-review

Animatic exactly 16.0s · copy matches §3 character-for-character · both figures defined in exactly one place each · disclaimer inseparable from the table at 9:16, 4:5 and 1:1 · `OWN IT AT END OF TERM` on the right · no `DEBT` anywhere · rows 1 and 4 match · no arithmetic, no GST line, no specs · left column flame-free · safe area clear (top 250px / bottom 320px) · `?record` clean at 1080×1920 · `?alt` renders placeholders · `prefers-reduced-motion` degrades to fades.
