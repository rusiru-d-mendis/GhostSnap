
import React, { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { DownloadIcon } from './Icons';

function ReloadPrompt() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult: { outcome: 'accepted' | 'dismissed' }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setInstallPrompt(null);
    });
  };

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error:', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (offlineReady || needRefresh || installPrompt) {
    return (
      <div className="fixed right-4 bottom-4 z-50">
        <div className="p-4 rounded-lg shadow-2xl bg-white border border-slate-200 flex flex-col items-center text-center gap-4 min-w-[280px]">
          {installPrompt && (
            <>
              <p className="text-slate-800 font-medium">Install GhostSnap!</p>
              <button
                onClick={handleInstallClick}
                className="w-full text-center text-white font-bold py-3 px-4 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md bg-emerald-500 hover:bg-emerald-600"
              >
                <DownloadIcon />
                Install App
              </button>
            </>
          )}

          {(offlineReady || needRefresh) && !installPrompt && (
            <>
              <p className="text-slate-800 font-medium">
                {offlineReady ? 'App is ready to work offline!' : 'A new version is available!'}
              </p>
              {needRefresh && (
                <button
                  onClick={() => updateServiceWorker(true)}
                  className="w-full text-center text-white font-bold py-3 px-4 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md bg-blue-600 hover:bg-blue-700"
                >
                  Reload
                </button>
              )}
              <button
                onClick={close}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}

export default ReloadPrompt;
