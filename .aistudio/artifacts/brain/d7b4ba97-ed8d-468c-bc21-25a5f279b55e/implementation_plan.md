# Cờ Tỷ Phú Việt Nam (Phiên Bản Kinh Điển Sài Gòn Xưa)

Trò chơi bàn cờ tỷ phú Việt Nam tương tác hoàn chỉnh, tái hiện chuẩn xác 100% đồ họa và danh xưng 40 ô bàn cờ kinh điển từ hình ảnh đính kèm (Phú Lâm, Thị Nghè, Tân Định, Bến xe Lam Sài Gòn, Cố Đô Huế, v.v.), hỗ trợ chơi cùng bot AI thông minh hoặc đấu 2–4 người cùng máy (Pass & Play) với đầy đủ luật chơi bất động sản kinh điển.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Dưới đây là các quyết định đã xác nhận từ phiên làm rõ câu hỏi và danh sách toàn bộ luật chơi được liệt kê chi tiết để bạn kiểm duyệt trước khi lập trình.

- **Chế độ chơi đã chọn**: Hỗ trợ linh hoạt cả **Đấu với AI máy tính thông minh** (1 người + 1–3 AI) và **Đấu nhiều người (Pass & Play)** trên cùng một thiết bị (2–4 người chơi).
- **Phong cách hiển thị đã chọn**: **Bàn cờ 2D tương tác trực quan chuẩn xác 100% theo ảnh gốc** với đầy đủ màu sắc, font chữ retro, biểu tượng xe hơi, vòi nước, bóng đèn, rương Khí Vận, dấu hỏi Cơ Hội, ông tỷ phú chống gậy nghiêng 45 độ giữa bàn cờ, kết hợp camera zoom/pan linh hoạt khi xúc xắc lăn và quân cờ di chuyển.
- **Yêu cầu review luật chơi**: Toàn bộ luật chơi kinh điển được trình bày chi tiết ở mục bên dưới để bạn duyệt trước.

---

## Danh Sách 40 Ô Bàn Cờ Chuẩn 100% Theo Ảnh Gốc

Bàn cờ gồm 40 ô chia làm 4 cạnh theo chiều kim đồng hồ, bắt đầu từ góc dưới bên phải:

```
[20. Sân bay] ──────── [Top: Công Lý -> Xa lộ Biên Hòa] ──────── [30. Vào tù]
      │                                                                  │
  [Left Edge:                                                       [Right Edge:
   Hùng Vương,                                                       Phan Thanh Giản,
   Chợ Lớn,                                                          Huế,
   Điện lực]                                                         Nha Trang]
      │                                                                  │
[10. Thăm tù] ─────── [Bottom: Chương Dương -> Phú Lâm] ─────── [0. Khởi hành]
```

1. **Cạnh Dưới (Từ phải sang trái - Điểm xuất phát)**:
   - **Ô 0 (Góc dưới-phải)**: **Trạm khởi hành** (Đi qua trạm khởi hành được thưởng 200đ)
   - **Ô 1**: **Phú Lâm** (60đ - Nhóm Tím)
   - **Ô 2**: **Khí vận** (Rương kho báu)
   - **Ô 3**: **Nhà bè Phú Xuân** (60đ - Nhóm Tím)
   - **Ô 4**: **Thuế lợi tức** (Đóng 200đ vào ngân hàng)
   - **Ô 5**: **Bến xe Lục Tỉnh** (200đ - Nhóm Giao thông xe hơi)
   - **Ô 6**: **Thị Nghè** (100đ - Nhóm Lam nhạt)
   - **Ô 7**: **Cơ hội** (Dấu hỏi chấm đỏ)
   - **Ô 8**: **Tân Định** (100đ - Nhóm Lam nhạt)
   - **Ô 9**: **Bến Chương Dương** (120đ - Nhóm Lam nhạt)

