import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  AlertCircle, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  QrCode, 
  Plus, 
  Sparkles,
  PhoneCall,
  UserCheck,
  Send,
  MessageSquare,
  DollarSign,
  GraduationCap,
  MapPin,
  Check,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminDashboard({ setActiveTab, onOpenQR, showToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
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

  const handleCopyZalo = (item) => {
    const formattedAmount = formatMoney(item.final_amount);
    const msg = `Kính gửi Phụ huynh bé ${item.student_name},\nCô Thủy gửi thông báo học phí tháng ${item.billing_month || 'này'} lớp ${item.class_name}:\n- Số tiền cần đóng: ${formattedAmount}\n- Hạn nộp: ${item.due_date || '15 hàng tháng'}\n- Số tài khoản: 0912345678 (MB Bank - NGUYEN THI THUY)\n- Cú pháp chuyển khoản: ${item.transfer_memo || `HP ${item.student_code || 'STU'}`}\nPhụ huynh đóng học phí sớm giúp cô nhé ạ. Cảm ơn bố mẹ nhiều!`;

    navigator.clipboard.writeText(msg);
    setCopiedId(item.id);
    if (showToast) showToast(`Đã sao chép tin nhắn Zalo gửi phụ huynh bé ${item.student_name}!`, 'info');
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium">Đang tải dữ liệu tổng quan trung tâm...</p>
      </div>
    );
  }

  const { total_students, total_classes, tuition_stats, recent_lessons, classes = [], unpaid_alerts = [] } = data || {};

  const totalAmount = parseFloat(tuition_stats?.total_amount || 0);
  const paidAmount = parseFloat(tuition_stats?.paid_amount || 0);
  const unpaidAmount = parseFloat(tuition_stats?.unpaid_amount || 0);
  const completionRate = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Hero Banner: Quản Lý Lớp Học & Học Phí Dễ Dàng Hơn Bao Giờ Hết */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white shadow-xl shadow-brand-500/15">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-brand-100">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Thủy English 2.0 • Chào mừng trở lại, Cô Thủy!</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            Quản Lý Lớp Học & Học Phí Dễ Dàng Hơn Bao Giờ Hết
          </h1>

          <p className="text-brand-100 text-xs sm:text-sm leading-relaxed font-medium">
            Hệ thống quản lý giáo dục thông minh 1-chạm: Điểm danh nhanh không cuộn trang, tự động phát hành mã VietQR Napas247 và kết nối phụ huynh tức thì qua Zalo.
          </p>

          {/* 4 Phím Tắt 1-Chạm Nổi Bật */}
          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={() => setActiveTab('attendance')}
              className="px-4 py-2.5 rounded-2xl bg-white text-brand-700 font-bold text-xs shadow-md hover:bg-brand-50 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Điểm Danh Hôm Nay</span>
            </button>

            <button
              onClick={() => setActiveTab('tuition')}
              className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md transition-all flex items-center gap-1.5 border border-white/20"
            >
              <QrCode className="w-4 h-4 text-brand-200" />
              <span>Thu Phí VietQR</span>
            </button>

            <button
              onClick={() => setActiveTab('parents')}
              className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md transition-all flex items-center gap-1.5 border border-white/20"
            >
              <UserCheck className="w-4 h-4 text-purple-200" />
              <span>Cấp TK Phụ Huynh</span>
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md transition-all flex items-center gap-1.5 border border-white/20"
            >
              <GraduationCap className="w-4 h-4 text-yellow-300" />
              <span>Thêm Học Sinh</span>
            </button>
          </div>
        </div>
        
        {/* Decorative Circle Background */}
        <div className="absolute -right-12 -bottom-12 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
      </div>

      {/* 4 Thẻ KPI Chỉ Số Chính Kèm Tiến Độ Thu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Học sinh */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-brand-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tổng Học Viên</span>
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-800">{total_students}</span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">học sinh</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>100% học sinh đang học tích cực</span>
          </div>
        </div>

        {/* Card 2: Lớp học */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-purple-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Lớp Đang Dạy</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-800">{total_classes}</span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">lớp học</span>
          </div>
          <div className="mt-2 text-xs text-purple-700 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>Starters, Movers, Flyers, IELTS</span>
          </div>
        </div>

        {/* Card 3: Học phí đã thu kèm Progress Bar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Đã Thu Tháng Này</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">
              {formatMoney(paidAmount)}
            </span>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
              <span>Đạt {completionRate}% mục tiêu</span>
              <span className="text-emerald-600">{tuition_stats?.paid_invoices || 0}/{tuition_stats?.total_invoices || 0} phiếu</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 4: Học phí cần thu */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-amber-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Chưa Thu (Cần Nhắc)</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-amber-600">
              {formatMoney(unpaidAmount)}
            </span>
          </div>
          <div className="mt-2 text-xs text-amber-700 font-semibold flex items-center justify-between">
            <span>Còn {tuition_stats?.total_invoices - tuition_stats?.paid_invoices || 0} học sinh chưa nộp</span>
            <button
              onClick={() => setActiveTab('tuition')}
              className="text-brand-600 hover:underline font-bold text-[11px]"
            >
              Nhắc nợ &rarr;
            </button>
          </div>
        </div>

      </div>

      {/* Grid Danh Sách Lớp Học Nhanh */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-brand-600" />
              Các Lớp Học Đang Giảng Dạy ({classes.length} Lớp)
            </h2>
            <p className="text-xs text-slate-400">Truy cập nhanh thời khóa biểu, sĩ số và điểm danh từng lớp</p>
          </div>

          <button
            onClick={() => setActiveTab('classes')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            Quản lý tất cả lớp <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {classes.map((cls) => (
            <div 
              key={cls.id}
              className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-brand-200 hover:shadow-sm transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono font-bold text-slate-700">
                    {cls.code}
                  </span>
                  <span className="text-[11px] font-bold text-brand-600">
                    {cls.level}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-800 mt-2 line-clamp-1">{cls.name}</h3>

                <div className="mt-2 space-y-1 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px]">{cls.schedule_note || 'Chưa xếp lịch'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px]">{cls.room || 'Phòng 201'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700">
                  {cls.student_count || 0} học sinh
                </span>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className="px-2.5 py-1 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-[11px] transition-colors"
                >
                  Điểm danh
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid 2 Cột: Lịch học gần đây & Danh sách cần thu học phí */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cột Trái (2 phần): Buổi học & Tiến độ bài giảng */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-600" />
                Nhật Ký Dạy & Tiến Độ Bài Giảng
              </h2>
              <p className="text-xs text-slate-400">Theo dõi lịch dạy, nội dung bài giảng và bài tập về nhà</p>
            </div>
            <button
              onClick={() => setActiveTab('attendance')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Lưới điểm danh tuần <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recent_lessons?.map((lesson) => (
              <div 
                key={lesson.id} 
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 p-3 rounded-2xl transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-brand-50 text-brand-700 font-bold text-xs border border-brand-200">
                      {lesson.class_name}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {lesson.lesson_date} ({lesson.start_time} - {lesson.end_time})
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">{lesson.title}</h4>
                  {lesson.homework && (
                    <p className="text-xs text-slate-500 line-clamp-1">
                      <strong className="text-brand-600">BTVN:</strong> {lesson.homework}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setActiveTab('attendance')}
                  className="shrink-0 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-brand-300 text-xs font-bold text-slate-700 hover:text-brand-600 bg-white transition-colors shadow-2xs"
                >
                  Xem Điểm Danh
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cột Phải (1 phần): Danh sách cần thu học phí kèm nút VietQR & Nhắc Zalo */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-500" />
                Cần Thu Học Phí
              </h2>
              <p className="text-xs text-slate-400">Quét VietQR Napas & Nhắc Zalo 1-chạm</p>
            </div>
          </div>

          <div className="space-y-3">
            {unpaid_alerts?.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm space-y-1">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="font-bold text-slate-700">Tuyệt vời!</p>
                <p className="text-xs">Toàn bộ học phí tháng đã được thanh toán đầy đủ.</p>
              </div>
            ) : (
              unpaid_alerts?.map((item) => (
                <div key={item.id} className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">{item.student_name}</span>
                      <span className="text-[10px] text-slate-400">{item.class_name} • Hạn {item.due_date}</span>
                    </div>
                    <span className="font-black text-sm text-amber-600">{formatMoney(item.final_amount)}</span>
                  </div>

                  <div className="pt-1 flex items-center justify-between gap-2 border-t border-amber-100">
                    <div className="text-[11px] text-slate-500 font-mono">
                      {item.parent_phone}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Nút Nhắc Zalo */}
                      <button
                        onClick={() => handleCopyZalo(item)}
                        className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center gap-1 transition-colors"
                        title="Sao chép tin nhắn Zalo gửi phụ huynh"
                      >
                        {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-600" /> : <MessageSquare className="w-3 h-3 text-blue-600" />}
                        <span>{copiedId === item.id ? 'Đã chép' : 'Zalo'}</span>
                      </button>

                      {/* Nút VietQR */}
                      <button
                        onClick={() => {
                          if (onOpenQR) onOpenQR(item);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-colors"
                        title="Xem mã VietQR"
                      >
                        <QrCode className="w-3 h-3 text-white" />
                        <span>VietQR</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => setActiveTab('tuition')}
            className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors text-center block"
          >
            Quản lý toàn bộ học phí &rarr;
          </button>
        </div>

      </div>

    </div>
  );
}
