<?php
namespace Controllers;

use Config\Database;
use Utils\Response;
use PDO;

class DashboardController {
    public function index(): void {
        $db = Database::getConnection();

        // 1. Total students
        $totalStudents = (int)$db->query("SELECT COUNT(*) FROM students WHERE status = 'studying'")->fetchColumn();

        // 2. Total classes
        $totalClasses = (int)$db->query("SELECT COUNT(*) FROM classes WHERE status = 'active'")->fetchColumn();

        // 3. Current month tuition stats
        $currentMonth = date('Y-m');
        $stmtTuition = $db->prepare("
            SELECT 
                COALESCE(SUM(final_amount), 0) as total_amount,
                COALESCE(SUM(CASE WHEN status = 'paid' THEN final_amount ELSE 0 END), 0) as paid_amount,
                COALESCE(SUM(CASE WHEN status = 'unpaid' THEN final_amount ELSE 0 END), 0) as unpaid_amount,
                COUNT(*) as total_invoices,
                COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_invoices
            FROM tuition_fees
            WHERE billing_month = ?
        ");
        $stmtTuition->execute([$currentMonth]);
        $tuitionStats = $stmtTuition->fetch();

        // 4. Upcoming / Recent lessons
        $stmtLessons = $db->query("
            SELECT l.*, c.name as class_name, c.room
            FROM lessons l
            JOIN classes c ON l.class_id = c.id
            ORDER BY l.lesson_date DESC, l.start_time DESC
            LIMIT 5
        ");
        $recentLessons = $stmtLessons->fetchAll();

        // 5. Classes summary with student counts
        $stmtClasses = $db->query("
            SELECT c.*, COUNT(cs.student_id) as student_count
            FROM classes c
            LEFT JOIN class_students cs ON c.id = cs.class_id AND cs.status = 'active'
            GROUP BY c.id
            ORDER BY c.name ASC
        ");
        $classesList = $stmtClasses->fetchAll();

        // 6. Recent unpaid alerts
        $stmtUnpaid = $db->query("
            SELECT tf.*, s.full_name as student_name, s.parent_name, s.parent_phone, c.name as class_name
            FROM tuition_fees tf
            JOIN students s ON tf.student_id = s.id
            JOIN classes c ON tf.class_id = c.id
            WHERE tf.status = 'unpaid'
            ORDER BY tf.due_date ASC
            LIMIT 5
        ");
        $unpaidInvoices = $stmtUnpaid->fetchAll();

        Response::success([
            'total_students' => $totalStudents,
            'total_classes' => $totalClasses,
            'tuition_stats' => $tuitionStats,
            'recent_lessons' => $recentLessons,
            'classes' => $classesList,
            'unpaid_alerts' => $unpaidInvoices,
            'current_month' => $currentMonth
        ]);
    }
}
