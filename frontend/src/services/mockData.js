// Rich initial demo data for instant out-of-the-box presentation

export const initialClasses = [
  {
    id: 1,
    code: 'STARTER-01',
    name: 'Tiếng Anh Nhí - Starters 1',
    level: 'Starters (6-7 tuổi)',
    room: 'Phòng 201',
    tuition_type: 'monthly',
    tuition_amount: 850000,
    schedule_note: 'Thứ 3 & Thứ 5 (17:30 - 19:00)',
    student_count: 3
  },
  {
    id: 3,
    code: 'FLYER-01',
    name: 'Ngữ Pháp Chuyên Sâu - Flyers 1',
    level: 'Flyers (10-11 tuổi)',
    room: 'Phòng 301',
    tuition_type: 'monthly',
    tuition_amount: 1100000,
    schedule_note: 'Chủ Nhật (08:30 - 11:00)',
    student_count: 2
  },
  {
    id: 4,
    code: 'IELTS-KIDS',
    name: 'IELTS Junior Foundation',
    level: 'IELTS Foundation (12-14 tuổi)',
    room: 'Phòng 302',
    tuition_type: 'monthly',
    tuition_amount: 1350000,
    schedule_note: 'Thứ 7 & CN (14:30 - 16:00)',
    student_count: 1
  }
];

export const initialStudents = [
  {
    id: 1,
    student_code: 'STU001',
    full_name: 'Nguyễn Bảo An',
    date_of_birth: '2019-05-12',
    gender: 'female',
    parent_name: 'Chị Mai Lan',
    parent_phone: '0988111222',
    parent_user_id: 2,
    class_names: 'Tiếng Anh Nhí - Starters 1',
    class_ids: '1',
    status: 'studying',
    notes: 'Phát âm chuẩn, rất hăng hái phát biểu'
  },
  {
    id: 2,
    student_code: 'STU002',
    full_name: 'Trần Minh Khôi',
    date_of_birth: '2019-08-20',
    gender: 'male',
    parent_name: 'Anh Tuấn Anh',
    parent_phone: '0977333444',
    parent_user_id: 3,
    class_names: 'Tiếng Anh Nhí - Starters 1',
    class_ids: '1',
    status: 'studying',
    notes: 'Thông minh, cần rèn thêm tính cẩn thận khi làm bài viết'
  },
  {
    id: 3,
    student_code: 'STU003',
    full_name: 'Lê Quỳnh Chi',
    date_of_birth: '2019-02-14',
    gender: 'female',
    parent_name: 'Chị Thu Hà',
    parent_phone: '0912999888',
    parent_user_id: 4,
    class_names: 'Tiếng Anh Nhí - Starters 1',
    class_ids: '1',
    status: 'studying',
    notes: 'Tiếp thu từ vựng cực nhanh, viết đẹp'
  },
  {
    id: 4,
    student_code: 'STU004',
    full_name: 'Phạm Hoàng Nam',
    date_of_birth: '2018-11-03',
    gender: 'male',
    parent_name: 'Anh Quốc Huy',
    parent_phone: '0903123456',
    parent_user_id: 5,
    class_names: 'Luyện Thi Cambridge - Movers 2',
    class_ids: '2',
    status: 'studying',
    notes: 'Kỹ năng phản xạ nói rất tốt'
  },
  {
    id: 5,
    student_code: 'STU005',
    full_name: 'Vũ Khánh Linh',
    date_of_birth: '2018-04-18',
    gender: 'female',
    parent_name: 'Chị Bích Ngọc',
    parent_phone: '0945678901',
    parent_user_id: 6,
    class_names: 'Luyện Thi Cambridge - Movers 2',
    class_ids: '2',
    status: 'studying',
    notes: 'Nghe tốt, giọng phát âm tự nhiên'
  },
  {
    id: 6,
    student_code: 'STU006',
    full_name: 'Đỗ Gia Huy',
    date_of_birth: '2017-09-25',
    gender: 'male',
    parent_name: 'Anh Tuấn Anh',
    parent_phone: '0977333444',
    parent_user_id: 3,
    class_names: 'Ngữ Pháp Chuyên Sâu - Flyers 1',
    class_ids: '3',
    status: 'studying',
    notes: 'Anh trai bé Minh Khôi, lực học xuất sắc'
  },
  {
    id: 7,
    student_code: 'STU007',
    full_name: 'Hoàng Minh Châu',
    date_of_birth: '2017-12-10',
    gender: 'female',
    parent_name: 'Chị Mai Lan',
    parent_phone: '0988111222',
    parent_user_id: 2,
    class_names: 'Ngữ Pháp Chuyên Sâu - Flyers 1',
    class_ids: '3',
    status: 'studying',
    notes: 'Chị gái bé Bảo An, học lớp Flyers 1'
  },
  {
    id: 8,
    student_code: 'STU008',
    full_name: 'Nguyễn Đức Anh',
    date_of_birth: '2016-03-15',
    gender: 'male',
    parent_name: 'Chị Thanh Hương',
    parent_phone: '0933222111',
    parent_user_id: null,
    class_names: 'IELTS Junior Foundation',
    class_ids: '4',
    status: 'studying',
    notes: 'Nền tảng tốt, đang luyện thi học sinh giỏi'
  }
];

