# 📋 BÁO CÁO KIỂM THỬ TOÀN DIỆN LOGIC TRIGGER NĂNG LỰC CỜ TỶ PHÚ VIỆT NAM

**Phiên bản ứng dụng:** `v1.5.4`  
**Ngày kiểm thử & cập nhật:** 10/11/2026  
**Lệnh chạy kiểm thử tự động:** `npx tsx scripts/test_abilities_logic.ts`  
**Kết quả tổng quan:** **66 / 66 test case ĐẠT (100% PASS)**

---

## 📊 1. BẢNG TỔNG HỢP KIỂM THỬ

| Nhóm Năng Lực / Tính Năng | Số lượng | Đạt (Pass) | Lỗi (Fail) | Trạng thái |
|---|:---:|:---:|:---:|:---:|
| **Năng Lực Dùng 1 Lần (Consumable)** | 25 | 25 | 0 | ✅ Hoàn hảo |
| **Năng Lực Vĩnh Viễn (Permanent)** | 4 | 4 | 0 | ✅ Hoàn hảo (Trigger 2 chiều đầy đủ) |
| **Năng Lực Điều Tra Viên (Investigator)** | 16 | 16 (20 cases) | 0 | ✅ Hoàn hảo (Random ngay lần đầu xuất hiện) |
| **Tuần Tra Ngược Chiều (Investigator Reverse Patrol)** | 3 | 3 | 0 | ✅ Hoàn hảo (0 -> 39 -> 38 ... -> 0) |
| **Lọc Năng Lực Tăng/Giảm Ô Di Chuyển Cho AI** | 5 | 5 | 0 | ✅ Hoàn hảo (Loại bỏ dice_boost, dice_reduce, push_neighbor) |
| **Quy Chế Thẻ Khởi Hành (cs-10, ch-1) & Xuất Nhật Ký** | 4 | 4 | 0 | ✅ Hoàn hảo (cs-10 & ch-1 không nhận thưởng theo đúng quy chế & export log debug) |
| **Fix Gia Tốc/Hãm Phanh Di Chuyển Ngay, Thuế Đất Trống & Cùng Màu** | 4 | 4 | 0 | ✅ Hoàn hảo (Di chuyển ngay lập tức, tính thuế đất trống theo giá gốc 100%, tăng theo nhà cùng màu) |
| **TỔNG CỘNG** | **61** | **66 cases** | **0** | 🎯 **100% VƯỢT QUA** |

---

## ⚡ 2. CHI TIẾT KIỂM THỬ NĂNG LỰC DÙNG 1 LẦN (CONSUMABLE - 25 KỸ NĂNG)

