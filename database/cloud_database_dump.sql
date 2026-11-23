PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT
        );
INSERT INTO roles VALUES(1,'admin','Cô Thủy Quản Trị & Giáo Viên');
INSERT INTO roles VALUES(2,'parent','Phụ huynh học sinh');
CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role_id INTEGER NOT NULL,
            full_name TEXT NOT NULL,
            email TEXT,
            phone TEXT UNIQUE,
            password_hash TEXT NOT NULL,
            plain_password TEXT, -- For teacher reference
            avatar TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (role_id) REFERENCES roles(id)
        );
INSERT INTO users VALUES(1,1,'Cô Thủy (Teacher & Admin)','cothuy.english@gmail.com','0912345678','$2y$12$IWBQpQdnP4Rkudeh5.4f3u0vgwpwYcRQPYayclOXRXvbCsM31tGkm','123456',NULL,'active','2026-11-22 15:41:47');
INSERT INTO users VALUES(2,2,'Chị Mai Lan (Mẹ bé Bảo An)','mailan@gmail.com','0988111222','$2y$12$IWBQpQdnP4Rkudeh5.4f3u0vgwpwYcRQPYayclOXRXvbCsM31tGkm','123456',NULL,'active','2026-11-22 15:41:47');
INSERT INTO users VALUES(3,2,'Anh Tuấn Anh (Bố bé Minh Khôi)','tuananh@gmail.com','0977333444','$2y$12$IWBQpQdnP4Rkudeh5.4f3u0vgwpwYcRQPYayclOXRXvbCsM31tGkm','123456',NULL,'active','2026-11-22 15:41:47');
INSERT INTO users VALUES(4,2,'Chị Thu Hà (Mẹ bé Quỳnh Chi)','thuha@gmail.com','0912999888','$2y$12$IWBQpQdnP4Rkudeh5.4f3u0vgwpwYcRQPYayclOXRXvbCsM31tGkm','123456',NULL,'active','2026-11-22 15:41:47');
INSERT INTO users VALUES(5,2,'Anh Quốc Huy (Bố bé Hoàng Nam)','quochuy@gmail.com','0903123456','$2y$12$IWBQpQdnP4Rkudeh5.4f3u0vgwpwYcRQPYayclOXRXvbCsM31tGkm','123456',NULL,'active','2026-11-22 15:41:47');
INSERT INTO users VALUES(6,2,'Chị Bích Ngọc (Mẹ bé Khánh Linh)','bichngoc@gmail.com','0945678901','$2y$12$IWBQpQdnP4Rkudeh5.4f3u0vgwpwYcRQPYayclOXRXvbCsM31tGkm','123456',NULL,'active','2026-11-22 15:41:47');
CREATE TABLE classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            level TEXT,
            room TEXT,
            tuition_type TEXT DEFAULT 'monthly',
            tuition_amount REAL NOT NULL DEFAULT 850000,
            start_date DATE,
            schedule_note TEXT,
            status TEXT DEFAULT 'active'
        , created_at DATETIME);
INSERT INTO classes VALUES(1,'STARTER-01','Tiếng Anh Nhí - Starters 1','Starters (6-7 tuổi)','Phòng 201','monthly',850000.0,'2026-09-01','Thứ 3 & Thứ 5 (17:30 - 19:00)','active','2026-11-23 15:33:39');
INSERT INTO classes VALUES(3,'FLYER-01','Ngữ Pháp Chuyên Sâu - Flyers 1','Flyers (10-11 tuổi)','Phòng 301','monthly',1100000.0,'2026-09-05','Chủ Nhật (08:30 - 11:00)','active','2026-11-23 15:33:39');
INSERT INTO classes VALUES(4,'IELTS-KIDS','IELTS Junior Foundation','IELTS Foundation (12-14 tuổi)','Phòng 302','monthly',1350000.0,'2026-09-10','Thứ 7 & CN (14:30 - 16:00)','active','2026-11-23 15:33:39');
CREATE TABLE students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_code TEXT NOT NULL UNIQUE,
            full_name TEXT NOT NULL,
            date_of_birth DATE,
            gender TEXT,
            parent_name TEXT,
            parent_phone TEXT,
            parent_user_id INTEGER,
            address TEXT,
            enrollment_date DATE,
            status TEXT DEFAULT 'studying',
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_user_id) REFERENCES users(id)
        );