export const initialParentAccounts = [
  {
    id: 2,
    full_name: 'Chị Mai Lan',
    phone: '0988111222',
    plain_password: '123',
    status: 'active',
    children: [
      { id: 1, student_code: 'STU001', full_name: 'Nguyễn Bảo An', class_name: 'Tiếng Anh Nhí - Starters 1' },
      { id: 7, student_code: 'STU007', full_name: 'Hoàng Minh Châu', class_name: 'Ngữ Pháp Chuyên Sâu - Flyers 1' }
    ]
  },
  {
    id: 3,
    full_name: 'Anh Tuấn Anh',
    phone: '0977333444',
    plain_password: '123',
    status: 'active',
    children: [
      { id: 2, student_code: 'STU002', full_name: 'Trần Minh Khôi', class_name: 'Tiếng Anh Nhí - Starters 1' },
      { id: 6, student_code: 'STU006', full_name: 'Đỗ Gia Huy', class_name: 'Ngữ Pháp Chuyên Sâu - Flyers 1' }
    ]
  },
  {
    id: 4,
    full_name: 'Chị Thu Hà',
    phone: '0912999888',
    plain_password: '123',
    status: 'active',
    children: [
      { id: 3, student_code: 'STU003', full_name: 'Lê Quỳnh Chi', class_name: 'Tiếng Anh Nhí - Starters 1' }
    ]
  },
  {
    id: 5,
    full_name: 'Anh Quốc Huy',
    phone: '0903123456',
    plain_password: '123',
    status: 'active',
    children: [
      { id: 4, student_code: 'STU004', full_name: 'Phạm Hoàng Nam', class_name: 'Luyện Thi Cambridge - Movers 2' }
    ]
  },
  {
    id: 6,
    full_name: 'Chị Bích Ngọc',
    phone: '0945678901',
    plain_password: '123',
    status: 'active',
    children: [
      { id: 5, student_code: 'STU005', full_name: 'Vũ Khánh Linh', class_name: 'Luyện Thi Cambridge - Movers 2' }
    ]
  }
];

