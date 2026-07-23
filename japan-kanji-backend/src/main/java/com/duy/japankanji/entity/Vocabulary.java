package com.duy.japankanji.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "vocabulary")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Vocabulary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String kanji; // ví dụ: 勉強

    @Column(name = "onyomi")
    private String onyomi; // Âm On (Katakana)

    @Column(name = "kunyomi")
    private String kunyomi; // Âm Kun (Hiragana)

    @Column(name = "han_viet")
    private String hanViet; // Âm Hán Việt: Miễn cưỡng / Học tập

    @Column(nullable = false)
    private String meaning; // Nghĩa tiếng Việt: học tập, sự học

    @Column(name = "jlpt_level", nullable = false)
    private String jlptLevel; // N5, N4, N3, N2, N1

    @Column(name = "word_type")
    private String wordType; // Loại từ: danh từ, động từ, tính từ...
}