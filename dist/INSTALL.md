# Installing the HireHospo Ad Factory skill in Hermes

This folder holds a **portable, self-contained build** of the `hirehospo-ad-factory` skill. Unlike the
copy in `.claude/skills/`, it depends on no other skill — the catalogue authority normally supplied by
`hirehospo-products` and the stage methods normally supplied by the `meta-ad-*` skills are inlined.

```
hirehospo-ad-factory/
├── SKILL.md                        ← entry point; frontmatter name + description
└── references/
    ├── hirehospo-brand.md          brand constants, ICPs, claims, gates, visual system, frames
    ├── catalogue.md                the 13 categories, active counts, price bands, ICP gear
    ├── pipeline.md                 frameworks, beat maps, per-stage method, audits
    └── output-templates.md         the four output templates
```

`hirehospo-ad-factory.zip` is the same folder zipped, for upload-based installs.

**Total size is small** (~60KB, five markdown files). Only `SKILL.md`'s frontmatter loads at rest; the
references are read on demand.

---

## Pick the install path that matches what Hermes exposes

### A. Hermes reads a skills folder on disk (Claude Code / Agent SDK / anything using the Agent Skills convention)

Copy the folder — not the contents — into the skills directory, so that `SKILL.md` sits one level
down:

```bash
# project-scoped (only in that project)
cp -r dist/hirehospo-ad-factory <hermes-project>/.claude/skills/

# or user-scoped (available everywhere)
cp -r dist/hirehospo-ad-factory ~/.claude/skills/
```

Then restart the Hermes session and confirm the skill is listed. The directory name must match the
`name:` in the frontmatter (`hirehospo-ad-factory`).

If Hermes uses its own path (`~/.hermes/skills/`, `skills/`, `agents/skills/`, a plugin directory),
the same rule holds: one folder per skill, `SKILL.md` at its root.

### B. Hermes accepts a skill upload (a .zip, like claude.ai Capabilities → Skills)

Upload `dist/hirehospo-ad-factory.zip`. The zip contains the folder at its root, which is the layout
uploaders expect. Nothing else to do.

### C. Hermes has custom instructions / a system prompt but no skill system

Then there is nothing to install — use `docs/AD_FACTORY_BRIEF_HERMES.md` instead. Its Part 2 is the
whole skill flattened into one paste-ready block, built for exactly this case.

### D. Hermes is a repo-based agent

Commit the folder into the Hermes repo at whatever path it loads skills from, and let its own sync
pick it up.

---

## Verify the install

Ask Hermes: **"make a HireHospo ad for a bar whose glasswasher just died"**

A correct install shows all of these:

- [ ] It states a Step 1 reading first — archetype, awareness stage, ICP (bar/pub), offer focus,
      featured category, length
- [ ] Glasswashers are priced in the **$2,300–$4,000** band (that number comes from `catalogue.md`,
      so it proves the references loaded, not just the frontmatter)
- [ ] HireHospo first appears around **45–55%** of runtime, not in the opening beats
- [ ] Every payment mention carries **"+ GST"**; the end card carries **"Subject to credit approval"**
- [ ] One CTA, **"Apply now"**, landing last
- [ ] Four files come back: script, storyboard, audio brief, Claude Code prompt

If it produces an ad but misses the price band or the compliance microcopy, the frontmatter loaded and
the references didn't — check the `references/` folder came across and that paths are relative to
`SKILL.md`.

---

## Keeping it in sync

The canonical copy is `.claude/skills/hirehospo-ad-factory/` in this repo. This build is derived from
it, so when the canonical skill changes:

1. Re-copy `references/output-templates.md` and `references/hirehospo-brand.md`, then re-apply the
   portable-build edits (brand ref points at `catalogue.md` instead of `hirehospo-products`;
   `SKILL.md` and `pipeline.md` carry the inlined methods rather than calling sub-skills).
2. Re-zip: `cd dist && zip -r hirehospo-ad-factory.zip hirehospo-ad-factory`
3. Reinstall in Hermes.

Two things drift and matter:

- **The catalogue snapshot** in `catalogue.md` is dated 26 May 2026 (241 active products, ~30 brands,
  ~$795–$32,995, median ~$3,600). Price bands in paid creative need verifying against the live site
  regardless of how fresh the file is.
- **The visual system** in `hirehospo-brand.md` §10 is provisional — there is no official HireHospo UI
  kit yet. When one exists, it replaces those tokens everywhere.

## Known limits of the portable build

- **No per-product data.** The full `hirehospo-products` skill carries `active-products.csv` (241
  active products with SKU, price, condition, and URL). This build has category-level truth only, so
  Hermes will ⚠-flag specific model names and prices rather than invent them. Where a named product
  matters, look it up on hirehospo.com and hand it to Hermes in the request.
- **No live catalogue read.** Nothing in this build hits the site, so every price band is a snapshot.
- **Hermes doesn't build the frames.** Stage 5 outputs a *prompt* for Claude Code, which is what
  renders the HTML frames and the animatic. Keep that step where it is.
