import React, { useState } from 'react';
import { GraduationCap, Lock, Phone, UserCheck, Smartphone, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { api } from '../services/api';

export default function LoginPage({ onLoginSuccess, onClose, isModal = false }) {
  const [loginRole, setLoginRole] = useState('admin'); // 'admin' | 'parent'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleTabChange = (role) => {
    setLoginRole(role);
    setError('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Vui lòng nhập đầy đủ số điện thoại và mật khẩu');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/auth/login', {
        identifier: identifier.trim(),
        password,
        role: loginRole
      });
      onLoginSuccess(res.user, res.token, res.children);
    } catch (err) {
      setError(err.message || 'Số điện thoại hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div 
      className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-scale-up relative"
      onClick={(e) => e.stopPropagation()}
    >
      
      {/* Close button if onClose is provided */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
          title="Đóng về trang chủ"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header Branding */}
      <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 p-8 text-white text-center relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/30">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1">Thủy English</h1>
          <p className="text-xs text-brand-100 font-medium">Hệ thống Quản lý Dạy học & Cổng Phụ Huynh</p>
        </div>

        <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10 blur-xl"></div>
      </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Tab chọn vai trò */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => handleRoleTabChange('admin')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                loginRole === 'admin' 
                  ? 'bg-white text-brand-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Cô Thủy (Admin)</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabChange('parent')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                loginRole === 'parent' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Phụ Huynh Học Sinh</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {loginRole === 'admin' ? 'Email hoặc Số điện thoại' : 'Số điện thoại đăng nhập'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Nhập số điện thoại..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Mật khẩu</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                loginRole === 'admin'
                  ? 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/25'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
              }`}
            >
              {loading ? (
                <span>Đang xử lý...</span>
              ) : (
                <>
                  <span>Đăng Nhập Ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Hệ thống bảo mật dữ liệu học tập Thủy English</span>
          </div>

        </div>

      </div>
  );

  if (isModal) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      >
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-4">
      {onClose && (
        <button
          onClick={onClose}
          className="mb-4 text-xs font-bold text-slate-500 hover:text-brand-600 flex items-center gap-1 bg-white px-3.5 py-2 rounded-xl shadow-xs border border-slate-200 transition-all cursor-pointer"
        >
          <span>&larr; Quay lại Trang Chủ</span>
        </button>
      )}
      {content}
    </div>
  );
}
