import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserCheck, 
  Plus, 
  Phone, 
  Lock, 
  Copy, 
  Check, 
  Users, 
  Trash2, 
  X, 
  Sparkles, 
  MessageSquare, 
  Send,
  Edit,
  Search,
  KeyRound,
  GraduationCap,
  ShieldCheck,
  CreditCard,
  IdCard,
  UserPlus,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import ParentCardModal from '../components/ParentCardModal';

export default function ParentAccountManagement({ showToast, askConfirm }) {
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'linked', 'unlinked'

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [selectedCardParent, setSelectedCardParent] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Student search inside Modal
  const [childSearchQuery, setChildSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    password: '123',
    selected_children: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [parentList, studentList] = await Promise.all([
        api.get('/admin/parent-accounts'),
        api.get('/admin/students')
      ]);
      setParents(parentList || []);
      setStudents(studentList || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingParent(null);
    setChildSearchQuery('');
    setFormData({
      full_name: '',
      phone: '',
      password: '123',
      selected_children: []
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (parent) => {
    setEditingParent(parent);
    setChildSearchQuery('');
    const childIds = (parent.children || []).map(c => c.id);
    setFormData({
      full_name: parent.full_name || '',
      phone: parent.phone || '',
      password: parent.plain_password || '123',
      selected_children: childIds
    });
    setShowModal(true);
  };

  // Toggle child selection in modal
  const handleToggleChild = (childId) => {
    setFormData((prev) => {
      const exists = prev.selected_children.includes(childId);
      if (exists) {
        return { ...prev, selected_children: prev.selected_children.filter(id => id !== childId) };
      } else {
        return { ...prev, selected_children: [...prev.selected_children, childId] };
      }
    });
  };

  // Quick Reset Password to '123'
  const handleQuickResetPassword = async (parent) => {
    try {
      await api.put(`/admin/parent-accounts/${parent.id}`, {
        full_name: parent.full_name,
        password: '123'
      });
      setParents(prev => prev.map(p => p.id === parent.id ? { ...p, plain_password: '123' } : p));
      if (showToast) showToast(`Đã đặt lại mật khẩu của ${parent.full_name} về mặc định "123"!`, 'success');
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    }
  };

  // Submit Create / Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingParent) {
        // Update existing parent
        await api.put(`/admin/parent-accounts/${editingParent.id}`, {
          full_name: formData.full_name,
          phone: formData.phone,
          password: formData.password,
          children_ids: formData.selected_children
        });
        if (showToast) showToast(`Đã cập nhật thông tin tài khoản phụ huynh ${formData.full_name}!`, 'success');
      } else {
        // Create new parent
        await api.post('/admin/parent-accounts', {
          full_name: formData.full_name,
          phone: formData.phone,
          password: formData.password,
          children_ids: formData.selected_children
        });
        if (showToast) showToast(`Đã cấp tài khoản thành công cho phụ huynh ${formData.full_name}!`, 'success');
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    }
  };

  // Delete Parent Account
  const handleDelete = (parent) => {
    if (askConfirm) {
      askConfirm({
        title: 'Xóa Tài Khoản Phụ Huynh?',
        message: 'Bạn có chắc chắn muốn xóa tài khoản phụ huynh này khỏi hệ thống?',
        itemName: `${parent.full_name} (${parent.phone})`,
        onConfirm: async () => {
          try {
            setParents(prev => prev.filter(p => p.id !== parent.id));
            await api.delete(`/admin/parent-accounts/${parent.id}`);
            fetchData();
            if (showToast) showToast('Đã xóa tài khoản phụ huynh thành công!', 'success');
          } catch (err) {
            if (showToast) showToast(err.message, 'error');
          }
        }
      });
    }
  };

  // Copy Zalo Message
  const handleCopyZaloMessage = (parent) => {
    const childrenNames = (parent.children || []).map(c => c.full_name).join(', ') || 'con';
    const msg = `Kính gửi Phụ huynh bé ${childrenNames},\nCô Thủy gửi thông tin tài khoản đăng nhập Cổng thông tin học tập:\n- Số điện thoại: ${parent.phone}\n- Mật khẩu: ${parent.plain_password || '123'}\n- Link đăng nhập: http://localhost:5173\nPhụ huynh đăng nhập để xem lịch học, điểm danh 1-chạm, nhận xét bài kiểm tra và học phí của con nhé ạ!`;

    navigator.clipboard.writeText(msg);
    setCopiedId(parent.id);
    if (showToast) showToast(`Đã sao chép tin nhắn Zalo gửi phụ huynh ${parent.full_name}!`, 'info');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filter Parents
  const filteredParents = useMemo(() => {
    return parents.filter(p => {
      const matchSearch = !searchQuery || 
        p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone.includes(searchQuery) ||
        (p.children || []).some(c => c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || c.student_code.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === 'all' || 
        (statusFilter === 'linked' && (p.children || []).length > 0) ||
        (statusFilter === 'unlinked' && (!p.children || p.children.length === 0));

      return matchSearch && matchStatus;
    });
  }, [parents, searchQuery, statusFilter]);

  // Filter students inside modal
  const filteredChildrenInModal = useMemo(() => {
    if (!childSearchQuery) return students;
    const q = childSearchQuery.toLowerCase();
    return students.filter(s => 
      s.full_name.toLowerCase().includes(q) ||
      s.student_code.toLowerCase().includes(q) ||
      (s.class_names && s.class_names.toLowerCase().includes(q))
    );
  }, [students, childSearchQuery]);

  // Statistics
  const totalLinkedChildrenCount = parents.reduce((sum, p) => sum + (p.children ? p.children.length : 0), 0);
  const unlinkedStudents = students.filter(s => !parents.some(p => (p.children || []).some(c => c.id === s.id)));

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-7 h-7 text-brand-600" />
            Cấp Tài Khoản Phụ Huynh & Gắn Kèm Con
          </h1>
          <p className="text-sm text-slate-500">
            Cô Thủy chủ động tạo tài khoản, đặt mật khẩu, liên kết các bé và gửi thông tin Zalo 1-chạm
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cấp Tài Khoản Mới</span>
        </button>
      </div>

      {/* 3 Thẻ Thống Kê KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Tổng số tài khoản phụ huynh */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-brand-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tài Khoản Phụ Huynh</span>
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-800 tracking-tight">
            {parents.length} <span className="text-sm font-normal text-slate-400">phụ huynh</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Tất cả đã sẵn sàng đăng nhập</span>
          </div>
        </div>

        {/* Card 2: Học sinh đã liên kết */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Bé Đã Được Kết Nối</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-600 tracking-tight">
            {totalLinkedChildrenCount} / {students.length} <span className="text-sm font-normal text-slate-400">học sinh</span>
          </div>
          <div className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
            <span>Phụ huynh có thể theo dõi tiến độ hàng ngày</span>
          </div>
        </div>

        {/* Card 3: Học sinh chưa có tài khoản phụ huynh */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-amber-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Chưa Cấp Tài Khoản</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-amber-600 tracking-tight">
            {unlinkedStudents.length} <span className="text-sm font-normal text-slate-400">học sinh</span>
          </div>
          <div className="text-xs text-amber-700 mt-1 font-semibold">
            {unlinkedStudents.length > 0 ? 'Cần cấp tài khoản cho phụ huynh các bé này' : 'Toàn bộ học sinh đã được kết nối!'}
          </div>
        </div>

      </div>

      {/* Thanh Bộ Lọc & Tìm Kiếm Nhanh */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        
        {/* Tabs Trạng thái */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/60 text-xs font-bold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              statusFilter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tất cả phụ huynh ({parents.length})
          </button>
          <button
            onClick={() => setStatusFilter('linked')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              statusFilter === 'linked' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Đã gắn con ({parents.filter(p => (p.children || []).length > 0).length})
          </button>
          <button
            onClick={() => setStatusFilter('unlinked')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              statusFilter === 'unlinked' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Chưa gắn con ({parents.filter(p => !p.children || p.children.length === 0).length})
          </button>
        </div>

        {/* Ô Tìm Kiếm Nhanh */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên PH, SĐT hoặc tên con..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

      </div>

      {/* Bảng Danh Sách Tài Khoản Phụ Huynh */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Đang tải danh sách tài khoản phụ huynh...
          </div>
        ) : filteredParents.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-600">Không tìm thấy tài khoản phụ huynh nào</p>
            <p className="text-xs">Bấm "Cấp Tài Khoản Mới" để tạo tài khoản cho phụ huynh.</p>
          </div>
        ) : (
          <>
            {/* 1. Giao diện dạng thẻ (Cards) tối ưu 100% cho điện thoại di động */}
            <div className="md:hidden p-3.5 space-y-3">
              {filteredParents.map((parent) => {
                const isCopied = copiedId === parent.id;
                const hasChildren = parent.children && parent.children.length > 0;

                return (
                  <div key={parent.id} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
                    {/* Header card: Avatar + Tên PH + Thẻ VIP */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-brand-600 font-black text-sm flex items-center justify-center shrink-0 border border-brand-100 shadow-2xs">
                          {parent.full_name ? parent.full_name.split(' ').slice(-1)[0][0] : 'P'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm leading-tight">{parent.full_name}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {parent.children?.length || 0} bé theo học
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedCardParent(parent)}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 border border-slate-200"
                      >
                        <IdCard className="w-3.5 h-3.5 text-brand-600" />
                        <span>Thẻ VIP</span>
                      </button>
                    </div>

                    {/* SĐT & Mật Khẩu Grid */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">SĐT Đăng Nhập</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-brand-600 text-xs">{parent.phone}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(parent.phone);
                              if (showToast) showToast(`Đã sao chép SĐT ${parent.phone}!`, 'info');
                            }}
                            className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600"
                            title="Sao chép SĐT"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Mật Khẩu Cấp</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-slate-700 text-xs">{parent.plain_password || '123'}</span>
                          <button
                            onClick={() => handleQuickResetPassword(parent)}
                            className="p-1 hover:bg-amber-100 rounded text-slate-400 hover:text-amber-600"
                            title="Đặt lại mật khẩu về 123"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Các con được gắn */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Các Con Đi Học</span>
                      <div className="flex flex-wrap gap-1.5">
                        {hasChildren ? (
                          parent.children.map((c) => (
                            <span 
                              key={c.id} 
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200/60"
                            >
                              <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{c.full_name}</span>
                              <span className="text-[10px] text-emerald-600 font-mono">({c.student_code})</span>
                            </span>
                          ))
                        ) : (
                          <button
                            onClick={() => handleOpenEdit(parent)}
                            className="text-amber-600 font-semibold text-xs hover:underline flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60"
                          >
                            <Plus className="w-3 h-3" /> Gắn bé ngay
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleCopyZaloMessage(parent)}
                        className="flex-1 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-200 shadow-2xs transition-colors"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Đã chép tin nhắn Zalo!</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 text-blue-600" />
                            <span>Gửi Zalo 1-Chạm</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleOpenEdit(parent)}
                        className="p-2 rounded-xl text-slate-500 hover:text-brand-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(parent)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* 2. Giao diện Bảng chi tiết cho Máy tính (Desktop/Tablet) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[860px]">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 whitespace-nowrap">
                  <th className="py-3.5 px-5 min-w-[220px] whitespace-nowrap">Phụ Huynh</th>
                  <th className="py-3.5 px-5 min-w-[150px] whitespace-nowrap">SĐT Đăng Nhập</th>
                  <th className="py-3.5 px-5 min-w-[130px] whitespace-nowrap">Mật Khẩu Cấp</th>
                  <th className="py-3.5 px-5 min-w-[240px] whitespace-nowrap">Các Con Đi Học</th>
                  <th className="py-3.5 px-5 text-right min-w-[160px] whitespace-nowrap">Thao Tác 1-Chạm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredParents.map((parent) => {
                  const isCopied = copiedId === parent.id;
                  const hasChildren = parent.children && parent.children.length > 0;

                  return (
                    <tr key={parent.id} className="hover:bg-slate-50/70 transition-colors group">
                      
                      {/* Cột Phụ Huynh */}
                      <td className="py-3.5 px-5 whitespace-nowrap min-w-[220px]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-brand-600 font-black text-xs flex items-center justify-center shrink-0 border border-brand-100 shadow-2xs">
                            {parent.full_name ? parent.full_name.split(' ').slice(-1)[0][0] : 'P'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-800 text-xs whitespace-nowrap">{parent.full_name}</div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 whitespace-nowrap">
                              <span>{parent.children?.length || 0} bé theo học</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cột SĐT Đăng Nhập */}
                      <td className="py-3.5 px-5 whitespace-nowrap min-w-[150px]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-100">
                            {parent.phone}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(parent.phone);
                              if (showToast) showToast(`Đã sao chép SĐT ${parent.phone}!`, 'info');
                            }}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                            title="Sao chép SĐT"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Cột Mật Khẩu */}
                      <td className="py-3.5 px-5 whitespace-nowrap min-w-[130px]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                            {parent.plain_password || '123'}
                          </span>
                          <button
                            onClick={() => handleQuickResetPassword(parent)}
                            className="p-1 hover:bg-amber-50 rounded text-slate-400 hover:text-amber-600 transition-colors"
                            title="Đặt lại mật khẩu về mặc định 123"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Cột Các Con Được Gắn */}
                      <td className="py-3.5 px-5 min-w-[240px]">
                        <div className="flex flex-wrap gap-1.5 max-w-md">
                          {hasChildren ? (
                            parent.children.map((c) => (
                              <span 
                                key={c.id} 
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200/60 whitespace-nowrap"
                              >
                                <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{c.full_name}</span>
                                <span className="text-[10px] text-emerald-600 font-mono">({c.student_code})</span>
                              </span>
                            ))
                          ) : (
                            <button
                              onClick={() => handleOpenEdit(parent)}
                              className="text-amber-600 font-semibold text-[11px] hover:underline flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60 whitespace-nowrap"
                            >
                              <Plus className="w-3 h-3" /> Gắn bé ngay
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Cột Thao Tác 1-Chạm */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap min-w-[160px]">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Nút Gửi Zalo */}
                          <button
                            onClick={() => handleCopyZaloMessage(parent)}
                            className="p-1.5 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center gap-1 border border-blue-200 transition-colors shadow-2xs"
                            title="Sao chép nội dung gửi qua Zalo cho phụ huynh"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700">Đã chép!</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5 text-blue-600" />
                                <span>Gửi Zalo</span>
                              </>
                            )}
                          </button>

                          {/* Nút Xem Thẻ Tài Khoản */}
                          <button
                            onClick={() => setSelectedCardParent(parent)}
                            className="p-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 border border-slate-200 transition-colors shadow-2xs"
                            title="Xem thẻ tài khoản VIP của phụ huynh"
                          >
                            <IdCard className="w-3.5 h-3.5 text-brand-600" />
                            <span>Thẻ TK</span>
                          </button>

                          {/* Nút Sửa */}
                          <button
                            onClick={() => handleOpenEdit(parent)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                            title="Chỉnh sửa thông tin & gắn con"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Nút Xóa */}
                          <button
                            onClick={() => handleDelete(parent)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Xóa tài khoản phụ huynh"
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
        </>
        )}
      </div>

      {/* MODAL CẤP MỚI HOẶC CHỈNH SỬA TÀI KHOẢN PHỤ HUYNH */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh] animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Header Modal */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
                  {editingParent ? <Edit className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-800">
                    {editingParent ? 'Chỉnh Sửa Tài Khoản Phụ Huynh' : 'Cấp Tài Khoản Phụ Huynh Mới'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingParent ? 'Cập nhật số điện thoại, mật khẩu và liên kết các bé' : 'Tạo tài khoản và cấp mật khẩu ban đầu'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body with auto-scroll */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ tên phụ huynh *</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Ví dụ: Chị Lan Anh (Mẹ bé Bảo An)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-semibold text-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại đăng nhập *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0912345678"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold text-brand-600 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Mật khẩu cấp *</label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, password: '123' })}
                      className="text-[10px] text-brand-600 font-bold hover:underline"
                    >
                      Mặc định 123
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="123"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              {/* Phần Gắn Kèm Con */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label className="block font-black text-slate-800 text-xs">
                      Chọn các bé là con của phụ huynh này:
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Tích chọn để phụ huynh theo dõi cùng lúc nhiều bé
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 font-bold text-[11px] border border-brand-200">
                    Đã chọn: {formData.selected_children.length} bé
                  </span>
                </div>

                {/* Ô tìm kiếm bé trong modal */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm nhanh học sinh theo tên, mã..."
                    value={childSearchQuery}
                    onChange={(e) => setChildSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 bg-slate-50/50"
                  />
                </div>

                {/* Danh sách học sinh */}
                <div className="max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                  {filteredChildrenInModal.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      Không tìm thấy học sinh nào phù hợp
                    </div>
                  ) : (
                    filteredChildrenInModal.map((stu) => {
                      const isChecked = formData.selected_children.includes(stu.id);

                      return (
                        <div
                          key={stu.id}
                          onClick={() => handleToggleChild(stu.id)}
                          className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                            isChecked 
                              ? 'bg-brand-50 border border-brand-300 text-brand-900 shadow-xs' 
                              : 'bg-white border border-slate-100 hover:bg-slate-100/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}} // handled by parent div
                              className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                            />
                            <div>
                              <div className="font-bold text-xs text-slate-800">{stu.full_name}</div>
                              <div className="text-[10px] font-mono text-slate-400">{stu.student_code}</div>
                            </div>
                          </div>

                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {stu.class_names || 'Lớp học'}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingParent ? 'Cập Nhật Tài Khoản' : 'Cấp Tài Khoản'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL THẺ TÀI KHOẢN PHỤ HUYNH VIP */}
      <ParentCardModal
        isOpen={!!selectedCardParent}
        onClose={() => setSelectedCardParent(null)}
        parent={selectedCardParent}
        showToast={showToast}
      />

    </div>
  );
}
