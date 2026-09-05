from pathlib import Path
import re,json,sys,base64,hashlib
p=Path(sys.argv[1] if len(sys.argv)>1 else 'index.html')
text=p.read_text(encoding='utf-8')
TITLE='Оно уже не сверху, а внутри'
URL='https://antksl.band.link/onovnutri'
COVER='assets/covers/ono-vnutri.webp'
DATE='2026-09-27'
YT='nGgwPP1vVuU'
VK_OID='239543600'
VK_ID='456239068'
NEW_VERSION='2026-09-05-v3.2-ono-announcement'

def one_replace(old,new,label):
    global text
    n=text.count(old)
    if n!=1:
        raise SystemExit(f'ANCHOR_{label}_COUNT={n}')
    text=text.replace(old,new,1)

# Site version marker.
text=re.sub(r'<meta name="site-fix-version" content="[^"]+">',f'<meta name="site-fix-version" content="{NEW_VERSION}">',text,count=1)

# Structured data: parse rather than string-splice.
m=re.search(r'(<script type="application/ld\+json">\s*)(\{.*?\})(\s*</script>)',text,re.S)
if not m: raise SystemExit('JSONLD_NOT_FOUND')
data=json.loads(m.group(2))
artist=next((x for x in data.get('@graph',[]) if x.get('@id')=='https://antksl-lab.github.io/#artist'),None)
if not artist: raise SystemExit('JSONLD_ARTIST_NOT_FOUND')
il=artist.get('track')
if not isinstance(il,dict) or not isinstance(il.get('itemListElement'),list): raise SystemExit('JSONLD_TRACK_LIST_NOT_FOUND')
items=il['itemListElement']
if not any(((x.get('item') or {}).get('name')==TITLE) for x in items):
    new_item={
      '@type':'ListItem','position':1,
      'item':{'@type':'MusicRecording','@id':URL+'#recording','name':TITLE,
              'byArtist':{'@id':'https://antksl-lab.github.io/#artist'},
              'genre':'R&B/Soul','datePublished':DATE,'url':URL}
    }
    items.insert(0,new_item)
for i,x in enumerate(items,1): x['position']=i
il['numberOfItems']=len(items)
jsonld=json.dumps(data,ensure_ascii=False,indent=2)
text=text[:m.start(2)]+jsonld+text[m.end(2):]

# COVERS.
if f'"{TITLE}": "{COVER}"' not in text:
    one_replace('  const COVERS = {\n',f'  const COVERS = {{\n  "{TITLE}": "{COVER}",\n','COVERS')

# DESCS – all six site languages.
desc='''  "Оно уже не сверху, а внутри":{\n    ru:"Не «навсегда». А просто — до зари. Не клятва держит. Держит — жизнь сама.",\n    uk:"Не «назавжди». А просто — до зорі. Не клятва тримає. Тримає — саме життя.",\n    en:"Not “forever.” Just until dawn. It isn’t a vow that holds us. Life itself does.",\n    de:"Nicht „für immer“. Nur bis zur Morgendämmerung. Nicht ein Schwur hält uns. Das Leben selbst tut es.",\n    ja:"「永遠」ではない。ただ夜明けまで。二人をつなぐのは誓いではない。人生そのものだ。",\n    zh:"不是“永远”。只是到黎明。维系彼此的不是誓言，而是生活本身。"\n  },\n'''
if f'  "{TITLE}":{{\n    ru:"Не «навсегда»' not in text:
    one_replace('const DESCS={\n','const DESCS={\n'+desc,'DESCS')

# TITLES.
titles='''  "Оно уже не сверху, а внутри":{uk:"Воно вже не зверху, а всередині",en:"It’s No Longer Above, but Within",de:"Es ist nicht mehr oben, sondern innen",ja:"もう上ではなく、内側に",zh:"它已不在上方，而在内里"},\n'''
if '"Оно уже не сверху, а внутри":{uk:' not in text:
    one_replace('const TITLES={\n','const TITLES={\n'+titles,'TITLES')

# tracks[] – append to existing chronological source list. Keep spotlight metadata for future styling.
tracks_start=text.find('const tracks=[')
if tracks_start<0: raise SystemExit('TRACKS_START_NOT_FOUND')
tracks_end=text.find('];',tracks_start)
if tracks_end<0: raise SystemExit('TRACKS_END_NOT_FOUND')
tracks_block=text[tracks_start:tracks_end]
if f't:"{TITLE}"' not in tracks_block:
    entry=f'  {{t:"{TITLE}",g:"R&B/Soul",date:"{DATE}",url:"{URL}",spotlight:true}},\n'
    text=text[:tracks_end]+entry+text[tracks_end:]

