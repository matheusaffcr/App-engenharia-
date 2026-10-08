var CACHE="torque-v1";
var ARQUIVOS=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./apple-touch-icon.png"];
self.addEventListener("install",function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ARQUIVOS);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});
self.addEventListener("fetch",function(e){
  var req=e.request;
  if(req.method!=="GET")return;
  var url=new URL(req.url);
  var fonte=url.hostname==="fonts.googleapis.com"||url.hostname==="fonts.gstatic.com";
  if(url.origin===location.origin){
    e.respondWith(caches.match(req).then(function(r){
      return r||fetch(req).then(function(resp){
        var cp=resp.clone();caches.open(CACHE).then(function(c){c.put(req,cp);});return resp;
      }).catch(function(){return caches.match("./index.html");});
    }));
  }else if(fonte){
    e.respondWith(caches.open(CACHE).then(function(c){
      return c.match(req).then(function(r){
        var rede=fetch(req).then(function(resp){c.put(req,resp.clone());return resp;}).catch(function(){return r;});
        return r||rede;
      });
    }));
  }
});
