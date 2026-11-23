<?php
namespace Controllers;

use Config\Database;
use Utils\Response;
use PDO;

class StudentController {
    public function index(): void {
        $db = Database::getConnection();
        $classId = isset($_GET['class_id']) ? intval($_GET['class_id']) : 0;
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';

        $query = "
            SELECT s.*, 
                   GROUP_CONCAT(c.name, ', ') as class_names,
                   GROUP_CONCAT(c.id, ',') as class_ids
            FROM students s
            LEFT JOIN class_students cs ON s.id = cs.student_id AND cs.status = 'active'
            LEFT JOIN classes c ON cs.class_id = c.id
        ";
        $conditions = [];
        $params = [];

        if ($classId > 0) {
            $conditions[] = "s.id IN (SELECT student_id FROM class_students WHERE class_id = ? AND status = 'active')";
            $params[] = $classId;
        }

        if (!empty($search)) {
            $conditions[] = "(s.full_name LIKE ? OR s.student_code LIKE ? OR s.parent_phone LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }

        if ($conditions) {
            $query .= " WHERE " . implode(' AND ', $conditions);
        }

        $query .= " GROUP BY s.id ORDER BY s.id DESC";

        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $students = $stmt->fetchAll();

        Response::success($students);
    }

    public function show(int $id): void {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM students WHERE id = ?");
        $stmt->execute([$id]);
        $student = $stmt->fetch();

        if (!$student) {
            Response::error('Không tìm thấy học sinh', 404);
        }

        // Classes enrolled
        $stmtClasses = $db->prepare("
            SELECT c.*, cs.joined_at 
            FROM classes c
            JOIN class_students cs ON c.id = cs.class_id
            WHERE cs.student_id = ? AND cs.status = 'active'
        ");
        $stmtClasses->execute([$id]);
        $student['classes'] = $stmtClasses->fetchAll();

        // Attendance stats
        $stmtAtt = $db->prepare("
            SELECT 
                COUNT(*) as total_lessons,
                SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
                SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count,
                SUM(CASE WHEN a.status = 'excused' THEN 1 ELSE 0 END) as excused_count,
                SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count
            FROM attendance a
            WHERE a.student_id = ?
        ");
        $stmtAtt->execute([$id]);
        $student['attendance_stats'] = $stmtAtt->fetch();

        // Recent assessments
        $stmtAss = $db->prepare("SELECT * FROM assessments WHERE student_id = ? ORDER BY evaluated_date DESC LIMIT 5");
        $stmtAss->execute([$id]);
        $student['assessments'] = $stmtAss->fetchAll();

        // Tuition history
        $stmtTui = $db->prepare("SELECT * FROM tuition_fees WHERE student_id = ? ORDER BY billing_month DESC LIMIT 10");
        $stmtTui->execute([$id]);
        $student['tuition_fees'] = $stmtTui->fetchAll();

        Response::success($student);
    }

    public function store(): void {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $fullName = trim($input['full_name'] ?? '');
        $studentCode = trim($input['student_code'] ?? 'STU' . date('ymd') . rand(10, 99));
        $dob = $input['date_of_birth'] ?? null;
        $gender = $input['gender'] ?? 'other';
        $parentName = trim($input['parent_name'] ?? '');
        $parentPhone = trim($input['parent_phone'] ?? '');
        $address = trim($input['address'] ?? '');
        $notes = trim($input['notes'] ?? '');
        $classId = isset($input['class_id']) ? intval($input['class_id']) : 0;

        if (empty($fullName)) {
            Response::error('Vui lòng nhập họ và tên học sinh', 422);
        }

        $db = Database::getConnection();

        // Auto create parent user if phone provided and does not exist
        $parentUserId = null;
        if (!empty($parentPhone)) {
            $stmtP = $db->prepare("SELECT id FROM users WHERE phone = ?");
            $stmtP->execute([$parentPhone]);
            $existingParent = $stmtP->fetch();

            if ($existingParent) {
                $parentUserId = $existingParent['id'];
            } else {
                $stmtNewP = $db->prepare("
                    INSERT INTO users (role_id, full_name, phone, password_hash, status) 
                    VALUES (2, ?, ?, ?, 'active')
                ");
                $defaultHash = password_hash('123456', PASSWORD_BCRYPT);
                $stmtNewP->execute([$parentName ?: 'Phụ huynh ' . $fullName, $parentPhone, $defaultHash]);
                $parentUserId = $db->lastInsertId();
            }
        }

        $stmt = $db->prepare("
            INSERT INTO students (student_code, full_name, date_of_birth, gender, parent_name, parent_phone, parent_user_id, address, enrollment_date, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $studentCode, $fullName, $dob, $gender, $parentName, $parentPhone, $parentUserId, $address, date('Y-m-d'), $notes
        ]);
        $studentId = $db->lastInsertId();

        // Auto enroll to class if selected
        if ($classId > 0) {
            $stmtCS = $db->prepare("INSERT INTO class_students (class_id, student_id, joined_at) VALUES (?, ?, ?)");
            $stmtCS->execute([$classId, $studentId, date('Y-m-d')]);
        }

        Response::success(['id' => $studentId, 'student_code' => $studentCode], 'Thêm học sinh thành công');
    }

    public function update(int $id): void {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $db = Database::getConnection();

        $stmt = $db->prepare("
            UPDATE students
            SET full_name = ?, date_of_birth = ?, gender = ?, parent_name = ?, parent_phone = ?, address = ?, notes = ?, status = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $input['full_name'],
            $input['date_of_birth'] ?? null,
            $input['gender'] ?? 'other',
            $input['parent_name'] ?? '',
            $input['parent_phone'] ?? '',
            $input['address'] ?? '',
            $input['notes'] ?? '',
            $input['status'] ?? 'studying',
            $id
        ]);

        Response::success(null, 'Cập nhật thông tin học sinh thành công');
    }

    public function delete(int $id): void {
        $db = Database::getConnection();
        $stmt = $db->prepare("UPDATE students SET status = 'withdrawn' WHERE id = ?");
        $stmt->execute([$id]);
        Response::success(null, 'Đã chuyển trạng thái học sinh sang đã thôi học');
    }
}
