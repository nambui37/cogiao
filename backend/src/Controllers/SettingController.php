<?php
namespace Controllers;

use Config\Database;
use Utils\Response;
use PDO;

class SettingController {
    public function index(): void {
        $db = Database::getConnection();
        $stmt = $db->query("SELECT setting_key, setting_value FROM settings");
        $settings = [];
        while ($row = $stmt->fetch()) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
        Response::success($settings);
    }

    public function update(): void {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $db = Database::getConnection();

        $stmt = $db->prepare("
            INSERT INTO settings (setting_key, setting_value) 
            VALUES (?, ?)
            ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value
        ");

        foreach ($input as $key => $value) {
            $stmt->execute([$key, strval($value)]);
        }

        Response::success(null, 'Cập nhật cài đặt thành công');
    }
}
