# VK Token Helper v1.4 — source audit (2026-08-17)

Current helper build: `20260817-v1.4`.

## First-party findings

Source: official `VKCOM/vk-bridge` repository.

- Browser/Web is a supported VK Bridge runtime.
- `VKWebAppInit` is included in the desktop/web supported-method set.
- `VKWebAppGetAuthToken` is included in the desktop/web supported-method set.
- In the browser implementation, VK Bridge communicates with the parent frame using `postMessage`; the library does not require that its JavaScript bytes originate from a third-party CDN.
- Official VK Mini Apps API documentation/source describes app initialization as preceding use of other API methods.

Primary source locators:

- `https://github.com/VKCOM/vk-bridge/blob/master/packages/core/src/bridge.ts`
- `https://github.com/VKCOM/vk-mini-apps-api/blob/master/src/index.ts` (archived repository; used only for the historical/official init-before-methods contract)

## v1.4 implication

Serving the pinned browser build from the same GitHub Pages origin first is compatible with the VK Bridge browser model. `unpkg` and `jsDelivr` remain fallbacks only.

This source audit does **not** assert that live token refresh is fixed. A fresh VK-hosted execution is still required to distinguish:

1. Helper HTML / early `/hello` delivery,
2. same-origin Bridge JS load,
3. `VKWebAppInit`,
4. `VKWebAppGetAuthToken`,
5. local token verification/save.

Known pre-v1.3 runtime evidence stopped before `/hello`; therefore it must not be reclassified as an auth failure.

No VK access token or session secret is recorded in this audit.
