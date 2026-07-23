package com.duy.japankanji.service;

import com.duy.japankanji.dto.DeckResponse;
import com.duy.japankanji.entity.Deck;
import com.duy.japankanji.entity.User;
import com.duy.japankanji.repository.DeckRepository;
import com.duy.japankanji.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserLibraryService {

    private final UserRepository userRepository;
    private final DeckRepository deckRepository;

    @Transactional(readOnly = true)
    public List<DeckResponse> getSavedDecks(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        return user.getSavedDecks().stream()
                .map(DeckResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void saveDeck(String username, Long deckId) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        Deck deck = deckRepository.findById(deckId).orElseThrow(() -> new RuntimeException("Deck not found"));
        
        user.getSavedDecks().add(deck);
        userRepository.save(user);
    }

    @Transactional
    public void unsaveDeck(String username, Long deckId) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        Deck deck = deckRepository.findById(deckId).orElseThrow(() -> new RuntimeException("Deck not found"));
        
        user.getSavedDecks().remove(deck);
        userRepository.save(user);
    }
}
