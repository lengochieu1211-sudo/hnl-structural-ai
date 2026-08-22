# HNL Structural AI Workstation – Deep Audit v1.0

## Các lỗi nghiêm trọng phát hiện trong ZIP gốc
- `CsiConnectorView.tsx` hiển thị ETABS/SAFE "Connected" cùng đường dẫn model, PID và log cố định dù không có OAPI thật.
- `/api/csi/status` trả về ba phần mềm và model giả cố định.
- Các nút Extract Reaction / Export Spring / Create Model chỉ dùng `setTimeout()` rồi in log thành công; không gọi CSI.
- Dữ liệu dự án ban đầu là `SAMPLE_PROJECT`, không phải dữ liệu được đọc từ model thực.
- AI offline fallback chứa sẵn số phản lực/sức chịu tải cọc mẫu; dễ bị hiểu nhầm là kết quả dự án.
- Route Phan Vũ `/api/phanvu/sync` là mock, không đồng bộ website thật.
- Giao diện top-ribbon quá dài, khó sử dụng ở laptop màn hình nhỏ.

## Đã chỉnh
- Đổi branding thành HNL Structural AI Workstation v1.0.
- Dùng logo HNL tải lên làm icon ứng dụng, favicon và sidebar brand.
- Chuyển điều hướng chính sang sidebar chuyên nghiệp, có thu gọn và mobile drawer.
- Mở rộng vùng làm việc tới 1680px, phù hợp laptop/desktop kỹ thuật.
- Thêm Electron desktop wrapper, Windows installer NSIS và Portable EXE config.
- Installer cấu hình tạo shortcut Desktop + Start Menu, cho chọn thư mục cài.
- Thêm GitHub Actions Windows build để build `.exe` thật trên `windows-latest`.
- Sửa static server path để chạy đúng khi đóng gói desktop.
- `/api/csi/status` không còn báo kết nối giả; trên Windows nó phát hiện process ETABS/SAP2000/SAFE thực tế.

## Còn phải làm để gọi là "liên kết CSI OAPI hoàn chỉnh"
- Gắn các CSI API assembly đúng phiên bản ETABS/SAP2000/SAFE đang cài.
- Implement AttachToInstance / GetActiveObject theo API chính thức của từng version.
- Implement read model: units, filename, stories, frames, shells, load cases, combinations, results.
- Implement write mode có backup + preview + transaction guard.
- Thay các handler setTimeout trong `CsiConnectorView.tsx` bằng API calls thật.
- Kiểm thử trên tối thiểu: ETABS 20/21/22+, SAP2000 23/24/25+, SAFE 20/21+.

## Kết luận audit
Calculation engines trong source có cấu trúc riêng và có nhiều module thực, nhưng ZIP gốc chưa thể được gọi là đã liên kết thực với ba phần mềm CSI. Bản HNL v1.0 đã sửa phần desktop packaging, giao diện và loại bỏ server status giả; native OAPI cần được hoàn thiện/test trên Windows có CSI cài thật trước khi dùng cho thiết kế thực tế.
