<?php
namespace Config;

use PDO;
use PDOException;

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $dbUrl = getenv('DATABASE_URL') ?: '';
            $dbHost = getenv('DB_HOST') ?: '';
            $dbName = getenv('DB_NAME') ?: '';
            $dbUser = getenv('DB_USER') ?: '';
            $dbPass = getenv('DB_PASS') ?: '';
            $dbPort = getenv('DB_PORT') ?: '';
            $dbType = strtolower(getenv('DB_TYPE') ?: '');

            // 1. If DATABASE_URL is provided (Standard on Render, Supabase, Neon, TiDB)
            if (!empty($dbUrl)) {
                $parsed = parse_url($dbUrl);
                if ($parsed && isset($parsed['host'])) {
                    $scheme = strtolower($parsed['scheme'] ?? '');
                    if (in_array($scheme, ['postgres', 'postgresql', 'pgsql'])) {
                        $dbType = 'pgsql';
                        $dbPort = $parsed['port'] ?? '5432';
                    } else {
                        $dbType = 'mysql';
                        $dbPort = $parsed['port'] ?? '3306';
                    }
                    $dbHost = $parsed['host'];
                    $dbUser = isset($parsed['user']) ? urldecode($parsed['user']) : '';
                    $dbPass = isset($parsed['pass']) ? urldecode($parsed['pass']) : '';
                    $dbName = isset($parsed['path']) ? ltrim($parsed['path'], '/') : '';
                }
            }

            // 2. Attempt Cloud Database Connection if DB_HOST is present
            if (!empty($dbHost)) {
                try {
                    if ($dbType === 'pgsql' || $dbType === 'postgres') {
                        $port = !empty($dbPort) ? $dbPort : '5432';
                        // sslmode: prefer or require
                        $dsn = "pgsql:host={$dbHost};port={$port};dbname={$dbName};sslmode=prefer";
                        self::$instance = new PDO($dsn, $dbUser, $dbPass, [
                            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                            PDO::ATTR_TIMEOUT => 8
                        ]);
                        self::checkAndMigratePgSQL(self::$instance);
                    } else {
                        // MySQL / TiDB
                        $port = !empty($dbPort) ? $dbPort : '3306';
                        $dsn = "mysql:host={$dbHost};port={$port};dbname={$dbName};charset=utf8mb4";
                        self::$instance = new PDO($dsn, $dbUser, $dbPass, [
                            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                            PDO::ATTR_TIMEOUT => 8,
                            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
                        ]);
                        self::checkAndMigrateMySQL(self::$instance);
                    }
                } catch (\Throwable $e) {
                    error_log("[Cloud DB Connection Failed]: " . $e->getMessage() . ". Falling back to local SQLite.");
                    self::$instance = null;
                }
            }

            // 3. Fallback to Local SQLite if Cloud DB is not configured or failed
            if (self::$instance === null) {
                $dbPath = __DIR__ . '/../database/app.db';
                $isNew = !file_exists($dbPath);
                self::$instance = new PDO("sqlite:" . $dbPath);
                self::$instance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$instance->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

                if ($isNew) {
                    self::initSQLiteSchema(self::$instance);
                } else {
                    // Check if created_at column exists in classes table
                    try {
                        self::$instance->query("SELECT created_at FROM classes LIMIT 1");
                    } catch (\Throwable $th) {
                        try {
                            self::$instance->exec("ALTER TABLE classes ADD COLUMN created_at DATETIME");
                        } catch (\Throwable $ex) {}
                    }
                }
            }
        }
        return self::$instance;
    }

    // ==========================================
    // POSTGRESQL SCHEMA & SEED
    // ==========================================
    private static function checkAndMigratePgSQL(PDO $db): void {
        try {
            $db->query("SELECT 1 FROM users LIMIT 1");
        } catch (\Throwable $e) {
            // Tables do not exist, create PostgreSQL Schema
            $schema = "
            CREATE TABLE IF NOT EXISTS roles (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL UNIQUE,
                description TEXT
            );

            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                role_id INT NOT NULL,
                full_name VARCHAR(150) NOT NULL,
                email VARCHAR(150),
                phone VARCHAR(50) UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                plain_password VARCHAR(100),
                avatar TEXT,
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (role_id) REFERENCES roles(id)
            );

            CREATE TABLE IF NOT EXISTS classes (
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

            CREATE TABLE IF NOT EXISTS students (
                id SERIAL PRIMARY KEY,
                student_code VARCHAR(50) NOT NULL UNIQUE,
                full_name VARCHAR(150) NOT NULL,
                date_of_birth DATE,
                gender VARCHAR(20),
                parent_name VARCHAR(150),
                parent_phone VARCHAR(50),
                parent_user_id INT,
                address TEXT,
                enrollment_date DATE,
                status VARCHAR(50) DEFAULT 'studying',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (parent_user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS class_students (
                id SERIAL PRIMARY KEY,
                class_id INT NOT NULL,
                student_id INT NOT NULL,
                joined_at DATE,
                status VARCHAR(20) DEFAULT 'active',
                FOREIGN KEY (class_id) REFERENCES classes(id),
                FOREIGN KEY (student_id) REFERENCES students(id)
            );

            CREATE TABLE IF NOT EXISTS lessons (
                id SERIAL PRIMARY KEY,
                class_id INT NOT NULL,
                title VARCHAR(200) NOT NULL,
                lesson_date DATE NOT NULL,
                start_time VARCHAR(20),
                end_time VARCHAR(20),
                content TEXT,
                homework TEXT,
                status VARCHAR(20) DEFAULT 'completed',
                FOREIGN KEY (class_id) REFERENCES classes(id)
            );

            CREATE TABLE IF NOT EXISTS attendance (
                id SERIAL PRIMARY KEY,
                lesson_id INT NOT NULL,
                student_id INT NOT NULL,
                status VARCHAR(20) NOT NULL,
                note TEXT,
                recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (lesson_id) REFERENCES lessons(id),
                FOREIGN KEY (student_id) REFERENCES students(id),
                UNIQUE(lesson_id, student_id)
            );

            CREATE TABLE IF NOT EXISTS tuition_fees (
                id SERIAL PRIMARY KEY,
                invoice_code VARCHAR(50) NOT NULL UNIQUE,
                student_id INT NOT NULL,
                class_id INT NOT NULL,
                billing_month VARCHAR(20) NOT NULL,
                amount NUMERIC(15, 2) NOT NULL,
                discount NUMERIC(15, 2) DEFAULT 0,
                final_amount NUMERIC(15, 2) NOT NULL,
                due_date DATE,
                status VARCHAR(20) DEFAULT 'unpaid',
                payment_date TIMESTAMP,
                payment_method VARCHAR(100),
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id),
                FOREIGN KEY (class_id) REFERENCES classes(id)
            );

            CREATE TABLE IF NOT EXISTS assessments (
                id SERIAL PRIMARY KEY,
                student_id INT NOT NULL,
                class_id INT NOT NULL,
                title VARCHAR(200) NOT NULL,
                score NUMERIC(5, 2),
                max_score NUMERIC(5, 2) DEFAULT 10,
                evaluated_date DATE,
                teacher_comment TEXT,
                skills_breakdown TEXT,
                FOREIGN KEY (student_id) REFERENCES students(id),
                FOREIGN KEY (class_id) REFERENCES classes(id)
            );

            CREATE TABLE IF NOT EXISTS materials (
                id SERIAL PRIMARY KEY,
                class_id INT,
                title VARCHAR(200) NOT NULL,
                type VARCHAR(50) DEFAULT 'document',
                url TEXT,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS settings (
                id SERIAL PRIMARY KEY,
                setting_key VARCHAR(100) UNIQUE NOT NULL,
                setting_value TEXT
            );
            ";
            $db->exec($schema);
            self::seedRichData($db);
        }
    }

    // ==========================================
    // MYSQL / TIDB SCHEMA & SEED
    // ==========================================
    private static function checkAndMigrateMySQL(PDO $db): void {
        try {
            $db->query("SELECT 1 FROM users LIMIT 1");
        } catch (\Throwable $e) {
            $schema = "
            CREATE TABLE IF NOT EXISTS roles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL UNIQUE,
                description TEXT
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                role_id INT NOT NULL,
                full_name VARCHAR(150) NOT NULL,
                email VARCHAR(150),
                phone VARCHAR(50) UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                plain_password VARCHAR(100),
                avatar TEXT,
                status VARCHAR(20) DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (role_id) REFERENCES roles(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

            CREATE TABLE IF NOT EXISTS classes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) NOT NULL UNIQUE,
                name VARCHAR(150) NOT NULL,
                level VARCHAR(100),
                room VARCHAR(50),
                tuition_type VARCHAR(50) DEFAULT 'monthly',
                tuition_amount DECIMAL(15, 2) NOT NULL DEFAULT 850000,
                start_date DATE,
                schedule_note TEXT,
                status VARCHAR(20) DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

            CREATE TABLE IF NOT EXISTS students (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_code VARCHAR(50) NOT NULL UNIQUE,
                full_name VARCHAR(150) NOT NULL,
                date_of_birth DATE,
                gender VARCHAR(20),
                parent_name VARCHAR(150),
                parent_phone VARCHAR(50),
                parent_user_id INT,
                address TEXT,
                enrollment_date DATE,
                status VARCHAR(50) DEFAULT 'studying',
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (parent_user_id) REFERENCES users(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

            CREATE TABLE IF NOT EXISTS class_students (
                id INT AUTO_INCREMENT PRIMARY KEY,
                class_id INT NOT NULL,
                student_id INT NOT NULL,
                joined_at DATE,
                status VARCHAR(20) DEFAULT 'active',
                FOREIGN KEY (class_id) REFERENCES classes(id),
                FOREIGN KEY (student_id) REFERENCES students(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

            CREATE TABLE IF NOT EXISTS lessons (
                id INT AUTO_INCREMENT PRIMARY KEY,
                class_id INT NOT NULL,
                title VARCHAR(200) NOT NULL,
                lesson_date DATE NOT NULL,
                start_time VARCHAR(20),
                end_time VARCHAR(20),
                content TEXT,
                homework TEXT,
                status VARCHAR(20) DEFAULT 'completed',
                FOREIGN KEY (class_id) REFERENCES classes(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

            CREATE TABLE IF NOT EXISTS attendance (
                id INT AUTO_INCREMENT PRIMARY KEY,
                lesson_id INT NOT NULL,
                student_id INT NOT NULL,
                status VARCHAR(20) NOT NULL,
                note TEXT,
                recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (lesson_id) REFERENCES lessons(id),
                FOREIGN KEY (student_id) REFERENCES students(id),
                UNIQUE KEY unique_lesson_student (lesson_id, student_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

            CREATE TABLE IF NOT EXISTS tuition_fees (
                id INT AUTO_INCREMENT PRIMARY KEY,
                invoice_code VARCHAR(50) NOT NULL UNIQUE,
                student_id INT NOT NULL,
                class_id INT NOT NULL,
                billing_month VARCHAR(20) NOT NULL,
                amount DECIMAL(15, 2) NOT NULL,
                discount DECIMAL(15, 2) DEFAULT 0,
                final_amount DECIMAL(15, 2) NOT NULL,
                due_date DATE,
                status VARCHAR(20) DEFAULT 'unpaid',
                payment_date DATETIME,
                payment_method VARCHAR(100),
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id),
                FOREIGN KEY (class_id) REFERENCES classes(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

            CREATE TABLE IF NOT EXISTS assessments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                class_id INT NOT NULL,
                title VARCHAR(200) NOT NULL,
                score DECIMAL(5, 2),
                max_score DECIMAL(5, 2) DEFAULT 10,
                evaluated_date DATE,
                teacher_comment TEXT,
                skills_breakdown TEXT,
                FOREIGN KEY (student_id) REFERENCES students(id),
                FOREIGN KEY (class_id) REFERENCES classes(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

            CREATE TABLE IF NOT EXISTS materials (
                id INT AUTO_INCREMENT PRIMARY KEY,
                class_id INT,
                title VARCHAR(200) NOT NULL,
                type VARCHAR(50) DEFAULT 'document',
                url TEXT,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

            CREATE TABLE IF NOT EXISTS settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                setting_key VARCHAR(100) UNIQUE NOT NULL,
                setting_value TEXT
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            ";
            $db->exec($schema);
            self::seedRichData($db);
        }
    }

    // ==========================================
    // SQLITE SCHEMA (LOCAL FALLBACK)
    // ==========================================
    public static function initSQLiteSchema(PDO $db): void {
        $schema = "
        CREATE TABLE IF NOT EXISTS roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT
        );

        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role_id INTEGER NOT NULL,
            full_name TEXT NOT NULL,
            email TEXT,
            phone TEXT UNIQUE,
            password_hash TEXT NOT NULL,
            plain_password TEXT,
            avatar TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (role_id) REFERENCES roles(id)
        );

        CREATE TABLE IF NOT EXISTS classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            level TEXT,
            room TEXT,
            tuition_type TEXT DEFAULT 'monthly',
            tuition_amount REAL NOT NULL DEFAULT 850000,
            start_date DATE,
            schedule_note TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS students (
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

        CREATE TABLE IF NOT EXISTS class_students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_id INTEGER NOT NULL,
            student_id INTEGER NOT NULL,
            joined_at DATE,
            status TEXT DEFAULT 'active',
            FOREIGN KEY (class_id) REFERENCES classes(id),
            FOREIGN KEY (student_id) REFERENCES students(id)
        );

        CREATE TABLE IF NOT EXISTS lessons (
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

        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lesson_id INTEGER NOT NULL,
            student_id INTEGER NOT NULL,
            status TEXT NOT NULL,
            note TEXT,
            recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (lesson_id) REFERENCES lessons(id),
            FOREIGN KEY (student_id) REFERENCES students(id),
            UNIQUE(lesson_id, student_id)
        );

        CREATE TABLE IF NOT EXISTS tuition_fees (
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
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(id),
            FOREIGN KEY (class_id) REFERENCES classes(id)
        );

        CREATE TABLE IF NOT EXISTS assessments (
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

        CREATE TABLE IF NOT EXISTS materials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_id INTEGER,
            title TEXT NOT NULL,
            type TEXT DEFAULT 'document',
            url TEXT,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            setting_key TEXT UNIQUE NOT NULL,
            setting_value TEXT
        );
        ";

        $db->exec($schema);
        self::seedRichData($db);
    }

    // ==========================================
    // SEED INITIAL PRODUCTION DATA
    // ==========================================
    public static function seedRichData(PDO $db): void {
        // Clear old
        try {
            $db->exec("DELETE FROM attendance");
            $db->exec("DELETE FROM tuition_fees");
            $db->exec("DELETE FROM class_students");
            $db->exec("DELETE FROM lessons");
            $db->exec("DELETE FROM assessments");
            $db->exec("DELETE FROM materials");
            $db->exec("DELETE FROM students");
            $db->exec("DELETE FROM classes");
            $db->exec("DELETE FROM users");
            $db->exec("DELETE FROM roles");
            $db->exec("DELETE FROM settings");
        } catch (\Throwable $th) {}

        // 1. Roles
        $db->exec("INSERT INTO roles (id, name, description) VALUES (1, 'admin', 'Cô Thủy Quản Trị & Giáo Viên')");
        $db->exec("INSERT INTO roles (id, name, description) VALUES (2, 'parent', 'Phụ huynh học sinh')");

        // Passwords (default '123456')
        $hashed = password_hash('123456', PASSWORD_BCRYPT);

        // 2. Settings
        $stmtS = $db->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)");
        $stmtS->execute(['bank_name', 'MB Bank']);
        $stmtS->execute(['bank_account', '0912345678']);
        $stmtS->execute(['bank_owner', 'NGUYEN THI THUY']);
        $stmtS->execute(['center_name', 'Thủy English Center']);
        $stmtS->execute(['center_hotline', '0912 345 678']);
        $stmtS->execute(['center_address', 'Số 18 Ngõ 42 Phố Vọng, Hai Bà Trưng, Hà Nội']);

        // 3. Users: Co Thuy & 5 Parents
        $stmtU = $db->prepare("INSERT INTO users (id, role_id, full_name, email, phone, password_hash, plain_password, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'active')");
        $stmtU->execute([1, 1, 'Cô Thủy (Teacher & Admin)', 'cothuy.english@gmail.com', '0912345678', $hashed, '123456']);
        $stmtU->execute([2, 2, 'Chị Mai Lan (Mẹ bé Bảo An)', 'mailan@gmail.com', '0988111222', $hashed, '123456']);
        $stmtU->execute([3, 2, 'Anh Tuấn Anh (Bố bé Minh Khôi)', 'tuananh@gmail.com', '0977333444', $hashed, '123456']);
        $stmtU->execute([4, 2, 'Chị Thu Hà (Mẹ bé Quỳnh Chi)', 'thuha@gmail.com', '0912999888', $hashed, '123456']);
        $stmtU->execute([5, 2, 'Anh Quốc Huy (Bố bé Hoàng Nam)', 'quochuy@gmail.com', '0903123456', $hashed, '123456']);
        $stmtU->execute([6, 2, 'Chị Bích Ngọc (Mẹ bé Khánh Linh)', 'bichngoc@gmail.com', '0945678901', $hashed, '123456']);

        // 4. Exact 3 Active Classes
        $stmtC = $db->prepare("INSERT INTO classes (id, code, name, level, room, tuition_type, tuition_amount, schedule_note, start_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')");
        $stmtC->execute([1, 'STARTER-01', 'Tiếng Anh Nhí - Starters 1', 'Starters (6-7 tuổi)', 'Phòng 201', 'monthly', 850000, 'Thứ 3 & Thứ 5 (17:30 - 19:00)', '2026-09-01']);
        $stmtC->execute([3, 'FLYER-01', 'Ngữ Pháp Chuyên Sâu - Flyers 1', 'Flyers (10-11 tuổi)', 'Phòng 301', 'monthly', 1100000, 'Chủ Nhật (08:30 - 11:00)', '2026-09-05']);
        $stmtC->execute([4, 'IELTS-KIDS', 'IELTS Junior Foundation', 'IELTS Foundation (12-14 tuổi)', 'Phòng 302', 'monthly', 1350000, 'Thứ 7 & CN (14:30 - 16:00)', '2026-09-10']);

        // 5. Students
        $stmtSt = $db->prepare("INSERT INTO students (id, student_code, full_name, date_of_birth, gender, parent_name, parent_phone, parent_user_id, enrollment_date, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'studying', ?)");
        $stmtSt->execute([1, 'STU001', 'Nguyễn Bảo An', '2019-05-12', 'female', 'Chị Mai Lan', '0988111222', 2, '2026-09-01', 'Phát âm chuẩn, rất hăng hái phát biểu']);
        $stmtSt->execute([2, 'STU002', 'Trần Minh Khôi', '2019-08-20', 'male', 'Anh Tuấn Anh', '0977333444', 3, '2026-09-01', 'Thông minh, cần rèn thêm tính cẩn thận']);
        $stmtSt->execute([3, 'STU003', 'Lê Quỳnh Chi', '2019-02-14', 'female', 'Chị Thu Hà', '0912999888', 4, '2026-09-01', 'Tiếp thu từ vựng cực nhanh, viết đẹp']);
        $stmtSt->execute([4, 'STU004', 'Phạm Hoàng Nam', '2018-11-03', 'male', 'Anh Quốc Huy', '0903123456', 5, '2026-09-01', 'Kỹ năng phản xạ nói rất tốt']);
        $stmtSt->execute([5, 'STU005', 'Vũ Khánh Linh', '2018-04-18', 'female', 'Chị Bích Ngọc', '0945678901', 6, '2026-09-01', 'Nghe tốt, giọng phát âm tự nhiên']);
        $stmtSt->execute([6, 'STU006', 'Đỗ Gia Huy', '2017-09-25', 'male', 'Anh Tuấn Anh', '0977333444', 3, '2026-09-05', 'Anh trai bé Minh Khôi, học tốt']);
        $stmtSt->execute([7, 'STU007', 'Hoàng Minh Châu', '2017-12-10', 'female', 'Chị Mai Lan', '0988111222', 2, '2026-09-05', 'Chị gái bé Bảo An, học lớp Flyers 1']);
        $stmtSt->execute([8, 'STU008', 'Nguyễn Đức Anh', '2016-03-15', 'male', 'Chị Thanh Hương', '0933222111', null, '2026-09-10', 'Nền tảng tốt, chăm chỉ']);

        // 6. Class Students
        $stmtCS = $db->prepare("INSERT INTO class_students (class_id, student_id, joined_at) VALUES (?, ?, '2026-09-01')");
        $stmtCS->execute([1, 1]); // Bao An -> Starters
        $stmtCS->execute([1, 2]); // Minh Khoi -> Starters
        $stmtCS->execute([1, 3]); // Quynh Chi -> Starters
        $stmtCS->execute([3, 6]); // Gia Huy -> Flyers
        $stmtCS->execute([3, 7]); // Minh Chau -> Flyers
        $stmtCS->execute([4, 8]); // Duc Anh -> IELTS

        // 7. Lessons
        $stmtL = $db->prepare("INSERT INTO lessons (id, class_id, title, lesson_date, start_time, end_time, content, homework) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmtL->execute([1, 1, 'Unit 5: Animals and Pets', '2026-11-18', '17:30', '19:00', 'Học từ vựng về động vật nuôi (cat, dog, bird, rabbit), cấu trúc câu I have a...', 'Làm bài tập trang 24 sách bài tập, quay video đọc 5 từ vựng']);
        $stmtL->execute([2, 1, 'Unit 6: My Colorful World', '2026-11-20', '17:30', '19:00', 'Học 6 màu sắc và chơi trò ghép thẻ tranh', 'Tô màu bức tranh động vật và nói 3 câu chỉ màu sắc']);
        $stmtL->execute([3, 1, 'Unit 7: Family & Home', '2026-11-22', '17:30', '19:00', 'Học từ vựng gia đình: Dad, Mom, Brother, Sister', 'Vẽ tranh gia đình và giới thiệu tên các thành viên']);
        $stmtL->execute([4, 3, 'Grammar: Past Simple Tense', '2026-11-22', '08:30', '11:00', 'Thì quá khứ đơn với động từ to be và động từ có quy tắc -ed', 'Làm bài tập trang 45-46 sách Cambridge']);

        // 8. Attendance
        $stmtA = $db->prepare("INSERT INTO attendance (lesson_id, student_id, status, note) VALUES (?, ?, ?, ?)");
        $stmtA->execute([1, 1, 'present', 'Tương tác rất tốt, thuộc bài']);
        $stmtA->execute([1, 2, 'present', 'Làm bài tập đầy đủ']);
        $stmtA->execute([1, 3, 'late', 'Đến muộn 15p']);
        $stmtA->execute([2, 1, 'present', 'Phát biểu hăng hái']);
        $stmtA->execute([2, 2, 'excused', 'Mẹ xin phép đi khám bệnh']);
        $stmtA->execute([2, 3, 'present', 'Làm bài tập tốt']);
        $stmtA->execute([3, 1, 'present', 'Học rất chăm chỉ']);
        $stmtA->execute([3, 2, 'present', 'Hôm nay rất tập trung']);
        $stmtA->execute([3, 3, 'present', 'Hát tiếng Anh rất hay']);

        // 9. Tuition Fees
        $stmtT = $db->prepare("INSERT INTO tuition_fees (invoice_code, student_id, class_id, billing_month, amount, discount, final_amount, due_date, status, payment_date, payment_method, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmtT->execute(['INV-202611-001', 1, 1, '2026-11', 850000, 0, 850000, '2026-11-10', 'paid', '2026-11-08 14:30:00', 'Chuyển khoản VietQR', 'Đã nhận chuyển khoản MB Bank']);
        $stmtT->execute(['INV-202611-002', 2, 1, '2026-11', 850000, 50000, 800000, '2026-11-15', 'unpaid', null, null, 'Giảm 50k đăng ký sớm']);
        $stmtT->execute(['INV-202611-003', 3, 1, '2026-11', 850000, 0, 850000, '2026-11-15', 'paid', '2026-11-12 09:15:00', 'Chuyển khoản VietQR', null]);
        $stmtT->execute(['INV-202611-006', 6, 3, '2026-11', 1100000, 100000, 1000000, '2026-11-15', 'unpaid', null, null, 'Học sinh có 2 anh em theo học']);
        $stmtT->execute(['INV-202611-007', 7, 3, '2026-11', 1100000, 100000, 1000000, '2026-11-15', 'paid', '2026-11-09 11:20:00', 'Chuyển khoản VietQR', null]);
        $stmtT->execute(['INV-202611-008', 8, 4, '2026-11', 1350000, 0, 1350000, '2026-11-15', 'paid', '2026-11-10 10:00:00', 'Tiền mặt', null]);

        // 10. Assessments
        $stmtAs = $db->prepare("INSERT INTO assessments (student_id, class_id, title, score, max_score, evaluated_date, teacher_comment, skills_breakdown) VALUES (?, ?, ?, ?, 10, ?, ?, ?)");
        $stmtAs->execute([1, 1, 'Kiểm tra định kỳ Units 1-4', 9.5, '2026-11-10', 'Bảo An tiến bộ vượt bậc, phát âm rõ ràng, nghe tốt.', json_encode(['Nghe (Listening)' => 10, 'Nói (Speaking)' => 9.5, 'Đọc (Reading)' => 9.0, 'Viết (Writing)' => 9.5])]);
        $stmtAs->execute([2, 1, 'Kiểm tra định kỳ Units 1-4', 8.0, '2026-11-10', 'Minh Khôi làm bài nghe rất tốt, cần cẩn thận hơn ở bài nối từ.', json_encode(['Nghe (Listening)' => 9.0, 'Nói (Speaking)' => 8.0, 'Đọc (Reading)' => 7.5, 'Viết (Writing)' => 7.5])]);
        $stmtAs->execute([3, 1, 'Kiểm tra định kỳ Units 1-4', 9.0, '2026-11-10', 'Quỳnh Chi chăm chỉ, bài viết trình bày sạch đẹp.', json_encode(['Nghe (Listening)' => 9.0, 'Nói (Speaking)' => 9.0, 'Đọc (Reading)' => 9.5, 'Viết (Writing)' => 8.5])]);

        // 11. Materials
        $stmtM = $db->prepare("INSERT INTO materials (class_id, title, type, url, description) VALUES (?, ?, ?, ?, ?)");
        $stmtM->execute([1, 'File Audio nghe Unit 5 - Animals', 'audio', 'https://example.com/audio/unit5.mp3', 'File bài nghe phục vụ học sinh luyện nghe tại nhà']);
        $stmtM->execute([1, 'Bộ Flashcard Từ Vựng Màu Sắc', 'document', 'https://example.com/flashcards/colors.pdf', 'Thẻ tranh màu sắc in để học sinh chơi trò chơi']);
        $stmtM->execute([3, 'Bảng Tổng Hợp 12 Thì Tiếng Anh', 'document', 'https://example.com/docs/12_tenses_summary.pdf', 'Tài liệu tóm tắt ngữ pháp trọng tâm']);
    }
}
