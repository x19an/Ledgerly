import React, { useState, useEffect } from 'react';
import { X, Save, Lock, Mail, User } from 'lucide-react';
import { Account, CreateAccountPayload, PurchasePayload, SellPayload, LossPayload } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface BaseModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidthClass?: string;
}

const BaseModal: React.FC<BaseModalProps> = ({ title, isOpen, onClose, children, maxWidthClass = 'max-w-md' }) => {
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
            className="fixed inset-0 z-50 bg-black/40 dark:bg-black/80 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full ${maxWidthClass} overflow-hidden pointer-events-auto border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]`}
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
                <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
                <button 
                  onClick={onClose} 
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- Input Component Helper ---
const InputField = ({ label, icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string, icon?: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          {icon}
        </div>
      )}
      <input
        {...props}
        className={`w-full ${icon ? 'pl-10' : 'px-3'} px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors`}
      />
    </div>
  </div>
);

// --- Account Details Modal (View/Edit) ---
export const AccountDetailsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  onSave: (id: number, data: Partial<Account>) => void;
}> = ({ isOpen, onClose, account, onSave }) => {
  const [formData, setFormData] = useState<Partial<Account>>({});

  useEffect(() => {
    if (account) {
      setFormData({
        identifier: account.identifier,
        link: account.link || '',
        email: account.email || '', // OGE Email
        password: account.password || '', // OGE Password
        account_email: account.account_email || '', // Game Email
        account_password: account.account_password || '', // Game Pass
        account_2nd_email: account.account_2nd_email || '', // Recovery Email
        account_2nd_password: account.account_2nd_password || '', // Recovery Pass
        notes: account.notes || '',
      });
    }
  }, [account, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (account) {
      onSave(account.id, formData);
      onClose();
    }
  };

  return (
    <BaseModal title="Account Details" isOpen={isOpen} onClose={onClose} maxWidthClass="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField 
            label="Account Identifier"
            value={formData.identifier || ''}
            onChange={e => setFormData({ ...formData, identifier: e.target.value })}
            placeholder="e.g. Fortnite Account #123"
          />
          <InputField 
            label="Link / URL"
            value={formData.link || ''}
            onChange={e => setFormData({ ...formData, link: e.target.value })}
            placeholder="https://..."
          />
        </div>

        <div className="h-px bg-slate-100 dark:bg-slate-800 my-4" />

        {/* Credentials Section */}
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Credentials</h4>
        
        {/* Game Account */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-4">
          <h5 className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">Game Account Login</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField 
              label="Email / Username"
              icon={<User className="w-4 h-4" />}
              value={formData.account_email || ''}
              onChange={e => setFormData({ ...formData, account_email: e.target.value })}
              placeholder="Game Login"
            />
            <InputField 
              label="Password"
              icon={<Lock className="w-4 h-4" />}
              type="text" // Visible by default for easy copying as per user context
              value={formData.account_password || ''}
              onChange={e => setFormData({ ...formData, account_password: e.target.value })}
              placeholder="Game Password"
            />
          </div>
        </div>

        {/* OGE */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-4">
          <h5 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Original Email (OGE)</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField 
              label="Email Address"
              icon={<Mail className="w-4 h-4" />}
              value={formData.email || ''}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="OGE Address"
            />
            <InputField 
              label="Password"
              icon={<Lock className="w-4 h-4" />}
              type="text"
              value={formData.password || ''}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              placeholder="OGE Password"
            />
          </div>
        </div>

        {/* Recovery / 2nd Email */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-4">
          <h5 className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase">Recovery / 2nd Email</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField 
              label="Email Address"
              icon={<Mail className="w-4 h-4" />}
              value={formData.account_2nd_email || ''}
              onChange={e => setFormData({ ...formData, account_2nd_email: e.target.value })}
              placeholder="Recovery Email"
            />
            <InputField 
              label="Password"
              icon={<Lock className="w-4 h-4" />}
              type="text"
              value={formData.account_2nd_password || ''}
              onChange={e => setFormData({ ...formData, account_2nd_password: e.target.value })}
              placeholder="Recovery Password"
            />
          </div>
        </div>

        <div className="h-px bg-slate-100 dark:bg-slate-800 my-4" />

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
          <textarea
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            rows={3}
            value={formData.notes || ''}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any extra info..."
          />
        </div>

        <div className="flex justify-end pt-2">
          <button 
            type="submit" 
            className="flex items-center space-x-2 bg-blue-600 dark:bg-blue-500 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium transition-colors shadow-lg shadow-blue-500/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </BaseModal>
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