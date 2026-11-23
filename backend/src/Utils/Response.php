<?php
namespace Utils;

class Response {
    public static function json($data = null, int $statusCode = 200, string $message = ''): void {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => $statusCode >= 200 && $statusCode < 300,
            'message' => $message,
            'data' => $data,
            'timestamp' => date('c')
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function success($data = null, string $message = 'Thành công'): void {
        self::json($data, 200, $message);
    }

    public static function error(string $message = 'Đã có lỗi xảy ra', int $statusCode = 400, $data = null): void {
        self::json($data, $statusCode, $message);
    }
}
