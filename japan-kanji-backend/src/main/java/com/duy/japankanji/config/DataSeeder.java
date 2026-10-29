package com.duy.japankanji.config;

import com.duy.japankanji.entity.Deck;
import com.duy.japankanji.entity.User;
import com.duy.japankanji.entity.Vocabulary;
import com.duy.japankanji.repository.DeckRepository;
import com.duy.japankanji.repository.UserRepository;
import com.duy.japankanji.repository.VocabularyRepository;
import org.springframework.beans.factory.annotation.Value;
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

    private static final String PASSWORD_REGEX = "^(?=.*[A-Za-z])(?=.*\\d).{8,}$";

    // Thông tin admin đọc từ cấu hình (biến môi trường), không hard-code trong code nữa
    private final String adminUsername;
    private final String adminEmail;
    private final String adminPassword;
    // Chỉ tạo tài khoản demo (user1, user2) khi bật cờ này (local = true, prod = false)
    private final boolean seedDemoUsers;

    public DataSeeder(
            UserRepository userRepository,
            VocabularyRepository vocabularyRepository,
            DeckRepository deckRepository,
            PasswordEncoder passwordEncoder,
            KanjiRepository kanjiRepository,
            @Value("${app.admin.username}") String adminUsername,
            @Value("${app.admin.email}") String adminEmail,
            @Value("${app.admin.password}") String adminPassword,
            @Value("${app.seed.demo-users:false}") boolean seedDemoUsers
    ) {
        this.userRepository = userRepository;
        this.vocabularyRepository = vocabularyRepository;
        this.deckRepository = deckRepository;
        this.passwordEncoder = passwordEncoder;
        this.kanjiRepository = kanjiRepository;
        this.adminUsername = adminUsername;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.seedDemoUsers = seedDemoUsers;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedAdmin();
        if (seedDemoUsers) {
            seedDemoUsers();
        }
        seedVocabulariesAndDecks();
        seedKanjis();
    }

    private void seedAdmin() {
        if (adminPassword == null || !adminPassword.matches(PASSWORD_REGEX)) {
            throw new IllegalStateException("app.admin.password (ADMIN_PASSWORD) phải dài tối thiểu 8 ký tự, bao gồm cả chữ và số");
        }

        if (!userRepository.existsByUsername(adminUsername)) {
            User admin = new User();
            admin.setUsername(adminUsername);
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole("ADMIN");
            userRepository.save(admin);
        }
    }

    private void seedDemoUsers() {
        seedOrUpgradeDemoUser("user1", "user1@japankanji.com", "user1234");
        seedOrUpgradeDemoUser("user2", "user2@japankanji.com", "user1234");
    }

    private void seedOrUpgradeDemoUser(String username, String email, String defaultPassword) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(defaultPassword));
            user.setRole("USER");
            userRepository.save(user);
        } else if (!passwordEncoder.matches(defaultPassword, user.getPassword())) {
            user.setPassword(passwordEncoder.encode(defaultPassword));
            userRepository.save(user);
        }
    }

    private void seedVocabulariesAndDecks() {
        if (!deckRepository.findByIsOfficialTrue().isEmpty()) {
            return;
        }

        User admin = userRepository.findByUsername(adminUsername).orElseThrow();

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
