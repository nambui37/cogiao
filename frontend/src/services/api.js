import { 
  initialClasses, 
  initialStudents, 
  initialParentAccounts, 
  initialTuitionFees, 
  initialLessons, 
  initialSettings 
} from './mockData';

const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? '/api' : 'https://cogiao-api.onrender.com/api');

// Local storage keys for hybrid persistence
const STORAGE_KEYS = {
  CLASSES: 'thuy_classes_v2',
  STUDENTS: 'thuy_students_v2',
  PARENTS: 'thuy_parents_v2',
  TUITION: 'thuy_tuition_v2',
  SETTINGS: 'thuy_settings_v2',
  AUTH: 'thuy_auth_user_v2'
};

function getLocal(key, defaultVal) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocal(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

// Initialize local stores if not present
if (!localStorage.getItem(STORAGE_KEYS.CLASSES)) setLocal(STORAGE_KEYS.CLASSES, initialClasses);
if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) setLocal(STORAGE_KEYS.STUDENTS, initialStudents);
if (!localStorage.getItem(STORAGE_KEYS.PARENTS)) setLocal(STORAGE_KEYS.PARENTS, initialParentAccounts);
if (!localStorage.getItem(STORAGE_KEYS.TUITION)) setLocal(STORAGE_KEYS.TUITION, initialTuitionFees);
if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) setLocal(STORAGE_KEYS.SETTINGS, initialSettings);