INSERT INTO students VALUES(1,'STU001','Nguyễn Bảo An','2019-05-12','female','Chị Mai Lan','0988111222',2,NULL,'2026-09-01','studying','Phát âm chuẩn, rất hăng hái phát biểu','2026-11-22 15:41:47');
INSERT INTO students VALUES(2,'STU002','Trần Minh Khôi','2019-08-20','male','Anh Tuấn Anh','0977333444',3,NULL,'2026-09-01','studying','Thông minh, cần rèn thêm tính cẩn thận khi làm bài viết','2026-11-22 15:41:48');
INSERT INTO students VALUES(3,'STU003','Lê Quỳnh Chi','2019-02-14','female','Chị Thu Hà','0912999888',4,NULL,'2026-09-01','studying','Tiếp thu từ vựng cực nhanh, viết đẹp','2026-11-22 15:41:48');
INSERT INTO students VALUES(4,'STU004','Phạm Hoàng Nam','2018-11-03','male','Anh Quốc Huy','0903123456',5,NULL,'2026-09-01','studying','Kỹ năng phản xạ nói rất tốt','2026-11-22 15:41:48');
INSERT INTO students VALUES(5,'STU005','Vũ Khánh Linh','2018-04-18','female','Chị Bích Ngọc','0945678901',6,NULL,'2026-09-01','studying','Nghe tốt, giọng phát âm tự nhiên','2026-11-22 15:41:48');
INSERT INTO students VALUES(6,'STU006','Đỗ Gia Huy','2017-09-25','male','Anh Tuấn Anh','0977333444',3,NULL,'2026-09-05','studying','Anh trai bé Minh Khôi, lực học xuất sắc','2026-11-22 15:41:48');
INSERT INTO students VALUES(7,'STU007','Hoàng Minh Châu','2017-12-10','female','Chị Mai Lan','0988111222',2,NULL,'2026-09-05','studying','Chị gái bé Bảo An, học lớp Flyers 1','2026-11-22 15:41:48');
INSERT INTO students VALUES(8,'STU008','Nguyễn Đức Anh','2016-03-15','male','Chị Thanh Hương','0933222111',NULL,'','2026-09-10','studying','Nền tảng tốt, đang luyện thi học sinh giỏi','2026-11-22 15:41:48');
CREATE TABLE class_students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_id INTEGER NOT NULL,
            student_id INTEGER NOT NULL,
            joined_at DATE,
            status TEXT DEFAULT 'active',
            FOREIGN KEY (class_id) REFERENCES classes(id),
            FOREIGN KEY (student_id) REFERENCES students(id)
        );
INSERT INTO class_students VALUES(1,1,1,'2026-09-01','active');
INSERT INTO class_students VALUES(2,1,2,'2026-09-01','active');
INSERT INTO class_students VALUES(3,1,3,'2026-09-01','active');
INSERT INTO class_students VALUES(6,3,6,'2026-09-01','active');
INSERT INTO class_students VALUES(7,3,7,'2026-09-01','active');
INSERT INTO class_students VALUES(8,4,8,'2026-09-01','active');
CREATE TABLE lessons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            lesson_date DATE NOT NULL,
            start_time TEXT,
            end_time TEXT,
            content TEXT,
            homework TEXT,
            status TEXT DEFAULT 'completed',
            FOREIGN KEY (class_id) REFERENCES classes(id)
        );
INSERT INTO lessons VALUES(1,1,'Unit 5: Animals and Pets','2026-11-18','17:30','19:00','Học từ vựng về động vật nuôi (cat, dog, bird, rabbit), cấu trúc câu I have a...','Làm bài tập trang 24 sách bài tập, quay video đọc 5 từ vựng','completed');
INSERT INTO lessons VALUES(2,1,'Unit 6: My Colorful World','2026-11-20','17:30','19:00','Học 6 màu sắc và chơi trò ghép thẻ tranh','Tô màu bức tranh động vật và nói 3 câu chỉ màu sắc','completed');
INSERT INTO lessons VALUES(3,1,'Unit 5: Animals and Pets','2026-11-22','17:30','19:00','Học từ vựng về động vật nuôi (cat, dog, bird, rabbit), cấu trúc câu I have a...','Làm bài tập trang 24 sách bài tập, quay video đọc 5 từ vựng','completed');
CREATE TABLE attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lesson_id INTEGER NOT NULL,
            student_id INTEGER NOT NULL,
            status TEXT NOT NULL, -- 'present', 'late', 'excused', 'absent'
            note TEXT,
            recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (lesson_id) REFERENCES lessons(id),
            FOREIGN KEY (student_id) REFERENCES students(id),
            UNIQUE(lesson_id, student_id)
        );
