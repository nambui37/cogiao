<?php
namespace Utils;

class Response {
    public static function json($data = null, int $statusCode = 200, string $message = ''): void {
        if (isset($_SERVER['HTTP_ORIGIN'])) {
            header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
        } else {
            header("Access-Control-Allow-Origin: *");
        }
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept");

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