| STT | Mã ID | Tên Kỹ Năng | Điều Kiện Trigger | Phạm Vi | Kết Quả Logic Thực Tế | Trạng Thái |
|:---:|---|---|---|---|---|:---:|
| 1 | `dice-plus-1` | Gia Tốc Xúc Xắc (+1) | `when_roll_dice` / Sau lượt | Bản thân | Tăng +1 bước vào xúc xắc; Đã loại bỏ khỏi pool AI | ✅ PASS |
| 2 | `dice-plus-2` | Gia Tốc Xúc Xắc (+2) | `when_roll_dice` / Sau lượt | Bản thân | Tăng +2 bước vào xúc xắc; Đã loại bỏ khỏi pool AI | ✅ PASS |
| 3 | `dice-plus-3` | Gia Tốc Xúc Xắc (+3) | `when_roll_dice` / Sau lượt | Bản thân | Tăng +3 bước vào xúc xắc; Đã loại bỏ khỏi pool AI | ✅ PASS |
| 4 | `dice-minus-1` | Hãm Phanh Xúc Xắc (-1) | `when_roll_dice` / Sau lượt | Bản thân | Giảm -1 bước về ô an toàn; Đã loại bỏ khỏi pool AI | ✅ PASS |
| 5 | `dice-minus-2` | Hãm Phanh Xúc Xắc (-2) | `when_roll_dice` / Sau lượt | Bản thân | Giảm -2 bước về ô an toàn; Đã loại bỏ khỏi pool AI | ✅ PASS |
| 6 | `dice-minus-3` | Hãm Phanh Xúc Xắc (-3) | `when_roll_dice` / Sau lượt | Bản thân | Giảm -3 bước về ô an toàn; Đã loại bỏ khỏi pool AI | ✅ PASS |
| 7 | `free-tax-once` | Kim Bài Miễn Thuế | `when_pay_tax` | Bản thân | Gán `hasFreeTaxNextTurn = true`; khi vào ô Thuế được miễn trừ 100% | ✅ PASS |
| 8 | `half-rent-discount` | Phiếu Giảm Giá 50% Thuê Đất | `when_pay_rent` | Bản thân | Gán `hasHalfRentDiscountNextTurn = true`; giảm 50% tiền thuê đất ở ô kế tiếp | ✅ PASS |
| 9 | `handcuff-neighbor` | Còng Số 8 Bất Ngờ | `when_neighbor` | Đối thủ lân cận | Mở modal chọn đối thủ cùng ô / cạnh 1 ô; tống ngay đối thủ vào tù (ô 10) | ✅ PASS |
| 10 | `push-neighbor-1` | Đẩy Lùi Đối Thủ (+1 Bước) | `when_neighbor` | Đối thủ lân cận | Mở modal chọn đối thủ; ép đối thủ tiến thêm 1 bước; Đã loại bỏ khỏi pool AI | ✅ PASS |
| 11 | `push-neighbor-2` | Đẩy Lùi Đối Thủ (+2 Bước) | `when_neighbor` | Đối thủ lân cận | Ép đối thủ tiến thêm 2 bước; Đã loại bỏ khỏi pool AI | ✅ PASS |
| 12 | `push-neighbor-3` | Đẩy Lùi Đối Thủ (+3 Bước) | `when_neighbor` | Đối thủ lân cận | Ép đối thủ tiến thêm 3 bước; Đã loại bỏ khỏi pool AI | ✅ PASS |
| 13 | `destroy-house-next` | Lệnh Phá Sập Công Trình | `manual_anytime` | Ô đất đối thủ | Gán `pendingDestroyHousePlayerId`; dừng vào đất đối thủ phá sập 1 cấp nhà | ✅ PASS |
| 14 | `draw-both-lucky` | Kép Vận Song Hành | `manual_anytime` | Bản thân | Bốc đồng thời 1 lá Cơ Hội + 1 lá Khí Vận; miễn trừ mọi thẻ phạt tiền | ✅ PASS |
| 15 | `direct-jail-warrant` | Trát Bắt Trực Tiếp | `manual_anytime` | Người bất kỳ | Mở modal chọn mục tiêu; tống thẳng người chơi được chọn vào tù lập tức | ✅ PASS |
| 16 | `instant-upgrade-permit` | Giấy Phép Xây Dựng Đặc Cách | `manual_anytime` | Đất sở hữu | Cho phép click vào bất kỳ ô đất nào của mình trên bàn cờ để nâng cấp từ xa | ✅ PASS |
| 17 | `auto-free-rent-opponent` | Kim Bài Miễn Phí Thuê Đất | `when_opponent_property` | Tự động | Dừng chân tại ô đất đối thủ: tự động miễn trả 100% tiền thuê đất | ✅ PASS |
| 18 | `auto-send-same-tile-to-go` | Trục Xuất Về Khởi Hành | `when_same_tile` | Tự động | Dừng chân cùng ô đối thủ: bắt đối thủ lập tức quay về Trạm Khởi Hành (ô 0) | ✅ PASS |
| 19 | `auto-free-upgrade-own` | Nâng Cấp Nhà Đất Miễn Phí | `when_own_property` | Tự động | Dừng chân tại ô đất của mình: tự động nâng cấp 1 cấp nhà miễn phí (0đ) | ✅ PASS |
| 20 | `station-tourist-toll-richest` | Tài Trợ Du Lịch Sân Bay | `when_visit_station` | Tự động | Dừng chân tại Bến Xe/Sân Bay: người giàu nhất phòng phải trả 200đ du lịch | ✅ PASS |
| 21 | `instant-destroy-richest-house` | Triệt Hạ BĐS Đại Gia | `instant_on_buy` | Tự động khi mua | Mua xong tự động phá sập 1 cấp nhà cao nhất của người giàu nhất phòng | ✅ PASS |
| 22 | `poorest-relief-bonus-300` | Trợ Cấp Cứu Trợ Hộ Nghèo | `instant_on_buy` | Tự động khi mua | Nếu là người ít tiền nhất phòng, tự động được cộng ngay 300đ trợ cấp | ✅ PASS |
| 23 | `instant-jail-adjacent-turns` | Lệnh Tống Giam Liền Kề | `instant_on_buy` | Tự động khi mua | Mua xong lập tức tống giam người có lượt trước và lượt sau vào tù | ✅ PASS |
| 24 | `instant-tax-adjacent-turns` | Thu Phí Lượt Trước & Sau | `instant_on_buy` | Tự động khi mua | Mua xong thu của người lượt trước và sau mỗi người 50đ (+100đ tổng) | ✅ PASS |
| 25 | `instant-free-tax-next` | Miễn Thuế Lượt Tiếp Theo | `instant_on_buy` | Tự động khi mua | Mua xong ngân hàng cấp chứng nhận miễn thuế lần kế tiếp | ✅ PASS |

