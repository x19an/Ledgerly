
import React, { useState, useEffect } from 'react';
import { X, Save, Lock, Mail, User, Tag, AlertTriangle, Loader2 } from 'lucide-react';
import { Account, CreateAccountPayload, PurchasePayload, SellPayload, LossPayload } from '../types.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api.ts';

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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 bg-black/40 dark:bg-black/80 backdrop-blur-sm" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full ${maxWidthClass} overflow-hidden pointer-events-auto border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]`}>
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
                <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
                <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

const InputField = ({ label, icon, error, loading, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string, icon?: React.ReactNode, error?: string, loading?: boolean }) => (
  <div className="w-full">
    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">{label}</label>
    <div className="relative">
      {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">{icon}</div>}
      <input {...props} className={`w-full ${icon ? 'pl-10' : 'px-3'} py-2.5 border ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 dark:border-slate-800'} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'} outline-none transition-all text-sm`} />
      {loading && (
        <div className="absolute inset-y-0 right-3 flex items-center">
          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
        </div>
      )}
    </div>
    {error && (
      <p className="mt-1.5 text-[10px] text-red-500 font-bold flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" /> {error}
      </p>
    )}
  </div>
);

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
        category: account.category || '',
        email: account.email || '',
        password: account.password || '',
        account_email: account.account_email || '',
        account_password: account.account_password || '',
        account_2nd_email: account.account_2nd_email || '',
        account_2nd_password: account.account_2nd_password || '',
        notes: account.notes || '',
      });
    }
  }, [account, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (account) { onSave(account.id, formData); onClose(); }
  };

  return (
    <BaseModal title="Product Management" isOpen={isOpen} onClose={onClose} maxWidthClass="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <InputField label="Identifier" value={formData.identifier || ''} onChange={e => setFormData({ ...formData, identifier: e.target.value })} />
          </div>
          <InputField label="Category" icon={<Tag className="w-4 h-4" />} value={formData.category || ''} onChange={e => setFormData({ ...formData, category: e.target.value })} />
        </div>
        <InputField label="Product Link" value={formData.link || ''} onChange={e => setFormData({ ...formData, link: e.target.value })} />
        
        <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-2">Login Credentials</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/20 p-4 rounded-2xl">
          <InputField label="Account User/Email" icon={<User className="w-4 h-4" />} value={formData.account_email || ''} onChange={e => setFormData({ ...formData, account_email: e.target.value })} />
          <InputField label="Account Password" icon={<Lock className="w-4 h-4" />} value={formData.account_password || ''} onChange={e => setFormData({ ...formData, account_password: e.target.value })} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/20 p-4 rounded-2xl">
          <InputField label="OGE Email" icon={<Mail className="w-4 h-4" />} value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          <InputField label="OGE Password" icon={<Lock className="w-4 h-4" />} value={formData.password || ''} onChange={e => setFormData({ ...formData, password: e.target.value })} />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Additional Notes</label>
          <textarea className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" rows={3} value={formData.notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-bold transition-all shadow-lg shadow-blue-500/20">Save Changes</button>
      </form>
    </BaseModal>
  );
};

export const CreateAccountModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAccountPayload) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateAccountPayload>({ identifier: '', link: '', category: '', expected_price: 0, notes: '' });
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!formData.link) {
      setDuplicateError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsChecking(true);
      try {
        const res = await api.checkDuplicateLink(formData.link!);
        if (res.exists) {
          setDuplicateError(`Entry already exists: "${res.identifier}"`);
        } else {
          setDuplicateError(null);
        }
      } catch (e) {
        console.error("Duplicate check failed", e);
      } finally {
        setIsChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.link]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (duplicateError) return;
    onSubmit(formData);
    setFormData({ identifier: '', link: '', category: '', expected_price: 0, notes: '' });
    onClose();
  };

  return (
    <BaseModal title="Add to Watchlist" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField 
          label="Identifier" 
          required 
          value={formData.identifier} 
          onChange={e => setFormData({ ...formData, identifier: e.target.value })} 
        />
        <InputField 
          label="Category / Tag" 
          icon={<Tag className="w-4 h-4" />} 
          value={formData.category} 
          onChange={e => setFormData({ ...formData, category: e.target.value })} 
        />
        <InputField 
          label="Target Link" 
          value={formData.link} 
          error={duplicateError || undefined}
          loading={isChecking}
          onChange={e => setFormData({ ...formData, link: e.target.value })} 
        />
        <InputField 
          label="Market Value ($)" 
          type="number" 
          step="0.01" 
          value={formData.expected_price} 
          onChange={e => setFormData({ ...formData, expected_price: parseFloat(e.target.value) || 0 })} 
        />
        <button 
          type="submit" 
          disabled={!!duplicateError || isChecking}
          className={`w-full py-3 rounded-xl font-bold shadow-lg transition-all ${
            duplicateError 
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'
          }`}
        >
          {isChecking ? 'Checking...' : 'Add Item'}
        </button>
      </form>
    </BaseModal>
  );
};

export const PurchaseModal: React.FC<{ isOpen: boolean; onClose: () => void; onSubmit: (data: PurchasePayload) => void; account?: Account; }> = ({ isOpen, onClose, onSubmit, account }) => {
  const [buyPrice, setBuyPrice] = useState<number>(0);
  const [potential, setPotential] = useState<number>(0);
  useEffect(() => { if(isOpen && account?.expected_price) { setBuyPrice(account.expected_price); } }, [isOpen, account]);
  return (
    <BaseModal title="Log Acquisition" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit({ buy_price: buyPrice, potential_income: potential }); onClose(); }} className="space-y-4">
        <InputField label="Purchase Price ($)" type="number" step="0.01" required value={buyPrice} onChange={e => setBuyPrice(parseFloat(e.target.value) || 0)} />
        <InputField label="Expected Sale Price ($)" type="number" step="0.01" value={potential} onChange={e => setPotential(parseFloat(e.target.value) || 0)} />
        <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold">Confirm Purchase</button>
      </form>
    </BaseModal>
  );
};

export const SellModal: React.FC<{ isOpen: boolean; onClose: () => void; onSubmit: (data: SellPayload) => void; }> = ({ isOpen, onClose, onSubmit }) => {
  const [sellPrice, setSellPrice] = useState<number>(0);
  return (
    <BaseModal title="Log Disposition" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit({ sell_price: sellPrice }); onClose(); }} className="space-y-4">
        <InputField label="Actual Sold Price ($)" type="number" step="0.01" required value={sellPrice} onChange={e => setSellPrice(parseFloat(e.target.value) || 0)} />
        <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold">Mark as Sold</button>
      </form>
    </BaseModal>
  );
};

export const LossModal: React.FC<{ isOpen: boolean; onClose: () => void; onSubmit: (data: LossPayload) => void; }> = ({ isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState<string>('');
  return (
    <BaseModal title="Log Asset Loss" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit({ loss_reason: reason }); onClose(); }} className="space-y-4">
        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Primary Reason</label>
        <select className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm" value={reason} onChange={e => setReason(e.target.value)} required>
          <option value="" disabled>Select...</option>
          <option value="Banned">Banned</option>
          <option value="Pulled">Pulled / Recovered</option>
          <option value="Scammed">Scammed</option>
          <option value="Unsellable">Unsellable</option>
          <option value="Other">Other</option>
        </select>
        <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-500/20">Confirm Loss</button>
      </form>
    </BaseModal>
  );
};
