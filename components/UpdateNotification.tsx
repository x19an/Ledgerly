
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw, X, CheckCircle2, AlertCircle } from 'lucide-react';

const { ipcRenderer } = window.require('electron');

export const UpdateNotification: React.FC = () => {
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<'available' | 'downloading' | 'ready' | 'idle'>('idle');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    ipcRenderer.on('update_available', () => {
      setStatus('available');
      setShow(true);
    });

    ipcRenderer.on('download_progress', (event: any, percent: number) => {
      setStatus('downloading');
      setProgress(Math.round(percent));
      setShow(true);
    });

    ipcRenderer.on('update_downloaded', () => {
      setStatus('ready');
      setShow(true);
    });

    return () => {
      ipcRenderer.removeAllListeners('update_available');
      ipcRenderer.removeAllListeners('download_progress');
      ipcRenderer.removeAllListeners('update_downloaded');
    };
  }, []);

  const handleRestart = () => {
    ipcRenderer.send('restart_app');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-[100] w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-4"
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl ${status === 'ready' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'}`}>
              {status === 'ready' ? <CheckCircle2 className="w-5 h-5" /> : <Download className="w-5 h-5 animate-bounce" />}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                {status === 'available' && "Update Available"}
                {status === 'downloading' && "Downloading Update..."}
                {status === 'ready' && "Update Ready"}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {status === 'ready' 
                  ? "The latest version has been downloaded. Restart the app to apply changes." 
                  : "A new version of Ledgerly is being downloaded in the background."}
              </p>
              
              {status === 'downloading' && (
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-blue-600" 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {status === 'ready' && (
                <button
                  onClick={handleRestart}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> RESTART NOW
                </button>
              )}
            </div>
            <button 
              onClick={() => setShow(false)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
