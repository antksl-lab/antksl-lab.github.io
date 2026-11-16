# V791 — VK-native hosting migration gate (NO LIVE ACTION YET)

## Verified source
Repo: antksl-lab/antksl-lab.github.io
Main HEAD: 3d2ccd7c8b52cc898ff06a6f41f6d0856de59075
Main TREE: 50eb395b71d737cc009e2e10baebaf0017e40ab9
Existing VK Mini App ID: 54704500 (owner-screen and source)
Source exact pins: build/index.html git-blob=7b2ab94f86e334f509f4247b7cf771e008b372eb size=18245; build/vendor/vk-bridge-2.15.0.min.js git-blob=df90b1daec34ced2144924a004c0de3ff535370d size=7849; build/vendor/VK_BRIDGE_LICENSE.txt git-blob=434cb317747493a87a213c22d27bf5c95b1c098e size=1086; build/vendor/VK_BRIDGE_2_15_0_PROVENANCE.md git-blob=ea01d8f2eb29ed2f23f9efdcbfc3979268c49999 size=707
Frontend has ONE same-origin VK Bridge vendor script and preserved relative import. Source helper build remains 20260823-v1.8.2-postbox-probe. No credentials/secret keys in build.

## Why VK-native hosting
Official VK Mini Apps Deploy package @vkontakte/vk-miniapps-deploy v1.0.3 supports static_path+app_id+endpoints, and VK's official examples use it for app hosting. Public static site replaces unreachable antksl-lab.github.io as the web frontend.
References:
https://github.com/VKCOM/vk-miniapps-deploy
https://www.npmjs.com/package/@vkontakte/vk-miniapps-deploy
https://github.com/VKCOM/vk-mini-apps-course-frontend

## Phases, keep separate
A. C_ONLY_PREPARED [THIS BRANCH]: source copied by exact Git blob SHA, config ready. Never upload secrets.
B. VK_HOSTING_DEV_DEPLOY [NEEDS OWNER HUMAN AUTH]: install Node package v1.0.3 and deploy DEV only, capture actual returned hosting URL and a non-secret receipt. Stop if tooling tries to alter production URLs/settings without grant.
C. VK_APP_URL_CHANGE [NEEDS OWNER APPROVAL]: inspect VK app 54704500 actual endpoints, enable only independently verified VK-hosted URL. Do not replace any working settings without rollback.
D. NATIVE_BRIDGE_ORIGIN_BINDING [NEEDS OWNER APPROVAL]: check and update ONLY exact allowed origin in E: VK_PHOTO_BRIDGE.py with C backup/readback+rollback; if Sidecar pins bridge SHA, a separately approved exact pin update required. Never disable CORS/session key.
E. AUTHENTICATED_VK_TOKEN [NEEDS USER LOGIN/MFA]: obtain a fresh authorized token through same egress as Python VK API calls; current error 5/1130 must be resolved, no blind retry.
F. CASE42_RELEASE_GRANT [SEPARATE CNG GATE]: exact owner signed short-lived case42 grant, 5 create-only policy files.
G. PUBLICATION [SEPARATE OWNER AUTH]: fresh two-album duplicate check then original START_STORIES.bat; postwrite readback both albums; UNKNOWN means HOLD, never resend blind.

## Commands after B is separately authorized
Run in V791_VK_HOSTING_CANDIDATE with Node.js available:
npm install --ignore-scripts --no-audit --no-fund
Set MINI_APPS_ENVIRONMENT=dev in the **single controlled process only**, then npx --no-install vk-miniapps-deploy.
Important: official deploy tooling may update VK app URL settings even for a dev deploy; verify tool behavior and request explicit decision before any network write. Do not run commands solely from this document; an owner-approved RUN successor will have an approval marker and one-shot wrapper.
No publication, no CNG signing, no E writes in this branch.
