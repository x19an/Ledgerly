import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Account, CreateAccountPayload, PurchasePayload, SellPayload, LossPayload } from '../types';

interface BaseModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const BaseModal: React.FC<BaseModalProps> = ({ title, isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

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
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Identifier</label>
          <input
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="e.g. Fortnite Account #123"
            value={formData.identifier}
            onChange={e => setFormData({ ...formData, identifier: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Link</label>
          <input
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="https://..."
            value={formData.link}
            onChange={e => setFormData({ ...formData, link: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Expected Price ($)</label>
          <input
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={formData.expected_price}
            onChange={e => setFormData({ ...formData, expected_price: parseFloat(e.target.value) })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            rows={3}
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">Add Account</button>
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

  // Initialize with expected price if available
  React.useEffect(() => {
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
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Buy Price ($)</label>
          <input
            type="number"
            step="0.01"
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            value={buyPrice}
            onChange={e => setBuyPrice(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Potential Sale Price ($)</label>
          <input
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            value={potential}
            onChange={e => setPotential(parseFloat(e.target.value))}
          />
        </div>
        <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 font-medium">Confirm Purchase</button>
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
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Sold Price ($)</label>
          <input
            type="number"
            step="0.01"
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            value={sellPrice}
            onChange={e => setSellPrice(parseFloat(e.target.value))}
          />
        </div>
        <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 font-medium">Confirm Sale</button>
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
          <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Loss</label>
          <select
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
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
        <button type="submit" className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-medium">Confirm Loss</button>
      </form>
    </BaseModal>
  );
};
