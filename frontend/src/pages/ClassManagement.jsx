import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Plus, 
  Users, 
  Clock, 
  MapPin, 
  DollarSign, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Search,
  Filter,
  GraduationCap,
  Sparkles,
  TrendingUp,
  ArrowRight,
  CalendarCheck,
  Award,
  Layers,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import ClassDetailModal from '../components/ClassDetailModal';

export default function ClassManagement({ showToast, askConfirm, setActiveTab }) {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all'); // 'all', 'Starters', 'Movers', 'Flyers', 'IELTS'

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [selectedClassDetail, setSelectedClassDetail] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    level: 'Starters',
    room: 'Phòng 201',
    tuition_type: 'monthly',
    tuition_amount: 850000,
    schedule_note: 'Thứ 3 & Thứ 5 (17:30 - 19:00)',
    start_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [classRes, studentRes] = await Promise.all([
        api.get('/admin/classes'),
        api.get('/admin/students')
      ]);
      setClasses(classRes || []);
      setStudents(studentRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingClass(null);
    setFormData({
      name: '',
      code: 'CLS-' + Math.floor(1000 + Math.random() * 9000),
      level: 'Starters',
      room: 'Phòng 201',
      tuition_type: 'monthly',
      tuition_amount: 850000,
      schedule_note: 'Thứ 3 & Thứ 5 (17:30 - 19:00)',
      start_date: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditingClass(c);
    setFormData({
      name: c.name,
      code: c.code,
      level: c.level || 'Starters',
      room: c.room || '',
      tuition_type: c.tuition_type || 'monthly',
      tuition_amount: c.tuition_amount || 850000,
      schedule_note: c.schedule_note || '',
      start_date: c.start_date || new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await api.put(`/admin/classes/${editingClass.id}`, formData);
        if (showToast) showToast(`Đã cập nhật lớp "${formData.name}" thành công!`, 'success');
      } else {
        await api.post('/admin/classes', formData);
        if (showToast) showToast(`Đã tạo lớp "${formData.name}" thành công!`, 'success');
      }
      setShowModal(false);
      fetchInitialData();
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    }
  };

  // Perform actual deletion with Custom Confirm Modal
  const handleDelete = (cls) => {
    if (askConfirm) {
      askConfirm({
        title: 'Xóa Lớp Học?',
        message: 'Bạn có chắc chắn muốn xóa lớp học này khỏi danh sách quản lý?',
        itemName: `${cls.name} (${cls.code})`,
        onConfirm: async () => {
          try {
            setClasses(prev => prev.filter(c => c.id !== cls.id));
            await api.delete(`/admin/classes/${cls.id}`);
            if (showToast) showToast(`Đã xóa vĩnh viễn lớp "${cls.name}"!`, 'success');
            fetchInitialData();
          } catch (err) {
            if (showToast) showToast(err.message, 'error');
            fetchInitialData();
          }
        }
      });
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  // Filter classes
  const filteredClasses = useMemo(() => {
    return classes.filter(c => {
      const matchSearch = !searchQuery || 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.level && c.level.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.room && c.room.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchLevel = levelFilter === 'all' || 
        (c.level && c.level.toLowerCase().includes(levelFilter.toLowerCase()));

      return matchSearch && matchLevel;
    });
  }, [classes, searchQuery, levelFilter]);

  // KPIs
  const totalStudentsCount = students.length;
  const totalEstimatedRevenue = classes.reduce((sum, c) => {
    const sCount = students.filter(s => {
      if (s.class_id && String(s.class_id) === String(c.id)) return true;
      if (s.class_ids) {
        return String(s.class_ids).split(',').map(x => x.trim()).includes(String(c.id));
      }
      return false;
    }).length;
    return sum + (sCount * (c.tuition_amount || 0));
  }, 0);

  // Level Badge Colors & Gradient Accents
  const getLevelConfig = (level = '') => {
    const l = level.toLowerCase();
    if (l.includes('starter')) {
      return {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        dot: 'bg-emerald-500',
        accentBar: 'from-emerald-500 to-teal-500',
        textAccent: 'text-emerald-600',
        iconBg: 'bg-emerald-50 text-emerald-600'
      };
    }
    if (l.includes('mover')) {
      return {
        badge: 'bg-sky-50 text-sky-700 border-sky-200/80',
        dot: 'bg-sky-500',
        accentBar: 'from-sky-500 to-blue-500',
        textAccent: 'text-sky-600',
        iconBg: 'bg-sky-50 text-sky-600'
      };
    }
    if (l.includes('flyer')) {
      return {
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
        dot: 'bg-indigo-500',
        accentBar: 'from-indigo-500 to-purple-500',
        textAccent: 'text-indigo-600',
        iconBg: 'bg-indigo-50 text-indigo-600'
      };
    }
    if (l.includes('ielts')) {
      return {
        badge: 'bg-purple-50 text-purple-700 border-purple-200/80',
        dot: 'bg-purple-500',
        accentBar: 'from-purple-500 to-pink-500',
        textAccent: 'text-purple-600',
        iconBg: 'bg-purple-50 text-purple-600'
      };
    }
    return {
      badge: 'bg-brand-50 text-brand-700 border-brand-200/80',
      dot: 'bg-brand-500',
      accentBar: 'from-brand-500 to-indigo-500',
      textAccent: 'text-brand-600',
      iconBg: 'bg-brand-50 text-brand-600'
    };
  };

  // Helper count by level
  const countByLevel = (lvl) => {
    if (lvl === 'all') return classes.length;
    return classes.filter(c => (c.level || '').toLowerCase().includes(lvl.toLowerCase())).length;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* 1. Header Trang Hiện Đại */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-brand-500/25 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                Quản Lý Lớp Học Tiếng Anh
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-extrabold border border-brand-200/70 hidden sm:inline-block">
                Chuẩn Cambridge
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Thời khóa biểu, sĩ số học viên, định mức học phí và quản lý lớp học nhóm nhỏ
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Lớp Mới</span>
        </button>
      </div>

      {/* 2. 3 Thẻ KPI Thống Kê Lớp Học Đẹp Mắt */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Tổng số lớp */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-brand-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Lớp Đang Hoạt Động</span>
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-2xs">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-800 tracking-tight">
            {classes.length} <span className="text-sm font-normal text-slate-400">lớp học</span>
          </div>
          <div className="text-xs text-brand-600 mt-1 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Phân theo lộ trình Starters • Flyers • IELTS</span>
          </div>
        </div>

        {/* Card 2: Tổng sĩ số */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Tổng Sĩ Số Học Viên</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-600 tracking-tight">
            {totalStudentsCount} <span className="text-sm font-normal text-slate-400">học sinh</span>
          </div>
          <div className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
            <span>Sĩ số nhóm nhỏ ~{(totalStudentsCount / (classes.length || 1)).toFixed(1)} bé / lớp</span>
          </div>
        </div>

        {/* Card 3: Doanh thu dự kiến */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Dự Thu Học Phí Tháng</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-800 tracking-tight">
            {formatMoney(totalEstimatedRevenue)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Tính trên số lượng học viên đang theo học
          </div>
        </div>

      </div>

      {/* 3. Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        
        {/* Tabs Phân Cấp Độ */}
        <div className="flex flex-wrap bg-slate-100 p-1 rounded-2xl border border-slate-200/60 text-xs font-bold">
          <button
            onClick={() => setLevelFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              levelFilter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tất cả ({countByLevel('all')})
          </button>
          <button
            onClick={() => setLevelFilter('Starters')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              levelFilter === 'Starters' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Starters ({countByLevel('starters')})
          </button>
          <button
            onClick={() => setLevelFilter('Movers')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              levelFilter === 'Movers' ? 'bg-white text-sky-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Movers ({countByLevel('movers')})
          </button>
          <button
            onClick={() => setLevelFilter('Flyers')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              levelFilter === 'Flyers' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Flyers ({countByLevel('flyers')})
          </button>
          <button
            onClick={() => setLevelFilter('IELTS')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              levelFilter === 'IELTS' ? 'bg-white text-purple-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            IELTS ({countByLevel('ielts')})
          </button>
        </div>

        {/* Ô Tìm Kiếm Nhanh */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên lớp, mã, phòng học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* 4. Grid Danh Sách Lớp Học Nâng Cấp Tinh Tế */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm bg-white rounded-3xl border border-slate-200/80">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Đang tải danh sách lớp học...
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="py-16 text-center text-slate-400 space-y-2 bg-white rounded-3xl border border-slate-200/80 p-8">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-600">Không tìm thấy lớp học nào phù hợp</p>
          <p className="text-xs">Bấm "Thêm Lớp Mới" để mở thêm lớp học.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((cls) => {
            // Count actual students in this class
            const classStudents = students.filter(s => {
              if (s.class_id && String(s.class_id) === String(cls.id)) return true;
              if (s.class_ids) {
                return String(s.class_ids).split(',').map(x => x.trim()).includes(String(cls.id));
              }
              return false;
            });

            const cfg = getLevelConfig(cls.level);
            const maxCapacity = 10;
            const fillRatio = Math.min(100, Math.round((classStudents.length / maxCapacity) * 100));

            return (
              <div 
                key={cls.id} 
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between group hover:border-brand-300 relative overflow-hidden"
              >
                {/* Dải màu đỉnh thẻ theo cấp độ */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${cfg.accentBar}`}></div>

                <div className="space-y-3 pt-1">
                  
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-mono font-bold text-xs border border-slate-200/60">
                      {cls.code}
                    </span>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${cfg.badge} flex items-center gap-1.5`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                      <span>{cls.level || 'Cambridge'}</span>
                    </span>
                  </div>

                  {/* Class Name */}
                  <h3 
                    onClick={() => setSelectedClassDetail(cls)}
                    className="font-black text-base text-slate-800 leading-snug hover:text-brand-600 transition-colors cursor-pointer"
                  >
                    {cls.name}
                  </h3>

                  {/* Info Rows */}
                  <div className="space-y-2 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span className="font-semibold text-slate-700">{cls.schedule_note || 'Chưa xếp lịch'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{cls.room || 'Phòng học chính'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="font-black text-emerald-600">
                        {formatMoney(cls.tuition_amount)} <span className="font-normal text-slate-400 text-[10px]">/ tháng</span>
                      </span>
                    </div>
                  </div>

                  {/* Sĩ số học sinh & Thanh tiến độ lấp đầy */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500">Sĩ số lớp:</span>
                      <span className="text-slate-800 font-bold">
                        {classStudents.length} / {maxCapacity} bé
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${cfg.accentBar} transition-all duration-500`}
                        style={{ width: `${Math.max(10, fillRatio)}%` }}
                      ></div>
                    </div>
                  </div>

                </div>

                {/* Footer: Xem Học Sinh + Điểm Danh + Thao Tác */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  
                  {/* Nút Xem Học Sinh */}
                  <button
                    onClick={() => setSelectedClassDetail(cls)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-brand-600 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200/80 transition-colors cursor-pointer"
                    title="Xem chi tiết danh sách học sinh thuộc lớp này"
                  >
                    <Users className="w-3.5 h-3.5 text-brand-600" />
                    <span>Học sinh ({classStudents.length})</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    
                    {/* Nút Điểm Danh Nhanh */}
                    <button
                      onClick={() => setActiveTab && setActiveTab('attendance')}
                      className="p-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center gap-1 border border-emerald-200/80 transition-colors cursor-pointer shadow-2xs"
                      title="Chuyển sang trang Điểm danh lớp"
                    >
                      <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden sm:inline">Điểm danh</span>
                    </button>

                    {/* Nút Sửa */}
                    <button
                      onClick={() => handleOpenEdit(cls)}
                      className="p-1.5 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                      title="Chỉnh sửa thông tin lớp"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    </button>

                    {/* Nút Xóa Lớp (ConfirmModal xịn) */}
                    <button
                      onClick={() => handleDelete(cls)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Xóa lớp học"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* MODAL THÊM / SỬA LỚP HỌC (Không bao giờ tràn màn hình) */}
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
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-800">
                    {editingClass ? `Cập Nhật Lớp: ${editingClass.name}` : 'Mở Lớp Học Mới'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingClass ? 'Điều chỉnh lịch học, phòng học và mức học phí' : 'Thiết lập thông tin khóa học chuẩn bị tuyển sinh'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên lớp học *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Tiếng Anh Nhí - Starters 1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-bold text-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã lớp</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cấp độ / Trình độ</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold text-slate-800 text-xs"
                  >
                    <option value="Starters (6-7 tuổi)">Starters (6-7 tuổi)</option>
                    <option value="Movers (8-9 tuổi)">Movers (8-9 tuổi)</option>
                    <option value="Flyers (10-11 tuổi)">Flyers (10-11 tuổi)</option>
                    <option value="IELTS Foundation (12-14 tuổi)">IELTS Foundation (12-14 tuổi)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hình thức học phí</label>
                  <select
                    value={formData.tuition_type}
                    onChange={(e) => setFormData({ ...formData, tuition_type: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-semibold text-slate-800 text-xs"
                  >
                    <option value="monthly">Theo tháng cố định</option>
                    <option value="per_lesson">Theo số buổi học</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mức học phí (VNĐ)</label>
                  <input
                    type="number"
                    step="50000"
                    value={formData.tuition_amount}
                    onChange={(e) => setFormData({ ...formData, tuition_amount: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-black text-brand-600 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lịch học hàng tuần</label>
                <input
                  type="text"
                  value={formData.schedule_note}
                  onChange={(e) => setFormData({ ...formData, schedule_note: e.target.value })}
                  placeholder="Ví dụ: Thứ 3 & Thứ 5 (17:30 - 19:00)"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phòng học</label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  placeholder="Ví dụ: Phòng 201..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium text-xs"
                />
              </div>

              <div className="pt-3 flex gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingClass ? 'Lưu Thay Đổi' : 'Tạo Lớp Học'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL CHI TIẾT LỚP HỌC & DANH SÁCH HỌC SINH */}
      <ClassDetailModal
        isOpen={!!selectedClassDetail}
        onClose={() => setSelectedClassDetail(null)}
        targetClass={selectedClassDetail}
        students={students}
        onGoToAttendance={() => setActiveTab && setActiveTab('attendance')}
        onGoToTuition={() => setActiveTab && setActiveTab('tuition')}
      />

    </div>
  );
}
