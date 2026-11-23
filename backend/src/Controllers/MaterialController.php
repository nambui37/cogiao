<?php
namespace Controllers;

use Config\Database;
use Utils\Response;
use PDO;

class MaterialController {
    public function index(): void {
        $db = Database::getConnection();
        $classId = isset($_GET['class_id']) ? intval($_GET['class_id']) : 0;

        $query = "
            SELECT m.*, c.name as class_name 
            FROM materials m
            LEFT JOIN classes c ON m.class_id = c.id
        ";
        $params = [];
        if ($classId > 0) {
            $query .= " WHERE m.class_id = ?";
            $params[] = $classId;
        }
        $query .= " ORDER BY m.created_at DESC";

        $stmt = $db->prepare($query);
        $stmt->execute($params);
        Response::success($stmt->fetchAll());
    }

    public function store(): void {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $title = trim($input['title'] ?? '');
        $classId = !empty($input['class_id']) ? intval($input['class_id']) : null;
        $type = $input['type'] ?? 'document';
        $url = trim($input['url'] ?? '');
        $description = trim($input['description'] ?? '');

        if (empty($title)) {
            Response::error('Vui lòng nhập tên tài liệu', 422);
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("INSERT INTO materials (class_id, title, type, url, description) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$classId, $title, $type, $url, $description]);

        Response::success(['id' => $db->lastInsertId()], 'Đã thêm tài liệu học tập thành công');
    }

    public function delete(int $id): void {
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM materials WHERE id = ?");
        $stmt->execute([$id]);
        Response::success(null, 'Đã xóa tài liệu');
    }
}
