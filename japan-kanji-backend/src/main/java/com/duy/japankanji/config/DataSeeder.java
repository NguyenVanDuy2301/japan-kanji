package com.duy.japankanji.config;

import com.duy.japankanji.entity.Deck;
import com.duy.japankanji.entity.User;
import com.duy.japankanji.entity.Vocabulary;
import com.duy.japankanji.repository.DeckRepository;
import com.duy.japankanji.repository.UserRepository;
import com.duy.japankanji.repository.VocabularyRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.io.InputStream;
import java.util.stream.Collectors;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.duy.japankanji.entity.Kanji;
import com.duy.japankanji.repository.KanjiRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final VocabularyRepository vocabularyRepository;
    private final DeckRepository deckRepository;
    private final PasswordEncoder passwordEncoder;
    private final KanjiRepository kanjiRepository;

    public DataSeeder(
            UserRepository userRepository,
            VocabularyRepository vocabularyRepository,
            DeckRepository deckRepository,
            PasswordEncoder passwordEncoder,
            KanjiRepository kanjiRepository
    ) {
        this.userRepository = userRepository;
        this.vocabularyRepository = vocabularyRepository;
        this.deckRepository = deckRepository;
        this.passwordEncoder = passwordEncoder;
        this.kanjiRepository = kanjiRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedUsers();
        seedVocabulariesAndDecks();
        seedKanjis();
    }

    private void seedUsers() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@japankanji.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ADMIN");
            userRepository.save(admin);
        }

        if (!userRepository.existsByUsername("user1")) {
            User user1 = new User();
            user1.setUsername("user1");
            user1.setEmail("user1@japankanji.com");
            user1.setPassword(passwordEncoder.encode("user123"));
            user1.setRole("USER");
            userRepository.save(user1);
        }

        if (!userRepository.existsByUsername("user2")) {
            User user2 = new User();
            user2.setUsername("user2");
            user2.setEmail("user2@japankanji.com");
            user2.setPassword(passwordEncoder.encode("user123"));
            user2.setRole("USER");
            userRepository.save(user2);
        }
    }

    private void seedVocabulariesAndDecks() {
        if (!deckRepository.findByIsOfficialTrue().isEmpty()) {
            return;
        }

        User admin = userRepository.findByUsername("admin").orElseThrow();

        // Đọc dữ liệu từ file JSON để làm Vocabulary
        List<Vocabulary> vocabularies;
        try (InputStream is = getClass().getResourceAsStream("/kanji-seed.json")) {
            if (is != null) {
                ObjectMapper objectMapper = new ObjectMapper();
                List<Kanji> kanjis = objectMapper.readValue(is, new TypeReference<List<Kanji>>() {
                });
                vocabularies = kanjis.stream().map(k -> {
                    String extractedReading = extractVocabularyReading(k.getOnyomi(), k.getKunyomi());
                    boolean fromOnyomi = k.getOnyomi() != null && k.getOnyomi().contains(extractedReading != null ? extractedReading : "");
                    boolean fromKunyomi = k.getKunyomi() != null && k.getKunyomi().contains(extractedReading != null ? extractedReading : "");
                    
                    String onyomi = (fromOnyomi && !fromKunyomi) ? extractedReading : null;
                    String kunyomi = fromKunyomi ? extractedReading : null;

                    Vocabulary vocabulary = new Vocabulary();
                    vocabulary.setKanji(k.getCharacter());
                    vocabulary.setOnyomi(onyomi);
                    vocabulary.setKunyomi(kunyomi);
                    vocabulary.setHanViet(k.getHanViet());
                    vocabulary.setMeaning(k.getMeaning());
                    vocabulary.setJlptLevel(k.getJlptLevel());
                    vocabulary.setWordType("noun");
                    vocabulary.setStrokeCount(k.getStrokeCount());
                    return vocabulary;
                }).collect(Collectors.toList());
            } else {
                throw new RuntimeException("Could not find kanji-seed.json");
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to seed vocabularies", e);
        }

        List<Vocabulary> savedVocabularies = vocabularyRepository.saveAll(vocabularies);

        if (deckRepository.findByIsOfficialTrue().isEmpty()) {
            Deck n5Core = new Deck();
            n5Core.setTitle("JLPT N5 Core Kanji");
            n5Core.setDescription("Bộ Kanji cơ bản nhất dành cho người mới bắt đầu học tiếng Nhật.");
            n5Core.setIsOfficial(true);
            n5Core.setAuthor(admin);
            n5Core.setVocabularies(new HashSet<>(savedVocabularies));
            deckRepository.save(n5Core);
        }
    }

    private void seedKanjis() {
        if (kanjiRepository.count() > 0) {
            return; // Đã có dữ liệu
        }

        try (InputStream is = getClass().getResourceAsStream("/kanji-seed.json")) {
            if (is != null) {
                ObjectMapper objectMapper = new ObjectMapper();
                List<Kanji> kanjis = objectMapper.readValue(is, new TypeReference<List<Kanji>>() {
                });
                kanjiRepository.saveAll(kanjis);
                System.out.println("Seeded " + kanjis.size() + " Kanjis from kanji-seed.json");
            } else {
                System.out.println("Could not find kanji-seed.json");
            }
        } catch (Exception e) {
            System.err.println("Failed to seed Kanjis: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String extractVocabularyReading(String onyomi, String kunyomi) {
        if (kunyomi != null && !kunyomi.trim().isEmpty()) {
            String[] parts = kunyomi.split(",");
            for (String part : parts) {
                part = part.trim();
                if (!part.isEmpty() && !part.contains("-")) {
                    return part;
                }
            }
        }
        
        if (onyomi != null && !onyomi.trim().isEmpty()) {
            String[] parts = onyomi.split(",");
            for (String part : parts) {
                part = part.trim();
                if (!part.isEmpty()) {
                    return part;
                }
            }
        }
        
        return "";
    }
}
