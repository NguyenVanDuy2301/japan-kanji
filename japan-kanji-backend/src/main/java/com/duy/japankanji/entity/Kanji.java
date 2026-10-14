package com.duy.japankanji.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "kanji")
@Getter
@Setter
@NoArgsConstructor
public class Kanji {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String character;

    @Column(name = "onyomi")
    private String onyomi;

    @Column(name = "kunyomi")
    private String kunyomi;

    @Column(name = "han_viet")
    private String hanViet;

    @Column(name = "meaning")
    private String meaning;

    @Column(name = "stroke_count")
    private Integer strokeCount;

    @Column(name = "radical")
    private String radical;

    @Column(name = "jlpt_level")
    private String jlptLevel;
}
