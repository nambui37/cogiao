import React, { useState } from 'react';
import { X, Copy, Check, Printer, ShieldCheck, UserCheck, Phone, Lock, Sparkles, Send, GraduationCap } from 'lucide-react';

export default function ParentCardModal({ isOpen, onClose, parent, showToast }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !parent) return null;

  const childrenNames = (parent.children || []).map(c => c.full_name).join(', ') || 'con';
  const childrenDetails = (parent.children || []).map(c => `• ${c.full_name} (${c.student_code}) - ${c.class_name || 'Lớp học'}`).join('\n');

  const zaloMessage = `Kính gửi Phụ huynh bé ${childrenNames},\nCô Thủy gửi thông tin tài khoản đăng nhập Cổng thông tin học tập:\n- Số điện thoại: ${parent.phone}\n- Mật khẩu: ${parent.plain_password || '123'}\n- Link đăng nhập: http://localhost:5173\nDanh sách các bé theo dõi:\n${childrenDetails}\nPhụ huynh đăng nhập để xem lịch học, điểm danh 1-chạm, nhận xét bài kiểm tra và học phí của con nhé ạ!`;

  const handleCopyZalo = () => {
    navigator.clipboard.writeText(zaloMessage);
    setCopied(true);
    if (showToast) showToast('Đã sao chép tin nhắn Zalo kèm thông tin tài khoản!', 'success');
    setTimeout(() => setCopied(false), 2500);
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
        
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 px-5 py-4 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-md">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">Thẻ Tài Khoản Phụ Huynh</h3>
              <p className="text-[11px] text-brand-100">Cổng Thông Tin Học Sinh 2.0 • Thủy English Center</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="p-1.5 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              title="In thẻ"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In</span>
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          
          {/* VIP Card Preview */}
          <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 shadow-xl overflow-hidden border border-slate-800">
            {/* Background glowing orb */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-brand-500/30 border border-brand-400/40 flex items-center justify-center font-black text-white text-base">
                  TE
                </div>
                <div>
                  <h4 className="font-extrabold text-sm tracking-wide text-white">THỦY ENGLISH CENTER</h4>
                  <p className="text-[10px] text-indigo-200">CỔNG LIÊN LẠC PHỤ HUYNH VIP</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Đã Kích Hoạt
              </span>
            </div>

            {/* Parent Info */}
            <div className="py-4 space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Họ và tên Phụ huynh</span>
                <div className="text-lg font-black text-white tracking-tight">{parent.full_name}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-white/5 p-2.5 rounded-2xl border border-white/10">
                  <span className="text-[10px] text-indigo-200 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-brand-300" /> SĐT Đăng Nhập
                  </span>
                  <div className="font-mono font-bold text-sm text-white mt-0.5">{parent.phone}</div>
                </div>

                <div className="bg-white/5 p-2.5 rounded-2xl border border-white/10">
                  <span className="text-[10px] text-indigo-200 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-brand-300" /> Mật Khẩu
                  </span>
                  <div className="font-mono font-bold text-sm text-yellow-300 mt-0.5">{parent.plain_password || '123'}</div>
                </div>
              </div>
            </div>

            {/* Linked Children */}
            <div className="pt-3 border-t border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block mb-1.5">
                Các con được liên kết ({parent.children?.length || 0} bé):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {parent.children && parent.children.length > 0 ? (
                  parent.children.map(c => (
                    <span 
                      key={c.id} 
                      className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/20 text-[11px] font-semibold text-emerald-200 flex items-center gap-1"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-300" />
                      <span>{c.full_name} ({c.student_code})</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">Chưa gắn học sinh nào</span>
                )}
              </div>
            </div>

            {/* Footer card note */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-indigo-300">
              <span>Đăng nhập tại: http://localhost:5173</span>
              <span>Hotline: 0912 345 678</span>
            </div>
          </div>

          {/* Quick Zalo Action */}
          <div className="space-y-2 print:hidden">
            <button
              onClick={handleCopyZalo}
              className="w-full py-3 px-4 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Đã sao chép tin nhắn Zalo gửi phụ huynh!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-blue-600" />
                  <span>Sao chép tin nhắn Zalo gửi phụ huynh</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              Tin nhắn tự động chứa đầy đủ SĐT, Mật khẩu, Link đăng nhập và danh sách con của phụ huynh.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
