package com.duy.japankanji.service;

import com.duy.japankanji.entity.ReviewProgress;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class Sm2ServiceTest {

    private Sm2Service sm2Service;

    @BeforeEach
    void setUp() {
        // Chạy trước MỖI test — tạo instance mới, đảm bảo các test không ảnh hưởng lẫn nhau
        sm2Service = new Sm2Service();
    }

    @Test
    void tuMoi_TraLoiGood_LanDauTien_IntervalPhaiLa1Ngay() {
        // Arrange: tạo 1 ReviewProgress giả lập từ hoàn toàn mới
        ReviewProgress progress = new ReviewProgress();
        progress.setEaseFactor(2.5);
        progress.setRepetitions(0);
        progress.setIntervalDays(0);

        // Act: giả lập user bấm "Good" (quality = 4)
        sm2Service.updateProgress(progress, 4);

        // Assert: kiểm tra kết quả đúng như thuật toán SM-2 quy định
        assertEquals(1, progress.getRepetitions());
        assertEquals(1, progress.getIntervalDays());
        assertEquals(LocalDate.now().plusDays(1), progress.getNextReviewDate());
    }

    @Test
    void traLoiGoodLienTiep_LanThu2_IntervalPhaiLa6Ngay() {
        ReviewProgress progress = new ReviewProgress();
        progress.setEaseFactor(2.5);
        progress.setRepetitions(0);
        progress.setIntervalDays(0);

        sm2Service.updateProgress(progress, 4); // lần 1 -> interval = 1
        sm2Service.updateProgress(progress, 4); // lần 2 -> interval = 6

        assertEquals(2, progress.getRepetitions());
        assertEquals(6, progress.getIntervalDays());
    }

    @Test
    void traLoiGoodLienTiep_LanThu3_IntervalTangTheoEaseFactor() {
        ReviewProgress progress = new ReviewProgress();
        progress.setEaseFactor(2.5);
        progress.setRepetitions(0);
        progress.setIntervalDays(0);

        sm2Service.updateProgress(progress, 4); // interval = 1
        sm2Service.updateProgress(progress, 4); // interval = 6
        sm2Service.updateProgress(progress, 4); // interval = round(6 * easeFactor mới)

        assertEquals(3, progress.getRepetitions());
        assertTrue(progress.getIntervalDays() > 6,
                "Interval lần 3 phải lớn hơn lần 2 (spaced repetition phải giãn dần)");
    }

    @Test
    void traLoiAgain_PhaiResetVeDauVaOnLaiNgayMai() {
        ReviewProgress progress = new ReviewProgress();
        progress.setEaseFactor(2.5);
        progress.setRepetitions(3); // giả sử đã ôn đúng 3 lần liên tiếp trước đó
        progress.setIntervalDays(15);

        sm2Service.updateProgress(progress, 0); // user bấm "Again" -> quên hoàn toàn

        assertEquals(0, progress.getRepetitions(), "Repetitions phải reset về 0");
        assertEquals(1, progress.getIntervalDays(), "Phải ôn lại ngay ngày mai");
        assertEquals(LocalDate.now().plusDays(1), progress.getNextReviewDate());
    }

    @Test
    void easeFactor_KhongDuocThapHonNguong1_3() {
        ReviewProgress progress = new ReviewProgress();
        progress.setEaseFactor(1.3); // đã ở mức sàn thấp nhất
        progress.setRepetitions(0);
        progress.setIntervalDays(0);

        // Trả lời "Again" nhiều lần liên tiếp -> easeFactor sẽ bị kéo giảm liên tục
        for (int i = 0; i < 5; i++) {
            sm2Service.updateProgress(progress, 0);
        }

        assertTrue(progress.getEaseFactor() >= 1.3,
                "Ease factor không được phép thấp hơn ngưỡng tối thiểu 1.3");
    }

    @Test
    void traLoiEasy_EaseFactorPhaiTangSoVoiTraLoiGood() {
        ReviewProgress progressGood = new ReviewProgress();
        progressGood.setEaseFactor(2.5);
        progressGood.setRepetitions(0);
        progressGood.setIntervalDays(0);
        sm2Service.updateProgress(progressGood, 4); // Good

        ReviewProgress progressEasy = new ReviewProgress();
        progressEasy.setEaseFactor(2.5);
        progressEasy.setRepetitions(0);
        progressEasy.setIntervalDays(0);
        sm2Service.updateProgress(progressEasy, 5); // Easy

        assertTrue(progressEasy.getEaseFactor() > progressGood.getEaseFactor(),
                "Trả lời Easy phải làm ease factor tăng nhiều hơn Good");
    }

    @Test
    void quality_NgoaiKhoang0Den5_PhaiNemLoi() {
        ReviewProgress progress = new ReviewProgress();
        progress.setEaseFactor(2.5);
        progress.setRepetitions(0);
        progress.setIntervalDays(0);

        org.junit.jupiter.api.Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> sm2Service.updateProgress(progress, 6)
        );
    }
}