# Reel translation data.
reel_data='''  r17:{title:{ru:"Оно уже не сверху, а внутри",uk:"Воно вже не зверху, а всередині",en:"It’s No Longer Above, but Within",de:"Es ist nicht mehr oben, sondern innen",ja:"もう上ではなく、内側に",zh:"它已不在上方，而在内里"},\n       cap:{ru:"Не «навсегда». А просто — до зари. Не клятва держит. Держит — жизнь сама.",\n            uk:"Не «назавжди». А просто — до зорі. Не клятва тримає. Тримає — саме життя.",\n            en:"Not “forever.” Just until dawn. It isn’t a vow that holds us. Life itself does.",\n            de:"Nicht „für immer“. Nur bis zur Morgendämmerung. Nicht ein Schwur hält uns. Das Leben selbst tut es.",\n            ja:"「永遠」ではない。ただ夜明けまで。二人をつなぐのは誓いではない。人生そのものだ。",\n            zh:"不是“永远”。只是到黎明。维系彼此的不是誓言，而是生活本身。"}},\n'''
if '  r17:{title:{ru:"Оно уже не сверху, а внутри"' not in text:
    one_replace('const REELS={\n','const REELS={\n'+reel_data,'REELS')

# New reel goes first in the visible reel grid.
reel_html=f'''\n  <div class="video-card reel-card" data-clip="r17" data-release-date="{DATE}" data-yt="{YT}" data-vk-oid="{VK_OID}" data-vk-id="{VK_ID}">\n    <div class="video-frame">\n      <button type="button" class="video-poster" aria-label="Смотреть рилз «{TITLE}»"><span class="play"></span></button>\n    </div>\n    <div class="video-meta">\n      <span class="reel-badge soon">Скоро · 27.09</span>\n      <h3 class="vt">{TITLE}</h3>\n      <p class="reel-cap">Не «навсегда». А просто — до зари. Не клятва держит. Держит — жизнь сама.</p>\n      <div class="video-src">\n        <button type="button" data-src="vk" aria-pressed="true">VK Видео</button>\n        <button type="button" data-src="yt" aria-pressed="false">YouTube</button>\n      </div>\n      <a class="reel-listen" href="{URL}" target="_blank" rel="noopener">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>\n        <span data-i18n-reels="listen">Сделать пресейв</span>\n      </a>\n    </div>\n  </div>\n'''
if 'data-clip="r17"' not in text:
    one_replace('  <div class="reel-grid">\n','  <div class="reel-grid">\n'+reel_html,'REEL_GRID')

# Add a subtle language-neutral premium halo to the release card by title-driven data attribute at render time
# only if the existing card renderer has a straightforward class literal. If not, skip rather than risk JS.
spot_css='''\n  /* 2026-09-05 · новый анонс: мягкий акцент без рекламного баннера */\n  .card[data-release-spotlight="1"]{\n    border-color:color-mix(in oklab,var(--amber) 72%,var(--line-2));\n    box-shadow:0 18px 48px color-mix(in oklab,var(--amber) 15%,transparent),0 10px 26px rgba(0,0,0,.16);\n  }\n  .card[data-release-spotlight="1"] .frame{box-shadow:inset 0 0 0 1px color-mix(in oklab,var(--amber) 42%,transparent)}\n'''
if 'data-release-spotlight' not in text:
    # CSS only. Dynamic card remains standard if renderer cannot safely be amended.
    first_style_end=text.find('</style>')
    if first_style_end<0: raise SystemExit('STYLE_END_NOT_FOUND')
    text=text[:first_style_end]+spot_css+text[first_style_end:]

# Static fallback card in #soon is optional but useful for no-JS/first paint.
if f'href="{URL}"' not in text[text.find('<section id="soon"'):text.find('<section id="about"')]:
    s0=text.find('<section id="soon"')
    s1=text.find('</section>',s0)
    if s0>=0 and s1>=0:
        grid_close=text.rfind('</div>',s0,s1)
        if grid_close>0:
            static=f'''\n    <a class="card in" href="{URL}" target="_blank" rel="noopener">\n      <div class="frame"><img class="cover-img" loading="lazy" decoding="async" width="1000" height="1000" src="{COVER}" alt="Константин Захаров — {TITLE} — обложка сингла"></div>\n      <div class="card-body"><h3 class="card-title">{TITLE}</h3><div class="meta"><span class="chip">R&amp;B/Soul</span><span class="date">27.09.2026</span></div><span class="badge soon">Скоро · 27.09</span></div>\n    </a>\n'''
            text=text[:grid_close]+static+text[grid_close:]

# Validation.
checks={
 'title': TITLE in text,
 'track': f't:"{TITLE}"' in text,
 'cover': f'"{TITLE}": "{COVER}"' in text,
 'bandlink': URL in text,
 'reel': 'data-clip="r17"' in text and f'data-yt="{YT}"' in text and f'data-vk-id="{VK_ID}"' in text,
 'jsonld_18': '"numberOfItems": 18' in text,
 'jsonld_recording': URL+'#recording' in text,
 'i18n_desc': all(x in text for x in ['Не «навсегда»','Not “forever.”','Nicht „für immer“','「永遠」ではない','不是“永远”']),
}
bad=[k for k,v in checks.items() if not v]
if bad: raise SystemExit('VALIDATION_FAILED:'+','.join(bad))
p.write_text(text,encoding='utf-8')
print(json.dumps({'status':'PASS','checks':checks,'length':len(text)},ensure_ascii=False))
