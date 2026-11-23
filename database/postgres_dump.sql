-- ========================================================
-- THỦY ENGLISH - POSTGRESQL CLOUD DATABASE DUMP
-- Dành cho: Render PostgreSQL, Supabase, Neon
-- ========================================================

DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS tuition_fees CASCADE;
DROP TABLE IF EXISTS class_students CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS assessments CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- 1. ROLES
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);
INSERT INTO roles (id, name, description) VALUES 
(1, 'admin', 'Cô Thủy Quản Trị & Giáo Viên'),
(2, 'parent', 'Phụ huynh học sinh');

-- 2. USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    role_id INT NOT NULL REFERENCES roles(id),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    plain_password VARCHAR(100),
    avatar TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO users (id, role_id, full_name, email, phone, password_hash, plain_password, status) VALUES 
(1, 1, 'Cô Thủy (Teacher & Admin)', 'cothuy.english@gmail.com', '0912345678', '$2y$12$IWBQpQdnP4Rkudeh5.4f3u0vgwpwYcRQPYayclOXRXvbCsM31tGkm', '123456', 'active'),
(2, 2, 'Chị Mai Lan (Mẹ bé Bảo An)', 'mailan@gmail.com', '0988111222', '$2y$12$IWBQpQdnP4Rkudeh5.4f3u0vgwpwYcRQPYayclOXRXvbCsM31tGkm', '123456', 'active'),
(3, 2, 'Anh Tuấn Anh (Bố bé Minh Khôi)', 'tuananh@gmail.com', '0977333444', '$2y$12$IWBQpQdnP4Rkudeh5.4f3u0vgwpwYcRQPYayclOXRXvbCsM31tGkm', '123456', 'active'),
(4, 2, 'Chị Thu Hà (Mẹ bé Quỳnh Chi)', 'thuha@gmail.com', '0912999888', '$2y$12$IWBQpQdnP4Rkudeh5.4f3u0vgwpwYcRQPYayclOXRXvbCsM31tGkm', '123456', 'active'),
(5, 2, 'Anh Quốc Huy (Bố bé Hoàng Nam)', 'quochuy@gmail.com', '0903123456', '$2y$12$IWBQpQdnP4Rkudeh5.4f3u0vgwpwYcRQPYayclOXRXvbCsM31tGkm', '123456', 'active'),
(6, 2, 'Chị Bích Ngọc (Mẹ bé Khánh Linh)', 'bichngoc@gmail.com', '0945678901', '$2y$12$IWBQpQdnP4Rkudeh5.4f3u0vgwpwYcRQPYayclOXRXvbCsM31tGkm', '123456', 'active');

-- 3. CLASSES (3 Active Classes)
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    level VARCHAR(100),
    room VARCHAR(50),
    tuition_type VARCHAR(50) DEFAULT 'monthly',
    tuition_amount NUMERIC(15, 2) NOT NULL DEFAULT 850000,
    start_date DATE,
    schedule_note TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO classes (id, code, name, level, room, tuition_type, tuition_amount, schedule_note, start_date, status) VALUES 
(1, 'STARTER-01', 'Tiếng Anh Nhí - Starters 1', 'Starters (6-7 tuổi)', 'Phòng 201', 'monthly', 850000, 'Thứ 3 & Thứ 5 (17:30 - 19:00)', '2026-09-01', 'active'),
(3, 'FLYER-01', 'Ngữ Pháp Chuyên Sâu - Flyers 1', 'Flyers (10-11 tuổi)', 'Phòng 301', 'monthly', 1100000, 'Chủ Nhật (08:30 - 11:00)', '2026-09-05', 'active'),
(4, 'IELTS-KIDS', 'IELTS Junior Foundation', 'IELTS Foundation (12-14 tuổi)', 'Phòng 302', 'monthly', 1350000, 'Thứ 7 & CN (14:30 - 16:00)', '2026-09-10', 'active');

-- 4. STUDENTS
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    student_code VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    parent_name VARCHAR(150),
    parent_phone VARCHAR(50),
    parent_user_id INT REFERENCES users(id),
    address TEXT,
    enrollment_date DATE,
    status VARCHAR(50) DEFAULT 'studying',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO students (id, student_code, full_name, date_of_birth, gender, parent_name, parent_phone, parent_user_id, enrollment_date, status, notes) VALUES 
