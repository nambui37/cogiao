import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, Share2, Award, Building2 } from 'lucide-react';

export default function ReceiptModal({ isOpen, onClose, fee }) {
  if (!isOpen || !fee) return null;

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh] animate-scale-up print:shadow-none print:border-none print:w-full print:max-h-none"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Bar (Hidden on Print) */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 border-b border-slate-100 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Biên lai thu học phí điện tử</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs transition-colors"
              title="In biên lai"
            >
              <Printer className="w-4 h-4 text-brand-600" />
              <span>In / Lưu PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-6 sm:p-8 space-y-5 bg-white relative overflow-y-auto">
          
          {/* Header */}
          <div className="text-center space-y-1.5 border-b border-dashed border-slate-200 pb-5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 mb-1 border border-brand-100 font-black text-xl">
              TE
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">THỦY ENGLISH CENTER</h2>
            <p className="text-xs text-slate-500 font-medium">Hệ thống đào tạo Anh ngữ Chuẩn Cambridge & IELTS</p>
            <p className="text-[11px] text-slate-400">Số 18 Ngõ 42 Phố Vọng, Hai Bà Trưng, Hà Nội • Hotline: 0912 345 678</p>
            
            <div className="pt-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 font-mono">
                Số HĐ: {fee.invoice_code}
              </span>
            </div>
          </div>

          {/* Stamp "ĐÃ THANH TOÁN" */}
          <div className="relative">
            <div className="absolute right-2 top-0 transform rotate-12 pointer-events-none select-none opacity-85">
              <div className="border-4 border-rose-600 rounded-2xl p-2.5 text-center text-rose-600 font-black text-xs uppercase tracking-widest shadow-xs bg-rose-50/50 backdrop-blur-xs">
                <div>✓ ĐÃ THANH TOÁN</div>
                <div className="text-[9px] font-bold tracking-normal normal-case text-rose-500 mt-0.5">
                  {fee.payment_date ? fee.payment_date.split(' ')[0] : 'Đã thu tiền'}
                </div>
              </div>
            </div>

            {/* Receipt Info Fields */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Học sinh thụ hưởng:</span>
                <span className="font-bold text-slate-800 text-sm">{fee.student_name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Mã học sinh:</span>
                <span className="font-mono font-bold text-slate-700">{fee.student_code}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Lớp học:</span>
                <span className="font-semibold text-brand-700">{fee.class_name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Tháng tính phí:</span>
                <span className="font-bold text-slate-800">Tháng {fee.billing_month}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Người nộp (Phụ huynh):</span>
                <span className="font-medium text-slate-700">{fee.parent_name} ({fee.parent_phone})</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Phương thức thanh toán:</span>
                <span className="font-semibold text-slate-800">{fee.payment_method || 'Chuyển khoản VietQR'}</span>
              </div>
              {fee.notes && (
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Ghi chú:</span>
                  <span className="italic text-slate-600">{fee.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Money Breakdown Table */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Học phí định mức:</span>
              <span className="font-medium">{formatMoney(fee.amount)}</span>
            </div>
            {Number(fee.discount) > 0 && (
              <div className="flex justify-between text-rose-600 font-medium">
                <span>Ưu đãi / Giảm trừ:</span>
                <span>-{formatMoney(fee.discount)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
              <span className="font-black text-slate-800">Tổng tiền đã đóng:</span>
              <span className="text-lg font-black text-brand-600">{formatMoney(fee.final_amount)}</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center pt-2 text-[11px] text-slate-400 space-y-1">
            <p className="italic">Cảm ơn Quý phụ huynh đã luôn đồng hành và tin tưởng Cô Thủy English!</p>
            <p className="text-[10px]">Hóa đơn điện tử được khởi tạo tự động từ Hệ thống Thủy English 2.0</p>
          </div>

        </div>

      </div>
    </div>
  );
}
