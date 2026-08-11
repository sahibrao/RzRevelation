# Characters

One markdown file per playable Marvel Rivals character. This folder is the
single source of truth for the hero picker on **Manage team** and for the
portraits shown on roster cards.

## Adding a character

Create `<slug>.md`, where the slug is the name lowercased with `&` spelled out
and everything non-alphanumeric turned into a dash (`Cloak & Dagger` →
`cloak-and-dagger.md`):

```markdown
---
name: Cloak & Dagger
role: Strategist
---

Two halves — light that heals, dark that blinds.
```

| Field | Required | Notes |
| --- | --- | --- |
| `name` | yes | Exactly how it should read on the site. |
| `role` | yes | `Vanguard`, `Duelist`, `Strategist`, or `Flex`. |
| `image` | no | Overrides art matching — use an absolute path like `/characters/hela.png` if you'd rather serve from `public/`. |

The text under the frontmatter is the one-line description shown in the picker.

## Adding artwork

Drop the image in **this folder** with the same slug as the markdown file:

```
hela.md
hela.png      ← picked up automatically
```

`.png`, `.jpg`, `.jpeg`, `.webp`, and `.avif` all work. Vite hashes and bundles
them, so no other wiring is needed. Portraits are cropped to 4:5 from the top on
player cards, so a head-and-shoulders shot around 400×500 works best, and they
sit on a dark plate in both themes — art lit for a dark background looks right.

A character with no image falls back to a monogram, so it's fine to add the
markdown first and the art later.

## Removing a character

Delete the file. Roster rows still holding that name keep displaying the plain
text — nothing breaks, the picker just no longer offers it.

_Files starting with `_` (this one) are ignored by the loader._