(1, 'STU001', 'Nguyễn Bảo An', '2019-05-12', 'female', 'Chị Mai Lan', '0988111222', 2, '2026-09-01', 'studying', 'Phát âm chuẩn, rất hăng hái phát biểu'),
(2, 'STU002', 'Trần Minh Khôi', '2019-08-20', 'male', 'Anh Tuấn Anh', '0977333444', 3, '2026-09-01', 'studying', 'Thông minh, cần rèn thêm tính cẩn thận'),
(3, 'STU003', 'Lê Quỳnh Chi', '2019-02-14', 'female', 'Chị Thu Hà', '0912999888', 4, '2026-09-01', 'studying', 'Tiếp thu từ vựng cực nhanh, viết đẹp'),
(4, 'STU004', 'Phạm Hoàng Nam', '2018-11-03', 'male', 'Anh Quốc Huy', '0903123456', 5, '2026-09-01', 'studying', 'Kỹ năng phản xạ nói rất tốt'),
(5, 'STU005', 'Vũ Khánh Linh', '2018-04-18', 'female', 'Chị Bích Ngọc', '0945678901', 6, '2026-09-01', 'studying', 'Nghe tốt, giọng phát âm tự nhiên'),
(6, 'STU006', 'Đỗ Gia Huy', '2017-09-25', 'male', 'Anh Tuấn Anh', '0977333444', 3, '2026-09-05', 'studying', 'Anh trai bé Minh Khôi, học tốt'),
(7, 'STU007', 'Hoàng Minh Châu', '2017-12-10', 'female', 'Chị Mai Lan', '0988111222', 2, '2026-09-05', 'studying', 'Chị gái bé Bảo An, học lớp Flyers 1'),
(8, 'STU008', 'Nguyễn Đức Anh', '2016-03-15', 'male', 'Chị Thanh Hương', '0933222111', NULL, '2026-09-10', 'studying', 'Nền tảng tốt, chăm chỉ');

-- 5. CLASS_STUDENTS
CREATE TABLE class_students (
    id SERIAL PRIMARY KEY,
    class_id INT NOT NULL REFERENCES classes(id),
    student_id INT NOT NULL REFERENCES students(id),
    joined_at DATE,
    status VARCHAR(20) DEFAULT 'active'
);
INSERT INTO class_students (class_id, student_id, joined_at) VALUES 
(1, 1, '2026-09-01'),
(1, 2, '2026-09-01'),
(1, 3, '2026-09-01'),
(3, 6, '2026-09-05'),
(3, 7, '2026-09-05'),
(4, 8, '2026-09-10');

-- 6. LESSONS
CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    class_id INT NOT NULL REFERENCES classes(id),
    title VARCHAR(200) NOT NULL,
    lesson_date DATE NOT NULL,
    start_time VARCHAR(20),
    end_time VARCHAR(20),
    content TEXT,
    homework TEXT,
    status VARCHAR(20) DEFAULT 'completed'
);
INSERT INTO lessons (id, class_id, title, lesson_date, start_time, end_time, content, homework) VALUES 
(1, 1, 'Unit 5: Animals and Pets', '2026-11-18', '17:30', '19:00', 'Học từ vựng về động vật nuôi (cat, dog, bird, rabbit), cấu trúc câu I have a...', 'Làm bài tập trang 24 sách bài tập, quay video đọc 5 từ vựng'),
(2, 1, 'Unit 6: My Colorful World', '2026-11-20', '17:30', '19:00', 'Học 6 màu sắc và chơi trò ghép thẻ tranh', 'Tô màu bức tranh động vật và nói 3 câu chỉ màu sắc'),
(3, 1, 'Unit 7: Family & Home', '2026-11-22', '17:30', '19:00', 'Học từ vựng gia đình: Dad, Mom, Brother, Sister', 'Vẽ tranh gia đình và giới thiệu tên các thành viên'),
(4, 3, 'Grammar: Past Simple Tense', '2026-11-22', '08:30', '11:00', 'Thì quá khứ đơn với động từ to be và động từ có quy tắc -ed', 'Làm bài tập trang 45-46 sách Cambridge');

-- 7. ATTENDANCE
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    lesson_id INT NOT NULL REFERENCES lessons(id),
    student_id INT NOT NULL REFERENCES students(id),
    status VARCHAR(20) NOT NULL,
    note TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lesson_id, student_id)
);
INSERT INTO attendance (lesson_id, student_id, status, note) VALUES 
(1, 1, 'present', 'Tương tác rất tốt, thuộc bài'),
(1, 2, 'present', 'Làm bài tập đầy đủ'),
(1, 3, 'late', 'Đến muộn 15p'),
(2, 1, 'present', 'Phát biểu hăng hái'),
(2, 2, 'excused', 'Mẹ xin phép đi khám bệnh'),
(2, 3, 'present', 'Làm bài tập tốt'),
(3, 1, 'present', 'Học rất chăm chỉ'),
(3, 2, 'present', 'Hôm nay rất tập trung'),
(3, 3, 'present', 'Hát tiếng Anh rất hay');

