const APP_VERSION='2.0.5';
const CACHE='nutritracker-'+APP_VERSION;
const FILES=['./','./index.html','./style.css','./app.js','./manifest.json','./icon-192.png','./icon-512.png','./ciqual-2025.json','./version.json'];

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await cache.addAll(FILES.map(path=>new Request(path,{cache:'reload'})));
    // Activate the new release immediately instead of waiting for the old app to close.
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith('nutritracker-') && key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message',event=>{
  if(event.data && event.data.type==='SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;

  // Always check the network first for the app shell and version metadata.
  if(event.request.mode==='navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/version.json')){
    event.respondWith((async()=>{
      try{
        const fresh=await fetch(event.request,{cache:'no-store'});
        if(fresh && fresh.ok){
          const cache=await caches.open(CACHE);
          const key=url.pathname.endsWith('/version.json')?'./version.json':'./index.html';
          cache.put(key,fresh.clone());
        }
        return fresh;
      }catch(e){
        return (await caches.match(event.request)) || (await caches.match('./index.html')) || (await caches.match('./'));
      }
    })());
    return;
  }

  // Prefer the current release cache, then network and cache the response.
  event.respondWith((async()=>{
    const cached=await caches.match(event.request);
    if(cached) return cached;
    const response=await fetch(event.request);
    if(response && response.ok){
      const cache=await caches.open(CACHE);
      cache.put(event.request,response.clone());
    }
    return response;
  })());
});
