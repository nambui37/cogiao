import React from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  CheckCircle2, 
  CreditCard, 
  Smartphone, 
  UserCheck, 
  Settings, 
  LogOut, 
  KeyRound,
  Globe
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  role, 
  setRole, 
  currentUser, 
  onLogout,
  onViewLanding,
  onOpenInstallModal,
  notifications,
  setNotifications,
  onOpenCreateAnnouncement
}) {
  const adminNav = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'classes', label: 'Lớp học', icon: BookOpen },
    { id: 'students', label: 'Học sinh', icon: Users },
    { id: 'parents', label: 'Cấp TK Phụ Huynh', icon: KeyRound, badge: 'Mới' },
    { id: 'attendance', label: 'Điểm danh 1-Chạm', icon: CheckCircle2 },
    { id: 'tuition', label: 'Học phí & VietQR', icon: CreditCard },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => setActiveTab(role === 'admin' ? 'dashboard' : 'parent')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
              Thủy English
            </span>
          </div>

          {/* Navigation Links (Admin Only - Bỏ khung viền, nằm tự nhiên thoáng đãng) */}
          {role === 'admin' && (
            <nav className="hidden xl:flex items-center gap-1">
              {adminNav.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-brand-50 text-brand-600 font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50 font-semibold'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] bg-brand-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right section: Notification Bell + Profile Badge + Web Link + Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Notification Bell Dropdown */}
            <NotificationDropdown 
              notifications={notifications || []} 
              setNotifications={setNotifications} 
              onOpenCreateAnnouncement={onOpenCreateAnnouncement}
            />

            {/* Logged in User Profile Badge (Gọn gàng, nhỏ lại) */}
            {role === 'admin' ? (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-xs shadow-2xs">
                <div className="w-5 h-5 rounded-lg bg-brand-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                  T
                </div>
                <div className="leading-tight text-left hidden sm:block">
                  <span className="block font-bold text-slate-800 text-[11px] leading-tight whitespace-nowrap">
                    {currentUser?.full_name ? currentUser.full_name.replace(/\s*\(.*\)/, '') : 'Cô Thủy'}
                  </span>
                  <span className="text-[9px] text-brand-600 font-medium block leading-none">Giáo viên</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-xs shadow-2xs">
                <div className="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                  P
                </div>
                <div className="leading-tight text-left hidden sm:block">
                  <span className="block font-bold text-slate-800 text-[11px] leading-tight whitespace-nowrap">
                    {currentUser?.full_name || 'Phụ Huynh'}
                  </span>
                  <span className="text-[9px] text-emerald-600 font-medium block leading-none">Cổng phụ huynh</span>
                </div>
              </div>
            )}

            {/* View Public Landing Page */}
            {onViewLanding && (
              <button
                onClick={onViewLanding}
                className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 border border-slate-200/80 transition-colors cursor-pointer"
                title="Xem trang giới thiệu bên ngoài"
              >
                <Globe className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Install PWA Mobile Button */}
            {onOpenInstallModal && (
              <button
                onClick={onOpenInstallModal}
                className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 border border-brand-200/80 transition-colors cursor-pointer"
                title="Cài đặt ứng dụng về điện thoại (iOS / Android)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/80 transition-colors cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>

          </div>

        </div>

        {/* Mobile Navigation bar for Admin */}
        {role === 'admin' && (
          <div className="xl:hidden flex items-center justify-between py-2 border-t border-slate-100 overflow-x-auto gap-2">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] font-medium shrink-0 ${
                    isActive ? 'text-brand-600 font-bold' : 'text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

      </div>
    </header>
  );
}
