import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Account, CreateAccountPayload, PurchasePayload, SellPayload, LossPayload } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface BaseModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const BaseModal: React.FC<BaseModalProps> = ({ title, isOpen, onClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 dark:bg-black/70 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
                <button 
                  onClick={onClose} 
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- Input Component Helper ---
const InputField = ({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
    <input
      {...props}
      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
    />
  </div>
);

// --- Create Account Modal ---
export const CreateAccountModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAccountPayload) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateAccountPayload>({ identifier: '', link: '', expected_price: 0, notes: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ identifier: '', link: '', expected_price: 0, notes: '' });
    onClose();
  };

  return (
    <BaseModal title="Add to Watchlist" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField 
          label="Identifier"
          required
          placeholder="e.g. Fortnite Account #123"
          value={formData.identifier}
          onChange={e => setFormData({ ...formData, identifier: e.target.value })}
        />
        <InputField 
          label="Link"
          placeholder="https://..."
          value={formData.link}
          onChange={e => setFormData({ ...formData, link: e.target.value })}
        />
        <InputField 
          label="Expected Price ($)"
          type="number"
          step="0.01"
          value={formData.expected_price}
          onChange={e => setFormData({ ...formData, expected_price: parseFloat(e.target.value) })}
        />
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
          <textarea
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            rows={3}
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 dark:bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium transition-colors">Add Account</button>
      </form>
    </BaseModal>
  );
};

// --- Purchase Modal ---
export const PurchaseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PurchasePayload) => void;
  account?: Account;
}> = ({ isOpen, onClose, onSubmit, account }) => {
  const [buyPrice, setBuyPrice] = useState<number>(0);
  const [potential, setPotential] = useState<number>(0);

  useEffect(() => {
      if(isOpen && account?.expected_price) {
          setBuyPrice(account.expected_price);
      }
  }, [isOpen, account]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ buy_price: buyPrice, potential_income: potential });
    onClose();
  };

  return (
    <BaseModal title="Record Purchase" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField 
          label="Buy Price ($)"
          type="number"
          step="0.01"
          required
          value={buyPrice}
          onChange={e => setBuyPrice(parseFloat(e.target.value))}
        />
        <InputField 
          label="Potential Sale Price ($)"
          type="number"
          step="0.01"
          value={potential}
          onChange={e => setPotential(parseFloat(e.target.value))}
        />
        <button type="submit" className="w-full bg-emerald-600 dark:bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 font-medium transition-colors">Confirm Purchase</button>
      </form>
    </BaseModal>
  );
};

// --- Sell Modal ---
export const SellModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SellPayload) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [sellPrice, setSellPrice] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ sell_price: sellPrice });
    onClose();
  };

  return (
    <BaseModal title="Record Sale" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField 
          label="Sold Price ($)"
          type="number"
          step="0.01"
          required
          value={sellPrice}
          onChange={e => setSellPrice(parseFloat(e.target.value))}
        />
        <button type="submit" className="w-full bg-emerald-600 dark:bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 font-medium transition-colors">Confirm Sale</button>
      </form>
    </BaseModal>
  );
};

// --- Loss Modal ---
export const LossModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LossPayload) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ loss_reason: reason });
    onClose();
  };

  return (
    <BaseModal title="Record Loss" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason for Loss</label>
          <select
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
            value={reason}
            onChange={e => setReason(e.target.value)}
            required
          >
            <option value="" disabled>Select a reason...</option>
            <option value="Banned">Account Banned</option>
            <option value="Pulled Back">Pulled Back / Recovered</option>
            <option value="Scammed">Scammed</option>
            <option value="Unsellable">Unsellable Inventory</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <button type="submit" className="w-full bg-red-600 dark:bg-red-500 text-white py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 font-medium transition-colors">Confirm Loss</button>
      </form>
    </BaseModal>
  );
};