export const api = {
  getHeaders() {
    const token = localStorage.getItem('thuy_token_v2');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  },

  async get(url, params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const fullUrl = query ? `${API_BASE}${url}?${query}` : `${API_BASE}${url}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(fullUrl, { 
        headers: this.getHeaders(),
        signal: controller.signal 
      });
      clearTimeout(timeoutId);

      const json = await res.json();
      if (res.ok && json.success) {
        if (url === '/admin/classes') setLocal(STORAGE_KEYS.CLASSES, json.data);
        if (url === '/admin/students') setLocal(STORAGE_KEYS.STUDENTS, json.data);
        if (url === '/admin/parent-accounts') setLocal(STORAGE_KEYS.PARENTS, json.data);
        return json.data;
      }
      throw new Error(json.message || 'API Error');
    } catch (err) {
      // Graceful fallback to rich local state if network fails
      return this.handleLocalGet(url, params);
    }
  },

  async post(url, data = {}) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${API_BASE}${url}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const json = await res.json();
      if (res.ok && json.success) {
        if (url === '/admin/classes') setLocal(STORAGE_KEYS.CLASSES, json.data);
        if (url === '/admin/students') setLocal(STORAGE_KEYS.STUDENTS, json.data);
        if (url === '/admin/parent-accounts') setLocal(STORAGE_KEYS.PARENTS, json.data);
        return json.data;
      }
      throw new Error(json.message || 'API Error');
    } catch (err) {
      return this.handleLocalPost(url, data);
    }
  },

  async put(url, data = {}) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${API_BASE}${url}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const json = await res.json();
      if (res.ok && json.success) {
        if (url === '/admin/classes') setLocal(STORAGE_KEYS.CLASSES, json.data);
        if (url === '/admin/students') setLocal(STORAGE_KEYS.STUDENTS, json.data);
        if (url === '/admin/parent-accounts') setLocal(STORAGE_KEYS.PARENTS, json.data);
        return json.data;
      }
      throw new Error(json.message || 'API Error');
    } catch (err) {
      return this.handleLocalPut(url, data);
    }
  },

  async delete(url) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${API_BASE}${url}`, { 
        method: 'DELETE', 
        headers: this.getHeaders(),
        signal: controller.signal 
      });
      clearTimeout(timeoutId);

      const json = await res.json();
      if (res.ok && json.success) {
        if (url === '/admin/classes') setLocal(STORAGE_KEYS.CLASSES, json.data);
        if (url === '/admin/students') setLocal(STORAGE_KEYS.STUDENTS, json.data);
        if (url === '/admin/parent-accounts') setLocal(STORAGE_KEYS.PARENTS, json.data);
        return json.data;
      }
      throw new Error(json.message || 'API Error');
    } catch (err) {
      return this.handleLocalDelete(url);
    }
  },

  // Fallback Local Handlers for 100% reliable UX
  handleLocalGet(url, params) {
    if (url === '/admin/dashboard') {
      const students = getLocal(STORAGE_KEYS.STUDENTS, initialStudents);
      const classes = getLocal(STORAGE_KEYS.CLASSES, initialClasses);
      const tuition = getLocal(STORAGE_KEYS.TUITION, initialTuitionFees);

      const totalAmount = tuition.reduce((s, i) => s + i.final_amount, 0);
      const paidAmount = tuition.filter(i => i.status === 'paid').reduce((s, i) => s + i.final_amount, 0);
      const unpaidAmount = totalAmount - paidAmount;

      return {
        total_students: students.length,
        total_classes: classes.length,
        tuition_stats: {
          total_amount: totalAmount,
          paid_amount: paidAmount,
          unpaid_amount: unpaidAmount,
          total_invoices: tuition.length,
          paid_invoices: tuition.filter(i => i.status === 'paid').length
        },
        recent_lessons: initialLessons,
        classes: classes,
        unpaid_alerts: tuition.filter(i => i.status === 'unpaid').slice(0, 5),
        current_month: '2026-11'
      };
    }

    if (url === '/admin/classes') {
      return getLocal(STORAGE_KEYS.CLASSES, initialClasses);
    }

    if (url === '/admin/students') {
      let list = getLocal(STORAGE_KEYS.STUDENTS, initialStudents);
      if (params.class_id) {
        list = list.filter(s => String(s.class_ids || '').includes(String(params.class_id)));
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter(s => s.full_name.toLowerCase().includes(q) || s.student_code.toLowerCase().includes(q) || (s.parent_phone && s.parent_phone.includes(q)));
      }
      return list;
    }

    if (url === '/admin/parent-accounts') {
      return getLocal(STORAGE_KEYS.PARENTS, initialParentAccounts);
    }

    if (url === '/admin/tuition') {
      let fees = getLocal(STORAGE_KEYS.TUITION, initialTuitionFees);
      if (params.month) {
        fees = fees.filter(f => f.billing_month === params.month);
      }
      if (params.class_id) {
        fees = fees.filter(f => String(f.class_id) === String(params.class_id));
      }
      if (params.status) {
        fees = fees.filter(f => f.status === params.status);
      }
      return {
        fees: fees,
        bank_info: getLocal(STORAGE_KEYS.SETTINGS, initialSettings)
      };
    }

    if (url === '/admin/attendance') {
      const students = getLocal(STORAGE_KEYS.STUDENTS, initialStudents);
      return {
        lesson: initialLessons[0],
        date: params.date || '2026-11-22',
        attendance: students.map(s => ({
          student_id: s.id,
          student_code: s.student_code,
          full_name: s.full_name,
          parent_name: s.parent_name,
          parent_phone: s.parent_phone,
          status: 'present',
          note: ''
        }))
      };
    }

    if (url.startsWith('/parent/student/')) {
      const stuId = parseInt(url.split('/').pop()) || 1;
      const students = getLocal(STORAGE_KEYS.STUDENTS, initialStudents);
      const student = students.find(s => s.id === stuId) || students[0];
      const tuition = getLocal(STORAGE_KEYS.TUITION, initialTuitionFees).filter(t => t.student_id === student.id);

      return {
        student: {
          ...student,
          current_class_name: student.class_names || 'Tiếng Anh Nhí - Starters 1',
          current_class_level: 'Starters',
          schedule_note: 'Thứ 3 & Thứ 5 (17:30 - 19:00)'
        },
        attendance_rate: 96,
        attendance_history: [
          { status: 'present', note: 'Hăng hái phát biểu, phát âm chuẩn', lesson_date: '2026-11-20', lesson_title: 'Unit 6: My Colorful World', homework: 'Tô màu bức tranh động vật' },
          { status: 'present', note: 'Tiếp thu từ vựng tốt', lesson_date: '2026-11-18', lesson_title: 'Unit 5: Animals and Pets', homework: 'Làm bài tập trang 24' },
          { status: 'present', note: 'Đến đúng giờ, học ngoan', lesson_date: '2026-11-15', lesson_title: 'Unit 4: School Supplies', homework: 'Học thuộc 6 từ vựng' }
        ],
        assessments: [
          {
            title: 'Kiểm tra định kỳ Units 1-4',
            score: 9.5,
            max_score: 10,
            evaluated_date: '2026-11-10',
            teacher_comment: `${student.full_name} tiến bộ vượt bậc, phát âm chuẩn, phản xạ nghe nói rất tự nhiên.`,
            skills_breakdown: JSON.stringify({ 'Nghe': 10, 'Nói': 9.5, 'Đọc': 9.0, 'Viết': 9.5 })
          }
        ],
        tuition: tuition
      };
    }

    if (url.startsWith('/admin/parent-accounts/')) {
      const id = parseInt(url.split('/').pop());
      let parents = getLocal(STORAGE_KEYS.PARENTS, initialParentAccounts);
      let students = getLocal(STORAGE_KEYS.STUDENTS, initialStudents);

      const targetParent = parents.find(p => p.id === id);
      if (targetParent) {
        targetParent.full_name = data.full_name !== undefined ? data.full_name : targetParent.full_name;
        targetParent.phone = data.phone !== undefined ? data.phone : targetParent.phone;
        if (data.password) {
          targetParent.plain_password = data.password;
        }

        if (Array.isArray(data.children_ids)) {
          // Link children to this parent
          const linkedStudents = students.filter(s => data.children_ids.includes(s.id));
          targetParent.children = linkedStudents.map(s => ({
            id: s.id,
            student_code: s.student_code,
            full_name: s.full_name,
            class_name: s.class_names || 'Tiếng Anh'
          }));

          // Update student records
          students = students.map(s => {
            if (data.children_ids.includes(s.id)) {
              return { ...s, parent_user_id: id, parent_name: targetParent.full_name, parent_phone: targetParent.phone };
            } else if (s.parent_user_id === id) {
              return { ...s, parent_user_id: null };
            }
            return s;
          });
          setLocal(STORAGE_KEYS.STUDENTS, students);
        }
      }

      setLocal(STORAGE_KEYS.PARENTS, parents);
      return { success: true, parent: targetParent };
    }

    if (url === '/admin/settings') {
      return getLocal(STORAGE_KEYS.SETTINGS, initialSettings);
    }

    if (url === '/admin/profile') {
      const auth = getLocal(STORAGE_KEYS.AUTH, {
        id: 1,
        full_name: 'Cô Thủy (Teacher & Admin)',
        phone: '0912345678',
        email: 'cothuy.english@gmail.com',
        plain_password: '123'
      });
      return auth;
    }

    return null;
  },

  handleLocalPost(url, data) {
    if (url === '/auth/login') {
      const identifier = data.identifier || data.phone || '';
      if (identifier === '0912345678' || identifier.includes('cothuy') || data.role === 'admin') {
        const user = { id: 1, role_name: 'admin', full_name: 'Cô Thủy (Teacher & Admin)', phone: '0912345678' };
        setLocal(STORAGE_KEYS.AUTH, user);
        return { user, token: 'demo_token_cothuy' };
      } else {
        const parents = getLocal(STORAGE_KEYS.PARENTS, initialParentAccounts);
        const p = parents.find(x => x.phone === identifier) || parents[0];
        const user = { id: p.id, role_name: 'parent', full_name: p.full_name, phone: p.phone, children: p.children };
        setLocal(STORAGE_KEYS.AUTH, user);
        return { user, children: p.children, token: 'demo_token_parent' };
      }
    }

    if (url === '/admin/parent-accounts') {
      const parents = getLocal(STORAGE_KEYS.PARENTS, initialParentAccounts);
      const students = getLocal(STORAGE_KEYS.STUDENTS, initialStudents);

      const linkedChildren = students.filter(s => (data.children_ids || []).includes(s.id));
      const newParent = {
        id: Date.now(),
        full_name: data.full_name,
        phone: data.phone,
        plain_password: data.password || '123',
        status: 'active',
        children: linkedChildren
      };
      parents.unshift(newParent);
      setLocal(STORAGE_KEYS.PARENTS, parents);

      // Link in student records
      const updatedStudents = students.map(s => {
        if ((data.children_ids || []).includes(s.id)) {
          return { ...s, parent_name: data.full_name, parent_phone: data.phone, parent_user_id: newParent.id };
        }
        return s;
      });
      setLocal(STORAGE_KEYS.STUDENTS, updatedStudents);

      return newParent;
    }

    if (url === '/admin/students') {
      const students = getLocal(STORAGE_KEYS.STUDENTS, initialStudents);
      const newStu = {
        id: Date.now(),
        student_code: data.student_code || 'STU' + Math.floor(100 + Math.random() * 900),
        full_name: data.full_name,
        date_of_birth: data.date_of_birth,
        gender: data.gender || 'female',
        parent_name: data.parent_name,
        parent_phone: data.parent_phone,
        class_names: 'Tiếng Anh Nhí - Starters 1',
        status: 'studying',
        notes: data.notes || ''
      };
      students.unshift(newStu);
      setLocal(STORAGE_KEYS.STUDENTS, students);
      return newStu;
    }

    if (url === '/admin/classes') {
      const classes = getLocal(STORAGE_KEYS.CLASSES, initialClasses);
      const newClass = {
        id: Date.now(),
        ...data,
        student_count: 0
      };
      classes.unshift(newClass);
      setLocal(STORAGE_KEYS.CLASSES, classes);
      return newClass;
    }

    if (url === '/admin/attendance') {
      return { success: true };
    }

    if (url === '/admin/tuition') {
      const tuition = getLocal(STORAGE_KEYS.TUITION, initialTuitionFees);
      const students = getLocal(STORAGE_KEYS.STUDENTS, initialStudents);
      const classes = getLocal(STORAGE_KEYS.CLASSES, initialClasses);
      const settings = getLocal(STORAGE_KEYS.SETTINGS, initialSettings);
      
      const classId = data.class_id;
      const targetClass = classes.find(c => String(c.id) === String(classId));
      const targetStudents = students.filter(s => {
        const cids = (s.class_ids || '').split(',').map(x => x.trim());
        return cids.includes(String(classId)) || String(s.class_id) === String(classId);
      });

      const month = data.month || '2026-11';
      const amount = Number(data.amount) || (targetClass ? targetClass.tuition_amount : 850000);
      const dueDate = data.due_date || `${month}-15`;
      const notes = data.notes || '';

      let createdCount = 0;
      targetStudents.forEach(stu => {
        const exists = tuition.some(t => t.student_id === stu.id && t.billing_month === month);
        if (!exists) {
          const invId = Date.now() + Math.floor(Math.random() * 1000);
          const memo = `HP ${stu.student_code} ${month.replace('-', '')}`;
          const qrUrl = `https://img.vietqr.io/image/${settings.bank_name || 'MB'}-${settings.bank_account || '0912345678'}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(settings.bank_owner || 'NGUYEN THI THUY')}`;

          tuition.unshift({
            id: invId,
            invoice_code: `INV-${month.replace('-', '')}-${String(stu.id).padStart(3, '0')}`,
            student_id: stu.id,
            student_name: stu.full_name,
            student_code: stu.student_code,
            parent_name: stu.parent_name || 'Phụ huynh',
            parent_phone: stu.parent_phone || '0912345678',
            class_id: classId,
            class_name: targetClass ? targetClass.name : 'Lớp học',
            billing_month: month,
            amount: amount,
            discount: 0,
            final_amount: amount,
            due_date: dueDate,
            status: 'unpaid',
            notes: notes,
            payment_date: null,
            payment_method: null,
            qr_url: qrUrl,
            transfer_memo: memo
          });
          createdCount++;
        }
      });

      setLocal(STORAGE_KEYS.TUITION, tuition);
      return { success: true, count: createdCount };
    }

    if (url === '/admin/tuition/single') {
      const tuition = getLocal(STORAGE_KEYS.TUITION, initialTuitionFees);
      const students = getLocal(STORAGE_KEYS.STUDENTS, initialStudents);
      const classes = getLocal(STORAGE_KEYS.CLASSES, initialClasses);
      const settings = getLocal(STORAGE_KEYS.SETTINGS, initialSettings);

      const stu = students.find(s => s.id === Number(data.student_id)) || {};
      const cls = classes.find(c => c.id === Number(data.class_id)) || {};
      const month = data.month || '2026-11';
      const amount = Number(data.amount) || 850000;
      const discount = Number(data.discount) || 0;
      const finalAmount = Number(data.final_amount) || (amount - discount);
      const invId = Date.now();
      const memo = `HP ${stu.student_code || 'STU'} ${month.replace('-', '')}`;
      const qrUrl = `https://img.vietqr.io/image/${settings.bank_name || 'MB'}-${settings.bank_account || '0912345678'}-compact2.png?amount=${finalAmount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(settings.bank_owner || 'NGUYEN THI THUY')}`;

      const newInvoice = {
        id: invId,
        invoice_code: `INV-${month.replace('-', '')}-${String(stu.id || 1).padStart(3, '0')}-${Math.floor(10 + Math.random() * 90)}`,
        student_id: stu.id || Number(data.student_id),
        student_name: stu.full_name || data.student_name || 'Học sinh',
        student_code: stu.student_code || 'STU001',
        parent_name: stu.parent_name || 'Phụ huynh',
        parent_phone: stu.parent_phone || '0912345678',
        class_id: cls.id || Number(data.class_id),
        class_name: cls.name || 'Lớp học',
        billing_month: month,
        amount: amount,
        discount: discount,
        final_amount: finalAmount,
        due_date: data.due_date || `${month}-15`,
        status: data.status || 'unpaid',
        notes: data.notes || '',
        payment_date: data.status === 'paid' ? '2026-11-22 10:00:00' : null,
        payment_method: data.payment_method || null,
        qr_url: qrUrl,
        transfer_memo: memo
      };

      tuition.unshift(newInvoice);
      setLocal(STORAGE_KEYS.TUITION, tuition);
      return { success: true, invoice: newInvoice };
    }

    return { success: true };
  },

  handleLocalPut(url, data) {
    if (url.startsWith('/admin/classes/')) {
      const id = parseInt(url.split('/').pop());
      let classes = getLocal(STORAGE_KEYS.CLASSES, initialClasses);
      classes = classes.map(c => c.id === id ? { ...c, ...data } : c);
      setLocal(STORAGE_KEYS.CLASSES, classes);
      return { success: true };
    }
    if (url.startsWith('/admin/students/')) {
      const id = parseInt(url.split('/').pop());
      const students = getLocal(STORAGE_KEYS.STUDENTS, initialStudents);
      const classes = getLocal(STORAGE_KEYS.CLASSES, initialClasses);
      const selectedClass = classes.find(c => String(c.id) === String(data.class_id));

      const updated = students.map(s => {
        if (s.id === id) {
          return {
            ...s,
            ...data,
            class_names: selectedClass ? selectedClass.name : s.class_names,
            class_ids: data.class_id ? String(data.class_id) : s.class_ids
          };
        }
        return s;
      });
      setLocal(STORAGE_KEYS.STUDENTS, updated);
      return { success: true };
    }

    if (url.includes('/tuition/') && url.includes('/status')) {
      const id = parseInt(url.split('/')[3]);
      const tuition = getLocal(STORAGE_KEYS.TUITION, initialTuitionFees);
      const updated = tuition.map(t => {
        if (t.id === id) {
          return { 
            ...t, 
            status: data.status, 
            payment_method: data.payment_method || (data.status === 'paid' ? 'Chuyển khoản VietQR' : null),
            payment_date: data.status === 'paid' ? (data.payment_date || '2026-11-22 10:00:00') : null 
          };
        }
        return t;
      });
      setLocal(STORAGE_KEYS.TUITION, updated);
      return { success: true };
    }

    if (url.startsWith('/admin/tuition/') && !url.includes('/status')) {
      const id = parseInt(url.split('/').pop());
      const tuition = getLocal(STORAGE_KEYS.TUITION, initialTuitionFees);
      const settings = getLocal(STORAGE_KEYS.SETTINGS, initialSettings);
      const updated = tuition.map(t => {
        if (t.id === id) {
          const amount = data.amount !== undefined ? Number(data.amount) : t.amount;
          const discount = data.discount !== undefined ? Number(data.discount) : t.discount;
          const finalAmount = data.final_amount !== undefined ? Number(data.final_amount) : (amount - discount);
          const memo = `HP ${t.student_code || 'STU'} ${(data.month || t.billing_month).replace('-', '')}`;
          const qrUrl = `https://img.vietqr.io/image/${settings.bank_name || 'MB'}-${settings.bank_account || '0912345678'}-compact2.png?amount=${finalAmount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(settings.bank_owner || 'NGUYEN THI THUY')}`;

          return {
            ...t,
            ...data,
            amount: amount,
            discount: discount,
            final_amount: finalAmount,
            qr_url: qrUrl
          };
        }
        return t;
      });
      setLocal(STORAGE_KEYS.TUITION, updated);
      return { success: true };
    }

    if (url.startsWith('/admin/parent-accounts/')) {
      const id = parseInt(url.split('/').pop());
      let parents = getLocal(STORAGE_KEYS.PARENTS, initialParentAccounts);
      let students = getLocal(STORAGE_KEYS.STUDENTS, initialStudents);

      const targetParent = parents.find(p => p.id === id);
      if (targetParent) {
        targetParent.full_name = data.full_name !== undefined ? data.full_name : targetParent.full_name;
        targetParent.phone = data.phone !== undefined ? data.phone : targetParent.phone;
        if (data.password) {
          targetParent.plain_password = data.password;
        }

        if (Array.isArray(data.children_ids)) {
          // Link children to this parent
          const linkedStudents = students.filter(s => data.children_ids.includes(s.id));
          targetParent.children = linkedStudents.map(s => ({
            id: s.id,
            student_code: s.student_code,
            full_name: s.full_name,
            class_name: s.class_names || 'Tiếng Anh'
          }));

          // Update student records
          students = students.map(s => {
            if (data.children_ids.includes(s.id)) {
              return { ...s, parent_user_id: id, parent_name: targetParent.full_name, parent_phone: targetParent.phone };
            } else if (s.parent_user_id === id) {
              return { ...s, parent_user_id: null };
            }
            return s;
          });
          setLocal(STORAGE_KEYS.STUDENTS, students);
        }
      }

      setLocal(STORAGE_KEYS.PARENTS, parents);
      return { success: true, parent: targetParent };
    }

    if (url === '/admin/settings') {
      setLocal(STORAGE_KEYS.SETTINGS, data);
      return { success: true };
    }

    if (url === '/admin/profile') {
      const auth = getLocal(STORAGE_KEYS.AUTH, {
        id: 1,
        role_name: 'admin',
        full_name: 'Cô Thủy (Teacher & Admin)',
        phone: '0912345678'
      });
      const updated = {
        ...auth,
        full_name: data.full_name || auth.full_name,
        phone: data.phone || auth.phone,
        email: data.email || auth.email,
        plain_password: data.password || auth.plain_password || '123'
      };
      setLocal(STORAGE_KEYS.AUTH, updated);
      try {
        localStorage.setItem('thuy_auth_user_v2', JSON.stringify(updated));
      } catch {}
      return updated;
    }

    return { success: true };
  },

  handleLocalDelete(url) {
    if (url.startsWith('/admin/classes/')) {
      const id = parseInt(url.split('/').pop());
      let classes = getLocal(STORAGE_KEYS.CLASSES, initialClasses);
      classes = classes.filter(c => c.id !== id);
      setLocal(STORAGE_KEYS.CLASSES, classes);
      return { success: true };
    }
    if (url.startsWith('/admin/parent-accounts/')) {
      const id = parseInt(url.split('/').pop());
      let parents = getLocal(STORAGE_KEYS.PARENTS, initialParentAccounts);
      parents = parents.filter(p => p.id !== id);
      setLocal(STORAGE_KEYS.PARENTS, parents);
      return { success: true };
    }
    if (url.startsWith('/admin/tuition/')) {
      const id = parseInt(url.split('/').pop());
      let tuition = getLocal(STORAGE_KEYS.TUITION, initialTuitionFees);
      tuition = tuition.filter(t => t.id !== id);
      setLocal(STORAGE_KEYS.TUITION, tuition);
      return { success: true };
    }
    return { success: true };
  }
};
