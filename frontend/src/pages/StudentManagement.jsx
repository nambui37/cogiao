import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  Calendar, 
  BookOpen, 
  Edit3, 
  Trash2, 
  Eye, 
  Check, 
  X, 
  Sparkles,
  ShieldAlert,
  GraduationCap,
  Heart,
  UserCheck,
  Send,
  Copy
} from 'lucide-react';
import { api } from '../services/api';
import StudentDetailModal from '../components/StudentDetailModal';

export default function StudentManagement({ showToast, askConfirm }) {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedClass, setSelectedClass] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'studying', 'reserved'
  const [search, setSearch] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedDetailStudent, setSelectedDetailStudent] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    student_code: '',
    date_of_birth: '2019-05-15',
    gender: 'female',
    parent_name: '',
    parent_phone: '',
    address: '',
    class_id: '',
    status: 'studying',
    notes: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [studentsData, classesData] = await Promise.all([
        api.get('/admin/students'),
        api.get('/admin/classes')
      ]);
      setStudents(studentsData || []);
      setClasses(classesData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async (clsId, query) => {
    try {
      const params = {};
      if (clsId) params.class_id = clsId;
      if (query) params.search = query;
      const res = await api.get('/admin/students', params);
      setStudents(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenCreate = () => {
    setEditingStudent(null);
    setFormData({
      full_name: '',
      student_code: 'STU' + Math.floor(100 + Math.random() * 900),
      date_of_birth: '2019-05-15',
      gender: 'female',
      parent_name: '',
      parent_phone: '',
      address: '',
      class_id: classes[0]?.id || '1',
      status: 'studying',
      notes: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (stu) => {
    setEditingStudent(stu);
    setFormData({
      full_name: stu.full_name,
      student_code: stu.student_code,
      date_of_birth: stu.date_of_birth || '2019-01-01',
      gender: stu.gender || 'female',
      parent_name: stu.parent_name || '',
      parent_phone: stu.parent_phone || '',
      address: stu.address || '',
      class_id: stu.class_ids ? String(stu.class_ids).split(',')[0] : (classes[0]?.id || '1'),
      status: stu.status || 'studying',
      notes: stu.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await api.put(`/admin/students/${editingStudent.id}`, formData);
        if (showToast) showToast(`Đã cập nhật hồ sơ bé ${formData.full_name}!`, 'success');
      } else {
        await api.post('/admin/students', formData);
        if (showToast) showToast(`Đã thêm học sinh ${formData.full_name}!`, 'success');
      }
      setShowModal(false);
      handleFilter(selectedClass, search);
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    }
  };

  // Custom Confirm Delete
  const handleDelete = (stu) => {
    if (askConfirm) {
      askConfirm({
        title: 'Xóa Hồ Sơ Học Sinh?',
        message: 'Bạn có chắc chắn muốn xóa hồ sơ học sinh này khỏi hệ thống?',
        itemName: `${stu.full_name} (${stu.student_code})`,
        onConfirm: async () => {
          try {
            setStudents(prev => prev.filter(s => s.id !== stu.id));
            await api.delete(`/admin/students/${stu.id}`);
            if (showToast) showToast(`Đã xóa học sinh "${stu.full_name}"!`, 'success');
          } catch (err) {
            if (showToast) showToast(err.message, 'error');
            handleFilter(selectedClass, search);
          }
        }
      });
    }
  };

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = !search || 
        s.full_name.toLowerCase().includes(search.toLowerCase()) ||
        s.student_code.toLowerCase().includes(search.toLowerCase()) ||
        (s.parent_phone && s.parent_phone.includes(search)) ||
        (s.parent_name && s.parent_name.toLowerCase().includes(search.toLowerCase()));

      const matchClass = !selectedClass || 
        (s.class_ids && String(s.class_ids).split(',').map(x => x.trim()).includes(String(selectedClass))) ||
        String(s.class_id) === String(selectedClass);

      const matchStatus = statusFilter === 'all' || s.status === statusFilter;

      return matchSearch && matchClass && matchStatus;
    });
  }, [students, search, selectedClass, statusFilter]);

  // KPIs
  const totalStudying = students.filter(s => s.status === 'studying').length;
  const femaleCount = students.filter(s => s.gender === 'female').length;
  const maleCount = students.filter(s => s.gender === 'male').length;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-brand-600" />
            Hồ Sơ Học Sinh
          </h1>
          <p className="text-sm text-slate-500">
            Quản lý danh sách học viên, phân lớp, theo dõi hồ sơ cá nhân và kết nối phụ huynh
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Học Sinh Mới</span>
        </button>
      </div>

      {/* 3 Thẻ KPI Thống Kê Học Sinh */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Tổng số học sinh */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-brand-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tổng Học Viên</span>
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-800 tracking-tight">
            {students.length} <span className="text-sm font-normal text-slate-400">học sinh</span>
          </div>
          <div className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>{totalStudying} học sinh đang theo học đều đặn</span>
          </div>
        </div>

        {/* Card 2: Phân bố giới tính */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Cơ Cấu Giới Tính</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <span className="text-pink-600">{femaleCount} Nữ</span>
            <span className="text-slate-300">/</span>
            <span className="text-blue-600">{maleCount} Nam</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Tỷ lệ cân đối giữa các lớp
          </div>
        </div>

        {/* Card 3: Phân bố theo lớp */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Quy Mô Lớp Học</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-600 tracking-tight">
            {classes.length} <span className="text-sm font-normal text-slate-400">lớp đang mở</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            100% học sinh đã được phân lớp chính thức
          </div>
        </div>

      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        
        {/* Bộ Lọc Trái */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          
          {/* Lọc Lớp */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200 text-xs">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                handleFilter(e.target.value, search);
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
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-xl transition-all ${
                statusFilter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tất cả ({students.length})
            </button>
            <button
              onClick={() => setStatusFilter('studying')}
              className={`px-3 py-1 rounded-xl transition-all ${
                statusFilter === 'studying' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Đang học ({totalStudying})
            </button>
            <button
              onClick={() => setStatusFilter('reserved')}
              className={`px-3 py-1 rounded-xl transition-all ${
                statusFilter === 'reserved' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Bảo lưu ({students.filter(s => s.status === 'reserved').length})
            </button>
          </div>

        </div>

        {/* Ô Tìm Kiếm Nhanh */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên học sinh, mã số, SĐT..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleFilter(selectedClass, e.target.value);
            }}
            className="w-full pl-9 pr-3 py-2 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

      </div>

      {/* Bảng Danh Sách Học Sinh */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Đang tải danh sách học sinh...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-600">Không tìm thấy học sinh nào</p>
            <p className="text-xs">Bấm "Thêm Học Sinh Mới" để ghi danh học viên vào hệ thống.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="py-3.5 px-5">Học Sinh</th>
                  <th className="py-3.5 px-4">Lớp Đang Học</th>
                  <th className="py-3.5 px-4">Phụ Huynh & SĐT</th>
                  <th className="py-3.5 px-3">Ngày Sinh</th>
                  <th className="py-3.5 px-3">Trạng Thái</th>
                  <th className="py-3.5 px-4">Ghi Chú</th>
                  <th className="py-3.5 px-5 text-right">Thao Tác 1-Chạm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.map((stu) => {
                  const initials = stu.full_name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(-2)
                    .join('');

                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/70 transition-colors group">
                      
                      {/* Cột Học Sinh */}
                      <td className="py-3.5 px-5">
                        <div 
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() => setSelectedDetailStudent(stu)}
                        >
                          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-brand-100 to-indigo-100 text-brand-700 font-bold flex items-center justify-center text-xs shadow-xs border border-brand-200/50 shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-xs hover:text-brand-600 transition-colors">
                              {stu.full_name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[10px] text-slate-400">{stu.student_code}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-medium ${
                                stu.gender === 'female' ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'
                              }`}>
                                {stu.gender === 'female' ? 'Nữ' : 'Nam'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Lớp */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-[11px] font-semibold border border-indigo-100">
                          {stu.class_names || 'Chưa xếp lớp'}
                        </span>
                      </td>

                      {/* Phụ Huynh */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-semibold text-xs">{stu.parent_name || 'Chưa cập nhật'}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{stu.parent_phone || '---'}</span>
                          {stu.parent_phone && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(stu.parent_phone);
                                if (showToast) showToast(`Đã chép SĐT ${stu.parent_phone}!`, 'info');
                              }}
                              className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600"
                              title="Sao chép SĐT"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Ngày sinh */}
                      <td className="py-3.5 px-3 text-slate-600 text-xs font-medium">
                        {stu.date_of_birth || '---'}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {stu.status === 'studying' ? 'Đang học' : stu.status === 'reserved' ? 'Bảo lưu' : 'Đã thôi học'}
                        </span>
                      </td>

                      {/* Ghi chú */}
                      <td className="py-3.5 px-4 text-xs text-slate-500 max-w-[180px] truncate">
                        {stu.notes || '---'}
                      </td>

                      {/* Cột Thao Tác 1-Chạm */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Nút Xem Chi Tiết */}
                          <button
                            onClick={() => setSelectedDetailStudent(stu)}
                            className="p-1.5 px-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center gap-1 border border-slate-200 transition-colors shadow-2xs"
                            title="Xem chi tiết hồ sơ học sinh"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Hồ Sơ</span>
                          </button>

                          {/* Nút Sửa */}
                          <button
                            onClick={() => handleOpenEdit(stu)}
                            className="p-1.5 px-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-[11px] flex items-center gap-1 border border-brand-200 transition-colors shadow-2xs"
                            title="Sửa thông tin học sinh"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-brand-600" />
                            <span>Sửa</span>
                          </button>

                          {/* Nút Xóa */}
                          <button
                            onClick={() => handleDelete(stu)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Xóa học sinh"
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

      {/* MODAL THÊM & CHỈNH SỬA HỌC SINH (Gọn gàng, không tràn màn hình) */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh] animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-800">
                    {editingStudent ? `Chỉnh Sửa Hồ Sơ: ${editingStudent.full_name}` : 'Thêm Học Sinh Mới'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingStudent ? 'Cập nhật thông tin bé và thông tin liên hệ' : 'Ghi danh học viên mới vào hệ thống'}
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

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và tên học sinh *</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Bảo An"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-bold text-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã học sinh</label>
                  <input
                    type="text"
                    value={formData.student_code}
                    onChange={(e) => setFormData({ ...formData, student_code: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-semibold text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giới tính</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-semibold text-slate-800 text-xs"
                  >
                    <option value="female">Bé Gái</option>
                    <option value="male">Bé Trai</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trạng thái học tập</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold text-emerald-700 text-xs"
                  >
                    <option value="studying">Đang học</option>
                    <option value="reserved">Bảo lưu</option>
                    <option value="withdrawn">Đã thôi học</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tên phụ huynh</label>
                  <input
                    type="text"
                    value={formData.parent_name}
                    onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                    placeholder="Chị Mai Lan..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-semibold text-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại phụ huynh *</label>
                  <input
                    type="tel"
                    required
                    value={formData.parent_phone}
                    onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                    placeholder="0988111222"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold text-brand-600 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Xếp vào lớp học</label>
                <select
                  value={formData.class_id}
                  onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold text-slate-800 text-xs"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code}) - {c.level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Địa chỉ nhà</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ví dụ: Phố Vọng, Hai Bà Trưng, Hà Nội"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú học tập / Nhận xét của Cô Thủy</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ghi chú về tính cách, lực học, điểm mạnh điểm yếu của bé..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium text-xs"
                ></textarea>
              </div>

              <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100">
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
                  <span>{editingStudent ? 'Cập Nhật Hồ Sơ' : 'Lưu Học Sinh'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL CHI TIẾT HỒ SƠ HỌC SINH */}
      <StudentDetailModal
        isOpen={!!selectedDetailStudent}
        onClose={() => setSelectedDetailStudent(null)}
        student={selectedDetailStudent}
        onEdit={handleOpenEdit}
        showToast={showToast}
      />

    </div>
  );
}
