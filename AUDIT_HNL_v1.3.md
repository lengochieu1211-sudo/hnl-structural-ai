# HNL Structural AI Workstation v1.3 – Audit Fix

## Đã chỉnh
- GitHub Actions tự build khi push lên `main`, vẫn hỗ trợ Run workflow thủ công và tag `v*`.
- Build bắt buộc kiểm tra TypeScript trước khi đóng gói.
- Sau build bắt buộc xác nhận có file `.exe`; nếu không có workflow báo lỗi rõ ràng.
- Artifact chỉ lấy file cài/portable cần thiết, giữ 30 ngày.
- Tắt auto code-sign discovery để tránh lỗi certificate trên GitHub runner.
- Đồng bộ version v1.3.0.
- Làm lại logo/icon từ logo HNL gốc, bỏ phần checkerboard/khung thừa bên ngoài.
- Giữ nguyên cơ chế an toàn: PROCESS_DETECTED không được coi là OAPI_CONNECTED và WRITE MODE không bật nếu chưa attach API thật.

## Trạng thái tính năng
- Giao diện, dự án local, autosave, menu, Calculation UI: có source thực.
- ETABS/SAP2000/SAFE process detection: có.
- Native CSI OAPI attach/write/read-back: chưa hoàn thiện; các nút phụ thuộc OAPI phải tiếp tục khóa/ghi rõ trạng thái thay vì chạy giả.
- AI online phụ thuộc API key/provider; không được tạo kết quả kỹ thuật giả khi offline.

## Cần test trên Windows
1. Mở Setup và Portable.
2. Kiểm tra icon/taskbar/shortcut.
3. Kiểm tra New/Open/Save Project.
4. Mở ETABS/SAP2000/SAFE và kiểm tra trạng thái PROCESS_DETECTED.
5. Không bật WRITE MODE khi chưa có OAPI_CONNECTED.
6. Kiểm tra toàn bộ tab, nút tính, Excel/Report với dự án có dữ liệu thật.
