import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  QrCode, 
  Building2, 
  Phone, 
  Check, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Mail, 
  Smartphone 
} from 'lucide-react';
import { api } from '../services/api';

export default function SettingsPage({ showToast }) {
  // Settings for Bank & Center
  const [settings, setSettings] = useState({
    bank_name: 'MB',
    bank_account: '0912345678',
    bank_owner: 'NGUYEN THI THUY',
    center_name: 'Thủy English Center',
    center_hotline: '0912 345 678',
    center_address: 'Số 18 Ngõ 42 Phố Vọng, Hai Bà Trưng, Hà Nội'
  });

  // Settings for Admin Account & Password
  const [adminProfile, setAdminProfile] = useState({
    full_name: 'Cô Thủy (Teacher & Admin)',
    phone: '0912345678',
    email: 'cothuy.english@gmail.com',
    password: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savedSettings, setSavedSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsRes, profileRes] = await Promise.allSettled([
        api.get('/admin/settings'),
        api.get('/admin/profile')
      ]);

      if (settingsRes.status === 'fulfilled' && settingsRes.value) {
        setSettings(settingsRes.value);
      }

      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setAdminProfile(prev => ({
          ...prev,
          full_name: profileRes.value.full_name || prev.full_name,
          phone: profileRes.value.phone || prev.phone,
          email: profileRes.value.email || prev.email,
          password: ''
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Submit Update Admin Profile & Password
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!adminProfile.phone.trim()) {
      if (showToast) showToast('Số điện thoại đăng nhập không được để trống!', 'error');
      return;
    }

    if (adminProfile.password) {
      if (adminProfile.password.length < 3) {
        if (showToast) showToast('Mật khẩu mới quá ngắn, tối thiểu 3 ký tự!', 'error');
        return;
      }
      if (adminProfile.password !== confirmPassword) {
        if (showToast) showToast('Mật khẩu xác nhận không khớp, vui lòng kiểm tra lại!', 'error');
        return;
      }
    }

    try {
      setSavingProfile(true);
      const res = await api.put('/admin/profile', {
        full_name: adminProfile.full_name,
        phone: adminProfile.phone,
        email: adminProfile.email,
        password: adminProfile.password || undefined
      });

      // Update localStorage so Navbar reflects any name changes
      try {
        const savedUserStr = localStorage.getItem('thuy_auth_user_v2');
        if (savedUserStr) {
          const u = JSON.parse(savedUserStr);
          const updated = { ...u, full_name: adminProfile.full_name, phone: adminProfile.phone };
          localStorage.setItem('thuy_auth_user_v2', JSON.stringify(updated));
        }
      } catch {}

      setSavedProfile(true);
      if (showToast) showToast('Đã cập nhật tài khoản đăng nhập và mật khẩu Cô Thủy thành công!', 'success');
      setAdminProfile(prev => ({ ...prev, password: '' }));
      setConfirmPassword('');
      setTimeout(() => setSavedProfile(false), 2500);
    } catch (err) {
      if (showToast) showToast(err.message || 'Lỗi khi cập nhật tài khoản', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // 2. Submit Update Bank & Center Settings
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      await api.put('/admin/settings', settings);
      setSavedSettings(true);
      if (showToast) showToast('Đã lưu cấu hình cổng VietQR và trung tâm!', 'success');
      setTimeout(() => setSavedSettings(false), 2500);
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-16">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-brand-600" />
          Cài Đặt Hệ Thống & Bảo Mật
        </h1>
        <p className="text-sm text-slate-500">
          Quản lý tài khoản đăng nhập, đổi mật khẩu cô giáo và cấu hình thông tin ngân hàng VietQR
        </p>
      </div>

      {/* KHỐI 1: TÀI KHOẢN QUẢN TRỊ & MẬT KHẨU CÔ THỦY */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-brand-600 border border-brand-100">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <span>Tài Khoản Đăng Nhập & Mật Khẩu (Cô Thủy)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-brand-100 text-brand-700 font-extrabold uppercase">
                  Admin
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Thay đổi số điện thoại đăng nhập và mật khẩu cá nhân của cô giáo
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Tên hiển thị */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên hiển thị cô giáo *
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={adminProfile.full_name}
                  onChange={(e) => setAdminProfile({ ...adminProfile, full_name: e.target.value })}
                  placeholder="Ví dụ: Cô Thủy"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* SĐT đăng nhập */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số điện thoại đăng nhập (Tài khoản) *
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={adminProfile.phone}
                  onChange={(e) => setAdminProfile({ ...adminProfile, phone: e.target.value })}
                  placeholder="0912345678"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold text-brand-600 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Email liên hệ */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email nhận báo cáo / sao lưu
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={adminProfile.email}
                  onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                  placeholder="cothuy.english@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

          </div>

          {/* Đổi mật khẩu mới */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <span>Đổi Mật Khẩu Đăng Nhập (Để trống nếu không muốn đổi)</span>
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] font-semibold text-slate-400 hover:text-brand-600 flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Mật khẩu mới</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminProfile.password}
                    onChange={(e) => setAdminProfile({ ...adminProfile, password: e.target.value })}
                    placeholder="Nhập mật khẩu mới..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Nút lưu tài khoản & mật khẩu */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all disabled:opacity-60"
            >
              {savedProfile ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Đã đổi thông tin thành công!</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{savingProfile ? 'Đang lưu...' : 'Lưu Thay Đổi Tài Khoản & Mật Khẩu'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* KHỐI 2: TÀI KHOẢN NGÂN HÀNG VIETQR */}
      <form onSubmit={handleSettingsSubmit} className="space-y-6">
        
        {/* Box VietQR Bank Configuration */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Tài Khoản Ngân Hàng Nhận Học Phí (VietQR)</h3>
              <p className="text-xs text-slate-400">Mã QR trên hóa đơn sẽ tự động dùng thông tin này để nhận tiền</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ngân hàng nhận tiền *</label>
              <select
                value={settings.bank_name}
                onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-brand-500"
              >
                <option value="MB">MB Bank (Quân Đội)</option>
                <option value="VCB">Vietcombank</option>
                <option value="TCB">Techcombank</option>
                <option value="CTG">VietinBank</option>
                <option value="BIDV">BIDV</option>
                <option value="ACB">ACB</option>
                <option value="VPB">VPBank</option>
                <option value="TPB">TPBank</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số tài khoản ngân hàng *</label>
              <input
                type="text"
                required
                value={settings.bank_account}
                onChange={(e) => setSettings({ ...settings, bank_account: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold text-brand-600 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên chủ tài khoản (In hoa không dấu) *</label>
              <input
                type="text"
                required
                value={settings.bank_owner}
                onChange={(e) => setSettings({ ...settings, bank_owner: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold uppercase focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Box Center Information */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Thông Tin Trung Tâm & Giáo Viên</h3>
              <p className="text-xs text-slate-400">Hiển thị trên thông báo và tin nhắn gửi tới phụ huynh</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên trung tâm / Lớp học</label>
              <input
                type="text"
                value={settings.center_name}
                onChange={(e) => setSettings({ ...settings, center_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hotline / Zalo liên hệ</label>
              <input
                type="text"
                value={settings.center_hotline}
                onChange={(e) => setSettings({ ...settings, center_hotline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-brand-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Địa chỉ lớp học</label>
            <input
              type="text"
              value={settings.center_address}
              onChange={(e) => setSettings({ ...settings, center_address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={savingSettings}
            className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all disabled:opacity-60"
          >
            {savedSettings ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Đã lưu cài đặt VietQR!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{savingSettings ? 'Đang lưu...' : 'Lưu Thông Tin Cổng VietQR & Trung Tâm'}</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