2. **Góc Trái Dưới & Cạnh Trái (Từ dưới lên trên)**:
   - **Ô 10 (Góc dưới-trái)**: **Thăm tù / Ở tù**
   - **Ô 11**: **Phan Đình Phùng** (140đ - Nhóm Hồng cánh sen)
   - **Ô 12**: **Công ty điện lực** (150đ - Dịch vụ công ích bóng đèn)
   - **Ô 13**: **Trịnh Minh Thế** (140đ - Nhóm Hồng cánh sen)
   - **Ô 14**: **Lý Thái Tổ** (160đ - Nhóm Hồng cánh sen)
   - **Ô 15**: **Bến xe Chợ Lớn** (200đ - Nhóm Giao thông xe hơi)
   - **Ô 16**: **Đại lộ Hùng Vương** (180đ - Nhóm Cam)
   - **Ô 17**: **Khí vận** (Rương kho báu)
   - **Ô 18**: **Gia Long** (180đ - Nhóm Cam)
   - **Ô 19**: **Bến Bạch Đằng** (200đ - Nhóm Cam)

3. **Góc Trái Trên & Cạnh Trên (Từ trái sang phải)**:
   - **Ô 20 (Góc trên-trái)**: **Sân bay** (Nghỉ chân an toàn)
   - **Ô 21**: **Đường Công Lý** (220đ - Nhóm Đỏ)
   - **Ô 22**: **Cơ hội** (Dấu hỏi chấm đỏ)
   - **Ô 23**: **Đại lộ Thống Nhất** (220đ - Nhóm Đỏ)
   - **Ô 24**: **Đại lộ Cộng Hòa** (240đ - Nhóm Đỏ)
   - **Ô 25**: **Bến xe An Đông** (200đ - Nhóm Giao thông xe hơi)
   - **Ô 26**: **Đại lộ Hồng Thập Tự** (260đ - Nhóm Vàng)
   - **Ô 27**: **Đại lộ Hai Bà Trưng** (260đ - Nhóm Vàng)
   - **Ô 28**: **Công ty thủy cục** (150đ - Dịch vụ công ích vòi nước)
   - **Ô 29**: **Xa lộ Biên Hòa** (280đ - Nhóm Vàng)

4. **Góc Phải Trên & Cạnh Phải (Từ trên xuống dưới)**:
   - **Ô 30 (Góc trên-phải)**: **Vào tù** (Bị cảnh sát bắt vào tù, đi qua trạm khởi hành không được thưởng)
   - **Ô 31**: **Phan Thanh Giản** (300đ - Nhóm Xanh lá)
   - **Ô 32**: **Lê Văn Duyệt** (300đ - Nhóm Xanh lá)
   - **Ô 33**: **Khí vận** (Rương kho báu)
   - **Ô 34**: **Nguyễn Thái Học** (320đ - Nhóm Xanh lá)
   - **Ô 35**: **Bến xe Lam Sài Gòn** (200đ - Nhóm Giao thông xe lam đỏ)
   - **Ô 36**: **Cơ hội** (Dấu hỏi chấm đỏ)
   - **Ô 37**: **Nha Trang** (350đ - Nhóm Xanh dương đậm)
   - **Ô 38**: **Thuế lương bổng** (Đóng 100đ - Biểu tượng kim cương)
   - **Ô 39**: **Cố Đô Huế** (400đ - Nhóm Xanh dương đậm đắt giá nhất)

---

## Chi Tiết Toàn Bộ Luật Chơi Cờ Tỷ Phú

### 1. Vốn Khởi Đầu & Chuẩn Bị
- Mỗi người chơi bắt đầu với số vốn **1.500đ** (tiền tệ quy chuẩn theo mệnh giá gốc trên bàn cờ).
- Tùy chọn 2 đến 4 người chơi (con cờ hình nón/màu sắc nhận diện: Đỏ, Xanh dương, Xanh lá, Vàng).

### 2. Lắc Xúc Xắc & Di Chuyển
- Người chơi lắc cùng lúc **2 xúc xắc** (tổng từ 2 đến 12). Quân cờ di chuyển từng bước theo chiều kim đồng hồ kèm âm thanh nảy quân.
- **Xúc xắc đôi (Hai mặt xúc xắc bằng nhau)**:
  - Người chơi được tung tiếp một lượt sau khi giải quyết ô hiện tại.
  - Nếu tung được **3 lần đôi liên tiếp**, người chơi bị xem là "chạy quá tốc độ / gian lận" và bị tống **Vào tù ngay lập tức**, kết thúc lượt.
- **Đi qua Trạm Khởi Hành**:
  - Nhận ngay **200đ** từ Ngân Hàng.
  - Nếu đáp trúng ngay ô Trạm Khởi Hành: nhận 200đ (tùy chọn thưởng thêm theo luật nhà 400đ nếu người chơi muốn).

