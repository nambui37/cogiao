import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, itemName, confirmText = 'Xác Nhận Xóa' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-6 space-y-4 animate-scale-up text-center">
        
        {/* Warning Icon */}
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-black text-slate-800">
            {title || 'Xác Nhận Thao Tác?'}
          </h3>
          <p className="text-xs text-slate-500">
            {message || 'Bạn có chắc chắn muốn thực hiện thao tác này?'}
          </p>
          {itemName && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold text-slate-800">
              {itemName}
            </div>
          )}
          <p className="text-[11px] text-rose-600 font-medium">
            ⚠️ Thao tác này sẽ áp dụng ngay lập tức vào hệ thống.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
          >
            Hủy Bỏ
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>{confirmText}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