---

## 👑 3. CHI TIẾT KIỂM THỬ NĂNG LỰC VĨNH VIỄN (PERMANENT - 4 KỸ NĂNG)

| STT | Mã ID | Tên Kỹ Năng | Điều Kiện Trigger | Kết Quả Logic Thực Tế & Lưu Ý Đã Khắc Phục | Trạng Thái |
|:---:|---|---|---|---|:---:|
| 1 | `perm-neighbor-toll` | Thu Phí Lân Cận (Vĩnh Viễn) | `when_neighbor` | Sau khi di chuyển hoặc khi có người khác dừng chân cùng ô / lân cận 1 ô, tự động thu 50đ từ mỗi người chơi lân cận (2 chiều). | ✅ PASS |
| 2 | `perm-tax-immunity` | Đặc Quyền Miễn Thuế (Vĩnh Viễn) | `when_pay_tax` | Vĩnh viễn không bao giờ phải nộp Thuế Lợi Tức và Thuế Lương Bổng khi dừng vào ô Thuế. | ✅ PASS |
| 3 | `perm-corner-fortune` | Đại Gia Tứ Góc (Vĩnh Viễn) | `when_land_corner` | Dừng chân tại bất kỳ ô nào trong 4 ô góc (0, 10, 20, 30) nhận thêm 100đ từ Ngân Hàng (với AI tự nhận tiền không treo modal). | ✅ PASS |
| 4 | `perm-station-vip` | Thẻ VIP Bến Xe (Vĩnh Viễn) | `when_visit_station` | Giảm giá 50% tiền mua tất cả các kỹ năng dùng 1 lần tại Bến Xe (cả trong modal hiển thị và trừ tiền thực tế). | ✅ PASS |

---

## 🕵️‍♂️ 4. CHI TIẾT KIỂM THỬ ĐIỀU TRA VIÊN (16 NĂNG LỰC + DI CHUYỂN NGƯỢC CHIỀU)

