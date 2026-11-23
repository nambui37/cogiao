import React from 'react';
import { 
  X, 
  BookOpen, 
  Users, 
  Clock, 
  MapPin, 
  DollarSign, 
  GraduationCap, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function ClassDetailModal({ isOpen, onClose, targetClass, students = [], onGoToAttendance, onGoToTuition }) {
  if (!isOpen || !targetClass) return null;

  // Filter students belonging to this class
  const classStudents = students.filter(s => {
    if (s.class_id && String(s.class_id) === String(targetClass.id)) return true;
    if (s.class_ids) {
      const ids = String(s.class_ids).split(',').map(x => x.trim());
      return ids.includes(String(targetClass.id));
    }
    return false;
  });

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Gradient */}
        <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-2xl backdrop-blur-md">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg leading-tight">{targetClass.name}</h3>
                <span className="px-2 py-0.5 rounded-md bg-white/20 text-[11px] font-mono font-bold">
                  {targetClass.code}
                </span>
              </div>
              <p className="text-xs text-brand-100 mt-0.5">
                Cấp độ: {targetClass.level} • {targetClass.schedule_note}
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

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          
          {/* 3 Thống kê nhanh */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Sĩ số thực tế</span>
              <span className="text-base font-black text-brand-600 mt-0.5 block">
                {classStudents.length} học sinh
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Mức học phí</span>
              <span className="text-base font-black text-emerald-600 mt-0.5 block">
                {formatMoney(targetClass.tuition_amount)}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Phòng học</span>
              <span className="text-base font-black text-slate-700 mt-0.5 block">
                {targetClass.room || 'Phòng 201'}
              </span>
            </div>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                onClose();
                if (onGoToAttendance) onGoToAttendance();
              }}
              className="py-2.5 px-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-brand-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-indigo-100 transition-colors"
            >
              <Calendar className="w-4 h-4 text-brand-600" />
              <span>Mở Điểm Danh Lớp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                onClose();
                if (onGoToTuition) onGoToTuition();
              }}
              className="py-2.5 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-100 transition-colors"
            >
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Học Phí Lớp Này</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Danh Sách Học Sinh Thuộc Lớp */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-800 text-xs">
                Danh Sách Học Viên Thuộc Lớp ({classStudents.length} bé):
              </span>
            </div>

            <div className="bg-slate-50/70 rounded-2xl border border-slate-100 divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {classStudents.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Chưa có học sinh nào được xếp vào lớp này
                </div>
              ) : (
                classStudents.map((s, idx) => (
                  <div key={s.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 font-bold text-slate-400 text-[11px]">{idx + 1}</span>
                      <div>
                        <div className="font-bold text-slate-800">{s.full_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{s.student_code}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] font-semibold text-slate-600">{s.parent_name || 'PH'}</div>
                      <div className="text-[10px] text-brand-600 font-mono">{s.parent_phone || '---'}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Close button */}
          <div className="pt-2 text-right">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors"
            >
              Đóng Lại
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
