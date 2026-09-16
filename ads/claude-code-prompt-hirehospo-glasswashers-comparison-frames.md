# Claude Code Prompt - HireHospo 16s "Get The Glasswasher You Really Want": Animated Frames

> **This ad is a re-skin.** Open Claude Code with `HireHospo_glasswashers-comparison_script_16s.md`,
> `HireHospo_glasswashers-comparison_storyboard.md`, and **`ad/machines-you-really-want/`**.
> The SCC101 comparison build already contains every frame this ad needs. **Do not rebuild anything.**
> Paste below the line.

---

## 1. Mandate

Produce `ad/glasswashers-comparison/` as a **configuration of the existing SCC101 comparison build**, plus one new product cut-out. Stitched **16.0s animatic at 1080×1920 (9:16)**. If you find yourself writing a new frame component, stop - it already exists.

## 2. What actually changes

| Token | Value |
|---|---|
| `--product-name` | `GLASSWASHERS` **(category, not a model - see §5)** |
| `--product-image` | Glasswasher cut-out, transparent background, front three-quarter, lit upper left |
| `--buy-price` | `$3,200` ⚠ **illustrative, mid-band. Confirm against the portal brochure before publishing** |
| `--entry-rate` | `$4.66` ✅ **approved claim, no sign-off needed** |
| `--short-figure` | `3.2K` |
| `--hero-line` | `GET THE GLASSWASHER YOU REALLY WANT` |
| `--outcome-1` | `CLEAN GLASSES THROUGH A FRIDAY` |
| `--outcome-2` | `NO HAND-WASHING BEHIND THE BAR` |
| `--category-sfx` | Glass-rack rattle, light and dry, short |

Everything else - table, rows, ticks, crosses, disclaimer, hero frame, payoff, end card, tokens, stage, `?record` - is inherited unchanged.

## 3. The table

| | Buy outright · `--buy-price` | Lease-to-Own · from `--entry-rate`/day |
|---|---|---|
| 1 | ✓ `OWN IT DAY ONE` | ✓ `OWN IT AT END OF TERM` |
| 2 | ✗ `3.2K OUT OF YOUR POCKET` | ✓ `KEEP 3.2K IN YOUR POCKET` |
| 3 | ✗ `LARGE UPFRONT` | ✓ `LOW WEEKLY PAYMENTS` |
| 4 | ✓ `TAX DEDUCTIBLE*` | ✓ `TAX DEDUCTIBLE*` |

`*Seek independent tax advice for your circumstances`

## 4. Timing

1.0 + 1.5 + 1.5 + 2.0 + 0.75 + 0.75 + 0.75 + 0.75 + 2.5 + 2.0 + 2.5 = **16.0s**

## 5. Compliance - non-negotiable

- **No model name anywhere in this ad.** The plinth chip renders the **category** (`GLASSWASHERS`) only. This matters more here than on the sibling ads because this one carries a real approved rate: a model name adjacent to a daily figure reads as a per-product quote and breaches the credit gate.
- **Keep `FROM` in the rate line.** Never a bare `$4.66/DAY`.
- **`OWN IT AT END OF TERM` on the right. Never `OWN IT DAY ONE` on the right** - Lease-to-Own transfers ownership at the end of the 36-month term.
- **`3.2K OUT OF YOUR POCKET` on the left, never `3.2K DEBT`** - a cash purchase spends capital, it does not create debt.
- **The tax disclaimer is a DOM child of the table block.** No independent animation, no reflow that separates it, minimum 24px at 1080 width.
- **Rows 1 and 4 match on both sides. Do not convert the table to a clean sweep.**
- **Both figures are parameterised tokens, defined once.** `--entry-rate` is approved; `--buy-price` is illustrative and the portal governs. **State in the README exactly which line to edit.** Ship a `?alt` cut with a `[BUY]` placeholder.
- **No arithmetic anywhere** - no totals, no working, no multiplication.
- **No GST line** - removed by client direction. Do not reinstate.
- **"Subject to credit approval"** on the end card. **"Fully serviced, with warranty"**, never "refurbished".
- **Left column carries no flame at any point.** Ticks `approve` and small, crosses `mute`, never a fill.
- **No specs.** No cycle time, rack count, glasses per hour, dimensions or power.
- **Roles clean:** HireHospo finances; Washpro sources, refurbishes, delivers, installs and services.

## 6. Variant B

Also build `frames/04-payoff-alt.html` behind `?variant=b`: replace the payoff headline with `FIXED BEFORE THE WEEKEND` and demote the `$3.2K` strike-through to a secondary element. At this price tier the capital payoff lands softer than it does at $30K, so urgency may win. Everything else identical.

## 7. Self-review

Animatic exactly 16.0s · copy matches §3 character-for-character · both figures defined in exactly one place each · **no model name anywhere** · `FROM` present in the rate line · disclaimer inseparable from the table at 9:16, 4:5 and 1:1 · `OWN IT AT END OF TERM` on the right · no `DEBT` anywhere · rows 1 and 4 match · no arithmetic, no GST line, no specs · left column flame-free · safe area clear (top 250px / bottom 320px) · `?record` clean at 1080×1920 · `?alt` and `?variant=b` both render · `prefers-reduced-motion` degrades to fades.
