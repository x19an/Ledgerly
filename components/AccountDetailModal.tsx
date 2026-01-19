
import React, { useState, useEffect } from 'react';
import { AccountStatus, AccountWithTransaction } from '../types';
import { dbService } from '../db';
import { X, Eye, EyeOff, KeyRound, Mail, UserCircle, Layers, Link as LinkIcon, Zap, AlertTriangle } from 'lucide-react';

interface AccountDetailModalProps {
  account: AccountWithTransaction | null;
  onClose: () => void;
  onUpdate: () => void;
  isDarkMode: boolean;
}

const AccountDetailModal: React.FC<AccountDetailModalProps> = ({ account, onClose, onUpdate, isDarkMode }) => {
  const [formData, setFormData] = useState<Partial<AccountWithTransaction>>({});
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (account) {
      setFormData(account);
    }
  }, [account]);

  if (!account) return null;

  const handleSave = (field: keyof AccountWithTransaction, value: any) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    dbService.updateAccount({ id: account.id, [field]: value });
    onUpdate();
  };

  const toggleVisibility = (field: string) => {
    setVisibility(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const themeClass = isDarkMode 
    ? "bg-[#121212] text-slate-200 border-white/10 shadow-black/50" 
    : "bg-white text-slate-800 border-slate-200 shadow-xl";

  const inputThemeClass = isDarkMode
    ? "bg-[#1e1e1e] border-slate-700 text-white focus:border-emerald-500"
    : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500";

  const labelThemeClass = isDarkMode ? "bg-[#121212] text-slate-500" : "bg-white text-slate-400";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-2xl rounded-2xl border flex flex-col h-[85vh] overflow-hidden transition-all ${themeClass}`}>
        
        {/* Header */}
        <div className={`px-8 py-5 flex justify-between items-center border-b ${isDarkMode ? 'border-white/5 bg-[#1a1a1a]' : 'border-slate-100 bg-slate-50'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
              <UserCircle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Ledger Details</h2>
              <p className="text-xs opacity-50 uppercase tracking-tighter">Vault Entry #{account.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-full transition-colors opacity-60 hover:opacity-100">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">
          
          {/* General Info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
             <CredentialField 
               label="Identifier" 
               value={formData.identifier || ''} 
               onChange={(v) => handleSave('identifier', v)}
               icon={<Layers size={14} />}
               inputClass={inputThemeClass}
               labelClass={labelThemeClass}
             />
             <CredentialField 
               label="Link" 
               value={formData.link || ''} 
               onChange={(v) => handleSave('link', v)}
               icon={<LinkIcon size={14} />}
               inputClass={inputThemeClass}
               labelClass={labelThemeClass}
             />
             <CredentialField 
               label="Potential ($)" 
               value={String(formData.potential_income || '')} 
               onChange={(v) => handleSave('potential_income', parseFloat(v) || 0)}
               icon={<Zap size={14} className="text-amber-500" />}
               inputClass={inputThemeClass}
               labelClass={labelThemeClass}
             />
          </div>

          {/* Primary Credentials */}
          <div className="space-y-6">
            <SectionTitle title="Core Access" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <CredentialField 
                label="Primary Email" 
                value={formData.email || ''} 
                onChange={(v) => handleSave('email', v)}
                icon={<Mail size={14} />}
                inputClass={inputThemeClass}
                labelClass={labelThemeClass}
              />
              <CredentialField 
                label="Primary Password" 
                type={visibility['password'] ? "text" : "password"}
                value={formData.password || ''} 
                onChange={(v) => handleSave('password', v)}
                icon={<KeyRound size={14} />}
                onToggle={() => toggleVisibility('password')}
                isVisible={visibility['password']}
                inputClass={inputThemeClass}
                labelClass={labelThemeClass}
              />
            </div>
          </div>

          {/* Account Details */}
          <div className="space-y-6">
            <SectionTitle title="Direct Credentials" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <CredentialField 
                label="Login User/Email" 
                value={formData.account_email || ''} 
                onChange={(v) => handleSave('account_email', v)}
                icon={<Mail size={14} />}
                inputClass={inputThemeClass}
                labelClass={labelThemeClass}
              />
              <CredentialField 
                label="Login Password" 
                type={visibility['acc_pass'] ? "text" : "password"}
                value={formData.account_password || ''} 
                onChange={(v) => handleSave('account_password', v)}
                icon={<KeyRound size={14} />}
                onToggle={() => toggleVisibility('acc_pass')}
                isVisible={visibility['acc_pass']}
                inputClass={inputThemeClass}
                labelClass={labelThemeClass}
              />
            </div>
          </div>

          {/* Secondary Backup */}
          <div className="space-y-6 pb-6">
            <SectionTitle title="Recovery/Backup" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <CredentialField 
                label="Backup Email" 
                value={formData.account_2nd_email || ''} 
                onChange={(v) => handleSave('account_2nd_email', v)}
                icon={<Mail size={14} />}
                inputClass={inputThemeClass}
                labelClass={labelThemeClass}
              />
              <CredentialField 
                label="Backup Password" 
                type={visibility['acc_2nd_pass'] ? "text" : "password"}
                value={formData.account_2nd_password || ''} 
                onChange={(v) => handleSave('account_2nd_password', v)}
                icon={<KeyRound size={14} />}
                onToggle={() => toggleVisibility('acc_2nd_pass')}
                isVisible={visibility['acc_2nd_pass']}
                inputClass={inputThemeClass}
                labelClass={labelThemeClass}
              />
            </div>
          </div>

          {/* Loss Meta */}
          {formData.status === AccountStatus.LOSSES && (
            <div className="space-y-4">
               <SectionTitle title="Loss Reason" />
               <CredentialField 
                 label="Reason for Deficit" 
                 value={formData.loss_reason || ''} 
                 onChange={(v) => handleSave('loss_reason', v)}
                 icon={<AlertTriangle size={14} className="text-rose-500" />}
                 inputClass={isDarkMode ? "bg-rose-500/5 border-rose-500/20 text-rose-200" : "bg-rose-50 border-rose-100 text-rose-900"}
                 labelClass={labelThemeClass}
               />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-4">
            <SectionTitle title="Metadata & Notes" />
            <div className={`relative border rounded-xl overflow-hidden group ${inputThemeClass}`}>
               <textarea 
                 className="w-full h-32 bg-transparent p-4 outline-none resize-none text-sm leading-relaxed"
                 placeholder="Contextual details..."
                 value={formData.notes || ''}
                 onChange={(e) => handleSave('notes', e.target.value)}
               />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className={`px-8 py-5 border-t flex justify-end gap-3 ${isDarkMode ? 'border-white/5 bg-[#1a1a1a]' : 'border-slate-100 bg-slate-50'}`}>
           <button 
             onClick={onClose}
             className={`px-8 py-2.5 rounded-xl font-bold transition-all ${
               isDarkMode 
                 ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                 : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/10"
             }`}
           >
             Commit Updates
           </button>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 100, 100, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(100, 100, 100, 0.4); }
      `}</style>
    </div>
  );
};

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">{title}</h3>
);

interface CredentialFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  icon?: React.ReactNode;
  onToggle?: () => void;
  isVisible?: boolean;
  inputClass: string;
  labelClass: string;
}

const CredentialField: React.FC<CredentialFieldProps> = ({ 
  label, value, onChange, type = "text", icon, onToggle, isVisible, inputClass, labelClass 
}) => (
  <div className={`relative border rounded-xl transition-all group ${inputClass}`}>
    <label className={`absolute -top-2 left-3 px-1.5 text-[10px] font-bold uppercase tracking-wider group-focus-within:text-emerald-500 transition-colors ${labelClass}`}>
      {label}
    </label>
    <div className="flex items-center px-4 py-3">
      {icon && <span className="mr-3 opacity-30 group-focus-within:opacity-100 transition-opacity group-focus-within:text-emerald-500">{icon}</span>}
      <input 
        type={type}
        className="flex-1 bg-transparent outline-none text-sm font-medium"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {onToggle && (
        <button onClick={onToggle} className="ml-2 opacity-30 hover:opacity-100 transition-opacity p-1">
          {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  </div>
);

export default AccountDetailModal;
