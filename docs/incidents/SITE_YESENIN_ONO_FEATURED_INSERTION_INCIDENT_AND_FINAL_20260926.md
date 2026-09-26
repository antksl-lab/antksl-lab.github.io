# SITE RELEASE INSERTION — YESENIN + ONO — INCIDENT, REPAIR, FINAL MEMORY

Date: 2026-09-26
Repository: antksl-lab/antksl-lab.github.io
Publication source: main
Verified pre-documentation production HEAD: b99309b36a6865d8efc942c327d547810aa56ef4
Verified pre-documentation production TREE: c83081329503f0bc251955f65a94b5d5c6808d22

## OWNER INTENT — BINDING

Add the new release «Ты с каждым поколением живой!» ABOVE «Оно уже не сверху, а внутри» in exactly the same visual/form language, WITHOUT replacing, demoting, or deleting the existing full «Оно уже не сверху, а внутри» featured release block.

The correct final page must show BOTH full blocks simultaneously:

1. «Ты с каждым поколением живой!» — separate full release block + separate film block.
2. «Оно уже не сверху, а внутри» — preserved full release block + preserved film block.

The new Yesenin release may also appear in catalog / upcoming releases and Reels. Those appearances do NOT replace the required full release block.

## VERIFIED YESENIN DATA

Title: Ты с каждым поколением живой!
Artist: Константин Захаров
Release date: 2026-10-03
Genre: R&B/Soul
UPC: 4640688266198
Public BandLink supplied directly by owner: https://antksl.band.link/tyskazhdym
YouTube Shorts: https://youtube.com/shorts/7Jhc_W2yjfc
YouTube video id: 7Jhc_W2yjfc
VK Clip: https://vkvideo.ru/clip-239543600_456239070
VK owner id: 239543600
VK video id: 456239070
Cover repo path: assets/covers/ty-s-kazhdym-pokoleniem-zhivoy.webp
Promo-engine short description:
«Музыкальное посвящение Сергею Есенину — история о живом голосе поэта, который сквозь время, легенды и поколения продолжает говорить с людьми.»

## SOURCE AUTHORITY USED

Promo engine authority:
MUSIC_PROMO_ENGINE_v2_9_224_STANDALONE.py

Promo branch at session start:
antksl-lab/antksl-promo-studio
handoff/music-promo-yandex-bandlink-reels-20260926
HEAD=c60ef1c320a4816a85add67c1eebb411639b424b
TREE=13c9d418ad83018efe3206b6cc24bbb050b909e8

The promo engine contained the release metadata, description, YouTube/VK reel identities and approved cover evidence.
The exact public BandLink was missing in the engine and was later supplied directly by the owner:
https://antksl.band.link/tyskazhdym

Do not infer a main public BandLink from an editor hex or campaign URLs.

## APPROVED COVER

Canonical approved original promo asset evidence:
2000x2000 RGBA
SHA256=b040b5ff55baef0af0af492902e64301cd56bdbf128e114f26ef185e4400c7e3

Website derivative:
assets/covers/ty-s-kazhdym-pokoleniem-zhivoy.webp

The website derivative is an optimized web asset and must not be confused with the canonical original promo image hash.

## WHAT WENT WRONG

### INCIDENT 1 — FEATURED REPLACEMENT

The first implementation reused the existing featured release mechanism and moved spotlight=true from «Оно уже не сверху, а внутри» to «Ты с каждым поколением живой!».

This violated the owner's wording «размести выше ... точно по такой же форме»: the request was additive, not substitutive.

Failure pattern:
- new release became featured;
- existing ONO full featured block was displaced;
- catalog/reel insertion was correct, but the top-level information architecture was wrong.

### INCIDENT 2 — OVER-CORRECTION

The repair restored ONO as spotlight and restored the original ONO static featured markup.

However, because the new Yesenin release had originally been implemented by REPLACING that same top block, restoring ONO also removed the separate large Yesenin block.

Result:
- ONO was correctly restored;
- Yesenin remained in catalog/upcoming and Reels;
- BUT the requested standalone full Yesenin release block was absent.

This was still incorrect.

### FINAL REPAIR

The final fix stopped treating the two releases as mutually exclusive.

A separate Yesenin release section was inserted BEFORE the existing ONO section:
- section id: yesenin-now
- title id: yeseninReleaseTitle
- separate cover
- separate date/status
- separate BandLink
- separate film section id: yesenin-featured-film
- separate YouTube Shorts link
- separate VK Clip link

