import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Share, PlusSquare, X, Check, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function InstallPwaModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandalone(standalone);

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIosDevice);

    // Listen for beforeinstallprompt event (Android / Chrome / Desktop)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.deferredPrompt) {
      setDeferredPrompt(window.deferredPrompt);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || window.deferredPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstalledSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      }
      setDeferredPrompt(null);
      window.deferredPrompt = null;
    } else {
      // Fallback alert
      alert('Để cài đặt: Bấm vào dấu 3 chấm (⋮) ở góc trên Chrome -> Chọn "Cài đặt ứng dụng" hoặc "Thêm vào màn hình chính".');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-slide-up relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-blue-600 p-6 text-white text-center relative overflow-hidden">
          <button 
            type="button" 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-lg p-1.5 mb-3.5 flex items-center justify-center">
              <img src="/icon-192.png" alt="Thủy English" className="w-full h-full rounded-xl object-contain shadow-sm" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Cài Đặt App Thủy English</h3>
            <p className="text-xs text-blue-100 mt-1 max-w-[280px]">
              Dùng như ứng dụng thật trên màn hình điện thoại, mở nhanh 1 chạm không cần nhập lại link
            </p>
          </div>

          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {isStandalone ? (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h4 className="font-bold text-emerald-900 text-sm">Bạn đang mở ứng dụng đã cài đặt!</h4>
              <p className="text-xs text-emerald-700">App đã có sẵn trên màn hình chính của bạn.</p>
            </div>
          ) : isIOS ? (
            /* iOS Safari Instructions */
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-semibold border border-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Dành cho iPhone & iPad (Safari)
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                    1
                  </div>
                  <div className="text-xs leading-relaxed text-slate-700">
                    Bấm vào biểu tượng <span className="font-semibold text-blue-600 inline-flex items-center gap-0.5"><Share className="w-3.5 h-3.5 inline mx-0.5" /> Chia sẻ</span> ở thanh công cụ dưới đáy màn hình Safari.
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                    2
                  </div>
                  <div className="text-xs leading-relaxed text-slate-700">
                    Cuộn danh sách xuống và chọn <span className="font-semibold text-slate-900 inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5 inline text-indigo-600" /> "Thêm vào MH chính"</span> (Add to Home Screen).
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                    3
                  </div>
                  <div className="text-xs leading-relaxed text-slate-700">
                    Nhấn chữ <span className="font-bold text-emerald-600">"Thêm" (Add)</span> ở góc trên bên phải màn hình. Biểu tượng app sẽ xuất hiện ngay trên màn hình chính!
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Android / Chrome Instructions */
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-semibold border border-emerald-200">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" /> Dành cho điện thoại Android (Samsung, Xiaomi, Oppo...)
              </div>

              {deferredPrompt ? (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full py-3.5 px-5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Cài Đặt App Lên Màn Hình Ngay
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                      1
                    </div>
                    <div className="text-xs leading-relaxed text-slate-700">
                      Bấm vào biểu tượng <span className="font-bold text-slate-900">3 dấu chấm (⋮)</span> ở góc trên cùng bên phải trình duyệt Chrome.
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                      2
                    </div>
                    <div className="text-xs leading-relaxed text-slate-700">
                      Chọn <span className="font-semibold text-brand-700">"Cài đặt ứng dụng"</span> hoặc <span className="font-semibold text-brand-700">"Thêm vào màn hình chính"</span> (Add to Home screen).
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Value Highlights */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Mở siêu nhanh 1 chạm</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Không chiếm dung lượng</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Toàn màn hình như App</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Tự động cập nhật mới</span>
            </div>
          </div>

          {/* Action button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
}
