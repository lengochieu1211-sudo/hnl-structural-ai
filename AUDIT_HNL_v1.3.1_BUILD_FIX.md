# HNL Structural AI Workstation v1.3.1 — GitHub Build Fix

## Lỗi xác định từ GitHub Actions log 88295798632

1. Build NSIS đã tạo EXE thành công nhưng electron-builder tự kích hoạt publish do môi trường CI.
2. Build dừng ở lỗi `GitHub Personal Access Token is not set ... GH_TOKEN`.
3. NSIS và Portable dùng chung `artifactName`, có nguy cơ file Portable ghi đè file Setup.
4. `server.ts` được bundle CJS nhưng dùng `import.meta.url`; log cảnh báo `import.meta is not available with cjs`, có nguy cơ app build xong nhưng không mở được.
5. `/api/health` còn báo version 1.2.0.
6. Deep Research trả danh sách citation tĩnh dù chưa có RAG metadata nguồn thật.
7. Workflow dùng checkout/setup-node v4 phát cảnh báo Node 20 deprecated.

## Đã sửa

- `electron-builder --publish never` — không còn yêu cầu GH_TOKEN.
- Tách tên output: `HNL-Structural-AI-Setup-*` và `HNL-Structural-AI-Portable-*`.
- Server bundle sang ESM `dist/server.mjs`; Electron main dùng dynamic import.
- Startup có try/catch và hộp lỗi rõ ràng nếu local service không khởi động.
- Đồng bộ version 1.3.1.
- AI model đọc từ `GEMINI_MODEL`, fallback `gemini-2.5-flash`.
- Không sinh citation tĩnh trong Research endpoint.
- Workflow dùng checkout@v5/setup-node@v5 và verify bắt buộc cả Setup + Portable.
- GitHub artifact: `HNL-Structural-AI-Windows-v1.3.1`.

## Trạng thái CSI

ETABS/SAP2000/SAFE vẫn chỉ được phát hiện process ở bản này. Native CSI OAPI bridge chưa được triển khai nên WRITE MODE phải tiếp tục khóa.
