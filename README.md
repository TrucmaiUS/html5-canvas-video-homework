# HTML5 Canvas + Video Edge Detection

Bài tập xây dựng một website đơn giản sử dụng **HTML5 Video** và **Canvas** để hiển thị kết quả phát hiện biên cạnh của từng frame trong video.

## Mục tiêu

Dựa trên demo HTML5 Canvas + Video, website cần thực hiện:

- Hiển thị video và canvas với cùng kích thước
- Khi video được phát, canvas hiển thị ảnh biên cạnh của frame hiện tại
- Hoàn thiện website và deploy lên GitHub Pages

## Tính năng chính

- Phát video trực tiếp trên trình duyệt
- Trích xuất frame hiện tại từ video bằng HTML5 Canvas
- Chuyển frame sang ảnh xám
- Áp dụng **Sobel operator** để phát hiện biên cạnh
- Hiển thị kết quả theo thời gian thực khi video đang chạy
- Hỗ trợ các trạng thái:
  - `play`
  - `pause`
  - `ended`
  - `seeked`
