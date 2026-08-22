# HNL Structural AI Workstation v1.2 — Desktop-First Audit Fix

## Đã chỉnh
- Chuyển định hướng sang desktop-first: Electron là shell Windows, backend chỉ là dịch vụ nội bộ không phơi ra LAN.
- Server nội bộ bind `127.0.0.1` thay vì `0.0.0.0`.
- Thêm security headers, tắt `x-powered-by`, no-store cho API.
- Single-instance lock: không mở nhiều HNL cùng lúc gây xung đột cổng/dữ liệu.
- Chặn điều hướng ngoài ứng dụng; link web mở bằng trình duyệt mặc định.
- Tắt DevTools trong bản đóng gói production.
- Thêm Open/Save Project native bằng Windows dialog qua preload IPC; browser fallback vẫn hoạt động.
- Thêm autosave local recovery cache.
- Header đọc `/api/csi/status` định kỳ; trạng thái ETABS/SAP2000/SAFE không còn chấm xám cố định.
- Quy ước: xám = Not Running, vàng = Process Detected, xanh = OAPI Connected (khi bridge thật được triển khai).
- Gom sidebar theo workflow: PROJECT → MODEL & CSI → ANALYSIS & DESIGN → FOUNDATION → KNOWLEDGE & AI → OUTPUT.
- WRITE MODE bị khóa nếu chưa có OAPI connection thật.
- Nâng version đồng bộ lên 1.2.0 và cập nhật tên artifact build.
- Build PowerShell/GitHub Actions ưu tiên `npm ci` khi có lock file.

## Còn bắt buộc trước bản Production Engineering
1. Viết HNL.CSI.NativeBridge thật cho ETABS/SAP2000/SAFE và test theo version cài trên Windows.
2. OAPI attach phải đọc được: software version, model path, present units, analysis status.
3. Mọi WRITE phải theo: Preview → Validation → backup file CSI → Apply → read-back verification → restore nếu lỗi.
4. Chuẩn hóa Calculation Engine theo từng code profile; bỏ heuristic còn lại ở beam/column/punching/wind/seismic/pile.
5. Excel/Report chỉ được lấy dữ liệu từ calculation result/live model, không từ sample constants.
6. RAG phải có document-id/page/clause thực; citation AI online không được tự tạo.
7. Catalog Phan Vũ phải có source URL/file/page/checksum/version và trạng thái verified riêng từng dòng sản phẩm.
8. Test Windows 10 22H2 và Windows 11 trên máy có CSI thật trước khi phát hành.

## Trạng thái phát hành
- Desktop shell / project workflow: Build-ready.
- CSI process detection: Live.
- CSI OAPI read/write: Chưa hoàn thiện — không được ghi model thật.
- Calculation/report engineering verification: Beta, cần benchmark.