### 3. Mua Đất & Thu Tiền Thuê (Bất Động Sản)
- **Đất chưa có chủ**: Khi đứng vào ô đất chưa ai sở hữu, người chơi có quyền mua với mức giá niêm yết trên bàn cờ. Nếu từ chối mua, hệ thống cho phép đấu giá hoặc giữ nguyên để người sau mua.
- **Đất đã có chủ**: Người ghé thăm phải trả tiền thuê đất cho chủ sở hữu:
  - Khi chưa xây nhà: tiền thuê cơ bản (khoảng 10% giá đất).
  - Khi sở hữu trọn bộ cùng màu (Monopoly): tiền thuê đất trống tăng **gấp đôi (x2)** và mở quyền xây dựng nhà.

### 4. Xây Nhà & Khách Sạn (Nâng Cấp Bất Động Sản)
- Chỉ được xây dựng khi người chơi sở hữu **toàn bộ các ô đất trong cùng một nhóm màu**.
- Quy tắc xây dựng đồng đều: Không được xây nhà thứ 2 trên 1 ô đất nếu các ô còn lại trong nhóm chưa có ít nhất 1 nhà.
- Cấp bậc nâng cấp: **Đất trống -> 1 Nhà -> 2 Nhà -> 3 Nhà -> 4 Nhà -> Khách Sạn (Biệt Thự)**.
- Tiền thuê tăng vọt theo cấp nhà, tối đa khi có Khách Sạn (ví dụ Cố Đô Huế có khách sạn có thể thu tới 2.000đ).

### 5. Luật 4 Bến Xe (Hệ Thống Giao Thông)
- Gồm: *Bến xe Lục Tỉnh, Bến xe Chợ Lớn, Bến xe An Đông, Bến xe Lam Sài Gòn* (giá mua 200đ mỗi bến).
- Tiền thuê phụ thuộc vào số lượng bến xe mà chủ sở hữu nắm giữ:
  - Sở hữu 1 bến xe: 25đ
  - Sở hữu 2 bến xe: 50đ
  - Sở hữu 3 bến xe: 100đ
  - Sở hữu trọn bộ 4 bến xe: 200đ

### 6. Luật 2 Công Ty Dịch Vụ Công Ích (Điện Lực & Thủy Cục)
- Giá mua: 150đ mỗi công ty.
- Tiền thuê tính theo **số điểm của xúc xắc** vừa tung:
  - Nếu chủ sở hữu chỉ có 1 công ty: tiền thuê = **4 x Tổng điểm xúc xắc**.
  - Nếu sở hữu cả Điện Lực và Thủy Cục: tiền thuê = **10 x Tổng điểm xúc xắc**.

### 7. Các Loại Thuế & Ô Đặc Biệt
- **Thuế Lợi Tức**: Trả 200đ cho Ngân Hàng.
- **Thuế Lương Bổng**: Trả 100đ cho Ngân Hàng.
- **Sân Bay (Bãi đỗ xe an toàn)**: Nghỉ ngơi miễn phí, không phát sinh chi phí hay sự kiện.

### 8. Thẻ Cơ Hội & Khí Vận (60+ lá bài nội dung Việt Nam xưa)
Khi rơi vào ô có dấu hỏi (?) đỏ (Cơ Hội) hoặc rương vàng (Khí Vận), người chơi rút 1 lá bài:
- *Thưởng tiền*: "Bạn trúng số độc đắc nhận 100đ", "Ngân hàng chi trả cổ tức 50đ", "Được hoàn thuế nhận 20đ".
- *Phạt tiền*: "Đóng phạt vi phạm giao thông 15đ", "Sửa chữa toàn bộ nhà cửa: đóng 25đ/nhà và 100đ/khách sạn", "Nộp tiền viện phí 50đ".
- *Tương tác người chơi*: "Hôm nay là sinh nhật bạn, mỗi người chơi tặng bạn 10đ".
- *Di chuyển*: "Đi thẳng đến Trạm Khởi Hành (nhận 200đ)", "Đi thẳng đến Cố Đô Huế", "Đi thẳng đến Bến xe Lam Sài Gòn", "Lùi lại 3 ô".
- *Thẻ đặc biệt*: "Thẻ ra tù miễn phí" (giữ lại sử dụng hoặc bán cho người chơi khác với giá thỏa thuận).

