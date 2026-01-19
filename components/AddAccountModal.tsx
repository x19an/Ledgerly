
import React, { useState } from 'react';
import { dbService } from '../db';
import { X, Tag, Link as LinkIcon, Target } from 'lucide-react';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
  isDarkMode: boolean;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose, onAdded, isDarkMode }) => {
  const [identifier, setIdentifier] = useState('');
  const [link, setLink] = useState('');
  const [expectedPrice, setExpectedPrice] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier || !expectedPrice) {
      alert('Identifier and Price are required');
      return;
    }

    const price = parseFloat(expectedPrice);
    if (isNaN(price)) {
      alert('Expected price must be a number');
      return;
    }

    await dbService.addWatchlistAccount(identifier, link, price);
    onAdded();
    onClose();
    
    setIdentifier('');
    setLink('');
    setExpectedPrice('');
  };

  const containerClass = isDarkMode ? "bg-[#1a1a1a] text-white border-white/5" : "bg-white text-slate-800 border-transparent";
  const inputClass = isDarkMode ? "bg-[#111] border-white/5 text-white focus:border-blue-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-200 ${containerClass}`}>
        <div className={`px-6 py-4 flex justify-between items-center border-b ${isDarkMode ? 'bg-[#222] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
          <h3 className="text-lg font-bold">New Watchlist Entry</h3>
          <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold opacity-50 uppercase tracking-widest flex items-center gap-2">
              <Tag size={12} /> Identifier
            </label>
            <input 
              type="text" 
              placeholder="e.g. Master-01"
              className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${inputClass}`}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold opacity-50 uppercase tracking-widest flex items-center gap-2">
              <LinkIcon size={12} /> Item Link
            </label>
            <input 
              type="url" 
              placeholder="https://..."
              className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${inputClass}`}
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold opacity-50 uppercase tracking-widest flex items-center gap-2">
              <Target size={12} /> Max Bid ($)
            </label>
            <input 
              type="number" 
              step="0.01"
              placeholder="0.00"
              className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${inputClass}`}
              value={expectedPrice}
              onChange={(e) => setExpectedPrice(e.target.value)}
              required
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className={`flex-1 px-4 py-3 font-bold rounded-xl transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
            >
              Discard
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all"
            >
              Add Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAccountModal;
