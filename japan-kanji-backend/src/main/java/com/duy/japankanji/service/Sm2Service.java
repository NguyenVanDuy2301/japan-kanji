package com.duy.japankanji.service;

import com.duy.japankanji.entity.ReviewProgress;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class Sm2Service {

    private static final double MIN_EASE_FACTOR = 1.3;

    /**
     * Cập nhật tiến độ ôn tập theo thuật toán SM-2, dựa trên chất lượng câu trả lời (quality).
     *
     * @param progress bản ghi tiến độ hiện tại của user với 1 từ
     * @param quality   điểm chất lượng câu trả lời, thang 0-5
     *                  (0 = Again, 3 = Hard, 4 = Good, 5 = Easy)
     */
    public void updateProgress(ReviewProgress progress, int quality) {
        if (quality < 0 || quality > 5) {
            throw new IllegalArgumentException("Quality phải nằm trong khoảng 0-5");
        }

        double easeFactor = progress.getEaseFactor();
        int repetitions = progress.getRepetitions();
        int intervalDays = progress.getIntervalDays();

        if (quality < 3) {
            // Trả lời sai (Again) — reset về đầu, ôn lại ngay ngày mai
            repetitions = 0;
            intervalDays = 1;
        } else {
            // Trả lời đúng (Hard/Good/Easy) — tính khoảng ôn tiếp theo
            if (repetitions == 0) {
                intervalDays = 1;
            } else if (repetitions == 1) {
                intervalDays = 6;
            } else {
                intervalDays = (int) Math.round(intervalDays * easeFactor);
            }
            repetitions += 1;
        }

        // Cập nhật ease factor theo công thức SM-2 gốc
        double newEaseFactor = easeFactor
                + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (newEaseFactor < MIN_EASE_FACTOR) {
            newEaseFactor = MIN_EASE_FACTOR;
        }

        // Ghi lại kết quả vào entity
        progress.setEaseFactor(newEaseFactor);
        progress.setRepetitions(repetitions);
        progress.setIntervalDays(intervalDays);
        progress.setNextReviewDate(LocalDate.now().plusDays(intervalDays));
        progress.setLastReviewedAt(LocalDateTime.now());
    }
}