export const initialTuitionFees = [
  {
    id: 1,
    invoice_code: 'INV-202611-001',
    student_id: 1,
    student_name: 'Nguyễn Bảo An',
    student_code: 'STU001',
    parent_name: 'Chị Mai Lan',
    parent_phone: '0988111222',
    class_id: 1,
    class_name: 'Tiếng Anh Nhí - Starters 1',
    billing_month: '2026-11',
    amount: 850000,
    discount: 0,
    final_amount: 850000,
    due_date: '2026-11-10',
    status: 'paid',
    payment_date: '2026-11-08 14:30:00',
    payment_method: 'Chuyển khoản VietQR',
    qr_url: 'https://img.vietqr.io/image/MB-0912345678-compact2.png?amount=850000&addInfo=HP+STU001+202611&accountName=NGUYEN+THI+THUY',
    transfer_memo: 'HP STU001 202611'
  },
  {
    id: 2,
    invoice_code: 'INV-202611-002',
    student_id: 2,
    student_name: 'Trần Minh Khôi',
    student_code: 'STU002',
    parent_name: 'Anh Tuấn Anh',
    parent_phone: '0977333444',
    class_id: 1,
    class_name: 'Tiếng Anh Nhí - Starters 1',
    billing_month: '2026-11',
    amount: 850000,
    discount: 50000,
    final_amount: 800000,
    due_date: '2026-11-15',
    status: 'unpaid',
    payment_date: null,
    payment_method: null,
    qr_url: 'https://img.vietqr.io/image/MB-0912345678-compact2.png?amount=800000&addInfo=HP+STU002+202611&accountName=NGUYEN+THI+THUY',
    transfer_memo: 'HP STU002 202611'
  },
  {
    id: 3,
    invoice_code: 'INV-202611-003',
    student_id: 3,
    student_name: 'Lê Quỳnh Chi',
    student_code: 'STU003',
    parent_name: 'Chị Thu Hà',
    parent_phone: '0912999888',
    class_id: 1,
    class_name: 'Tiếng Anh Nhí - Starters 1',
    billing_month: '2026-11',
    amount: 850000,
    discount: 0,
    final_amount: 850000,
    due_date: '2026-11-15',
    status: 'paid',
    payment_date: '2026-11-12 09:15:00',
    payment_method: 'Chuyển khoản VietQR',
    qr_url: 'https://img.vietqr.io/image/MB-0912345678-compact2.png?amount=850000&addInfo=HP+STU003+202611&accountName=NGUYEN+THI+THUY',
    transfer_memo: 'HP STU003 202611'
  },
  {
    id: 4,
    invoice_code: 'INV-202611-004',
    student_id: 4,
    student_name: 'Phạm Hoàng Nam',
    student_code: 'STU004',
    parent_name: 'Anh Quốc Huy',
    parent_phone: '0903123456',
    class_id: 2,
    class_name: 'Luyện Thi Cambridge - Movers 2',
    billing_month: '2026-11',
    amount: 950000,
    discount: 0,
    final_amount: 950000,
    due_date: '2026-11-15',
    status: 'unpaid',
    payment_date: null,
    payment_method: null,
    qr_url: 'https://img.vietqr.io/image/MB-0912345678-compact2.png?amount=950000&addInfo=HP+STU004+202611&accountName=NGUYEN+THI+THUY',
    transfer_memo: 'HP STU004 202611'
  },
  {
    id: 5,
    invoice_code: 'INV-202611-005',
    student_id: 5,
    student_name: 'Vũ Khánh Linh',
    student_code: 'STU005',
    parent_name: 'Chị Bích Ngọc',
    parent_phone: '0945678901',
    class_id: 2,
    class_name: 'Luyện Thi Cambridge - Movers 2',
    billing_month: '2026-11',
    amount: 950000,
    discount: 0,
    final_amount: 950000,
    due_date: '2026-11-15',
    status: 'paid',
    payment_date: '2026-11-14 16:45:00',
    payment_method: 'Chuyển khoản VietQR',
    qr_url: 'https://img.vietqr.io/image/MB-0912345678-compact2.png?amount=950000&addInfo=HP+STU005+202611&accountName=NGUYEN+THI+THUY',
    transfer_memo: 'HP STU005 202611'
  },
  {
    id: 6,
    invoice_code: 'INV-202611-006',
    student_id: 6,
    student_name: 'Đỗ Gia Huy',
    student_code: 'STU006',
    parent_name: 'Anh Tuấn Anh',
    parent_phone: '0977333444',
    class_id: 3,
    class_name: 'Ngữ Pháp Chuyên Sâu - Flyers 1',
    billing_month: '2026-11',
    amount: 1100000,
    discount: 100000,
    final_amount: 1000000,
    due_date: '2026-11-15',
    status: 'unpaid',
    payment_date: null,
    payment_method: null,
    qr_url: 'https://img.vietqr.io/image/MB-0912345678-compact2.png?amount=1000000&addInfo=HP+STU006+202611&accountName=NGUYEN+THI+THUY',
    transfer_memo: 'HP STU006 202611'
  },
  {
    id: 7,
    invoice_code: 'INV-202611-007',
    student_id: 7,
    student_name: 'Hoàng Minh Châu',
    student_code: 'STU007',
    parent_name: 'Chị Mai Lan',
    parent_phone: '0988111222',
    class_id: 3,
    class_name: 'Ngữ Pháp Chuyên Sâu - Flyers 1',
    billing_month: '2026-11',
    amount: 1100000,
    discount: 100000,
    final_amount: 1000000,
    due_date: '2026-11-15',
    status: 'paid',
    payment_date: '2026-11-09 11:20:00',
    payment_method: 'Chuyển khoản VietQR',
    qr_url: 'https://img.vietqr.io/image/MB-0912345678-compact2.png?amount=1000000&addInfo=HP+STU007+202611&accountName=NGUYEN+THI+THUY',
    transfer_memo: 'HP STU007 202611'
  },
  {
    id: 8,
    invoice_code: 'INV-202611-008',
    student_id: 8,
    student_name: 'Nguyễn Đức Anh',
    student_code: 'STU008',
    parent_name: 'Chị Thanh Hương',
    parent_phone: '0933222111',
    class_id: 4,
    class_name: 'IELTS Junior Foundation',
    billing_month: '2026-11',
    amount: 1350000,
    discount: 0,
    final_amount: 1350000,
    due_date: '2026-11-15',
    status: 'paid',
    payment_date: '2026-11-10 10:00:00',
    payment_method: 'Tiền mặt',
    qr_url: 'https://img.vietqr.io/image/MB-0912345678-compact2.png?amount=1350000&addInfo=HP+STU008+202611&accountName=NGUYEN+THI+THUY',
    transfer_memo: 'HP STU008 202611'
  }
];

