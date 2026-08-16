'use client';

import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { ToastType } from './ToastContext';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, onClose }) => {
  const styles = {
    success: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    error: 'bg-rose-50 text-rose-900 border-rose-200',
    warning: 'bg-amber-50 text-amber-900 border-amber-200',
    info: 'bg-sky-50 text-sky-900 border-sky-200',
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border card-shadow transition-all duration-300 transform translate-y-0 opacity-100 ${styles[type]}`}
      role="alert"
    >
      {icons[type]}
      <div className="flex-1 text-sm font-medium">{message}</div>
      <button
        onClick={() => onClose(id)}
        className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-lg hover:bg-slate-100/50"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
