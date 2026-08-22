# HNL Structural AI Workstation v1.3

Ứng dụng desktop-first cho Windows 10/11, hướng tới workflow ETABS + SAP2000 + SAFE + Calculation Engine + Excel + AI/Knowledge.

## Build EXE trên Windows
1. Cài Node.js 22 LTS.
2. Giải nén source vào đường dẫn ngắn, ví dụ `D:\HNL-Structural-AI`.
3. Chạy `BUILD_WINDOWS_EXE.bat`.
4. File Setup và Portable được tạo trong `release\`.

## Kiến trúc desktop
Electron mở giao diện HNL và khởi chạy dịch vụ xử lý **nội bộ trên 127.0.0.1**. Đây không phải hosting/server Internet và không mở backend ra mạng LAN.

## An toàn CSI
Bản v1.3 có thể phát hiện process ETABS/SAP2000/SAFE trên Windows nhưng chưa coi đó là OAPI Connected. WRITE MODE bị khóa cho đến khi Native OAPI Bridge thật attach thành công.

Đọc `AUDIT_HNL_v1.3.md` trước khi dùng cho công việc thiết kế thực tế.
