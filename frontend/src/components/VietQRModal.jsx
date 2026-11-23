import React, { useState } from 'react';
import { X, Copy, Check, QrCode, ShieldCheck, Download, MessageSquare } from 'lucide-react';

export default function VietQRModal({ isOpen, onClose, fee, showToast }) {
  const [copiedField, setCopiedField] = useState(null);

  if (!isOpen || !fee) return null;

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    if (showToast) {
      showToast(
        `Đã sao chép ${field === 'amount' ? 'số tiền' : field === 'account' ? 'số tài khoản' : 'nội dung'}!`, 
        'info'
      );
    }
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyZalo = () => {
    const formattedAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(fee.final_amount);
    const msg = `Kính gửi Phụ huynh bé ${fee.student_name},\nCô Thủy gửi thông báo học phí tháng ${fee.billing_month}:\n- Số tiền cần đóng: ${formattedAmount}\n- Số tài khoản: 0912345678 (MB Bank - NGUYEN THI THUY)\n- Nội dung chuyển khoản: ${fee.transfer_memo}\n- Quét mã VietQR nhanh tại: ${fee.qr_url}\nPhụ huynh đóng học phí trước ngày ${fee.due_date || '15 hàng tháng'} giúp cô nhé. Cảm ơn bố mẹ nhiều!`;

    navigator.clipboard.writeText(msg);
    setCopiedField('zalo');
    if (showToast) showToast('Đã sao chép tin nhắn thông báo học phí gửi phụ huynh!', 'success');
    setTimeout(() => setCopiedField(null), 2500);
  };

  const formattedAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(fee.final_amount);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Compact Gradient Header */}
        <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 px-5 py-3 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-md">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">Mã VietQR Thanh Toán Học Phí</h3>
              <p className="text-[11px] text-brand-100">Chuẩn Napas 247 - Quét bằng mọi App Ngân hàng</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
            title="Đóng popup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Body: Fits screen vertically without scrolling */}
        <div className="p-4 sm:p-5 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            
            {/* Left Column: QR Image & Download (5 cols) */}
            <div className="sm:col-span-5 flex flex-col items-center space-y-2.5 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
              <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                <img 
                  src={fee.qr_url} 
                  alt="VietQR Napas247" 
                  className="w-40 h-40 sm:w-44 sm:h-44 object-contain rounded-lg"
                  loading="lazy"
                />
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Khớp số tiền & nội dung 100%</span>
              </div>

              <a 
                href={fee.qr_url} 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-1.5 px-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-[11px] text-center hover:bg-white transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Tải ảnh mã QR</span>
              </a>
            </div>

            {/* Right Column: Transfer details & Quick Actions (7 cols) */}
            <div className="sm:col-span-7 space-y-3 text-xs">
              
              {/* Info Table */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2">
                
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                  <span className="text-slate-400">Học sinh thụ hưởng:</span>
                  <span className="font-bold text-slate-800">{fee.student_name} ({fee.student_code})</span>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                  <span className="text-slate-400">Số tiền thanh toán:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-brand-600 text-base">{formattedAmount}</span>
                    <button 
                      onClick={() => handleCopy(fee.final_amount, 'amount')}
                      className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700"
                      title="Sao chép số tiền"
                    >
                      {copiedField === 'amount' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                  <span className="text-slate-400">Tài khoản nhận:</span>
                  <span className="font-semibold text-slate-700">MB BANK (Quân Đội)</span>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                  <span className="text-slate-400">Số tài khoản:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-800 text-xs">0912345678</span>
                    <button 
                      onClick={() => handleCopy('0912345678', 'account')}
                      className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700"
                      title="Sao chép STK"
                    >
                      {copiedField === 'account' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                  <span className="text-slate-400">Chủ tài khoản:</span>
                  <span className="font-semibold text-slate-800">NGUYEN THI THUY</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Nội dung CK:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-brand-700 bg-white px-2 py-0.5 rounded border border-brand-200">
                      {fee.transfer_memo}
                    </span>
                    <button 
                      onClick={() => handleCopy(fee.transfer_memo, 'memo')}
                      className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700"
                      title="Sao chép cú pháp"
                    >
                      {copiedField === 'memo' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

              </div>

              {/* Zalo Reminder Button */}
              <button
                onClick={handleCopyZalo}
                className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                {copiedField === 'zalo' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Đã chép tin nhắn Zalo gửi phụ huynh!</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span>Sao chép tin nhắn Zalo kèm QR gửi phụ huynh</span>
                  </>
                )}
              </button>

              {/* Close Button */}
              <button 
                onClick={onClose}
                className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors shadow-sm"
              >
                Đóng Lại
              </button>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
