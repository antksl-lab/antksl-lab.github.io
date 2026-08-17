from __future__ import annotations
import hashlib, re, sys
from pathlib import Path

HERE=Path(__file__).resolve().parent
HTML=HERE/'index.html'
VENDOR=HERE/'vendor'/'vk-bridge-2.15.0.min.js'
LICENSE=HERE/'vendor'/'VK_BRIDGE_LICENSE.txt'
PROV=HERE/'vendor'/'VK_BRIDGE_2_15_0_PROVENANCE.md'
EXPECTED_VENDOR_SHA='0cdf89612cf18f12d5f39be5e5ea0aad6d1760ddb3964f31effb251d679d8178'
EXPECTED_LICENSE_SHA='15752ef20d62ef8f9b56deb04f8afbcb05d63823215ef2a2325da0890c940ab9'

def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()

def run():
    C=[]; c=lambda n,x:C.append((n,bool(x)))
    html=HTML.read_text(encoding='utf-8')
    prov=PROV.read_text(encoding='utf-8')
    c('build_v14',"HELPER_BUILD='20260817-v1.4'" in html)
    c('bridge_pin_215',"BRIDGE_PIN='2.15.0'" in html)
    same="'./vendor/vk-bridge-2.15.0.min.js'"
    unpkg="'https://unpkg.com/@vkontakte/vk-bridge@2.15.0/dist/browser.min.js'"
    jsdelivr="'https://cdn.jsdelivr.net/npm/@vkontakte/vk-bridge@2.15.0/dist/browser.min.js'"
    c('same_origin_present',same in html)
    c('fallback_unpkg_present',unpkg in html)
    c('fallback_jsdelivr_present',jsdelivr in html)
    c('same_origin_first',html.index(same)<html.index(unpkg)<html.index(jsdelivr))
    c('bootstrap_marker','bootstrap-v3-same-origin-first' in html)
    c('early_hash_before_bridge_init',html.index('const EARLY_CODE=codeFromLocation(window.location.hash)') < html.index('BRIDGE_READY=initializeBridge()'))
    c('early_hello_before_bridge_init',html.index("ensureHello('INITIAL_HASH_EARLY')") < html.index('BRIDGE_READY=initializeBridge()'))
    for stage in ['VK_BRIDGE_LOADED','VK_INIT_OK','AUTH_REQUESTED','AUTH_RESULT','TOKEN_SUBMIT']:
        c('stage_'+stage,stage in html)
    c('auth_via_bridge',"bridge.send('VKWebAppGetAuthToken'" in html)
    c('token_preflight','photos.getAlbums' in html)
    c('token_direct_local_post',"call('/photo-token',{access_token:token}" in html)
    c('no_clipboard_write','clipboard.writeText' not in html)
    c('no_clipboard_read','clipboard.readText' not in html)
    c('no_token_location_assignment','access_token='+'' not in html)  # exact concatenation pattern intentionally absent
    c('vendor_exists',VENDOR.is_file() and VENDOR.stat().st_size>0)
    c('license_exists',LICENSE.is_file() and LICENSE.stat().st_size>0)
    c('provenance_exists',PROV.is_file() and PROV.stat().st_size>0)
    c('vendor_sha_exact',sha(VENDOR)==EXPECTED_VENDOR_SHA)
    c('license_sha_exact',sha(LICENSE)==EXPECTED_LICENSE_SHA)
    c('provenance_vendor_sha',EXPECTED_VENDOR_SHA in prov)
    c('provenance_license_sha',EXPECTED_LICENSE_SHA in prov)
    c('official_tag_bound','de813fc42fe3c2b490ee1ec56adf712fb177c601' in prov)
    c('package_identity_bound','@vkontakte/vk-bridge@2.15.0' in prov)
    fails=[n for n,ok in C if not ok]
    print(f'TOKEN HELPER V1.4 STATIC AUDIT: {len(C)-len(fails)} / {len(C)} PASS')
    for n,ok in C: print(('PASS' if ok else 'FAIL'),n)
    if fails:
        print('FAILED:',','.join(fails)); return 1
    print('RESULT: PASS_ANTKSL_TOKEN_HELPER_V1_4_STATIC_AUDIT')
    print('RUNTIME E2E TOKEN REFRESH: NOT CLAIMED')
    return 0

if __name__=='__main__': raise SystemExit(run())