### 9. Luật Tù (Ở Tù, Thăm Tù, Vào Tù)
- **Cách bị vào tù**:
  - Đứng vào ô **Vào tù** (Góc trên-phải).
  - Rút phải thẻ Cơ Hội / Khí Vận "Đi thẳng vào tù".
  - Lắc xúc xắc đôi 3 lần liên tiếp trong một lượt.
- **Khi ở trong tù**:
  - Không được di chuyển trên bàn cờ.
  - Vẫn được thu tiền thuê từ đất đai đang sở hữu và tham gia mua bán/nâng cấp.
- **Cách thoát khỏi tù**:
  - Dùng "Thẻ ra tù miễn phí".
  - Đóng tiền bảo lãnh **50đ** trước khi tung xúc xắc.
  - Tung xúc xắc đôi trong 3 lượt ở tù kế tiếp (nếu tung được đôi thì ra tù ngay và đi đúng số bước vừa tung). Nếu sau 3 lượt vẫn không tung được đôi, bắt buộc phải trả 50đ và đi số bước của lần tung thứ 3.
- **Thăm tù**: Người chơi đi bình thường dừng tại ô góc dưới-trái chỉ là "Thăm tù" (Just Visiting), không bị giam giữ.

### 10. Cầm Cố Đất & Phá Sản
- **Cầm Cố (Thế chấp)**: Khi kẹt tiền, người chơi có thể thế chấp đất cho Ngân Hàng lấy 50% giá trị đất (với điều kiện đã bán hết nhà trên đất đó). Đất đang cầm cố không thu được tiền thuê. Chuộc lại đất bằng cách trả tiền cầm cố + 10% lãi.
- **Phá Sản (Thua cuộc)**:
  - Khi phải trả nợ (cho người chơi khác hoặc Ngân Hàng) mà tổng tài sản sau khi bán nhà và thế chấp đất vẫn không đủ.
  - Toàn bộ tài sản chuyển giao cho chủ nợ hoặc hoàn trả về Ngân Hàng. Người chơi bị loại khỏi cuộc chơi.
  - **Điều kiện thắng**: Người chơi cuối cùng còn trụ lại sau khi tất cả đối thủ phá sản trở thành **Đại Tỷ Phú Sài Gòn**.

---

## 1. Overview & Core Concept

- **Mục tiêu**: Tái hiện trải nghiệm tuổi thơ Cờ Tỷ Phú Việt Nam chân thực nhất trên nền tảng web hiện đại.
- **Giao diện & Cảm giác chơi**:
  - Bàn cờ hình vuông chuẩn tỷ lệ, nền trắng ngà hoài niệm, viền đen sắc nét.
  - Font chữ đậm chất bản in typographic Sài Gòn thập niên xưa.
  - Khu trung tâm trang bị 2 khay rút thẻ **CƠ HỘI** (hồng) và **KHÍ VẬN** (vàng) nghiêng 45 độ với hình tượng quý ông Monopoly đội mũ chóp đen chống gậy.
  - Hệ thống xúc xắc 3D/2.5D lắc nảy chân thực, âm thanh gõ gỗ, tiếng leng keng thu tiền, tiếng còi cảnh sát vào tù.
- **Đối tượng**: Mọi lứa tuổi yêu thích board game truyền thống Việt Nam.

---

## 2. User Experience & Visual Design

### Flow người dùng
1. **Màn hình chính (Game Shell)**:
   - Logo nghệ thuật "CỜ TỶ PHÚ".
   - Chọn số người chơi (2 - 4 người).
   - Thiết lập từng vị trí: Người chơi người thật (Pass & Play) hoặc Bot AI (Dễ / Vừa / Tinh ranh).
   - Nút `"BẮT ĐẦU CHƠI"` và nút `"XEM BẢNG LUẬT"`.
2. **Bàn cờ thực chiến (Playing View)**:
   - Bàn cờ toàn màn hình hiển thị 40 ô rõ nét.
   - Bảng điều khiển người chơi đang đến lượt (Avatar, Tiền mặt, Danh sách sổ đỏ sở hữu, Nút "Tung Xúc Xắc", "Nâng Cấp Nhà", "Cầm Cố", "Kết Thúc Lượt").
   - Hiệu ứng camera: Khi xúc xắc tung và quân cờ nhảy từng ô, hiển thị thẻ đất phóng to (Property Deed Card) khi dừng chân để người chơi quyết định Mua / Đấu giá / Trả tiền thuê.
   - Thẻ Cơ hội & Khí vận: Hiệu ứng rút thẻ từ trung tâm bàn cờ lật mở mượt mà kèm âm thanh độc quyền.