INSERT INTO attendance VALUES(1,1,1,'present','Tương tác rất tốt, thuộc bài','2026-11-22 15:41:48');
INSERT INTO attendance VALUES(2,1,2,'present','Làm bài tập đầy đủ','2026-11-22 15:41:48');
INSERT INTO attendance VALUES(3,1,3,'late','Đến muộn 15p','2026-11-22 15:41:48');
INSERT INTO attendance VALUES(4,2,1,'present','Phát biểu hăng hái','2026-11-22 15:41:48');
INSERT INTO attendance VALUES(5,2,2,'excused','Mẹ xin phép đi khám bệnh','2026-11-22 15:41:48');
INSERT INTO attendance VALUES(6,2,3,'present','Làm bài tập tốt','2026-11-22 15:41:48');
INSERT INTO attendance VALUES(7,3,1,'present','','2026-11-22 15:45:45');
INSERT INTO attendance VALUES(8,3,2,'present','','2026-11-22 15:45:45');
INSERT INTO attendance VALUES(9,3,3,'present','','2026-11-22 15:45:45');
INSERT INTO attendance VALUES(13,3,4,'present','','2026-11-22 15:45:45');
INSERT INTO attendance VALUES(14,3,5,'present','','2026-11-22 15:45:45');
INSERT INTO attendance VALUES(15,3,6,'present','','2026-11-22 15:45:45');
INSERT INTO attendance VALUES(16,3,7,'present','','2026-11-22 15:45:45');
INSERT INTO attendance VALUES(17,3,8,'present','','2026-11-22 15:45:45');
CREATE TABLE tuition_fees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_code TEXT NOT NULL UNIQUE,
            student_id INTEGER NOT NULL,
            class_id INTEGER NOT NULL,
            billing_month TEXT NOT NULL,
            amount REAL NOT NULL,
            discount REAL DEFAULT 0,
            final_amount REAL NOT NULL,
            due_date DATE,
            status TEXT DEFAULT 'unpaid',
            payment_date DATETIME,
            payment_method TEXT,
            notes TEXT, created_at DATETIME,
            FOREIGN KEY (student_id) REFERENCES students(id),
            FOREIGN KEY (class_id) REFERENCES classes(id)
        );
INSERT INTO tuition_fees VALUES(1,'INV-202611-001',1,1,'2026-11',850000.0,0.0,850000.0,'2026-11-10','unpaid',NULL,'Chuyển khoản VietQR','Đã nhận chuyển khoản MB Bank','2026-11-23 15:33:39');
INSERT INTO tuition_fees VALUES(2,'INV-202611-002',2,1,'2026-11',850000.0,50000.0,800000.0,'2026-11-15','paid','2026-11-22 16:38:02','Chuyển khoản VietQR','Giảm 50k đăng ký sớm','2026-11-23 15:33:39');
INSERT INTO tuition_fees VALUES(3,'INV-202611-003',3,1,'2026-11',850000.0,0.0,850000.0,'2026-11-15','unpaid',NULL,'Chuyển khoản VietQR',NULL,'2026-11-23 15:33:39');
INSERT INTO tuition_fees VALUES(6,'INV-202611-006',6,3,'2026-11',1100000.0,100000.0,1000000.0,'2026-11-15','unpaid',NULL,NULL,'Học sinh có 2 anh em theo học','2026-11-23 15:33:39');
INSERT INTO tuition_fees VALUES(7,'INV-202611-007',7,3,'2026-11',1100000.0,100000.0,1000000.0,'2026-11-15','paid','2026-11-09 11:20:00','Chuyển khoản VietQR',NULL,'2026-11-23 15:33:39');
INSERT INTO tuition_fees VALUES(8,'INV-202611-008',8,4,'2026-11',1350000.0,0.0,1350000.0,'2026-11-15','paid','2026-11-10 10:00:00','Tiền mặt',NULL,'2026-11-23 15:33:39');
CREATE TABLE assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            class_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            score REAL,
            max_score REAL DEFAULT 10,
            evaluated_date DATE,
            teacher_comment TEXT,
            skills_breakdown TEXT,
            FOREIGN KEY (student_id) REFERENCES students(id),
            FOREIGN KEY (class_id) REFERENCES classes(id)
        );