-- 8. TUITION_FEES
CREATE TABLE tuition_fees (
    id SERIAL PRIMARY KEY,
    invoice_code VARCHAR(50) NOT NULL UNIQUE,
    student_id INT NOT NULL REFERENCES students(id),
    class_id INT NOT NULL REFERENCES classes(id),
    billing_month VARCHAR(20) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    discount NUMERIC(15, 2) DEFAULT 0,
    final_amount NUMERIC(15, 2) NOT NULL,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'unpaid',
    payment_date TIMESTAMP,
    payment_method VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO tuition_fees (invoice_code, student_id, class_id, billing_month, amount, discount, final_amount, due_date, status, payment_date, payment_method, notes) VALUES 
('INV-202611-001', 1, 1, '2026-11', 850000, 0, 850000, '2026-11-10', 'paid', '2026-11-08 14:30:00', 'Chuyển khoản VietQR', 'Đã nhận chuyển khoản MB Bank'),
('INV-202611-002', 2, 1, '2026-11', 850000, 50000, 800000, '2026-11-15', 'unpaid', NULL, NULL, 'Giảm 50k đăng ký sớm'),
('INV-202611-003', 3, 1, '2026-11', 850000, 0, 850000, '2026-11-15', 'paid', '2026-11-12 09:15:00', 'Chuyển khoản VietQR', NULL),
('INV-202611-006', 6, 3, '2026-11', 1100000, 100000, 1000000, '2026-11-15', 'unpaid', NULL, NULL, 'Học sinh có 2 anh em theo học'),
('INV-202611-007', 7, 3, '2026-11', 1100000, 100000, 1000000, '2026-11-15', 'paid', '2026-11-09 11:20:00', 'Chuyển khoản VietQR', NULL),
('INV-202611-008', 8, 4, '2026-11', 1350000, 0, 1350000, '2026-11-15', 'paid', '2026-11-10 10:00:00', 'Tiền mặt', NULL);

-- 9. ASSESSMENTS
CREATE TABLE assessments (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id),
    class_id INT NOT NULL REFERENCES classes(id),
    title VARCHAR(200) NOT NULL,
    score NUMERIC(5, 2),
    max_score NUMERIC(5, 2) DEFAULT 10,
    evaluated_date DATE,
    teacher_comment TEXT,
    skills_breakdown TEXT
);
INSERT INTO assessments (student_id, class_id, title, score, max_score, evaluated_date, teacher_comment, skills_breakdown) VALUES 
(1, 1, 'Kiểm tra định kỳ Units 1-4', 9.5, 10, '2026-11-10', 'Bảo An tiến bộ vượt bậc, phát âm rõ ràng, nghe tốt.', '{"Nghe (Listening)":10,"Nói (Speaking)":9.5,"Đọc (Reading)":9,"Viết (Writing)":9.5}'),
(2, 1, 'Kiểm tra định kỳ Units 1-4', 8.0, 10, '2026-11-10', 'Minh Khôi làm bài nghe rất tốt, cần cẩn thận hơn ở bài nối từ.', '{"Nghe (Listening)":9,"Nói (Speaking)":8,"Đọc (Reading)":7.5,"Viết (Writing)":7.5}'),
(3, 1, 'Kiểm tra định kỳ Units 1-4', 9.0, 10, '2026-11-10', 'Quỳnh Chi chăm chỉ, bài viết trình bày sạch đẹp.', '{"Nghe (Listening)":9,"Nói (Speaking)":9,"Đọc (Reading)":9.5,"Viết (Writing)":8.5}');

-- 10. MATERIALS
CREATE TABLE materials (
    id SERIAL PRIMARY KEY,
    class_id INT,
    title VARCHAR(200) NOT NULL,
    type VARCHAR(50) DEFAULT 'document',
    url TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO materials (class_id, title, type, url, description) VALUES 
(1, 'File Audio nghe Unit 5 - Animals', 'audio', 'https://example.com/audio/unit5.mp3', 'File bài nghe phục vụ học sinh luyện nghe tại nhà'),
(1, 'Bộ Flashcard Từ Vựng Màu Sắc', 'document', 'https://example.com/flashcards/colors.pdf', 'Thẻ tranh màu sắc in để học sinh chơi trò chơi'),
(3, 'Bảng Tổng Hợp 12 Thì Tiếng Anh', 'document', 'https://example.com/docs/12_tenses_summary.pdf', 'Tài liệu tóm tắt ngữ pháp trọng tâm');

-- 11. SETTINGS
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT
);
INSERT INTO settings (setting_key, setting_value) VALUES 
('bank_name', 'MB Bank'),
('bank_account', '0912345678'),
('bank_owner', 'NGUYEN THI THUY'),
('center_name', 'Thủy English Center'),
('center_hotline', '0912 345 678'),
('center_address', 'Số 18 Ngõ 42 Phố Vọng, Hai Bà Trưng, Hà Nội');

-- Reset Sequences to highest IDs
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('classes_id_seq', (SELECT MAX(id) FROM classes));
SELECT setval('students_id_seq', (SELECT MAX(id) FROM students));
SELECT setval('class_students_id_seq', (SELECT MAX(id) FROM class_students));
SELECT setval('lessons_id_seq', (SELECT MAX(id) FROM lessons));
SELECT setval('attendance_id_seq', (SELECT MAX(id) FROM attendance));
SELECT setval('tuition_fees_id_seq', (SELECT MAX(id) FROM tuition_fees));
SELECT setval('assessments_id_seq', (SELECT MAX(id) FROM assessments));
SELECT setval('materials_id_seq', (SELECT MAX(id) FROM materials));
SELECT setval('settings_id_seq', (SELECT MAX(id) FROM settings));
