# V791 — SECURITY SCOPE
CLASS=EVIDENCE_ONLY/DO_NOT_RUN; V791 is staged in a GitHub handoff branch, not live.
- Existing app ID: 54704500; no new app, no new CNG key, no third-party token broker.
- The public build contains ONLY index.html, vendored VK Bridge JS and its license/provenance. No secret tokens or key materials.
- Browser-side VK Bridge asks VK for permissions; the local Python bridge is expected to hold token files on Windows. Public web hosting must NEVER hold private CNG or a reusable photo token.
- Static build is byte-identical to GitHub main at pinned commit. Do not 'fix' auth controls by removing CORS or session key. Native VK_PHOTO_BRIDGE.py enforces ALLOWED_ORIGIN; its exact future host must be added under a separately authorized E write. Do NOT modify this bridge from here.
- VK native deployment is a CHANGE TO LIVE VK APP HOSTING, not merely a source-code copy. It may change application URL endpoints. Separate human authorization required before calling vk-miniapps-deploy.
- Old GitHub Pages files untouched, reversible by restoring prior URL fields after a separately approved change; rollback of a deployment requires independent VK readback.
- Current photo token suffered VK API error_code=5,error_subcode=1130 (source V790 bounded evidence), so hosting migration alone DOES NOT prove API token validity or fix egress/IP. A fresh user-authenticated token from consistent network exit and two album preflights will be required later.
- No READY/ACTIVE/Phase D/FINAL SEAL/production or VK photo upload/save/publish permissions from V791.
