# 📋 NHẬT KÝ KIỂM THỬ VÀ TỐI ƯU TOÀN DIỆN LOGIC GAME CỜ TỶ PHÚ
**Phiên bản kiểm thử**: `v1.3.0` -> `v1.4.0`  
**Cập nhật lần cuối**: 2026-11-07  
**Mục đích**: Ghi nhận chi tiết từng hạng mục logic đã kiểm thử, các lỗi phát hiện, nguyên nhân cốt lõi và giải pháp đã thực hiện để người sau dễ dàng theo dõi và tiếp tục kiểm thử.

---

## 📑 MỤC LỤC HẠNG MỤC KIỂM THỬ
- [x] **Hạng mục 1**: Khởi tạo ván cờ, Lưu/nạp cấu hình mặc định (Settings & Full Package)
- [ ] **Hạng mục 2**: Bộ điều khiển tung xúc xắc & Xúc xắc 3D, Phím tắt Space/Enter, Xúc xắc đôi
- [ ] **Hạng mục 3**: Cơ chế di chuyển từng bước & Điểm thưởng Trạm Khởi Hành (Go bonus)
- [ ] **Hạng mục 4**: Quy chế Tù & Công An Điều Tra (Investigation Mode vs Normal Jail, Thẻ ra tù tự động)
- [ ] **Hạng mục 5**: Bất động sản, Bến xe, Điện lực, Nước, Tiền thuê & Bội số, Nâng cấp nhà
- [ ] **Hạng mục 6**: Thẻ Cơ Hội & Khí Vận (Rút thẻ, chuyển tiền, dịch chuyển, quản lý số lượng)
- [ ] **Hạng mục 7**: Hệ thống Năng Lực (Dùng 1 lần & Vĩnh viễn VIP, Quy tắc tối đa 1 năng lực vĩnh viễn)
- [ ] **Hạng mục 8**: Điều Tra Viên Đặc Biệt (Tuần tra, 14 kỹ năng, không bị kẹt lượt)
- [ ] **Hạng mục 9**: Phá sản (Bankrupt) & Điều kiện Thắng cuộc (Game Over & Winner)
- [ ] **Hạng mục 10**: Bảng điều khiển Cheat & Kiểm thử (Gán đất, đổi tiền, teleport, xúc xắc)

---

## 🔍 CHI TIẾT TỪNG HẠNG MỤC ĐÃ TEST VÀ DANH SÁCH LỖI / FIX

### HẠNG MỤC 1: Khởi tạo ván cờ & Quản lý Cấu hình Mặc định (Full Package)
- **Trạng thái**: [ĐÃ TEST & ĐẠT]
- **Kiểm tra**:
  - `saveFullConfigAsUserDefault`, `loadFullConfigUserDefault`, `clearFullConfigUserDefault` trong `abilitiesDb.ts`.
  - Cập nhật đồng bộ giữa các key `co_ty_phu_user_default_full_config_v3`, `co_ty_phu_user_default_settings_v3`, `co_ty_phu_settings_cache_v3`.
  - Xuất / Nhập JSON toàn bộ (Full Package: settings, chance, chest, consumables, permanents) và xuất riêng settings.
- **Ghi chú**: Hoạt động mượt mà, lưu trữ localStorage đồng bộ.
