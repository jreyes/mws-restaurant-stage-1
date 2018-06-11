if (navigator.serviceWorker.controller) {
  console.log('[RR-PRECACHE] Active service worker found, no need to register')
} else {

// Register the ServiceWorker
  navigator.serviceWorker.register('sw.js', {
    scope: './'
  }).then(function (reg) {
    console.log('[RR-PRECACHE] Service worker has been registered for scope:' + reg.scope);
  });
}
