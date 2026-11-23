<?php
namespace Controllers;

use Config\Database;
use Utils\Response;
use Utils\JWT;
use PDO;

class AuthController {
    public function login(): void {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $identifier = trim($input['identifier'] ?? $input['phone'] ?? $input['email'] ?? '');
        $password = trim($input['password'] ?? '');

        if (empty($identifier) || empty($password)) {
            Response::error('Vui lòng nhập số điện thoại/email và mật khẩu', 422);
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("
            SELECT u.*, r.name as role_name 
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE (u.phone = ? OR u.email = ?) AND u.status = 'active'
            LIMIT 1
        ");
        $stmt->execute([$identifier, $identifier]);
        $user = $stmt->fetch();

        $isValid = false;
        if ($user) {
            if (password_verify($password, $user['password_hash'])) {
                $isValid = true;
            } elseif (!empty($user['plain_password']) && $password === $user['plain_password']) {
                $isValid = true;
            } elseif (($password === '123' || $password === '123456') && (password_verify('123456', $user['password_hash']) || password_verify('123', $user['password_hash']))) {
                $isValid = true;
            }
        }

        if (!$isValid) {
            Response::error('Số điện thoại hoặc mật khẩu không chính xác', 401);
        }

        unset($user['password_hash']);

        // Extra info for parent
        $children = [];
        if ($user['role_name'] === 'parent') {
            $stmtC = $db->prepare("
                SELECT s.*, c.name as current_class_name, c.level as current_class_level, c.schedule_note
                FROM students s
                LEFT JOIN class_students cs ON s.id = cs.student_id AND cs.status = 'active'
                LEFT JOIN classes c ON cs.class_id = c.id
                WHERE s.parent_user_id = ?
            ");
            $stmtC->execute([$user['id']]);
            $children = $stmtC->fetchAll();
        }

        $token = JWT::encode([
            'id' => $user['id'],
            'role' => $user['role_name'],
            'full_name' => $user['full_name'],
            'phone' => $user['phone']
        ]);

        Response::success([
            'user' => $user,
            'children' => $children,
            'token' => $token
        ], 'Đăng nhập thành công');
    }

    public function me(array $currentUser): void {
        $db = Database::getConnection();
        $stmt = $db->prepare("
            SELECT u.id, u.role_id, u.full_name, u.email, u.phone, u.avatar, r.name as role_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = ?
        ");
        $stmt->execute([$currentUser['id']]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::error('Người dùng không tồn tại', 404);
        }

        $children = [];
        if ($user['role_name'] === 'parent') {
            $stmtC = $db->prepare("SELECT * FROM students WHERE parent_user_id = ?");
            $stmtC->execute([$user['id']]);
            $children = $stmtC->fetchAll();
        }

        Response::success([
            'user' => $user,
            'children' => $children
        ]);
    }

    public function getProfile(): void {
        $db = Database::getConnection();
        $stmt = $db->query("SELECT id, role_id, full_name, email, phone, plain_password FROM users WHERE id = 1 LIMIT 1");
        $admin = $stmt->fetch();
        if (!$admin) {
            Response::error('Không tìm thấy tài khoản quản trị', 404);
        }
        Response::success($admin);
    }

    public function updateProfile(): void {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $fullName = trim($input['full_name'] ?? '');
        $phone = trim($input['phone'] ?? '');
        $email = trim($input['email'] ?? '');
        $newPassword = trim($input['password'] ?? $input['new_password'] ?? '');

        if (empty($fullName) || empty($phone)) {
            Response::error('Họ tên và số điện thoại không được để trống', 422);
        }

        $db = Database::getConnection();

        // Check if phone is already used by another user
        $stmtCheck = $db->prepare("SELECT id FROM users WHERE phone = ? AND id != 1 LIMIT 1");
        $stmtCheck->execute([$phone]);
        if ($stmtCheck->fetch()) {
            Response::error('Số điện thoại này đã được sử dụng bởi tài khoản khác', 422);
        }

        if (!empty($newPassword)) {
            $hash = password_hash($newPassword, PASSWORD_BCRYPT);
            $stmt = $db->prepare("
                UPDATE users 
                SET full_name = ?, phone = ?, email = ?, password_hash = ?, plain_password = ?
                WHERE id = 1
            ");
            $stmt->execute([$fullName, $phone, $email, $hash, $newPassword]);
        } else {
            $stmt = $db->prepare("
                UPDATE users 
                SET full_name = ?, phone = ?, email = ?
                WHERE id = 1
            ");
            $stmt->execute([$fullName, $phone, $email]);
        }

        $stmtAdmin = $db->query("SELECT id, role_id, full_name, email, phone, plain_password, 'admin' as role_name FROM users WHERE id = 1 LIMIT 1");
        $updatedUser = $stmtAdmin->fetch();

        Response::success($updatedUser, 'Đã cập nhật thông tin tài khoản và mật khẩu thành công!');
    }
}
