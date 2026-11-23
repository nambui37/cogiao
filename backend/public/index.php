<?php
// Comprehensive CORS headers
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
} else {
    header("Access-Control-Allow-Origin: *");
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 86400");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

spl_autoload_register(function ($class) {
    $file = __DIR__ . '/../src/' . str_replace('\\', '/', $class) . '.php';
    if (file_exists($file)) {
        require_once $file;
        return;
    }
    $configFile = __DIR__ . '/../' . str_replace('\\', '/', $class) . '.php';
    if (file_exists($configFile)) {
        require_once $configFile;
    }
});

use Utils\Response;
use Utils\JWT;

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

function getAuthUser(): ?array {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(.*)$/i', $auth, $matches)) {
        return JWT::decode($matches[1]);
    }
    return null;
}

try {
    // 1. Auth routes
    if ($requestUri === '/api/auth/login' && $method === 'POST') {
        (new Controllers\AuthController())->login();
    }

    if ($requestUri === '/api/auth/me' && $method === 'GET') {
        $user = getAuthUser();
        if (!$user) Response::error('Chưa đăng nhập', 401);
        (new Controllers\AuthController())->me($user);
    }

    // 2. Admin Dashboard
    if ($requestUri === '/api/admin/dashboard' && $method === 'GET') {
        (new Controllers\DashboardController())->index();
    }

    // 3. Classes
    if ($requestUri === '/api/admin/classes') {
        $ctrl = new Controllers\ClassController();
        if ($method === 'GET') $ctrl->index();
        if ($method === 'POST') $ctrl->store();
    }

    if (preg_match('#^/api/admin/classes/(\d+)$#', $requestUri, $m)) {
        $id = (int)$m[1];
        $ctrl = new Controllers\ClassController();
        if ($method === 'GET') $ctrl->show($id);
        if ($method === 'PUT') $ctrl->update($id);
        if ($method === 'DELETE') $ctrl->delete($id);
    }

    // 4. Students
    if ($requestUri === '/api/admin/students') {
        $ctrl = new Controllers\StudentController();
        if ($method === 'GET') $ctrl->index();
        if ($method === 'POST') $ctrl->store();
    }

    if (preg_match('#^/api/admin/students/(\d+)$#', $requestUri, $m)) {
        $id = (int)$m[1];
        $ctrl = new Controllers\StudentController();
        if ($method === 'GET') $ctrl->show($id);
        if ($method === 'PUT') $ctrl->update($id);
        if ($method === 'DELETE') $ctrl->delete($id);
        if ($method === 'DELETE') $ctrl->delete($id);
    }

    // 5. Parent Accounts (Cấp tài khoản & gắn con)
    if ($requestUri === '/api/admin/parent-accounts') {
        $ctrl = new Controllers\ParentAccountController();
        if ($method === 'GET') $ctrl->index();
        if ($method === 'POST') $ctrl->store();
    }

    if (preg_match('#^/api/admin/parent-accounts/(\d+)$#', $requestUri, $m)) {
        $id = (int)$m[1];
        $ctrl = new Controllers\ParentAccountController();
        if ($method === 'PUT') $ctrl->update($id);
        if ($method === 'DELETE') $ctrl->delete($id);
        if ($method === 'DELETE') $ctrl->delete($id);
    }

    // 6. Attendance
    if ($requestUri === '/api/admin/attendance') {
        $ctrl = new Controllers\AttendanceController();
        if ($method === 'GET') $ctrl->getMatrix();
        if ($method === 'POST') $ctrl->saveMatrix();
    }

    // 7. Tuition & VietQR
    if ($requestUri === '/api/admin/tuition') {
        $ctrl = new Controllers\TuitionController();
        if ($method === 'GET') $ctrl->index();
        if ($method === 'POST') $ctrl->createBatch();
    }

    if ($requestUri === '/api/admin/tuition/single' && $method === 'POST') {
        (new Controllers\TuitionController())->createSingle();
    }

    if (preg_match('#^/api/admin/tuition/(\d+)$#', $requestUri, $m)) {
        $id = (int)$m[1];
        $ctrl = new Controllers\TuitionController();
        if ($method === 'PUT') $ctrl->update($id);
        if ($method === 'DELETE') $ctrl->delete($id);
    }

    if (preg_match('#^/api/admin/tuition/(\d+)/status$#', $requestUri, $m)) {
        $id = (int)$m[1];
        if ($method === 'PUT' || $method === 'POST') (new Controllers\TuitionController())->updateStatus($id);
    }

    // 8. Materials
    if ($requestUri === '/api/admin/materials') {
        $ctrl = new Controllers\MaterialController();
        if ($method === 'GET') $ctrl->index();
        if ($method === 'POST') $ctrl->store();
    }

    if (preg_match('#^/api/admin/materials/(\d+)$#', $requestUri, $m)) {
        $id = (int)$m[1];
        if ($method === 'DELETE') (new Controllers\MaterialController())->delete($id);
    }

    // 9. Settings
    if ($requestUri === '/api/admin/settings') {
        $ctrl = new Controllers\SettingController();
        if ($method === 'GET') $ctrl->index();
        if ($method === 'POST' || $method === 'PUT') $ctrl->update();
    }

    // 9.1 Admin Profile & Password Update
    if ($requestUri === '/api/admin/profile') {
        $ctrl = new Controllers\AuthController();
        if ($method === 'GET') $ctrl->getProfile();
        if ($method === 'POST' || $method === 'PUT') $ctrl->updateProfile();
    }

    // 10. Parent Portal
    if (preg_match('#^/api/parent/student/(\d+)$#', $requestUri, $m)) {
        $studentId = (int)$m[1];
        $user = getAuthUser() ?? ['id' => 2, 'role' => 'parent'];
        (new Controllers\ParentController())->getStudentDetail($studentId, $user);
    }

    // Fallback 404
    Response::error("Endpoint không tồn tại: $method $requestUri", 404);

} catch (\Throwable $e) {
    Response::error('Server Error: ' . $e->getMessage(), 500);
}