| STT | Mã ID | Tên Kỹ Năng | Điều Kiện Kích Hoạt | Kết Quả Logic & Khắc Phục | Trạng Thái |
|:---:|---|---|---|---|:---:|
| 1 | `inv_compensate_neighbor` | Bồi Thường Oan Sai (+100đ) | Cùng ô / lân cận 1 ô | Tặng 100đ cho mọi người chơi đứng cùng ô hoặc cạnh 1 ô | ✅ PASS |
| 2 | `inv_extort_bribe` | Thu Tiền Hối Lộ (-100đ) | Cùng ô / lân cận 1 ô | Thu 100đ tiền phạt hối lộ từ mọi người chơi đứng cùng ô hoặc cạnh 1 ô | ✅ PASS |
| 3 | `inv_jail_same_tile` | Bắt Giữ Khẩn Cấp | Đứng cùng ô | Tống toàn bộ người chơi đứng cùng ô vào tù ngay lập tức | ✅ PASS |
| 4 | `inv_robin_hood` | Lấy Của Giàu Chia Cho Nghèo | Đứng cùng ô người giàu/nghèo | Thu 200đ người giàu nhất phòng chia lại cho người nghèo nhất | ✅ PASS |
| 5 | `inv_demolish_houses` | Cưỡng Chế Phá Dỡ Sai Phạm | Ô đất có > 2 nhà | Cưỡng chế phá sập 1 cấp nhà (hoặc hạ khách sạn 5 xuống 4 nhà) | ✅ PASS |
| 6 | `inv_audit_reward` | Thanh Tra Khen Thưởng (+50đ) | Ô đất có chủ | Thưởng 50đ cho chủ đất vì quy hoạch chuẩn mực | ✅ PASS |
| 7 | `inv_audit_fine` | Thanh Tra Xử Phạt (-50đ) | Ô đất có chủ | Phạt trừ 50đ chủ đất vì vi phạm trật tự xây dựng | ✅ PASS |
| 8 | `inv_tax_or_corner` | Thu Thuế & Phúc Lợi Tứ Góc | Ô Thuế hoặc 4 Ô Góc | Ô Thuế: Thu toàn dân 100đ; Ô Góc: Tặng toàn dân 50đ | ✅ PASS |
| 9 | `inv_jail_master` | Đại Án Tư Pháp | Ô Bị Bắt (30) / Ô Thăm Tù (10) | Ô 30: Bắt người giàu nhất; Ô 10: Phóng thích tự do toàn bộ tù nhân | ✅ PASS |
| 10 | `inv_draw_cards_all` | Biến Cố Khí Vận Toàn Dân | Ô Cơ Hội / Khí Vận | Lần lượt tất cả người chơi đều bốc bài, xử lý toàn diện các effect | ✅ PASS |
| 11 | `inv_allow_house_upgrade` | Cấp Phép Quy Hoạch | Đứng cùng ô người chơi | Cho phép nâng cấp tự do 1 nhà trên các ô đất sở hữu (trả đủ tiền) | ✅ PASS |
| 12 | `inv_redistribute_land_poorest` | Tái Điều Tiết Đất Đai | Đứng cùng ô người nhiều/ít đất | Người ít đất mua lô đất rẻ nhất của người nhiều đất (nhà phá về đất trống) | ✅ PASS |
| 13 | `inv_buy_vacant_or_double_sell` | Đặc Quyền Giao Dịch Đất | Đứng cùng ô người chơi | Cho phép mua đất trống bất kỳ giá gốc, hoặc bán đất cho Bank giá GẤP ĐÔI | ✅ PASS |
| 14 | `inv_grant_or_swap_permanent` | Đặc Xá VIP (Năng Lực Vĩnh Viễn) | Cùng ô / lân cận 1 ô | Chưa có: Tặng miễn phí 1 thẻ VIP; Đã có: Đổi sang thẻ VIP khác miễn phí (tối đa 1 thẻ) | ✅ PASS |
| 15 | `inv_double_rent_round` | Thị Trường Sôi Động (Giá Thuê x2) | Bất kỳ ô dừng chân | Toàn bộ giá thuê đất trên bàn cờ tăng gấp đôi (x2) trong suốt vòng chơi này | ✅ PASS |
| 16 | `inv_half_rent_round` | Trợ Giá Khủng Hoảng (Giá Thuê ½) | Bất kỳ ô dừng chân | Toàn bộ giá thuê đất trên bàn cờ giảm 50% (còn ½) trong suốt vòng chơi này | ✅ PASS |
| 17 | `inv_move_counter_clockwise` | Tuần Tra Ngược Chiều | Mỗi bước di chuyển | `(pos - 1 + 40) % 40`: Đi ngược vòng từ 0 -> 39 -> 38... Về 0 hoàn thành 1 vòng tuần tra | ✅ PASS |
| 18 | `inv_random_initial_ability` | Random Năng Lực Ban Đầu | Lần đầu xuất hiện | Không còn bị gán cứng tặng 100đ, random ngẫu nhiên trong 16 năng lực | ✅ PASS |