export const initialLessons = [
  {
    id: 1,
    class_id: 1,
    class_name: 'Tiếng Anh Nhí - Starters 1',
    title: 'Unit 5: Animals and Pets',
    lesson_date: '2026-11-18',
    start_time: '17:30',
    end_time: '19:00',
    content: 'Học từ vựng về động vật nuôi (cat, dog, bird, rabbit), cấu trúc câu I have a...',
    homework: 'Làm bài tập trang 24 sách bài tập, quay video đọc 5 từ vựng'
  },
  {
    id: 2,
    class_id: 1,
    class_name: 'Tiếng Anh Nhí - Starters 1',
    title: 'Unit 6: My Colorful World',
    lesson_date: '2026-11-20',
    start_time: '17:30',
    end_time: '19:00',
    content: 'Học 6 màu sắc và chơi trò ghép thẻ tranh',
    homework: 'Tô màu bức tranh động vật và nói 3 câu chỉ màu sắc'
  },
  {
    id: 3,
    class_id: 1,
    class_name: 'Tiếng Anh Nhí - Starters 1',
    title: 'Unit 7: Family & Home',
    lesson_date: '2026-11-22',
    start_time: '17:30',
    end_time: '19:00',
    content: 'Học từ vựng gia đình: Dad, Mom, Brother, Sister',
    homework: 'Vẽ tranh gia đình và giới thiệu tên các thành viên'
  },
  {
    id: 4,
    class_id: 2,
    class_name: 'Luyện Thi Cambridge - Movers 2',
    title: 'Grammar: Past Simple Tense',
    lesson_date: '2026-11-21',
    start_time: '18:00',
    end_time: '19:30',
    content: 'Thì quá khứ đơn với động từ to be và động từ có quy tắc -ed',
    homework: 'Làm bài tập trang 45-46 sách Cambridge Movers'
  }
];

export const initialSettings = {
  bank_name: 'MB Bank',
  bank_account: '0912345678',
  bank_owner: 'NGUYEN THI THUY',
  center_name: 'Thủy English Center',
  center_hotline: '0912 345 678',
  center_address: 'Số 18 Ngõ 42 Phố Vọng, Hai Bà Trưng, Hà Nội'
};
