#!/bin/bash

echo "=========================================================="
echo "  🚀 KHỞI ĐỘNG HỆ THỐNG THỦY ENGLISH (STUDENT SYSTEM) 2.0"
echo "=========================================================="

echo "1. Đang khởi chạy PHP REST API Backend trên cổng 8088..."
php -S 127.0.0.1:8088 -t backend/public > /dev/null 2>&1 &
PHP_PID=$!

echo "2. Đang khởi chạy Frontend React + Vite trên cổng 5173..."
cd frontend && npm run dev &
FRONTEND_PID=$!

trap "echo 'Đang dừng hệ thống...'; kill $PHP_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM EXIT

echo ""
echo "✅ HỆ THỐNG ĐÃ SẴN SÀNG:"
echo "👉 Mở trình duyệt truy cập: http://localhost:5173"
echo "👉 Backend API:             http://localhost:8088"
echo ""
echo "Nhấn Ctrl + C để dừng hệ thống."

wait
