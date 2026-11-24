<?php
namespace Controllers;

use Config\Database;
use Utils\Response;
use Utils\VietQR;
use PDO;

class TuitionController {
    public function index(): void {
        $db = Database::getConnection();
        $month = $_GET['month'] ?? date('Y-m');
        $classId = isset($_GET['class_id']) ? intval($_GET['class_id']) : 0;
        $status = $_GET['status'] ?? '';

        $query = "
            SELECT tf.*, s.full_name as student_name, s.student_code, s.parent_name, s.parent_phone, c.name as class_name, c.code as class_code
            FROM tuition_fees tf
            JOIN students s ON tf.student_id = s.id
            JOIN classes c ON tf.class_id = c.id
            WHERE 1=1
        ";
        $params = [];

        if (!empty($month)) {
            $query .= " AND tf.billing_month = ?";
            $params[] = $month;
        }

        if ($classId > 0) {
            $query .= " AND tf.class_id = ?";
            $params[] = $classId;
        }

        if (!empty($status)) {
            $query .= " AND tf.status = ?";
            $params[] = $status;
        }

        $query .= " ORDER BY tf.status ASC, tf.created_at DESC";

        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $fees = $stmt->fetchAll();

        // Bank settings
        $settings = $this->getBankSettings($db);
        $bankName = $settings['bank_name'] ?? 'MB';
        $bankAccount = $settings['bank_account'] ?? '2004545655';
        $bankOwner = $settings['bank_owner'] ?? 'BUI DUC NAM';

        // Attach QR url to each fee
        foreach ($fees as &$fee) {
            $memo = $fee['invoice_code'];
            $fee['qr_url'] = VietQR::generateQRUrl(
                $bankName,
                $bankAccount,
                $fee['final_amount'],
                $memo,
                $bankOwner
            );
            $fee['transfer_memo'] = $memo;
            $fee['bank_name'] = $bankName;
            $fee['bank_account'] = $bankAccount;
            $fee['bank_owner'] = $bankOwner;
        }

        Response::success([
            'fees' => $fees,
            'bank_info' => $settings
        ]);
    }

    public function createBatch(): void {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $classId = intval($input['class_id'] ?? 0);
        $month = $input['month'] ?? date('Y-m');
        $amount = floatval($input['amount'] ?? 0);
        $dueDate = $input['due_date'] ?? date('Y-m-15');
        $notes = $input['notes'] ?? '';

        if (!$classId || empty($month)) {
            Response::error('Thiếu thông tin lớp hoặc tháng tính phí', 422);
        }

        $db = Database::getConnection();

        // Get class default amount if not specified
        if ($amount <= 0) {
            $stmtC = $db->prepare("SELECT tuition_amount FROM classes WHERE id = ?");
            $stmtC->execute([$classId]);
            $amount = floatval($stmtC->fetchColumn() ?: 800000);
        }

        // Get all active students of class
        $stmtStudents = $db->prepare("
            SELECT s.id, s.student_code 
            FROM students s
            JOIN class_students cs ON s.id = cs.student_id
            WHERE cs.class_id = ? AND cs.status = 'active'
        ");
        $stmtStudents->execute([$classId]);
        $students = $stmtStudents->fetchAll();

        $stmtCheck = $db->prepare("SELECT id FROM tuition_fees WHERE student_id = ? AND class_id = ? AND billing_month = ?");
        $stmtInsert = $db->prepare("
            INSERT INTO tuition_fees (invoice_code, student_id, class_id, billing_month, amount, discount, final_amount, due_date, status, notes)
            VALUES (?, ?, ?, ?, ?, 0, ?, ?, 'unpaid', ?)
        ");

        $count = 0;
        foreach ($students as $stu) {
            $stmtCheck->execute([$stu['id'], $classId, $month]);
            if (!$stmtCheck->fetch()) {
                $code = 'INV-' . str_replace('-', '', $month) . '-' . str_pad($stu['id'], 3, '0', STR_PAD_LEFT);
                $stmtInsert->execute([$code, $stu['id'], $classId, $month, $amount, $amount, $dueDate, $notes]);
                $count++;
            }
        }

        Response::success(['created_count' => $count], "Đã khởi tạo phiếu học phí cho $count học sinh");
    }

    public function createSingle(): void {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $studentId = intval($input['student_id'] ?? 0);
        $classId = intval($input['class_id'] ?? 0);
        $month = $input['month'] ?? date('Y-m');
        $amount = floatval($input['amount'] ?? 0);
        $discount = floatval($input['discount'] ?? 0);
        $finalAmount = floatval($input['final_amount'] ?? ($amount - $discount));
        $dueDate = $input['due_date'] ?? date('Y-m-15');
        $notes = $input['notes'] ?? '';

        if (!$studentId || !$classId) {
            Response::error('Thiếu thông tin học sinh hoặc lớp học', 422);
        }

        $db = Database::getConnection();
        $code = 'INV-' . str_replace('-', '', $month) . '-' . str_pad($studentId, 3, '0', STR_PAD_LEFT) . '-' . rand(10, 99);
        
        $stmt = $db->prepare("
            INSERT INTO tuition_fees (invoice_code, student_id, class_id, billing_month, amount, discount, final_amount, due_date, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'unpaid', ?)
        ");
        $stmt->execute([$code, $studentId, $classId, $month, $amount, $discount, $finalAmount, $dueDate, $notes]);

        Response::success(['id' => $db->lastInsertId(), 'invoice_code' => $code], 'Tạo phiếu học phí đơn lẻ thành công');
    }

    public function update(int $id): void {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $amount = floatval($input['amount'] ?? 0);
        $discount = floatval($input['discount'] ?? 0);
        $finalAmount = floatval($input['final_amount'] ?? ($amount - $discount));
        $dueDate = $input['due_date'] ?? null;
        $notes = $input['notes'] ?? '';
        $status = $input['status'] ?? null;

        $db = Database::getConnection();
        $query = "UPDATE tuition_fees SET amount = ?, discount = ?, final_amount = ?, notes = ?";
        $params = [$amount, $discount, $finalAmount, $notes];

        if ($dueDate) {
            $query .= ", due_date = ?";
            $params[] = $dueDate;
        }
        if ($status) {
            $query .= ", status = ?";
            $params[] = $status;
        }

        $query .= " WHERE id = ?";
        $params[] = $id;

        $stmt = $db->prepare($query);
        $stmt->execute($params);

        Response::success(null, 'Cập nhật phiếu học phí thành công');
    }

    public function delete(int $id): void {
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM tuition_fees WHERE id = ?");
        $stmt->execute([$id]);
        Response::success(null, 'Đã xóa phiếu học phí thành công');
    }

    public function updateStatus(int $id): void {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $status = $input['status'] ?? 'paid'; // 'paid', 'unpaid'
        $method = $input['payment_method'] ?? 'Chuyển khoản VietQR';
        $paymentDate = $status === 'paid' ? date('Y-m-d H:i:s') : null;

        $db = Database::getConnection();
        $stmt = $db->prepare("
            UPDATE tuition_fees 
            SET status = ?, payment_date = ?, payment_method = ?
            WHERE id = ?
        ");
        $stmt->execute([$status, $paymentDate, $method, $id]);

        Response::success(null, 'Cập nhật trạng thái thanh toán thành công');
    }

    private function getBankSettings(PDO $db): array {
        $stmt = $db->query("SELECT setting_key, setting_value FROM settings");
        $settings = [];
        while ($row = $stmt->fetch()) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
        return $settings;
    }
}
