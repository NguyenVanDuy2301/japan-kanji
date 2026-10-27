# Nhật ký thay đổi (Changelog)

Tất cả những thay đổi, cập nhật quan trọng của dự án sẽ được ghi lại tại đây.

## [Giai đoạn 2: Màn Hình Học Tập (Lessons & Reviews)]

### Đã làm (Completed)
- **Cập nhật & Tối ưu hóa Agent Skills**:
  - Cập nhật toàn bộ các bộ kỹ năng (skills) từ `mattpocock/skills` và `hallmark` lên phiên bản mới nhất.
  - Tải và đồng bộ hóa phiên bản v2.0 của bộ công cụ thiết kế giao diện `ui-ux-pro-max-skill` trong thư mục frontend (`banner-design`, `brand`, `design`, `design-system`, `slides`, `ui-styling`, `ui-ux-pro-max`).
  - Gỡ bỏ 9 kỹ năng đã ngưng hỗ trợ / bị xóa khỏi repo upstream (`batch-grill-me`, `design-an-interface`, `edit-article`, `obsidian-vault`, `qa`, `request-refactor-plan`, `resolving-merge-conflicts`, `ubiquitous-language`, `writing-great-skills`).
  - Chuyển hướng và cài đặt lại 2 kỹ năng đã thay đổi đường dẫn repo upstream (`to-questionnaire`, `wizard`).
- **Tạo dữ liệu mẫu (Data Seeding)**: Hoàn thiện `DataSeeder.java`, tự động tạo bộ bài "JLPT N5 Core" cùng các từ vựng N5 cơ bản (Onyomi, Kunyomi, Hán Việt, Nghĩa) và các tài khoản mẫu (admin, user).
- **Backend API Học & Ôn tập**: Cấu hình thuật toán Spaced Repetition (SM-2) trong `StudyService.java`. Xây dựng các API trả về từ mới (`/lessons`), từ ôn tập (`/reviews`), chế độ luyện tập (`/practice`), và chấm điểm (`/submit-review`).
- **Giao diện Học từ mới (Lesson Session)**: Xây dựng màn hình lật thẻ (Flip Card) 3D mượt mà. Đơn giản hóa UX bằng cách gộp thành một nút "Vào Học" duy nhất trên trang chủ: Hệ thống sẽ tự động bắt đầu bài học mới nếu có từ chưa thuộc, hoặc tự động chuyển sang "Chế độ Luyện Tập" nếu người dùng đã học hết từ mới, giúp trải nghiệm liền mạch không bị gián đoạn.
- **Giao diện Ôn tập (Review Session)**: Hoàn thiện chế độ **Hybrid (Flashcard + Gõ phím)** kết hợp thuật toán SM-2. Hỗ trợ luật "Quá tam ba bận" (sai 3 lần tự lật đáp án) kèm hiệu ứng rung lắc (shake) và tự động focus. Tích hợp điểm chất lượng (Quality 0-5) truyền thẳng xuống Backend để tính toán lịch ôn tập.
- **Trải nghiệm người dùng (UI/UX - Hiệu năng)**:
  - Cập nhật đồng bộ các màn hình chính (Dashboard, Kanji Dictionary, Deck Manager, Lessons, Reviews) sang hiệu ứng **Skeleton Loading**, giảm thiểu tình trạng Layout Shift (giật cục) lúc tải dữ liệu.
  - Tối ưu hóa cách hiển thị phiên âm Kanji (lọc bỏ các ký tự thừa, tinh giản giao diện tag).
  - Ra mắt tính năng **Bảng Vẽ Cảm Ứng (Handwriting Pad)** tích hợp API Google Input Tools, hỗ trợ tra cứu chữ Hán theo nét vẽ với cấu trúc code chuẩn chỉnh (tách biệt Data Fetching ra khỏi UI Component thông qua `handwriting.service.ts`).
