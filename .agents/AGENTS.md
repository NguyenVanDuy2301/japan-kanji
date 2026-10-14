# Agent Rules for Japan Kanji

1. **Maintain a Changelog**: Whenever you make a significant feature change, bug fix, or architectural modification, you MUST record it in `CHANGELOG.md` at the root of the workspace.
2. **Commit Frequently**: After making major milestones, encourage the user to commit or offer to commit the code (if requested).
3. **Vietnamese Localization**: Ensure all user-facing text is translated to Vietnamese unless specified otherwise.

---

# Backend Rules (Spring Boot)

## Cấu trúc package backend (kiến trúc 3 tầng)
- **Controller**: REST endpoint, KHÔNG chứa business logic
- **DTO**: record Java cho request/response, có validation (@NotNull, @Min, @Max...)
- **Entity**: JPA entity, map trực tiếp bảng Postgres
- **Repository**: interface JpaRepository, Spring Data JPA tự sinh SQL
- **Service**: business logic, điều phối Repository + các Service khác

Nguyên tắc bắt buộc: **Controller → Service → Repository**, tầng trên chỉ gọi tầng ngay dưới qua constructor injection (KHÔNG dùng field injection `@Autowired` trên field, luôn dùng constructor).

## Auth flow
- Controller lấy user hiện tại qua `Authentication authentication` (Spring tự tiêm), gọi `authentication.getName()` để lấy username — KHÔNG bao giờ nhận `userId` qua `@RequestParam` từ client.
- Password luôn hash bằng BCrypt (`PasswordEncoder`), không bao giờ lưu plain text.

## Quy ước code
- Entity dùng Lombok `@Getter @Setter @NoArgsConstructor` để tránh viết boilerplate tay. KHÔNG dùng `@AllArgsConstructor` (JPA chỉ cần constructor rỗng, và IDE hay báo lỗi giả với constructor do Lombok sinh); tạo object bằng setter.
- Controller/Service/Component dùng constructor injection viết tay tường minh, KHÔNG dùng `@RequiredArgsConstructor` (cùng lý do IDE ở trên).
- DTO dùng Java `record`.
- Tên biến/hàm bằng tiếng Anh, comment giải thích có thể bằng tiếng Việt.
- Luôn ưu tiên constructor injection (DI) thay vì field injection.

## Lưu ý chung khi sinh code
- Đây là môi trường học tập — khi sinh code mới, giải thích ngắn gọn kèm theo, không chỉ đưa code trần trụi.
- KHÔNG tự ý đổi kiến trúc 3 tầng đã thiết lập, không tự ý thêm thư viện ngoài kế hoạch mà không hỏi trước.
- KHÔNG tự ý sửa lại cách xử lý JWT/Security đã hoàn thiện trừ khi được yêu cầu rõ ràng.
- Ưu tiên hỏi lại nếu yêu cầu không rõ ràng, thay vì tự đoán và làm sai hướng.
