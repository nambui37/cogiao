<?php
namespace Controllers;

use Config\Database;
use Utils\Response;
use PDO;

class ClassController {
    public function index(): void {
        $db = Database::getConnection();
        $stmt = $db->query("
            SELECT c.*, COUNT(cs.student_id) as student_count
            FROM classes c
            LEFT JOIN class_students cs ON c.id = cs.class_id AND cs.status = 'active'
            GROUP BY c.id
            ORDER BY c.id ASC
        ");
        $classes = $stmt->fetchAll();
        Response::success($classes);
    }

    public function show(int $id): void {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM classes WHERE id = ?");
        $stmt->execute([$id]);
        $class = $stmt->fetch();

        if (!$class) {
            Response::error('Không tìm thấy lớp học', 404);
        }

        // Get students in class
        $stmtStudents = $db->prepare("
            SELECT s.*, cs.joined_at
            FROM students s
            JOIN class_students cs ON s.id = cs.student_id
            WHERE cs.class_id = ? AND cs.status = 'active'
            ORDER BY s.full_name ASC
        ");
        $stmtStudents->execute([$id]);
        $class['students'] = $stmtStudents->fetchAll();

        Response::success($class);
    }

    public function store(): void {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $name = trim($input['name'] ?? '');
        $code = trim($input['code'] ?? strtoupper('CLS-' . substr(uniqid(), -5)));
        $level = trim($input['level'] ?? '');
        $room = trim($input['room'] ?? '');
        $tuitionType = $input['tuition_type'] ?? 'monthly';
        $tuitionAmount = floatval($input['tuition_amount'] ?? 850000);
        $scheduleNote = trim($input['schedule_note'] ?? '');
        $startDate = $input['start_date'] ?? date('Y-m-d');

        if (empty($name)) {
            Response::error('Vui lòng nhập tên lớp học', 422);
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("
            INSERT INTO classes (code, name, level, room, tuition_type, tuition_amount, schedule_note, start_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$code, $name, $level, $room, $tuitionType, $tuitionAmount, $scheduleNote, $startDate]);
        $id = $db->lastInsertId();

        Response::success(['id' => $id], 'Tạo lớp học thành công');
    }

    public function update(int $id): void {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $db = Database::getConnection();

        $stmt = $db->prepare("
            UPDATE classes 
            SET name = ?, level = ?, room = ?, tuition_type = ?, tuition_amount = ?, schedule_note = ?, status = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $input['name'],
            $input['level'] ?? '',
            $input['room'] ?? '',
            $input['tuition_type'] ?? 'monthly',
            floatval($input['tuition_amount'] ?? 0),
            $input['schedule_note'] ?? '',
            $input['status'] ?? 'active',
            $id
        ]);

        Response::success(null, 'Cập nhật lớp học thành công');
    }

    public function delete(int $id): void {
        $db = Database::getConnection();
        $db->beginTransaction();
        try {
            $db->prepare("DELETE FROM class_students WHERE class_id = ?")->execute([$id]);
            $db->prepare("DELETE FROM lessons WHERE class_id = ?")->execute([$id]);
            $db->prepare("DELETE FROM tuition_fees WHERE class_id = ?")->execute([$id]);
            $db->prepare("DELETE FROM assessments WHERE class_id = ?")->execute([$id]);
            $db->prepare("DELETE FROM classes WHERE id = ?")->execute([$id]);
            $db->commit();
            Response::success(null, 'Đã xóa lớp học thành công');
        } catch (\Throwable $e) {
            $db->rollBack();
            Response::error('Lỗi khi xóa lớp: ' . $e->getMessage(), 500);
        }
    }

    public function addStudent(int $classId): void {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $studentId = intval($input['student_id'] ?? 0);

        if (!$studentId) {
            Response::error('Vui lòng chọn học sinh', 422);
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("INSERT INTO class_students (class_id, student_id, joined_at) VALUES (?, ?, ?)");
        $stmt->execute([$classId, $studentId, date('Y-m-d')]);

        Response::success(null, 'Đã thêm học sinh vào lớp');
    }

    public function removeStudent(int $classId, int $studentId): void {
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM class_students WHERE class_id = ? AND student_id = ?");
        $stmt->execute([$classId, $studentId]);
        Response::success(null, 'Đã xóa học sinh khỏi lớp');
    }
}