- **Việt hóa (Localization)**: Dịch 100% tiếng Anh sang tiếng Việt tại các trang Login, Signup, Dashboard, LessonSession, ReviewSession.
- **Khu vực Ôn tập trên Dashboard**: Thêm banner báo số lượng từ "Đã đến hạn ôn tập hôm nay" ngay trên cùng trang chủ, kèm nút "Bắt Đầu Ôn Tập" để vào thẳng tính năng Review.
- **Tạo và Quản lý Bộ bài Cá nhân (Phase 3)**:
  - Cho phép người dùng tạo Bộ bài cá nhân (Custom Deck) trên Dashboard.
  - Xây dựng giao diện Quản lý Bộ bài (Deck Manager) với 2 cột: liệt kê từ vựng đang có và ô tìm kiếm kho từ vựng chung.
  - Áp dụng cơ chế chia sẻ Unlisted (Copy Share Link): bộ bài cá nhân không công khai trên hệ thống, nhưng bất kỳ ai nhận được link đều có thể học ké.

- **Tủ sách cá nhân (Phase 4)**:
  - Bổ sung quan hệ `user_saved_decks` cho phép user lưu/bookmark bộ bài của người khác.
  - Thêm nút Bookmark góc phải tại trang Học bài (LessonSession).
  - Tự động hiển thị khu vực "Tủ Sách" trên Dashboard khi có bộ bài được lưu.

- **Tái cấu trúc kiến trúc (Refactoring)**:
  - **Frontend**: Trích xuất `DeckCard` (Layout Component) và `Flashcard` (Dumb Component). Làm mỏng các trang `Dashboard` và `LessonSession`.
  - **Backend**: Tách `UserLibraryService` từ `DeckService`. Phân định rõ trách nhiệm giữa Quản lý Bộ bài (Deck) và Tủ sách của Người dùng (Saved Decks).

- **Tính năng tra cứu (Kanji Dictionary)**:
  - **Backend**: Tạo mới Entity `Kanji` độc lập với `Vocabulary`. Xây dựng tính năng tìm kiếm (Unified Search) theo chữ Hán, Romaji và Âm Hán Việt. Lấy danh sách ví dụ từ vựng động bằng `LIKE`. Viết thêm Seeder sinh tự động 10 chữ Kanji mẫu.
  - **Frontend**: Tạo trang `/kanji` riêng biệt. Xây dựng giao diện tìm kiếm dạng lưới (Grid) và hiển thị chi tiết (Modal) với đầy đủ thông tin. Áp dụng cơ chế **Cuộn vô hạn (Infinite Scroll)** kết hợp **Ảo hóa (Virtualization)** qua `react-virtuoso` thay vì phân trang cũ, mang lại trải nghiệm tra cứu mượt mà tuyệt đối khi lướt xem danh sách lớn. Tách component `Navbar` dùng chung.

- **Quản trị Hán tự (Admin Kanji Manager)**:
  - Bổ sung màn hình Quản lý Hán tự riêng dành cho Admin (truy cập qua Navbar khi đăng nhập tài khoản có role ADMIN).
  - Tích hợp thêm thuộc tính `strokeCount` (số nét) vào toàn bộ quy trình tạo, sửa, xóa từ vựng (Frontend & Backend).
  - Backend tự động đồng bộ (sync) các từ vựng 1 ký tự sang bảng `kanji` độc lập khi Admin thêm mới/sửa chữa.
  - Sửa lỗi Spring Security chặn mã 500 (trả về 403) và khắc phục xung đột constructor giúp Kanji Dictionary hoạt động ổn định.