INSERT INTO assessments VALUES(1,1,1,'Kiểm tra định kỳ Units 1-4',9.5,10.0,'2026-11-10','Bảo An tiến bộ vượt bậc, phát âm rõ ràng, nghe tốt.','{"Nghe (Listening)":10,"N\u00f3i (Speaking)":9.5,"\u0110\u1ecdc (Reading)":9,"Vi\u1ebft (Writing)":9.5}');
INSERT INTO assessments VALUES(2,2,1,'Kiểm tra định kỳ Units 1-4',8.0,10.0,'2026-11-10','Minh Khôi làm bài nghe rất tốt, cần cẩn thận hơn ở bài nối từ.','{"Nghe (Listening)":9,"N\u00f3i (Speaking)":8,"\u0110\u1ecdc (Reading)":7.5,"Vi\u1ebft (Writing)":7.5}');
INSERT INTO assessments VALUES(3,3,1,'Kiểm tra định kỳ Units 1-4',9.0,10.0,'2026-11-10','Quỳnh Chi chăm chỉ, bài viết trình bày sạch đẹp.','{"Nghe (Listening)":9,"N\u00f3i (Speaking)":9,"\u0110\u1ecdc (Reading)":9.5,"Vi\u1ebft (Writing)":8.5}');
CREATE TABLE materials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_id INTEGER,
            title TEXT NOT NULL,
            type TEXT DEFAULT 'document', -- 'document', 'audio', 'video', 'link'
            url TEXT,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
INSERT INTO materials VALUES(1,1,'File Audio nghe Unit 5 - Animals','audio','https://example.com/audio/unit5.mp3','File bài nghe phục vụ học sinh luyện nghe tại nhà','2026-11-22 15:41:48');
INSERT INTO materials VALUES(2,1,'Bộ Flashcard Từ Vựng Màu Sắc','document','https://example.com/flashcards/colors.pdf','Thẻ tranh màu sắc in để học sinh chơi trò chơi','2026-11-22 15:41:48');
INSERT INTO materials VALUES(3,2,'Sách Bài Tập Cambridge Movers Test 2','document','https://example.com/docs/movers_test2.pdf','Đề luyện thi Cambridge số 2','2026-11-22 15:41:48');
INSERT INTO materials VALUES(4,3,'Bảng Tổng Hợp 12 Thì Tiếng Anh','document','https://example.com/docs/12_tenses_summary.pdf','Tài liệu tóm tắt ngữ pháp trọng tâm','2026-11-22 15:41:48');
CREATE TABLE settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            setting_key TEXT UNIQUE NOT NULL,
            setting_value TEXT
        );
INSERT INTO settings VALUES(1,'bank_name','MB Bank');
INSERT INTO settings VALUES(2,'bank_account','0912345678');
INSERT INTO settings VALUES(3,'bank_owner','NGUYEN THI THUY');
INSERT INTO settings VALUES(4,'center_name','Thủy English Center');
INSERT INTO settings VALUES(5,'center_hotline','0912 345 678');
INSERT INTO settings VALUES(6,'center_address','Số 18 Ngõ 42 Phố Vọng, Hai Bà Trưng, Hà Nội');
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('roles',2);
INSERT INTO sqlite_sequence VALUES('settings',6);
INSERT INTO sqlite_sequence VALUES('users',6);
INSERT INTO sqlite_sequence VALUES('classes',4);
INSERT INTO sqlite_sequence VALUES('students',8);
INSERT INTO sqlite_sequence VALUES('class_students',8);
INSERT INTO sqlite_sequence VALUES('lessons',4);
INSERT INTO sqlite_sequence VALUES('attendance',25);
INSERT INTO sqlite_sequence VALUES('tuition_fees',8);
INSERT INTO sqlite_sequence VALUES('assessments',3);
INSERT INTO sqlite_sequence VALUES('materials',4);
COMMIT;
