import React, { useState } from 'react';
import { Megaphone, X, Send, Users, Calendar, AlertCircle, Sparkles } from 'lucide-react';

export default function CreateAnnouncementModal({ isOpen, onClose, onSend, classes, showToast }) {
  const [formData, setFormData] = useState({
    target: 'all', // 'all' or class_id
    category: 'holiday', // 'holiday', 'schedule', 'exam', 'general'
    title: '',
    content: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      if (showToast) {
        showToast('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo', 'warning');
      }
      return;
    }

    onSend({
      id: Date.now(),
      type: formData.category,
      title: `📢 ${formData.title}`,
      message: formData.content,
      time: 'Vừa xong',
      read: false,
      target: formData.target
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-6 space-y-5 animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">Soạn Thông Báo Gửi Phụ Huynh</h3>
              <p className="text-xs text-slate-400">Gửi lịch nghỉ lễ, thông báo học tập hoặc nhắc nhở</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gửi tới ai? *</label>
              <select
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-500 bg-slate-50"
              >
                <option value="all">Tất cả phụ huynh & học sinh</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Chủ đề *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-500 bg-slate-50"
              >
                <option value="holiday">Thông báo Nghỉ lễ / Nghỉ bù</option>
                <option value="schedule">Thay đổi lịch học / Phòng học</option>
                <option value="exam">Lịch kiểm tra / Thi Cambridge</option>
                <option value="general">Thông báo chung</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề thông báo *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ví dụ: Thông báo nghỉ lễ 20/11 và lịch học bù"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung chi tiết *</label>
            <textarea
              rows={4}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Kính gửi Quý Phụ Huynh, Cô Thủy xin thông báo..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 text-xs leading-relaxed"
            ></textarea>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Gửi thông báo ngay
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
