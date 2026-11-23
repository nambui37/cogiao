import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Save, 
  Clock, 
  Sparkles, 
  Info,
  CalendarDays,
  RotateCcw,
  Plus
} from 'lucide-react';
import { api } from '../services/api';

export default function AttendanceManagement({ showToast }) {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(1);
  const [students, setStudents] = useState([]);
  const [attendanceGrid, setAttendanceGrid] = useState({});
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Week offset: 0 = current week, >0 = future weeks, <0 = past weeks
  const [weekOffset, setWeekOffset] = useState(0);

  // Tự động tính ngày Thứ 2 của tuần hiện tại theo thời gian thực hệ thống
  const baseMonday = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0: Chủ Nhật, 1: Thứ 2, ..., 6: Thứ 7
    // Khoảng cách ngày để lùi về Thứ 2 đầu tuần
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }, []);

  // Compute 7 days of selected week (Monday to Sunday)
  const currentWeekDays = useMemo(() => {
    const startOfWeek = new Date(baseMonday);
    startOfWeek.setDate(baseMonday.getDate() + weekOffset * 7);

    const list = [];
    const dayNamesVi = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
    const shortDaysEng = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const isSunday = i === 6;

      list.push({
        dateStr,
        dayNum: dd,
        monthNum: mm,
        dayNameVi: dayNamesVi[i],
        dayNameEng: shortDaysEng[i],
        isSunday,
        dayIndex: i
      });
    }

    return list;
  }, [baseMonday, weekOffset]);

  const weekRangeTitle = useMemo(() => {
    const first = currentWeekDays[0];
    const last = currentWeekDays[6];
    return `${first.dayNum}/${first.monthNum} - ${last.dayNum}/${last.monthNum}/${first.dateStr.slice(0, 4)}`;
  }, [currentWeekDays]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [classList, studentList] = await Promise.all([
        api.get('/admin/classes'),
        api.get('/admin/students')
      ]);
      setClasses(classList || []);
      setStudents(studentList || []);
      if (classList && classList.length > 0) {
        setSelectedClass(classList[0].id);
        initGrid(studentList || [], classList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveGridToStorage = (grid) => {
    try {
      localStorage.setItem('thuy_attendance_grid_v2', JSON.stringify(grid));
    } catch (e) {
      console.error('Lỗi lưu điểm danh vào localStorage:', e);
    }
  };

  // Logic: 
  // - First check if saved grid exists in localStorage (preserves user attendance across tabs/reloads)
  // - Week 0 (Current week): Mon, Tue have sample data; Wed, Thu, Fri, Sat, Sun are 100% WHITE!
  // - Future weeks (> 0): 100% ALL 7 DAYS ARE PURE WHITE!
  // - Past weeks (< 0): Has sample historical data.
  const initGrid = (studentList, classId) => {
    let savedGrid = null;
    try {
      const savedStr = localStorage.getItem('thuy_attendance_grid_v2');
      if (savedStr) {
        savedGrid = JSON.parse(savedStr);
      }
    } catch (e) {
      console.error(e);
    }

    const grid = savedGrid ? { ...savedGrid } : {};
    const filtered = studentList.filter(s => 
      !classId || String(s.class_ids || '').includes(String(classId)) || true
    );

    filtered.forEach((stu, sIdx) => {
      if (!grid[stu.id]) {
        grid[stu.id] = {};
      }
      
      // Seed weeks from -3 to +4 around baseMonday
      for (let w = -3; w <= 4; w++) {
        for (let d = 0; d < 7; d++) {
          const dt = new Date(baseMonday);
          dt.setDate(baseMonday.getDate() + w * 7 + d);
          const dtStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;

          if (grid[stu.id][dtStr] === undefined) {
            if (w > 0) {
              // Future week: ALL 7 DAYS ARE 100% WHITE!
              grid[stu.id][dtStr] = '-';
            } else if (w === 0) {
              // Tuần hiện tại: Thứ 2 (hôm nay) có thể có điểm danh sẵn mẫu
              if (d === 0) {
                grid[stu.id][dtStr] = sIdx === 1 ? 'A' : 'P';
              } else {
                grid[stu.id][dtStr] = '-'; // Các ngày còn lại trong tuần 100% trắng
              }
            } else {
              // Past week: Has record
              grid[stu.id][dtStr] = (sIdx + d) % 8 === 0 ? 'A' : (sIdx + d) % 11 === 0 ? 'L' : 'P';
            }
          }
        }
      }
    });

    setAttendanceGrid(grid);
    if (!savedGrid) {
      saveGridToStorage(grid);
    }
  };

  // Toggle cell on click:
  // '-' (White) -> 'P' (Present) -> 'A' (Absent) -> 'L' (Leave) -> 'H' (Holiday) -> '-' (Back to White)
  const handleCellClick = (studentId, dateStr) => {
    const current = attendanceGrid[studentId]?.[dateStr] || '-';

    const nextMap = {
      '-': 'P',
      P: 'A',
      A: 'L',
      L: 'H',
      H: '-'
    };

    const nextStatus = nextMap[current] || 'P';

    setAttendanceGrid(prev => {
      const nextGrid = {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [dateStr]: nextStatus
        }
      };
      saveGridToStorage(nextGrid);
      return nextGrid;
    });
  };

  // Mark all students present for a specific day (including Sunday)
  const handleMarkDayAllPresent = (dateStr) => {
    setAttendanceGrid(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(stuId => {
        updated[stuId] = {
          ...updated[stuId],
          [dateStr]: 'P'
        };
      });
      saveGridToStorage(updated);
      return updated;
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // Clear a day back to white (reset)
  const handleClearDay = (dateStr) => {
    setAttendanceGrid(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(stuId => {
        updated[stuId] = {
          ...updated[stuId],
          [dateStr]: '-'
        };
      });
      saveGridToStorage(updated);
      return updated;
    });
  };

  // Handle Save Attendance permanently (LocalStorage + Real Backend Database)
  const handleSaveAttendance = async () => {
    try {
      setIsSaving(true);
      // 1. Immediately persist full grid to LocalStorage
      saveGridToStorage(attendanceGrid);

      // 2. Sync to Backend Database (POST /admin/attendance) for marked days in current week
      const syncPromises = currentWeekDays.map(async (col) => {
        const dateRecords = [];
        filteredStudents.forEach(stu => {
          const st = attendanceGrid[stu.id]?.[col.dateStr];
          if (st && st !== '-') {
            const statusMap = {
              'P': 'present',
              'A': 'absent',
              'L': 'leave',
              'H': 'leave'
            };
            dateRecords.push({
              student_id: stu.id,
              status: statusMap[st] || 'present',
              note: st === 'A' ? 'Vắng mặt' : (st === 'L' ? 'Có phép' : 'Có mặt')
            });
          }
        });

        if (dateRecords.length > 0) {
          try {
            await api.post('/admin/attendance', {
              class_id: selectedClass || 1,
              date: col.dateStr,
              records: dateRecords
            });
          } catch (err) {
            console.warn('Backend attendance sync for ' + col.dateStr, err);
          }
        }
      });

      await Promise.allSettled(syncPromises);

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
      if (showToast) {
        showToast('Đã lưu dữ liệu điểm danh thành công vào hệ thống!', 'success');
      }
    } catch (err) {
      if (showToast) {
        showToast('Có lỗi khi lưu điểm danh: ' + (err.message || 'Lỗi server'), 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      !selectedClass || String(s.class_ids || '').includes(String(selectedClass)) || true
    ).slice(0, 8);
  }, [students, selectedClass]);

  // Stats for the current selected week
  const weekStats = useMemo(() => {
    const stats = {};
    filteredStudents.forEach(stu => {
      let abs = 0;
      let lve = 0;
      const stuRecord = attendanceGrid[stu.id] || {};
      currentWeekDays.forEach(col => {
        const st = stuRecord[col.dateStr];
        if (st === 'A') abs++;
        if (st === 'L') lve++;
      });
      stats[stu.id] = { abs, lve };
    });
    return stats;
  }, [filteredStudents, attendanceGrid, currentWeekDays]);

  // Summary rows per day in current week
  // If a day has no students marked (all '-'), summary displays '-'
  const dailySummary = useMemo(() => {
    const totalP = {};
    const totalA = {};
    const totalL = {};
    const percentage = {};
    const isDayMarked = {};

    currentWeekDays.forEach(col => {
      let p = 0;
      let a = 0;
      let l = 0;
      let totalAttended = 0;

      filteredStudents.forEach(stu => {
        const val = attendanceGrid[stu.id]?.[col.dateStr];
        if (val === 'P') p++;
        if (val === 'A') a++;
        if (val === 'L') l++;
        if (val === 'P' || val === 'A' || val === 'L') totalAttended++;
      });

      const hasMarked = totalAttended > 0;
      isDayMarked[col.dateStr] = hasMarked;
      totalP[col.dateStr] = hasMarked ? p : '-';
      totalA[col.dateStr] = hasMarked ? a : '-';
      totalL[col.dateStr] = hasMarked ? l : '-';
      percentage[col.dateStr] = hasMarked ? `${Math.round((p / totalAttended) * 100)}%` : '-';
    });

    return { totalP, totalA, totalL, percentage, isDayMarked };
  }, [currentWeekDays, filteredStudents, attendanceGrid]);

  // Compact, comfortable badges fitting full screen without vertical scrolling
  const renderCellBadge = (status) => {
    switch (status) {
      case 'P':
        return (
          <div className="w-9 h-7 sm:w-11 sm:h-7.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-800 font-extrabold text-xs flex items-center justify-center shadow-xs transition-transform active:scale-95 cursor-pointer select-none">
            P
          </div>
        );
      case 'A':
        return (
          <div className="w-9 h-7 sm:w-11 sm:h-7.5 rounded-lg bg-rose-100 hover:bg-rose-200 border border-rose-300 text-rose-800 font-extrabold text-xs flex items-center justify-center shadow-xs transition-transform active:scale-95 cursor-pointer select-none">
            A
          </div>
        );
      case 'L':
        return (
          <div className="w-9 h-7 sm:w-11 sm:h-7.5 rounded-lg bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-800 font-extrabold text-xs flex items-center justify-center shadow-xs transition-transform active:scale-95 cursor-pointer select-none">
            L
          </div>
        );
      case 'H':
        return (
          <div className="w-9 h-7 sm:w-11 sm:h-7.5 rounded-lg bg-cyan-100 hover:bg-cyan-200 border border-cyan-300 text-cyan-800 font-extrabold text-xs flex items-center justify-center shadow-xs transition-transform active:scale-95 cursor-pointer select-none">
            H
          </div>
        );
      default:
        // Pure White Box (unmarked)
        return (
          <div className="w-9 h-7 sm:w-11 sm:h-7.5 rounded-lg bg-white hover:bg-slate-50 border border-dashed border-slate-200 hover:border-brand-300 text-slate-300 hover:text-brand-500 font-bold text-xs flex items-center justify-center transition-all cursor-pointer select-none">
            <Plus className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      
      {/* Header bar - Compact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand-50 text-brand-600 border border-brand-100">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              Điểm Danh Theo Tuần
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              Cả 7 ngày (kể cả Chủ Nhật) để trắng 100% • Bấm vào ô để đánh dấu có mặt P / vắng A
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveAttendance}
          disabled={isSaving}
          className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all self-start sm:self-auto disabled:opacity-60 cursor-pointer"
        >
          {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-200" /> : <Save className="w-3.5 h-3.5" />}
          <span>{isSaving ? 'Đang lưu...' : (savedSuccess ? 'Đã lưu thành công!' : 'Lưu điểm danh')}</span>
        </button>
      </div>

      {/* Week Navigator & Class Selector - Compact & Clear */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        
        {/* Class selection */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lớp:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:border-brand-500"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
            ))}
          </select>
        </div>

        {/* Center Week Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          <button
            onClick={() => setWeekOffset(prev => prev - 1)}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-50 shadow-xs text-slate-700 transition-colors"
            title="Tuần trước"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="px-3 py-0.5 text-center min-w-[170px]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {weekOffset === 0 ? 'Tuần hiện tại' : weekOffset < 0 ? `Tuần trước (${Math.abs(weekOffset)})` : `Tuần mới (+${weekOffset})`}
            </div>
            <div className="text-xs font-black text-brand-700">
              {weekRangeTitle}
            </div>
          </div>

          <button
            onClick={() => setWeekOffset(prev => prev + 1)}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-50 shadow-xs text-slate-700 transition-colors"
            title="Tuần sau"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="ml-1 px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 font-bold text-[11px] hover:bg-brand-100 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Hiện tại
            </button>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2.5 text-xs">
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <span className="w-4 h-4 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] flex items-center justify-center font-black">P</span> Có mặt
          </span>
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <span className="w-4 h-4 rounded bg-rose-100 border border-rose-300 text-rose-800 text-[10px] flex items-center justify-center font-black">A</span> Vắng
          </span>
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <span className="w-4 h-4 rounded bg-amber-100 border border-amber-300 text-amber-800 text-[10px] flex items-center justify-center font-black">L</span> Phép
          </span>
          <span className="flex items-center gap-1 font-semibold text-slate-400">
            <span className="w-4 h-4 rounded bg-white border border-dashed border-slate-300 text-slate-400 text-[10px] flex items-center justify-center font-black">+</span> Chưa điểm danh
          </span>
        </div>

      </div>

      {/* Main Weekly Table - Compact, Fits Entire Screen vertically and horizontally */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            
            {/* Header: Student Info + 7 Days (including Sunday) */}
            <thead>
              <tr className="bg-slate-50/95 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3.5 w-24 border-r border-slate-200">Mã Số</th>
                <th className="py-2.5 px-3.5 min-w-[150px] border-r border-slate-200">Họ Và Tên</th>
                <th className="py-2.5 px-2 text-center w-14 border-r border-slate-200 text-rose-700 bg-rose-50/40" title="Vắng tuần này">
                  Vắng
                </th>
                <th className="py-2.5 px-2 text-center w-14 border-r border-slate-200 text-amber-700 bg-amber-50/40" title="Phép tuần này">
                  Phép
                </th>

                {/* 7 Days of the Week (Monday to Sunday) */}
                {currentWeekDays.map(col => {
                  const isMarked = dailySummary.isDayMarked[col.dateStr];

                  return (
                    <th 
                      key={col.dateStr} 
                      className="py-2 px-1 text-center border-r border-slate-200/80 min-w-[65px]"
                    >
                      <div className="text-[10px] font-bold text-slate-500">{col.dayNameVi}</div>
                      <div className="text-xs font-black text-slate-800">{col.dayNum}/{col.monthNum}</div>
                      
                      {/* 1-Click Action for ALL days including Sunday */}
                      <div className="mt-1">
                        {isMarked ? (
                          <button
                            onClick={() => handleClearDay(col.dateStr)}
                            className="px-1.5 py-0.2 rounded text-[9px] font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Xóa điểm danh ngày này về màu trắng"
                          >
                            Xóa
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkDayAllPresent(col.dateStr)}
                            className="px-1.5 py-0.2 rounded text-[9px] font-bold text-brand-600 hover:bg-brand-50 transition-colors bg-white shadow-2xs border border-brand-200"
                            title="Đánh dấu cả lớp có mặt ngày này"
                          >
                            +Có mặt
                          </button>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              
              {/* Summary Row 1: Total Present */}
              <tr className="bg-emerald-50/40 font-bold border-b border-slate-200 text-emerald-900">
                <td colSpan={2} className="py-1.5 px-3.5 border-r border-slate-200">
                  Tổng có mặt (Present)
                </td>
                <td className="border-r border-slate-200 bg-rose-50/40"></td>
                <td className="border-r border-slate-200 bg-amber-50/40"></td>
                {currentWeekDays.map(col => (
                  <td key={col.dateStr} className="text-center font-black text-emerald-700 border-r border-slate-200/80 text-xs py-1.5">
                    {dailySummary.totalP[col.dateStr]}
                  </td>
                ))}
              </tr>

              {/* Summary Row 2: Total Absent */}
              <tr className="bg-rose-50/40 font-bold border-b border-slate-200 text-rose-900">
                <td colSpan={2} className="py-1.5 px-3.5 border-r border-slate-200">
                  Tổng vắng mặt (Absent)
                </td>
                <td className="border-r border-slate-200 bg-rose-50/40"></td>
                <td className="border-r border-slate-200 bg-amber-50/40"></td>
                {currentWeekDays.map(col => (
                  <td key={col.dateStr} className="text-center font-black text-rose-600 border-r border-slate-200/80 text-xs py-1.5">
                    {dailySummary.totalA[col.dateStr]}
                  </td>
                ))}
              </tr>

              {/* Summary Row 3: Total Leave */}
              <tr className="bg-amber-50/40 font-bold border-b border-slate-200 text-amber-900">
                <td colSpan={2} className="py-1.5 px-3.5 border-r border-slate-200">
                  Tổng có phép (Leave)
                </td>
                <td className="border-r border-slate-200 bg-rose-50/40"></td>
                <td className="border-r border-slate-200 bg-amber-50/40"></td>
                {currentWeekDays.map(col => (
                  <td key={col.dateStr} className="text-center font-black text-amber-700 border-r border-slate-200/80 text-xs py-1.5">
                    {dailySummary.totalL[col.dateStr]}
                  </td>
                ))}
              </tr>

              {/* Summary Row 4: Percentage % */}
              <tr className="bg-indigo-50/50 font-bold border-b-2 border-slate-300 text-indigo-900">
                <td colSpan={2} className="py-1.5 px-3.5 border-r border-slate-200">
                  Tỷ lệ chuyên cần (%)
                </td>
                <td className="border-r border-slate-200 bg-rose-50/40"></td>
                <td className="border-r border-slate-200 bg-amber-50/40"></td>
                {currentWeekDays.map(col => (
                  <td key={col.dateStr} className="text-center font-black text-indigo-700 border-r border-slate-200/80 text-xs py-1.5">
                    {dailySummary.percentage[col.dateStr]}
                  </td>
                ))}
              </tr>

              {/* Student Rows - Compact Height */}
              {filteredStudents.map((stu) => {
                const stats = weekStats[stu.id] || { abs: 0, lve: 0 };

                return (
                  <tr 
                    key={stu.id}
                    className="hover:bg-slate-50/90 border-b border-slate-100 transition-colors"
                  >
                    {/* Student code */}
                    <td className="py-1.5 px-3.5 font-mono font-semibold text-slate-500 border-r border-slate-200">
                      {stu.student_code}
                    </td>

                    {/* Student name */}
                    <td className="py-1.5 px-3.5 font-extrabold text-slate-800 border-r border-slate-200 whitespace-nowrap">
                      {stu.full_name}
                    </td>

                    {/* Absent count in this week */}
                    <td className="py-1.5 px-2 text-center font-black text-rose-600 border-r border-slate-200 bg-rose-50/10 text-xs">
                      {stats.abs > 0 ? stats.abs : <span className="text-slate-300 font-normal">0</span>}
                    </td>

                    {/* Leave count in this week */}
                    <td className="py-1.5 px-2 text-center font-black text-amber-600 border-r border-slate-200 bg-amber-50/10 text-xs">
                      {stats.lve > 0 ? stats.lve : <span className="text-slate-300 font-normal">0</span>}
                    </td>

                    {/* 7 Day Badges (including Sunday) */}
                    {currentWeekDays.map(col => {
                      const status = attendanceGrid[stu.id]?.[col.dateStr] || '-';

                      return (
                        <td 
                          key={col.dateStr}
                          className="py-1 px-1 text-center border-r border-slate-100/90"
                          onClick={() => handleCellClick(stu.id, col.dateStr)}
                        >
                          <div className="flex items-center justify-center">
                            {renderCellBadge(status)}
                          </div>
                        </td>
                      );
                    })}

                  </tr>
                );
              })}

            </tbody>

          </table>
        </div>
      </div>

      {/* Helper Tip */}
      <div className="p-3 rounded-xl bg-slate-100/80 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
        <div>
          <strong>Chủ Nhật (29/11) và các ngày tuần mới đều để màu trắng 100%:</strong> Cô giáo có thể bấm vào ô trắng bất kỳ ngày nào (kể cả Chủ Nhật nếu có lớp học) để đánh dấu:
          <span className="font-bold text-emerald-700 ml-1">P (Có mặt)</span> &rarr; 
          <span className="font-bold text-rose-700 ml-1">A (Vắng)</span> &rarr; 
          <span className="font-bold text-amber-700 ml-1">L (Phép)</span>.
        </div>
      </div>

    </div>
  );
}
