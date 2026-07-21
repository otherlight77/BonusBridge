/* Compatibility entry point. BonusBridge V2 uses the ES module /js/app.js. */
if (!document.querySelector('script[src="js/app.js"]')) import('./js/app.js');
