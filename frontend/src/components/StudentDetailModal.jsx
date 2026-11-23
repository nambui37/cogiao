import React from 'react';
import { 
  X, 
  GraduationCap, 
  Phone, 
  Calendar, 
  MapPin, 
  User, 
  BookOpen, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Send
} from 'lucide-react';

export default function StudentDetailModal({ isOpen, onClose, student, onEdit, showToast }) {
  if (!isOpen || !student) return null;

  const initials = student.full_name
    ? student.full_name.split(' ').map((n) => n[0]).slice(-2).join('')
    : 'ST';

  // Calculate age
  const birthYear = student.date_of_birth ? new Date(student.date_of_birth).getFullYear() : null;
  const currentYear = new Date().getFullYear();
  const age = birthYear ? currentYear - birthYear : null;

  const handleCopyZalo = () => {
    const msg = `Kính gửi Phụ huynh bé ${student.full_name},\nCô Thủy gửi thông báo tình hình học tập của con tại lớp ${student.class_names || 'Tiếng Anh'}.\nPhụ huynh đăng nhập cổng thông tin tại http://localhost:5173 bằng SĐT ${student.parent_phone} để xem chi tiết nhé ạ!`;
    navigator.clipboard.writeText(msg);
    if (showToast) showToast(`Đã sao chép tin nhắn Zalo gửi phụ huynh bé ${student.full_name}!`, 'success');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Gradient */}
        <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 p-6 text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-black text-xl flex items-center justify-center shadow-inner">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black">{student.full_name}</h3>
                  <span className="px-2 py-0.5 rounded-md bg-white/20 text-[11px] font-mono font-bold tracking-wider">
                    {student.student_code}
                  </span>
                </div>
                <p className="text-xs text-brand-100 mt-0.5">
                  {student.class_names || 'Chưa xếp lớp'}
                </p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs">
          
          {/* Quick Badges */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Trạng thái</span>
              <span className="font-bold text-emerald-600 mt-0.5 inline-block">
                {student.status === 'studying' ? '● Đang học' : student.status === 'reserved' ? '● Bảo lưu' : '● Thôi học'}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Giới tính</span>
              <span className="font-bold text-slate-700 mt-0.5 inline-block">
                {student.gender === 'female' ? 'Bé Gái' : 'Bé Trai'}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Độ tuổi</span>
              <span className="font-bold text-brand-700 mt-0.5 inline-block">
                {age ? `${age} tuổi` : '---'}
              </span>
            </div>
          </div>

          {/* Personal Info Box */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-2.5">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <User className="w-3.5 h-3.5 text-brand-600" /> Thông Tin Cá Nhân
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 text-[11px] block">Ngày sinh:</span>
                <span className="font-semibold text-slate-700">{student.date_of_birth || '---'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Lớp đăng ký:</span>
                <span className="font-semibold text-brand-700">{student.class_names || '---'}</span>
              </div>
            </div>

            {student.address && (
              <div>
                <span className="text-slate-400 text-[11px] block">Địa chỉ:</span>
                <span className="font-medium text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> {student.address}
                </span>
              </div>
            )}
          </div>

          {/* Parent Info Box */}
          <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100 p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-brand-600" /> Thông Tin Phụ Huynh Liên Hệ
              </h4>
              <button
                onClick={handleCopyZalo}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                title="Nhắn tin Zalo"
              >
                <Send className="w-3 h-3" /> Nhắn Zalo
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 text-[11px] block">Họ tên phụ huynh:</span>
                <span className="font-bold text-slate-800">{student.parent_name || 'Chưa cập nhật'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Số điện thoại:</span>
                <a 
                  href={`tel:${student.parent_phone}`}
                  className="font-mono font-bold text-brand-600 hover:underline"
                >
                  {student.parent_phone || '---'}
                </a>
              </div>
            </div>
          </div>

          {/* Notes Box */}
          {student.notes && (
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-3.5 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 block">Ghi chú của Cô Thủy:</span>
              <p className="text-slate-700 italic text-xs leading-relaxed">{student.notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2.5">
            <button
              onClick={() => {
                onClose();
                if (onEdit) onEdit(student);
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20 transition-all"
            >
              <Edit3 className="w-4 h-4" />
              <span>Chỉnh Sửa Hồ Sơ</span>
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              Đóng Lại
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
