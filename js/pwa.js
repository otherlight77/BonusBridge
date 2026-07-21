let deferredInstallPrompt = null;

export function setupPWA({ onOfflineChange, onInstallAvailable } = {}) {
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
  const updateNetwork = () => onOfflineChange?.(!navigator.onLine);
  window.addEventListener('online', updateNetwork);
  window.addEventListener('offline', updateNetwork);
  updateNetwork();
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    onInstallAvailable?.(true);
  });
}

export async function installPWA() {
  if (!deferredInstallPrompt) return false;
  deferredInstallPrompt.prompt();
  const result = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  return result.outcome === 'accepted';
}

export async function requestNotifications() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.requestPermission();
}
