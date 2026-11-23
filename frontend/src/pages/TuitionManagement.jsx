import React, { useState, useEffect, useMemo } from 'react';
import { 
  CreditCard, 
  QrCode, 
  Check, 
  Clock, 
  Plus, 
  CheckCircle2, 
  Filter, 
  Building2, 
  ShieldCheck,
  Send,
  Printer,
  Edit,
  Trash2,
  Search,
  MessageSquare,
  AlertTriangle,
  Receipt,
  Download,
  Calendar,
  User,
  BookOpen,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle,
  Copy,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import ReceiptModal from '../components/ReceiptModal';

export default function TuitionManagement({ onOpenQR, showToast, askConfirm }) {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [bankInfo, setBankInfo] = useState({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState('2026-11');
  const [selectedClass, setSelectedClass] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'unpaid', 'paid'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [receiptFee, setReceiptFee] = useState(null);
  const [showReminderListModal, setShowReminderListModal] = useState(false);

  // Batch Form Data
  const [batchData, setBatchData] = useState({
    class_id: '',
    month: '2026-11',
    billing_type: 'monthly', // 'monthly' or 'attendance'
    amount: 850000,
    per_lesson_rate: 120000,
    material_fee: 0,
    due_date: '2026-11-15',
    notes: 'Học phí theo quy định trung tâm'
  });

  // Single Form Data
  const [singleData, setSingleData] = useState({
    student_id: '',
    class_id: '',
    month: '2026-11',
    amount: 850000,
    discount: 0,
    material_fee: 0,
    final_amount: 850000,
    due_date: '2026-11-15',
    notes: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [feeRes, classRes, studentRes] = await Promise.all([
        api.get('/admin/tuition', { month: selectedMonth }),
        api.get('/admin/classes'),
        api.get('/admin/students')
      ]);
      setFees(feeRes.fees || []);
      setBankInfo(feeRes.bank_info || {});
      setClasses(classRes || []);
      setStudents(studentRes || []);

      if (classRes && classRes.length > 0) {
        setBatchData(prev => ({ 
          ...prev, 
          class_id: classRes[0].id, 
          amount: classRes[0].tuition_amount || 850000 
        }));
      }
      if (studentRes && studentRes.length > 0 && classRes && classRes.length > 0) {
        setSingleData(prev => ({
          ...prev,
          student_id: studentRes[0].id,
          class_id: classRes[0].id
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async (month, clsId, status) => {
    try {
      const params = {};
      if (month) params.month = month;
      if (clsId) params.class_id = clsId;
      if (status && status !== 'all') params.status = status;
      const res = await api.get('/admin/tuition', params);
      setFees(res.fees || []);
    } catch (err) {
      console.error(err);
    }
  };

  // 1. Tạo học phí cả lớp
  const handleBatchCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        class_id: batchData.class_id,
        month: batchData.month,
        amount: Number(batchData.amount) + Number(batchData.material_fee || 0),
        due_date: batchData.due_date,
        notes: batchData.billing_type === 'attendance' 
          ? `Học phí tính theo số buổi điểm danh (Đơn giá ${new Intl.NumberFormat('vi-VN').format(batchData.per_lesson_rate)}đ/buổi)` 
          : batchData.notes
      };

      await api.post('/admin/tuition', payload);
      setShowBatchModal(false);
      handleFilter(selectedMonth, selectedClass, statusFilter);
      if (showToast) showToast('Đã khởi tạo phiếu học phí tháng thành công cho lớp!', 'success');
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    }
  };

  // 2. Tạo phiếu thu lẻ cho 1 học sinh
  const handleSingleCreate = async (e) => {
    e.preventDefault();
    try {
      const selectedStudent = students.find(s => s.id === Number(singleData.student_id));
      const totalAmount = Number(singleData.amount) + Number(singleData.material_fee || 0);
      const discount = Number(singleData.discount || 0);
      const finalAmount = Math.max(0, totalAmount - discount);

      const payload = {
        student_id: singleData.student_id,
        student_name: selectedStudent?.full_name,
        class_id: singleData.class_id,
        month: singleData.month,
        amount: totalAmount,
        discount: discount,
        final_amount: finalAmount,
        due_date: singleData.due_date,
        notes: singleData.notes
      };

      await api.post('/admin/tuition/single', payload);
      setShowSingleModal(false);
      handleFilter(selectedMonth, selectedClass, statusFilter);
      if (showToast) showToast(`Đã tạo phiếu học phí cho ${selectedStudent?.full_name || 'học sinh'}!`, 'success');
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    }
  };

  // 3. Sửa phiếu thu
  const handleUpdateFee = async (e) => {
    e.preventDefault();
    if (!editingFee) return;

    try {
      const amount = Number(editingFee.amount || 0);
      const discount = Number(editingFee.discount || 0);
      const finalAmount = Math.max(0, amount - discount);

      await api.put(`/admin/tuition/${editingFee.id}`, {
        amount: amount,
        discount: discount,
        final_amount: finalAmount,
        due_date: editingFee.due_date,
        notes: editingFee.notes
      });

      setFees(prev => prev.map(f => f.id === editingFee.id ? { 
        ...f, 
        amount, 
        discount, 
        final_amount: finalAmount, 
        due_date: editingFee.due_date, 
        notes: editingFee.notes 
      } : f));
      setEditingFee(null);
      if (showToast) showToast('Đã cập nhật thông tin phiếu học phí!', 'success');
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    }
  };

  // 4. Xóa phiếu thu (Custom confirm)
  const handleDeleteFee = (fee) => {
    if (askConfirm) {
      askConfirm({
        title: 'Xóa Phiếu Học Phí?',
        message: 'Bạn có chắc chắn muốn xóa phiếu học phí này?',
        itemName: `${fee.student_name} - ${fee.invoice_code} (${formatMoney(fee.final_amount)})`,
        onConfirm: async () => {
          try {
            setFees(prev => prev.filter(f => f.id !== fee.id));
            await api.delete(`/admin/tuition/${fee.id}`);
            if (showToast) showToast('Đã xóa phiếu học phí thành công!', 'success');
          } catch (err) {
            if (showToast) showToast(err.message, 'error');
            handleFilter(selectedMonth, selectedClass, statusFilter);
          }
        }
      });
    }
  };

  // 5. Đổi trạng thái thu tiền (Đã đóng / Chưa đóng)
  const handleTogglePaid = async (fee) => {
    try {
      const newStatus = fee.status === 'paid' ? 'unpaid' : 'paid';
      const paymentMethod = newStatus === 'paid' ? 'Chuyển khoản VietQR' : null;
      const paymentDate = newStatus === 'paid' ? new Date().toISOString().replace('T', ' ').slice(0, 19) : null;

      // Optimistic update
      setFees(prev => prev.map(f => f.id === fee.id ? { 
        ...f, 
        status: newStatus, 
        payment_method: paymentMethod, 
        payment_date: paymentDate 
      } : f));

      await api.put(`/admin/tuition/${fee.id}/status`, { 
        status: newStatus,
        payment_method: paymentMethod,
        payment_date: paymentDate
      });

      if (showToast) {
        showToast(
          newStatus === 'paid' 
            ? `Đã xác nhận thu học phí của bé ${fee.student_name}!` 
            : `Đã hoàn tác trạng thái chưa đóng tiền của bé ${fee.student_name}!`,
          'success'
        );
      }
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
      handleFilter(selectedMonth, selectedClass, statusFilter);
    }
  };

  // 6. Nhắc học phí 1-chạm qua Zalo
  const handleCopyZaloMessage = (fee) => {
    const formattedAmount = formatMoney(fee.final_amount);
    const msg = `Kính gửi Phụ huynh bé ${fee.student_name},\nCô Thủy gửi thông báo học phí tháng ${fee.billing_month} lớp ${fee.class_name}:\n- Số tiền: ${formattedAmount}\n- Hạn nộp: ${fee.due_date || '15 hàng tháng'}\n- STK nhận: 0912345678 (MB Bank - NGUYEN THI THUY)\n- Cú pháp chuyển khoản: ${fee.transfer_memo}\n- Mã QR Napas quét trực tiếp: ${fee.qr_url}\nPhụ huynh kiểm tra và thanh toán giúp cô nhé. Cô Thủy cảm ơn gia đình!`;

    navigator.clipboard.writeText(msg);
    if (showToast) showToast(`Đã sao chép tin nhắn Zalo gửi phụ huynh bé ${fee.student_name}!`, 'info');
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  // Lọc tìm kiếm client-side
  const filteredFees = useMemo(() => {
    return fees.filter(f => {
      const matchSearch = !searchQuery || 
        f.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.student_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.parent_phone && f.parent_phone.includes(searchQuery)) ||
        f.invoice_code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'all' || f.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [fees, searchQuery, statusFilter]);

  // Thống kê tài chính
  const totalAmount = fees.reduce((sum, f) => sum + parseFloat(f.final_amount || 0), 0);
  const paidFees = fees.filter(f => f.status === 'paid');
  const unpaidFees = fees.filter(f => f.status === 'unpaid');
  const paidAmount = paidFees.reduce((sum, f) => sum + parseFloat(f.final_amount || 0), 0);
  const unpaidAmount = unpaidFees.reduce((sum, f) => sum + parseFloat(f.final_amount || 0), 0);
  const completionRate = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-brand-600" />
            Học Phí & Cổng Thanh Toán VietQR
          </h1>
          <p className="text-sm text-slate-500">
            Tự động tạo mã QR Napas 247, phụ huynh quét là khớp số tiền & nội dung, xuất biên lai tức thì
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {unpaidFees.length > 0 && (
            <button
              onClick={() => setShowReminderListModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold text-xs flex items-center gap-2 transition-all shadow-xs"
              title="Danh sách học sinh cần nhắc học phí"
            >
              <MessageSquare className="w-4 h-4 text-amber-600" />
              <span>Nhắc Nợ Zalo ({unpaidFees.length})</span>
            </button>
          )}

          <button
            onClick={() => setShowSingleModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 text-brand-600" />
            <span>Tạo Phiếu Thu Lẻ</span>
          </button>

          <button
            onClick={() => setShowBatchModal(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Khởi Tạo Học Phí Tháng Cả Lớp</span>
          </button>
        </div>
      </div>

      {/* 4 Thẻ KPI Tài Chính & Thanh Tiến Độ Thu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Tổng Học Phí */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-brand-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tổng Học Phí Tháng</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-800 tracking-tight">
            {formatMoney(totalAmount)}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-slate-400" />
            <span>Tổng cộng {fees.length} phiếu thu đã lập</span>
          </div>
        </div>

        {/* Card 2: Đã Thu (Kèm Progress bar) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Thực Thu (Đã Đóng)</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-600 tracking-tight">
            {formatMoney(paidAmount)}
          </div>
          {/* Progress Bar */}
          <div className="mt-2.5">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
              <span>Tiến độ thu:</span>
              <span className="text-emerald-600 font-bold">{completionRate}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 3: Chưa Thu (Cần Nhắc) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-amber-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Chưa Thu (Cần Nhắc)</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-amber-600 tracking-tight">
            {formatMoney(unpaidAmount)}
          </div>
          <div className="text-xs text-amber-700 mt-1 font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Còn {unpaidFees.length} học sinh chưa hoàn tất</span>
          </div>
        </div>

        {/* Card 4: Kênh Thu & Tài Khoản Nhận */}
        <div className="bg-gradient-to-br from-brand-600 to-indigo-700 p-5 rounded-3xl text-white shadow-md shadow-brand-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-200">Tài Khoản Nhận Phí</span>
            <QrCode className="w-4 h-4 text-brand-200" />
          </div>
          <div className="mt-2">
            <div className="text-base font-black">MB BANK - 0912345678</div>
            <div className="text-xs text-brand-100 font-medium">NGUYEN THI THUY</div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-[11px] text-brand-100">
            <span>Cổng VietQR Napas 247</span>
            <span className="font-bold bg-white/20 px-2 py-0.5 rounded-full">Tự động 100%</span>
          </div>
        </div>

      </div>

      {/* Thanh Bộ Lọc & Tìm Kiếm Đa Chiều */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        
        {/* Nhóm Bộ Lọc Trái */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          
          {/* Lọc Tháng */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-600">Tháng:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                handleFilter(e.target.value, selectedClass, statusFilter);
              }}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>

          {/* Lọc Lớp */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200 text-xs">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                handleFilter(selectedMonth, e.target.value, statusFilter);
              }}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="">Tất cả các lớp ({classes.length})</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Lọc Trạng Thái Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/60 text-xs font-bold">
            <button
              onClick={() => {
                setStatusFilter('all');
                handleFilter(selectedMonth, selectedClass, 'all');
              }}
              className={`px-3 py-1 rounded-xl transition-all ${
                statusFilter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tất cả ({fees.length})
            </button>
            <button
              onClick={() => {
                setStatusFilter('unpaid');
                handleFilter(selectedMonth, selectedClass, 'unpaid');
              }}
              className={`px-3 py-1 rounded-xl transition-all ${
                statusFilter === 'unpaid' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Chưa đóng ({unpaidFees.length})
            </button>
            <button
              onClick={() => {
                setStatusFilter('paid');
                handleFilter(selectedMonth, selectedClass, 'paid');
              }}
              className={`px-3 py-1 rounded-xl transition-all ${
                statusFilter === 'paid' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Đã thu ({paidFees.length})
            </button>
          </div>

        </div>

        {/* Ô Tìm kiếm Nhanh */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên bé, SĐT, mã..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

      </div>

      {/* Bảng Danh Sách Học Phí Hiện Đại */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Đang tải dữ liệu học phí...
          </div>
        ) : filteredFees.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-600">Không tìm thấy phiếu học phí nào</p>
            <p className="text-xs">Hãy chọn tháng khác hoặc bấm "Khởi tạo học phí tháng" để lập hóa đơn.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[880px]">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="py-3.5 px-5">Mã Hóa Đơn</th>
                  <th className="py-3.5 px-5">Học Sinh & Phụ Huynh</th>
                  <th className="py-3.5 px-5">Lớp Học</th>
                  <th className="py-3.5 px-5">Số Tiền Phải Thu</th>
                  <th className="py-3.5 px-5">Hạn Nộp / Ngày Đóng</th>
                  <th className="py-3.5 px-5">Trạng Thái</th>
                  <th className="py-3.5 px-5 text-right">Thao Tác 1-Chạm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredFees.map((fee) => {
                  const isPaid = fee.status === 'paid';

                  return (
                    <tr key={fee.id} className="hover:bg-slate-50/70 transition-colors group">
                      
                      {/* Mã HĐ */}
                      <td className="py-3.5 px-5">
                        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {fee.invoice_code}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">Tháng {fee.billing_month}</div>
                      </td>

                      {/* Học sinh & Phụ huynh */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 font-black text-xs flex items-center justify-center shrink-0 border border-brand-100">
                            {fee.student_name ? fee.student_name.split(' ').slice(-1)[0][0] : 'S'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-xs">{fee.student_name}</div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <span>{fee.student_code}</span> • <span>{fee.parent_phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Lớp */}
                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-1 rounded-xl bg-slate-100 font-semibold text-slate-700 text-[11px]">
                          {fee.class_name}
                        </span>
                      </td>

                      {/* Số tiền */}
                      <td className="py-3.5 px-5">
                        <div className="font-black text-sm text-slate-900">
                          {formatMoney(fee.final_amount)}
                        </div>
                        {Number(fee.discount) > 0 && (
                          <div className="text-[10px] text-rose-500 font-semibold">
                            Giảm -{formatMoney(fee.discount)}
                          </div>
                        )}
                      </td>

                      {/* Hạn nộp / Ngày đóng */}
                      <td className="py-3.5 px-5 text-slate-500">
                        {isPaid ? (
                          <div>
                            <div className="font-semibold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Đã nộp: {fee.payment_date ? fee.payment_date.split(' ')[0] : 'Đầy đủ'}</span>
                            </div>
                            <div className="text-[10px] text-slate-400">{fee.payment_method || 'Chuyển khoản VietQR'}</div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-semibold text-amber-700">Hạn: {fee.due_date || '15 hàng tháng'}</div>
                            <div className="text-[10px] text-slate-400">Chưa nhận thanh toán</div>
                          </div>
                        )}
                      </td>

                      {/* Badge Trạng thái */}
                      <td className="py-3.5 px-5">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <Check className="w-3 h-3" /> Đã Đóng
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                            <Clock className="w-3 h-3" /> Chưa Đóng
                          </span>
                        )}
                      </td>

                      {/* Nút Thao tác */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Nút VietQR */}
                          <button
                            onClick={() => onOpenQR(fee)}
                            className="p-1.5 px-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-[11px] flex items-center gap-1 border border-brand-200 transition-colors shadow-2xs"
                            title="Xem và gửi mã VietQR Napas"
                          >
                            <QrCode className="w-3.5 h-3.5 text-brand-600" />
                            <span>VietQR</span>
                          </button>

                          {/* Nếu đã đóng: Nút Xem Biên Lai */}
                          {isPaid ? (
                            <button
                              onClick={() => setReceiptFee(fee)}
                              className="p-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center gap-1 border border-emerald-200 transition-colors shadow-2xs"
                              title="Xem & in biên lai điện tử"
                            >
                              <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Biên Lai</span>
                            </button>
                          ) : (
                            /* Nếu chưa đóng: Nút Nhắc Zalo 1-chạm */
                            <button
                              onClick={() => handleCopyZaloMessage(fee)}
                              className="p-1.5 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center gap-1 border border-blue-200 transition-colors shadow-2xs"
                              title="Sao chép tin nhắn nhắc học phí Zalo"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                              <span>Nhắc Zalo</span>
                            </button>
                          )}

                          {/* Nút Đổi trạng thái (Thu tiền / Hủy thu) */}
                          <button
                            onClick={() => handleTogglePaid(fee)}
                            className={`p-1.5 px-2.5 rounded-xl font-bold text-[11px] border transition-colors shadow-2xs ${
                              isPaid
                                ? 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                            }`}
                            title={isPaid ? 'Đánh dấu thành chưa đóng' : 'Xác nhận học sinh đã nộp tiền'}
                          >
                            {isPaid ? 'Hủy Thu' : 'Đã Thu'}
                          </button>

                          {/* Nút Sửa */}
                          <button
                            onClick={() => setEditingFee(fee)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                            title="Sửa phiếu thu"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Nút Xóa */}
                          <button
                            onClick={() => handleDeleteFee(fee)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Xóa phiếu thu"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Khởi Tạo Học Phí Tháng Cho Cả Lớp (Có Tự Động Tính Theo Số Buổi Điểm Danh) */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-6 space-y-5 animate-scale-up">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-800">Khởi Tạo Học Phí Tháng Cả Lớp</h3>
                  <p className="text-xs text-slate-400">Tự động phát hành phiếu thu và tạo mã VietQR</p>
                </div>
              </div>
              <button
                onClick={() => setShowBatchModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBatchCreate} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chọn Lớp Học *</label>
                  <select
                    value={batchData.class_id}
                    onChange={(e) => {
                      const selected = classes.find(c => String(c.id) === e.target.value);
                      setBatchData({ 
                        ...batchData, 
                        class_id: e.target.value,
                        amount: selected ? selected.tuition_amount : batchData.amount
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                    required
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.level})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tháng Tính Phí *</label>
                  <input
                    type="month"
                    value={batchData.month}
                    onChange={(e) => setBatchData({ ...batchData, month: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Chế độ tính phí: Cố định vs Theo số buổi điểm danh */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Phương Thức Tính Học Phí</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBatchData({ ...batchData, billing_type: 'monthly' })}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      batchData.billing_type === 'monthly'
                        ? 'border-brand-500 bg-brand-50/50 text-brand-800 ring-2 ring-brand-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>Cố Định Theo Tháng</span>
                      {batchData.billing_type === 'monthly' && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Số tiền cố định hàng tháng cho cả khóa</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBatchData({ ...batchData, billing_type: 'attendance' })}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      batchData.billing_type === 'attendance'
                        ? 'border-brand-500 bg-brand-50/50 text-brand-800 ring-2 ring-brand-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>Theo Số Buổi Điểm Danh</span>
                      {batchData.billing_type === 'attendance' && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Tự động tính: Số buổi có mặt x Đơn giá</p>
                  </button>
                </div>
              </div>

              {batchData.billing_type === 'monthly' ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Định Mức Học Phí Tháng (VNĐ) *</label>
                  <input
                    type="number"
                    value={batchData.amount}
                    onChange={(e) => setBatchData({ ...batchData, amount: e.target.value })}
                    step="50000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-black text-brand-600 text-sm"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Đơn Giá Mỗi Buổi Học (VNĐ) *</label>
                  <input
                    type="number"
                    value={batchData.per_lesson_rate}
                    onChange={(e) => setBatchData({ ...batchData, per_lesson_rate: e.target.value, amount: Number(e.target.value) * 8 })}
                    step="10000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-black text-brand-600 text-sm"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Học sinh học 8 buổi = {formatMoney(Number(batchData.per_lesson_rate) * 8)}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phụ Phí Sách / Giáo Trình (nếu có)</label>
                  <input
                    type="number"
                    value={batchData.material_fee}
                    onChange={(e) => setBatchData({ ...batchData, material_fee: e.target.value })}
                    step="50000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hạn Nộp Học Phí *</label>
                  <input
                    type="date"
                    value={batchData.due_date}
                    onChange={(e) => setBatchData({ ...batchData, due_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi Chú Cho Phụ Huynh</label>
                <input
                  type="text"
                  value={batchData.notes}
                  onChange={(e) => setBatchData({ ...batchData, notes: e.target.value })}
                  placeholder="Ví dụ: Học phí bao gồm giáo trình và tài liệu luyện thi..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div className="pt-3 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Khởi Tạo Học Phí</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: Tạo Phiếu Thu Lẻ Cho 1 Học Sinh */}
      {showSingleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-6 space-y-4 animate-scale-up">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-800">Tạo Phiếu Học Phí Đơn Lẻ</h3>
              <button
                onClick={() => setShowSingleModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSingleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chọn Học Sinh *</label>
                <select
                  value={singleData.student_id}
                  onChange={(e) => {
                    const stu = students.find(s => s.id === Number(e.target.value));
                    setSingleData({
                      ...singleData,
                      student_id: e.target.value,
                      class_id: stu ? (stu.class_id || singleData.class_id) : singleData.class_id
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800"
                  required
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.student_code}) - {s.parent_phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lớp Học *</label>
                  <select
                    value={singleData.class_id}
                    onChange={(e) => setSingleData({ ...singleData, class_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                    required
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tháng Tính Phí *</label>
                  <input
                    type="month"
                    value={singleData.month}
                    onChange={(e) => setSingleData({ ...singleData, month: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Học Phí Định Mức (VNĐ) *</label>
                  <input
                    type="number"
                    value={singleData.amount}
                    onChange={(e) => setSingleData({ ...singleData, amount: e.target.value })}
                    step="50000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giảm Giá / Học Bổng</label>
                  <input
                    type="number"
                    value={singleData.discount}
                    onChange={(e) => setSingleData({ ...singleData, discount: e.target.value })}
                    step="50000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-rose-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hạn Nộp Tiền *</label>
                <input
                  type="date"
                  value={singleData.due_date}
                  onChange={(e) => setSingleData({ ...singleData, due_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi Chú</label>
                <input
                  type="text"
                  value={singleData.notes}
                  onChange={(e) => setSingleData({ ...singleData, notes: e.target.value })}
                  placeholder="Lý do giảm trừ hoặc ghi chú riêng cho bé..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              {/* Total preview */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600">Thực thu:</span>
                <span className="text-base font-black text-brand-600">
                  {formatMoney(Math.max(0, Number(singleData.amount) - Number(singleData.discount || 0)))}
                </span>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSingleModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all shadow-md shadow-brand-500/20"
                >
                  Tạo Phiếu Thu
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 3: Sửa Phiếu Thu */}
      {editingFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-6 space-y-4 animate-scale-up">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-800">
                Sửa Phiếu Thu: {editingFee.student_name}
              </h3>
              <button
                onClick={() => setEditingFee(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateFee} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Tiền Gốc (VNĐ)</label>
                  <input
                    type="number"
                    value={editingFee.amount}
                    onChange={(e) => setEditingFee({ ...editingFee, amount: e.target.value })}
                    step="50000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giảm Giá (VNĐ)</label>
                  <input
                    type="number"
                    value={editingFee.discount}
                    onChange={(e) => setEditingFee({ ...editingFee, discount: e.target.value })}
                    step="50000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-rose-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hạn Nộp</label>
                <input
                  type="date"
                  value={editingFee.due_date}
                  onChange={(e) => setEditingFee({ ...editingFee, due_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi Chú</label>
                <input
                  type="text"
                  value={editingFee.notes || ''}
                  onChange={(e) => setEditingFee({ ...editingFee, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600">Số tiền sau điều chỉnh:</span>
                <span className="text-base font-black text-brand-600">
                  {formatMoney(Math.max(0, Number(editingFee.amount) - Number(editingFee.discount || 0)))}
                </span>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingFee(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all shadow-md shadow-brand-500/20"
                >
                  Lưu Thay Đổi
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 4: Danh Sách Nhắc Nợ Nhanh Qua Zalo */}
      {showReminderListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-6 space-y-4 animate-scale-up">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-base text-slate-800">
                  Danh Sách Nhắc Học Phí ({unpaidFees.length} Học Sinh)
                </h3>
              </div>
              <button
                onClick={() => setShowReminderListModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Bấm vào biểu tượng Zalo cạnh tên mỗi phụ huynh để sao chép tin nhắn nhắc nợ lịch sự kèm mã VietQR:
            </p>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-1">
              {unpaidFees.map(fee => (
                <div key={fee.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-800">{fee.student_name} ({fee.student_code})</div>
                    <div className="text-[11px] text-slate-400">
                      PH: {fee.parent_name} • {fee.parent_phone} • {fee.class_name}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-black text-amber-600 text-xs">
                      {formatMoney(fee.final_amount)}
                    </span>
                    <button
                      onClick={() => handleCopyZaloMessage(fee)}
                      className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Chép Tin Zalo</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 text-right">
              <button
                onClick={() => setShowReminderListModal(false)}
                className="py-2 px-5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 transition-colors"
              >
                Đóng Lại
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 5: Biên Lai Thu Học Phí Điện Tử (Printable E-Receipt) */}
      <ReceiptModal
        isOpen={!!receiptFee}
        onClose={() => setReceiptFee(null)}
        fee={receiptFee}
      />

    </div>
  );
}