3. **Màn hình thắng cuộc (Victory Modal)**:
   - Vinh danh nhà Vô Địch Tỷ Phú với thống kê tài sản tổng cộng, số nhà đã xây, số đối thủ đã đánh bại và nút "Chơi Ván Mới".

---

## 3. Key Product Decisions & Trade-Offs

- **Quyết định 1: Đồ họa 2D Canvas/SVG kết hợp React DOM chi tiết**:
  - *Lựa chọn*: Dùng SVG/Canvas kết hợp CSS layout để tái tạo 100% từng chi tiết viền nét, biểu tượng xe hơi, chữ viết, góc xoay 90 độ của các cạnh bàn cờ giống y hệt ảnh đính kèm.
  - *Lý do*: Ảnh chụp của bạn có thiết kế 2D phẳng truyền thống rất đặc trưng; dựng 2D tương tác chuẩn pixel giúp chữ viết tiếng Việt có dấu rõ nét hoàn hảo ở mọi độ phân giải màn hình mà không bị mờ hay méo font.
- **Quyết định 2: Tích hợp âm thanh Web Audio API tổng hợp**:
  - *Lựa chọn*: Tích hợp âm thanh xúc xắc lăn lách cách, tiếng chuông leng keng khi nhận 200đ qua trạm khởi hành, tiếng còi khi vào tù và tiếng búa gõ mua đất mà không phụ thuộc file MP3 nặng từ bên ngoài.
- **Quyết định 3: Trí tuệ nhân tạo (Bot AI)**:
  - *Lựa chọn*: Lập trình bot AI có tính cách rõ ràng: biết cân nhắc ngân sách dự phòng, ưu tiên gom đủ bộ đất màu để xây nhà, biết thế chấp đất ít giá trị khi thiếu nợ.

---

## 4. Technical Architecture & Data Strategy

### Sơ Đồ Kiến Trúc Hệ Thống

```
┌───────────────────────────────────────────────────────────────┐
│                    CỜ TỶ PHÚ VIỆT NAM                         │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│   ┌──────────────────┐               ┌──────────────────┐     │
│   │   Game Engine    │ ────────────> │  Turn Controller │     │
│   │ (40 Tiles Model) │               │   & AI Decision  │     │
│   └─────────┬────────┘               └────────┬─────────┘     │
│             │                                 │               │
│             ▼                                 ▼               │
│   ┌──────────────────┐               ┌──────────────────┐     │
│   │ 2D Vintage Board │ <───────────> │ Interactive HUD  │     │
│   │ (SVGs & Tokens)  │               │  (Cards & Rolls) │     │
│   └──────────────────┘               └──────────────────┘     │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Các Module Cốt Lõi
- `tilesData.ts`: Dữ liệu chính xác 40 ô cờ (Tên ô, Màu sắc, Giá mua, Giá thuê theo cấp độ nhà, Giá xây nhà, Loại ô: Đất, Xe, Công ty, Thuế, Thẻ, Góc).
- `cardsData.ts`: Bộ 32 thẻ Cơ Hội & 32 thẻ Khí Vận đậm chất bản địa Sài Gòn.
- `useMonopolyEngine.ts`: State machine quản lý lượt chơi, lắc xúc xắc, di chuyển quân, tính toán tiền thuê, xây nhà, vào tù, kiểm tra phá sản.
- `aiLogic.ts`: Thuật toán quyết định hành vi cho máy tính (mua đất, xây nhà, trả nợ).
- `BoardView.tsx`: Render bàn cờ tỷ lệ chuẩn với các ô xoay 4 hướng, 2 khay rút thẻ ở tâm và vị trí các quân cờ đang đứng.
- `DiceRoller.tsx`: Hiệu ứng xúc xắc chuyển động 3D vật lý.
- `PropertyModal.tsx`: Thẻ sổ đỏ hiển thị chi tiết tiền thuê từng cấp nhà khi mua bán.
- `audioEngine.ts`: Tạo âm thanh procedural sống động qua Web Audio API.
