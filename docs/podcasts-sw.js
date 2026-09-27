const SHELL_CACHE='joshmemory-podcasts-shell-v1';
const AUDIO_CACHE='joshmemory-podcast-audio-v1';
const SHELL=['./podcasts.html'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(SHELL_CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;

  if(request.destination==='audio'){
    event.respondWith(
      caches.open(AUDIO_CACHE)
        .then(cache=>cache.match(request,{ignoreVary:true}))
        .then(hit=>hit||fetch(request))
    );
    return;
  }

  const url=new URL(request.url);
  if(url.origin===self.location.origin && (request.mode==='navigate'||url.pathname.endsWith('/podcasts.html'))){
    event.respondWith(
      fetch(request).then(response=>{
        const copy=response.clone();
        caches.open(SHELL_CACHE).then(cache=>cache.put('./podcasts.html',copy)).catch(()=>{});
        return response;
      }).catch(()=>caches.open(SHELL_CACHE).then(cache=>cache.match('./podcasts.html')))
    );
  }
});
