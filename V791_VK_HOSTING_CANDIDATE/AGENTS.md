# AGENTS.md — V791 VK Hosting candidate
- Fail closed. Do not deploy or change app settings, E:, main, VK photo publishing or keys.
- Verify exact source blob SHA and link to immutable Git main commit.
- Preserve VK Bridge calls, relative JS path, CORS/session keys, and photo token privacy.
- No React rebuild; static frontend is sufficient.
- If proposing deployment, require a separate exact owner approval, dev-only first, prove URL after deploy, never invent domains.
