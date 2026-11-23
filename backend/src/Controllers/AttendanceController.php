<?php
namespace Controllers;

use Config\Database;
use Utils\Response;
use PDO;

class AttendanceController {
    public function getMatrix(): void {
        $classId = isset($_GET['class_id']) ? intval($_GET['class_id']) : 0;
        $date = $_GET['date'] ?? date('Y-m-d');

        if (!$classId) {
            Response::error('Vui lòng chọn lớp học', 422);
        }

        $db = Database::getConnection();

        // 1. Get or create lesson for this class & date
        $stmtLesson = $db->prepare("SELECT * FROM lessons WHERE class_id = ? AND lesson_date = ? LIMIT 1");
        $stmtLesson->execute([$classId, $date]);
        $lesson = $stmtLesson->fetch();

        // 2. Get all active students of the class
        $stmtStudents = $db->prepare("
            SELECT s.id, s.student_code, s.full_name, s.avatar, s.parent_name, s.parent_phone
            FROM students s
            JOIN class_students cs ON s.id = cs.student_id
            WHERE cs.class_id = ? AND cs.status = 'active' AND s.status = 'studying'
            ORDER BY s.full_name ASC
        ");
        $stmtStudents->execute([$classId]);
        $students = $stmtStudents->fetchAll();

        // 3. If lesson exists, get current attendance status
        $attendanceMap = [];
        if ($lesson) {
            $stmtAtt = $db->prepare("SELECT student_id, status, note FROM attendance WHERE lesson_id = ?");
            $stmtAtt->execute([$lesson['id']]);
            while ($row = $stmtAtt->fetch()) {
                $attendanceMap[$row['student_id']] = $row;
            }
        }

        $resultList = [];
        foreach ($students as $stu) {
            $att = $attendanceMap[$stu['id']] ?? null;
            $resultList[] = [
                'student_id' => $stu['id'],
                'student_code' => $stu['student_code'],
                'full_name' => $stu['full_name'],
                'parent_name' => $stu['parent_name'],
                'parent_phone' => $stu['parent_phone'],
                'status' => $att ? $att['status'] : 'present', // Default present
                'note' => $att ? $att['note'] : ''
            ];
        }

        Response::success([
            'lesson' => $lesson,
            'class_id' => $classId,
            'date' => $date,
            'attendance' => $resultList
        ]);
    }

    public function saveMatrix(): void {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $classId = intval($input['class_id'] ?? 0);
        $date = $input['date'] ?? date('Y-m-d');
        $title = trim($input['title'] ?? 'Buổi học ngày ' . date('d/m/Y', strtotime($date)));
        $content = trim($input['content'] ?? '');
        $homework = trim($input['homework'] ?? '');
        $records = $input['records'] ?? [];

        if (!$classId) {
            Response::error('Thiếu thông tin lớp học', 422);
        }

        $db = Database::getConnection();
        $db->beginTransaction();

        try {
            // Find or insert lesson
            $stmtLesson = $db->prepare("SELECT id FROM lessons WHERE class_id = ? AND lesson_date = ? LIMIT 1");
            $stmtLesson->execute([$classId, $date]);
            $lesson = $stmtLesson->fetch();

            if ($lesson) {
                $lessonId = $lesson['id'];
                $stmtUpdateL = $db->prepare("UPDATE lessons SET title = ?, content = ?, homework = ? WHERE id = ?");
                $stmtUpdateL->execute([$title, $content, $homework, $lessonId]);
            } else {
                $stmtInsertL = $db->prepare("INSERT INTO lessons (class_id, title, lesson_date, content, homework, status) VALUES (?, ?, ?, ?, ?, 'completed')");
                $stmtInsertL->execute([$classId, $title, $date, $content, $homework]);
                $lessonId = $db->lastInsertId();
            }

            // Upsert attendance
            $stmtUpsert = $db->prepare("
                INSERT INTO attendance (lesson_id, student_id, status, note)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(lesson_id, student_id) DO UPDATE SET
                    status = excluded.status,
                    note = excluded.note,
                    recorded_at = CURRENT_TIMESTAMP
            ");

            foreach ($records as $r) {
                $studentId = intval($r['student_id']);
                $status = $r['status'] ?? 'present';
                $note = $r['note'] ?? '';
                $stmtUpsert->execute([$lessonId, $studentId, $status, $note]);
            }

            $db->commit();
            Response::success(['lesson_id' => $lessonId], 'Đã lưu điểm danh thành công!');
        } catch (\Exception $e) {
            $db->rollBack();
            Response::error('Lỗi khi lưu điểm danh: ' . $e->getMessage(), 500);
        }
    }
}
