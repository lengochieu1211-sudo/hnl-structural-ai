# HNL Structural AI Workstation v1.1 - Audit/Fix

## Đã sửa trong v1.1
- Startup chuyển sang **Dự án mới trống**, không tự nạp SAMPLE_PROJECT.
- Có nút **Mở DEMO** riêng và ghi rõ dữ liệu minh họa.
- Đồng bộ version UI/server/package thành **1.1.0**.
- Bỏ AI fallback tạo số kỹ thuật giả khi chưa cấu hình provider.
- Bỏ Deep Research fallback tạo điều khoản/citation giả.
- API Phan Vũ Sync không còn báo UPDATED/VERIFIED giả; trả NOT_CONFIGURED cho tới khi có fetcher thật.
- Bộ lọc nhà sản xuất cọc được gắn state + onClick và lọc dữ liệu thật trong bảng.
- 6 nút File Exchange chưa có backend (.e2k/.f2k/Excel) được **disable rõ ràng** thay vì bấm không phản hồi.
- Excel/Thuyết minh khóa xuất khi workspace chưa có dữ liệu phân tích/cọc để tránh sinh báo cáo số mẫu.
- AI Assistant offline fallback chỉ báo provider chưa sẵn sàng, không tự kết luận kỹ thuật.
- Build script Windows mới: kiểm tra Node/npm -> lint -> build -> electron-builder.

## Chưa được coi là hoàn tất kỹ thuật
- CSI Native OAPI Bridge thật cho ETABS/SAP2000/SAFE vẫn chưa có trong source gốc. Hiện chỉ phát hiện process Windows.
- Beam/Column/Punching/Wind/Seismic/Pile engines vẫn cần benchmark và triển khai đúng từng tiêu chuẩn trước khi bật trạng thái VERIFIED.
- ExcelEngine/ReportEngine còn dữ liệu mẫu hard-code ở các nhánh DEMO; v1.1 ngăn export trên workspace trống nhưng cần refactor triệt để trước phát hành production.
- Live Phan Vũ catalog sync cần fetch/parser/version/checksum thật.
- OpenAI/Ollama/LM Studio/Claude provider chưa có, hiện chủ yếu Gemini.

## Mức phát hành
Bản v1.1 là **Audit-Fix / Build Ready**, không phải bản được chứng nhận cho thiết kế kết cấu cuối cùng.