The existing ONO section remains:
- section id: now
- existing v3ReleaseTitle / v3Release* ids preserved
- existing ONO film block preserved

ONO remains the site's sticky spotlight in the dynamic track orchestrator:
spotlight=true on «Оно уже не сверху, а внутри»
Yesenin does NOT carry spotlight=true.

The chooser was repaired so an explicit spotlight does not expire merely because its release date passes:
spot=sorted.find(function(r){return r.spotlight})

Therefore future dated releases cannot silently replace ONO until the owner explicitly chooses a new spotlight.

## FINAL REQUIRED DOM ORDER

The order must remain:

section#yesenin-now
section#yesenin-featured-film
section#now
section#featured-film
... other sections ...

Catalog:
Yesenin card must be present before ONO card.

Reels:
Yesenin reel r18 must be present before ONO reel r17.

## FINAL PRODUCTION VERIFICATION BEFORE THIS DOCUMENTATION COMMIT

Production main:
HEAD=b99309b36a6865d8efc942c327d547810aa56ef4
TREE=c83081329503f0bc251955f65a94b5d5c6808d22
INDEX_BLOB=19fe6d7c2ff33fc2bcffdadd811c163ed204ebb4

Verified predicates:
YESENIN_FEATURED_PRESENT=True
ONO_FEATURED_PRESENT=True
YESENIN_BEFORE_ONO=True
YESENIN_BANDLINK=True
YESENIN_VK=True
YESENIN_YOUTUBE=True
ONO_TITLE_PRESERVED=True

## PERMANENT LAW FOR FUTURE RELEASE INSERTIONS

1. Parse the owner's verb literally:
   - «добавить / разместить выше» = additive insertion.
   - Never implement it as replacement unless owner explicitly says replace.

2. Before editing, inventory all surfaces affected by a release:
   - static full release section;
   - full film section;
   - catalog card;
   - Reels card;
   - COVERS;
   - TITLES;
   - DESCS;
   - REELS localization;
   - tracks;
   - JSON-LD ItemList;
   - preload/hero dependencies;
   - spotlight/orchestrator behavior.

3. Existing featured release is protected:
   - do not remove it;
   - do not move its spotlight;
   - do not reuse its DOM ids for a new simultaneous block;
   - do not alter its links/cover/copy unless explicitly authorized.

4. A simultaneous new full release MUST use unique IDs and its own section/film block.

5. After edit, enforce structural predicates:
   - NEW_FULL_BLOCK_PRESENT
   - OLD_FULL_BLOCK_PRESENT
   - NEW_BEFORE_OLD
   - NEW_CATALOG_PRESENT
   - NEW_REEL_PRESENT
   - OLD_FEATURED_UNCHANGED
   - ALL_PROVIDER_LINKS_BOUND
   - JSON_LD_PARSE
   - JSON_LD_COUNT_EXPECTED

6. Never infer a missing provider URL from editor ids, campaign ids, or URL patterns. Ask owner for the one missing authoritative value.

7. When owner supplies a public URL directly, record it as OWNER_SUPPLIED_AUTHORITY; do not mislabel it as independent provider read-back.

8. Do not tell the owner to manually upload files when connected GitHub write authority is available and the owner has authorized publication. Perform the write and verify post-write state.

9. Prefer one atomic commit for related website files whenever possible.

10. After production write:
    - read back main HEAD/TREE;
    - read back exact blobs;
    - verify structural predicates;
    - inspect the GitHub Pages workflow for the exact HEAD;
    - distinguish build success from browser/CDN visibility.

11. GitHub Pages may take time to publish after a push. Do not diagnose browser cache before confirming the exact deployment run for the exact HEAD.

12. A green deployment does not prove visual semantics. The structural DOM/order predicates must be checked independently.

## OBSOLETE ARTIFACT

Draft PR #2:
Add «Ты с каждым поколением живой!» release and reels

Status for operational use:
OBSOLETE — DO NOT MERGE.

Reason:
It represents an earlier pre-final implementation path and is not the final production state now present on main.

## CURRENT PRODUCTION INTENT

- YESENIN: visible as a standalone full release above ONO, plus catalog and Reels.
- ONO: remains fully visible and remains sticky featured/spotlight.
- No future release may displace ONO automatically.
- Any future spotlight change requires explicit owner instruction.

FINISH=SITE_YESENIN_ONO_FINAL_MEMORY_WRITTEN
