import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  Users, 
  Award, 
  Clock, 
  ArrowRight, 
  Send, 
  MessageCircle, 
  Calendar, 
  ChevronRight, 
  Star, 
  ShieldCheck, 
  LogIn, 
  Menu, 
  X, 
  Check, 
  Compass, 
  HelpCircle,
  Sparkle,
  Smartphone
} from 'lucide-react';

export default function LandingPage({ onOpenLogin, onOpenInstallModal, showToast }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [consultForm, setConsultForm] = useState({
    parent_name: '',
    phone: '',
    child_info: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleConsultSubmit = (e) => {
    e.preventDefault();
    if (!consultForm.parent_name.trim() || !consultForm.phone.trim()) {
      if (showToast) showToast('Vui lòng nhập họ tên phụ huynh và số điện thoại liên hệ!', 'error');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      if (showToast) showToast('Đăng ký tư vấn thành công! Ms Thủy sẽ liên hệ hỗ trợ phụ huynh sớm nhất.', 'success');
      setConsultForm({ parent_name: '', phone: '', child_info: '', notes: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }, 600);
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // Tránh sticky header 64px che khuất form và tiêu đề
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-brand-500 selection:text-white">
      
      {/* 1. STICKY HEADER (KHÔNG CÒN THANH QUẢNG CÁO PHÍA TRÊN) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer group" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              Thủy English
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-600">
            <button 
              onClick={() => scrollToSection('gioi-thieu')}
              className="hover:text-brand-600 transition-colors cursor-pointer"
            >
              Về Lớp Học
            </button>
            <button 
              onClick={() => scrollToSection('tuyen-sinh')}
              className="hover:text-brand-600 transition-colors flex items-center gap-1.5 cursor-pointer text-brand-600"
            >
              <span>Tuyển Sinh Lớp 6 Tuổi</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            </button>
            <button 
              onClick={() => scrollToSection('lo-trinh')}
              className="hover:text-brand-600 transition-colors cursor-pointer"
            >
              Lộ Trình Học
            </button>
            <button 
              onClick={() => scrollToSection('phuong-phap')}
              className="hover:text-brand-600 transition-colors cursor-pointer"
            >
              Phương Pháp
            </button>
            <button 
              onClick={() => scrollToSection('danh-gia')}
              className="hover:text-brand-600 transition-colors cursor-pointer"
            >
              Cảm Nhận
            </button>
            <button 
              onClick={() => scrollToSection('lien-he')}
              className="hover:text-brand-600 transition-colors cursor-pointer"
            >
              Liên Hệ
            </button>
          </nav>

          {/* Right Action: Zalo Tư Vấn & Nút Đăng Nhập (nhỏ gọn, thanh lịch) */}
          <div className="flex items-center gap-2">
            <a 
              href="https://zalo.me/0904988314"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/70 px-2.5 py-1.5 rounded-xl transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Nhắn Zalo</span>
            </a>

            {/* Nút Cài App về điện thoại */}
            <button
              onClick={onOpenInstallModal}
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200/70 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
              title="Cài đặt ứng dụng về màn hình điện thoại"
            >
              <Smartphone className="w-3.5 h-3.5 text-brand-600" />
              <span>Cài App ĐT</span>
            </button>

            {/* NÚT ĐĂNG NHẬP TRÊN HEADER */}
            <button
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng Nhập</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-3 animate-fade-in shadow-lg">
            <button 
              onClick={() => scrollToSection('gioi-thieu')}
              className="block w-full text-left py-2 text-sm font-bold text-slate-700 hover:text-brand-600"
            >
              Về Lớp Học Cô Thủy
            </button>
            <button 
              onClick={() => scrollToSection('tuyen-sinh')}
              className="block w-full text-left py-2 text-sm font-bold text-brand-600 flex items-center justify-between"
            >
              <span>Tuyển Sinh Lớp 6 Tuổi Mới</span>
              <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-extrabold uppercase">Mới</span>
            </button>
            <button 
              onClick={() => scrollToSection('lo-trinh')}
              className="block w-full text-left py-2 text-sm font-bold text-slate-700 hover:text-brand-600"
            >
              Lộ Trình Học & Các Khóa
            </button>
            <button 
              onClick={() => scrollToSection('phuong-phap')}
              className="block w-full text-left py-2 text-sm font-bold text-slate-700 hover:text-brand-600"
            >
              Phương Pháp & Quyền Lợi
            </button>
            <button 
              onClick={() => scrollToSection('danh-gia')}
              className="block w-full text-left py-2 text-sm font-bold text-slate-700 hover:text-brand-600"
            >
              Cảm Nhận Của Phụ Huynh
            </button>
            <button 
              onClick={() => scrollToSection('lien-he')}
              className="block w-full text-left py-2 text-sm font-bold text-slate-700 hover:text-brand-600"
            >
              Địa Chỉ & Liên Hệ
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onOpenInstallModal?.(); }}
              className="w-full text-left py-2 px-3 rounded-xl text-xs font-bold text-brand-700 bg-brand-50 border border-brand-100 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-brand-600" />
                <span>Cài App Về ĐT (iOS / Android)</span>
              </span>
              <span className="text-[10px] bg-brand-600 text-white px-2 py-0.2 rounded-full font-bold">PWA</span>
            </button>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <a 
                href="https://zalo.me/0904988314" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs font-bold text-blue-600 flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Nhắn Zalo Với Cô</span>
              </a>
              <button
                onClick={onOpenLogin}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng Nhập</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION VỚI HÌNH ẢNH MINH HỌA SỐNG ĐỘNG */}
      <section id="gioi-thieu" className="scroll-mt-24 relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 bg-gradient-to-b from-indigo-50/70 via-purple-50/30 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-brand-200/80 shadow-xs text-xs font-bold text-brand-700">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Khóa Học Tiếng Anh Trẻ Em & Luyện Thi Cambridge</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight sm:leading-tight">
                Khơi Nguồn Đam Mê & Xây Dựng{' '}
                <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Nền Tảng Tiếng Anh Vững Chắc
                </span>{' '}
                Cho Con
              </h1>

              {/* Sub-headline */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Lớp học nhóm nhỏ thân thiện, giáo trình chuẩn Cambridge kết hợp bám sát chương trình trường học. Cô Thủy tận tâm theo sát từng bạn, giúp con tự tin phát âm, phản xạ tự nhiên và yêu thích tiếng Anh mỗi ngày.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={() => scrollToSection('tuyen-sinh')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>Xem Lớp Tuyển Sinh 6 Tuổi</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="https://zalo.me/0904988314"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-sm border border-slate-200/90 shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                  <span>Tư Vấn Trực Tiếp Qua Zalo</span>
                </a>
              </div>

              {/* 4 Feature Badges */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                
                <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-800 text-xs">Sĩ Số Nhỏ</div>
                    <div className="text-[10px] text-slate-500">Linh hoạt nhu cầu</div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-800 text-xs">Theo Sát 100%</div>
                    <div className="text-[10px] text-slate-500">Tiến bộ từng ngày</div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-800 text-xs">Phụ Đạo Free</div>
                    <div className="text-[10px] text-slate-500">Thêm giờ khi cần</div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-800 text-xs">Cổng Phụ Huynh</div>
                    <div className="text-[10px] text-slate-500">Xem điểm danh & QR</div>
                  </div>
                </div>

              </div>

            </div>

            {/* Right Visual Image (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Main Hero Photo: Lớp học trẻ em hào hứng */}
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white relative group">
                  <img 
                    src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80" 
                    alt="Lớp học tiếng Anh trẻ em vui vẻ"
                    className="w-full h-80 sm:h-96 object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                  
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-extrabold text-[10px] uppercase tracking-wider inline-block mb-1">
                      Môi Trường Học Thân Thiện
                    </span>
                    <p className="font-bold text-sm leading-snug">
                      Mỗi buổi học là một niềm vui khám phá từ vựng & giao tiếp tiếng Anh tự tin
                    </p>
                  </div>
                </div>

                {/* Floating Badge 1: Đánh giá phụ huynh */}
                <div className="absolute -top-4 -left-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce-slow">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-black">
                    <Star className="w-5 h-5 fill-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-800">4.9 / 5.0 Điểm</div>
                    <div className="text-[10px] text-slate-500">Phụ huynh tin tưởng</div>
                  </div>
                </div>

                {/* Floating Badge 2: Cambridge Pathway */}
                <div className="absolute -bottom-4 -right-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-black">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-800">Chuẩn Cambridge</div>
                    <div className="text-[10px] text-slate-500">Starters • Movers • Flyers</div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

        {/* Decorative background blurs */}
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-brand-300/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* 3. BÀI TUYỂN SINH LỚP BÉ 6 TUỔI CỦA MS THỦY (THIẾT KẾ ĐẸP, BẢO VỆ SĐT) */}
      <section id="tuyen-sinh" className="scroll-mt-24 py-16 sm:py-24 bg-white relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-brand-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-indigo-800/50">
            
            {/* Background elements */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 space-y-6">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400 text-slate-900 font-black text-xs uppercase tracking-wider shadow-sm">
                <span>📣 THÔNG BÁO TUYỂN SINH MỚI</span>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  ENGLISH CLASS – TUYỂN SINH LỚP HỌC TIẾNG ANH
                </h2>
                <div className="text-amber-300 font-extrabold text-sm sm:text-lg mt-2 flex items-center gap-2">
                  <span>🌟 ĐÁP ỨNG NHU CẦU PHỤ HUYNH, MS THỦY MỞ THÊM LỚP TIẾNG ANH DÀNH CHO BÉ 6 TUỔI</span>
                </div>
              </div>

              {/* Quote Intro */}
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-xs">
                Lớp học dành cho các bé chưa có nền tảng tiếng Anh, giúp con từng bước làm quen với ngôn ngữ mới, xây dựng nền tảng ban đầu và hình thành sự tự tin khi sử dụng tiếng Anh.
              </p>

              {/* Grid 2 Columns: Nội dung bài viết + Ảnh minh họa em bé 6 tuổi */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
                
                {/* Cột trái (7 cols): Mục tiêu & Theo sát */}
                <div className="lg:col-span-7 space-y-5">
                  
                  {/* Mục tiêu của lớp học */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2.5">
                    <h3 className="text-amber-300 font-bold text-base flex items-center gap-2">
                      <span>💛 MỤC TIÊU CỦA LỚP HỌC</span>
                    </h3>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      Không chỉ giúp con làm quen với những từ vựng và mẫu câu đầu tiên, lớp học hướng đến việc tạo hứng thú học tập, phát triển khả năng sử dụng ngôn ngữ và chuẩn bị nền tảng cho những cấp độ học tập tiếp theo.
                    </p>
                  </div>

                  {/* Theo sát quá trình học tập */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                    <h3 className="text-emerald-300 font-bold text-base flex items-center gap-2">
                      <span>📚 THEO SÁT QUÁ TRÌNH HỌC TẬP</span>
                    </h3>
                    <ul className="text-slate-300 text-xs sm:text-sm space-y-2.5">
                      <li className="flex items-start gap-2.5">
                        <span className="text-emerald-400 font-black text-sm">📌</span>
                        <span>Theo dõi tình hình học tập và sự tiến bộ của từng bé.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-emerald-400 font-black text-sm">📌</span>
                        <span>Hỗ trợ thêm tài liệu và bài tập tự học tại nhà miễn phí để bé ôn tập và củng cố kiến thức theo chương trình tiếng Anh ở trường.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-emerald-400 font-black text-sm">📌</span>
                        <span>Hỗ trợ phụ đạo thêm giờ khi cần thiết, giúp bé có thêm thời gian luyện tập và củng cố những nội dung chưa nắm vững.</span>
                      </li>
                    </ul>
                  </div>

                </div>

                {/* Cột phải (5 cols): Ảnh minh họa bé 6 tuổi + Khung thông tin lớp học */}
                <div className="lg:col-span-5 space-y-4">
                  
                  {/* Ảnh minh họa bé 6 tuổi học tập vui tươi */}
                  <div className="rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg relative">
                    <img 
                      src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=700&q=80" 
                      alt="Bé 6 tuổi học tiếng Anh hào hứng"
                      className="w-full h-52 sm:h-60 object-cover"
                    />
                    <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-xs p-2 rounded-xl text-center text-xs text-amber-300 font-bold">
                      Bé 6 tuổi làm quen Phonics & phản xạ nghe nói tự nhiên
                    </div>
                  </div>

                  {/* Thông tin lớp học (Bảo vệ thông tin, không để lộ số điện thoại thô) */}
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-2.5 text-xs text-slate-200">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                      <span><strong>Địa điểm:</strong> Thôn 11 Quỳnh Hưng, xã Quỳnh Lưu, tỉnh Nghệ An.</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <Users className="w-4 h-4 text-purple-300 shrink-0 mt-0.5" />
                      <span><strong>Sĩ số lớp:</strong> Lớp học nhóm nhỏ, số lượng học sinh linh hoạt theo nhu cầu của phụ huynh.</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <MessageCircle className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                      <span><strong>Hotline / Zalo:</strong> Tư vấn trực tiếp bởi Ms Thủy (bấm nút bên dưới để kết nối nhanh).</span>
                    </div>
                  </div>

                </div>

              </div>

              {/* Action Banner Cuối Bài Tuyển Sinh */}
              <div className="pt-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-t border-white/10">
                <div className="flex-1 min-w-0 text-xs sm:text-sm text-slate-300 flex items-start gap-2.5">
                  <span className="text-rose-400 text-base shrink-0 mt-0.5">💌</span>
                  <p className="leading-relaxed">
                    Quý phụ huynh quan tâm vui lòng nhắn tin để được tư vấn chi tiết hơn về chương trình, lộ trình học tập và lịch học của bé nhé ạ!
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2.5 w-full sm:w-auto">
                  <a
                    href="https://zalo.me/0904988314"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <span>Nhắn Zalo Tư Vấn</span>
                  </a>

                  <button
                    onClick={() => scrollToSection('lien-he')}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-md shadow-amber-500/20"
                  >
                    <span>Đăng Ký Xếp Lớp</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 4. SECTION LỘ TRÌNH HỌC TẬP TOÀN DIỆN */}
      <section id="lo-trinh" className="scroll-mt-24 py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              Lộ Trình Đào Tạo Chuẩn Cambridge
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Lộ Trình Học Rõ Ràng Cho Từng Độ Tuổi
            </h2>
            <p className="text-sm text-slate-500">
              Được thiết kế khoa học, từ bước làm quen phát âm đến phản xạ giao tiếp tự nhiên và ngữ pháp nâng cao ở trường.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Khóa 1 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-brand-300 hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-700 font-extrabold text-[11px] uppercase tracking-wider">
                    6 - 7 Tuổi
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-amber-100/60 text-amber-600 flex items-center justify-center font-black text-sm">
                    01
                  </div>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg group-hover:text-brand-600 transition-colors">
                    Tiếng Anh Nhí - Starters
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Làm quen ngữ âm & phản xạ ban đầu</p>
                </div>
                <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Học phát âm chuẩn Phonics quốc tế</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Làm quen từ vựng qua trò chơi & bài hát</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Tự tin nói các câu giao tiếp cơ bản</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">850.000 đ / tháng</span>
                <span className="text-slate-400">Tuần 2 buổi</span>
              </div>
            </div>

            {/* Khóa 2 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-brand-300 hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 font-extrabold text-[11px] uppercase tracking-wider">
                    8 - 9 Tuổi
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-blue-100/60 text-blue-600 flex items-center justify-center font-black text-sm">
                    02
                  </div>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg group-hover:text-brand-600 transition-colors">
                    Cambridge - Movers
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Mở rộng câu & giao tiếp tự nhiên</p>
                </div>
                <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Nghe hiểu câu chuyện tiếng Anh ngắn</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Đặt câu hỏi & trả lời hoàn chỉnh</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Bám sát đề thi Cambridge Movers</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">950.000 đ / tháng</span>
                <span className="text-slate-400">Tuần 2 buổi</span>
              </div>
            </div>

            {/* Khóa 3 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-brand-300 hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 font-extrabold text-[11px] uppercase tracking-wider">
                    10 - 11 Tuổi
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-purple-100/60 text-purple-600 flex items-center justify-center font-black text-sm">
                    03
                  </div>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg group-hover:text-brand-600 transition-colors">
                    Ngữ Pháp Chuyên Sâu - Flyers
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Toàn diện 4 kỹ năng & chuyển cấp</p>
                </div>
                <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Hệ thống hóa ngữ pháp trường tiểu học</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Rèn luyện kỹ năng viết đoạn văn ngắn</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Bứt phá điểm số thi học kỳ & chuyển cấp</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">1.100.000 đ / tháng</span>
                <span className="text-slate-400">Tuần 2 buổi</span>
              </div>
            </div>

            {/* Khóa 4 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-brand-300 hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-extrabold text-[11px] uppercase tracking-wider">
                    12 - 14 Tuổi
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100/60 text-emerald-600 flex items-center justify-center font-black text-sm">
                    04
                  </div>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg group-hover:text-brand-600 transition-colors">
                    IELTS Junior Foundation
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Học thuật & thi học sinh giỏi</p>
                </div>
                <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Chuẩn hóa phát âm và từ vựng học thuật</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Kỹ năng làm bài thi chuyên Anh, HSG</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Tư duy phản biện và thuyết trình</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">1.350.000 đ / tháng</span>
                <span className="text-slate-400">Tuần 2 buổi</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. SECTION VỀ CÔ THỦY & PHƯƠNG PHÁP GIẢNG DẠY KÈM ẢNH THỰC TẾ */}
      <section id="phuong-phap" className="scroll-mt-24 py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider">
                <Award className="w-3.5 h-3.5" />
                Về Cô Giáo & Phương Pháp Giảng Dạy
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Dạy Học Bằng Cả Sự Tận Tâm, Thấu Hiểu Và Tình Yêu Thương
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Với nhiều năm gắn bó cùng các bạn nhỏ tại Quỳnh Lưu, Ms Thủy tin rằng mỗi bạn nhỏ đều có một nhịp độ tiếp thu riêng. Không có bé nào "dốt tiếng Anh", chỉ là con chưa được khơi gợi đúng cách và chưa có đủ sự kiên nhẫn đồng hành.
              </p>

              <div className="space-y-4 pt-2">
                
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4 font-bold" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Theo Sát 1-1 Từng Học Sinh</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Lớp nhóm nhỏ giúp cô nắm rõ điểm mạnh, điểm yếu của từng bé, không để bất kỳ con nào bị bỏ lại phía sau.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 font-bold" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Phụ Đạo Thêm Giờ Miễn Phí</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Bé nào nghỉ ốm hoặc chưa nắm chắc bài sẽ được cô sắp xếp phụ đạo thêm giờ ngoài lịch học chính mà không thu thêm bất kỳ chi phí nào.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4 font-bold" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Số Hóa Báo Cáo Học Tập Cho Phụ Huynh</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Phụ huynh có tài khoản theo dõi điểm danh, xem nhận xét từng buổi học của con và thanh toán học phí VietQR Napas 1-chạm cực kỳ minh bạch.</p>
                  </div>
                </div>

              </div>

            </div>

            {/* Right Card with Real Educational Atmosphere Image */}
            <div className="bg-gradient-to-br from-brand-50 to-indigo-50/50 p-6 sm:p-8 rounded-3xl border border-brand-100 space-y-6">
              
              {/* Ảnh giáo viên tương tác cùng học sinh */}
              <div className="rounded-2xl overflow-hidden shadow-md border-2 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80" 
                  alt="Không khí lớp học tiếng Anh tương tác"
                  className="w-full h-56 object-cover"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-brand-500/25 shrink-0">
                  T
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Ms. Thủy (Teacher)</h3>
                  <p className="text-xs text-brand-600 font-semibold">Giáo Viên Sáng Lập Thủy English</p>
                  <p className="text-xs text-slate-400 mt-0.5">Thôn 11 Quỳnh Hưng, Quỳnh Lưu, Nghệ An</p>
                </div>
              </div>

              <blockquote className="italic text-slate-600 text-xs sm:text-sm leading-relaxed border-l-4 border-brand-500 pl-4 py-1">
                "Mỗi giờ học tiếng Anh không phải là áp lực điểm số, mà là những phút giây con được vui chơi, khám phá thế giới và tự tin cất lên giọng nói tiếng Anh đầu đời của mình."
              </blockquote>

              <div className="grid grid-cols-2 gap-3 text-center pt-2">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <div className="text-2xl font-black text-brand-600">100%</div>
                  <div className="text-[11px] text-slate-500 font-medium">Bé tiến bộ sau 1 khóa</div>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <div className="text-2xl font-black text-emerald-600">Nhóm nhỏ</div>
                  <div className="text-[11px] text-slate-500 font-medium">Sĩ số theo sát từng con</div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 6. SECTION CẢM NHẬN PHỤ HUYNH */}
      <section id="danh-gia" className="scroll-mt-24 py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Đánh Giá Thực Tế
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Phụ Huynh Nói Gì Về Lớp Học Cô Thủy?
            </h2>
            <p className="text-sm text-slate-500">
              Sự tiến bộ và nụ cười tự tin của các con là niềm hạnh phúc lớn nhất của lớp học.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feedback 1 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                "Bé Bảo An nhà mình trước đây rất nhút nhát, sợ học tiếng Anh. Từ ngày học lớp cô Thủy, con về nhà cứ ríu rít khoe từ mới, phát âm rất chuẩn và tự tin hơn hẳn. Cảm ơn cô Thủy rất nhiều!"
              </p>
              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 font-black text-xs flex items-center justify-center">
                  ML
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-xs">Chị Mai Lan</div>
                  <div className="text-[11px] text-slate-400">Mẹ bé Nguyễn Bảo An (Lớp Starters)</div>
                </div>
              </div>
            </div>

            {/* Feedback 2 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                "Mình rất ấn tượng với sự tận tâm của cô. Có hôm cháu Minh Khôi chưa hiểu bài ngữ pháp ở trường, cô giữ lại giảng thêm cho con tận tình. Hệ thống báo cáo điểm danh qua web cũng rất hiện đại và tiện lợi."
              </p>
              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 font-black text-xs flex items-center justify-center">
                  TA
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-xs">Anh Tuấn Anh</div>
                  <div className="text-[11px] text-slate-400">Bố bé Trần Minh Khôi (Lớp Movers)</div>
                </div>
              </div>
            </div>

            {/* Feedback 3 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                "Bé Quỳnh Chi học lớp 6 tuổi chuẩn bị vào lớp 1. Lúc đầu lo con không theo kịp, nhưng cô Thủy dạy theo phương pháp hình ảnh và bài hát nên bé tiếp thu rất tự nhiên, ngày nào cũng mong đến buổi học."
              </p>
              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 font-black text-xs flex items-center justify-center">
                  TH
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-xs">Chị Thu Hà</div>
                  <div className="text-[11px] text-slate-400">Mẹ bé Lê Quỳnh Chi (Lớp 6 Tuổi)</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. SECTION ĐĂNG KÝ TƯ VẤN & THÔNG TIN LIÊN HỆ */}
      <section id="lien-he" className="scroll-mt-24 py-16 sm:py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-slate-900 rounded-3xl p-6 sm:p-12 text-white shadow-2xl relative overflow-hidden">
            
            {/* Left info (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-wider">
                <Heart className="w-3.5 h-3.5" />
                Kết Nối Cùng Ms Thủy
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Đăng Ký Tư Vấn & Xếp Lớp Cho Bé
              </h2>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Quý phụ huynh đang tìm lớp học tiếng Anh uy tín, nhóm nhỏ theo sát cho con tại Quỳnh Lưu? Hãy gửi thông tin hoặc nhắn tin trực tiếp qua Zalo với Ms Thủy nhé!
              </p>

              <div className="space-y-4 pt-2">
                
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400">Địa chỉ lớp học</div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      Thôn 11 Quỳnh Hưng, xã Quỳnh Lưu, tỉnh Nghệ An
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-blue-300 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400">Kênh hỗ trợ trực tuyến</div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      Nhắn tin qua Zalo Ms Thủy (Hỗ trợ 24/7)
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-emerald-300 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400">Thời gian học tập</div>
                    <div className="text-sm font-medium text-white mt-0.5">
                      Các buổi trong tuần (17:30 - 19:30) & Cuối tuần
                    </div>
                  </div>
                </div>

              </div>

              <div className="pt-2">
                <a
                  href="https://zalo.me/0904988314"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Trò Chuyện Qua Zalo Với Cô</span>
                </a>
              </div>

            </div>

            {/* Right Form (7 cols) */}
            <div className="lg:col-span-7 bg-white text-slate-800 p-6 sm:p-8 rounded-3xl shadow-lg space-y-4">
              
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Gửi Thông Tin Nhận Lộ Trình & Học Thử
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ms Thủy sẽ chủ động nhắn tin tư vấn lịch học phù hợp nhất cho độ tuổi của bé.
                </p>
              </div>

              {submitted ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <div className="font-bold text-emerald-800 text-sm">Gửi đăng ký thành công!</div>
                  <p className="text-xs text-emerald-600">
                    Cảm ơn quý phụ huynh! Cô Thủy sẽ chủ động liên hệ qua Zalo/SĐT sớm nhất để tư vấn lớp học cho con.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleConsultSubmit} className="space-y-3.5">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tên phụ huynh *</label>
                      <input
                        type="text"
                        required
                        value={consultForm.parent_name}
                        onChange={(e) => setConsultForm({ ...consultForm, parent_name: e.target.value })}
                        placeholder="Ví dụ: Chị Lan, Anh Tuấn..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại / Zalo *</label>
                      <input
                        type="tel"
                        required
                        value={consultForm.phone}
                        onChange={(e) => setConsultForm({ ...consultForm, phone: e.target.value })}
                        placeholder="Nhập số điện thoại để cô liên hệ..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tên bé & độ tuổi của con</label>
                    <input
                      type="text"
                      value={consultForm.child_info}
                      onChange={(e) => setConsultForm({ ...consultForm, child_info: e.target.value })}
                      placeholder="Ví dụ: Bé Bảo An, 6 tuổi (chưa học tiếng Anh)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nhu cầu hoặc thắc mắc của phụ huynh</label>
                    <textarea
                      rows="3"
                      value={consultForm.notes}
                      onChange={(e) => setConsultForm({ ...consultForm, notes: e.target.value })}
                      placeholder="Ví dụ: Muốn đăng ký lớp cho bé 6 tuổi, thời gian học buổi tối..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Đang gửi thông tin...' : 'Đăng Ký Xếp Lớp & Tư Vấn Miễn Phí'}</span>
                  </button>

                  <p className="text-[11px] text-slate-400 text-center">
                    Cam kết bảo mật thông tin liên hệ của phụ huynh 100%
                  </p>

                </form>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="font-black text-slate-900 text-base">Thủy English Center</div>
                <p className="text-xs text-slate-500">Lớp học tiếng Anh nhóm nhỏ • Thôn 11 Quỳnh Hưng, Quỳnh Lưu, Nghệ An</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
              <button onClick={() => scrollToSection('gioi-thieu')} className="hover:text-brand-600 cursor-pointer">Về lớp học</button>
              <button onClick={() => scrollToSection('tuyen-sinh')} className="hover:text-brand-600 cursor-pointer">Tuyển sinh 6 tuổi</button>
              <button onClick={() => scrollToSection('lo-trinh')} className="hover:text-brand-600 cursor-pointer">Lộ trình</button>
              <button onClick={() => scrollToSection('lien-he')} className="hover:text-brand-600 cursor-pointer">Liên hệ</button>
              <button 
                onClick={onOpenLogin}
                className="px-3.5 py-1.5 rounded-xl bg-brand-50 text-brand-700 border border-brand-200/70 hover:bg-brand-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Cổng Đăng Nhập</span>
              </button>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
            <p>© {new Date().getFullYear()} Thủy English. All rights reserved. Hệ thống quản lý lớp học và cổng phụ huynh thông minh.</p>
          </div>
        </div>
      </footer>

      {/* Floating Install App Button for Mobile & Desktop */}
      <button
        onClick={onOpenInstallModal}
        className="fixed bottom-5 left-5 z-40 bg-white/95 backdrop-blur-md text-brand-700 hover:text-brand-800 px-3.5 py-2 rounded-full shadow-lg border border-brand-200/80 flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 active:scale-95 group cursor-pointer"
        title="Thêm app Thủy English vào màn hình điện thoại"
      >
        <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
          <Smartphone className="w-3.5 h-3.5" />
        </div>
        <span>Cài App ĐT</span>
      </button>

    </div>
  );
}
