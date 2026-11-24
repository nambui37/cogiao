import React, { useState } from 'react';
import { 
  Bell, 
  Check, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Megaphone, 
  Sparkles, 
  X,
  Plus
} from 'lucide-react';

export const initialNotifications = [
  {
    id: 1,
    type: 'payment',
    title: 'Học phí chuyển khoản thành công',
    message: 'Phụ huynh bé Bảo An đã chuyển khoản 850.000đ học phí tháng 11 qua VietQR MB Bank.',
    time: '15 phút trước',
    read: false,
    icon: CreditCard,
    color: 'text-emerald-600 bg-emerald-50'
  },
  {
    id: 2,
    type: 'attendance',
    title: 'Báo nghỉ phép buổi học',
    message: 'Mẹ bé Minh Khôi gửi tin nhắn xin phép nghỉ buổi học ngày Thứ 5 (đi khám bệnh).',
    time: '1 giờ trước',
    read: false,
    icon: Clock,
    color: 'text-amber-600 bg-amber-50'
  },
  {
    id: 3,
    type: 'reminder',
    title: 'Nhắc nhở học phí đến hạn',
    message: 'Còn 3 học sinh lớp Movers 2 chưa đóng học phí tháng 11 (Hạn nộp: 15/11).',
    time: '3 giờ trước',
    read: false,
    icon: Bell,
    color: 'text-brand-600 bg-brand-50'
  },
  {
    id: 4,
    type: 'account',
    title: 'Đã cấp tài khoản phụ huynh mới',
    message: 'Đã cấp tài khoản cho Chị Mai Lan (SĐT: 0988111222) kèm 2 học sinh liên kết.',
    time: 'Hôm qua',
    read: true,
    icon: CheckCircle2,
    color: 'text-indigo-600 bg-indigo-50'
  }
];

export default function NotificationDropdown({ notifications, setNotifications, onOpenCreateAnnouncement }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleItemClick = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const filtered = filter === 'unread' 
    ? notifications.filter(n => !n.read) 
    : notifications;

  return (
    <div className="relative">
      
      {/* Bell Button (Nhỏ gọn) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 border border-slate-200/80 transition-colors cursor-pointer"
        title="Thông báo hệ thống"
      >
        <Bell className="w-3.5 h-3.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop to close */}
          <div 
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-2xs sm:bg-transparent" 
            onClick={() => setIsOpen(false)}
          ></div>

          <div className="fixed left-3 right-3 top-14 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-scale-up">
            
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-300" />
                <h3 className="font-extrabold text-sm tracking-tight">Trung Tâm Thông Báo</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {unreadCount} mới
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-brand-200 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <Check className="w-3 h-3" /> Đã đọc
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors sm:hidden"
                  title="Đóng"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs & Quick Action */}
            <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
              <div className="flex gap-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                    filter === 'all' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Tất cả ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                    filter === 'unread' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Chưa đọc ({unreadCount})
                </button>
              </div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  if (onOpenCreateAnnouncement) onOpenCreateAnnouncement();
                }}
                className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-colors"
                title="Tạo thông báo gửi cả lớp"
              >
                <Plus className="w-3 h-3" /> Soạn tin
              </button>
            </div>

            {/* Notification List */}
            <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  🎉 Không có thông báo nào cần xử lý.
                </div>
              ) : (
                filtered.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3 cursor-pointer ${
                        !item.read ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-xs ${!item.read ? 'font-extrabold text-slate-900' : 'font-semibold text-slate-700'}`}>
                            {item.title}
                          </h4>
                          {!item.read && (
                            <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0"></span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                          {item.message}
                        </p>

                        <span className="text-[10px] text-slate-400 font-medium block">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </>
      )}

    </div>
  );
}