---

## 🎯 5. QUY CHẾ THẺ BÀI "ĐI THẲNG VỀ TRẠM KHỞI HÀNH" (cs-10, ch-1)

- **Quy tắc chuẩn hóa theo yêu cầu người dùng:**
  - Cả 2 thẻ: Thẻ Khí Vận `cs-10` ("Đi Thẳng Về Trạm Khởi Hành") và Thẻ Cơ Hội `ch-1` ("Tiến Về Trạm Khởi Hành") được cấu hình **KHÔNG NHẬN THƯỞNG KHỞI HÀNH**.
  - **Cập nhật nội dung hiển thị chuẩn xác:**
    - `cs-10`: `"Trở về điểm xuất phát ngay lập tức (không nhận thưởng khởi hành)."`
    - `ch-1`: `"Trở về điểm xuất phát ngay lập tức (không nhận thưởng khởi hành)."`
  - **Xử lý logic thực thi (`useCardActions.ts` & `investigatorSpecialAbilities.ts`):**
    - Kiểm tra `isNoGoBonusCard = card.id === 'cs-10' || card.id === 'ch-1' || card.description?.includes('không nhận thưởng')`.
    - Khi bốc trúng các thẻ này, quân cờ lập tức di chuyển về ô Khởi Hành (ô 0), không cộng tiền thưởng và xuất log thông báo: `🏁 [<Tiêu đề thẻ>] <Tên người chơi> quay về Trạm Khởi Hành (không nhận thưởng khởi hành theo quy định thẻ bài).`
    - Các thẻ di chuyển khác vượt qua Khởi Hành (`move_to` với `targetPos < oldPos` hoặc `move_relative` vượt 40 ô) vẫn được nhận thưởng đi qua theo quy định.

---

## 📥 6. TÍNH NĂNG XUẤT NHẬT KÝ VÁN ĐẤU (DEBUG LOG EXPORT)

- **Tiện ích:** Tạo module `gameLogExporter.ts` cung cấp 3 phương thức xuất:
  1. **Tải file JSON (.json):** Xuất toàn bộ dữ liệu máy tính có cấu trúc (phiên bản, vòng đấu, danh sách người chơi, tài sản, tiền mặt, tù đày, năng lực, trạng thái Điều Tra Viên, toàn bộ mảng log).
  2. **Tải file Văn bản (.txt):** Xuất tài liệu tóm tắt rõ ràng, trực quan, dễ đọc.
  3. **Sao chép vào Clipboard (Copy):** Một chạm sao chép toàn bộ nhật ký để dán trực tiếp vào prompt chat gửi kỹ sư.
- **Vị trí nút bấm trên giao diện:** Nút `📥 Xuất Log` được tích hợp ngay tại thanh tiêu đề của khung "Nhật Ký Bàn Cờ" (cả trên panel cố định màn hình chính lẫn drawer trượt trên thiết bị di động).

---

## 🚀 7. HƯỚNG DẪN TEST DÀNH CHO NGƯỜI KIỂM THỬ TIẾP THEO

### Chạy test tự động bằng Script
```bash
npx tsx scripts/test_abilities_logic.ts
```
Toàn bộ 62 assertions sẽ chạy và xuất log chi tiết ra terminal trong vòng 2 giây.
