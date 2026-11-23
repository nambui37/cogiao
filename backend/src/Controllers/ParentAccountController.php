<?php
namespace Controllers;

use Config\Database;
use Utils\Response;
use PDO;

class ParentAccountController {
    public function index(): void {
        $db = Database::getConnection();
        $stmt = $db->query("
            SELECT u.id, u.full_name, u.phone, u.email, u.plain_password, u.status, u.created_at
            FROM users u
            WHERE u.role_id = 2
            ORDER BY u.created_at DESC
        ");
        $parents = $stmt->fetchAll();

        // Attach children to each parent
        $stmtChildren = $db->prepare("
            SELECT s.id, s.student_code, s.full_name, s.gender, s.date_of_birth, c.name as class_name
            FROM students s
            LEFT JOIN class_students cs ON s.id = cs.student_id AND cs.status = 'active'
            LEFT JOIN classes c ON cs.class_id = c.id
            WHERE s.parent_user_id = ?
        ");

        foreach ($parents as &$p) {
            $stmtChildren->execute([$p['id']]);
            $p['children'] = $stmtChildren->fetchAll();
        }

        Response::success($parents);
    }

    public function store(): void {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $fullName = trim($input['full_name'] ?? '');
        $phone = trim($input['phone'] ?? '');
        $password = trim($input['password'] ?? '123456');
        $childrenIds = $input['children_ids'] ?? []; // Array of student IDs

        if (empty($fullName) || empty($phone)) {
            Response::error('Vui lòng nhập họ tên phụ huynh và số điện thoại', 422);
        }

        $db = Database::getConnection();

        // Check if phone already registered
        $stmtCheck = $db->prepare("SELECT id FROM users WHERE phone = ?");
        $stmtCheck->execute([$phone]);
        if ($stmtCheck->fetch()) {
            Response::error("Số điện thoại $phone đã được cấp tài khoản", 400);
        }

        $hashed = password_hash($password, PASSWORD_BCRYPT);
        $stmtInsert = $db->prepare("
            INSERT INTO users (role_id, full_name, phone, password_hash, plain_password, status)
            VALUES (2, ?, ?, ?, ?, 'active')
        ");
        $stmtInsert->execute([$fullName, $phone, $hashed, $password]);
        $parentUserId = $db->lastInsertId();

        // Link selected students to this parent
        if (!empty($childrenIds)) {
            $stmtLink = $db->prepare("
                UPDATE students 
                SET parent_user_id = ?, parent_name = ?, parent_phone = ? 
                WHERE id = ?
            ");
            foreach ($childrenIds as $stuId) {
                $stmtLink->execute([$parentUserId, $fullName, $phone, intval($stuId)]);
            }
        }

        Response::success([
            'id' => $parentUserId,
            'full_name' => $fullName,
            'phone' => $phone,
            'plain_password' => $password,
            'children_count' => count($childrenIds)
        ], 'Đã cấp tài khoản thành công cho phụ huynh!');
    }

    public function update(int $id): void {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $fullName = trim($input['full_name'] ?? '');
        $phone = trim($input['phone'] ?? '');
        $password = trim($input['password'] ?? '');
        $childrenIds = $input['children_ids'] ?? null;

        $db = Database::getConnection();

        $query = "UPDATE users SET full_name = ?";
        $params = [$fullName];

        if (!empty($phone)) {
            $query .= ", phone = ?";
            $params[] = $phone;
        }

        if (!empty($password)) {
            $hashed = password_hash($password, PASSWORD_BCRYPT);
            $query .= ", password_hash = ?, plain_password = ?";
            $params[] = $hashed;
            $params[] = $password;
        }

        $query .= " WHERE id = ?";
        $params[] = $id;

        $stmt = $db->prepare($query);
        $stmt->execute($params);

        // Update linked children if provided
        if (is_array($childrenIds)) {
            // Unlink old
            $stmtUnlink = $db->prepare("UPDATE students SET parent_user_id = NULL WHERE parent_user_id = ?");
            $stmtUnlink->execute([$id]);

            // Link new
            $stmtLink = $db->prepare("UPDATE students SET parent_user_id = ?, parent_name = ?, parent_phone = ? WHERE id = ?");
            foreach ($childrenIds as $stuId) {
                $stmtLink->execute([$id, $fullName, $phone, intval($stuId)]);
            }
        }

        Response::success(null, 'Cập nhật tài khoản phụ huynh thành công');
    }

    public function delete(int $id): void {
        $db = Database::getConnection();
        // Unlink children
        $stmtUnlink = $db->prepare("UPDATE students SET parent_user_id = NULL WHERE parent_user_id = ?");
        $stmtUnlink->execute([$id]);

        $stmtDel = $db->prepare("DELETE FROM users WHERE id = ?");
        $stmtDel->execute([$id]);

        Response::success(null, 'Đã xóa tài khoản phụ huynh');
    }
}
