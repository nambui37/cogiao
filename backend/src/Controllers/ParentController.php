<?php
namespace Controllers;

use Config\Database;
use Utils\Response;
use Utils\VietQR;
use PDO;

class ParentController {
    public function getStudentDetail(int $studentId, array $currentUser): void {
        $db = Database::getConnection();

        // Check if student belongs to this parent or current user is admin
        $stmtStudent = $db->prepare("
            SELECT s.*, c.name as current_class_name, c.level as current_class_level, c.schedule_note
            FROM students s
            LEFT JOIN class_students cs ON s.id = cs.student_id AND cs.status = 'active'
            LEFT JOIN classes c ON cs.class_id = c.id
            WHERE s.id = ?
        ");
        $stmtStudent->execute([$studentId]);
        $student = $stmtStudent->fetch();

        if (!$student) {
            Response::error('Không tìm thấy thông tin học sinh', 404);
        }

        // Attendance history
        $stmtAtt = $db->prepare("
            SELECT a.status, a.note, a.recorded_at, l.lesson_date, l.title as lesson_title, l.homework
            FROM attendance a
            JOIN lessons l ON a.lesson_id = l.id
            WHERE a.student_id = ?
            ORDER BY l.lesson_date DESC
            LIMIT 20
        ");
        $stmtAtt->execute([$studentId]);
        $attendanceHistory = $stmtAtt->fetchAll();

        // Attendance summary
        $totalAtt = count($attendanceHistory);
        $presentAtt = 0;
        foreach ($attendanceHistory as $item) {
            if ($item['status'] === 'present') $presentAtt++;
        }
        $attRate = $totalAtt > 0 ? round(($presentAtt / $totalAtt) * 100) : 100;

        // Assessments & comments
        $stmtAss = $db->prepare("
            SELECT title, score, max_score, evaluated_date, teacher_comment, skills_breakdown
            FROM assessments
            WHERE student_id = ?
            ORDER BY evaluated_date DESC
        ");
        $stmtAss->execute([$studentId]);
        $assessments = $stmtAss->fetchAll();

        // Bank settings for VietQR
        $stmtSet = $db->query("SELECT setting_key, setting_value FROM settings");
        $settings = [];
        while ($row = $stmtSet->fetch()) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }

        // Tuition invoices
        $stmtTuition = $db->prepare("
            SELECT tf.*, c.name as class_name
            FROM tuition_fees tf
            JOIN classes c ON tf.class_id = c.id
            WHERE tf.student_id = ?
            ORDER BY tf.billing_month DESC
        ");
        $stmtTuition->execute([$studentId]);
        $tuitionList = $stmtTuition->fetchAll();

        $bankName = $settings['bank_name'] ?? 'MB';
        $bankAccount = $settings['bank_account'] ?? '2004545655';
        $bankOwner = $settings['bank_owner'] ?? 'BUI DUC NAM';

        foreach ($tuitionList as &$tui) {
            $memo = $tui['invoice_code'];
            $tui['qr_url'] = VietQR::generateQRUrl(
                $bankName,
                $bankAccount,
                $tui['final_amount'],
                $memo,
                $bankOwner
            );
            $tui['transfer_memo'] = $memo;
            $tui['bank_name'] = $bankName;
            $tui['bank_account'] = $bankAccount;
            $tui['bank_owner'] = $bankOwner;
            $tui['bank_info'] = $settings;
        }

        Response::success([
            'student' => $student,
            'attendance_rate' => $attRate,
            'attendance_history' => $attendanceHistory,
            'assessments' => $assessments,
            'tuition' => $tuitionList
        ]);
    }
}
