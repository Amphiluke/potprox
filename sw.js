const t="potprox",p=`${t}-v1.1.1`;let o=["/potprox/","/potprox/index.html","/potprox/app-icons/favicon.png","/potprox/app-icons/apple-touch-icon.png","/potprox/app-icons/icon-48.png","/potprox/app-icons/icon-192.png","/potprox/app-icons/icon-512.png","/potprox/app-icons/maskable-icon.png","/potprox/css/main.css","/potprox/img/buckingham.svg","/potprox/img/lennard-jones.svg","/potprox/img/morse.svg","/potprox/img/rydberg.svg","/potprox/img/varshni3.svg","/potprox/js/main.min.js"];self.addEventListener("install",(t=>{t.waitUntil(async function(){return(await caches.open(p)).addAll(o)}())})),self.addEventListener("activate",(o=>{o.waitUntil(async function(){let o=(await caches.keys()).filter((o=>o.startsWith(t)&&o!==p));return Promise.all(o.map((t=>caches.delete(t))))}())})),self.addEventListener("fetch",(t=>{t.respondWith(async function(t){let o=await caches.match(t);return o||(o=await fetch(t),o&&200===o.status&&"basic"===o.type?((await caches.open(p)).put(t,o.clone()),o):o)}(t.request))}));
