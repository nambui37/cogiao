import React, { useState, useEffect } from 'react';
import { 
  Megaphone,
  GraduationCap, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  CreditCard, 
  QrCode, 
  Award, 
  BookOpen, 
  Check, 
  Sparkles,
  Phone,
  ChevronRight,
  ShieldCheck,
  Receipt
} from 'lucide-react';
import { api } from '../services/api';
import ReceiptModal from '../components/ReceiptModal';

export default function ParentPortal({ onOpenQR, announcements = [], currentUser }) {
  const myChildren = currentUser?.children || [];
  const initialStudentId = myChildren.length > 0 ? myChildren[0].id : 1;
  const [studentId, setStudentId] = useState(initialStudentId);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview', 'attendance', 'tuition'
  const [receiptFee, setReceiptFee] = useState(null);

  useEffect(() => {
    if (myChildren.length > 0 && !myChildren.some(c => c.id === studentId)) {
      setStudentId(myChildren[0].id);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchStudentData(studentId);
  }, [studentId]);

  const fetchStudentData = async (id) => {
    try {
      setLoading(true);
      const res = await api.get(`/parent/student/${id}`);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium">Đang tải hồ sơ học tập của con...</p>
      </div>
    );
  }

  const { student, attendance_rate, attendance_history, assessments, tuition } = data || {};

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-16">
      
      {/* Switcher for Parent's children if parent has multiple children */}
      {myChildren.length > 1 && (
        <div className="bg-emerald-50/90 border border-emerald-200 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" /> Chọn hồ sơ con theo dõi ({myChildren.length} bé):
          </span>
          <div className="flex flex-wrap gap-2">
            {myChildren.map((child) => (
              <button
                key={child.id}
                onClick={() => setStudentId(child.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 ${
                  studentId === child.id 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-emerald-100'
                }`}
              >
                <span>{child.full_name}</span>
                {child.student_code && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    studentId === child.id ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {child.student_code}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Banner Thông Báo Mới Nhất Từ Cô Thủy */}
      {announcements.length > 0 && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/20 space-y-1 animate-scale-up">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-amber-100">
            <span className="flex items-center gap-1.5">
              <Megaphone className="w-4 h-4 text-white animate-bounce" /> Thông báo từ Cô Thủy
            </span>
            <span>{announcements[0].time}</span>
          </div>
          <h4 className="font-extrabold text-sm">{announcements[0].title}</h4>
          <p className="text-xs text-amber-50 leading-relaxed font-medium">
            {announcements[0].message}
          </p>
        </div>
      )}

      {/* Thẻ Hồ Sơ Học Sinh (Hero Card) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white p-6 shadow-xl shadow-emerald-600/15">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-2xl border border-white/30 text-white shadow-inner">
            {student?.full_name?.split(' ').slice(-1)[0][0]}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black">{student?.full_name}</h2>
              <span className="px-2 py-0.5 rounded-md bg-white/20 text-[11px] font-mono tracking-wider font-semibold">
                {student?.student_code}
              </span>
            </div>
            <p className="text-xs text-emerald-100 font-medium">
              {student?.current_class_name || 'Lớp Starters 1'} • {student?.current_class_level}
            </p>
            <p className="text-[11px] text-emerald-200">
              Lịch học: {student?.schedule_note || 'Thứ 3 & Thứ 5'}
            </p>
          </div>
        </div>

        {/* 2 Quick KPI Pills */}
        <div className="mt-5 grid grid-cols-2 gap-3 pt-4 border-t border-white/20">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20">
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="text-lg font-black">{attendance_rate}%</div>
              <div className="text-[11px] text-emerald-100">Chuyên cần</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20">
              <Award className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <div className="text-lg font-black">{assessments?.[0]?.score || '9.5'}/10</div>
              <div className="text-[11px] text-emerald-100">Điểm gần nhất</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'overview' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Nhận xét & Tiến độ
        </button>
        <button
          onClick={() => setActiveSubTab('attendance')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'attendance' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Lịch sử điểm danh
        </button>
        <button
          onClick={() => setActiveSubTab('tuition')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'tuition' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Học phí & VietQR
        </button>
      </div>

      {/* Tab 1: Tổng quan & Nhận xét của cô Thủy */}
      {activeSubTab === 'overview' && (
        <div className="space-y-4">
          
          {/* Nhận xét mới nhất của cô giáo */}
          {assessments?.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" /> Đánh giá định kỳ của Cô Thủy
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Điểm: {assessments[0].score}/{assessments[0].max_score}
                </span>
              </div>

              <h4 className="font-bold text-slate-800 text-sm">{assessments[0].title}</h4>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-sm text-slate-700 italic leading-relaxed">
                "{assessments[0].teacher_comment}"
              </div>

              {/* Skills breakdown */}
              {assessments[0].skills_breakdown && (
                <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  {Object.entries(JSON.parse(assessments[0].skills_breakdown || '{}')).map(([skill, val]) => (
                    <div key={skill} className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <div className="text-slate-400 font-medium text-[11px]">{skill}</div>
                      <div className="font-bold text-slate-800 text-sm mt-0.5">{val}/10</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bài tập về nhà cần làm */}
          {attendance_history?.[0]?.homework && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600">
                <BookOpen className="w-4 h-4" /> Bài tập về nhà buổi gần nhất
              </div>

              <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-100 text-sm text-slate-800 leading-relaxed font-medium">
                {attendance_history[0].homework}
              </div>

              <p className="text-[11px] text-slate-400">
                Buổi học: {attendance_history[0].lesson_title} ({attendance_history[0].lesson_date})
              </p>
            </div>
          )}

        </div>
      )}

      {/* Tab 2: Lịch sử điểm danh */}
      {activeSubTab === 'attendance' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-800 text-base">Nhật Ký Đến Lớp</h3>
          <div className="divide-y divide-slate-100">
            {attendance_history?.map((att, idx) => {
              const isPresent = att.status === 'present';
              const isLate = att.status === 'late';
              const isExcused = att.status === 'excused';

              return (
                <div key={idx} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 text-sm">{att.lesson_date}</span>
                      {isPresent && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600">
                          Có mặt
                        </span>
                      )}
                      {isLate && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700">
                          Đi muộn
                        </span>
                      )}
                      {isExcused && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700">
                          Có phép
                        </span>
                      )}
                      {!isPresent && !isLate && !isExcused && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600">
                          Vắng
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">{att.lesson_title}</div>
                    {att.note && <div className="text-xs text-slate-400 italic">Nhận xét: {att.note}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Học phí & VietQR */}
      {activeSubTab === 'tuition' && (
        <div className="space-y-4">
          {tuition?.map((tui) => {
            const isPaid = tui.status === 'paid';

            return (
              <div 
                key={tui.id} 
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-slate-400">{tui.invoice_code}</span>
                    <h3 className="font-bold text-slate-800 text-base">Học Phí Tháng {tui.billing_month}</h3>
                  </div>

                  {isPaid ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
                      <Check className="w-3.5 h-3.5" /> Đã đóng
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                      <Clock className="w-3.5 h-3.5" /> Chưa đóng
                    </span>
                  )}
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-slate-100">
                  <span className="text-xs text-slate-500">Số tiền cần thanh toán:</span>
                  <span className="text-xl font-black text-brand-600">{formatMoney(tui.final_amount)}</span>
                </div>

                {!isPaid && (
                  <button
                    onClick={() => {
                      onOpenQR({
                        ...tui,
                        student_name: student.full_name,
                        student_code: student.student_code
                      });
                    }}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition-all"
                  >
                    <QrCode className="w-5 h-5 text-white" />
                    Quét Mã VietQR Chuyển Khoản Ngay
                  </button>
                )}

                {isPaid && (
                  <div className="space-y-2.5 pt-1">
                    <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5 py-1 bg-emerald-50 rounded-2xl border border-emerald-100 font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Đã nhận thanh toán ngày {tui.payment_date ? tui.payment_date.split(' ')[0] : 'Đầy đủ'} ({tui.payment_method || 'VietQR'})</span>
                    </div>

                    <button
                      onClick={() => setReceiptFee({
                        ...tui,
                        student_name: student?.full_name,
                        student_code: student?.student_code,
                        class_name: student?.current_class_name
                      })}
                      className="w-full py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Receipt className="w-4 h-4 text-brand-600" />
                      <span>Xem Biên Lai Thu Tiền Điện Tử</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Electronic Receipt Modal for Parent */}
      <ReceiptModal
        isOpen={!!receiptFee}
        onClose={() => setReceiptFee(null)}
        fee={receiptFee}
      />

    </div>
  );
}
