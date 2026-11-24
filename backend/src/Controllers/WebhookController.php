<?php
namespace Controllers;

use Config\Database;
use Utils\Response;
use PDO;

class WebhookController {
    /**
     * Webhook receiver for SePay.vn and Casso.vn
     * URL: https://cogiao-api.onrender.com/api/webhook/sepay
     */
    public function handleSepay(): void {
        $rawInput = file_get_contents('php://input');
        $data = json_decode($rawInput, true);

        if (!$data || !is_array($data)) {
            // Check for Casso wrapper or query params
            $data = $_POST;
        }

        // Support Casso array structure
        if (isset($data['data']) && is_array($data['data']) && isset($data['data'][0])) {
            $data = $data['data'][0];
        }

        $amount = floatval($data['transferAmount'] ?? $data['amount'] ?? 0);
        $content = trim($data['content'] ?? $data['description'] ?? '');
        $gateway = $data['gateway'] ?? 'MBBank';
        $accountNumber = $data['accountNumber'] ?? $data['bank_sub_acc_id'] ?? '2004545655';
        $refCode = $data['referenceCode'] ?? $data['tid'] ?? ('MB' . time());
        $transferType = strtolower($data['transferType'] ?? 'in');

        // Only process incoming transfers
        if ($transferType !== 'in' && $transferType !== '' && $amount <= 0) {
            Response::json(['success' => false, 'message' => 'Bỏ qua giao dịch không phải tiền vào'], 200);
            return;
        }

        if (empty($content) && $amount <= 0) {
            Response::json(['success' => false, 'message' => 'Nội dung hoặc số tiền không hợp lệ'], 400);
            return;
        }

        $result = $this->processPaymentAutoMatch($amount, $content, $gateway, $refCode, $accountNumber);
        Response::json($result, 200);
    }

    /**
     * Test / Simulation Endpoint
     * URL: POST /api/webhook/simulate
     */
    public function handleSimulate(): void {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $invoiceCode = trim($input['invoice_code'] ?? '');
        $amount = floatval($input['amount'] ?? 0);
        $gateway = $input['gateway'] ?? 'MBBank';
        $refCode = 'TEST-' . strtoupper(substr(md5(uniqid()), 0, 8));

        if (empty($invoiceCode)) {
            Response::error('Vui lòng cung cấp mã hóa đơn (invoice_code) để test', 422);
            return;
        }

        $content = "HOCPHI " . $invoiceCode . " BUI DUC NAM TEST";
        $result = $this->processPaymentAutoMatch($amount, $content, $gateway, $refCode, '2004545655');
        Response::json($result, 200);
    }

    /**
     * Core matching logic
     */
    private function processPaymentAutoMatch(float $amount, string $content, string $gateway, string $refCode, string $accountNumber): array {
        $db = Database::getConnection();

        // 1. Try finding invoice code: e.g. INV-202611-002 or INV202611002
        $matchedInvoice = null;
        if (preg_match('/INV[-_]?(\d{6})[-_]?(\d+)/i', $content, $m)) {
            $formattedCode = "INV-" . $m[1] . "-" . str_pad($m[2], 3, '0', STR_PAD_LEFT);
            $stmt = $db->prepare("
                SELECT tf.*, s.full_name as student_name, s.student_code, c.name as class_name 
                FROM tuition_fees tf
                JOIN students s ON tf.student_id = s.id
                JOIN classes c ON tf.class_id = c.id
                WHERE tf.invoice_code = ? OR tf.invoice_code LIKE ?
                LIMIT 1
            ");
            $stmt->execute([$formattedCode, "%" . $m[1] . "%" . $m[2] . "%"]);
            $matchedInvoice = $stmt->fetch(PDO::FETCH_ASSOC);
        }

        // 2. Fallback: match by Student Code e.g. STU002 or STU 002
        if (!$matchedInvoice && preg_match('/STU[-_\s]?(\d+)/i', $content, $m)) {
            $stuCode = "STU" . str_pad($m[1], 3, '0', STR_PAD_LEFT);
            $currentMonth = date('Y-m');
            $stmt = $db->prepare("
                SELECT tf.*, s.full_name as student_name, s.student_code, c.name as class_name 
                FROM tuition_fees tf
                JOIN students s ON tf.student_id = s.id
                JOIN classes c ON tf.class_id = c.id
                WHERE s.student_code = ? AND tf.status = 'unpaid'
                ORDER BY tf.billing_month DESC
                LIMIT 1
            ");
            $stmt->execute([$stuCode]);
            $matchedInvoice = $stmt->fetch(PDO::FETCH_ASSOC);
        }

        if (!$matchedInvoice) {
            return [
                'success' => false,
                'matched' => false,
                'message' => "Không tìm thấy hóa đơn học phí tương ứng với nội dung: '$content'",
                'content_analyzed' => $content,
                'amount' => $amount
            ];
        }

        // Check if already paid
        if ($matchedInvoice['status'] === 'paid') {
            return [
                'success' => true,
                'matched' => true,
                'already_paid' => true,
                'message' => "Hóa đơn {$matchedInvoice['invoice_code']} đã được thanh toán trước đó rồi.",
                'invoice' => $matchedInvoice
            ];
        }

        // Update Tuition Fee Status to PAID
        $now = date('Y-m-d H:i:s');
        $paymentMethod = "VietQR MB Bank (SePay Tự Động)";
        $note = "Tự động gạch nợ Webhook {$gateway} (STK: {$accountNumber}). Số tiền nhận: " . number_format($amount, 0, ',', '.') . "đ. Mã GD: {$refCode}. Lúc: {$now}";

        $updateStmt = $db->prepare("
            UPDATE tuition_fees 
            SET status = 'paid', 
                payment_date = ?, 
                payment_method = ?, 
                notes = CASE WHEN notes IS NULL OR notes = '' THEN ? ELSE notes || ' | ' || ? END
            WHERE id = ?
        ");
        $updateStmt->execute([$now, $paymentMethod, $note, $note, $matchedInvoice['id']]);

        return [
            'success' => true,
            'matched' => true,
            'message' => "Gạch nợ học phí thành công cho học sinh {$matchedInvoice['student_name']} ({$matchedInvoice['student_code']})",
            'invoice_code' => $matchedInvoice['invoice_code'],
            'student_name' => $matchedInvoice['student_name'],
            'class_name' => $matchedInvoice['class_name'],
            'amount_expected' => floatval($matchedInvoice['final_amount']),
            'amount_received' => $amount,
            'gateway' => $gateway,
            'ref_code' => $refCode,
            'paid_at' => $now
        ];
    }
}