- **Gamification & Hệ thống huy hiệu (Badges)**:
  - **Backend**: Cấu hình `BadgeEventListener` để lắng nghe sự kiện người dùng học xong từ vựng mới (`VocabularyLearnedEvent`). Tính toán phần trăm tiến độ và cấp phát Huy hiệu (Starter, Halfway, Master) cho từng cấp độ JLPT từ N5-N1.
  - **Frontend**: Xây dựng component `BadgeShowcase.tsx` ngay trên đầu Dashboard với giao diện bắt mắt, có hiệu ứng chuyển động, đánh bóng kim loại cho từng loại huy hiệu. Tinh chỉnh Layout Dashboard thành cấu trúc ngang thẳng hàng hoàn hảo.

- **Hiệu ứng vẽ Kanji (Stroke Animation)**:
  - Tích hợp tính năng tự động vẽ nét chữ Hán trên lưới chữ thập khi tra từ điển.
  - Sử dụng chiến lược *Zero Storage*: tự động dịch mã Unicode và tải động file SVG từ CDN KanjiVG, không làm phình dung lượng app. Cấu hình CSS Animation mượt mà và hỗ trợ xem lại (Replay).

- **Sửa lỗi định tuyến (Routing Fix)**:
  - Bổ sung `GuestRoute` bên Frontend để bảo vệ trang Login/Signup, điều hướng tự động người dùng đã đăng nhập về Dashboard.

- **Sửa lỗi dữ liệu tạo mẫu (Data Seeder Fix)**:
  - Khắc phục lỗi `DataSeeder` nhồi dữ liệu chứa nhiều cách đọc ngăn cách bằng dấu phẩy (vd: `かね, かな-, -がね`) vào cột `kunyomi` và `onyomi`. 
  - Bổ sung logic tự động trích xuất và ưu tiên cách đọc hợp lệ đầu tiên (loại bỏ các cách đọc chứa dấu gạch ngang), giúp màn hình Flashcard Frontend xác thực câu trả lời chính xác và thân thiện hơn.
- **Bảo mật & Trải nghiệm (Security & UX)**:
  - Bổ sung kiểm tra độ khó của mật khẩu (Regex) khi đăng ký ở cả Frontend và Backend (tối thiểu 8 ký tự, có cả chữ và số).
  - Khắc phục lỗi hiển thị thông báo lỗi (Error parsing) bên Frontend, giúp render đúng thông báo lỗi validation trả về từ Spring Boot (GlobalExceptionHandler).
  - Sửa regex mật khẩu (cả Frontend và Backend) không còn giới hạn bộ ký tự được phép: chỉ yêu cầu tối thiểu 8 ký tự, có cả chữ và số, nên mật khẩu chứa `_`, `-`, `.` hoặc dấu cách không còn bị từ chối nhầm. Thêm `RegisterRequestValidationTest` để kiểm tra quy tắc này.
- **Sửa lỗi Linter & Chuẩn hóa Controller (Bugfix & Refactor)**:
  - Sửa lỗi React Rules of Hooks (`useEffect` bị gọi sau lệnh return điều kiện) trong component `PrototypeSwitcher.tsx`.
  - Chuẩn hóa toàn bộ Backend (Controller, Service, Event Listener, DataSeeder) sang constructor injection tường minh, không còn dùng `@RequiredArgsConstructor` của Lombok, để IDE không báo lỗi giả khi xử lý Lombok. Hành vi không đổi.
  - Gỡ `@AllArgsConstructor` khỏi các entity (`Deck`, `User`, `Kanji`, `ReviewProgress`, `UserBadge`, `Vocabulary`) vì constructor này không cần thiết (JPA chỉ cần `@NoArgsConstructor`). `DataSeeder` và `VocabularyServiceTest` chuyển sang khởi tạo bằng setter. Việc này giúp IDE hết báo lỗi giả "Flexible Constructor Bodies / early construction context" (Language Server xử lý Lombok khác với Maven).

### Không nằm trong phạm vi (Out of Scope)
- **Bảng xếp hạng (Leaderboard)**: Tính năng cạnh tranh giữa người dùng. Được đánh giá là không cần thiết ở giai đoạn hiện tại và tạm thời loại khỏi phạm vi dự án.
